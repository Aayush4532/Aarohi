import React, { useEffect, useRef, useState } from "react";

const GlobalSearch = ({ isOpen, onClose }) => {
  const inputRef = useRef(null);
  
  // Dragging State
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Auto-focus and reset position when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      setPosition({ x: 0, y: 0 });
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Dragging Logic
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragStart]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4 pointer-events-none">
      
      {/* Darkened Backdrop with premium blur */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-md animate-[fadeIn_0.2s_ease-out] pointer-events-auto"
        onClick={onClose}
      />

      {/* Draggable Wrapper */}
      <div 
        className="relative w-full max-w-3xl pointer-events-auto"
        style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Main Search Container */}
        <div className="w-full bg-[#0b1120]/80 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-[0_30px_100px_rgba(0,0,0,0.9),0_0_80px_rgba(59,130,246,0.15)] animate-[scaleIn_0.2s_ease-out] overflow-hidden flex flex-col">
          
          {/* Drag Handle Top Bar */}
          <div 
            className="h-8 w-full flex items-center justify-center cursor-grab active:cursor-grabbing hover:bg-white/[0.04] transition-colors border-b border-white/5"
            onMouseDown={handleMouseDown}
          >
            <div className="w-16 h-1.5 rounded-full bg-white/20"></div>
          </div>

          {/* Input Area */}
          <div className="flex items-center px-6 py-5 border-b border-white/5">
            <svg className="w-6 h-6 text-blue-500 mr-4 flex-shrink-0 drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <input
              ref={inputRef}
              type="text"
              placeholder="Search books, authors, ISBNs, or users..."
              className="w-full bg-transparent border-none outline-none text-xl sm:text-2xl font-light text-white placeholder-gray-500 tracking-wide"
            />
            <button 
              onClick={onClose}
              className="ml-4 flex items-center justify-center p-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors border border-transparent hover:border-white/10"
            >
              <span className="text-[10px] font-bold uppercase tracking-widest px-1">ESC</span>
            </button>
          </div>

          {/* Quick Filters / Suggestions Area */}
          <div className="px-6 py-6 bg-gradient-to-b from-black/0 to-black/40">
            <p className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-4">Quick Filters</p>
            <div className="flex flex-wrap gap-3">
              <button className="px-5 py-2 rounded-xl bg-blue-500/10 text-blue-400 text-sm font-semibold border border-blue-500/20 hover:bg-blue-500/20 hover:border-blue-500/40 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all duration-300">
                @ Authors
              </button>
              <button className="px-5 py-2 rounded-xl bg-white/5 text-gray-300 text-sm font-semibold border border-white/5 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all duration-300">
                # Fiction
              </button>
              <button className="px-5 py-2 rounded-xl bg-white/5 text-gray-300 text-sm font-semibold border border-white/5 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all duration-300">
                # Self-Help
              </button>
            </div>
            
            {/* Recent Searches Placeholder */}
            <p className="text-xs font-bold tracking-widest text-gray-500 uppercase mt-8 mb-4">Recent Searches</p>
            <div className="space-y-2 relative">
               <button className="w-full text-left px-5 py-3.5 rounded-xl flex items-center text-gray-400 hover:text-white bg-transparent hover:bg-white/5 border border-transparent hover:border-white/10 transition-all duration-300 group">
                  <svg className="w-4 h-4 mr-4 opacity-50 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  <span className="text-sm font-medium">The Psychology of Money</span>
               </button>
               <button className="w-full text-left px-5 py-3.5 rounded-xl flex items-center text-gray-400 hover:text-white bg-transparent hover:bg-white/5 border border-transparent hover:border-white/10 transition-all duration-300 group">
                  <svg className="w-4 h-4 mr-4 opacity-50 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  <span className="text-sm font-medium">Atomic Habits</span>
               </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default GlobalSearch;
