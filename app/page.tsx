"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Clock } from "lucide-react";
import Composer from "@/components/ui/Composer";
import VideoPlayer from "@/components/ui/VideoPlayer";
import ModeSelector from "@/components/ui/ModeSelector";
import StoryboardComposer from "@/components/ui/StoryboardComposer";
import PhotoEditor from "@/components/ui/PhotoEditor";
import AIEditor from "@/components/ui/AIEditor";
import HomeCanvas from "@/components/ui/HomeCanvas";
import { Scene, cleanupAllSceneUrls } from "@/lib/storyboard";

type VeoOperationName = string | null;

const POLL_INTERVAL_MS = 5000;

const VeoStudio: React.FC = () => {
  // Mode management
  const [mode, setMode] = useState<"single" | "storyboard" | "photo-editor" | "ai-editor" | "home-canvas">("photo-editor");
  
  // Single video state
  const [prompt, setPrompt] = useState(""); // Video prompt
  const [negativePrompt, setNegativePrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [selectedModel, setSelectedModel] = useState(
    "veo-3.0-generate-preview"
  );
  
  // Storyboard state
  const [scenes, setScenes] = useState<Scene[]>([]);

  // Imagen-specific prompt
  const [imagePrompt, setImagePrompt] = useState("");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagenBusy, setImagenBusy] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null); // data URL

  const [operationName, setOperationName] = useState<VeoOperationName>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const videoBlobRef = useRef<Blob | null>(null);
  const trimmedBlobRef = useRef<Blob | null>(null);
  const trimmedUrlRef = useRef<string | null>(null);
  const originalVideoUrlRef = useRef<string | null>(null);

  const [showImageTools, setShowImageTools] = useState(false);

  const canStart = useMemo(() => {
    if (!prompt.trim()) return false;
    if (showImageTools && !(imageFile || generatedImage)) return false;
    return true;
  }, [prompt, showImageTools, imageFile, generatedImage]);

  const resetAll = () => {
    // Reset single video state
    setPrompt("");
    setNegativePrompt("");
    setAspectRatio("16:9");
    setImagePrompt("");
    setImageFile(null);
    setGeneratedImage(null);
    setOperationName(null);
    setIsGenerating(false);
    setVideoUrl(null);
    if (videoBlobRef.current) {
      URL.revokeObjectURL(URL.createObjectURL(videoBlobRef.current));
      videoBlobRef.current = null;
    }
    if (trimmedUrlRef.current) {
      URL.revokeObjectURL(trimmedUrlRef.current);
      trimmedUrlRef.current = null;
    }
    trimmedBlobRef.current = null;
    
    // Reset storyboard state
    cleanupAllSceneUrls(scenes);
    setScenes([]);
  };

  // Imagen helper
  const generateWithImagen = useCallback(async () => {
    setImagenBusy(true);
    setGeneratedImage(null);
    try {
      const resp = await fetch("/api/imagen/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: imagePrompt }),
      });
      const json = await resp.json();
      if (json?.image?.imageBytes) {
        const dataUrl = `data:${json.image.mimeType};base64,${json.image.imageBytes}`;
        setGeneratedImage(dataUrl);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setImagenBusy(false);
    }
  }, [imagePrompt]);

  // Start Veo job
  const startGeneration = useCallback(async () => {
    if (!canStart) return;
    setIsGenerating(true);
    setVideoUrl(null);

    const form = new FormData();
    form.append("prompt", prompt);
    form.append("model", selectedModel);
    if (negativePrompt) form.append("negativePrompt", negativePrompt);
    if (aspectRatio) form.append("aspectRatio", aspectRatio);

    if (showImageTools) {
      if (imageFile) {
        form.append("imageFile", imageFile);
      } else if (generatedImage) {
        const [meta, b64] = generatedImage.split(",");
        const mime = meta?.split(";")?.[0]?.replace("data:", "") || "image/png";
        form.append("imageBase64", b64);
        form.append("imageMimeType", mime);
      }
    }

    try {
      const resp = await fetch("/api/veo/generate", {
        method: "POST",
        body: form,
      });
      const json = await resp.json();
      setOperationName(json?.name || null);
    } catch (e) {
      console.error(e);
      setIsGenerating(false);
    }
  }, [
    canStart,
    prompt,
    selectedModel,
    negativePrompt,
    aspectRatio,
    showImageTools,
    imageFile,
    generatedImage,
  ]);

  // Generate individual scene
  const generateScene = useCallback(async (sceneId: string) => {
    const scene = scenes.find(s => s.id === sceneId);
    if (!scene || !scene.imageFile || !scene.prompt.trim() || scene.isGenerating) return;

    // Update scene state to generating
    setScenes(prev => prev.map(s => 
      s.id === sceneId ? { ...s, isGenerating: true, operationName: null } : s
    ));

    const form = new FormData();
    form.append("prompt", scene.prompt);
    form.append("model", selectedModel);
    form.append("imageFile", scene.imageFile);
    // Use scene-specific aspect ratio
    form.append("aspectRatio", scene.aspectRatio);

    try {
      const resp = await fetch("/api/veo/generate", {
        method: "POST",
        body: form,
      });
      const json = await resp.json();
      
      // Update scene with operation name
      setScenes(prev => prev.map(s => 
        s.id === sceneId ? { ...s, operationName: json?.name || null } : s
      ));
    } catch (e) {
      console.error(e);
      setScenes(prev => prev.map(s => 
        s.id === sceneId ? { ...s, isGenerating: false } : s
      ));
    }
  }, [scenes, selectedModel]);

  // Poll operation until done then download
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    async function poll() {
      if (!operationName || videoUrl) return;
      try {
        const resp = await fetch("/api/veo/operation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: operationName }),
        });
        const fresh = await resp.json();
        if (fresh?.done) {
          const fileUri = fresh?.response?.generatedVideos?.[0]?.video?.uri;
          if (fileUri) {
            const dl = await fetch("/api/veo/download", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ uri: fileUri }),
            });
            const blob = await dl.blob();
            videoBlobRef.current = blob;
            const url = URL.createObjectURL(blob);
            setVideoUrl(url);
            originalVideoUrlRef.current = url;
          }
          setIsGenerating(false);
          return;
        }
      } catch (e) {
        console.error(e);
        setIsGenerating(false);
      } finally {
        timer = setTimeout(poll, POLL_INTERVAL_MS);
      }
    }
    if (operationName && !videoUrl) {
      timer = setTimeout(poll, POLL_INTERVAL_MS);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [operationName, videoUrl]);

  // Poll scenes operations
  useEffect(() => {
    const activeScenes = scenes.filter(s => s.operationName && s.isGenerating && !s.videoUrl);
    if (activeScenes.length === 0) return;

    const timers: ReturnType<typeof setTimeout>[] = [];

    activeScenes.forEach(scene => {
      const pollScene = async () => {
        try {
          const resp = await fetch("/api/veo/operation", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: scene.operationName }),
          });
          const fresh = await resp.json();
          
          if (fresh?.done) {
            const fileUri = fresh?.response?.generatedVideos?.[0]?.video?.uri;
            if (fileUri) {
              const dl = await fetch("/api/veo/download", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ uri: fileUri }),
              });
              const blob = await dl.blob();
              const url = URL.createObjectURL(blob);
              
              // Update scene with video
              setScenes(prev => prev.map(s => 
                s.id === scene.id ? {
                  ...s,
                  isGenerating: false,
                  videoBlobRef: blob,
                  videoUrl: url,
                  originalVideoUrlRef: url
                } : s
              ));
            } else {
              // Mark as failed
              setScenes(prev => prev.map(s => 
                s.id === scene.id ? { ...s, isGenerating: false } : s
              ));
            }
          } else {
            // Continue polling
            const timer = setTimeout(pollScene, POLL_INTERVAL_MS);
            timers.push(timer);
          }
        } catch (e) {
          console.error(e);
          setScenes(prev => prev.map(s => 
            s.id === scene.id ? { ...s, isGenerating: false } : s
          ));
        }
      };

      const timer = setTimeout(pollScene, POLL_INTERVAL_MS);
      timers.push(timer);
    });

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [scenes]);

  const onPickImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setImageFile(f);
      setGeneratedImage(null);
    }
  };

  const handleTrimmedOutput = (blob: Blob) => {
    trimmedBlobRef.current = blob; // likely webm
    if (trimmedUrlRef.current) {
      URL.revokeObjectURL(trimmedUrlRef.current);
    }
    trimmedUrlRef.current = URL.createObjectURL(blob);
    setVideoUrl(trimmedUrlRef.current);
  };

  const handleResetTrimState = () => {
    if (trimmedUrlRef.current) {
      URL.revokeObjectURL(trimmedUrlRef.current);
      trimmedUrlRef.current = null;
    }
    trimmedBlobRef.current = null;
    if (originalVideoUrlRef.current) {
      setVideoUrl(originalVideoUrlRef.current);
    }
  };

  const downloadVideo = async () => {
    const blob = trimmedBlobRef.current || videoBlobRef.current;
    if (!blob) return;
    const isTrimmed = !!trimmedBlobRef.current;
    const filename = isTrimmed ? "veo3_video_trimmed.webm" : "veo3_video.mp4";
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.style.display = "none";
    link.href = url;
    link.setAttribute("download", filename);
    link.setAttribute("rel", "noopener");
    link.target = "_self";
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 0);
  };

  return (
    <div className="relative min-h-screen w-full md-surface">
      <div className="fixed top-6 left-6 z-20 hidden md:block">
        <h1 className="md-headline-medium md-surface-container-high px-4 py-2 rounded-xl border border-[var(--md-sys-color-outline-variant)] md-elevation-2">
          Story Composer
        </h1>
      </div>
      <div className="fixed top-6 right-6 z-20 hidden md:block">
        <ModeSelector mode={mode} setMode={setMode} />
      </div>
      {/* Content Area */}
      {mode === "photo-editor" ? (
        <div className="min-h-screen pt-20">
          <PhotoEditor />
        </div>
      ) : mode === "ai-editor" ? (
        <div className="min-h-screen pt-20">
          <AIEditor />
        </div>
      ) : mode === "home-canvas" ? (
        <div className="min-h-screen pt-20">
          <HomeCanvas />
        </div>
      ) : mode === "single" ? (
        <div className="flex items-center justify-center min-h-screen pb-40 px-4">
          {!videoUrl &&
            (isGenerating ? (
              <div className="select-none inline-flex items-center gap-3 md-body-large" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
                <Clock className="w-5 h-5 animate-spin" style={{ color: 'var(--md-sys-color-primary)' }} />
                Generating Video...
              </div>
            ) : (
              <div className="select-none md-body-large" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
                Nothing to see here yet.
              </div>
            ))}
          {videoUrl && (
            <div className="w-full max-w-3xl">
              <VideoPlayer
                src={videoUrl}
                onOutputChanged={handleTrimmedOutput}
                onDownload={downloadVideo}
                onResetTrim={handleResetTrimState}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="min-h-screen pt-20 pb-6">
          <div className="w-full h-full flex flex-col">
            {/* Top Section - Storyboard Controls (Integrated) */}
            <div className="px-6 pb-6">
              <StoryboardComposer
                scenes={scenes}
                setScenes={setScenes}
                selectedModel={selectedModel}
                setSelectedModel={setSelectedModel}
                aspectRatio={aspectRatio}
                setAspectRatio={setAspectRatio}
                onGenerateScene={generateScene}
              />
            </div>
            
            {/* Bottom Section - Storyboard Grid (100% width) */}
            <div className="flex-1 px-6">
              {scenes.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <div className="select-none md-body-large text-center" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
                    Create your first scene to get started with your storyboard.
                  </div>
                </div>
              ) : (
                <div className="h-full overflow-y-auto">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 w-full">
                    {scenes.map((scene, index) => (
                      <div key={scene.id} className="aspect-video">
                        {scene.videoUrl ? (
                          <div className="relative h-full">
                            <video
                              src={scene.videoUrl}
                              className="w-full h-full object-cover rounded-xl"
                              controls
                              loop
                              muted
                            />
                            <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
                              Scene {index + 1}
                            </div>
                          </div>
                        ) : scene.isGenerating ? (
                          <div className="h-full flex items-center justify-center bg-[var(--md-sys-color-surface-container)] rounded-xl border border-[var(--md-sys-color-outline-variant)]">
                            <div className="text-center">
                              <Clock className="w-8 h-8 animate-spin mx-auto mb-2" style={{ color: 'var(--md-sys-color-primary)' }} />
                              <div className="md-body-medium" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
                                Scene {index + 1} Generating...
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="h-full flex items-center justify-center bg-[var(--md-sys-color-surface-variant)] rounded-xl border border-[var(--md-sys-color-outline-variant)]">
                            <div className="text-center" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
                              <div className="md-body-medium">Scene {index + 1}</div>
                              <div className="md-body-small">Ready to generate</div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {mode === "single" && (
        <Composer
          prompt={prompt}
          setPrompt={setPrompt}
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
          aspectRatio={aspectRatio}
          setAspectRatio={setAspectRatio}
          canStart={canStart}
          isGenerating={isGenerating}
          startGeneration={startGeneration}
          showImageTools={showImageTools}
          setShowImageTools={setShowImageTools}
          imagePrompt={imagePrompt}
          setImagePrompt={setImagePrompt}
          imagenBusy={imagenBusy}
          onPickImage={onPickImage}
          generateWithImagen={generateWithImagen}
          imageFile={imageFile}
          generatedImage={generatedImage}
          resetAll={resetAll}
        />
      )}
    </div>
  );
};

export default VeoStudio;
