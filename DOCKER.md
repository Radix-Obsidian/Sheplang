# 🐳 Docker Guide for ShepLang/ShepKit

Run the entire ShepLang platform with just Docker. No Node.js, pnpm, or environment setup required!

## 🚀 Quick Start

### Run ShepKit IDE (Browser-Based)

```bash
docker compose up shepkit
```

Then open: **http://localhost:3000**

### Run ShepLang CLI

```bash
# Show help
docker compose run --rm sheplang-cli

# Explain a ShepLang file
docker compose run --rm sheplang-cli explain examples/todo.shep

# Transpile ShepLang to BobaScript
docker compose run --rm sheplang-cli transpile examples/todo.shep
```

---

## 📦 What's Included

### Services

- **`shepkit`** - Production Next.js IDE (port 3000)
- **`shepkit-dev`** - Development mode with hot reload
- **`sheplang-cli`** - Command-line tool for ShepLang operations

### Images

- **`sheplang-cli:latest`** - CLI runtime (~150MB)
- **`shepkit:latest`** - ShepKit production (~300MB)
- **`shepkit-dev:latest`** - ShepKit development with tools (~500MB)

---

## 🛠️ Usage Examples

### Development Workflow

```bash
# Start ShepKit in dev mode with hot reload
docker compose up shepkit-dev

# Run verification checks
docker compose run --rm sheplang-cli node scripts/verify.js

# Build everything
docker compose build
```

### Production Deployment

```bash
# Build optimized images
docker compose build shepkit

# Run production server
docker compose up -d shepkit

# Check logs
docker compose logs -f shepkit

# Stop server
docker compose down
```

### CLI Operations

```bash
# Interactive shell in CLI container
docker compose run --rm sheplang-cli sh

# Run custom command
docker compose run --rm sheplang-cli node -e "console.log('Hello ShepLang')"

# Mount local files for processing
docker run --rm -v $(pwd)/examples:/data sheplang-cli explain /data/todo.shep
```

---

## 🔧 Environment Variables

Create a `.env` file in the project root:

```env
# OpenAI API (for AI features)
OPENAI_API_KEY=sk-your-key-here

# Vercel (for deployment features)
VERCEL_TOKEN=your-vercel-token

# Supabase (for cloud persistence)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Then run:

```bash
docker compose --env-file .env up shepkit
```

---

## 🏗️ Building from Scratch

### Build Individual Images

```bash
# Build CLI only
docker build -t sheplang-cli --target cli .

# Build ShepKit only
docker build -t shepkit -f sheplang/shepkit/Dockerfile .
```

### Multi-Platform Builds

```bash
# Build for ARM64 and AMD64
docker buildx build --platform linux/amd64,linux/arm64 -t shepkit:multiarch .
```

---

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Use a different port
docker compose run --rm -p 3001:3000 shepkit
```

### Clear Build Cache

```bash
# Remove all caches and rebuild
docker compose build --no-cache
```

### See Build Logs

```bash
# Verbose build output
docker compose build --progress=plain
```

### Access Container Shell

```bash
# ShepKit container
docker compose run --rm shepkit sh

# CLI container
docker compose run --rm sheplang-cli sh
```

---

## 📊 Resource Usage

### Disk Space

- **Build cache**: ~2GB
- **Final images**: ~500MB total
- **Running containers**: ~200MB RAM

### Optimization Tips

```bash
# Prune unused images
docker system prune -a

# Remove specific images
docker rmi shepkit:latest sheplang-cli:latest

# Clean everything (careful!)
docker system prune --all --volumes
```

---

## 🚢 Deployment

### Docker Hub

```bash
# Tag and push
docker tag shepkit:latest yourorg/shepkit:v1.0.0
docker push yourorg/shepkit:v1.0.0
```

### Kubernetes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: shepkit
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: shepkit
        image: shepkit:latest
        ports:
        - containerPort: 3000
        env:
        - name: OPENAI_API_KEY
          valueFrom:
            secretKeyRef:
              name: shepkit-secrets
              key: openai-key
```

### Cloud Run / Azure Container Apps

```bash
# Deploy to Google Cloud Run
gcloud run deploy shepkit --image shepkit:latest --port 3000

# Deploy to Azure Container Apps
az containerapp up --name shepkit --image shepkit:latest
```

---

## 🎯 For Non-Technical Founders

This is the **easiest way** to try ShepKit:

1. **Install Docker Desktop**: https://www.docker.com/products/docker-desktop
2. **Clone the repo**:
   ```bash
   git clone https://github.com/Radix-Obsidian/Sheplang-BobaScript.git
   cd Sheplang-BobaScript
   ```
3. **Start ShepKit**:
   ```bash
   docker compose up shepkit
   ```
4. **Open your browser**: http://localhost:3000

That's it! No Node.js, no pnpm, no complex setup. Just Docker.

---

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/)
- [Multi-Stage Builds](https://docs.docker.com/build/building/multi-stage/)
- [Best Practices](https://docs.docker.com/develop/dev-best-practices/)

---

## ⚡ Quick Reference

| Command | Description |
|---------|-------------|
| `docker compose up shepkit` | Start ShepKit IDE |
| `docker compose up -d shepkit` | Start in background |
| `docker compose down` | Stop all services |
| `docker compose build` | Rebuild images |
| `docker compose logs -f shepkit` | View logs |
| `docker compose run --rm sheplang-cli` | Run CLI |
| `docker compose ps` | List running services |
| `docker compose restart shepkit` | Restart service |

---

**Ready to build the future?** Start with `docker compose up shepkit` 🚀
