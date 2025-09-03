"use client";

import React from "react";
import { Video, Film, ImageIcon, Wand2, Home } from "lucide-react";

interface ModeSelectorProps {
  mode: "single" | "storyboard" | "photo-editor" | "ai-editor" | "home-canvas";
  setMode: (mode: "single" | "storyboard" | "photo-editor" | "ai-editor" | "home-canvas") => void;
}

const ModeSelector: React.FC<ModeSelectorProps> = ({ mode, setMode }) => {
  return (
    <div className="flex items-center bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] rounded-xl p-1">
      <button
        onClick={() => setMode("photo-editor")}
        className={`flex items-center justify-center w-12 h-10 rounded-lg transition-all duration-200 ${
          mode === "photo-editor"
            ? "bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)]"
            : "text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)]"
        }`}
        title="Photo Editor"
      >
        <ImageIcon className="w-5 h-5" />
      </button>
      <button
        onClick={() => setMode("ai-editor")}
        className={`flex items-center justify-center w-12 h-10 rounded-lg transition-all duration-200 ${
          mode === "ai-editor"
            ? "bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)]"
            : "text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)]"
        }`}
        title="AI Editor"
      >
        <Wand2 className="w-5 h-5" />
      </button>
      <button
        onClick={() => setMode("home-canvas")}
        className={`flex items-center justify-center w-12 h-10 rounded-lg transition-all duration-200 ${
          mode === "home-canvas"
            ? "bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)]"
            : "text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)]"
        }`}
        title="Home Canvas"
      >
        <Home className="w-5 h-5" />
      </button>
      <button
        onClick={() => setMode("single")}
        className={`flex items-center justify-center w-12 h-10 rounded-lg transition-all duration-200 ${
          mode === "single"
            ? "bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)]"
            : "text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)]"
        }`}
        title="Single Video"
      >
        <Video className="w-5 h-5" />
      </button>
      <button
        onClick={() => setMode("storyboard")}
        className={`flex items-center justify-center w-12 h-10 rounded-lg transition-all duration-200 ${
          mode === "storyboard"
            ? "bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)]"
            : "text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)]"
        }`}
        title="Storyboard"
      >
        <Film className="w-5 h-5" />
      </button>
    </div>
  );
};

export default ModeSelector;