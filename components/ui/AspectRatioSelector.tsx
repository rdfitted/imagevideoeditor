"use client";

import React, { useState } from "react";
import { ChevronDown, Monitor, Smartphone, Square, Camera } from "lucide-react";

export interface AspectRatioOption {
  value: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  width: number;
  height: number;
}

export const ASPECT_RATIOS: AspectRatioOption[] = [
  {
    value: "16:9",
    label: "Widescreen",
    description: "YouTube, TV standard",
    icon: <Monitor className="w-4 h-4" />,
    width: 32,
    height: 18,
  },
  {
    value: "9:16", 
    label: "Portrait",
    description: "TikTok, Instagram Stories",
    icon: <Smartphone className="w-4 h-4" />,
    width: 18,
    height: 32,
  },
  {
    value: "1:1",
    label: "Square", 
    description: "Instagram posts",
    icon: <Square className="w-4 h-4" />,
    width: 24,
    height: 24,
  },
  {
    value: "4:5",
    label: "Instagram Feed",
    description: "Instagram feed posts",
    icon: <Camera className="w-4 h-4" />,
    width: 24,
    height: 30,
  },
  {
    value: "21:9",
    label: "Cinematic",
    description: "Ultra-wide, films",
    icon: <Monitor className="w-4 h-4" />,
    width: 42,
    height: 18,
  },
  {
    value: "4:3",
    label: "Classic TV",
    description: "Traditional broadcast",
    icon: <Monitor className="w-4 h-4" />,
    width: 32,
    height: 24,
  },
  {
    value: "2:3",
    label: "Pinterest",
    description: "Pinterest pins",
    icon: <Smartphone className="w-4 h-4" />,
    width: 20,
    height: 30,
  },
  {
    value: "3:4",
    label: "Mobile Feed",
    description: "Mobile-optimized content",
    icon: <Smartphone className="w-4 h-4" />,
    width: 24,
    height: 32,
  },
];

interface AspectRatioSelectorProps {
  selectedRatio: string;
  onRatioChange: (ratio: string) => void;
  compact?: boolean;
  dropdownDirection?: "up" | "down";
  forVideo?: boolean; // If true, only show Veo-supported ratios
  selectedModel?: string; // Model to determine supported ratios
}

const AspectRatioSelector: React.FC<AspectRatioSelectorProps> = ({
  selectedRatio,
  onRatioChange,
  compact = false,
  dropdownDirection = "down",
  forVideo = false,
  selectedModel,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Filter aspect ratios based on model capabilities
  const availableRatios = React.useMemo(() => {
    if (!forVideo) {
      return ASPECT_RATIOS; // For image generation, all ratios are available
    }
    
    // For video generation, filter based on model
    if (selectedModel?.includes("veo-2.0")) {
      // Veo 2 supports both 16:9 and 9:16
      return ASPECT_RATIOS.filter(r => r.value === "16:9" || r.value === "9:16");
    } else {
      // Veo 3 and Veo 3 Fast only support 16:9
      return ASPECT_RATIOS.filter(r => r.value === "16:9");
    }
  }, [forVideo, selectedModel]);
  
  const selectedOption = availableRatios.find(r => r.value === selectedRatio) || availableRatios[0];
  
  // Auto-switch to a valid ratio if current selection becomes unavailable
  React.useEffect(() => {
    if (forVideo && !availableRatios.find(r => r.value === selectedRatio)) {
      // Current ratio is not supported, switch to the first available
      onRatioChange(availableRatios[0]?.value || "16:9");
    }
  }, [availableRatios, selectedRatio, onRatioChange, forVideo]);

  if (compact) {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--md-sys-color-outline-variant)] md-label-medium transition-all duration-200 hover:bg-[var(--md-sys-color-surface-container)]"
          style={{ backgroundColor: 'var(--md-sys-color-surface-container)', color: 'var(--md-sys-color-on-surface)' }}
        >
          <div 
            className="border border-[var(--md-sys-color-outline)]"
            style={{ 
              width: `${selectedOption.width}px`, 
              height: `${selectedOption.height}px`,
              backgroundColor: 'var(--md-sys-color-primary)',
              maxWidth: '20px',
              maxHeight: '20px',
              transform: selectedOption.width > selectedOption.height ? 'scale(0.6)' : 'scale(0.8)'
            }}
          />
          <span>{selectedOption.label}</span>
          <ChevronDown className="w-4 h-4" />
        </button>

        {isOpen && (
          <div className={`absolute left-0 w-80 md-surface-container-high border border-[var(--md-sys-color-outline-variant)] rounded-xl md-elevation-2 py-2 z-50 max-h-96 overflow-y-auto shadow-lg ${
            dropdownDirection === "up" ? "bottom-full mb-1" : "top-full mt-1"
          }`}>
            {availableRatios.map((ratio) => (
              <button
                key={ratio.value}
                onClick={() => {
                  onRatioChange(ratio.value);
                  setIsOpen(false);
                }}
                className={`w-full px-3 py-2 text-left hover:bg-[var(--md-sys-color-surface-container)] transition-colors ${
                  ratio.value === selectedRatio ? 'bg-[var(--md-sys-color-surface-container)]' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="border border-[var(--md-sys-color-outline)] flex-shrink-0"
                    style={{ 
                      width: `${Math.min(ratio.width, 24)}px`, 
                      height: `${Math.min(ratio.height, 24)}px`,
                      backgroundColor: ratio.value === selectedRatio ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-surface-variant)',
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="md-label-medium truncate" style={{ color: 'var(--md-sys-color-on-surface)' }}>
                      {ratio.label} ({ratio.value})
                    </div>
                    <div className="md-body-small truncate" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
                      {ratio.description}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="md-label-large mb-3" style={{ color: 'var(--md-sys-color-on-surface)' }}>
        Aspect Ratio
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {availableRatios.map((ratio) => (
          <button
            key={ratio.value}
            onClick={() => onRatioChange(ratio.value)}
            className={`p-3 rounded-xl border-2 transition-all duration-200 ${
              ratio.value === selectedRatio
                ? 'border-[var(--md-sys-color-primary)] bg-[var(--md-sys-color-primary-container)]'
                : 'border-[var(--md-sys-color-outline-variant)] hover:border-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-color-surface-container)]'
            }`}
          >
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center justify-center w-12 h-12">
                <div 
                  className="border-2 border-[var(--md-sys-color-outline)]"
                  style={{ 
                    width: `${Math.min(ratio.width, 32)}px`, 
                    height: `${Math.min(ratio.height, 32)}px`,
                    backgroundColor: ratio.value === selectedRatio ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-surface-variant)',
                  }}
                />
              </div>
              <div className="text-center">
                <div className="md-label-small" style={{ 
                  color: ratio.value === selectedRatio 
                    ? 'var(--md-sys-color-on-primary-container)' 
                    : 'var(--md-sys-color-on-surface)' 
                }}>
                  {ratio.label}
                </div>
                <div className="md-body-small" style={{ 
                  color: ratio.value === selectedRatio 
                    ? 'var(--md-sys-color-on-primary-container)' 
                    : 'var(--md-sys-color-on-surface-variant)' 
                }}>
                  {ratio.value}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default AspectRatioSelector;