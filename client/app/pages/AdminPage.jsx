"use client";
import React from "react";

const AdminPage = () => {
  const handleAddBookBtn = () => {
    window.location.href = "/admin/addBook";
  };

  const handleUpdateBookBtn = () => {
    window.location.href = "/admin/updateBook";
  };

  const handleDeleteBookBtn = () => {
    console.log("Delete Book Clicked");
  };

  const adminCards = [
    {
      title: "Add Book",
      description: "Publish a new book to the library collection.",
      action: handleAddBookBtn,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
      ),
      colorClass: "from-emerald-500/20 to-emerald-500/5 hover:border-emerald-500/50 text-emerald-400 group-hover:text-emerald-300",
      glowClass: "group-hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]",
    },
    {
      title: "Update Book",
      description: "Edit metadata, cover images, or content details.",
      action: handleUpdateBookBtn,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
      ),
      colorClass: "from-blue-500/20 to-blue-500/5 hover:border-blue-500/50 text-blue-400 group-hover:text-blue-300",
      glowClass: "group-hover:shadow-[0_0_30px_rgba(59,130,246,0.3)]",
    },
    {
      title: "Delete Book",
      description: "Permanently remove a book from the library.",
      action: handleDeleteBookBtn,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
      ),
      colorClass: "from-rose-500/20 to-rose-500/5 hover:border-rose-500/50 text-rose-400 group-hover:text-rose-300",
      glowClass: "group-hover:shadow-[0_0_30px_rgba(244,63,94,0.3)]",
    }
  ];

  return (
    <div className="w-full text-white pb-20 px-6 md:px-12 lg:px-20 font-sans animate-in fade-in duration-700">
      
      <div className="max-w-6xl mx-auto pt-8 md:pt-16">
        
        {/* Header Section */}
        <div className="mb-16">
          <div className="inline-block px-3 py-1 mb-4 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold tracking-widest rounded-full shadow-[0_0_15px_rgba(168,85,247,0.15)]">
            ADMINISTRATION
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
            Control Center
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl font-light">
            Manage your library's catalog. Select an action below to add new titles, update existing records, or remove books from the system.
          </p>
        </div>

        {/* Action Cards Grid */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {adminCards.map((card, idx) => (
            <button
              key={idx}
              onClick={card.action}
              className={`group relative cursor-pointer text-left p-8 rounded-3xl bg-gradient-to-br ${card.colorClass} border border-white/5 backdrop-blur-xl transition-all duration-500 hover:scale-[1.02] ${card.glowClass} overflow-hidden`}
            >
              {/* Subtle background glow effect */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none transition-opacity group-hover:opacity-100 opacity-50"></div>
              
              <div className={`mb-6 inline-flex p-4 rounded-2xl bg-white/5 border border-white/10 shadow-lg`}>
                {card.icon}
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-white transition-colors">
                {card.title}
              </h2>
              
              <p className="text-gray-400 text-sm leading-relaxed">
                {card.description}
              </p>

              {/* Arrow indicator */}
              <div className="absolute bottom-8 right-8 opacity-0 -translate-x-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
              </div>
            </button>
          ))}
        </div>

      </div>
    </div>
  );
};

export default AdminPage;