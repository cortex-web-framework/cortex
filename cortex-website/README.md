# Cortex Website

A production-ready showcase website for the [Cortex Framework](https://github.com/cortex-web-framework/cortex), built entirely using Cortex itself.

## Features

- **Modern Frontend** - Responsive design with glassmorphic effects
- **Actor-Based Backend** - Uses Cortex's actor system for all business logic
- **Real-Time Blog System** - With search, filtering, and persistence
- **Code Examples** - Interactive code samples with execution
- **Feature Showcase** - Dynamic feature cards for the homepage
- **File-Based Persistence** - JSON storage for blog posts
- **Zero External Dependencies** - Core functionality uses only Cortex
- **Full Test Coverage** - 38+ unit and integration tests

## Project Structure

```
cortex-website/
├── public/                    # Static files served to clients
│   ├── index.html            # Homepage
│   ├── architecture.html      # Architecture visualization
│   ├── blog.html             # Blog listing page
│   ├── examples.html         # Code examples showcase
│   ├── community.html        # Community page
│   ├── about.html            # About page
│   ├── js/
│   │   └── api-client.js     # Frontend API client
│   └── test.html             # Test file
├── src/
│   ├── backend/
│   │   ├── server.ts         # HTTP server and routes
│   │   ├── config.ts         # Configuration management
│   │   ├── blog/
│   │   │   ├── postActor.ts           # Individual post operations
│   │   │   ├── blogServiceActor.ts    # Blog service logic
│   │   │   └── persistentBlogService.ts # Persistent storage version
│   │   ├── features/
│   │   │   └── featureActor.ts        # Homepage features
│   │   ├── examples/
│   │   │   └── exampleActor.ts        # Code examples
│   │   └── storage/
│   │       └── fileStorage.ts         # File-based persistence
│   ├── frontend/             # Frontend TypeScript (if needed)
│   └── shared/               # Shared types and utilities
├── tests/                     # Test files
│   ├── test-server.ts
│   ├── test-config.ts
│   ├── test-post-actor.ts
│   ├── test-blog-service.ts
│   ├── test-feature-actor.ts
│   └── test-example-actor.ts
├── data/                      # Persistent data directory
│   └── blog-posts.json       # Blog posts storage
├── package.json
├── tsconfig.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/cortex-web-framework/cortex.git
cd cortex/cortex-website
```

2. Install dependencies:
```bash
npm install
```

3. Build the Cortex framework:
```bash
cd ..
npm run build
cd cortex-website
```

### Development

Run the development server:
```bash
npm start
```

The server will start on `http://localhost:3000` by default.

### Running Tests

```bash
npm test
```

All 38+ tests will run and report results.

### Building for Production

```bash
npm run build
```

This compiles TypeScript and prepares the project for deployment.

## API Endpoints

### Blog API
- `GET /api/blog/posts` - Get all published posts (paginated)
- `GET /api/blog/search?q={query}&category={category}` - Search and filter posts
- `GET /api/blog/categories` - Get category listing with counts
- `GET /api/blog/featured?count={n}` - Get featured posts

### Features API
- `GET /api/features` - Get all features
- `GET /api/features?category={category}` - Filter by category
- `GET /api/features/categories` - Get category counts

### Examples API
- `GET /api/examples` - Get all code examples
- `GET /api/examples?category={category}` - Filter by category
- `GET /api/examples/run?id={id}` - Execute example
- `GET /api/examples/search?q={query}` - Search examples
- `GET /api/examples/categories` - Get category counts

### Status API
- `GET /api/status` - Check server status

## Configuration

Configuration is managed through the `src/backend/config.ts` file. You can override settings using environment variables.

Example:
```bash
PORT=8080 npm start
```

## Data Persistence

Blog posts are automatically persisted to `data/blog-posts.json`. This allows data to survive server restarts.

To reset to sample data, delete the `data/blog-posts.json` file and restart the server.

## Deployment

### Docker

A Dockerfile is included for containerization:

```bash
docker build -t cortex-website .
docker run -p 3000:3000 cortex-website
```

### Environment Variables

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Key variables:
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)

### Production Server

For production, use a process manager like PM2:

```bash
npm install -g pm2
pm2 start dist/backend/server.js --name cortex-website
pm2 save
pm2 startup
```

## Architecture

The website uses Cortex's actor model for all backend services:

1. **FeatureActor** - Manages homepage features
2. **PostActor** - Individual blog post CRUD operations
3. **BlogServiceActor** - High-level blog operations (search, filter, etc.)
4. **PersistentBlogServiceActor** - Blog service with file persistence
5. **ExampleActor** - Manages code examples

All actors communicate through message passing and work with the EventBus.

## Frontend Integration

The frontend uses the `api-client.js` utility for all API communication:

```javascript
// Fetch blog posts
const response = await apiClient.getBlogPosts(10, 0);

// Search posts
const results = await apiClient.searchBlogPosts('cortex', 'tutorial', 10, 0);

// Get features
const features = await apiClient.getFeatures();
```

## Testing

### Unit Tests
- Server initialization
- Configuration loading
- Post CRUD operations
- Blog service operations
- Feature management
- Code examples

### Integration Tests
- API endpoint responses
- Data persistence
- Search and filtering
- Pagination

Run with: `npm test`

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Performance

- **Static file serving**: Optimized middleware
- **Caching**: Built-in HTTP caching support
- **Pagination**: All list endpoints support pagination
- **Search**: Server-side search with client-side fallback

## Security

- **Input validation**: All API inputs are validated
- **Error handling**: Proper error messages without exposing internals
- **CORS**: Configurable CORS policies
- **Content-Security-Policy**: Ready for production headers

## Troubleshooting

### Server won't start
- Check if port 3000 is already in use
- Ensure Node.js 18+ is installed
- Check logs for TypeScript compilation errors

### Tests are hanging
- Ensure all processes are properly cleaned up
- Check for open file handles
- Try running tests with `--detectOpenHandles` flag

### Data not persisting
- Check `data/` directory exists and is writable
- Verify file permissions
- Check logs for write errors

## License

MIT - See LICENSE file for details

## Support

For issues, questions, or suggestions:
- [GitHub Issues](https://github.com/cortex-web-framework/cortex/issues)
- [Discussions](https://github.com/cortex-web-framework/cortex/discussions)
- [Twitter](https://twitter.com/cortex_framework)

## Roadmap

- [ ] Authentication/Authorization
- [ ] Comment system for blog posts
- [ ] Admin dashboard for content management
- [ ] Analytics integration
- [ ] Multi-language support
- [ ] Database integration (optional)
- [ ] WebSocket support for real-time updates

---

Built with ❤️ using [Cortex Framework](https://github.com/cortex-web-framework/cortex)
