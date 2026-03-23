"use client";
import React, { useState } from "react";

const Page = () => {
    // Step 1: Search state
    const [searchQuery, setSearchQuery] = useState("");
    const [bookId, setBookId] = useState(null);
    const [loadingSearch, setLoadingSearch] = useState(false);
    const [searchMessage, setSearchMessage] = useState("");

    // Step 2: Edit state
    const [form, setForm] = useState({
        title: "",
        author: "",
        isbn: "",
        page_count: "",
        description: "",
        categories: "",
    });
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loadingUpdate, setLoadingUpdate] = useState(false);
    const [message, setMessage] = useState("");

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleImage = (file) => {
        setImage(file);
        if (file) {
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        try {
            setLoadingSearch(true);
            setSearchMessage("");
            setMessage("");

            const res = await fetch(
                process.env.NEXT_PUBLIC_BACKEND_URI + `/api/book/${searchQuery}`
            );

            if (!res.ok) {
                setSearchMessage("Book not found. Please check the ID.");
                setBookId(null);
                return;
            }

            const data = await res.json();
            
            // Pre-populate form
            setForm({
                title: data.title || "",
                author: data.author || "",
                isbn: data.isbn || "",
                page_count: data.page_count || "",
                description: data.description || "",
                categories: Array.isArray(data.categories) ? data.categories.join(", ") : (data.categories || ""),
            });
            
            // Assume the backend returns an id field. If not fallback to searchQuery.
            setBookId(data.id || data._id || data.book_id || searchQuery);
            
            // Set cover preview if exists
            const existingImage = data.image_url || data.thumbnail || data.cover_image;
            setPreview(existingImage ? (process.env.NEXT_PUBLIC_BACKEND_URI + existingImage) : null);
            setImage(null); 

            setSearchMessage("Book found! You can now edit its details.");
        } catch (err) {
            setSearchMessage("Error fetching book details.");
            console.error(err);
            setBookId(null);
        } finally {
            setLoadingSearch(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();

        try {
            setLoadingUpdate(true);
            setMessage("");

            const formData = new FormData();
            formData.append("book_id", bookId);
            
            Object.keys(form).forEach((key) =>
                formData.append(key, form[key])
            );
            
            if (image) {
                formData.append("image", image);
            }

            // Note: Update the endpoint below if your backend update route is different
            const res = await fetch(
                process.env.NEXT_PUBLIC_BACKEND_URI + "/api/updateBook",
                {
                    method: "PUT", // Often PUT/PATCH is used for updates, change to POST if backend requires it
                    credentials: "include",
                    body: formData,
                }
            );

            const text = await res.text();

            if (!res.ok) {
                setMessage(text || "Failed to update book");
                return;
            }

            setMessage("Book updated successfully!");
        } catch {
            setMessage("Failed to update book");
        } finally {
            setLoadingUpdate(false);
        }
    };

    return (
        <div className="w-full text-white pb-20 px-6 md:px-12 lg:px-20 font-sans animate-in fade-in duration-700">
            <div className="max-w-5xl mx-auto pt-8 md:pt-16">
                
                <div className="mb-12">
                    <button onClick={() => window.history.back()} className="text-gray-400 hover:text-white flex items-center gap-2 text-sm mb-6 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                        Back to Control Center
                    </button>
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
                        Update Existing Title
                    </h1>
                    <p className="text-gray-400 text-lg max-w-2xl font-light">
                        Modify the metadata or cover image of an existing book in the catalog. First, find the book using its unique ID.
                    </p>
                </div>

                <div className="bg-white/[0.02] backdrop-blur-xl border border-white/5 p-8 md:p-12 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
                    
                    {/* Background accent glow */}
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none -mt-40 -mr-40"></div>

                    <div className="relative z-10 flex flex-col gap-10">
                        
                        {/* Step 1: Search Section */}
                        <div className="bg-black/20 p-6 md:p-8 rounded-2xl border border-white/5">
                            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                                <span className="bg-blue-500/20 text-blue-400 w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
                                Find Book to Edit
                            </h2>
                            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1 relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Enter Book ID..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-300 font-light"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loadingSearch || !searchQuery.trim()}
                                    className="md:w-48 py-4 px-6 rounded-xl font-bold tracking-widest uppercase text-sm bg-white/10 hover:bg-white/20 text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loadingSearch ? (
                                        <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
                                    ) : "Fetch Book"}
                                </button>
                            </form>
                            {searchMessage && (
                                <p className={`mt-3 text-sm font-medium flex items-center gap-2 ${bookId ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${bookId ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                                    {searchMessage}
                                </p>
                            )}
                        </div>

                        {/* Step 2: Edit Form (Visible only if a book is selected) */}
                        <div className={`transition-all duration-700 ease-in-out ${bookId ? 'opacity-100 max-h-[2000px] translate-y-0' : 'opacity-0 max-h-0 -translate-y-4 overflow-hidden pointer-events-none'}`}>
                            <hr className="border-white/5 mb-10" />
                            
                            <form onSubmit={handleUpdate} className="grid md:grid-cols-2 gap-10 md:gap-16">
                                
                                {/* Left Column: Metadata Inputs */}
                                <div className="flex flex-col gap-6">
                                    <h2 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
                                        <span className="bg-purple-500/20 text-purple-400 w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
                                        Update Details
                                    </h2>

                                    <Input name="title" value={form.title} onChange={handleChange} placeholder="Book Title" label="Title" />
                                    <Input name="author" value={form.author} onChange={handleChange} placeholder="Author Name" label="Author" />
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input name="isbn" value={form.isbn} onChange={handleChange} placeholder="e.g. 978123..." label="ISBN" />
                                        <Input name="page_count" type="number" value={form.page_count} onChange={handleChange} placeholder="e.g. 350" label="Page Count" />
                                    </div>

                                    <Input name="categories" value={form.categories} onChange={handleChange} placeholder="Fiction, Sci-Fi..." label="Categories (comma separated)" />
                                    
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Description</label>
                                        <textarea
                                            name="description"
                                            value={form.description}
                                            onChange={handleChange}
                                            rows="5"
                                            placeholder="Write a compelling synopsis..."
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-300 resize-none font-light"
                                        />
                                    </div>
                                </div>

                                {/* Right Column: Image Upload & Submit */}
                                <div className="flex flex-col gap-6 h-full pt-2">
                                    <h2 className="text-xl font-semibold text-white mb-2 flex items-center gap-2 opacity-0 select-none hidden md:flex">
                                        Spacer
                                    </h2>

                                    <label className={`relative flex-1 min-h-[300px] flex flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden group
                                        ${preview ? 'border-transparent bg-black/50' : 'border-white/20 bg-black/20 hover:border-blue-500/50 hover:bg-black/40'}`}
                                    >
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleImage(e.target.files[0])}
                                            hidden
                                        />
                                        
                                        {preview ? (
                                            <>
                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center backdrop-blur-sm">
                                                    <div className="flex flex-col items-center gap-2">
                                                        <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg border border-white/20">
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                                                            <span className="text-sm font-medium tracking-wide">Upload New Image</span>
                                                        </div>
                                                        <span className="text-xs text-gray-400">Current cover will be kept if unchanged</span>
                                                    </div>
                                                </div>
                                                <img
                                                    src={preview}
                                                    alt="Preview"
                                                    className="absolute inset-0 w-full h-full object-cover rounded-xl"
                                                />
                                            </>
                                        ) : (
                                            <div className="flex flex-col items-center text-center p-6 z-10">
                                                <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:border-blue-500/30 group-hover:text-blue-400 transition-all duration-500">
                                                    <svg className="w-8 h-8 text-gray-400 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                                                </div>
                                                <p className="font-semibold text-lg text-white mb-1">Click to upload new cover</p>
                                                <p className="text-sm text-gray-500">Leaving this empty keeps the existing cover</p>
                                            </div>
                                        )}
                                    </label>

                                    {/* Submit Button */}
                                    <div className="mt-auto pt-6">
                                        <button
                                            type="submit"
                                            disabled={loadingUpdate}
                                            className="w-full py-4 rounded-xl font-bold tracking-widest uppercase text-sm
                                            bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500
                                            text-white transition-all duration-300 shadow-[0_0_20px_rgba(79,70,229,0.4)]
                                            hover:shadow-[0_0_30px_rgba(79,70,229,0.6)] disabled:opacity-50 disabled:cursor-not-allowed
                                            flex items-center justify-center gap-3 relative overflow-hidden group"
                                        >
                                            {loadingUpdate ? (
                                                <>
                                                    <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
                                                    Saving Changes...
                                                </>
                                            ) : (
                                                <>
                                                    Update Book Details
                                                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                                </>
                                            )}
                                        </button>

                                        {message && (
                                            <div className={`mt-4 p-4 rounded-xl text-sm font-medium flex items-center gap-3 ${message.includes('successfully') ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                                                <div className={`w-2 h-2 rounded-full animate-pulse ${message.includes('successfully') ? 'bg-emerald-400' : 'bg-rose-400'}`}></div>
                                                {message}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Input = ({ name, value, onChange, placeholder, type = "text", label }) => (
    <div className="flex flex-col gap-2">
        {label && <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</label>}
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-300 font-light"
        />
    </div>
);

export default Page;
