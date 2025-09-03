"use client";

import React from "react";
import { Undo2, Redo2, Eye, RotateCcw, Upload, Download } from "lucide-react";

interface AIEditorHistoryProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onReset: () => void;
  onUploadNew: () => void;
  onDownload: () => void;
  onCompareStart: () => void;
  onCompareEnd: () => void;
}

const AIEditorHistory: React.FC<AIEditorHistoryProps> = ({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onReset,
  onUploadNew,
  onDownload,
  onCompareStart,
  onCompareEnd
}) => {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
      <button
        onClick={onUndo}
        disabled={!canUndo}
        className="flex items-center justify-center text-center bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)] text-[var(--md-sys-color-on-surface)] md-label-large py-3 px-5 rounded-xl md-motion-standard hover:bg-[var(--md-sys-color-surface-container-highest)] disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Undo last action"
      >
        <Undo2 className="w-5 h-5 mr-2" />
        Undo
      </button>
      
      <button
        onClick={onRedo}
        disabled={!canRedo}
        className="flex items-center justify-center text-center bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)] text-[var(--md-sys-color-on-surface)] md-label-large py-3 px-5 rounded-xl md-motion-standard hover:bg-[var(--md-sys-color-surface-container-highest)] disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Redo last action"
      >
        <Redo2 className="w-5 h-5 mr-2" />
        Redo
      </button>

      <div className="h-6 w-px bg-[var(--md-sys-color-outline-variant)] mx-1 hidden sm:block"></div>

      {canUndo && (
        <button
          onMouseDown={onCompareStart}
          onMouseUp={onCompareEnd}
          onMouseLeave={onCompareEnd}
          onTouchStart={onCompareStart}
          onTouchEnd={onCompareEnd}
          className="flex items-center justify-center text-center bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)] text-[var(--md-sys-color-on-surface)] md-label-large py-3 px-5 rounded-xl md-motion-standard hover:bg-[var(--md-sys-color-surface-container-highest)]"
          aria-label="Press and hold to see original image"
        >
          <Eye className="w-5 h-5 mr-2" />
          Compare
        </button>
      )}

      <button
        onClick={onReset}
        disabled={!canUndo}
        className="text-center bg-transparent border border-[var(--md-sys-color-outline-variant)] text-[var(--md-sys-color-on-surface)] md-label-large py-3 px-5 rounded-xl md-motion-standard hover:bg-[var(--md-sys-color-surface-container)] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <RotateCcw className="w-5 h-5 mr-2 inline" />
        Reset
      </button>
      
      <button
        onClick={onUploadNew}
        className="text-center bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)] text-[var(--md-sys-color-on-surface)] md-label-large py-3 px-5 rounded-xl md-motion-standard hover:bg-[var(--md-sys-color-surface-container-highest)]"
      >
        <Upload className="w-5 h-5 mr-2 inline" />
        Upload New
      </button>

      <button
        onClick={onDownload}
        className="flex-grow sm:flex-grow-0 ml-auto bg-[var(--md-sys-color-tertiary)] text-[var(--md-sys-color-on-tertiary)] md-label-large py-3 px-5 rounded-xl md-motion-emphasized md-elevation-1 hover:-translate-y-px"
      >
        <Download className="w-5 h-5 mr-2 inline" />
        Download Image
      </button>
    </div>
  );
};

export default AIEditorHistory;