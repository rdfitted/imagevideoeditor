"use client";

import React, { useCallback, useRef, useState, useEffect } from "react";
import ChatMessage, { ChatMessage as ChatMessageType } from "./ChatMessage";
import PhotoEditorComposer from "./PhotoEditorComposer";
import { UploadedImage } from "./ImageGallery";

const PhotoEditor: React.FC = () => {
  const [prompt, setPrompt] = useState("");
  const [referenceImages, setReferenceImages] = useState<UploadedImage[]>([]);
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages are added
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const canGenerate = prompt.trim().length > 0 && !isGenerating;

  const generateImage = useCallback(async () => {
    if (!canGenerate) return;

    const userMessage: ChatMessageType = {
      id: `user-${Date.now()}`,
      type: "user",
      content: prompt,
      images: referenceImages.map(img => img.dataUrl),
      timestamp: new Date(),
    };

    const assistantMessageId = `assistant-${Date.now()}`;
    const assistantMessage: ChatMessageType = {
      id: assistantMessageId,
      type: "assistant",
      content: "",
      timestamp: new Date(),
      isGenerating: true,
    };

    setMessages(prev => [...prev, userMessage, assistantMessage]);
    setIsGenerating(true);
    setPrompt("");

    try {
      const formData = new FormData();
      formData.append("prompt", prompt);
      formData.append("model", "gemini-2.5-flash-image-preview");

      // Add reference images as files
      referenceImages.forEach((image) => {
        formData.append("imageFiles", image.file);
      });

      // Include previous generated images from chat history for context
      const previousGeneratedImages = messages
        .filter(msg => msg.type === "assistant" && msg.images && msg.images.length > 0)
        .slice(-2) // Only use last 2 assistant messages for context
        .flatMap(msg => msg.images || []);

      previousGeneratedImages.forEach((imageUrl) => {
        if (imageUrl.startsWith('data:image/')) {
          const [meta, base64] = imageUrl.split(',');
          const mimeType = meta.split(':')[1].split(';')[0];
          formData.append("imageBase64", base64);
          formData.append("imageMimeType", mimeType);
        }
      });

      const response = await fetch("/api/photo-editor/generate", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to generate image");
      }

      const generatedImageUrl = `data:${result.image.mimeType};base64,${result.image.imageBytes}`;

      setMessages(prev =>
        prev.map(msg =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                content: "I've created an image based on your request. You can continue editing by describing what you'd like to change.",
                images: [generatedImageUrl],
                isGenerating: false,
              }
            : msg
        )
      );
    } catch (error) {
      console.error("Error generating image:", error);
      setMessages(prev =>
        prev.map(msg =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                content: `Sorry, I encountered an error while generating the image: ${error instanceof Error ? error.message : 'Unknown error'}`,
                isGenerating: false,
              }
            : msg
        )
      );
    } finally {
      setIsGenerating(false);
    }
  }, [canGenerate, prompt, referenceImages, messages]);

  const handleDownloadImage = (imageUrl: string, messageId: string, imageIndex: number) => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `photo-edit-${messageId}-${imageIndex + 1}.png`;
    link.click();
  };

  const handleReset = () => {
    setMessages([]);
    setPrompt("");
    setReferenceImages([]);
  };


  return (
    <div className="relative min-h-screen w-full md-surface">
      {/* Main chat area - matches single video layout exactly */}
      <div className="flex items-center justify-center min-h-screen pb-40 px-4">
        {messages.length === 0 ? (
          <div className="select-none text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--md-sys-color-primary-container)] flex items-center justify-center">
              <span className="text-2xl">🎨</span>
            </div>
            <div className="md-body-large mb-2" style={{ color: 'var(--md-sys-color-on-surface)' }}>
              Photo Editor
            </div>
            <div className="md-body-medium" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
              Upload images and describe what you want to create or edit.
            </div>
          </div>
        ) : (
          <div className="w-full max-w-4xl">
            <div 
              ref={chatContainerRef}
              className="space-y-6 max-h-[calc(100vh-12rem)] overflow-y-auto pr-2"
              style={{ scrollbarWidth: 'thin', scrollbarColor: 'var(--md-sys-color-outline-variant) transparent' }}
            >
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  onDownloadImage={handleDownloadImage}
                />
              ))}
              <div ref={messagesEndRef} className="h-8" />
            </div>
          </div>
        )}
      </div>

      {/* Bottom composer - matches Composer component pattern */}
      <PhotoEditorComposer
        prompt={prompt}
        setPrompt={setPrompt}
        referenceImages={referenceImages}
        setReferenceImages={setReferenceImages}
        canGenerate={canGenerate}
        isGenerating={isGenerating}
        generateImage={generateImage}
        resetAll={handleReset}
      />
    </div>
  );
};

export default PhotoEditor;