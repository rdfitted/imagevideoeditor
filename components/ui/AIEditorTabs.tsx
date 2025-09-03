"use client";

import React from "react";

type Tab = 'retouch' | 'adjust' | 'filters' | 'crop';

interface AIEditorTabsProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

const AIEditorTabs: React.FC<AIEditorTabsProps> = ({ activeTab, setActiveTab }) => {
  const tabs: Array<{ id: Tab; label: string }> = [
    { id: 'retouch', label: 'Retouch' },
    { id: 'crop', label: 'Crop' },
    { id: 'adjust', label: 'Adjust' },
    { id: 'filters', label: 'Filters' },
  ];

  return (
    <div className="w-full bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] rounded-xl p-1 flex items-center justify-center gap-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex-1 capitalize md-label-large py-3 px-5 rounded-lg md-motion-standard ${
            activeTab === tab.id
              ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] md-elevation-1'
              : 'text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)]'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default AIEditorTabs;