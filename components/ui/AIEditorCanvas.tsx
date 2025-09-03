"use client";

import React from "react";
import ReactCrop, { type Crop, type PixelCrop } from "react-image-crop";

interface AIEditorCanvasProps {
  currentImageUrl: string;
  originalImageUrl: string | null;
  activeTab: string;
  isLoading: boolean;
  isComparing: boolean;
  displayHotspot: { x: number, y: number } | null;
  onImageClick: (e: React.MouseEvent<HTMLImageElement>) => void;
  imgRef: React.RefObject<HTMLImageElement>;
  crop: Crop | undefined;
  setCrop: (crop: Crop | undefined) => void;
  setCompletedCrop: (crop: PixelCrop | undefined) => void;
  aspect: number | undefined;
}

const AIEditorCanvas: React.FC<AIEditorCanvasProps> = ({
  currentImageUrl,
  originalImageUrl,
  activeTab,
  isLoading,
  isComparing,
  displayHotspot,
  onImageClick,
  imgRef,
  crop,
  setCrop,
  setCompletedCrop,
  aspect
}) => {
  const imageDisplay = (
    <div className="relative">
      {/* Base image is the original, always at the bottom */}
      {originalImageUrl && (
        <img
          key={originalImageUrl}
          src={originalImageUrl}
          alt="Original"
          className="w-full h-auto object-contain max-h-[60vh] rounded-xl pointer-events-none"
        />
      )}
      {/* The current image is an overlay that fades in/out for comparison */}
      <img
        ref={imgRef}
        key={currentImageUrl}
        src={currentImageUrl}
        alt="Current"
        onClick={onImageClick}
        className={`absolute top-0 left-0 w-full h-auto object-contain max-h-[60vh] rounded-xl md-motion-standard ${
          isComparing ? 'opacity-0' : 'opacity-100'
        } ${
          activeTab === 'retouch' ? 'cursor-crosshair' : 'cursor-default'
        }`}
      />
    </div>
  );

  // For ReactCrop, we need a single image element. We'll use the current one.
  const cropImageElement = (
    <img
      ref={imgRef}
      key={`crop-${currentImageUrl}`}
      src={currentImageUrl}
      alt="Crop this image"
      className="w-full h-auto object-contain max-h-[60vh] rounded-xl"
    />
  );

  return (
    <div className="relative w-full md-surface-container-high rounded-xl md-elevation-2 overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 bg-black/50 z-30 flex flex-col items-center justify-center gap-4">
          <div className="w-8 h-8 border-2 border-[var(--md-sys-color-primary)] border-t-transparent rounded-full animate-spin"></div>
          <p className="md-body-medium" style={{ color: 'var(--md-sys-color-on-surface)' }}>
            Processing...
          </p>
        </div>
      )}

      {activeTab === 'crop' ? (
        <ReactCrop
          crop={crop}
          onChange={(c) => setCrop(c)}
          onComplete={(c) => setCompletedCrop(c)}
          aspect={aspect}
          className="max-h-[60vh]"
        >
          {cropImageElement}
        </ReactCrop>
      ) : (
        imageDisplay
      )}

      {displayHotspot && !isLoading && activeTab === 'retouch' && (
        <div
          className="absolute rounded-full w-6 h-6 border-2 border-[var(--md-sys-color-primary)] pointer-events-none -translate-x-1/2 -translate-y-1/2 z-10"
          style={{
            left: `${displayHotspot.x}px`,
            top: `${displayHotspot.y}px`,
            backgroundColor: 'color-mix(in oklab, var(--md-sys-color-primary), transparent 70%)'
          }}
        >
          <div 
            className="absolute inset-0 rounded-full w-6 h-6 animate-ping"
            style={{ backgroundColor: 'var(--md-sys-color-primary)' }}
          ></div>
        </div>
      )}
    </div>
  );
};

export default AIEditorCanvas;