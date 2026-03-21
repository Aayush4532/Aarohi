"use client";
import React, { useState, useEffect } from "react";
import SideBar from "./components/SideBar";
import UpperBar from "./components/Upperbar";
import GlobalSearch from "./components/GlobalSearch";

export default function ClientLayout({ children }) {
  const [activeBar, setActiveBar] = useState(null);
  const [user, setUser] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(
          process.env.NEXT_PUBLIC_BACKEND_URI + "/user",
          {
            method: "GET",
            credentials: "include",
          }
        );
        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    };

    fetchUser();
  }, []);

  return (
    <div className="min-h-screen bg-[var(--background)] flex font-sans">
      <UpperBar activeBar={activeBar} setActiveBar={setActiveBar} user={user} />

      <div className="flex flex-1 w-full relative">
        <SideBar
          activeBar={activeBar}
          setActiveBar={setActiveBar}
          user={user}
          onOpenSearch={() => setIsSearchOpen(true)}
        />
        
        {/* Main content area wrapped cleanly, allowing pages to control their own padding/margins */}
        <main className="flex-1 w-full flex flex-col items-center justify-start overflow-x-hidden">
          {children}
        </main>
      </div>

      {/* Global Spotlight Search Overlay */}
      <GlobalSearch 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />
    </div>
  );
}
