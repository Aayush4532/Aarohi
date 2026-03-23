"use client";
import React from "react";
import UserProfile from "./UserProfile";

const SideBar = ({ activeBar, setActiveBar, user, onOpenSearch }) => {
  const isOpen = activeBar === "side";
  return (
    <>
      <div
        className="fixed top-0 left-0 h-screen w-[3px] z-50"
        onMouseEnter={() => {
          if (activeBar !== "top") {
            setActiveBar("side");
          }
        }}
      />
      <div
        onMouseLeave={() => setActiveBar(null)}
        className={`
          fixed top-0 left-0 h-screen w-80
          bg-black/90 backdrop-blur-xl border-r border-white/10
          transform transition-transform duration-300
          ease-[cubic-bezier(0.22,1,0.36,1)]
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          z-40
        `}
      >
        <div className="flex flex-col h-full bg-[var(--background)]/90 backdrop-blur-md border-r border-[#1e293b]">
          <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8">

            {/* SEARCH BUTTON (Global Trigger) */}
            <button
              onClick={(e) => {
                e.preventDefault();
                onOpenSearch();
                setActiveBar(null); // Auto-close sidebar on mobile
              }}
              className="w-full flex items-center justify-between px-4 py-3 bg-white/[0.03] hover:bg-white/[0.08] text-gray-400 hover:text-white rounded-xl border border-white/5 transition-all duration-300 group"
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                <span className="font-medium">Search Library</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="px-2 py-1 text-[10px] bg-black/40 border border-white/10 rounded-md font-mono text-gray-500">Ctrl</kbd>
                <kbd className="px-2 py-1 text-[10px] bg-black/40 border border-white/10 rounded-md font-mono text-gray-500">K</kbd>
              </div>
            </button>

            {/* BROWSE SECTION */}
            <div>
              <p className="px-4 text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase mb-4">Browse</p>
              <nav className="space-y-1.5">
                <a href="#" className="flex items-center gap-3 px-4 py-3 bg-blue-500/10 text-blue-400 rounded-xl font-medium border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)] relative overflow-hidden group">
                  <div className="absolute inset-y-0 left-0 w-1 bg-blue-500 rounded-r-full"></div>
                  <svg className="w-5 h-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                  <span className="relative z-10">Trending</span>
                </a>
                <a href="#" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/[0.04] rounded-xl font-medium transition-all duration-300">
                  <svg className="w-5 h-5 text-gray-500 group-hover:text-gray-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>
                  New Releases
                </a>
                <a href="#" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/[0.04] rounded-xl font-medium transition-all duration-300">
                  <svg className="w-5 h-5 text-gray-500 group-hover:text-gray-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  Curated Lists
                </a>
              </nav>
            </div>

            {/* YOUR SPACE SECTION */}
            <div>
              <p className="px-4 text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase mb-4 mt-8">Your Space</p>
              <nav className="space-y-1.5">
                <a href="/MyLibrary" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/[0.04] rounded-xl font-medium transition-all duration-300">
                  <svg className="w-5 h-5 text-gray-500 group-hover:text-gray-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"></path></svg>
                  My Library
                </a>
                <a href="#" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/[0.04] rounded-xl font-medium transition-all duration-300">
                  <svg className="w-5 h-5 text-gray-500 group-hover:text-gray-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                  Annotations
                </a>
                <a href="#" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/[0.04] rounded-xl font-medium transition-all duration-300">
                  <svg className="w-5 h-5 text-gray-500 group-hover:text-gray-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path></svg>
                  Reading List
                </a>
              </nav>
            </div>
          </div>

          <div className="p-4 border-t border-[#1e293b]">
            <UserProfile user={user} />
          </div>
        </div>
      </div>
    </>
  );
};

export default SideBar;