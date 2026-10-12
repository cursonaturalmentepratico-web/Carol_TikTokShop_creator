import React, { useRef, useState, useEffect } from 'react';
import { X, Play, Pause, RotateCcw, Volume2, VolumeX, Maximize2 } from 'lucide-react';
import { VideoClip } from '../types';

interface VideoPreviewModalProps {
  clip: VideoClip | null;
  onClose: () => void;
}

export const VideoPreviewModal: React.FC<VideoPreviewModalProps> = ({ clip, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (clip && videoRef.current) {
      videoRef.current.currentTime = 0;
      setCurrentTime(0);
      setIsPlaying(true);
      videoRef.current.play().catch(() => {
        setIsPlaying(false);
      });
    }
  }, [clip]);

  if (!clip) return null;

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration || clip.duration || 0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const restartVideo = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const formatSecs = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative flex flex-col w-full max-w-sm max-h-[92vh] rounded-3xl bg-[#161616] border border-[#2a2a2a] shadow-2xl overflow-hidden">
        {/* Header bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#1c1c1c] border-b border-[#262626]">
          <div className="min-w-0 pr-2">
            <h4 className="text-sm font-semibold text-white truncate">{clip.name}</h4>
            <div className="flex items-center gap-2 text-[11px] text-[#A0A0A0]">
              <span>{clip.durationFormatted}</span>
              <span>•</span>
              <span>{clip.sizeFormatted}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#262626] flex items-center justify-center text-[#888888] hover:text-white transition shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Video Player Display */}
        <div className="relative flex-1 bg-black flex items-center justify-center min-h-[360px] max-h-[560px] overflow-hidden group">
          <video
            ref={videoRef}
            src={clip.previewUrl}
            className="w-full h-full object-contain max-h-[560px]"
            playsInline
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={() => setIsPlaying(false)}
            onClick={togglePlay}
          />

          {/* Center Play Overlay */}
          {!isPlaying && (
            <button
              onClick={togglePlay}
              className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-[#E8A0BF]/90 text-[#111111] flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all"
            >
              <Play className="w-8 h-8 fill-current ml-1" />
            </button>
          )}
        </div>

        {/* Video Controls */}
        <div className="px-4 py-3.5 bg-[#181818] border-t border-[#262626] space-y-2.5">
          {/* Progress bar */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-[#888888] w-9">
              {formatSecs(currentTime)}
            </span>
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={0.1}
              value={currentTime}
              onChange={handleSeek}
              className="w-full accent-[#E8A0BF] h-1.5 bg-[#333333] rounded-lg cursor-pointer"
            />
            <span className="text-[11px] font-mono text-[#888888] w-9 text-right">
              {formatSecs(duration)}
            </span>
          </div>

          {/* Quick buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={togglePlay}
                className="w-9 h-9 rounded-full bg-[#242424] flex items-center justify-center text-white hover:bg-[#2e2e2e] transition"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>
              <button
                onClick={restartVideo}
                className="w-9 h-9 rounded-full bg-[#242424] flex items-center justify-center text-[#A0A0A0] hover:text-white transition"
                title="Reiniciar"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={toggleMute}
              className="w-9 h-9 rounded-full bg-[#242424] flex items-center justify-center text-[#A0A0A0] hover:text-white transition"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
