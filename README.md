# Create Your Story

Create Your Story is a powerful video generation application that lets you bring your ideas to life through AI-powered video creation. Generate videos from text prompts, create videos from your images, or build complete storyboards with multiple scenes. Powered by advanced AI models including Veo 3 for video generation and Gemini 2.5 Flash Image for image creation.

![Example](./public/example.png)

> [!NOTE]  
> This application provides a modern, intuitive interface for AI video generation with advanced storyboard capabilities and Material 3 Expressive dark theme design.

## Features

- **Single Video Mode**: Generate individual videos from text prompts or images
- **Storyboard Mode**: Create multi-scene video projects with drag-and-drop organization
- **Image Generation**: Create custom images using Gemini 2.5 Flash Image (Nano Banana)
- **Video Editing**: Trim videos directly in the browser with custom timeline controls
- **Multiple Formats**: Support for various aspect ratios (16:9, 9:16, 1:1, 4:5, etc.)
- **Download & Export**: Save your generated videos and images
- **Modern UI**: Material 3 Expressive dark theme with responsive design

## Getting Started: Development and Local Testing

Follow these steps to get the application running locally for development and testing.

**1. Prerequisites:**

- Node.js and npm (or yarn/pnpm)
- **`GEMINI_API_KEY`**: The application requires a [Gemini API key](https://aistudio.google.com/app/apikey). Either create a `.env` file in the project root and add your API key: `GEMINI_API_KEY="YOUR_API_KEY"` or set the environment variable in your system.

> [!WARNING]  
> Veo 3 and Gemini 2.5 Flash Image require the Gemini API Paid tier. You will need to be on the paid tier to use these models.

**2. Install Dependencies:**

```bash
npm install
```

**3. Run Development Server:**

```bash
npm run dev
```

Open your browser and navigate to `http://localhost:3000` to see the application.

## Project Structure

The project is a Next.js application with the following key directories:

- `app/`: Contains the main application logic, including the user interface and API routes.
  - `api/`: API routes for generating videos and images, and checking operation status.
- `components/`: Reusable React components used throughout the application.
- `lib/`: Utility functions and schema definitions.
- `public/`: Static assets.

## How it Works

The application uses the following workflow:

1. **Input**: Text prompts, image uploads, or generated images
2. **Processing**: AI models generate content via secure API calls
3. **Streaming**: Real-time status updates during generation
4. **Output**: High-quality videos ready for playback and download

### API Routes

- `app/api/veo/generate/route.ts`: Handles video generation requests
- `app/api/veo/operation/route.ts`: Checks the status of video generation operations
- `app/api/veo/download/route.ts`: Downloads generated videos
- `app/api/imagen/generate/route.ts`: Handles image generation requests

## Technologies Used

- **Frontend**: [Next.js](https://nextjs.org/), [React](https://reactjs.org/), [Tailwind CSS](https://tailwindcss.com/)
- **AI Models**: Veo 3 for video generation, Gemini 2.5 Flash Image for image creation
- **UI Framework**: Material 3 Expressive design system with dark theme
- **Interactions**: Drag & drop, sortable lists, custom video controls

## Advanced Features

### Storyboard Mode
- Create multi-scene projects with individual prompts and images
- Drag and drop to reorder scenes
- Batch generation with progress tracking
- Individual scene management and editing

### Video Controls
- Custom timeline with trim functionality
- Play/pause, seeking, volume controls
- Export trimmed clips in browser
- Multiple download formats

### Responsive Design
- Mobile-optimized interface
- Adaptive grid layouts
- Touch-friendly controls
- Progressive web app capabilities

## Development

### Environment Variables
```bash
GEMINI_API_KEY="your-api-key-here"
```

### Scripts
```bash
npm run dev      # Start development server
npm run build    # Build for production  
npm run start    # Start production server
npm run lint     # Run ESLint
```

## License

This project is licensed under the Apache License 2.0.