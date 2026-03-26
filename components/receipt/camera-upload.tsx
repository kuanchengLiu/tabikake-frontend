"use client";

import { useRef, useState } from "react";

interface CameraUploadProps {
  onFile: (file: File) => void;
  onManual: () => void;
  loading?: boolean;
}

export function CameraUpload({ onFile, onManual, loading = false }: CameraUploadProps) {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    onFile(file);
    e.target.value = "";
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      {/* Preview or placeholder */}
      <div className="relative w-full aspect-[3/4] max-h-[50dvh] bg-[#1a1a1a] rounded-3xl overflow-hidden border border-[#2e2e2e] flex items-center justify-center">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Receipt preview" className="w-full h-full object-contain" />
        ) : (
          <div className="flex flex-col items-center gap-3 text-[#888888]">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="2" y="5" width="20" height="15" rx="2" />
              <circle cx="12" cy="12" r="3.5" />
              <path d="M7 5V3h2" />
            </svg>
            <p className="text-sm">レシートを撮影または選択</p>
          </div>
        )}

        {loading && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <svg className="animate-spin h-8 w-8 text-amber-500" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className="text-sm text-white">解析中...</p>
            </div>
          </div>
        )}
      </div>

      {/* Action buttons — 3 options */}
      <div className="flex gap-3 w-full">
        {/* Camera */}
        <button
          type="button"
          disabled={loading}
          onClick={() => cameraInputRef.current?.click()}
          className="flex-1 flex flex-col items-center gap-2 bg-amber-500 text-black rounded-2xl py-4 font-semibold active:scale-95 transition-transform disabled:opacity-40"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="5" width="20" height="15" rx="2" />
            <circle cx="12" cy="12" r="3.5" />
            <path d="M7 5V3h2" />
          </svg>
          <span className="text-xs">撮影</span>
        </button>

        {/* Gallery */}
        <button
          type="button"
          disabled={loading}
          onClick={() => galleryInputRef.current?.click()}
          className="flex-1 flex flex-col items-center gap-2 bg-[#242424] text-[#f0f0f0] rounded-2xl py-4 font-semibold border border-[#2e2e2e] active:scale-95 transition-transform disabled:opacity-40"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          <span className="text-xs">アルバム</span>
        </button>

        {/* Manual */}
        <button
          type="button"
          disabled={loading}
          onClick={onManual}
          className="flex-1 flex flex-col items-center gap-2 bg-[#242424] text-[#f0f0f0] rounded-2xl py-4 font-semibold border border-[#2e2e2e] active:scale-95 transition-transform disabled:opacity-40"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="17" y1="10" x2="3" y2="10" />
            <line x1="21" y1="6" x2="3" y2="6" />
            <line x1="21" y1="14" x2="3" y2="14" />
            <line x1="17" y1="18" x2="3" y2="18" />
          </svg>
          <span className="text-xs">手動入力</span>
        </button>
      </div>

      {/* Hidden file inputs */}
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFile} />
      <input ref={galleryInputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
}
