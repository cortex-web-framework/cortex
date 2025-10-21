import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

export function setCacheControl(res: Response, maxAge: number, isPublic: boolean = false): void {
  const cacheType = isPublic ? 'public' : 'private';
  res.setHeader('Cache-Control', `${cacheType}, max-age=${maxAge}`);
}

export function setEtag(res: Response, data: string | Buffer): void {
  const hash = crypto.createHash('sha1').update(data).digest('base64');
  res.setHeader('ETag', `W/"${hash}"`);
}

export function setLastModified(res: Response, date: Date): void {
  res.setHeader('Last-Modified', date.toUTCString());
}

export function conditionalGet(data: string | Buffer, lastModified?: Date, etag?: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ifNoneMatch = req.headers['if-none-match'];
    const ifModifiedSince = req.headers['if-modified-since'];

    let isNotModified = false;

    if (etag && ifNoneMatch && ifNoneMatch === etag) {
      isNotModified = true;
    }

    if (lastModified && ifModifiedSince) {
      const clientModifiedDate = new Date(ifModifiedSince);
      if (lastModified.getTime() <= clientModifiedDate.getTime()) {
        isNotModified = true;
      }
    }

    if (isNotModified) {
      res.status(304).send();
    } else {
      if (lastModified) setLastModified(res, lastModified);
      if (etag) setEtag(res, data);
      next();
    }
  };
}
