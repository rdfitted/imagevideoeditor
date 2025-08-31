"use client";

import React from "react";
import {
  Upload,
  Plus,
  ArrowRight,
  Loader2,
  RotateCcw,
} from "lucide-react";
import NextImage from "next/image";
import { UploadedImage } from "./ImageGallery";

interface PhotoEditorComposerProps {
  prompt: string;
  setPrompt: (value: string) => void;

  referenceImages: UploadedImage[];
  setReferenceImages: (images: UploadedImage[]) => void;

  canGenerate: boolean;
  isGenerating: boolean;
  generateImage: () => void;

  resetAll: () => void;
}

const PhotoEditorComposer: React.FC<PhotoEditorComposerProps> = ({
  prompt,
  setPrompt,
  referenceImages,
  setReferenceImages,
  canGenerate,
  isGenerating,
  generateImage,
  resetAll,
}) => {
  const [showImageTools, setShowImageTools] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const newImages: UploadedImage[] = [];
    const remainingSlots = 50 - referenceImages.length; // Reasonable UI limit (API allows 3,600)
    const filesToProcess = Math.min(files.length, remainingSlots);

    for (let i = 0; i < filesToProcess; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target?.result as string;
          const newImage: UploadedImage = {
            id: `${Date.now()}-${i}`,
            file,
            dataUrl,
            name: file.name
          };
          
          newImages.push(newImage);
          
          // Update images when all files are processed
          if (newImages.length === filesToProcess) {
            setReferenceImages([...referenceImages, ...newImages]);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
    // Reset the input so same file can be selected again
    if (e.target) e.target.value = '';
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
    handleFileSelect(e.dataTransfer.files);
  };

  const handleOpenFileDialog = () => {
    fileInputRef.current?.click();
  };

  const removeImage = (imageId: string) => {
    const updatedImages = referenceImages.filter(img => img.id !== imageId);
    setReferenceImages(updatedImages);
  };

  const handleReset = () => {
    resetAll();
    setShowImageTools(false);
  };

  const canAddMore = referenceImages.length < 50;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20 w-[min(100%,48rem)] px-4">
      {showImageTools && (
        <div className="mb-4 rounded-2xl md-surface-container-high border border-[var(--md-sys-color-outline-variant)] p-4 md-elevation-2">
          <div className="grid grid-cols-1 gap-4">
            <div>
              {/* Multi-image upload area */}
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
                      Drag & drop reference images, or click to upload
                    </div>
                    <div className="md-body-medium" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
                      PNG, JPG, WEBP up to 10MB (up to 50 images for context)
                    </div>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileInputChange}
                />
              </div>
            </div>

            {/* Display uploaded reference images */}
            {referenceImages.length > 0 && (
              <div className="flex items-start justify-start">
                <div className="grid grid-cols-3 gap-3 w-full">
                  {referenceImages.map((image) => (
                    <div key={image.id} className="relative group aspect-square">
                      <NextImage
                        src={image.dataUrl}
                        alt={image.name}
                        width={120}
                        height={120}
                        className="w-full h-full object-cover rounded-lg border border-[var(--md-sys-color-outline-variant)]"
                      />
                      <button
                        onClick={() => removeImage(image.id)}
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[var(--md-sys-color-error)] text-[var(--md-sys-color-on-error)] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:scale-110"
                        title="Remove image"
                      >
                        ×
                      </button>
                      <div className="absolute bottom-1 left-1 right-1 bg-black/70 text-white text-xs px-2 py-1 rounded truncate opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        {image.name}
                      </div>
                    </div>
                  ))}
                  {canAddMore && (
                    <div
                      className="aspect-square rounded-lg border-2 border-dashed cursor-pointer transition-all duration-200 flex flex-col items-center justify-center border-[var(--md-sys-color-outline)] hover:border-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-color-surface-container-high)]"
                      onClick={handleOpenFileDialog}
                    >
                      <Plus className="w-6 h-6 mb-1" style={{ color: 'var(--md-sys-color-on-surface-variant)' }} />
                      <div className="md-body-small text-center" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
                        Add more
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {referenceImages.length > 0 && (
              <div className="p-3 rounded-lg bg-[var(--md-sys-color-primary-container)]">
                <p className="md-body-small" style={{ color: 'var(--md-sys-color-on-primary-container)' }}>
                  💡 Reference images provide context for your edits. The AI will maintain character consistency across generations.
                </p>
              </div>
            )}
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
            title="Reference Images"
            style={{
              backgroundColor: showImageTools ? 'var(--md-sys-color-surface-container-high)' : 'transparent',
              color: 'var(--md-sys-color-on-surface)'
            }}
          >
            <Plus className="w-5 h-5" />
            Images ({referenceImages.length})
          </button>

          <div className="flex items-center gap-3">
            <div className="md-body-small" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
              Photo Editor
            </div>
          </div>
        </div>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the image you want to create or edits you want to make..."
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
            onClick={generateImage}
            disabled={!canGenerate || isGenerating}
            aria-busy={isGenerating}
            className={`h-12 w-12 flex items-center justify-center rounded-full md-interactive transition-all duration-200 ${
              !canGenerate || isGenerating
                ? "cursor-not-allowed opacity-60"
                : "cursor-pointer"
            }`}
            style={{
              backgroundColor: !canGenerate || isGenerating ? 'var(--md-sys-color-surface-variant)' : 'var(--md-sys-color-primary)',
              color: !canGenerate || isGenerating ? 'var(--md-sys-color-on-surface-variant)' : 'var(--md-sys-color-on-primary)'
            }}
            title="Generate"
          >
            {isGenerating ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <ArrowRight className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PhotoEditorComposer;