import { strict as assert } from 'assert';
import { PostActor, BlogPost } from '../src/backend/blog/postActor.js';

let totalTests = 0;
let passedTests = 0;

async function test(name: string, fn: () => void | Promise<void>) {
  totalTests++;
  try {
    const result = fn();
    if (result instanceof Promise) {
      await result;
    }
    console.log(`✓ ${name}`);
    passedTests++;
  } catch (error) {
    console.error(`✗ ${name}`);
    console.error(error);
    process.exit(1);
  }
}

// Initialize a test actor
const postActor = new PostActor();

(async () => {
  // Test: Create a post
  await test('PostActor: Create a blog post', async () => {
    const response = await postActor.handle({
      type: 'create',
      post: {
        title: 'Test Post',
        excerpt: 'This is a test excerpt',
        content: 'This is test content',
        author: 'Test Author',
        category: 'tutorial',
        tags: ['test', 'sample'],
        published: false,
      },
    });

    assert.strictEqual(response.success, true, 'Post creation should succeed');
    assert.ok(response.data, 'Response should contain post data');
    const post = response.data as BlogPost;
    assert.strictEqual(post.title, 'Test Post', 'Post title should match');
    assert.ok(post.id, 'Post should have an ID');
  });

  // Test: Read a post
  await test('PostActor: Read a blog post', async () => {
    // First create a post
    const createResponse = await postActor.handle({
      type: 'create',
      post: {
        title: 'Readable Post',
        excerpt: 'Test excerpt',
        content: 'Test content',
        author: 'Author',
        category: 'guide',
        tags: ['test'],
        published: true,
      },
    });

    const postId = (createResponse.data as BlogPost).id;

    // Then read it
    const readResponse = await postActor.handle({
      type: 'read',
      id: postId,
    });

    assert.strictEqual(readResponse.success, true, 'Reading should succeed');
    const post = readResponse.data as BlogPost;
    assert.strictEqual(post.title, 'Readable Post', 'Post title should match');
  });

  // Test: Update a post
  await test('PostActor: Update a blog post', async () => {
    // Create a post
    const createResponse = await postActor.handle({
      type: 'create',
      post: {
        title: 'Original Title',
        excerpt: 'Original excerpt',
        content: 'Original content',
        author: 'Author',
        category: 'update',
        tags: ['test'],
        published: false,
      },
    });

    const postId = (createResponse.data as BlogPost).id;

    // Update it
    const updateResponse = await postActor.handle({
      type: 'update',
      id: postId,
      post: {
        title: 'Updated Title',
        published: true,
      },
    });

    assert.strictEqual(updateResponse.success, true, 'Update should succeed');
    const post = updateResponse.data as BlogPost;
    assert.strictEqual(post.title, 'Updated Title', 'Title should be updated');
    assert.strictEqual(post.published, true, 'Published status should be updated');
  });

  // Test: Delete a post
  await test('PostActor: Delete a blog post', async () => {
    // Create a post
    const createResponse = await postActor.handle({
      type: 'create',
      post: {
        title: 'Post to Delete',
        excerpt: 'Will be deleted',
        content: 'Content',
        author: 'Author',
        category: 'guide',
        tags: ['test'],
        published: false,
      },
    });

    const postId = (createResponse.data as BlogPost).id;

    // Delete it
    const deleteResponse = await postActor.handle({
      type: 'delete',
      id: postId,
    });

    assert.strictEqual(deleteResponse.success, true, 'Delete should succeed');

    // Verify it's gone
    const readResponse = await postActor.handle({
      type: 'read',
      id: postId,
    });

    assert.strictEqual(readResponse.success, false, 'Reading deleted post should fail');
  });

  // Test: List posts
  await test('PostActor: List all posts', async () => {
    const response = await postActor.handle({
      type: 'list',
    });

    assert.strictEqual(response.success, true, 'List should succeed');
    assert.ok(Array.isArray(response.data), 'Response should contain array of posts');
    assert.ok((response.data as BlogPost[]).length > 0, 'Should have posts');
  });

  // Test: Publish a post
  await test('PostActor: Publish a post', async () => {
    const createResponse = await postActor.handle({
      type: 'create',
      post: {
        title: 'Post to Publish',
        excerpt: 'Will be published',
        content: 'Content',
        author: 'Author',
        category: 'tutorial',
        tags: ['test'],
        published: false,
      },
    });

    const postId = (createResponse.data as BlogPost).id;

    const publishResponse = await postActor.handle({
      type: 'publish',
      id: postId,
    });

    assert.strictEqual(publishResponse.success, true, 'Publish should succeed');
    const post = publishResponse.data as BlogPost;
    assert.strictEqual(post.published, true, 'Post should be published');
  });

  // Test: Search functionality
  await test('PostActor: Search posts', async () => {
    const searchResults = postActor.searchPosts('Test');
    assert.ok(Array.isArray(searchResults), 'Search should return array');
    // Note: Results may or may not include items depending on what was published
  });

  // Exit after all tests
  if (totalTests === passedTests) {
    console.log(`\nAll ${totalTests} tests passed.`);
    process.exit(0);
  } else {
    console.error(`\n${passedTests}/${totalTests} tests passed. Some tests failed.`);
    process.exit(1);
  }
})();
