"use client";

import React from "react";

interface RetouchPanelProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  editHotspot: { x: number, y: number } | null;
  isLoading: boolean;
  onGenerate: () => void;
}

const RetouchPanel: React.FC<RetouchPanelProps> = ({
  prompt,
  setPrompt,
  editHotspot,
  isLoading,
  onGenerate
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate();
  };

  return (
    <div className="w-full bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] rounded-xl p-6 flex flex-col gap-4">
      <div className="text-center">
        <h3 className="md-title-medium mb-2" style={{ color: 'var(--md-sys-color-on-surface)' }}>
          Localized AI Editing
        </h3>
        <p className="md-body-medium" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
          {editHotspot 
            ? 'Great! Now describe your localized edit below.' 
            : 'Click an area on the image to make a precise edit.'
          }
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full flex items-center gap-3">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={editHotspot ? "e.g., 'change my shirt color to blue'" : "First click a point on the image"}
          className="flex-grow bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)] rounded-xl p-4 md-body-large focus:ring-2 focus:ring-[var(--md-sys-color-primary)] focus:outline-none md-motion-standard disabled:cursor-not-allowed disabled:opacity-60"
          style={{ color: 'var(--md-sys-color-on-surface)' }}
          disabled={isLoading || !editHotspot}
        />
        <button
          type="submit"
          className="bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] md-label-large py-4 px-6 rounded-xl md-motion-emphasized md-elevation-1 disabled:bg-[var(--md-sys-color-surface-variant)] disabled:text-[var(--md-sys-color-on-surface-variant)] disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
          disabled={isLoading || !prompt.trim() || !editHotspot}
        >
          Generate
        </button>
      </form>
    </div>
  );
};

export default RetouchPanel;