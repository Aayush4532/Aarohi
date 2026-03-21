"use client";
import React from "react";

const UpperBar = ({ activeBar, setActiveBar, user }) => {
  const isOpen = activeBar === "top";
  return (
    <>
      <div
        className="fixed top-0 left-0 w-screen h-[3px] z-50"
        onMouseEnter={() => {
          if (activeBar !== "side") {
            setActiveBar("top");
          }
        }}
      />

      <div
        onMouseLeave={() => setActiveBar(null)}
        className={`
          fixed top-0 left-0 w-full
          overflow-hidden
          bg-[#070b14]/80 backdrop-blur-2xl border-b border-white/5
          transition-all duration-300
          ease-[cubic-bezier(0.22,1,0.36,1)]
          ${isOpen ? "h-[88px]" : "h-0"}
          z-40
        `}
      >
        <div className="h-[88px] flex items-center justify-between px-8 text-white w-full max-w-[1400px] mx-auto">
          {/* Logo (since Sidebar might be hidden) */}
          <div className="flex items-center mr-8 h-[88px] py-4">
            <img src="/logo.png" alt="Aarohi Logo" className="h-full w-[120px] object-cover drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]" />
          </div>

          {/* Main Navigation Links */}
          <div className="flex-1 max-w-3xl mx-auto px-4 flex items-center justify-center gap-8 md:gap-12 text-sm font-medium tracking-wide">
            <a href="#" className="hidden md:flex items-center text-gray-300 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.6)] transition-all duration-300">
              Discover
            </a>
            <a href="#" className="flex items-center text-gray-300 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.6)] transition-all duration-300">
              Debate
            </a>
            <a href="#" className="flex items-center text-gray-300 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.6)] transition-all duration-300">
              Challenge
            </a>
            {/* Space reserved for 3 more future routes here */}
          </div>

          {/* Right Side Elements */}
          <div className="flex items-center gap-6 border-l border-white/10 pl-8">
            
            {/* Streak */}
            <div title="Current Streak" className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-orange-500/5 text-orange-400 border border-transparent hover:border-orange-500/30 hover:bg-orange-500/10 hover:shadow-[0_0_15px_rgba(249,115,22,0.3)] transition-all duration-300 cursor-default">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"></path></svg>
              <span className="font-bold">{user?.streak ?? user?.Streak ?? 0}</span>
            </div>

            {/* Notifications */}
            <button className="relative text-gray-400 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.6)] transition-all duration-300">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
              {/* Glowing Unread Badge */}
              <span className="absolute top-0 right-0 w-2 h-2 bg-rose-500 border border-[#070b14] rounded-full shadow-[0_0_8px_rgba(244,63,94,0.8)]"></span>
            </button>

            {/* Secondary Menu */}
            <button className="text-gray-400 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.6)] transition-all duration-300">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03-8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default UpperBar;