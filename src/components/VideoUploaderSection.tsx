import React, { useRef, useState } from 'react';
import { Plus, Video, AlertCircle, Loader2 } from 'lucide-react';
import { CategoryType, VideoClip } from '../types';
import { VideoCard } from './VideoCard';
import { extractVideoMetadata, formatBytes, formatDuration } from '../utils/videoUtils';

interface VideoUploaderSectionProps {
  category: CategoryType;
  title: string;
  subtitle: string;
  badgeNumber: number;
  clips: VideoClip[];
  onAddClips: (clips: VideoClip[]) => void;
  onRemoveClip: (id: string) => void;
  onPreviewClip: (clip: VideoClip) => void;
}

export const VideoUploaderSection: React.FC<VideoUploaderSectionProps> = ({
  category,
  title,
  subtitle,
  badgeNumber,
  clips,
  onAddClips,
  onRemoveClip,
  onPreviewClip,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const maxClips = 3;
  const remainingSlots = maxClips - clips.length;
  const isLimitReached = remainingSlots <= 0;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setErrorMessage(null);

    const fileList = Array.from(files);

    if (fileList.length > remainingSlots) {
      setErrorMessage(
        `Você só pode adicionar mais ${remainingSlots} vídeo(s) nesta categoria (máximo 3).`
      );
    }

    const filesToProcess = fileList.slice(0, remainingSlots);

    if (filesToProcess.length === 0) return;

    setIsProcessing(true);

    try {
      const newClips: VideoClip[] = [];

      for (const file of filesToProcess) {
        // Extract real video duration and canvas-generated thumbnail
        const { duration, thumbnailUrl } = await extractVideoMetadata(file);

        const clip: VideoClip = {
          id: `clip-${category}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          category,
          file,
          name: file.name,
          size: file.size,
          sizeFormatted: formatBytes(file.size),
          duration,
          durationFormatted: formatDuration(duration),
          previewUrl: URL.createObjectURL(file),
          thumbnailUrl,
          uploadedAt: new Date().toISOString(),
        };

        newClips.push(clip);
      }

      onAddClips(newClips);
    } catch (err) {
      console.error('Erro ao processar vídeos:', err);
      setErrorMessage('Falha ao processar o vídeo da galeria. Verifique o formato.');
    } finally {
      setIsProcessing(false);
      // Reset input value so user can upload same filename again if desired
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleTriggerPicker = () => {
    if (isLimitReached || isProcessing) return;
    fileInputRef.current?.click();
  };

  return (
    <div className="rounded-3xl border border-[#262626] bg-[#161616] p-4 sm:p-5 shadow-lg space-y-4">
      {/* Header of the section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#242424] border border-[#333333] text-sm font-bold text-[#E8A0BF]">
            0{badgeNumber}
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">{title}</h3>
            <p className="text-xs text-[#8E8E8E]">{subtitle}</p>
          </div>
        </div>

        {/* Counter Badge */}
        <div
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
            clips.length === maxClips
              ? 'bg-[#E8A0BF]/15 border-[#E8A0BF]/40 text-[#E8A0BF]'
              : clips.length > 0
              ? 'bg-[#222222] border-[#333333] text-white'
              : 'bg-[#1c1c1c] border-[#292929] text-[#777777]'
          }`}
        >
          <span>
            {clips.length}/{maxClips}
          </span>
          <span className="text-[10px] font-normal text-[#999999] hidden sm:inline">vídeos</span>
        </div>
      </div>

      {/* Error notification if exceeds limit */}
      {errorMessage && (
        <div className="flex items-center gap-2 rounded-xl bg-amber-950/40 border border-amber-800/40 p-2.5 text-xs text-amber-200">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Video Cards List */}
      {clips.length > 0 && (
        <div className="space-y-2.5">
          {clips.map((clip, idx) => (
            <VideoCard
              key={clip.id}
              clip={clip}
              index={idx}
              onPreview={onPreviewClip}
              onRemove={onRemoveClip}
            />
          ))}
        </div>
      )}

      {/* Upload Button / Trigger */}
      {!isLimitReached ? (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />

          <button
            type="button"
            onClick={handleTriggerPicker}
            disabled={isProcessing}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-[#3a3a3a] bg-[#1a1a1a]/60 py-3.5 px-4 text-xs sm:text-sm font-semibold text-[#F5F5F5] hover:border-[#E8A0BF] hover:bg-[#202020] active:scale-[0.99] transition-all duration-200 disabled:opacity-50 cursor-pointer"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#E8A0BF]" />
                <span>Carregando vídeo da galeria...</span>
              </>
            ) : (
              <>
                <div className="w-6 h-6 rounded-full bg-[#E8A0BF]/15 text-[#E8A0BF] flex items-center justify-center">
                  <Plus className="w-3.5 h-3.5" />
                </div>
                <span>Adicionar vídeo da galeria ({remainingSlots} restante{remainingSlots > 1 ? 's' : ''})</span>
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-[#292929] bg-[#1c1c1c]/50 py-2.5 px-3 text-center text-xs text-[#888888]">
          <Video className="w-3.5 h-3.5 text-[#E8A0BF]" />
          <span>Limite de 3 vídeos atingido para esta etapa</span>
        </div>
      )}
    </div>
  );
};
