"use client";

import { useEffect } from "react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CameraUpload } from "@/components/receipt/camera-upload";
import { TripSelector } from "@/components/receipt/trip-selector";
import { recordsApi, getErrorMessage } from "@/lib/api";
import { useTripStore } from "@/store/trip-store";
import { useTrips } from "@/lib/hooks/use-trips";
import { useToast } from "@/components/ui/toast";

export default function UploadPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentTripId, setCurrentTripId } = useTripStore();
  const toast = useToast();

  const tripIdFromUrl = searchParams.get("trip_id");
  const tripId = tripIdFromUrl ?? currentTripId;

  const { data: trips = [], isLoading: tripsLoading } = useTrips();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-select logic
  useEffect(() => {
    if (tripsLoading) return;
    if (trips.length === 0) {
      router.replace("/trips/new");
      return;
    }
    if (!tripId) {
      // Auto-select the most recently created trip
      const sorted = [...trips].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setCurrentTripId(sorted[0].id);
    }
  }, [tripsLoading, trips, tripId, router, setCurrentTripId]);

  const handleSelect = (id: string) => {
    setCurrentTripId(id);
  };

  const handleFile = async (file: File) => {
    if (!tripId) {
      toast("先に旅行を選択してください", "error");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("trip_id", tripId);
      const { data } = await recordsApi.parse(formData);
      sessionStorage.setItem("parsed_receipt", JSON.stringify(data));
      sessionStorage.setItem("current_trip_id", tripId);
      router.push(`/confirm?mode=ocr&trip_id=${tripId}`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleManual = () => {
    if (!tripId) {
      toast("先に旅行を選択してください", "error");
      return;
    }
    sessionStorage.removeItem("parsed_receipt");
    sessionStorage.setItem("current_trip_id", tripId);
    router.push(`/confirm?mode=manual&trip_id=${tripId}`);
  };

  if (tripsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <svg className="animate-spin h-6 w-6 text-amber-500" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full px-5 pt-safe">
      <div className="py-4 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#f0f0f0]">レシートを記録</h1>
          <p className="text-sm text-[#888888] mt-0.5">撮影、選択、または手動で入力</p>
        </div>
        <div className="flex-shrink-0 mt-1">
          <TripSelector
            trips={trips}
            currentTripId={tripId}
            onSelect={handleSelect}
          />
        </div>
      </div>
      <div className="flex-1 flex flex-col justify-center">
        <CameraUpload onFile={handleFile} onManual={handleManual} loading={loading} />
      </div>
      {error && (
        <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-2xl">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
}
