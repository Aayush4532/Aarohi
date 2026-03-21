"use client";
import React from "react";

const Loading = () => {
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-[#05080f]/90 backdrop-blur-2xl animate-[fadeIn_.5s_ease-out]">
      
      <div className="flex flex-col items-center justify-center gap-12">
        
        {/* Elegant Abstract Animation Container */}
        <div className="relative w-32 h-32 flex items-center justify-center">
          
          {/* Outer Rotating Glow */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-600/20 via-transparent to-purple-600/20 animate-[spin_4s_linear_infinite] blur-xl"></div>
          
          {/* Middle Counter-Rotating Ring */}
          <div className="absolute inset-2 rounded-full border border-white/10 border-t-blue-500/50 border-r-purple-500/50 animate-[spin_3s_linear_infinite_reverse]"></div>
          
          {/* Inner Pulsating Core */}
          <div className="absolute inset-8 rounded-full bg-white/5 border border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.1)] flex items-center justify-center animate-[pulse_2s_ease-in-out_infinite]">
            <svg className="w-6 h-6 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
            </svg>
          </div>

        </div>

        {/* Elegant Typography */}
        <div className="flex flex-col items-center gap-2">
          <p className="text-white/90 text-sm font-medium tracking-[0.3em] uppercase">
            Curating Library
          </p>
          <div className="flex gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-[bounce_1.4s_infinite_ease-in-out_-.32s]"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-[bounce_1.4s_infinite_ease-in-out_-.16s]"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-[bounce_1.4s_infinite_ease-in-out]"></span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Loading;