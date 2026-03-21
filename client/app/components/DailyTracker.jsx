"use client";
import React, { useState } from "react";

const DailyTracker = () => {
  const [pages, setPages] = useState("");
  const [notes, setNotes] = useState("");
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // Future expansion: Send data to backend here
    setPages("");
    setNotes("");
    // We could add a micro-animation or toast for success here
  };

  return (
    <section className="animate-fade-in w-full mb-10">
      <div className="glass-panel p-6 md:p-8 streak-card">
        <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold mb-2">
              <span className="text-gradient">Daily Reading Log</span>
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">
              Keep your streak alive. What did you read today?
            </p>
          </div>
          
          <div className="flex items-center gap-6 bg-[var(--bg-secondary)] px-6 py-4 rounded-[var(--radius-md)] border border-[var(--border-color)]">
            <div className="text-center">
              <div className="text-xs text-[var(--text-secondary)] uppercase tracking-wider mb-1 font-semibold">Streak</div>
              <div className="text-xl font-bold text-[var(--accent-success)] flex items-center justify-center gap-1">
                <span>🔥</span> 12 Days
              </div>
            </div>
            <div className="w-px h-10 bg-[var(--border-color)] hidden sm:block"></div>
            <div className="text-center hidden sm:block">
              <div className="text-xs text-[var(--text-secondary)] uppercase tracking-wider mb-1 font-semibold">Goal</div>
              <div className="text-xl font-bold text-[var(--accent-primary)]">20/30 pgs</div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <label className="block text-sm font-medium mb-2 text-[var(--text-primary)]">
                Pages Read Today
              </label>
              <input 
                type="number" 
                className="premium-input placeholder-[rgba(255,255,255,0.2)]" 
                placeholder="e.g. 15"
                value={pages}
                onChange={(e) => setPages(e.target.value)}
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2 text-[var(--text-primary)]">
                Context & Notes for Tomorrow
              </label>
              <textarea 
                className="premium-input min-h-[100px] resize-y placeholder-[rgba(255,255,255,0.2)]" 
                placeholder="What happened in the story? Let's leave a brief note to pick up tomorrow..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              ></textarea>
            </div>
          </div>
          <div className="flex justify-end pt-2 border-t border-[rgba(255,255,255,0.05)] mt-6">
            <button type="submit" className="premium-btn w-full md:w-auto mt-4">
              Log Progress 🚀
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default DailyTracker;
