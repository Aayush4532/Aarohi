"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import { useToast } from "@/app/contexts/ToastContext";
import Loading from "@/app/components/Loading";

const ForumPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [book, setBook] = useState(null);
  const [chats, setChats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [showRightDrawer, setShowRightDrawer] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);

  // Drag state for floating image preview
  const [previewPos, setPreviewPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ startX: 0, startY: 0, initX: 0, initY: 0 });

  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = (behavior = "smooth") => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior, block: "end" });
    }
  };

  useEffect(() => {
    scrollToBottom("auto");
  }, [chats]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const bookRes = await fetch(
        process.env.NEXT_PUBLIC_BACKEND_URI + `/api/book/${id}`,
        { method: "GET", credentials: "include" }
      );
      if (bookRes.ok) setBook(await bookRes.json());

      const chatRes = await fetch(
        process.env.NEXT_PUBLIC_BACKEND_URI + `/api/chat/${id}`,
        { method: "GET", credentials: "include" }
      );
      if (chatRes.ok) {
        let chatData = await chatRes.json();
        if (!Array.isArray(chatData)) chatData = [];
        setChats(chatData);
      }
    } catch (err) {
      addToast("Failed to load forum data.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchData();
      const interval = setInterval(() => {
        fetchChatsSilently();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [id]);

  const fetchChatsSilently = async () => {
    try {
      const chatRes = await fetch(
        process.env.NEXT_PUBLIC_BACKEND_URI + `/api/chat/${id}`,
        { method: "GET", credentials: "include" }
      );
      if (chatRes.ok) {
        let chatData = await chatRes.json();
        if (!Array.isArray(chatData)) chatData = [];
        setChats((prev) => {
          if (prev.length !== chatData.length) return chatData;
          if (prev.length > 0 && chatData.length > 0 && prev[prev.length - 1].id !== chatData[chatData.length - 1].id) {
            return chatData;
          }
          return prev;
        });
      }
    } catch (err) {}
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      addToast("Please select a valid image file.", "error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      addToast("Image size must be less than 5MB.", "error");
      return;
    }

    setSelectedImage(file);
    const reader = new FileReader();
    reader.onload = () => setPreviewImage(reader.result);
    reader.readAsDataURL(file);
    
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
    setPreviewImage(null);
    setPreviewPos({ x: 0, y: 0 });
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!message.trim() && !selectedImage) return;

    setIsSending(true);

    try {
      const formData = new FormData();
      if (message.trim()) formData.append("message", message.trim());
      if (selectedImage) formData.append("image", selectedImage);

      const res = await fetch(
        process.env.NEXT_PUBLIC_BACKEND_URI + `/api/chat/${id}`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      if (res.ok) {
        const newChat = await res.json();
        setChats((prev) => [...prev, newChat]);
        setMessage("");
        
        // Reset textarea height after sending
        const inputEl = document.getElementById("forum-chat-input");
        if (inputEl) inputEl.style.height = "auto";

        removeSelectedImage();
        scrollToBottom("smooth");
        inputEl?.focus();
        fetchChatsSilently();
      } else {
        addToast("Message send failed.", "error");
      }
    } catch (err) {
      addToast("Network error.", "error");
    } finally {
      setIsSending(false);
    }
  };

  const handleDragStart = (e) => {
    setIsDragging(true);
    const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
    dragStartRef.current = { startX: clientX, startY: clientY, initX: previewPos.x, initY: previewPos.y };
  };

  useEffect(() => {
    const handleDragMove = (e) => {
      if (!isDragging) return;
      const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
      const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
      const dx = clientX - dragStartRef.current.startX;
      const dy = clientY - dragStartRef.current.startY;
      setPreviewPos({ x: dragStartRef.current.initX + dx, y: dragStartRef.current.initY + dy });
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

  const confirmDelete = async () => {
    if (!messageToDelete) return;
    try {
      const res = await fetch(
        process.env.NEXT_PUBLIC_BACKEND_URI + `/api/chat/${messageToDelete}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (res.ok) {
        setChats((prev) => prev.filter((c) => c.id !== messageToDelete && c.ID !== messageToDelete));
        addToast("Message deleted", "success");
      } else {
        addToast("Failed to delete message.", "error");
      }
    } catch (err) {
      console.error("Delete Error:", err);
    } finally {
      setMessageToDelete(null);
    }
  };

  const formatTime = (dateString) => {
    if (!dateString || dateString === "0001-01-01T00:00:00Z") return "";
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const formatDateLabel = (dateString) => {
    if (!dateString || dateString === "0001-01-01T00:00:00Z") return "";
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return date.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
  };

  const handleInput = (e) => {
    setMessage(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 300) + 'px';
  };

  if (isLoading) return <Loading />;
  if (!book) return <div className="h-screen flex items-center justify-center bg-[#030611] text-white">Book not found or unable to load.</div>;

  return (
    <div className="flex h-screen w-full bg-[#030611] text-gray-200 font-sans overflow-hidden relative">
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden flex justify-center items-center">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 blur-[180px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-sky-600/10 blur-[150px] rounded-full"></div>
      </div>

      <div className="flex-1 w-full flex flex-col relative z-10 transition-all duration-300">
        
        {/* === HEADER === */}
        <div 
           className="h-[75px] w-full shrink-0 border-b border-white/[0.05] bg-[#030611]/80 backdrop-blur-2xl px-6 flex items-center shadow-[0_2px_20px_rgba(0,0,0,0.5)] z-20 cursor-pointer group hover:bg-[#070b14]/90 transition-colors"
           onClick={() => setShowRightDrawer(true)}
        >
           <button 
             onClick={(e) => { e.stopPropagation(); router.push(`/book/${book.id}`); }} 
             title="Back to Book" 
             className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white text-gray-400 flex items-center justify-center transition-all shadow-sm shrink-0 mr-4"
           >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
           </button>
           <div className="flex items-center gap-4 min-w-0 flex-1 pl-1 border-l border-white/10">
              <div className="w-12 h-12 rounded-full overflow-hidden border border-white/10 shadow-[0_0_15px_rgba(14,165,233,0.3)] bg-[#111620] shrink-0 group-hover:scale-105 transition-transform duration-300 ml-4">
                 <img src={book.thumbnail || "https://via.placeholder.com/150"} className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col min-w-0 pr-4">
                 <div className="text-[18px] font-extrabold text-gray-100 flex items-center gap-3 truncate tracking-wide">
                   <span className="truncate leading-tight block">{book.title}</span>
                   <span className="shrink-0 px-2 py-[2px] rounded text-[10px] uppercase font-bold tracking-widest bg-sky-500/10 text-sky-400 border border-sky-500/20 shadow-sm align-middle mt-0.5">Forum</span>
                 </div>
                 <div className="text-[12px] text-gray-400 font-medium truncate flex items-center gap-1.5 mt-0.5 group-hover:text-gray-300 transition-colors">
                   View book details & community stats 
                   <svg className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"></path></svg>
                 </div>
              </div>
           </div>
        </div>

        {/* === MESSAGES AREA (Left/Right Layout) === */}
        <div className="flex-1 w-full h-full overflow-y-auto px-4 md:px-8 lg:px-16 pt-8 pb-[200px] flex flex-col gap-[2px] custom-scrollbar scroll-smooth z-0">
           
           {chats.length === 0 ? (
             <div className="h-full w-full flex flex-col items-center justify-center text-center opacity-80 animate-in fade-in pb-10">
               <div className="w-24 h-24 mb-6 rounded-3xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shadow-[0_4px_30px_rgba(14,165,233,0.2)]">
                 <svg className="w-10 h-10 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
               </div>
               <h3 className="text-3xl font-extrabold text-gray-200 mb-3 tracking-tight">The beginning of {book.title}</h3>
               <p className="text-[16px] text-gray-500 max-w-lg font-light leading-relaxed">Share your first review, a lengthy analysis, or a question about this book. Your thoughts are the spark for this community.</p>
             </div>
           ) : (
             <div className="w-full flex flex-col">
                {[...chats].sort((a, b) => new Date(a.created_at || a.CreatedAt).getTime() - new Date(b.created_at || b.CreatedAt).getTime()).map((chat, idx, sortedArr) => {
                   // Clean any BSON Object formatting and strictly rely on the 24-char hex token
                   const cleanID = (val) => String(val || "").replace(/[^a-zA-Z0-9]/g, "").trim().toLowerCase();
                   
                   const cUID = cleanID(chat.user_id || chat.userID || chat.UserID || chat.userId);
                   const uUID = cleanID(user?.id || user?._id || user?.ID);
                   
                   const isMine = Boolean(cUID) && Boolean(uUID) && cUID === uUID;
                   
                   let showHeader = true;
                   let showDateDivider = false;
                   if (idx === 0) showDateDivider = true;
                   else {
                     const prevDate = new Date(sortedArr[idx - 1].created_at || sortedArr[idx - 1].CreatedAt).toDateString();
                     const currDate = new Date(chat.created_at || chat.CreatedAt).toDateString();
                     if (prevDate !== currDate) showDateDivider = true;
                   }
                   if (!showDateDivider && idx > 0) {
                     const prevChat = sortedArr[idx - 1];
                     const isSameUser = (prevChat.user_id || prevChat.userId) === (chat.user_id || chat.userId);
                     const timeDiff = new Date(chat.created_at || chat.CreatedAt) - new Date(prevChat.created_at || prevChat.CreatedAt);
                     if (isSameUser && timeDiff < 5 * 60 * 1000) showHeader = false;
                   }

                   return (
                     <React.Fragment key={chat.id || idx}>
                       {showDateDivider && (
                         <div className="w-full flex items-center justify-center my-8 select-none">
                            <div className="h-px bg-white/5 w-full max-w-[200px] hidden md:block"></div>
                            <span className="px-6 py-1.5 rounded-full bg-[#111623]/80 border border-white/[0.05] text-[11px] uppercase font-extrabold text-sky-400/80 tracking-[0.2em] shadow-sm">
                              {formatDateLabel(chat.created_at || chat.CreatedAt)}
                            </span>
                            <div className="h-px bg-white/5 w-full max-w-[200px] hidden md:block"></div>
                         </div>
                       )}

                       {/* LEFT/RIGHT ALIGNED BUBBLES */}
                       <div className={`group/msg flex w-full relative transition-colors ${isMine ? 'justify-end md:pl-20' : 'justify-start md:pr-20'} ${showHeader ? 'mt-4' : 'mt-1'}`}>
                          
                          {/* SENDER DP (If not mine, show on left) */}
                          {!isMine && showHeader && (
                             <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-white/10 shadow-[0_2px_10px_rgba(0,0,0,0.5)] md:mr-3 mr-2 bg-gradient-to-br from-gray-700 to-gray-800 self-end mb-1">
                               {(chat.profile_url || chat.profile || chat.Profile) ? (
                                 <img src={chat.profile_url || chat.profile || chat.Profile} alt="user" className="w-full h-full object-cover" />
                               ) : (
                                 <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm">{(chat.full_name || chat.FullName || "A").charAt(0).toUpperCase()}</div>
                               )}
                             </div>
                          )}
                          {!isMine && !showHeader && <div className="w-10 md:mr-3 mr-2 hidden md:block shrink-0"></div>}

                          {/* BUBBLE CONTENT */}
                          <div className={`flex flex-col relative max-w-[85%] md:max-w-[70%] lg:max-w-[60%] ${isMine ? 'items-end' : 'items-start'}`}>
                             
                             {/* Header Row: Name & Time */}
                             {showHeader && (
                               <div className={`flex items-baseline gap-2 mb-1 px-1 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
                                 <span className={`font-bold text-[14px] tracking-wide hover:underline cursor-pointer ${isMine ? 'text-sky-400' : 'text-gray-300'}`}>
                                   {isMine ? 'You' : (chat.full_name || chat.FullName || "Anonymous")}
                                 </span>
                                 <span className="text-[10px] text-gray-500 font-semibold select-none">
                                   {formatTime(chat.created_at || chat.CreatedAt)}
                                 </span>
                               </div>
                             )}

                             {/* CHAT BUBBLE SHAPE */}
                             <div 
                               className={`relative flex flex-col shadow-lg overflow-hidden group/bubble ${
                                 isMine 
                                   ? `bg-gradient-to-br from-sky-600 to-blue-700 text-white border border-sky-400/30 ${showHeader ? 'rounded-tl-[20px] rounded-tr-[4px] rounded-b-[20px]' : 'rounded-[20px]'} shadow-[0_8px_30px_rgba(14,165,233,0.15)]`
                                   : `bg-[#131a26]/90 backdrop-blur-md text-gray-200 border border-white/5 ${showHeader ? 'rounded-tr-[20px] rounded-tl-[4px] rounded-b-[20px]' : 'rounded-[20px]'}`
                               }`}
                             >
                                {/* Media Attachment Box */}
                                {(chat.image_url || chat.Image || chat.image) && (
                                   <div className={`relative bg-black/50 ${chat.message || chat.Message ? 'border-b border-black/20 m-1 rounded-[16px] overflow-hidden' : 'p-0.5 mt-0.5 rounded-[18px]'}`}>
                                      <img 
                                        src={chat.image_url || chat.Image || chat.image} 
                                        alt="attachment" 
                                        className="max-h-[350px] md:max-h-[400px] w-auto h-auto object-cover cursor-pointer hover:opacity-90 transition-opacity" 
                                        onClick={() => window.open(chat.image_url || chat.Image || chat.image, '_blank')} 
                                      />
                                   </div>
                                )}

                                {/* Message Text Input Box */}
                                {(chat.message || chat.Message) && (
                                   <div className={`text-[16px] font-light leading-[1.6] whitespace-pre-wrap break-words px-4 py-3 pb-3.5 ${isMine ? 'text-[#f8fafc] selection:bg-white/30' : 'text-gray-200 selection:bg-sky-500/30'}`}>
                                     {chat.message || chat.Message}
                                     
                                     {/* Inline Time snippet for packed bubbles */}
                                     {!showHeader && (
                                       <span className={`inline-block ml-3 text-[10px] font-medium float-right mt-2 ${isMine ? 'text-blue-200/80' : 'text-gray-500'}`}>
                                         {formatTime(chat.created_at || chat.CreatedAt)}
                                       </span>
                                     )}
                                   </div>
                                )}
                             </div>

                             {/* Action Delete Hover - Outer Absolute */}
                             {isMine && (
                               <div className={`absolute top-1/2 -translate-y-1/2 opacity-0 group-hover/msg:opacity-100 transition-opacity duration-200 z-10 ${isMine ? '-left-12' : '-right-12'}`}>
                                  <button onClick={() => setMessageToDelete(chat.id || chat.ID)} className="p-2 rounded-full bg-[#111723]/90 hover:bg-red-500/20 text-gray-400 hover:text-red-400 border border-white/5 hover:border-red-500/30 shadow-xl transition-all" title="Delete Message">
                                     <svg className="w-[16px] h-[16px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                  </button>
                               </div>
                             )}
                          </div>

                          {/* MY DP (If mine, show on right) */}
                          {isMine && showHeader && (
                             <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-sky-400/40 shadow-[0_2px_15px_rgba(56,189,248,0.4)] md:ml-3 ml-2 bg-gradient-to-br from-sky-500 to-blue-700 self-end mb-1">
                               {(chat.profile_url || chat.profile || chat.Profile) ? (
                                 <img src={chat.profile_url || chat.profile || chat.Profile} alt="user" className="w-full h-full object-cover" />
                               ) : (
                                 <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm">{(chat.full_name || chat.FullName || "A").charAt(0).toUpperCase()}</div>
                               )}
                             </div>
                          )}
                          {isMine && !showHeader && <div className="w-10 md:ml-3 ml-2 hidden md:block shrink-0"></div>}
                       </div>

                     </React.Fragment>
                   )
                })}
             </div>
           )}
           <div ref={messagesEndRef} className="h-6 shrink-0"></div>
        </div>
      </div>

      {/* === ABSOLUTE FLOATING INPUT BAR === */}
      <div className="absolute bottom-5 md:bottom-8 left-1/2 -translate-x-1/2 z-30 w-[94%] sm:w-[85%] md:w-[75%] lg:w-[60%] max-w-[1000px] flex flex-col items-center pointer-events-none">
         
         {/* Draggable SKYBLUE Glowing Floating Image Preview */}
         {previewImage && (
            <div 
              className={`fixed flex pointer-events-auto transition-shadow duration-300 ${isDragging ? 'opacity-90 scale-105' : 'opacity-100 scale-100'}`}
              style={{
                bottom: '120px', 
                left: 'max(20px, calc(50% - 140px))', 
                transform: `translate(${previewPos.x}px, ${previewPos.y}px)`,
                cursor: isDragging ? 'grabbing' : 'grab',
                zIndex: 60
              }}
              onMouseDown={handleDragStart}
              onTouchStart={handleDragStart}
            >
               <div className="relative p-2 bg-[#09111c]/95 backdrop-blur-3xl border border-sky-400/40 rounded-[22px] shadow-[0_0_50px_rgba(56,189,248,0.4),0_20px_50px_rgba(0,0,0,0.8)] ring-2 ring-sky-400/30 group">
                  <img src={previewImage} alt="preview" className="h-[150px] md:h-[220px] w-auto rounded-xl object-contain bg-black/60 shadow-inner select-none pointer-events-none" draggable={false} />
                  
                  {/* Cancel floating icon */}
                  <button 
                     onMouseDown={(e) => e.stopPropagation()} 
                     onTouchStart={(e) => e.stopPropagation()} 
                     onClick={removeSelectedImage} 
                     className="absolute -top-3 -right-3 bg-red-500 hover:bg-red-400 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-[0_5px_15px_rgba(239,68,68,0.5)] border-[2.5px] border-[#09111c] transition-transform hover:-rotate-90 hover:scale-110 z-50 cursor-pointer"
                  >
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </button>
                  
                  <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-black/90 to-transparent rounded-b-xl pointer-events-none p-3 pb-5 flex items-end justify-center">
                    <span className="text-[10px] font-extrabold text-sky-100 tracking-widest uppercase py-1.5 px-4 rounded-full bg-black/50 backdrop-blur-md border border-white/20 shadow-sm transition-opacity group-hover:opacity-100 opacity-90 drop-shadow-md">Drag to move</span>
                  </div>
               </div>
            </div>
         )}

         {/* Ultra Premium Pill */}
         <form 
           onSubmit={handleSendMessage} 
           className="w-full bg-[#0a0f18]/95 backdrop-blur-3xl border border-white/10 hover:border-sky-500/30 focus-within:border-sky-500/50 shadow-[0_15px_60px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.05)] focus-within:shadow-[0_15px_60px_rgba(0,0,0,0.6),0_0_30px_rgba(56,189,248,0.2),inset_0_1px_1px_rgba(255,255,255,0.05)] rounded-[32px] p-2 md:p-2.5 flex items-end gap-3 transition-all duration-500 pointer-events-auto relative overflow-hidden group/input"
         >
            <div className="absolute inset-x-0 bottom-0 h-[40px] bg-gradient-to-t from-sky-500/20 to-transparent opacity-0 group-focus-within/input:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

            <input type="file" ref={fileInputRef} onChange={handleImageSelect} accept="image/*" className="hidden" />
            <div 
              className="p-3 mb-[2px] md:mb-[1px] ml-1 rounded-full text-gray-500 hover:text-sky-400 hover:bg-sky-500/10 transition-all duration-300 shrink-0 flex items-center justify-center cursor-pointer group/attach relative z-10"
              onClick={() => fileInputRef.current?.click()}
              title="Attach Image"
               aria-disabled={isSending}
            >
               <svg className="w-[24px] h-[24px] group-hover/attach:scale-110 group-active/attach:scale-95 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            </div>

            <textarea
               id="forum-chat-input"
               rows="1"
               value={message}
               onChange={handleInput}
               onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
               }}
               placeholder={`Message the forum...`}
               disabled={isSending}
               className="flex-1 w-full bg-transparent border-none outline-none text-[16.5px] font-medium text-gray-100 placeholder-gray-500 leading-relaxed py-[14px] min-h-[52px] max-h-[300px] resize-none custom-scrollbar relative z-10"
            />

            <button
               type="submit"
               disabled={isSending || (!message.trim() && !selectedImage)}
               className={`p-[14px] mb-[3px] mr-1 md:mr-1.5 rounded-full shrink-0 flex items-center justify-center transition-all duration-500 relative z-10 ${
                 isSending || (!message.trim() && !selectedImage)
                   ? "bg-white/[0.04] text-gray-600 border border-white/5 cursor-not-allowed opacity-60"
                   : "bg-gradient-to-tr from-sky-600 to-blue-500 hover:from-sky-500 hover:to-blue-400 border border-sky-400/40 text-white shadow-[0_0_20px_rgba(56,189,248,0.5),inset_0_2px_4px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(56,189,248,0.7),inset_0_2px_4px_rgba(255,255,255,0.4)] active:scale-95"
               }`}
            >
               {isSending ? (
                 <svg className="animate-spin h-[22px] w-[22px]" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle><path fill="currentColor" d="M4 12a8 8 0 018-8v8a8 8 0 00-8-8z" className="opacity-75"></path></svg>
               ) : (
                 <svg className="w-[22px] h-[22px] translate-x-[1px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
               )}
            </button>
         </form>
      </div>

      {/* === OVERLAY DETACHED DRAWER === */}
      {showRightDrawer && (
         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity animate-in fade-in" onClick={() => setShowRightDrawer(false)}></div>
      )}

      <div className={`fixed top-0 right-0 h-full w-[400px] sm:w-[450px] border-l border-white/[0.05] bg-[#04070d]/95 backdrop-blur-3xl flex flex-col shrink-0 z-50 transition-transform duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)] shadow-[-20px_0_50px_rgba(0,0,0,0.8)] ${showRightDrawer ? 'translate-x-0' : 'translate-x-[500px]'} overflow-hidden`}>
         <div className="h-[75px] bg-[#030611] shrink-0 flex items-center justify-between px-6 cursor-pointer border-b border-white/[0.05] shadow-sm sticky top-0 z-10 hover:bg-[#070b14] transition-colors" onClick={() => setShowRightDrawer(false)}>
           <span className="text-[17px] text-[#e9edef] font-extrabold tracking-wide uppercase">Book Info</span>
           <button className="text-gray-400 hover:text-white transition-colors bg-white/5 p-2 rounded-full border border-white/5 shadow-sm hover:rotate-90 hover:scale-110 active:scale-95 duration-300" onClick={(e) => { e.stopPropagation(); setShowRightDrawer(false); }}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
           </button>
         </div>
         <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="px-8 pt-12 pb-10 flex flex-col items-center border-b border-white/[0.02] bg-[#03050a]/50 relative overflow-hidden">
               <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[30%] bg-blue-500/10 blur-[60px] rounded-full pointer-events-none"></div>
               <div className="w-[180px] h-[270px] rounded-2xl bg-[#182229] mb-8 overflow-hidden border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.6)] relative z-10 hover:scale-[1.03] transition-transform duration-500">
                 <img src={book.thumbnail || "https://via.placeholder.com/200"} className="w-full h-full object-cover" />
               </div>
               <h2 className="text-[26px] text-white font-extrabold text-center mb-2 px-2 leading-tight tracking-tight shadow-black drop-shadow-md z-10">{book.title}</h2>
               <p className="text-[15px] text-blue-400 font-bold mb-8 uppercase tracking-widest z-10">{book.author}</p>
               <div className="flex w-full justify-center gap-14 mt-2 z-10">
                 <div className="flex flex-col items-center group cursor-default">
                   <div className="flex items-center justify-center w-14 h-14 rounded-full bg-blue-500/10 border border-blue-500/20 text-white font-extrabold text-xl mb-3 group-hover:scale-110 group-hover:bg-blue-500/20 transition-all">{book.page_count}</div>
                   <span className="text-[10px] text-gray-500 font-extrabold uppercase tracking-[0.2em] shadow-sm">Pages</span>
                 </div>
                 <div className="flex flex-col items-center group cursor-default">
                   <div className="flex items-center justify-center w-14 h-14 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-white font-extrabold text-xl mb-3 gap-1 group-hover:scale-110 group-hover:bg-yellow-500/20 transition-all">{book.total_rating?.toFixed(1) || "New"}</div>
                   <span className="text-[10px] text-gray-500 font-extrabold uppercase tracking-[0.2em] shadow-sm">Rating</span>
                 </div>
               </div>
            </div>
            <div className="py-10 px-8 border-b border-white/[0.02]">
               <h3 className="text-[11px] text-blue-400 font-extrabold uppercase tracking-[0.2em] mb-4">Synopsis</h3>
               <p className="text-[15.5px] text-gray-300 leading-[1.8] font-light">{book.description || "No description provided."}</p>
            </div>
            <div className="py-2 mb-10 mt-4">
               <div className="mx-8 px-6 py-4 cursor-pointer bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl transition-all flex items-center justify-center gap-3 text-red-400 font-bold shadow-lg shadow-red-500/5 group hover:shadow-red-500/10" onClick={() => router.push(`/book/${book.id}`)}>
                 <svg className="w-5 h-5 shrink-0 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path></svg>
                 <span className="text-[15px] tracking-wide">Return to Main View</span>
               </div>
            </div>
         </div>
      </div>

      {/* === CUSTOM DELETE CONFIRMATION MODAL === */}
      {messageToDelete && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-200" onClick={() => setMessageToDelete(null)}></div>
            
            {/* Modal Content */}
            <div className="relative bg-[#0a0f18] border border-white/10 rounded-3xl p-8 max-w-[400px] w-[90%] shadow-[0_30px_60px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.05)] animate-in zoom-in-95 duration-200">
               <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6 mx-auto shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                  <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
               </div>
               <h3 className="text-xl font-extrabold text-white text-center mb-3">Delete Message?</h3>
               <p className="text-gray-400 text-center text-[15px] leading-relaxed mb-8">This action cannot be undone. Are you sure you want to permanently delete this message from the forum?</p>
               
               <div className="flex gap-4 w-full">
                  <button onClick={() => setMessageToDelete(null)} className="flex-1 py-3.5 px-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 font-bold transition-all active:scale-95">Cancel</button>
                  <button onClick={confirmDelete} className="flex-1 py-3.5 px-4 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-bold transition-all shadow-[0_10px_20px_rgba(239,68,68,0.3)] hover:shadow-[0_10px_30px_rgba(239,68,68,0.5)] active:scale-95">Delete</button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default ForumPage;
