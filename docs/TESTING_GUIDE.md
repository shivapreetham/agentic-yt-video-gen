# Testing Guide

## Greek Gods Testing Scenario

### Input Requirements
- **Topic**: "greek gods" 
- **Count**: 10 videos
- **Format**: "mobile view" (576x1024)

### Expected Outputs
1. **10 Videos Generated**: Each ~90-120 seconds, mobile format
2. **Cloudflare Storage**: All videos uploaded to R2
3. **JSON Mapping**: File with video URLs and metadata
4. **Frontend Integration**: Videos accessible in React frontend

## Testing Steps

### 1. Docker Backend Testing

#### Build and Run Backend
```bash
# Navigate to project directory
cd "C:\Users\SHIVAPREETHAM ROHITH\Desktop\ai-automated-video-gen"

# Build Docker image
docker build -t ai-video-test .

# Run container
docker run -d -p 8000:8000 --name ai-video-container ai-video-test

# Check health
docker logs ai-video-container
curl http://localhost:8000/health
```

#### Rebuild After Changes
```bash
# Stop existing container
docker stop ai-video-container
docker rm ai-video-container

# Rebuild and restart
docker build -t ai-video-test .
docker run -d -p 8000:8000 --name ai-video-container ai-video-test
```

### 2. API Testing

#### Test 1: Manual Topic Addition
```bash
curl -X POST http://localhost:8000/agentic/add-manual-topic \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Zeus King of the Gods",
    "domain": "greek_mythology",
    "width": 576,
    "height": 1024,
    "img_style_prompt": "cinematic, ancient greek, epic, professional"
  }'
```

Expected Response:
```json
{
  "success": true,
  "job_id": "job_xxxxx",
  "message": "Topic added to queue successfully"
}
```

#### Test 2: Batch Generation (Greek Gods)
```bash
curl -X POST http://localhost:8000/agentic/hybrid-workflow \
  -H "Content-Type: application/json" \
  -d '{
    "type": "use_manual_topics",
    "topics": [
      {"topic": "Zeus King of the Gods", "domain": "greek_mythology"},
      {"topic": "Poseidon Lord of the Seas", "domain": "greek_mythology"},
      {"topic": "Hades Ruler of the Underworld", "domain": "greek_mythology"},
      {"topic": "Athena Goddess of Wisdom", "domain": "greek_mythology"},
      {"topic": "Apollo God of Music and Light", "domain": "greek_mythology"},
      {"topic": "Artemis Goddess of the Hunt", "domain": "greek_mythology"},
      {"topic": "Aphrodite Goddess of Love", "domain": "greek_mythology"},
      {"topic": "Ares God of War", "domain": "greek_mythology"},
      {"topic": "Hephaestus God of Fire and Forge", "domain": "greek_mythology"},
      {"topic": "Demeter Goddess of Harvest", "domain": "greek_mythology"}
    ]
  }'
```

#### Test 3: Start Workers
```bash
curl -X POST http://localhost:8000/agentic/workforce/start \
  -H "Content-Type: application/json" \
  -d '{"num_workers": 2}'
```

### 3. Progress Monitoring

#### Check Job Status
```bash
# List all jobs
curl http://localhost:8000/agentic/jobs

# Check specific job
curl http://localhost:8000/agentic/job/{job_id}

# Check workforce status
curl http://localhost:8000/agentic/workforce/status
```

#### Monitor System Status
```bash
curl http://localhost:8000/polling/system-status
```

### 4. Verification Steps

#### Video Generation Verification
1. **Check Results Directory**
   ```bash
   docker exec -it ai-video-container ls -la /app/results
   ```

2. **Verify Video Count**
   - Should have 10 video files
   - Each file should be ~5-20MB
   - Format: MP4, 576x1024 resolution

3. **Check Cloudflare Upload**
   - Videos should be uploaded to R2
   - URLs should be accessible
   - Thumbnails generated

#### JSON Mapping Verification
```bash
# Check for JSON mapping files
docker exec -it ai-video-container find /app -name "*.json" -type f
```

Expected JSON structure:
```json
{
  "batch_id": "greek_gods_batch_xxxxx",
  "generated_at": "2025-01-XX...",
  "total_videos": 10,
  "videos": [
    {
      "job_id": "job_xxxxx",
      "topic": "Zeus King of the Gods",
      "video_url": "https://cloudflare.../zeus.mp4",
      "thumbnail_url": "https://cloudflare.../zeus_thumb.jpg",
      "duration": 120,
      "file_size": 15728640,
      "created_at": "2025-01-XX..."
    }
  ]
}
```

### 5. Frontend Integration Testing

#### Check Frontend Connection
1. **Start Frontend** (if separate):
   ```bash
   cd frontend
   npm start
   ```

2. **Test API Connection**:
   - Frontend should fetch video list from `/agentic/jobs`
   - Videos should display with Cloudflare URLs
   - Thumbnails should load correctly

### 6. Error Testing

#### Common Error Scenarios
1. **Missing API Keys**: Remove ElevenLabs key, expect audio generation failure
2. **Invalid Topics**: Submit empty topic, expect validation error
3. **Worker Overload**: Submit 50 jobs with 1 worker, check queue handling
4. **Network Issues**: Disable internet, check error handling

### 7. Performance Testing

#### Load Testing
```bash
# Submit 20 jobs simultaneously
for i in {1..20}; do
  curl -X POST http://localhost:8000/agentic/add-manual-topic \
    -H "Content-Type: application/json" \
    -d "{\"topic\": \"Greek God $i\", \"domain\": \"greek_mythology\"}" &
done
```

#### Resource Monitoring
```bash
# Monitor Docker container resources
docker stats ai-video-container

# Check memory usage
docker exec -it ai-video-container free -h

# Check disk usage
docker exec -it ai-video-container df -h
```

## Troubleshooting

### Common Issues

1. **Docker Build Fails**
   - Check requirements-lite.txt exists
   - Verify .env file is present
   - Check Docker daemon is running

2. **API Key Errors**
   - Verify all API keys in .env file
   - Check ElevenLabs API quota
   - Validate Cloudflare credentials

3. **Video Generation Fails**
   - Check FFmpeg installation in container
   - Verify temporary directories exist
   - Check disk space in container

4. **Cloudflare Upload Fails**
   - Verify R2 bucket exists
   - Check bucket permissions
   - Validate access keys

### Log Analysis
```bash
# Container logs
docker logs ai-video-container

# Follow logs in real-time  
docker logs -f ai-video-container

# Application-specific logs
docker exec -it ai-video-container find /app -name "*.log" -type f
```

## Success Criteria

✅ **Backend Running**: Docker container healthy and responsive
✅ **API Endpoints**: All endpoints return expected responses  
✅ **Job Processing**: Workers successfully process Greek god topics
✅ **Video Generation**: 10 videos created with correct format (576x1024)
✅ **Cloudflare Upload**: All videos uploaded and accessible via URLs
✅ **JSON Mapping**: Complete mapping file with video metadata
✅ **Frontend Integration**: Videos display correctly in React app
✅ **Error Handling**: Graceful failure handling and retry mechanisms