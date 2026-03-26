"use client";

import { createContext, useCallback, useContext, useState } from "react";

interface Toast {
  id: number;
  message: string;
  type: "error" | "success" | "info";
}

interface ToastContextValue {
  toast: (message: string, type?: Toast["type"]) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  let nextId = 0;

  const toast = useCallback((message: string, type: Toast["type"] = "info") => {
    const id = ++nextId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const colors = {
    error: "bg-red-500/90 text-white",
    success: "bg-green-500/90 text-white",
    info: "bg-[#242424] text-[#f0f0f0] border border-[#2e2e2e]",
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast container */}
      <div className="fixed top-safe left-0 right-0 z-[100] flex flex-col items-center gap-2 pt-4 pointer-events-none px-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`${colors[t.type]} rounded-2xl px-4 py-3 text-sm font-medium shadow-lg max-w-sm w-full text-center animate-fade-in`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx.toast;
}
