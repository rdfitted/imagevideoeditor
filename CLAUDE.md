# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js application for generating videos using Google's Veo 3 model and images using Gemini 2.5 Flash Image model via the Gemini API. 

**References:**
- Official quickstart: https://github.com/google-gemini/veo-3-gemini-api-quickstart
- Veo 3 Documentation: https://ai.google.dev/gemini-api/docs/video?example=dialogue

## Development Commands

### Core Commands
- `npm run dev` - Start development server on http://localhost:3000
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

### Environment Setup
- Requires `GEMINI_API_KEY` environment variable
- Create `.env` file with: `GEMINI_API_KEY="YOUR_API_KEY"`
- API key available at: https://aistudio.google.com/app/apikey
- Requires Gemini API Paid tier for Veo 3 and image generation

## Architecture

### Core Application Flow
1. **Text/Image Input** → Composer component handles user input
2. **Video Generation** → API routes interact with Gemini API
3. **Polling System** → Monitors operation status until completion
4. **Video Playback** → Custom VideoPlayer with trimming capabilities

### Key Components

#### Main Application (`app/page.tsx`)
- **VeoStudio**: Main React component managing the entire video generation workflow
- **State Management**: Handles prompts, models, operations, and video URLs
- **Polling Logic**: 5-second interval polling for operation completion
- **File Handling**: Manages video blobs, trimmed videos, and downloads

#### UI Components (`components/ui/`)
- **Composer**: Input interface for prompts, image tools, and model selection
- **VideoPlayer**: Custom player with trim functionality and download capability
- **ModelSelector**: Model selection dropdown

#### API Routes (`app/api/`)
- **veo/generate**: Initiates video generation with Veo 3 model
- **veo/operation**: Polls operation status until completion
- **veo/download**: Downloads generated video from Google's servers
- **imagen/generate**: Generates images using Gemini 2.5 Flash Image model

### Data Flow Architecture

```
User Input (Composer) 
    ↓
FormData with prompt/image/config
    ↓
/api/veo/generate (POST)
    ↓
Google Gemini API operation
    ↓
Polling /api/veo/operation (POST)
    ↓
/api/veo/download (POST)
    ↓
Video Blob → VideoPlayer
```

### State Management Pattern
- Uses React useState for local component state
- Refs for blob management and URL cleanup
- Custom hooks pattern for async operations (polling, generation)
- FormData for multipart file uploads

### Key Technical Considerations

#### Video Processing
- Supports both text-only and image+text video generation
- Handles multiple image input methods (file upload, generated image)
- Video trimming functionality using web APIs
- Automatic URL cleanup to prevent memory leaks

#### API Integration
- Uses `@google/genai` SDK for Gemini API integration
- Handles multipart form data for image uploads
- Base64 encoding for generated images
- Long-running operation polling pattern

#### File Management
- Blob references for original and trimmed videos
- Automatic cleanup of object URLs
- Download functionality with proper filename handling

## Configuration

### TypeScript Configuration
- Uses Next.js TypeScript setup with strict mode disabled
- Path aliases: `@/*` maps to project root
- Target ES2017 for compatibility

### Styling
- Tailwind CSS for utility-first styling
- Custom fonts: Manrope (main), Source Code Pro (monospace)
- Responsive design with mobile considerations

### Dependencies
Key packages:
- `@google/genai`: Official Google Generative AI SDK
- `react-dropzone`: File upload handling
- `react-player`: Video playback (with custom VideoPlayer wrapper)
- `rc-slider`: Range slider for video trimming
- `lucide-react`: Icon library

## Development Workflow

### Adding New Features
1. Check existing components for patterns
2. Follow the established state management approach
3. Use TypeScript with component prop interfaces
4. Implement proper cleanup for any blob/URL handling

### API Route Development
- Follow RESTful patterns used in existing routes
- Handle errors consistently with NextResponse.json
- Use FormData for file uploads
- Implement proper error logging

### Component Development
- Use functional components with hooks
- Implement proper TypeScript interfaces for props
- Follow existing naming conventions (PascalCase for components)
- Use Tailwind for styling consistency

## Troubleshooting

### Common Issues
- **Port conflicts**: Use `taskkill //PID <PID> //F` to kill processes on Windows
- **API key issues**: Ensure GEMINI_API_KEY is set and valid
- **Memory leaks**: Check for proper URL.revokeObjectURL calls
- **Polling failures**: Check network connectivity and API quotas

### Performance Considerations
- Video blobs are stored in refs to avoid re-renders
- Object URLs are cleaned up to prevent memory leaks
- Polling interval is optimized at 5 seconds
- Large video files may require streaming considerations