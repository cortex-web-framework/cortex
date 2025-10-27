import * as http from 'node:http';
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
    .map(encoding => encoding.trim().split(';')[0]!)
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
  const type = contentType.split(';')[0]!.toLowerCase();

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
    const selectedEncodingOrNull = selectEncoding(supportedEncodings);

    if (!selectedEncodingOrNull) {
      next();
      return;
    }

    // At this point, selectedEncoding is guaranteed to be a string, not null
    const selectedEncoding: string = selectedEncodingOrNull;

    // Store original methods
    const originalWrite = res.write.bind(res);
    const originalEnd = res.end.bind(res);
    const originalWriteHead = res.writeHead.bind(res);

    let shouldCompress = false;
    let compressionStream: Transform | null = null;
    let compressionInitialized = false;
    let contentLength = 0;

    // Initialize compression stream when we know we should compress
    function initializeCompression(): void {
      if (compressionInitialized) return;
      compressionInitialized = true;

      // Create compression stream (selectedEncoding is guaranteed to be a string)
      compressionStream = createCompressionStream(selectedEncoding, finalConfig);

      // Pipe compressed chunks directly to original response
      compressionStream.on('data', (compressedChunk: Buffer) => {
        originalWrite(compressedChunk);
      });

      compressionStream.on('end', () => {
        originalEnd();
      });

      compressionStream.on('error', (error: Error) => {
        console["error"]('Compression error:', error);
        // Fallback: end without compression
        originalEnd();
      });
    }

    // Override writeHead to check content type and length, then initialize compression
    res.writeHead = function writeHeadImpl(statusCode: number, ...args: any[]): Response {
      // Extract headers from writeHead arguments
      // Signature: writeHead(statusCode, [statusMessage], [headers])
      let headersArg: Record<string, any> = {};
      let headersArgIndex = -1;
      if (args.length > 0) {
        const lastArg = args[args.length - 1];
        if (typeof lastArg === 'object' && lastArg !== null && !Array.isArray(lastArg)) {
          headersArg = lastArg;
          headersArgIndex = args.length - 1;
        }
      }

      // Merge headers from arguments with previously set headers
      const contentType = (headersArg['Content-Type'] ?? res.getHeader('Content-Type') ?? '') as string;
      const contentLengthHeader = (headersArg['Content-Length'] ?? res.getHeader('Content-Length') ?? '') as string;

      if (contentLengthHeader) {
        contentLength = parseInt(contentLengthHeader, 10);
      }

      // Check if we should compress
      if (isCompressible(contentType, finalConfig) &&
          contentLength >= finalConfig.threshold) {
        shouldCompress = true;
        res.setHeader('Content-Encoding', selectedEncoding);
        res.removeHeader('Content-Length'); // Remove original content length

        // Initialize compression stream NOW (not later)
        initializeCompression();

        // Remove Content-Length from args if it was passed in writeHead call
        if (headersArgIndex >= 0 && headersArg['Content-Length']) {
          const newHeaders = { ...headersArg };
          delete newHeaders['Content-Length'];
          args[headersArgIndex] = newHeaders;
        }
      }

      return originalWriteHead(statusCode, ...args);
    } as unknown as typeof res.writeHead;

    // Override write to stream through compression (no buffering)
    res.write = function writeImpl(chunk: any, ...args: any[]): boolean {
      if (compressionStream) {
        // Write directly through compression stream (true streaming!)
        return compressionStream.write(chunk);
      }
      // No compression, use original write
      return originalWrite(chunk, ...args);
    } as unknown as typeof res.write;

    // Override end to finalize compression
    res.end = function endImpl(chunkArg?: any, ...args: any[]): Response {
      if (compressionStream) {
        // Write final chunk if provided
        if (chunkArg) {
          compressionStream.write(chunkArg);
        }
        // End the compression stream
        compressionStream.end();
        return res;
      }
      // No compression, use original end
      return originalEnd(chunkArg, ...args);
    } as unknown as typeof res.end;

    next();
  };
}

/**
 * Brotli compression middleware
 */
export function brotliCompression(config: CompressionConfig = {}): (req: Request, res: Response, next: NextFunction) => void {
  return compression(config);
}

/**
 * Gzip compression middleware
 */
export function gzipCompression(config: CompressionConfig = {}): (req: Request, res: Response, next: NextFunction) => void {
  return compression(config);
}
