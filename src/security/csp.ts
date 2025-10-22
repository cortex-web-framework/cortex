import { Request, Response, NextFunction } from 'express';

export class CSPBuilder {
  private policies: string[] = [];

  constructor() {
    this.policies.push("default-src 'self'");
  }

  public addPolicy(policy: string): CSPBuilder {
    this.policies.push(policy);
    return this;
  }

  public build(): string {
    return this.policies.join('; ');
  }

  public static middleware(builder: CSPBuilder) {
    return (_req: Request, res: Response, next: NextFunction) => {
      res.setHeader('Content-Security-Policy', builder.build());
      next();
    };
  }
}
