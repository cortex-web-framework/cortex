import { test } from 'node:test';
import assert from 'node:assert';
import { IPFSClient } from '../../src/web3/ipfs.js';

// Mock the IPFS HTTP client for testing purposes
class MockIPFSHTTPClient {
  public addCalled: boolean = false;
  public catCalled: boolean = false;
  public addedContent: any;
  public catCid: string = '';
  public mockAddCid: string = 'QmMockCid';
  public mockCatContent: Buffer = Buffer.from('mock content');

  public async add(content: any): Promise<{ cid: { toString: () => string } }> {
    this.addCalled = true;
    this.addedContent = content;
    return { cid: { toString: () => this.mockAddCid } };
  }

  public async *cat(cid: string): AsyncGenerator<Buffer> {
    this.catCalled = true;
    this.catCid = cid;
    yield this.mockCatContent;
  }
}

test('IPFSClient should add content to IPFS', async () => {
  const mockInstance = new MockIPFSHTTPClient();
  const mockCreate = (_options: { url: string }) => mockInstance;

  const client = new IPFSClient(mockCreate, 'http://localhost:5001');
  const content = 'Hello IPFS!';
  const expectedCid = 'QmMockCid';

  const cid = await client.addContent(content);

  assert.strictEqual(mockInstance.addCalled, true, 'add method should be called');
  assert.strictEqual(mockInstance.addedContent, content, 'Correct content should be added');
  assert.strictEqual(cid, expectedCid, 'Should return the correct CID');
});

test('IPFSClient should get content from IPFS', async () => {
  const mockInstance = new MockIPFSHTTPClient();
  const mockCreate = (_options: { url: string }) => mockInstance;

  const client = new IPFSClient(mockCreate, 'http://localhost:5001');
  const cid = 'QmTestCid';
  const expectedContent = Buffer.from('mock content');

  const content = await client.getContent(cid);

  assert.strictEqual(mockInstance.catCalled, true, 'cat method should be called');
  assert.strictEqual(mockInstance.catCid, cid, 'Correct CID should be used to get content');
  assert.deepStrictEqual(content, expectedContent, 'Should return the correct content');
});
