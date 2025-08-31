"use client";

import React from "react";
import { Video, Film, ImageIcon } from "lucide-react";

interface ModeSelectorProps {
  mode: "single" | "storyboard" | "photo-editor";
  setMode: (mode: "single" | "storyboard" | "photo-editor") => void;
}

const ModeSelector: React.FC<ModeSelectorProps> = ({ mode, setMode }) => {
  return (
    <div className="flex items-center bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] rounded-xl p-1">
      <button
        onClick={() => setMode("photo-editor")}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg md-label-large transition-all duration-200 ${
          mode === "photo-editor"
            ? "bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)]"
            : "text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)]"
        }`}
      >
        <ImageIcon className="w-4 h-4" />
        Photo Editor
      </button>
      <button
        onClick={() => setMode("single")}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg md-label-large transition-all duration-200 ${
          mode === "single"
            ? "bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)]"
            : "text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)]"
        }`}
      >
        <Video className="w-4 h-4" />
        Single Video
      </button>
      <button
        onClick={() => setMode("storyboard")}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg md-label-large transition-all duration-200 ${
          mode === "storyboard"
            ? "bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)]"
            : "text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)]"
        }`}
      >
        <Film className="w-4 h-4" />
        Storyboard
      </button>
    </div>
  );
};

export default ModeSelector;