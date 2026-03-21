"use client";
import React from "react";

const NextBestBook = () => {
  return (
    <section className="animate-slide-in w-full mb-12">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-[var(--accent-primary)]/20 p-2 rounded-lg">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            <path d="m20 12-4-4-4 4"/>
          </svg>
        </div>
        <h2 className="text-2xl font-bold">
          Top Pick for You
        </h2>
      </div>

      <div className="glass-panel p-6 md:p-10 relative overflow-hidden group">
        {/* Ambient glow effect background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent-primary)] opacity-10 rounded-full blur-[80px] group-hover:opacity-20 transition-opacity duration-500 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[var(--accent-secondary)] opacity-10 rounded-full blur-[80px] group-hover:opacity-20 transition-opacity duration-500 pointer-events-none"></div>

        <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
          
          {/* Book Cover Placeholder/Mock */}
          <div className="w-48 h-72 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] transform group-hover:-translate-y-2 transition-transform duration-300 relative overflow-hidden shrink-0 border border-[rgba(255,255,255,0.1)]">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-800 opacity-90"></div>
            <div className="absolute inset-0 p-4 flex flex-col justify-between">
              <div className="text-[10px] uppercase text-white/70 tracking-widest font-bold">Bestseller</div>
              <div>
                <h3 className="text-2xl font-bold text-white leading-tight mb-2">The <br/>Midnight<br/>Library</h3>
                <p className="text-sm text-white/80">Matt Haig</p>
              </div>
            </div>
            {/* Book Spine lighting effect */}
            <div className="absolute top-0 bottom-0 left-0 w-4 bg-gradient-to-r from-white/20 to-transparent"></div>
          </div>

          <div className="flex-1 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(59,130,246,0.15)] text-[var(--accent-primary)] text-xs font-semibold uppercase tracking-wider border border-[rgba(59,130,246,0.3)]">
              <span>✨</span> 98% Match
            </div>
            
            <div>
              <h3 className="text-3xl md:text-4xl font-bold mb-2">The Midnight Library</h3>
              <p className="text-[var(--text-secondary)] text-lg">by Matt Haig</p>
            </div>

            <p className="text-[var(--text-primary)]/80 leading-relaxed max-w-2xl text-base md:text-lg">
              Between life and death there is a library, and within that library, the shelves go on forever. Every book provides a chance to try another life you could have lived. Based on your recent reading history of philosophical fiction, this will be your next unputdownable read.
            </p>

            <div className="flex flex-wrap gap-3 pt-4">
              <button className="premium-btn text-lg py-3 px-8 flex items-center gap-2">
                Start Reading
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </button>
              <button className="px-8 py-3 rounded-xl border border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.05)] transition-colors text-lg font-medium">
                Add to Queue
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NextBestBook;
