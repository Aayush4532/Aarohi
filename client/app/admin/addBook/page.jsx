"use client";
import React, { useState } from "react";

const Page = () => {
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
    const [loading, setLoading] = useState(false);
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!image) {
            setMessage("Thumbnail required");
            return;
        }

        try {
            setLoading(true);
            setMessage("");

            const formData = new FormData();
            Object.keys(form).forEach((key) =>
                formData.append(key, form[key])
            );
            formData.append("image", image);

            const res = await fetch(
                process.env.NEXT_PUBLIC_BACKEND_URI + "/api/addBook",
                {
                    method: "POST",
                    credentials: "include",
                    body: formData,
                }
            );

            const text = await res.text();

            if (!res.ok) {
                setMessage(text);
                return;
            }

            setMessage("Book added successfully");
            setForm({
                title: "",
                author: "",
                isbn: "",
                page_count: "",
                description: "",
                categories: "",
            });
            setImage(null);
            setPreview(null);
        } catch {
            setMessage("Failed to add book");
        } finally {
            setLoading(false);
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
                        Publish New Title
                    </h1>
                    <p className="text-gray-400 text-lg max-w-2xl font-light">
                        Add a new book to the catalog. Ensure all metadata is accurate and provide a high-quality cover thumbnail.
                    </p>
                </div>

                <div className="bg-white/[0.02] backdrop-blur-xl border border-white/5 p-8 md:p-12 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
                    
                    {/* Background accent glow */}
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none -mt-40 -mr-40"></div>

                    <form onSubmit={handleSubmit} className="relative z-10 grid md:grid-cols-2 gap-10 md:gap-16">

                        {/* Left Column: Metadata Inputs */}
                        <div className="flex flex-col gap-6">
                            
                            <h2 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
                                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                Metadata
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
                        <div className="flex flex-col gap-6 h-full">

                            <h2 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
                                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                Cover Thumbnail
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
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center backdrop-blur-sm">
                                            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg border border-white/20">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                                                <span className="text-sm font-medium tracking-wide">Change Image</span>
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
                                        <p className="font-semibold text-lg text-white mb-1">Click to upload image</p>
                                        <p className="text-sm text-gray-500">High-quality portrait thumbnail recommended</p>
                                    </div>
                                )}
                            </label>

                            {/* Submit Button */}
                            <div className="mt-auto pt-6">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 rounded-xl font-bold tracking-widest uppercase text-sm
                                    bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500
                                    text-white transition-all duration-300 shadow-[0_0_20px_rgba(79,70,229,0.4)]
                                    hover:shadow-[0_0_30px_rgba(79,70,229,0.6)] disabled:opacity-50 disabled:cursor-not-allowed
                                    flex items-center justify-center gap-3 relative overflow-hidden group"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
                                            Publishing...
                                        </>
                                    ) : (
                                        <>
                                            Publish Book
                                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
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