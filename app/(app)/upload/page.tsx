"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CameraUpload } from "@/components/receipt/camera-upload";
import { recordsApi, getErrorMessage } from "@/lib/api";
import { useTripStore } from "@/store/trip-store";

export default function UploadPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const storeTripId = useTripStore((s) => s.currentTripId);
  const tripId = searchParams.get("trip_id") ?? storeTripId;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // No trip selected → go pick one first
  if (!tripId) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 px-6">
        <span className="text-4xl">✈️</span>
        <p className="text-sm text-[#888888] text-center">
          先に旅行を選んでください
        </p>
        <button
          onClick={() => router.push("/trips")}
          className="bg-amber-500 text-black rounded-2xl px-6 py-3 text-sm font-semibold active:scale-95 transition-transform"
        >
          旅行を選ぶ
        </button>
      </div>
    );
  }

  const handleFile = async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("trip_id", tripId);
      const { data } = await recordsApi.parse(formData);
      sessionStorage.setItem("parsed_receipt", JSON.stringify(data));
      sessionStorage.setItem("current_trip_id", tripId);
      router.push(`/confirm?trip_id=${tripId}`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full px-5 pt-safe">
      <div className="py-4">
        <h1 className="text-xl font-bold text-[#f0f0f0]">レシートを記録</h1>
        <p className="text-sm text-[#888888] mt-0.5">撮影または画像を選択してください</p>
      </div>
      <div className="flex-1 flex flex-col justify-center">
        <CameraUpload onFile={handleFile} loading={loading} />
      </div>
      {error && (
        <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-2xl">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
}
