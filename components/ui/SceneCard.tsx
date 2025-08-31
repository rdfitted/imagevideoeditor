"use client";

import React, { useRef, useState } from "react";
import {
  Upload,
  X,
  GripVertical,
  Play,
  Clock,
  ArrowRight,
  Download,
  RotateCcw,
} from "lucide-react";
import NextImage from "next/image";
import { Scene } from "@/lib/storyboard";
import VideoPlayer from "./VideoPlayer";

interface SceneCardProps {
  scene: Scene;
  sceneIndex: number;
  onUpdateScene: (sceneId: string, updates: Partial<Scene>) => void;
  onRemoveScene: (sceneId: string) => void;
  onGenerateScene: (sceneId: string) => void;
  dragHandleProps?: any;
}

const SceneCard: React.FC<SceneCardProps> = ({
  scene,
  sceneIndex,
  onUpdateScene,
  onRemoveScene,
  onGenerateScene,
  dragHandleProps,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpdateScene(scene.id, { imageFile: file });
    }
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdateScene(scene.id, { prompt: e.target.value });
  };

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
      onUpdateScene(scene.id, { imageFile: files[0] });
    }
  };

  const canGenerate = scene.imageFile && scene.prompt.trim() && !scene.isGenerating;

  const handleTrimmedOutput = (blob: Blob) => {
    if (scene.trimmedUrlRef) {
      URL.revokeObjectURL(scene.trimmedUrlRef);
    }
    const trimmedUrl = URL.createObjectURL(blob);
    onUpdateScene(scene.id, {
      trimmedBlobRef: blob,
      trimmedUrlRef: trimmedUrl,
      videoUrl: trimmedUrl,
    });
  };

  const handleResetTrim = () => {
    if (scene.trimmedUrlRef) {
      URL.revokeObjectURL(scene.trimmedUrlRef);
    }
    onUpdateScene(scene.id, {
      trimmedBlobRef: null,
      trimmedUrlRef: null,
      videoUrl: scene.originalVideoUrlRef,
    });
  };

  const downloadVideo = () => {
    const blob = scene.trimmedBlobRef || scene.videoBlobRef;
    if (!blob) return;

    const isTrimmed = !!scene.trimmedBlobRef;
    const filename = isTrimmed
      ? `scene_${sceneIndex + 1}_trimmed.webm`
      : `scene_${sceneIndex + 1}.mp4`;

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
    <div className="md-surface-container-high border border-[var(--md-sys-color-outline-variant)] rounded-2xl p-4 md-elevation-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            {...dragHandleProps}
            className="cursor-grab active:cursor-grabbing p-1"
          >
            <GripVertical className="w-4 h-4" style={{ color: 'var(--md-sys-color-on-surface-variant)' }} />
          </div>
          <span className="md-title-medium" style={{ color: 'var(--md-sys-color-on-surface)' }}>
            Scene {sceneIndex + 1}
          </span>
        </div>
        <button
          onClick={() => onRemoveScene(scene.id)}
          className="p-2 rounded-full hover:bg-[var(--md-sys-color-surface-container)] transition-colors"
          title="Remove scene"
        >
          <X className="w-4 h-4" style={{ color: 'var(--md-sys-color-on-surface-variant)' }} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Image Upload Section */}
        <div>
          <div
            className={`rounded-xl border-2 border-dashed p-4 cursor-pointer transition-all duration-200 ${
              isDragging
                ? "border-[var(--md-sys-color-primary)] bg-[var(--md-sys-color-primary-container)]"
                : "border-[var(--md-sys-color-outline)] hover:border-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-color-surface-container)]"
            }`}
            onClick={handleOpenFileDialog}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {scene.imageFile ? (
              <div className="space-y-2">
                <NextImage
                  src={URL.createObjectURL(scene.imageFile)}
                  alt="Scene image"
                  width={400}
                  height={225}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <div className="md-body-small text-center" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
                  {scene.imageFile.name}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 py-8">
                <Upload className="w-8 h-8" style={{ color: 'var(--md-sys-color-primary)' }} />
                <div className="text-center">
                  <div className="md-label-large" style={{ color: 'var(--md-sys-color-on-surface)' }}>
                    Upload Image
                  </div>
                  <div className="md-body-small" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
                    Required for scene
                  </div>
                </div>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </div>
        </div>

        {/* Prompt and Controls Section */}
        <div className="space-y-4">
          <textarea
            value={scene.prompt}
            onChange={handlePromptChange}
            placeholder="Describe what happens in this scene..."
            className="w-full rounded-xl md-surface-container border border-[var(--md-sys-color-outline-variant)] px-4 py-3 md-body-large placeholder-[var(--md-sys-color-on-surface-variant)] focus:outline-none focus:ring-2 focus:ring-[var(--md-sys-color-primary)] focus:border-[var(--md-sys-color-primary)] resize-none"
            style={{ backgroundColor: 'var(--md-sys-color-surface-container)', color: 'var(--md-sys-color-on-surface)' }}
            rows={3}
          />

          <div className="flex items-center justify-between">
            <div>
              {scene.isGenerating && (
                <div className="flex items-center gap-2 md-body-small" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
                  <Clock className="w-4 h-4 animate-spin" style={{ color: 'var(--md-sys-color-primary)' }} />
                  Generating...
                </div>
              )}
            </div>
            <button
              onClick={() => onGenerateScene(scene.id)}
              disabled={!canGenerate}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl md-label-large transition-all duration-200 ${
                !canGenerate
                  ? "opacity-60 cursor-not-allowed"
                  : "cursor-pointer"
              }`}
              style={{
                backgroundColor: !canGenerate ? 'var(--md-sys-color-surface-variant)' : 'var(--md-sys-color-primary)',
                color: !canGenerate ? 'var(--md-sys-color-on-surface-variant)' : 'var(--md-sys-color-on-primary)'
              }}
            >
              {scene.isGenerating ? (
                <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
              Generate
            </button>
          </div>
        </div>
      </div>

      {/* Video Preview Section */}
      {scene.videoUrl && (
        <div className="mt-4 pt-4 border-t border-[var(--md-sys-color-outline-variant)]">
          <div className="flex items-center justify-between mb-3">
            <span className="md-label-large" style={{ color: 'var(--md-sys-color-on-surface)' }}>
              Generated Video
            </span>
            <div className="flex items-center gap-2">
              {scene.trimmedBlobRef && (
                <button
                  onClick={handleResetTrim}
                  className="p-2 rounded-full hover:bg-[var(--md-sys-color-surface-container)] transition-colors"
                  title="Reset trim"
                >
                  <RotateCcw className="w-4 h-4" style={{ color: 'var(--md-sys-color-on-surface-variant)' }} />
                </button>
              )}
              <button
                onClick={downloadVideo}
                className="p-2 rounded-full hover:bg-[var(--md-sys-color-surface-container)] transition-colors"
                title="Download video"
              >
                <Download className="w-4 h-4" style={{ color: 'var(--md-sys-color-on-surface-variant)' }} />
              </button>
            </div>
          </div>
          <VideoPlayer
            src={scene.videoUrl}
            onOutputChanged={handleTrimmedOutput}
            onDownload={downloadVideo}
            onResetTrim={handleResetTrim}
          />
        </div>
      )}
    </div>
  );
};

export default SceneCard;