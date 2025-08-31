"use client";

import React from "react";
import { User, Bot, Clock, Download } from "lucide-react";
import NextImage from "next/image";

export interface ChatMessage {
  id: string;
  type: "user" | "assistant";
  content: string;
  images?: string[]; // Base64 data URLs or file URLs
  timestamp: Date;
  isGenerating?: boolean;
}

interface ChatMessageProps {
  message: ChatMessage;
  onDownloadImage?: (imageUrl: string, messageId: string, imageIndex: number) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ 
  message, 
  onDownloadImage 
}) => {
  const isUser = message.type === "user";

  const handleDownload = (imageUrl: string, imageIndex: number) => {
    if (onDownloadImage) {
      onDownloadImage(imageUrl, message.id, imageIndex);
    } else {
      // Default download behavior
      const link = document.createElement("a");
      link.href = imageUrl;
      link.download = `generated-image-${message.id}-${imageIndex + 1}.png`;
      link.click();
    }
  };

  return (
    <div className={`flex gap-4 ${isUser ? "flex-row-reverse" : ""}`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isUser 
          ? "bg-[var(--md-sys-color-primary-container)]" 
          : "bg-[var(--md-sys-color-secondary-container)]"
      }`}>
        {isUser ? (
          <User className="w-4 h-4" style={{ color: 'var(--md-sys-color-on-primary-container)' }} />
        ) : (
          <Bot className="w-4 h-4" style={{ color: 'var(--md-sys-color-on-secondary-container)' }} />
        )}
      </div>

      <div className={`flex-1 max-w-3xl ${isUser ? "text-right" : ""}`}>
        <div className={`inline-block p-6 rounded-3xl max-w-2xl md-elevation-1 ${
          isUser
            ? "bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]"
            : "bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)]"
        } ${isUser ? "rounded-tr-lg" : "rounded-tl-lg"}`}>
          
          {message.content && (
            <p className="md-body-large mb-3 whitespace-pre-wrap">
              {message.content}
            </p>
          )}

          {message.images && message.images.length > 0 && (
            <div className="grid gap-3 mt-3">
              {message.images.length === 1 && (
                <div className="relative group">
                  <NextImage
                    src={message.images[0]}
                    alt="Generated image"
                    width={400}
                    height={400}
                    className="rounded-xl border border-[var(--md-sys-color-outline-variant)] w-full h-auto max-w-md"
                  />
                  {!isUser && (
                    <button
                      onClick={() => handleDownload(message.images![0], 0)}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-black/90"
                      title="Download image"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
              
              {message.images.length > 1 && (
                <div className={`grid gap-2 ${
                  message.images.length === 2 ? "grid-cols-2" : 
                  message.images.length === 3 ? "grid-cols-3" : 
                  "grid-cols-2 md:grid-cols-3"
                }`}>
                  {message.images.map((imageUrl, index) => (
                    <div key={index} className="relative group">
                      <NextImage
                        src={imageUrl}
                        alt={`Image ${index + 1}`}
                        width={200}
                        height={200}
                        className="rounded-lg border border-[var(--md-sys-color-outline-variant)] w-full h-auto aspect-square object-cover"
                      />
                      {!isUser && (
                        <button
                          onClick={() => handleDownload(imageUrl, index)}
                          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-black/90"
                          title="Download image"
                        >
                          <Download className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {message.isGenerating && (
            <div className="flex items-center gap-2 mt-3 text-[var(--md-sys-color-on-surface-variant)]">
              <Clock className="w-4 h-4 animate-spin" />
              <span className="md-body-medium">Generating image...</span>
            </div>
          )}
        </div>

        <div className={`mt-2 ${isUser ? "text-right" : ""}`}>
          <span className="md-body-small" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
            {message.timestamp.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;