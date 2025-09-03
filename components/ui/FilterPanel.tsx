"use client";

import React, { useState } from "react";

interface FilterPanelProps {
  onApplyFilter: (prompt: string) => void;
  isLoading: boolean;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ onApplyFilter, isLoading }) => {
  const [selectedPresetPrompt, setSelectedPresetPrompt] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');

  const presets = [
    { name: 'Synthwave', prompt: 'Apply a vibrant 80s synthwave aesthetic with neon magenta and cyan glows, and subtle scan lines.' },
    { name: 'Anime', prompt: 'Give the image a vibrant Japanese anime style, with bold outlines, cel-shading, and saturated colors.' },
    { name: 'Lomo', prompt: 'Apply a Lomography-style cross-processing film effect with high-contrast, oversaturated colors, and dark vignetting.' },
    { name: 'Glitch', prompt: 'Transform the image into a futuristic holographic projection with digital glitch effects and chromatic aberration.' },
  ];

  const activePrompt = selectedPresetPrompt || customPrompt;

  const handlePresetClick = (prompt: string) => {
    setSelectedPresetPrompt(prompt);
    setCustomPrompt('');
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomPrompt(e.target.value);
    setSelectedPresetPrompt(null);
  };

  const handleApply = () => {
    if (activePrompt) {
      onApplyFilter(activePrompt);
    }
  };

  return (
    <div className="w-full bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] rounded-xl p-6 flex flex-col gap-4">
      <h3 className="md-title-medium text-center" style={{ color: 'var(--md-sys-color-on-surface)' }}>
        Apply a Filter
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {presets.map(preset => (
          <button
            key={preset.name}
            onClick={() => handlePresetClick(preset.prompt)}
            disabled={isLoading}
            className={`w-full text-center bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)] md-label-large py-3 px-4 rounded-xl md-motion-standard hover:bg-[var(--md-sys-color-surface-container-highest)] disabled:opacity-50 disabled:cursor-not-allowed ${
              selectedPresetPrompt === preset.prompt 
                ? 'ring-2 ring-[var(--md-sys-color-primary)] bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]' 
                : 'text-[var(--md-sys-color-on-surface)]'
            }`}
          >
            {preset.name}
          </button>
        ))}
      </div>

      <input
        type="text"
        value={customPrompt}
        onChange={handleCustomChange}
        placeholder="Or describe a custom filter (e.g., '80s synthwave glow')"
        className="flex-grow bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)] rounded-xl p-4 md-body-large focus:ring-2 focus:ring-[var(--md-sys-color-primary)] focus:outline-none md-motion-standard disabled:cursor-not-allowed disabled:opacity-60"
        style={{ color: 'var(--md-sys-color-on-surface)' }}
        disabled={isLoading}
      />

      {activePrompt && (
        <div className="flex flex-col gap-4 pt-2">
          <button
            onClick={handleApply}
            className="w-full bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] md-label-large py-4 px-6 rounded-xl md-motion-emphasized md-elevation-1 disabled:bg-[var(--md-sys-color-surface-variant)] disabled:text-[var(--md-sys-color-on-surface-variant)] disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
            disabled={isLoading || !activePrompt.trim()}
          >
            Apply Filter
          </button>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;