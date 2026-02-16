# apps/gateway

High-performance WebSocket gateway written in Go for zero-allocation real-time communication.

## Stack

- **Language**: Go 1.26
- **HTTP**: stdlib net/http
- **WebSocket**: github.com/gorilla/websocket
- **Redis**: github.com/redis/go-redis/v9
- **Port**: 8081

## Scripts

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Run development server with hot reload via `go run` |
| `pnpm build` | Compile binary to `bin/gateway` |

## Architecture

HTTP server with:
- `/health` — health check endpoint
- `/ws` — WebSocket upgrade endpoint with ticket authentication

### Authentication Flow

Single-use ticket system backed by Upstash Redis:
1. Client requests ticket from TypeScript API (`ws.getTicket` tRPC procedure)
2. API generates UUID ticket, stores `ws_ticket:<ticket>` → `userId` in Redis with 30s TTL
3. Client connects to `/ws?ticket=<ticket>`
4. Gateway validates ticket against Redis before upgrade
5. Gateway deletes ticket immediately (single-use)
6. Connection upgraded with `userId` attached to Client struct

### Zero-Allocation Design

Uses `sync.Pool` for byte buffer recycling to minimize GC pressure:
- 4KB buffer pool for read/write operations
- Pooled buffers returned immediately after use
- Client struct holds WebSocket connection and authenticated UserID
- Read loop recycles buffers on every message

### WebSocket Upgrader

Configured with:
- 4KB read/write buffers
- Origin check disabled for dev (allows all origins)
- Automatic protocol upgrade from HTTP
- Ticket validation before upgrade (fail fast)

## Environment Variables

Required:
- `UPSTASH_REDIS_URL` — Redis connection URL (e.g., `redis://default:pass@host:6379`)

See `.env.example` for template.

## Development

From monorepo root:
```bash
pnpm -F @opencord/gateway run dev
```

Or from this directory:
```bash
go run *.go
```

## Building

```bash
pnpm -F @opencord/gateway run build
./bin/gateway
```

## Integration

The `package.json` acts as a bridge for Turborepo. The `dev` script is picked up by `turbo dev` at the root, allowing the Go server to run alongside Node.js apps in the monorepo pipeline.
