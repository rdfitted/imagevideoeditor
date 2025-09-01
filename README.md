# Image & Video Editor

A comprehensive AI-powered creative platform that combines advanced photo editing with professional video generation. Create, edit, and enhance images using Gemini 2.5 Flash's multi-image capabilities, then generate stunning videos with Veo 3 - all in one seamless interface.

> [!NOTE]  
> This application features three distinct creative modes with a modern Material 3 Expressive design system, providing professional-grade tools for content creators, designers, and storytellers.

## 🎨 Three Creative Modes

### 1. **Photo Editor** (Primary Mode)
- **Multi-Image Chat Interface**: Upload up to 50 reference images for context
- **Iterative Editing**: Conversational workflow for step-by-step image refinement
- **Character Consistency**: Maintain subjects and styles across generations
- **Advanced Prompting**: Leverage Gemini 2.5 Flash's full 3,600 image API capability
- **Download Management**: Save all generated variations with timestamps

### 2. **Single Video Generation**
- **Text-to-Video**: Create videos from detailed text descriptions
- **Image-to-Video**: Transform static images into dynamic video content
- **Custom Aspect Ratios**: Support for 16:9, 9:16, 1:1, 4:5, and more
- **Timeline Editor**: Trim videos with precision using browser-based tools

### 3. **Storyboard Mode**
- **Multi-Scene Projects**: Create complex video narratives with multiple scenes
- **Drag & Drop Organization**: Reorder scenes with intuitive interface
- **Batch Generation**: Process multiple scenes with progress tracking
- **Scene Management**: Individual prompts and settings per scene

## 🚀 Quick Start Guide

### Prerequisites

- **Node.js** (version 18 or higher) and **npm**
- **Gemini API Key** (Paid tier required) from [AI Studio](https://aistudio.google.com/app/apikey)

> [!WARNING]  
> **Paid Tier Required**: Veo 3 video generation and Gemini 2.5 Flash image editing require the Gemini API Paid tier.

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/rdfitted/storycomposer.git
   cd storycomposer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the project root:
   ```bash
   GEMINI_API_KEY="your-gemini-api-key-here"
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

### 🎯 Getting Started with Each Mode

#### Photo Editor Mode
1. **Upload Reference Images**: Click "Images" button to add up to 50 context images
2. **Start Chatting**: Describe what you want to create or edit
3. **Iterate & Refine**: Continue the conversation to refine your images
4. **Download Results**: Click download buttons on generated images

#### Single Video Mode
1. **Add Image (Optional)**: Click "Image" to upload a reference image
2. **Write Prompt**: Describe your video in the text area
3. **Configure Settings**: Choose aspect ratio and model
4. **Generate**: Click the arrow button to start video generation
5. **Edit & Download**: Use timeline controls to trim and download

#### Storyboard Mode
1. **Create Scenes**: Click "Add Scene" to start building your storyboard
2. **Upload Images**: Add reference images for each scene
3. **Write Prompts**: Describe each scene's action
4. **Generate All**: Click "Generate All Scenes" for batch processing
5. **Organize**: Drag and drop to reorder your final storyboard

## 🛠️ Technical Overview

### Architecture

Built with **Next.js 15** and **React 19**, featuring:
- **Server-Side API Routes** for secure AI model integration
- **Real-time Polling** for operation status updates  
- **Client-Side State Management** for complex UI interactions
- **Material 3 Design System** with custom Tailwind CSS implementation

### API Routes

```
app/api/
├── photo-editor/generate/     # Multi-image chat generation
├── veo/generate/             # Video generation initiation  
├── veo/operation/            # Operation status polling
├── veo/download/             # Secure video download
└── imagen/generate/          # Single image generation
```

### Key Components

```
components/ui/
├── PhotoEditor.tsx           # Main photo editing interface
├── PhotoEditorComposer.tsx   # Multi-image upload & chat input
├── ChatMessage.tsx           # Conversation message display
├── VideoPlayer.tsx           # Custom video player with timeline
├── ModeSelector.tsx          # Tab navigation component
└── StoryboardComposer.tsx    # Multi-scene project manager
```

### Data Flow

1. **User Input** → FormData with images/prompts
2. **API Processing** → Gemini/Veo model generation
3. **Status Polling** → Real-time progress updates
4. **Content Delivery** → Base64/blob URL responses
5. **User Download** → Direct file save capabilities

## 🔧 Technologies & Dependencies

### Core Stack
- **[Next.js 15](https://nextjs.org/)** - Full-stack React framework
- **[React 19](https://reactjs.org/)** - Modern UI library with latest features
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe development
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first styling

### AI Integration
- **[Google Gemini API](https://ai.google.dev/)** - Advanced AI model access
- **Veo 3** - State-of-the-art video generation
- **Gemini 2.5 Flash** - Multi-modal image processing

### UI Components & Interactions
- **[Lucide React](https://lucide.dev/)** - Beautiful icon library
- **[React Player](https://github.com/cookpete/react-player)** - Video playbook components
- **[RC Slider](https://slider-react-component.vercel.app/)** - Timeline controls
- **[React Dropzone](https://react-dropzone.js.org/)** - File upload handling

## ⚡ Performance Features

- **Lazy Loading** - Components and images load on demand
- **Memory Management** - Automatic cleanup of blob URLs and file references
- **Progressive Enhancement** - Works across all modern browsers
- **Responsive Design** - Mobile-first approach with desktop optimization
- **Real-time Updates** - Live status polling with optimized intervals

## 🚀 Development Commands

```bash
# Development
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Create production build
npm run start    # Start production server
npm run lint     # Run ESLint for code quality

# Environment Setup
echo 'GEMINI_API_KEY="your-api-key-here"' > .env
```

## 🛡️ Security & Best Practices

- **Input Validation** - Comprehensive server-side validation
- **File Type Restrictions** - Only allows safe image formats
- **Size Limits** - 10MB per file, 50 files maximum
- **Environment Variables** - Secure API key management
- **Error Handling** - Graceful error responses without data exposure

## 📝 Attribution

This project builds upon the [Google Gemini Veo 3 API Quickstart](https://github.com/google-gemini/veo-3-gemini-api-quickstart) and includes substantial enhancements for photo editing capabilities.

For more information, visit [fitted-automation.com](https://fitted-automation.com/).

## 📄 License

This project is licensed under the Apache License 2.0.