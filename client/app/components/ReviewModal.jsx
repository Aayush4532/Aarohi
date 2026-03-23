"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useToast } from "@/app/contexts/ToastContext";

const ReviewModal = ({ isOpen, onClose, bookId }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { addToast } = useToast();

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ startX: 0, startY: 0, initX: 0, initY: 0 });

  useEffect(() => {
    if (isOpen) {
      setPosition({
        x: window.innerWidth > 600 ? window.innerWidth / 2 - 200 : 20,
        y: window.innerHeight / 2 - 200
      });
      setRating(0);
      setReviewText("");
    }
  }, [isOpen]);

  const handleDragStart = (e) => {
    if (e.target.tagName.toLowerCase() === 'textarea' || e.target.tagName.toLowerCase() === 'button') return;
    setIsDragging(true);
    const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
    dragStartPos.current = { startX: clientX, startY: clientY, initX: position.x, initY: position.y };
  };

  useEffect(() => {
    const handleDragMove = (e) => {
      if (!isDragging) return;
      const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
      const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
      const dx = clientX - dragStartPos.current.startX;
      const dy = clientY - dragStartPos.current.startY;
      setPosition({ x: dragStartPos.current.initX + dx, y: dragStartPos.current.initY + dy });
    };

    const handleDragEnd = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleDragMove);
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('touchmove', handleDragMove, { passive: false });
      window.addEventListener('touchend', handleDragEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleDragMove);
      window.removeEventListener('touchend', handleDragEnd);
    };
  }, [isDragging]);

  const handleSubmit = async () => {
    if (rating === 0) {
      addToast("Please provide a rating.", "error");
      return;
    }
    if (!reviewText.trim()) {
      addToast("Please write a review.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(process.env.NEXT_PUBLIC_BACKEND_URI + `/api/review/${bookId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ rating, review: reviewText })
      });
      
      if (res.ok) {
        addToast("Review submitted successfully!", "success");
        // Reload page so that the latest community review is fetched and rendered
        window.location.reload();
        onClose();
      } else {
        const errText = await res.text();
        console.error("Backend Error:", errText);
        addToast(errText || "Failed to submit review.", "error");
      }
    } catch (err) {
      console.error("Network Error:", err);
      addToast("Failed to connect to the server.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed z-[150] w-[calc(100%-40px)] md:w-[400px] bg-[#0b1120]/95 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-[0_30px_60px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.05)] overflow-hidden flex flex-col transition-transform duration-75 ${isDragging ? 'scale-[1.02] opacity-90' : 'scale-100 opacity-100'}`}
      style={{ left: position.x, top: position.y }}
    >
      <div
        className="p-5 border-b border-white/[0.05] flex justify-between items-center cursor-move bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
      >
        <div className="flex items-center gap-3 pointer-events-none">
          <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
          <h3 className="text-white font-bold tracking-wide">Write a Review</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer border border-transparent hover:border-white/10 active:scale-95"
          title="Close"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>

      <div className="p-6 flex flex-col gap-6">
        <div className="flex flex-col items-center">
          <span className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-widest">Your Rating</span>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                className="focus:outline-none transition-transform hover:scale-125 active:scale-90"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
              >
                <svg
                  className={`w-9 h-9 drop-shadow-md transition-colors duration-200 ${star <= (hoverRating || rating)
                      ? 'text-yellow-400 fill-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]'
                      : 'text-gray-600 fill-transparent'
                    }`}
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col">
          <textarea
            placeholder="Share your thoughts about this book..."
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            className="w-full h-32 bg-[#050810]/50 border border-white/10 rounded-xl p-4 text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all resize-none shadow-inner custom-scrollbar text-[15px]"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`w-full py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${isSubmitting
              ? 'bg-blue-600/30 text-white/50 cursor-not-allowed border border-blue-500/30'
              : 'bg-gradient-to-tr from-blue-700 to-blue-500 hover:from-blue-600 hover:to-blue-400 text-white shadow-[0_10px_20px_rgba(37,99,235,0.3)] hover:shadow-[0_15px_30px_rgba(37,99,235,0.4)] active:scale-95 border border-blue-400/40'
            }`}
        >
          {isSubmitting ? (
            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle><path fill="currentColor" d="M4 12a8 8 0 018-8v8a8 8 0 00-8-8z" className="opacity-75"></path></svg>
          ) : "Publish Review"}
        </button>
      </div>
    </div>
  );
}

export default ReviewModal;
