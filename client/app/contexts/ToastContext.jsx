"use client";
import React, { createContext, useContext, useState, useCallback } from "react";

// The Context
const ToastContext = createContext();

// Hook to use Toasts globally
export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  // Add a new toast
  const addToast = useCallback((message, type = "error", duration = 4000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto-remove after duration
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  // Remove specific toast manually
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {/* Toast Container - Fixed Position */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 px-5 py-4 rounded-2xl border backdrop-blur-3xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] transform transition-all animate-[slideInRight_0.4s_ease-out] relative overflow-hidden group min-w-[300px]
              ${
                toast.type === "success"
                  ? "bg-emerald-950/40 border-emerald-500/20 text-emerald-100"
                  : toast.type === "error"
                  ? "bg-rose-950/40 border-rose-500/30 text-rose-100"
                  : "bg-blue-950/40 border-blue-500/20 text-blue-100"
              }`}
          >
            {/* Background Glow */}
            <div
              className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-[40px] opacity-40 mix-blend-screen pointer-events-none
              ${
                toast.type === "success"
                  ? "bg-emerald-500"
                  : toast.type === "error"
                  ? "bg-rose-500"
                  : "bg-blue-500"
              }`}
            />

            {/* Icon */}
            <div
              className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full border shadow-inner bg-black/20
                ${
                  toast.type === "success"
                    ? "border-emerald-500/30 text-emerald-400"
                    : toast.type === "error"
                    ? "border-rose-500/30 text-rose-400"
                    : "border-blue-500/30 text-blue-400"
                }`}
            >
              {toast.type === "success" ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
              ) : toast.type === "error" ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>

            {/* Message */}
            <p className="flex-1 text-sm font-medium tracking-wide">
              {toast.message}
            </p>

            {/* Close Button */}
            <button
              onClick={() => removeToast(toast.id)}
              className="text-white/40 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
