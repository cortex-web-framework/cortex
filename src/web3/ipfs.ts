// Type definition for IPFS HTTP Client
interface IPFSHTTPClient {
  add(content: string | Buffer): Promise<{ cid: { toString: () => string } }>;
  cat(cid: string): AsyncIterable<Uint8Array>;
}

export class IPFSClient {
  private client: IPFSHTTPClient;

  constructor(createFn: (options: { url: string }) => IPFSHTTPClient, ipfsApiUrl: string) {
    this.client = createFn({ url: ipfsApiUrl });
  }

  public async addContent(content: string | Buffer): Promise<string> {
    const { cid } = await this.client.add(content);
    return cid.toString();
  }

  public async getContent(cid: string): Promise<Buffer> {
    const chunks: Uint8Array[] = [];
    for await (const chunk of this.client.cat(cid)) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  }
}
