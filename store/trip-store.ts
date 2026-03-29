import { create } from "zustand";
import { persist } from "zustand/middleware";

interface TripStore {
  currentTripId: string | null;
  setCurrentTripId: (id: string) => void;
  clearCurrentTripId: () => void;
  currentMemberID: string | null;
  setCurrentMemberID: (id: string) => void;
  clearCurrentMemberID: () => void;
}

export const useTripStore = create<TripStore>()(
  persist(
    (set) => ({
      currentTripId: null,
      setCurrentTripId: (id) => set({ currentTripId: id }),
      clearCurrentTripId: () => set({ currentTripId: null }),
      currentMemberID: null,
      setCurrentMemberID: (id) => set({ currentMemberID: id }),
      clearCurrentMemberID: () => set({ currentMemberID: null }),
    }),
    {
      name: "tabikake-trip",
    }
  )
);
