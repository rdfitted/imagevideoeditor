"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import Slider from "rc-slider";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Scissors,
  Download,
} from "lucide-react";

interface VideoPlayerProps {
  src: string;
  // Called when a new output is produced (e.g., after trimming and exporting)
  onOutputChanged?: (blob: Blob) => void;
  onDownload?: () => void;
  onResetTrim?: () => void;
}

const formatTime = (seconds: number) => {
  if (isNaN(seconds)) {
    return "00:00";
  }
  const date = new Date(seconds * 1000);
  const hh = date.getUTCHours();
  const mm = date.getUTCMinutes();
  const ss = date.getUTCSeconds().toString().padStart(2, "0");
  if (hh) {
    return `${hh}:${mm.toString().padStart(2, "0")}:${ss}`;
  }
  return `${mm}:${ss}`;
};

export default function VideoPlayer({
  src,
  onOutputChanged,
  onDownload,
  onResetTrim,
}: VideoPlayerProps) {
  const playerRef = useRef<HTMLVideoElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [played, setPlayed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const [trimRange, setTrimRange] = useState<[number, number]>([0, 0]);
  const [isTrimmed, setIsTrimmed] = useState(false);
  const [effectiveDuration, setEffectiveDuration] = useState(0);
  const [effectiveStartTime, setEffectiveStartTime] = useState(0);
  const [showTrimBar, setShowTrimBar] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  // Reset trim UI when the source changes
  useEffect(() => {
    setIsTrimmed(false);
    setTrimRange([0, 0]);
    setDuration(0);
    setEffectiveDuration(0);
    setEffectiveStartTime(0);
    setPlayed(0);
    setSeeking(false);
    try {
      playerRef.current?.load?.();
    } catch {}
  }, [src]);

  useEffect(() => {
    // Ensure consistent mute/volume on element
    if (playerRef.current) {
      playerRef.current.muted = muted;
      playerRef.current.volume = volume;
    }
  }, [muted, volume]);

  const handlePlayPause = () => {
    if (!playerRef.current) return;
    setPlaying((p) => {
      const next = !p;
      if (next) {
        playerRef.current?.play().catch(() => {});
      } else {
        playerRef.current?.pause();
      }
      return next;
    });
  };

  const handleVolumeChange = (value: number | number[]) => {
    const newVolume = Array.isArray(value) ? value[0] : value;
    setVolume(newVolume);
    setMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const nextMuted = !muted;
    setMuted(nextMuted);
    setVolume((prev) => (nextMuted ? 0 : prev === 0 ? 0.8 : prev));
  };

  const handleTimeUpdate = () => {
    const current = playerRef.current?.currentTime ?? 0;
    const rawTotal = playerRef.current?.duration;
    const total = Number.isFinite(rawTotal) && rawTotal ? rawTotal : duration;
    if (!seeking) {
      const denomRaw = isTrimmed ? effectiveDuration : total;
      const denom = Number.isFinite(denomRaw) && denomRaw > 0 ? denomRaw : 1;
      const numerator = current - (isTrimmed ? effectiveStartTime : 0);
      const fraction = Math.min(Math.max(numerator / denom, 0), 1);
      setPlayed(fraction);
      if (isTrimmed) {
        const endTime = effectiveStartTime + effectiveDuration;
        if (current >= endTime) {
          if (isRecording) {
            return;
          }
          const startTime = effectiveStartTime;
          if (playerRef.current) {
            if (typeof playerRef.current.fastSeek === "function") {
              playerRef.current.fastSeek(startTime);
            } else {
              playerRef.current.currentTime = startTime;
            }
            try {
              playerRef.current.play();
            } catch {}
          }
          setPlayed(0);
        }
      }
    }
  };

  const handleLoadedMetadata = () => {
    const video = playerRef.current;
    if (!video) return;
    const raw = video.duration;
    // Some MediaRecorder blobs report Infinity until a seek occurs
    if (!Number.isFinite(raw) || raw === Infinity || raw === 0) {
      const onSeeked = () => {
        // After seeking to a large time, duration becomes available
        const fixed = video.duration;
        const computed =
          Number.isFinite(fixed) && fixed > 0 ? fixed : video.currentTime || 0;
        setDuration(computed);
        setTrimRange([0, computed]);
        setEffectiveDuration(computed);
        setEffectiveStartTime(0);
        video.removeEventListener("seeked", onSeeked);
        try {
          if (typeof video.fastSeek === "function") {
            video.fastSeek(0);
          } else {
            video.currentTime = 0;
          }
        } catch {}
      };
      video.addEventListener("seeked", onSeeked);
      try {
        video.currentTime = 1e9;
      } catch {}
      return;
    }
    const d = raw;
    setDuration(d);
    setTrimRange([0, d]);
    setEffectiveDuration(d);
    setEffectiveStartTime(0);
  };

  const handleDurationChange = () => {
    const d = playerRef.current?.duration;
    if (Number.isFinite(d) && d && d !== Infinity) {
      setDuration(d);
      setTrimRange([0, d]);
      setEffectiveDuration(d);
      setEffectiveStartTime(0);
    }
  };

  const handleSeekChange = (value: number | number[]) => {
    const newPlayed = Array.isArray(value) ? value[0] : value;
    setPlayed(newPlayed);
    const spanRaw = isTrimmed ? effectiveDuration : duration;
    const span = Number.isFinite(spanRaw) && spanRaw > 0 ? spanRaw : 0;
    const seekToTime = newPlayed * span + (isTrimmed ? effectiveStartTime : 0);
    if (playerRef.current) {
      if (typeof playerRef.current.fastSeek === "function") {
        playerRef.current.fastSeek(seekToTime);
      } else {
        playerRef.current.currentTime = seekToTime;
      }
    }
  };

  const recordSegment = useCallback(
    async (startTime: number, endTime: number) => {
      const video = playerRef.current;
      if (!video || endTime <= startTime) return null;

      // Ensure captureStream is available
      try {
        await video.play();
        await new Promise((r) => setTimeout(r, 50));
        video.pause();
      } catch {}

      const v = video as HTMLVideoElement & {
        captureStream?(): MediaStream;
        mozCaptureStream?(): MediaStream;
      };
      const stream: MediaStream | null =
        v.captureStream?.() ?? v.mozCaptureStream?.() ?? null;
      if (!stream) return null;

      const mimeCandidates = [
        "video/webm;codecs=vp9,opus",
        "video/webm;codecs=vp8,opus",
        "video/webm",
      ];
      let mimeType = "";
      for (const m of mimeCandidates) {
        if (
          typeof MediaRecorder !== "undefined" &&
          MediaRecorder.isTypeSupported(m)
        ) {
          mimeType = m;
          break;
        }
      }

      const chunks: BlobPart[] = [];
      return await new Promise<Blob | null>((resolve) => {
        let resolved = false;
        const recorder = new MediaRecorder(
          stream,
          mimeType ? { mimeType } : undefined
        );
        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) chunks.push(e.data);
        };
        recorder.onstop = () => {
          if (resolved) return;
          resolved = true;
          setIsRecording(false);
          const type = recorder.mimeType || mimeType || "video/webm";
          resolve(new Blob(chunks, { type }));
        };
        recorder.onerror = () => {
          if (!resolved) {
            setIsRecording(false);
            resolve(null);
          }
        };

        const onTick = () => {
          const now = playerRef.current?.currentTime ?? 0;
          if (now >= endTime) {
            video.removeEventListener("timeupdate", onTick);
            try {
              recorder.stop();
            } catch {}
            try {
              video.pause();
            } catch {}
          }
        };
        video.addEventListener("timeupdate", onTick);
        if (typeof video.fastSeek === "function") {
          video.fastSeek(startTime);
        } else {
          video.currentTime = startTime;
        }
        // Use a small timeslice so dataavailable fires periodically and final blob isn't empty.
        try {
          setIsRecording(true);
          recorder.start(200);
        } catch {
          setIsRecording(true);
          recorder.start();
        }
        video.play();
      });
    },
    []
  );

  const handleTrim = useCallback(async () => {
    const startTime = trimRange[0];
    const endTime = trimRange[1];
    setEffectiveStartTime(startTime);
    setEffectiveDuration(Math.max(endTime - startTime, 0));
    setIsTrimmed(true);
    setPlaying(false);

    if (playerRef.current) {
      if (typeof playerRef.current.fastSeek === "function") {
        playerRef.current.fastSeek(startTime);
      } else {
        playerRef.current.currentTime = startTime;
      }
    }
    setPlayed(0);

    // Best-effort fallback recording to provide a quick preview blob
    const blob = await recordSegment(startTime, endTime);
    if (blob) {
      onOutputChanged?.(blob);
    }
  }, [trimRange, onOutputChanged, recordSegment]);

  const handleResetTrim = () => {
    setIsTrimmed(false);
    setTrimRange([0, duration]);
    setEffectiveDuration(duration);
    setEffectiveStartTime(0);
    if (playerRef.current) {
      if (typeof playerRef.current.fastSeek === "function") {
        playerRef.current.fastSeek(0);
      } else {
        playerRef.current.currentTime = 0;
      }
    }
    setPlayed(0);
    onResetTrim?.();
  };

  const handleTrimRangeChange = (value: number | number[]) => {
    if (Array.isArray(value)) {
      setTrimRange(value as [number, number]);
    }
  };

  const spanForDisplay = isTrimmed ? effectiveDuration : duration;
  const safeDisplaySpan =
    Number.isFinite(spanForDisplay) && spanForDisplay > 0 ? spanForDisplay : 0;
  const currentDisplaySeconds = played * safeDisplaySpan;
  const totalDisplaySeconds = safeDisplaySpan;

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="relative aspect-video overflow-hidden rounded-2xl border border-[var(--md-sys-color-outline-variant)]" style={{ backgroundColor: 'var(--md-sys-color-surface-container-low)' }}>
        <video
          ref={playerRef}
          src={src}
          className="w-full h-full object-cover"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onDurationChange={handleDurationChange}
          onPlay={() => {
            if (isTrimmed) {
              const currentTime = playerRef.current?.currentTime || 0;
              const startTime = trimRange[0];
              if (currentTime < startTime) {
                if (typeof playerRef.current?.fastSeek === "function") {
                  playerRef.current.fastSeek(startTime);
                } else if (playerRef.current) {
                  playerRef.current.currentTime = startTime;
                }
              }
            }
            setPlaying(true);
          }}
          onPause={() => setPlaying(false)}
          playsInline
          controls={false}
          preload="metadata"
          key={src}
          loop={!isTrimmed && !isRecording}
        />

        {/* Bottom overlay trim bar (toggleable) */}
        {showTrimBar && (
          <div className="absolute left-0 right-0 bottom-3 z-20 px-4">
            <div className="md-surface-container-high rounded-2xl px-4 py-3 border border-[var(--md-sys-color-outline-variant)] md-elevation-2">
              <div className="flex items-center gap-4">
                <span className="md-label-medium min-w-12 text-center" style={{ color: 'var(--md-sys-color-on-surface)' }}>
                  {formatTime(trimRange[0])}
                </span>
                <div className="relative flex-1 h-8 flex">
                  <div
                    className="absolute inset-y-0 left-0 pointer-events-none z-0 rounded-lg"
                    style={{
                      width: `${(trimRange[0] / (duration || 1)) * 100}%`,
                      backgroundColor: "var(--md-sys-color-outline)",
                      height: 32,
                    }}
                  />
                  <div
                    className="absolute inset-y-0 right-0 pointer-events-none z-0 rounded-lg"
                    style={{
                      width: `${(1 - trimRange[1] / (duration || 1)) * 100}%`,
                      backgroundColor: "var(--md-sys-color-outline)",
                      height: 32,
                    }}
                  />
                  <div className="relative z-10 w-full">
                    <Slider
                      range
                      min={0}
                      max={duration}
                      step={0.1}
                      value={trimRange}
                      onChange={handleTrimRangeChange}
                      disabled={duration === 0}
                      styles={{
                        rail: {
                          backgroundColor: "transparent",
                        },
                        track: { height: 28, backgroundColor: "transparent" },
                        handle: {
                          width: 10,
                          height: 32,
                          borderRadius: 6,
                          backgroundColor: "var(--md-sys-color-primary)",
                          borderColor: "var(--md-sys-color-primary)",
                          marginBottom: 10,
                        },
                      }}
                    />
                  </div>
                </div>
                <span className="md-label-medium min-w-12 text-center" style={{ color: 'var(--md-sys-color-on-surface)' }}>
                  {formatTime(trimRange[1])}
                </span>
                <div className="flex items-center gap-3 pl-2">
                  <button
                    onClick={handleTrim}
                    className="inline-flex items-center gap-2 h-10 px-4 rounded-xl md-interactive transition-all duration-200 md-label-large cursor-pointer"
                    style={{
                      backgroundColor: 'var(--md-sys-color-primary)',
                      color: 'var(--md-sys-color-on-primary)'
                    }}
                  >
                    Cut
                  </button>
                  <button
                    onClick={handleResetTrim}
                    className="inline-flex items-center gap-2 h-10 px-4 rounded-xl md-interactive transition-all duration-200 md-label-large cursor-pointer border border-[var(--md-sys-color-outline)]"
                    disabled={!isTrimmed}
                    style={{
                      backgroundColor: isTrimmed ? 'var(--md-sys-color-surface-container)' : 'var(--md-sys-color-surface-variant)',
                      color: isTrimmed ? 'var(--md-sys-color-on-surface)' : 'var(--md-sys-color-on-surface-variant)',
                      opacity: isTrimmed ? 1 : 0.6
                    }}
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controls below the video */}
      <div className="p-4">
        <div className="flex items-center gap-4 md-surface-container-high rounded-2xl px-4 py-3 border border-[var(--md-sys-color-outline-variant)] md-elevation-1">
          <button
            onClick={handlePlayPause}
            className="focus:outline-none md-interactive rounded-full p-2 transition-all duration-200"
            style={{ color: 'var(--md-sys-color-on-surface)' }}
          >
            {playing ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6" />
            )}
          </button>
          <div className="flex-grow">
            <Slider
              min={0}
              max={1}
              step={0.0001}
              value={played}
              onBeforeChange={() => setSeeking(true)}
              onChange={handleSeekChange}
              onAfterChange={() => setSeeking(false)}
              styles={{
                track: { backgroundColor: "var(--md-sys-color-primary)" },
                handle: { backgroundColor: "var(--md-sys-color-primary)", borderColor: "var(--md-sys-color-primary)" },
              }}
            />
          </div>
          <div className="md-label-large" style={{ color: 'var(--md-sys-color-on-surface)' }}>
            {formatTime(currentDisplaySeconds)} /{" "}
            {formatTime(totalDisplaySeconds)}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleMute}
              className="focus:outline-none md-interactive rounded-full p-2 transition-all duration-200"
              style={{ color: 'var(--md-sys-color-on-surface)' }}
            >
              {muted || volume === 0 ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </button>
            <div className="w-24">
              <Slider
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={handleVolumeChange}
                styles={{
                  track: { backgroundColor: "var(--md-sys-color-primary)" },
                  handle: { backgroundColor: "var(--md-sys-color-primary)", borderColor: "var(--md-sys-color-primary)" },
                }}
              />
            </div>
            <button
              onClick={() => setShowTrimBar((s) => !s)}
              title={showTrimBar ? "Hide trimmer" : "Show trimmer"}
              className="focus:outline-none md-interactive rounded-full p-2 transition-all duration-200"
              style={{ color: showTrimBar ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-on-surface)' }}
            >
              <Scissors
                className={`w-5 h-5 transition-transform duration-200 ${
                  showTrimBar ? "rotate-270" : "rotate-0"
                }`}
              />
            </button>
            <button
              onClick={onDownload}
              title="Download"
              className="focus:outline-none md-interactive rounded-full p-2 transition-all duration-200"
              style={{ color: 'var(--md-sys-color-on-surface)' }}
            >
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
