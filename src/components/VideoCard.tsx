import React from 'react';
import { Play, Trash2, Clock, Film } from 'lucide-react';
import { VideoClip } from '../types';

interface VideoCardProps {
  clip: VideoClip;
  index: number;
  onPreview: (clip: VideoClip) => void;
  onRemove: (id: string) => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({
  clip,
  index,
  onPreview,
  onRemove,
}) => {
  return (
    <div className="group relative flex items-center gap-3.5 rounded-2xl bg-[#1a1a1a] p-3 border border-[#2a2a2a] hover:border-[#E8A0BF]/50 transition-all duration-200">
      {/* Video Thumbnail with Play Overlay */}
      <div
        onClick={() => onPreview(clip)}
        className="relative h-20 w-16 sm:h-22 sm:w-18 shrink-0 overflow-hidden rounded-xl bg-black border border-[#333333] cursor-pointer group/thumb"
      >
        {clip.thumbnailUrl ? (
          <img
            src={clip.thumbnailUrl}
            alt={clip.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover/thumb:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[#222222] text-[#666666]">
            <Film className="h-6 w-6 text-[#888888]" />
          </div>
        )}

        <div className="absolute inset-0 flex items-center justify-center bg-black/35 group-hover/thumb:bg-black/20 transition-colors">
          <div className="h-7 w-7 rounded-full bg-[#E8A0BF]/90 flex items-center justify-center text-[#111111] shadow-md group-hover/thumb:scale-110 transition-transform">
            <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
          </div>
        </div>

        {/* Index badge */}
        <span className="absolute top-1 left-1 rounded-md bg-[#111111]/80 px-1 py-0.5 text-[9px] font-bold text-white backdrop-blur-xs">
          #{index + 1}
        </span>
      </div>

      {/* Video Details */}
      <div className="flex-1 min-w-0 pr-1">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#E8A0BF] bg-[#E8A0BF]/10 px-1.5 py-0.5 rounded border border-[#E8A0BF]/20">
            Take {index + 1}
          </span>
          <span className="text-[11px] text-[#777777]">•</span>
          <span className="text-[11px] text-[#999999]">{clip.sizeFormatted}</span>
        </div>

        <p className="text-xs sm:text-sm font-medium text-white truncate mb-1" title={clip.name}>
          {clip.name}
        </p>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#D0D0D0] bg-[#242424] px-2 py-0.5 rounded-md">
            <Clock className="w-3 h-3 text-[#E8A0BF]" />
            {clip.durationFormatted}
          </span>
          <button
            onClick={() => onPreview(clip)}
            className="text-[11px] text-[#E8A0BF] hover:underline font-medium sm:hidden"
          >
            Ver vídeo
          </button>
        </div>
      </div>

      {/* Remove Button (Big enough for iPhone thumb) */}
      <button
        type="button"
        onClick={() => onRemove(clip.id)}
        aria-label="Remover vídeo"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#222222] text-[#888888] hover:bg-rose-950/40 hover:text-rose-400 hover:border hover:border-rose-800/40 active:scale-90 transition-all"
        title="Remover vídeo"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
};
