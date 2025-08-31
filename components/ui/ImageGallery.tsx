"use client";

import React, { useRef } from "react";
import { Upload, X, Plus } from "lucide-react";
import NextImage from "next/image";

export interface UploadedImage {
  id: string;
  file: File;
  dataUrl: string;
  name: string;
}

interface ImageGalleryProps {
  images: UploadedImage[];
  maxImages?: number;
  onImagesChange: (images: UploadedImage[]) => void;
  className?: string;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  maxImages = 50,
  onImagesChange,
  className = ""
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const newImages: UploadedImage[] = [];
    const remainingSlots = maxImages - images.length;
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
            onImagesChange([...images, ...newImages]);
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

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const removeImage = (imageId: string) => {
    const updatedImages = images.filter(img => img.id !== imageId);
    onImagesChange(updatedImages);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const canAddMore = images.length < maxImages;

  return (
    <div className={`${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="md-label-large" style={{ color: 'var(--md-sys-color-on-surface)' }}>
          Reference Images
        </div>
        <div className="md-body-small" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
          {images.length}/{maxImages}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {images.map((image) => (
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
              <X className="w-3 h-3" />
            </button>
            <div className="absolute bottom-1 left-1 right-1 bg-black/70 text-white text-xs px-2 py-1 rounded truncate opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {image.name}
            </div>
          </div>
        ))}

        {canAddMore && (
          <div
            className={`aspect-square rounded-lg border-2 border-dashed cursor-pointer transition-all duration-200 flex flex-col items-center justify-center ${
              isDragging
                ? "border-[var(--md-sys-color-primary)] bg-[var(--md-sys-color-primary-container)]"
                : "border-[var(--md-sys-color-outline)] hover:border-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-color-surface-container-high)]"
            }`}
            onClick={openFileDialog}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="text-center">
              {isDragging ? (
                <Upload className="w-6 h-6 mx-auto mb-1" style={{ color: 'var(--md-sys-color-primary)' }} />
              ) : (
                <Plus className="w-6 h-6 mx-auto mb-1" style={{ color: 'var(--md-sys-color-on-surface-variant)' }} />
              )}
              <div className="md-body-small" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
                {isDragging ? "Drop here" : "Add image"}
              </div>
            </div>
          </div>
        )}
      </div>

      {images.length === 0 && (
        <div 
          className={`mt-4 p-6 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 ${
            isDragging
              ? "border-[var(--md-sys-color-primary)] bg-[var(--md-sys-color-primary-container)]"
              : "border-[var(--md-sys-color-outline)] hover:border-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-color-surface-container-high)]"
          }`}
          onClick={openFileDialog}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="text-center">
            <Upload className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--md-sys-color-primary)' }} />
            <div className="md-label-large mb-1" style={{ color: 'var(--md-sys-color-on-surface)' }}>
              Upload reference images
            </div>
            <div className="md-body-medium" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
              Drag & drop or click to add up to {maxImages} images for context
            </div>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileInputChange}
      />
    </div>
  );
};

export default ImageGallery;