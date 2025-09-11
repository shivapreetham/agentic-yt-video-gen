# AI Automated Video Generation System Architecture

## Overview
This system generates videos automatically using AI agents, with support for batch processing, Cloudflare storage, and agentic workflows.

## Core Components

### 1. Flask Backend (`app.py`)
Main Flask application that orchestrates video generation with these key endpoints:

#### Agentic Workflow Endpoints
- **`POST /agentic/auto-workflow`**: Complete automated workflow
  - Generates topics → Adds jobs → Starts workers
  - Parameters: `domains`, `topics_per_domain`, `num_workers`
  
- **`POST /agentic/hybrid-workflow`**: Hybrid workflow with user review
  - Type: `generate_for_review` or `use_manual_topics`
  
- **`POST /agentic/add-manual-topic`**: Add single topic to queue
  - Direct topic submission with video parameters

#### Job Management
- **`GET /agentic/jobs`**: List all jobs
- **`GET /agentic/job/{job_id}`**: Get specific job status
- **`DELETE /agentic/job/{job_id}`**: Cancel job

### 2. Job Queue System (`backend_functions/job_queue_manager.py`)

#### JobStatus Enum
- `QUEUED`, `PROCESSING`, `COMPLETED`, `FAILED`, `CANCELLED`

#### VideoJob Dataclass
Key parameters for video generation:
```python
topic: str                    # Video topic
domain: str                   # Content domain
script_length: str = "medium" # Script length
voice: str = "alloy"          # TTS voice
width: int = 576              # Mobile format
height: int = 1024            # Mobile format  
fps: int = 24                 # Frame rate
img_style_prompt: str         # Image style
include_dialogs: bool = True  # Dialog support
use_different_voices: bool = True # Voice variation
add_captions: bool = True     # Subtitle generation
```

### 3. Agentic Worker System (`backend_functions/agentic_video_worker.py`)

#### AgenticVideoWorker Class
- Autonomous job processing
- Configurable polling interval
- Auto-retry on failures
- Queue auto-refill capability

#### Worker Management Functions
- `start_agentic_workforce(num_workers)`: Start worker pool
- `stop_agentic_workforce()`: Stop all workers
- `get_workforce_status()`: Get worker status

### 4. Video Generation Pipeline

#### Core Generator (`backend_functions/story_video_generator.py`)
Main video generation orchestrator

#### Pipeline Components
1. **Script Generation** (`story_script_generator.py`)
   - AI-generated scripts based on topic
   
2. **Audio Generation** (`elevenlabs_audio.py`, `segment_audio_generator.py`)
   - TTS using ElevenLabs API
   - Support for multiple voices
   
3. **Image Generation** (`segment_image_generator.py`)
   - AI-generated images using Pollinations API
   
4. **Video Assembly** (`segment_video_creator.py`, `video_segment_stitcher.py`)
   - Combines images and audio
   - Creates final video with captions

### 5. Storage & Upload

#### Cloudflare Storage (`cloudflare_storage_manager.py`)
- Video upload to Cloudflare R2
- URL generation for access
- Metadata management

### 6. Agent System

#### Topic Generation Agent (`agents/topic_generation_agent.py`)
- Generates video topics by domain
- Queue management integration

#### Research Agents (`agents/`)
- Content research and synthesis
- Multiple scraper implementations

## Data Flow

### Automated Workflow
1. **Topic Generation**: Agent creates topics by domain
2. **Job Creation**: Topics converted to VideoJob objects
3. **Queue Processing**: Workers poll and process jobs
4. **Video Generation**: Full pipeline execution
5. **Storage**: Upload to Cloudflare
6. **Metadata**: JSON mapping creation

### Manual Workflow  
1. **Topic Input**: User provides topic directly
2. **Job Creation**: Manual VideoJob creation
3. **Processing**: Same as automated workflow

## Configuration Files

### Environment Variables (`.env`)
- API keys (ElevenLabs, Gemini, etc.)
- Cloudflare credentials
- Service configurations

### Docker Configuration (`Dockerfile`)
- Multi-stage build for optimization
- Python 3.11 slim base
- FFmpeg installation for video processing
- Gunicorn production server

## File Structure
```
/
├── app.py                    # Main Flask application
├── backend_functions/        # Core video generation
│   ├── agentic_video_worker.py
│   ├── job_queue_manager.py
│   ├── story_video_generator.py
│   └── cloudflare_storage_manager.py
├── agents/                   # AI agent implementations
├── frontend/                 # React frontend
├── results/                  # Generated video outputs
└── docs/                     # Documentation
```

## Testing Approach

### Greek Gods Example (10 Videos)
Input format: `"greek gods", 10, "mobile view"`

Expected flow:
1. Topic agent generates 10 Greek mythology topics
2. Jobs created with mobile video parameters (576x1024)
3. Workers process jobs in parallel
4. Videos uploaded to Cloudflare
5. JSON mapping file created with URLs

## Key Features

- **Batch Processing**: Generate multiple videos simultaneously
- **Mobile Optimization**: Vertical video format (576x1024)
- **Cloud Storage**: Automatic Cloudflare R2 upload
- **Progress Tracking**: Real-time job status monitoring
- **Agent Architecture**: Autonomous topic generation and processing
- **Fault Tolerance**: Retry mechanisms and error handling