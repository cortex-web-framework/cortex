import http from 'node:http';
import { createBrotliCompress, createGzip, createDeflate } from 'node:zlib';
import { Transform } from 'node:stream';

type Request = http.IncomingMessage;
type Response = http.ServerResponse;
type NextFunction = () => void;

/**
 * Compression configuration
 */
export interface CompressionConfig {
  threshold?: number;           // Minimum response size to compress (bytes)
  level?: number;              // Compression level (1-9)
  memLevel?: number;           // Memory level for compression
  chunkSize?: number;          // Chunk size for compression
  windowBits?: number;         // Window bits for deflate
  strategy?: number;           // Compression strategy
  contentTypes?: string[];     // Content types to compress
  excludeContentTypes?: string[]; // Content types to exclude
}

/**
 * Default compression configuration
 */
export const DEFAULT_COMPRESSION_CONFIG: Required<CompressionConfig> = {
  threshold: 1024,             // 1KB
  level: 6,                    // Balanced compression
  memLevel: 8,                 // Default memory level
  chunkSize: 16 * 1024,        // 16KB chunks
  windowBits: 15,              // Default window bits
  strategy: 0,                 // Default strategy
  contentTypes: [
    'text/plain',
    'text/html',
    'text/css',
    'text/javascript',
    'application/javascript',
    'application/json',
    'application/xml',
    'text/xml',
    'text/csv',
    'application/x-www-form-urlencoded'
  ],
  excludeContentTypes: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'video/mp4',
    'video/webm',
    'audio/mpeg',
    'audio/ogg',
    'application/pdf',
    'application/zip',
    'application/gzip'
  ]
};

/**
 * Parse Accept-Encoding header
 */
export function parseAcceptEncoding(acceptEncoding: string): string[] {
  if (!acceptEncoding) return [];
  
  return acceptEncoding
    .split(',')
    .map(encoding => encoding.trim().split(';')[0])
    .filter(encoding => encoding.length > 0);
}

/**
 * Select best compression method based on client support
 */
export function selectEncoding(supportedEncodings: string[]): string | null {
  // Priority order: brotli > gzip > deflate
  if (supportedEncodings.includes('br')) return 'br';
  if (supportedEncodings.includes('gzip')) return 'gzip';
  if (supportedEncodings.includes('deflate')) return 'deflate';
  return null;
}

/**
 * Check if content should be compressed
 */
export function isCompressible(contentType: string, config: CompressionConfig): boolean {
  const type = contentType.split(';')[0].toLowerCase();

  // Check excluded types first (blacklist takes priority)
  if (config.excludeContentTypes?.some(excluded =>
    type.includes(excluded.toLowerCase())
  )) {
    return false;
  }

  // If contentTypes whitelist is specified, check it
  if (config.contentTypes && config.contentTypes.length > 0) {
    if (config.contentTypes.some(included =>
      type.includes(included.toLowerCase())
    )) {
      return true;
    }
    // Also compress common text-based types even if not in whitelist
    return /^text\/|^application\/(json|xml)/.test(type);
  }

  // Default: compress text-based and JSON/XML types
  return /^text\/|^application\/(json|xml)/.test(type);
}

/**
 * Create compression transform stream
 */
function createCompressionStream(encoding: string, config: CompressionConfig): Transform {
  switch (encoding) {
    case 'br':
      return createBrotliCompress({
        params: {
          [11]: config.level ?? 6, // BROTLI_PARAM_QUALITY
        }
      });
    case 'gzip':
      return createGzip({
        level: config.level ?? 6,
        memLevel: config.memLevel ?? 8
      });
    case 'deflate':
      return createDeflate({
        level: config.level ?? 6,
        memLevel: config.memLevel ?? 8,
        windowBits: config.windowBits,
        strategy: config.strategy
      });
    default:
      throw new Error(`Unsupported encoding: ${encoding}`);
  }
}

/**
 * Main compression middleware
 */
export function compression(config: CompressionConfig = {}): (req: Request, res: Response, next: NextFunction) => void {
  const finalConfig = { ...DEFAULT_COMPRESSION_CONFIG, ...config };

  return (req: Request, res: Response, next: NextFunction): void => {
    // Support both standard Node.js req.headers and Express-style req.get()
    const acceptEncoding = ((req as any).get?.('Accept-Encoding') || (req.headers?.['accept-encoding'] as string) || '') as string;
    const supportedEncodings = parseAcceptEncoding(acceptEncoding);
    const selectedEncoding = selectEncoding(supportedEncodings);

    if (!selectedEncoding) {
      next();
      return;
    }

    // Store original methods
    const originalWrite = res.write.bind(res);
    const originalEnd = res.end.bind(res);
    const originalWriteHead = res.writeHead.bind(res);

    let shouldCompress = false;
    let compressionStream: Transform | null = null;
    let contentLength = 0;
    let chunks: Buffer[] = [];

    // Override writeHead to check content type and length
    res.writeHead = function writeHeadImpl(statusCode: number, ...args: any[]): Response {
      const contentType = res.getHeader('Content-Type') as string || '';
      const contentLengthHeader = res.getHeader('Content-Length') as string;

      if (contentLengthHeader) {
        contentLength = parseInt(contentLengthHeader, 10);
      }

      // Check if we should compress
      if (isCompressible(contentType, finalConfig) &&
          contentLength >= finalConfig.threshold) {
        shouldCompress = true;
        res.setHeader('Content-Encoding', selectedEncoding);
        res.removeHeader('Content-Length'); // Remove original content length
      }

      return originalWriteHead(statusCode, ...args);
    } as unknown as typeof res.writeHead;

    // Override write to collect chunks
    res.write = function writeImpl(chunk: any, ...args: any[]): boolean {
      if (shouldCompress && chunk) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        return true;
      }
      return originalWrite(chunk, ...args);
    } as unknown as typeof res.write;

    // Override end to compress and send
    res.end = function endImpl(chunkArg?: any, ...args: any[]): Response {
      if (shouldCompress) {
        if (chunkArg) {
          chunks.push(Buffer.isBuffer(chunkArg) ? chunkArg : Buffer.from(chunkArg));
        }

        // Create compression stream using detected encoding
        compressionStream = createCompressionStream(selectedEncoding, finalConfig);

        // Set up compression stream
        compressionStream.on('data', (compressedChunk: Buffer) => {
          originalWrite(compressedChunk);
        });

        compressionStream.on('end', () => {
          originalEnd();
        });

        compressionStream.on('error', (error: Error) => {
          console.error('Compression error:', error);
          // Fallback to uncompressed
          chunks.forEach(chunk => originalWrite(chunk));
          originalEnd();
        });

        // Compress all collected chunks
        chunks.forEach(chunk => compressionStream!.write(chunk));
        compressionStream.end();
        return res;
      }
      return originalEnd(chunkArg, ...args);
    } as unknown as typeof res.end;

    next();
  };
}

/**
 * Brotli compression middleware
 */
export function brotliCompression(config: CompressionConfig = {}): (req: Request, res: Response, next: NextFunction) => void {
  return compression({ ...config, contentTypes: ['br'] });
}

/**
 * Gzip compression middleware
 */
export function gzipCompression(config: CompressionConfig = {}): (req: Request, res: Response, next: NextFunction) => void {
  return compression({ ...config, contentTypes: ['gzip'] });
}
