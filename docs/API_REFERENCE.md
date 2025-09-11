# API Reference

## Agentic Workflow Endpoints

### POST /agentic/auto-workflow
Complete automated workflow for batch video generation.

**Request Body:**
```json
{
  "domains": ["greek_mythology", "science", "technology"],
  "topics_per_domain": 5,
  "num_workers": 2
}
```

**Response:**
```json
{
  "success": true,
  "message": "Automated workflow started successfully",
  "workflow_results": {
    "stage_1_topics": {
      "success": true,
      "topics_generated": 15,
      "domains": ["greek_mythology", "science", "technology"]
    },
    "stage_2_jobs": {
      "success": true,
      "jobs_added": {"greek_mythology": 5, "science": 5, "technology": 5},
      "total_jobs": 15
    },
    "stage_3_workforce": {
      "success": true,
      "workers_started": 2,
      "status": {...}
    }
  },
  "queue_status": {...},
  "timestamp": "2025-01-XX..."
}
```

### POST /agentic/hybrid-workflow
Hybrid workflow with user review capability.

**Request Body (Generate for Review):**
```json
{
  "type": "generate_for_review",
  "domains": ["greek_mythology"],
  "topics_per_domain": 10
}
```

**Response:**
```json
{
  "success": true,
  "workflow_stage": "topics_generated_for_review",
  "topics_for_review": [
    {
      "id": "greek_mythology_0",
      "topic": "Zeus and the Olympian Council",
      "domain": "greek_mythology",
      "subtopics": ["power dynamics", "divine politics"],
      "keywords": ["zeus", "olympus", "gods"],
      "estimated_interest": 85,
      "selected": true
    }
  ],
  "total_topics": 10,
  "next_step": "Review topics and call /agentic/approve-reviewed-topics"
}
```

**Request Body (Manual Topics):**
```json
{
  "type": "use_manual_topics",
  "topics": [
    {
      "topic": "The Twelve Olympian Gods",
      "domain": "greek_mythology"
    },
    {
      "topic": "Perseus and Medusa",
      "domain": "greek_mythology"  
    }
  ]
}
```

### POST /agentic/add-manual-topic
Add a single topic directly to the job queue.

**Request Body:**
```json
{
  "topic": "The Trojan War",
  "domain": "greek_mythology",
  "script_length": "medium",
  "voice": "alloy",
  "width": 576,
  "height": 1024,
  "fps": 24,
  "img_style_prompt": "cinematic, ancient greek, epic",
  "include_dialogs": true,
  "use_different_voices": true,
  "add_captions": true
}
```

**Response:**
```json
{
  "success": true,
  "job_id": "job_12345",
  "message": "Topic added to queue successfully",
  "queue_position": 3,
  "estimated_processing_time": "5-10 minutes"
}
```

## Job Management Endpoints

### GET /agentic/jobs
List all jobs with optional filtering.

**Query Parameters:**
- `status`: Filter by job status (queued, processing, completed, failed)
- `domain`: Filter by content domain
- `limit`: Maximum results to return
- `offset`: Pagination offset

**Response:**
```json
{
  "success": true,
  "jobs": [
    {
      "job_id": "job_12345",
      "topic": "The Trojan War",
      "domain": "greek_mythology",
      "status": "completed",
      "progress": 100.0,
      "created_at": "2025-01-XX...",
      "completed_at": "2025-01-XX...",
      "result": {
        "video_url": "https://cloudflare.../video.mp4",
        "thumbnail_url": "https://cloudflare.../thumb.jpg",
        "duration": 120,
        "file_size": 15728640
      }
    }
  ],
  "total": 1,
  "pagination": {
    "limit": 50,
    "offset": 0,
    "has_more": false
  }
}
```

### GET /agentic/job/{job_id}
Get specific job status and details.

**Response:**
```json
{
  "success": true,
  "job": {
    "job_id": "job_12345",
    "topic": "The Trojan War",
    "domain": "greek_mythology",
    "status": "processing",
    "progress": 45.0,
    "message": "Generating segment videos...",
    "created_at": "2025-01-XX...",
    "started_at": "2025-01-XX...",
    "video_params": {
      "script_length": "medium",
      "voice": "alloy", 
      "width": 576,
      "height": 1024,
      "fps": 24
    }
  }
}
```

### DELETE /agentic/job/{job_id}
Cancel a queued or processing job.

**Response:**
```json
{
  "success": true,
  "message": "Job cancelled successfully",
  "job_id": "job_12345",
  "previous_status": "queued"
}
```

## Workforce Management

### GET /agentic/workforce/status
Get current workforce status.

**Response:**
```json
{
  "is_running": true,
  "workers": [
    {
      "worker_id": "worker-1",
      "status": "processing",
      "current_job_id": "job_12345",
      "jobs_processed": 5,
      "uptime": 3600
    }
  ],
  "total_workers": 2,
  "queue_length": 8
}
```

### POST /agentic/workforce/start
Start the workforce with specified number of workers.

**Request Body:**
```json
{
  "num_workers": 3
}
```

### POST /agentic/workforce/stop
Stop all workers gracefully.

## Error Responses

### 400 Bad Request
```json
{
  "error": "Topic is required",
  "message": "Validation failed"
}
```

### 404 Not Found
```json
{
  "error": "Job not found",
  "job_id": "invalid_job_id"
}
```

### 500 Internal Server Error  
```json
{
  "success": false,
  "error": "Video generation failed",
  "message": "Internal processing error",
  "job_id": "job_12345"
}
```

## Video Parameters

### Default Mobile Format
- **Width**: 576px (mobile optimized)
- **Height**: 1024px (vertical format)
- **FPS**: 24 (standard video)
- **Format**: MP4 with H.264 encoding

### Voice Options (ElevenLabs)
- `alloy`: Default narrator voice
- `echo`: Alternative narrator
- `fable`: Story-telling voice
- `onyx`: Deep voice
- `nova`: Clear voice
- `shimmer`: Expressive voice

### Script Length Options
- `short`: ~30-60 seconds
- `medium`: ~90-120 seconds  
- `long`: ~150-180 seconds

### Image Style Prompts
- `cinematic, professional`: Default
- `ancient greek, epic`: For mythology content
- `modern, tech`: For technology topics
- `scientific, detailed`: For science content