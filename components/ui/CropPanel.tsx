"use client";

import React from "react";

interface CropPanelProps {
  onApplyCrop: () => void;
  onSetAspect: (aspect: number | undefined) => void;
  isLoading: boolean;
  isCropping: boolean;
  currentAspect: number | undefined;
}

const CropPanel: React.FC<CropPanelProps> = ({ onApplyCrop, onSetAspect, isLoading, isCropping, currentAspect }) => {
  const aspectRatios = [
    { name: 'Free', value: undefined },
    { name: '1:1', value: 1 },
    { name: '4:3', value: 4 / 3 },
    { name: '16:9', value: 16 / 9 },
    { name: '3:2', value: 3 / 2 },
  ];

  return (
    <div className="w-full bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] rounded-xl p-6 flex flex-col gap-4">
      <h3 className="md-title-medium text-center" style={{ color: 'var(--md-sys-color-on-surface)' }}>
        Crop Image
      </h3>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <p className="md-body-medium" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
            Choose aspect ratio:
          </p>
          <div className="flex flex-wrap gap-2">
            {aspectRatios.map(ratio => {
              const isSelected = currentAspect === ratio.value;
              return (
                <button
                  key={ratio.name}
                  onClick={() => onSetAspect(ratio.value)}
                  className={`md-label-medium py-2 px-4 rounded-lg md-motion-standard border ${
                    isSelected
                      ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] border-[var(--md-sys-color-primary)]'
                      : 'bg-[var(--md-sys-color-surface-container-high)] border-[var(--md-sys-color-outline-variant)] text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-surface-container-highest)]'
                  }`}
                >
                  {ratio.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="text-center">
          <p className="md-body-medium mb-4" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
            {isCropping 
              ? 'Drag to adjust the crop area, then click Apply Crop.' 
              : 'Drag on the image above to select the area to crop.'
            }
          </p>

          {isCropping && (
            <button
              onClick={onApplyCrop}
              className="bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] md-label-large py-4 px-6 rounded-xl md-motion-emphasized md-elevation-1 disabled:bg-[var(--md-sys-color-surface-variant)] disabled:text-[var(--md-sys-color-on-surface-variant)] disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              Apply Crop
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CropPanel;