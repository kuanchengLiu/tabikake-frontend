import { create } from "zustand";
import { persist } from "zustand/middleware";

interface TripStore {
  currentTripId: string | null;
  setCurrentTripId: (id: string) => void;
  clearCurrentTripId: () => void;
}

export const useTripStore = create<TripStore>()(
  persist(
    (set) => ({
      currentTripId: null,
      setCurrentTripId: (id) => set({ currentTripId: id }),
      clearCurrentTripId: () => set({ currentTripId: null }),
    }),
    {
      name: "tabikake-trip",
    }
  )
);
