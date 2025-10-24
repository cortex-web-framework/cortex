import { createBrotliCompress, createGzip, createDeflate } from 'node:zlib';
/**
 * Default compression configuration
 */
export const DEFAULT_COMPRESSION_CONFIG = {
    threshold: 1024, // 1KB
    level: 6, // Balanced compression
    memLevel: 8, // Default memory level
    chunkSize: 16 * 1024, // 16KB chunks
    windowBits: 15, // Default window bits
    strategy: 0, // Default strategy
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
export function parseAcceptEncoding(acceptEncoding) {
    if (!acceptEncoding)
        return [];
    return acceptEncoding
        .split(',')
        .map(encoding => encoding.trim().split(';')[0])
        .filter(encoding => encoding.length > 0);
}
/**
 * Select best compression method based on client support
 */
export function selectEncoding(supportedEncodings) {
    // Priority order: brotli > gzip > deflate
    if (supportedEncodings.includes('br'))
        return 'br';
    if (supportedEncodings.includes('gzip'))
        return 'gzip';
    if (supportedEncodings.includes('deflate'))
        return 'deflate';
    return null;
}
/**
 * Check if content should be compressed
 */
export function isCompressible(contentType, config) {
    var _a;
    const type = contentType.split(';')[0].toLowerCase();
    // Check excluded types first (blacklist takes priority)
    if ((_a = config.excludeContentTypes) === null || _a === void 0 ? void 0 : _a.some(excluded => type.includes(excluded.toLowerCase()))) {
        return false;
    }
    // If contentTypes whitelist is specified, check it
    if (config.contentTypes && config.contentTypes.length > 0) {
        if (config.contentTypes.some(included => type.includes(included.toLowerCase()))) {
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
function createCompressionStream(encoding, config) {
    var _a, _b, _c, _d, _e;
    switch (encoding) {
        case 'br':
            return createBrotliCompress({
                params: {
                    [11]: (_a = config.level) !== null && _a !== void 0 ? _a : 6, // BROTLI_PARAM_QUALITY
                }
            });
        case 'gzip':
            return createGzip({
                level: (_b = config.level) !== null && _b !== void 0 ? _b : 6,
                memLevel: (_c = config.memLevel) !== null && _c !== void 0 ? _c : 8
            });
        case 'deflate':
            return createDeflate({
                level: (_d = config.level) !== null && _d !== void 0 ? _d : 6,
                memLevel: (_e = config.memLevel) !== null && _e !== void 0 ? _e : 8,
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
export function compression(config = {}) {
    const finalConfig = Object.assign(Object.assign({}, DEFAULT_COMPRESSION_CONFIG), config);
    return (req, res, next) => {
        var _a, _b, _c;
        // Support both standard Node.js req.headers and Express-style req.get()
        const acceptEncoding = (((_b = (_a = req).get) === null || _b === void 0 ? void 0 : _b.call(_a, 'Accept-Encoding')) || ((_c = req.headers) === null || _c === void 0 ? void 0 : _c['accept-encoding']) || '');
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
        let compressionStream = null;
        let contentLength = 0;
        let chunks = [];
        // Override writeHead to check content type and length
        res.writeHead = function writeHeadImpl(statusCode, ...args) {
            var _a, _b, _c, _d;
            // Extract headers from writeHead arguments
            // Signature: writeHead(statusCode, [statusMessage], [headers])
            let headersArg = {};
            let headersArgIndex = -1;
            if (args.length > 0) {
                const lastArg = args[args.length - 1];
                if (typeof lastArg === 'object' && lastArg !== null && !Array.isArray(lastArg)) {
                    headersArg = lastArg;
                    headersArgIndex = args.length - 1;
                }
            }
            // Merge headers from arguments with previously set headers
            const contentType = ((_b = (_a = headersArg['Content-Type']) !== null && _a !== void 0 ? _a : res.getHeader('Content-Type')) !== null && _b !== void 0 ? _b : '');
            const contentLengthHeader = ((_d = (_c = headersArg['Content-Length']) !== null && _c !== void 0 ? _c : res.getHeader('Content-Length')) !== null && _d !== void 0 ? _d : '');
            if (contentLengthHeader) {
                contentLength = parseInt(contentLengthHeader, 10);
            }
            // Check if we should compress
            if (isCompressible(contentType, finalConfig) &&
                contentLength >= finalConfig.threshold) {
                shouldCompress = true;
                res.setHeader('Content-Encoding', selectedEncoding);
                res.removeHeader('Content-Length'); // Remove original content length
                // Remove Content-Length from args if it was passed in writeHead call
                if (headersArgIndex >= 0 && headersArg['Content-Length']) {
                    const newHeaders = Object.assign({}, headersArg);
                    delete newHeaders['Content-Length'];
                    args[headersArgIndex] = newHeaders;
                }
            }
            return originalWriteHead(statusCode, ...args);
        };
        // Override write to collect chunks
        res.write = function writeImpl(chunk, ...args) {
            if (shouldCompress && chunk) {
                chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
                return true;
            }
            return originalWrite(chunk, ...args);
        };
        // Override end to compress and send
        res.end = function endImpl(chunkArg, ...args) {
            if (shouldCompress) {
                if (chunkArg) {
                    chunks.push(Buffer.isBuffer(chunkArg) ? chunkArg : Buffer.from(chunkArg));
                }
                // Create compression stream using detected encoding
                compressionStream = createCompressionStream(selectedEncoding, finalConfig);
                // Set up compression stream
                compressionStream.on('data', (compressedChunk) => {
                    originalWrite(compressedChunk);
                });
                compressionStream.on('end', () => {
                    originalEnd();
                });
                compressionStream.on('error', (error) => {
                    console["error"]('Compression error:', error);
                    // Fallback to uncompressed
                    chunks.forEach(chunk => originalWrite(chunk));
                    originalEnd();
                });
                // Compress all collected chunks
                chunks.forEach(chunk => compressionStream.write(chunk));
                compressionStream.end();
                return res;
            }
            return originalEnd(chunkArg, ...args);
        };
        next();
    };
}
/**
 * Brotli compression middleware
 */
export function brotliCompression(config = {}) {
    return compression(config);
}
/**
 * Gzip compression middleware
 */
export function gzipCompression(config = {}) {
    return compression(config);
}
