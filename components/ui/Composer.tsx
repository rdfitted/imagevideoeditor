"use client";

import React from "react";
import {
  Upload,
  Wand2,
  Plus,
  ArrowRight,
  Loader2,
  RotateCcw,
} from "lucide-react";
import NextImage from "next/image";
import ModelSelector from "@/components/ui/ModelSelector";
import AspectRatioSelector from "@/components/ui/AspectRatioSelector";

interface ComposerProps {
  prompt: string;
  setPrompt: (value: string) => void;

  selectedModel: string;
  setSelectedModel: (model: string) => void;

  aspectRatio: string;
  setAspectRatio: (ratio: string) => void;

  canStart: boolean;
  isGenerating: boolean;
  startGeneration: () => void;

  showImageTools: boolean;
  setShowImageTools: React.Dispatch<React.SetStateAction<boolean>>;

  imagePrompt: string;
  setImagePrompt: (value: string) => void;

  imagenBusy: boolean;
  onPickImage: (e: React.ChangeEvent<HTMLInputElement>) => void;
  generateWithImagen: () => Promise<void> | void;

  imageFile: File | null;
  generatedImage: string | null;

  resetAll: () => void;
}

const Composer: React.FC<ComposerProps> = ({
  prompt,
  setPrompt,
  selectedModel,
  setSelectedModel,
  aspectRatio,
  setAspectRatio,
  canStart,
  isGenerating,
  startGeneration,
  showImageTools,
  setShowImageTools,
  imagePrompt,
  setImagePrompt,
  imagenBusy,
  onPickImage,
  generateWithImagen,
  imageFile,
  generatedImage,
  resetAll,
}) => {
  const [isDragging, setIsDragging] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleOpenFileDialog = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      onPickImage({
        target: { files },
      } as unknown as React.ChangeEvent<HTMLInputElement>);
    }
  };

  const handleReset = () => {
    resetAll();
    setShowImageTools(false);
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20 w-[min(100%,48rem)] px-4">
      {showImageTools && (
        <div className="mb-4 rounded-2xl md-surface-container-high border border-[var(--md-sys-color-outline-variant)] p-4 md-elevation-2">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <div
                className={`rounded-xl border-2 border-dashed p-6 cursor-pointer md-interactive transition-all duration-200 ${
                  isDragging
                    ? "border-[var(--md-sys-color-primary)] bg-[var(--md-sys-color-primary-container)]"
                    : "border-[var(--md-sys-color-outline)] hover:border-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-color-surface-container-high)]"
                }`}
                onClick={handleOpenFileDialog}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="flex items-center gap-4 text-[var(--md-sys-color-on-surface)]">
                  <Upload className="w-6 h-6" style={{ color: 'var(--md-sys-color-primary)' }} />
                  <div>
                    <div className="md-label-large">
                      Drag & drop an image, or click to upload
                    </div>
                    <div className="md-body-medium" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
                      PNG, JPG, WEBP up to 10MB
                    </div>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onPickImage}
                />
              </div>

              <div className="flex items-center gap-3 mt-4">
                <input
                  type="text"
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                  placeholder="Describe the starting photo to generate..."
                  className="flex-1 rounded-xl md-surface-container border border-[var(--md-sys-color-outline-variant)] px-4 py-3 md-body-large placeholder-[var(--md-sys-color-on-surface-variant)] focus:outline-none focus:ring-2 focus:ring-[var(--md-sys-color-primary)] focus:border-[var(--md-sys-color-primary)]"
                  style={{ backgroundColor: 'var(--md-sys-color-surface-container)', color: 'var(--md-sys-color-on-surface)' }}
                />
                <button
                  onClick={generateWithImagen}
                  disabled={!imagePrompt.trim() || imagenBusy}
                  aria-busy={imagenBusy}
                  className={`inline-flex items-center gap-2 px-4 py-3 rounded-xl md-interactive md-label-large transition-all duration-200 ${
                    !imagePrompt.trim() || imagenBusy
                      ? "opacity-60 cursor-not-allowed"
                      : "md-interactive cursor-pointer"
                  }`}
                  style={{
                    backgroundColor: !imagePrompt.trim() || imagenBusy ? 'var(--md-sys-color-surface-variant)' : 'var(--md-sys-color-primary)',
                    color: !imagePrompt.trim() || imagenBusy ? 'var(--md-sys-color-on-surface-variant)' : 'var(--md-sys-color-on-primary)'
                  }}
                >
                  {imagenBusy ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Wand2 className="w-5 h-5" />
                  )}
                  {imagenBusy ? "Generating" : "Generate"}
                </button>
              </div>
            </div>
            <div className="flex items-start justify-start">
              <div className="mt-2">
                {imageFile && (
                  <div className="md-body-medium" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
                    Selected: {imageFile.name}
                  </div>
                )}
                {!imageFile && generatedImage && (
                  <NextImage
                    src={generatedImage}
                    alt="Generated"
                    width={640}
                    height={360}
                    className="max-h-48 rounded-xl border border-[var(--md-sys-color-outline-variant)] w-auto h-auto"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="md-surface-container-highest border border-[var(--md-sys-color-outline-variant)] px-6 py-4 rounded-2xl md-elevation-3">
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            aria-pressed={showImageTools}
            onClick={() => setShowImageTools((s) => !s)}
            className={`inline-flex items-center gap-2 px-4 py-2 md-label-large rounded-xl md-interactive transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--md-sys-color-primary)] ${
              showImageTools
                ? "md-surface-container-high border border-[var(--md-sys-color-outline)]"
                : "hover:bg-[var(--md-sys-color-surface-container)]"
            }`}
            title="Image to Video"
            style={{
              backgroundColor: showImageTools ? 'var(--md-sys-color-surface-container-high)' : 'transparent',
              color: 'var(--md-sys-color-on-surface)'
            }}
          >
            <Plus className="w-5 h-5" />
            Image
          </button>

          <div className="flex items-center gap-3">
            <AspectRatioSelector
              selectedRatio={aspectRatio}
              onRatioChange={setAspectRatio}
              compact={true}
              dropdownDirection="up"
              forVideo={true}
              selectedModel={selectedModel}
            />
            <ModelSelector
              selectedModel={selectedModel}
              setSelectedModel={setSelectedModel}
            />
          </div>
        </div>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Generate a video with text and frames..."
          className="w-full bg-transparent focus:outline-none resize-none md-body-large"
          style={{ color: 'var(--md-sys-color-on-surface)' }}
          rows={2}
        />
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              className="h-12 w-12 flex items-center justify-center rounded-full md-interactive transition-all duration-200 border border-[var(--md-sys-color-outline-variant)]"
              style={{ backgroundColor: 'var(--md-sys-color-surface-container)' }}
              title="Reset"
            >
              <RotateCcw className="w-5 h-5" style={{ color: 'var(--md-sys-color-on-surface)' }} />
            </button>
          </div>
          <button
            onClick={startGeneration}
            disabled={!canStart || isGenerating}
            aria-busy={isGenerating}
            className={`h-12 w-12 flex items-center justify-center rounded-full md-interactive transition-all duration-200 ${
              !canStart || isGenerating
                ? "cursor-not-allowed opacity-60"
                : "cursor-pointer"
            }`}
            style={{
              backgroundColor: !canStart || isGenerating ? 'var(--md-sys-color-surface-variant)' : 'var(--md-sys-color-primary)',
              color: !canStart || isGenerating ? 'var(--md-sys-color-on-surface-variant)' : 'var(--md-sys-color-on-primary)'
            }}
            title="Generate"
          >
            {isGenerating ? (
              <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--md-sys-color-on-surface-variant)', borderTopColor: 'transparent' }} />
            ) : (
              <ArrowRight className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Composer;
