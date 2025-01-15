# weave-backend

To install dependencies:
```sh
bun install
```

To run:
```sh
bun run dev
```

open http://localhost:3000

## Docker Usage

Build the image:
```bash
docker build -t weave-backend .
```

Run the container:
```bash
docker run -d -p 3000:3000 --name weave-backend weave-backend
```

The API will be available at http://localhost:3000

## Docker Management

### Rebuild and Restart
After making changes to the code, rebuild and restart the container:
```bash
# Stop the running container
docker stop weave-backend

# Remove the old container
docker rm weave-backend

# Rebuild the image
docker build -t weave-backend .

# Start a new container
docker run -d -p 3000:3000 --name weave-backend weave-backend
```

### Quick Restart (without rebuild)
To restart the container without rebuilding:
```bash
docker restart weave-backend
```

### Stop and Remove
To stop and remove the container:
```bash
# Stop the container
docker stop weave-backend

# Remove the container
docker rm weave-backend

# Optionally, remove the image
docker rmi weave-backend
```

### View Logs
To view container logs:
```bash
# Follow logs in real-time
docker logs -f weave-backend

# View last N lines
docker logs --tail 100 weave-backend
```
