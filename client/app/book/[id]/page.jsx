"use client";

import Loading from "@/app/components/Loading";
import Books from "@/app/components/Books";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import { useToast } from "@/app/contexts/ToastContext";

const Page = () => {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [isStarting, setIsStarting] = useState(false);

  // Notes State
  const [notes, setNotes] = useState([]);
  const [widgetNoteIndex, setWidgetNoteIndex] = useState(0);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [activeModalNoteId, setActiveModalNoteId] = useState(null);
  const [isEditingNote, setIsEditingNote] = useState(false);

  // Read Session State
  const [isReadSessionModalOpen, setIsReadSessionModalOpen] = useState(false);
  const [pagesReadToday, setPagesReadToday] = useState('');
  const [sessionNote, setSessionNote] = useState('');

  // Progress Local Override State (for instant UI updates)
  const [localProgressOverride, setLocalProgressOverride] = useState(null);
  const [localCurrentPageOverride, setLocalCurrentPageOverride] = useState(null);

  // Pluck the user from context to check currently_reading status
  const { user, checkUser } = useAuth() || { user: null };
  const { addToast } = useToast();

  const currentlyReadingArray = user?.currently_reading || user?.CurrentlyReading || [];
  const userCurrentlyReading = currentlyReadingArray.find(r => {
    const rId = r.book_id || r.BookID || r.bookId;
    return rId === book?.id || rId === id;
  }) || null;

  // Sync backend notes to frontend UI
  useEffect(() => {
    if (userCurrentlyReading) {
      const backendNotes = userCurrentlyReading.notes || userCurrentlyReading.Notes || [];
      // Reverse the array so the most recent notes appear first in the widget and modal sidebar
      const formatted = backendNotes.map((str, idx) => ({
        id: Date.now() + idx,
        content: str,
      })).reverse();
      
      setNotes(formatted);
      setWidgetNoteIndex(0); // Reset widget index to show latest
      if (formatted.length > 0) {
        setActiveModalNoteId(formatted[0].id); // Default modal focus to latest
      }
    }
  }, [userCurrentlyReading]);

  // UI Helpers for Apple Notes style parsing (first line is title)
  const getNoteTitle = (content) => {
    if (!content) return "New Note";
    const lines = content.split('\n').filter(line => line.trim() !== '');
    return lines.length > 0 ? lines[0].substring(0, 40) : "New Note";
  };

  const getNotePreview = (content) => {
    if (!content) return "...";
    const lines = content.split('\n').filter(line => line.trim() !== '');
    if (lines.length > 1) {
      return lines.slice(1).join(' ').substring(0, 100);
    }
    return "...";
  };

  useEffect(() => {
    if (isNotesModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isNotesModalOpen]);

  useEffect(() => {
    if (!id) return;

    const fetchBook = async () => {
      try {
        const res = await fetch(
          process.env.NEXT_PUBLIC_BACKEND_URI + `/api/book/${id}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (res.ok) {
          const data = await res.json();
          setBook(data);
        }
      } catch (err) {
        console.error("Failed to fetch book data", err);
      }
    };

    fetchBook();
  }, [id]);

  if (!book) return <Loading />;

  // Calculate Reading Progress Percentage
  let progressPercentage = 0;
  let displayCurrentPage = 0;

  if (userCurrentlyReading || localCurrentPageOverride !== null) {
    const backendPage = userCurrentlyReading?.current_page || userCurrentlyReading?.CurrentPage || 0;
    displayCurrentPage = localCurrentPageOverride !== null ? localCurrentPageOverride : backendPage;

    if (localProgressOverride !== null) {
      progressPercentage = localProgressOverride;
    } else {
      progressPercentage = userCurrentlyReading?.complete || userCurrentlyReading?.Complete || 0;
      // Recalculate manually just in case backend `complete` field is missing or 0 but page > 0
      const totalPages = book?.page_count || 0;
      if (progressPercentage === 0 && totalPages > 0 && displayCurrentPage > 0) {
         progressPercentage = Math.round((displayCurrentPage / totalPages) * 100);
      }
      if (progressPercentage > 100) progressPercentage = 100;
    }
  }

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString || dateString === "0001-01-01T00:00:00Z") return "";
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleBtnReadClick = () => {
    if (userCurrentlyReading == null) {
      StartReadingBtnClick();
    }
    else {
      ReadBtnClick();
    }
  }

  const ReadBtnClick = () => {
    setIsReadSessionModalOpen(true);
  }

  const handleSaveReadSession = async () => {
    if (!pagesReadToday || isNaN(pagesReadToday) || pagesReadToday > 60 || pagesReadToday < 1) {
      addToast("Please enter a valid page number (Max 60 pages).", "error");
      return;
    }

    const wordCount = sessionNote.trim() ? sessionNote.trim().split(/\s+/).length : 0;
    if (wordCount < 100) {
      addToast(`Please write at least 100 words. (Currently: ${wordCount})`, "error");
      return;
    }
    
    // ==========================================
    // BACKEND API CALL GOES HERE!
    // ==========================================
    try {
      const res = await fetch(process.env.NEXT_PUBLIC_BACKEND_URI + `/api/read/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          page: Number(pagesReadToday),
          notes: sessionNote
        })
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Backend Error:", errorText);
        throw new Error("Failed to save progress on backend.");
      }
      
      const data = await res.json();
      
      // Update local overrides instantly using the backend's response payload!
      if (data.total_page !== undefined) setLocalCurrentPageOverride(data.total_page);
      if (data.percent_done !== undefined) setLocalProgressOverride(data.percent_done);
      if (data.book_finished) setLocalProgressOverride(100);
      
      // Refresh global user state to refresh the reading progress UI automatically!
      if (checkUser) await checkUser();

    } catch (err) {
      console.error(err);
      addToast("Server Error: Couldn't sync progress.", "error");
      return;
    }
    // ==========================================

    addToast("Reading session logged successfully!", "success");
    setIsReadSessionModalOpen(false);
    setPagesReadToday('');
    setSessionNote('');
  }

  const StartReadingBtnClick = async () => {
    try {
      setIsStarting(true);
      const res = await fetch(process.env.NEXT_PUBLIC_BACKEND_URI + `/api/start/${id}`, {
        method: "POST",
        credentials: "include",
      })
      if (!res.ok) {
        throw new Error("Failed to start reading");
      }

      // Refresh Auth Context natively to trigger the UI "Read" state update
      if (checkUser) {
        await checkUser();
      }
    } catch (err) {
      console.error("Failed to start reading", err);
    } finally {
      setIsStarting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-white pb-20 px-6 md:px-12 lg:px-20 overflow-x-hidden font-sans animate-in fade-in duration-700">
      <div className="max-w-[1400px] mx-auto mt-10 md:mt-16">


        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-10">
          <a href="/" className="hover:text-white transition-colors">Home</a>
          <span className="text-gray-600">›</span>
          <span className="hover:text-white transition-colors cursor-pointer">{book.categories?.[0] || 'Uncategorized'}</span>
          <span className="text-gray-600">›</span>
          <span className="text-gray-200 font-medium truncate max-w-[200px] md:max-w-md">{book.title}</span>
        </nav>

        {/* Main Book Info Section */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">

          {/* Left Column: Cover & Actions */}
          <div className="w-full lg:w-[320px] flex-shrink-0 flex flex-col gap-6">
            <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.6)] border border-white/5 bg-[#0b1120]">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-transparent opacity-50 pointer-events-none z-10"></div>
              {book.thumbnail ? (
                <img
                  src={book.thumbnail}
                  alt={book.title}
                  className="w-full h-full object-cover relative z-0"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500 bg-white/5">No Cover Available</div>
              )}
              <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] pointer-events-none z-20"></div>
            </div>

            <div className="flex gap-3">
              <button
                className={`flex-1 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:-translate-y-0.5 ${isStarting
                  ? 'bg-blue-600/80 cursor-wait'
                  : 'bg-blue-600 hover:bg-blue-500 hover:shadow-[0_0_30px_rgba(37,99,235,0.5)]'
                  }`}
                onClick={handleBtnReadClick}
                disabled={isStarting}
              >
                {isStarting ? (
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                )}
                {isStarting ? 'Starting...' : (userCurrentlyReading ? 'Read' : 'Start Reading')}
              </button>
              <button className="w-14 h-[56px] flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all duration-300 hover:-translate-y-0.5">
                <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path></svg>
              </button>
            </div>

            {/* Notes Widget */}
            <div
              onClick={() => {
                setActiveModalNoteId(notes[widgetNoteIndex]?.id);
                setIsNotesModalOpen(true);
              }}
              className="group relative bg-white/[0.02] border border-white/5 hover:border-white/10 rounded-2xl p-5 backdrop-blur-md cursor-pointer hover:bg-white/[0.04] transition-all duration-300 overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.12)]"
            >
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-300">
                  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                  My Notes
                </div>
                {notes.length > 0 && (
                  <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setWidgetNoteIndex((prev) => (prev > 0 ? prev - 1 : notes.length - 1))}
                      className="p-1.5 rounded-md hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                    </button>
                    <button
                      onClick={() => setWidgetNoteIndex((prev) => (prev < notes.length - 1 ? prev + 1 : 0))}
                      className="p-1.5 rounded-md hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                    </button>
                  </div>
                )}
              </div>

              <div className="min-h-[75px]">
                {notes.length > 0 && notes[widgetNoteIndex] ? (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-300" key={widgetNoteIndex}>
                    <h4 className="text-white font-medium text-sm truncate mb-1.5">
                      {getNoteTitle(notes[widgetNoteIndex].content)}
                    </h4>
                    <p className="text-gray-400 text-xs line-clamp-3 leading-relaxed">
                      {getNotePreview(notes[widgetNoteIndex].content)}
                    </p>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center pt-2 gap-2 text-center">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                    <p className="text-xs text-gray-500 font-medium">No notes yet.<br /><span className="font-normal opacity-80 mt-0.5 block">Tap to write your first thought.</span></p>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Right Column: Details & Synopsis */}
          <div className="flex-1 space-y-8">

            {/* Title & Author */}
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-5xl font-extrabold tracking-tight text-white mb-2">
                {book.title || "Untitled Book"}
              </h1>
              <p className="text-xl md:text-2xl text-blue-400 font-medium">
                {book.author || "Unknown Author"}
              </p>
            </div>

            {/* Stats Bar */}
            <div className="flex flex-wrap items-center gap-8 py-6 border-y border-white/10">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-yellow-500 text-xl">★</span>
                  <span className="text-2xl font-bold text-white">{book.total_rating ? book.total_rating.toFixed(1) : "0.0"}</span>
                </div>
                <div className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">
                  {book.total_review || 0} reviews
                </div>
              </div>

              <div className="w-px h-10 bg-white/10"></div>

              <div>
                <div className="text-2xl font-bold text-white mb-1">{book.page_count || 0}</div>
                <div className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">Pages</div>
              </div>

              <div className="w-px h-10 bg-white/10"></div>

              <div>
                <div className="text-2xl font-bold text-white mb-1">English</div>
                <div className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">Language</div>
              </div>
            </div>

            {/* Categories */}
            {book.categories && book.categories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {book.categories.map((cat, idx) => (
                  <span key={idx} className="px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] uppercase font-bold tracking-widest">
                    {cat}
                  </span>
                ))}
              </div>
            )}

            {/* Synopsis */}
            <div className="pt-4">
              <h3 className="text-lg font-bold text-white mb-4">Synopsis</h3>
              <p className="text-gray-300 leading-relaxed text-sm md:text-base font-light whitespace-pre-wrap">
                {book.description || "No description available for this book."}
              </p>
            </div>

            {/* Reading Progress */}
            <div className="mt-8 p-6 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-md">
              <div className="flex justify-between flex-wrap gap-4 items-end mb-4">
                <h4 className="text-white font-bold">Reading Progress</h4>
                <span className="text-white font-bold text-lg leading-none">
                  {progressPercentage}%
                </span>
              </div>
              <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden mb-3">
                <div
                  className="h-full bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              <div className="text-[11px] text-gray-500">
                {userCurrentlyReading !== null || localCurrentPageOverride !== null
                  ? `Currently reading • Page ${displayCurrentPage}`
                  : "Not read yet"}
              </div>
            </div>
          </div>
        </div>

        {/* Community Reviews Section */}
        <div className="mt-24">
          <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
            <h2 className="text-2xl font-bold text-white">
              Community Reviews <span className="text-gray-500 text-sm ml-2 font-normal">({book.reviews?.length || 0})</span>
            </h2>
            {progressPercentage === 100 ? (
              <button className="text-blue-400 hover:text-blue-300 text-sm font-bold transition-colors shadow-[0_0_10px_rgba(59,130,246,0.3)] bg-blue-500/10 px-4 py-2 rounded-full border border-blue-500/20">
                Write a review
              </button>
            ) : (
              <div className="flex flex-col items-end">
                <button disabled className="text-gray-500 line-through text-sm font-medium cursor-not-allowed" title="Finish reading the book to write a review.">
                  Write a review
                </button>
                <span className="text-[10px] text-gray-500 italic mt-1">100% completion required</span>
              </div>
            )}
          </div>

          {book.reviews && book.reviews.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {book.reviews.map((rev) => (
                <div key={rev.id || rev.user_id || Math.random()} className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-md flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-10 h-10 rounded-full bg-blue-500/20 overflow-hidden flex items-center justify-center relative flex-shrink-0">
                        {rev.profile ? (
                          <img src={rev.profile} alt={rev.full_name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-blue-300 font-bold uppercase">{rev.full_name ? rev.full_name.charAt(0) : "U"}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-white truncate">{rev.full_name || "Anonymous User"}</div>
                        <div className="text-yellow-500 text-xs mt-0.5" title={`${rev.rating} out of 5 stars`}>
                          {/* Ensure rating is within 0-5 and fallback gracefully */}
                          {"★".repeat(Math.max(0, Math.min(5, rev.rating || 0)))}
                          {"☆".repeat(Math.max(0, 5 - (rev.rating || 0)))}
                        </div>
                      </div>
                      {rev.created_at && (
                        <div className="ml-auto text-xs text-gray-500 whitespace-nowrap self-start mt-1">
                          {formatDate(rev.created_at)}
                        </div>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm italic whitespace-pre-wrap">"{rev.review}"</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 rounded-2xl bg-white/[0.01] border border-white/5">
              <p className="text-gray-500 italic">No reviews yet. Be the first to share your thoughts!</p>
            </div>
          )}
        </div>

        {/* Similar Reads Placeholder */}
        <div className="mt-24 mb-12">
          <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
            <h2 className="text-2xl font-bold text-white">Similar Reads</h2>
          </div>
          <Books type="recommended" />
        </div>

      </div>

      {/* Mac OS Style Notes Modal */}
      {isNotesModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-12 font-sans">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-xl transition-opacity animate-in fade-in duration-300"
            onClick={() => setIsNotesModalOpen(false)}
          ></div>

          {/* Modal Container */}
          <div className="relative w-full max-w-6xl h-[85vh] md:h-[80vh] bg-[#1c1c1e]/80 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-[0_0_80px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-300 ring-1 ring-white/5">

            {/* Left Sidebar (Notes List) */}
            <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-white/10 bg-black/40 flex flex-col h-[40%] md:h-full flex-shrink-0 relative">
              {/* Sidebar Header */}
              <div className="p-5 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
                <h3 className="text-lg font-bold text-white tracking-wide">Notes</h3>
                <button
                  disabled
                  className="p-2 rounded-xl bg-gray-500/10 text-gray-600 cursor-not-allowed transition-all duration-300"
                  title="New Notes must be added during a Reading Session"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg>
                </button>
              </div>

              {/* Notes List */}
              <div className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar">
                {notes.map(note => (
                  <button
                    key={note.id}
                    onClick={() => {
                      setActiveModalNoteId(note.id);
                      setIsEditingNote(false);
                    }}
                    className={`w-full text-left p-4 rounded-2xl transition-all duration-200 border border-transparent ${activeModalNoteId === note.id
                      ? 'bg-blue-600/90 shadow-[0_4px_20px_rgba(37,99,235,0.3)] border-blue-400/30 text-white'
                      : 'hover:bg-white/5 text-gray-300 hover:border-white/5'
                      }`}
                  >
                    <div className="font-semibold text-[15px] truncate mb-1">
                      {getNoteTitle(note.content)}
                    </div>
                    <div className={`text-xs line-clamp-2 leading-relaxed ${activeModalNoteId === note.id ? 'text-blue-100/90' : 'text-gray-500'}`}>
                      {getNotePreview(note.content)}
                    </div>
                  </button>
                ))}
                {notes.length === 0 && (
                  <div className="text-center p-8 text-gray-500 text-sm italic">
                    No notes found.
                  </div>
                )}
              </div>
            </div>

            {/* Right Main Editor Area */}
            <div className="flex-1 flex flex-col h-[60%] md:h-full bg-black/20 relative">
              {/* Actions Header */}
              <div className="absolute top-4 right-4 z-10 flex gap-2">
                {activeModalNoteId && !isEditingNote && (
                  <>
                    <button
                      onClick={() => setIsEditingNote(true)}
                      className="p-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 transition-colors shadow-sm"
                      title="Edit Note"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                    </button>
                    <button
                      onClick={() => {
                        const newNotes = notes.filter(n => n.id !== activeModalNoteId);
                        setNotes(newNotes);
                        setActiveModalNoteId(newNotes[0]?.id || null);
                      }}
                      className="p-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-red-500/20 hover:border-red-500/30 hover:text-red-400 text-gray-300 transition-colors shadow-sm"
                      title="Delete Note"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                  </>
                )}
                {isEditingNote && (
                  <button
                    onClick={() => setIsEditingNote(false)}
                    className="px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-all shadow-[0_4px_15px_rgba(37,99,235,0.4)]"
                  >
                    Done
                  </button>
                )}
                <div className="w-px h-6 bg-white/10 self-center mx-1"></div>
                <button
                  onClick={() => setIsNotesModalOpen(false)}
                  className="p-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 transition-colors shadow-sm"
                  title="Close"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>

              {/* Editor Content Area */}
              <div className="flex-1 overflow-y-auto p-6 md:p-14 pt-24 custom-scrollbar">
                {activeModalNoteId && notes.find(n => n.id === activeModalNoteId) ? (
                  <div className="max-w-4xl mx-auto h-full flex flex-col">
                    <div className="text-gray-500 text-xs font-bold mb-4 uppercase tracking-widest flex items-center gap-2">
                      <svg className="w-4 h-4 text-blue-500/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                      {getNoteTitle(notes.find(n => n.id === activeModalNoteId)?.content)}
                    </div>

                    {isEditingNote ? (
                      <div className="flex flex-col h-full animate-in fade-in duration-300">
                        <textarea
                          className="w-full h-full min-h-[60vh] bg-transparent text-xl md:text-2xl text-gray-200 placeholder-gray-700 outline-none border-none focus:ring-0 resize-none leading-relaxed font-light"
                          placeholder="Start typing your thoughts here... The first line becomes the title."
                          value={notes.find(n => n.id === activeModalNoteId)?.content || ''}
                          autoFocus
                          onChange={(e) => {
                            setNotes(notes.map(n => n.id === activeModalNoteId ? { ...n, content: e.target.value } : n));
                          }}
                        />
                      </div>
                    ) : (
                      <div className="animate-in fade-in duration-300">
                        <div className="text-xl md:text-2xl text-gray-200 leading-relaxed whitespace-pre-wrap font-light">
                          {notes.find(n => n.id === activeModalNoteId)?.content ? (
                            <span className="break-words">{notes.find(n => n.id === activeModalNoteId)?.content}</span>
                          ) : (
                            <span className="italic text-gray-600">No content. Click Edit to start writing.</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-500 animate-in fade-in zoom-in-95 duration-500">
                    <div className="w-24 h-24 mb-6 rounded-3xl bg-white/[0.02] border border-white/5 flex items-center justify-center shadow-[0_0_50px_rgba(0,0,0,0.1)]">
                      <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                    </div>
                    <p className="text-xl font-bold text-gray-300">Select a note to read</p>
                    <p className="text-base mt-2 text-gray-500 font-light">or create a new one to capture your thoughts.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Log Reading Session Modal */}
      {isReadSessionModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 font-sans">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity animate-in fade-in duration-300"
            onClick={() => setIsReadSessionModalOpen(false)}
          ></div>

          {/* Modal Container */}
          <div className="relative w-full max-w-lg bg-[#0f141e] border border-white/10 rounded-2xl shadow-2xl p-6 md:p-8 animate-in zoom-in-95 duration-300">
            <h2 className="text-2xl font-bold text-white mb-2">Log Reading Session</h2>
            <p className="text-gray-400 text-sm mb-6">Track your progress and capture your daily insights.</p>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">How many pages did you read today?</label>
                <div className="relative">
                  <input
                    type="number"
                    max="60"
                    min="1"
                    value={pagesReadToday}
                    onChange={(e) => setPagesReadToday(e.target.value)}
                    placeholder="E.g., 25"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <div className="absolute inset-y-0 right-4 flex items-center text-xs text-gray-500 pointer-events-none">
                    Max 60
                  </div>
                </div>
              </div>

              <div className="flex flex-col mt-2">
                <div className="flex justify-between items-end mb-2">
                  <label className="block text-sm font-bold text-gray-200">Session Notes <span className="text-red-500 ml-1">*</span></label>
                  <span className="text-xs text-blue-400 opacity-80 flex items-center gap-1 font-medium">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                    Minimum 100 words
                  </span>
                </div>
                <div className="relative group">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-tr-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none z-10"></div>
                  <textarea
                    value={sessionNote}
                    onChange={(e) => setSessionNote(e.target.value)}
                    placeholder="Capture your insights, favorite quotes, or summaries here... (At least 100 words)"
                    className="w-full h-48 md:h-56 bg-[#161b26]/80 backdrop-blur-xl border border-white/10 rounded-xl px-5 py-5 text-gray-300 placeholder-gray-600 focus:outline-none focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/40 transition-all resize-none font-light leading-relaxed text-[15px] shadow-[inset_0_2px_15px_rgba(0,0,0,0.2)] relative z-0"
                  />
                  <div className="absolute bottom-5 right-5 text-xs font-semibold pointer-events-none z-20 bg-black/40 backdrop-blur-md px-2 py-1 rounded-md border border-white/5">
                    <span className={`${(sessionNote.trim() ? sessionNote.trim().split(/\s+/).filter(w => w.length > 0).length : 0) >= 100 ? 'text-green-400' : 'text-gray-400'}`}>
                      {sessionNote.trim() ? sessionNote.trim().split(/\s+/).filter(w => w.length > 0).length : 0}
                    </span>
                    <span className="text-gray-500"> / 100 words</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setIsReadSessionModalOpen(false)}
                  className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveReadSession}
                  className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 shadow-[0_4px_15px_rgba(37,99,235,0.4)] text-white font-bold transition-colors"
                >
                  Save Progress
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Page;