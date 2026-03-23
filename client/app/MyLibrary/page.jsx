"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import Loading from "../components/Loading";

const MyLibrary = () => {
    const { user, checkUser } = useAuth();
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("reading"); 

    useEffect(() => {
        if (!user) {
            checkUser(); 
            return;
        }

        const fetchLibrary = async () => {
            setLoading(true);
            try {
                const readingList = user?.CurrentlyReading || [];
                
                if (readingList.length === 0) {
                    setBooks([]);
                    setLoading(false);
                    return;
                }

                const promises = readingList.map(async (r) => {
                    // Just in case it's a string ID or object
                    const bookId = typeof r === 'string' ? r : (r.book_id || r.BookID || r.bookId || r.id);
                    if (!bookId) return null;

                    try {
                        const res = await fetch(process.env.NEXT_PUBLIC_BACKEND_URI + `/api/book/${bookId}`, {
                            method: "GET",
                            credentials: "include", // CRITICAL FIX: To prevent 401s if endpoint is protected
                        });
                        if (!res.ok) return null;
                        const data = await res.json();
                        
                        // If 'r' was just a string, simulate the _readingData
                        const readingData = typeof r === 'string' ? { complete: 0, current_page: 0 } : r;
                        
                        return {
                            ...data,
                            _readingData: readingData 
                        };
                    } catch (e) {
                        return null;
                    }
                });

                const results = await Promise.all(promises);
                setBooks(results.filter(b => b !== null));

            } catch (err) {
                console.error("Error fetching library books:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchLibrary();
    }, [user]);

    if (!user) {
        return <Loading />;
    }

    const currentlyReading = books.filter(b => (b._readingData.complete || b._readingData.Complete || 0) < 100);
    const completedBooks = books.filter(b => (b._readingData.complete || b._readingData.Complete || 0) === 100);

    const displayBooks = activeTab === "reading" ? currentlyReading : completedBooks;

    // Premium full-width horizontal card UI design
    const WideLibraryBookCard = ({ book }) => {
        const rData = book._readingData;
        const progress = rData.complete || rData.Complete || 0;
        const currentPage = rData.current_page || rData.CurrentPage || 0;
        
        return (
            <div 
                onClick={() => window.location.href = `/book/${book.id || book._id}`}
                className="group cursor-pointer relative w-full rounded-3xl bg-white/[0.02] border border-white/[0.05] p-4 md:p-6 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all duration-500 hover:bg-white/[0.04] hover:border-white/10 hover:shadow-[0_20px_50px_rgba(37,99,235,0.15)] flex flex-col md:flex-row gap-6 md:gap-8 overflow-hidden hover:-translate-y-1"
            >
                {/* Subtle ambient light from hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-indigo-500/0 to-transparent opacity-0 group-hover:opacity-10 group-hover:via-indigo-500/10 transition-all duration-700 pointer-events-none z-0"></div>

                {/* Left: Book Cover Image */}
                <div className="relative w-full md:w-[180px] h-[250px] md:h-auto md:aspect-[2/3] shrink-0 rounded-2xl overflow-hidden bg-[#05080f] shadow-[0_5px_20px_rgba(0,0,0,0.6)] z-10 border border-white/5">
                    {book.thumbnail ? (
                        <img 
                            src={book.thumbnail} 
                            alt={book.title} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 p-4 text-center">
                            <svg className="w-8 h-8 opacity-50 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                            <span className="text-xs">No Cover</span>
                        </div>
                    )}
                    
                    {/* Dark gradient overlay at bottom of cover for aesthetics */}
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent pointer-events-none"></div>
                </div>

                {/* Right: Info & Modern Progress */}
                <div className="flex-1 flex flex-col justify-between z-10 py-1 md:py-2">
                    
                    {/* Top Section */}
                    <div className="flex flex-col gap-2">
                        {book.categories && book.categories.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-1">
                                <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] uppercase font-bold tracking-widest">
                                    {book.categories[0]}
                                </span>
                            </div>
                        )}
                        
                        <h3 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-400 transition-all duration-300">
                            {book.title || "Untitled Book"}
                        </h3>
                        
                        <p className="text-gray-400 text-sm md:text-base font-medium flex items-center gap-2">
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                            {book.author || "Unknown Author"} 
                            <span className="text-gray-600 ml-2">|</span>
                            <span className="text-gray-500 text-xs ml-2 tracking-widest uppercase">{book.page_count} Pages</span>
                        </p>
                        
                        {/* Brief Snippet */}
                        {book.description && (
                            <p className="text-gray-500 text-sm leading-relaxed mt-3 line-clamp-2 md:line-clamp-3 font-light">
                                {book.description.substring(0, 200)}...
                            </p>
                        )}
                    </div>

                    {/* Bottom Section: Progress UI */}
                    <div className="mt-8 pt-6 border-t border-white/5 relative">
                        {progress === 100 ? (
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                                </div>
                                <div>
                                    <p className="text-emerald-400 font-bold uppercase tracking-widest text-[11px] flex gap-1 items-center">
                                        Completed <span className="text-2xl ml-1 mb-1 leading-none">🎉</span>
                                    </p>
                                    <p className="text-gray-500 text-xs mt-0.5">You've finished this adventure.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3 max-w-lg">
                                <div className="flex justify-between items-end">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-white text-sm font-semibold flex items-center gap-2">
                                            Reading Progress
                                            <span className="inline-flex items-center justify-center bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] px-2 py-0.5 rounded-full font-bold">
                                                Page {currentPage}
                                            </span>
                                        </span>
                                    </div>
                                    <span className="text-xl md:text-2xl font-extrabold text-blue-400 drop-shadow-[0_0_10px_rgba(59,130,246,0.3)]">
                                        {progress}%
                                    </span>
                                </div>
                                
                                {/* Extra thick premium progress bar */}
                                <div className="h-2.5 md:h-3 w-full bg-black/40 rounded-full overflow-hidden border border-white/5 shadow-inner">
                                    <div 
                                        className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.6)] relative overflow-hidden transition-all duration-1000 ease-out"
                                        style={{ width: `${progress}%` }}
                                    >
                                        {/* Shimmer effect inside progress bar */}
                                        <div className="absolute top-0 bottom-0 left-0 right-[-100%] bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_infinite]"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {/* Action CTA Arrow */}
                        <div className="absolute right-0 bottom-2 md:bottom-auto md:top-1/2 md:-translate-y-1/2 w-12 h-12 rounded-full border border-white/10 flex items-center justify-center bg-white/5 group-hover:bg-blue-600 group-hover:border-blue-500 group-hover:text-white text-gray-400 transition-all duration-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                        </div>
                    </div>

                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[var(--background)] text-white font-sans overflow-x-hidden animate-in fade-in duration-700 pb-24">
            {/* Massive Premium Header Showcase */}
            <div className="relative pt-28 pb-20 px-6 md:px-12 lg:px-20 overflow-hidden bg-[#02050a] border-b border-white/[0.05]">
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 pointer-events-none mix-blend-overlay"></div>
                
                {/* Immersive Blur Globs */}
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[150%] bg-blue-600/15 blur-[160px] rounded-full pointer-events-none mix-blend-screen"></div>
                <div className="absolute top-[-30%] right-[-10%] w-[40%] h-[120%] bg-indigo-500/10 blur-[150px] rounded-full pointer-events-none mix-blend-screen"></div>
                <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-30"></div>
                
                <div className="max-w-6xl mx-auto relative z-10 flex flex-col items-center text-center gap-10">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/10 backdrop-blur-md mb-2">
                            <svg className="w-4 h-4 text-blue-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                            <span className="text-xs font-bold uppercase tracking-widest text-gray-300">Your Reading Journey</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-gray-500 drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                            Personal Library
                        </h1>
                        <p className="text-gray-400 text-lg md:text-xl font-light max-w-2xl mx-auto">
                            Track every page, celebrate every milestone. Your literary adventures are beautifully chronicled here.
                        </p>
                    </div>

                    <div className="flex gap-4 md:gap-12 bg-[#0a0f18]/80 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                        <div className="flex flex-col items-center px-4 md:px-8">
                            <span className="text-[10px] md:text-xs font-bold text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                Total Books
                            </span>
                            <span className="text-4xl md:text-5xl font-black text-white tracking-tight">{user.TotalBooksRead || 0}</span>
                        </div>
                        <div className="w-px bg-white/10"></div>
                        <div className="flex flex-col items-center px-4 md:px-8">
                            <span className="text-[10px] md:text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                Total Pages
                            </span>
                            <span className="text-4xl md:text-5xl font-black text-white tracking-tight">{user.TotalPagesRead || 0}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* List Body Area */}
            <div className="max-w-6xl mx-auto mt-12 px-6 md:px-12 lg:px-20 relative z-10">
                
                {/* Segmented Control Tabs */}
                <div className="flex justify-center mb-16">
                    <div className="inline-flex p-1.5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl shadow-[0_0_20px_rgba(0,0,0,0.3)]">
                        <button
                            onClick={() => setActiveTab("reading")}
                            className={`relative px-8 md:px-12 py-3.5 rounded-xl text-sm font-bold tracking-widest uppercase transition-all duration-300 ${activeTab === 'reading' 
                                ? 'text-white' 
                                : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            {activeTab === 'reading' && (
                                <div className="absolute inset-0 bg-blue-600 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.4)] z-0"></div>
                            )}
                            <span className="relative z-10 flex items-center gap-2">
                                Currently Reading <span className="bg-white/20 px-2 py-0.5 rounded-md text-[10px]">{currentlyReading.length}</span>
                            </span>
                        </button>
                        <button
                            onClick={() => setActiveTab("completed")}
                            className={`relative px-8 md:px-12 py-3.5 rounded-xl text-sm font-bold tracking-widest uppercase transition-all duration-300 ${activeTab === 'completed' 
                                ? 'text-white' 
                                : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            {activeTab === 'completed' && (
                                <div className="absolute inset-0 bg-indigo-600 rounded-xl shadow-[0_0_20px_rgba(79,70,229,0.4)] z-0"></div>
                            )}
                            <span className="relative z-10 flex items-center gap-2">
                                Finished Books <span className="bg-white/20 px-2 py-0.5 rounded-md text-[10px]">{completedBooks.length}</span>
                            </span>
                        </button>
                    </div>
                </div>

                {/* Library List (Wide Stack) */}
                {loading ? (
                    <div className="w-full flex flex-col items-center justify-center py-32 gap-6">
                        <div className="relative w-16 h-16">
                            <div className="absolute inset-0 rounded-full border-4 border-white/5 border-t-blue-500 animate-[spin_1s_linear_infinite]"></div>
                            <div className="absolute inset-2 rounded-full border-4 border-white/5 border-b-indigo-500 animate-[spin_1.5s_linear_infinite_reverse]"></div>
                        </div>
                        <p className="text-gray-400 text-sm tracking-[0.2em] font-bold uppercase animate-pulse">Synchronizing Library...</p>
                    </div>
                ) : displayBooks.length === 0 ? (
                    <div className="py-24 flex flex-col items-center justify-center text-center bg-gradient-to-b from-white/[0.02] to-transparent rounded-[40px] border border-white/5 px-6 shadow-[inset_0_0_100px_rgba(0,0,0,0.5)]">
                        <div className="w-24 h-24 bg-white/[0.02] rounded-full flex items-center justify-center mb-8 border border-white/5 shadow-[0_0_30px_rgba(0,0,0,0.2)]">
                            <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                        </div>
                        <h3 className="text-3xl md:text-4xl font-extrabold text-white mb-4 tracking-tight">Empty Shelf</h3>
                        <p className="text-gray-400 font-light max-w-md text-lg leading-relaxed">
                            {activeTab === 'reading' 
                                ? "You aren't reading anything right now. It's the perfect time to discover a new adventure." 
                                : "You haven't finished any books yet. Keep pushing, every page counts towards your goal!"}
                        </p>
                        <button 
                            onClick={() => window.location.href = '/'}
                            className="mt-10 px-10 py-4 bg-white text-black font-extrabold uppercase tracking-[0.15em] text-xs rounded-full hover:bg-gray-200 hover:scale-105 transition-all shadow-[0_0_30px_rgba(255,255,255,0.15)] flex items-center gap-3"
                        >
                            Find a Book <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-8">
                        {displayBooks.map((book) => (
                            <WideLibraryBookCard key={book.id || book._id} book={book} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyLibrary;
