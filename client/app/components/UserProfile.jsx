"use client";
import React, { useState } from "react";

const UserProfile = ({ user }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(user?.Name || "");
    const [editAge, setEditAge] = useState(user?.Age || "");
    const [editImage, setEditImage] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    if (!user) return null;

    const {
        Name,
        Email,
        Age,
        Profile,
        Role,
        Streak,
        LongestStreak,
        TotalBooksRead,
        TotalPagesRead,
    } = user;

    const handleAdminBtn = () => {
        window.location.href = "/admin";
    }

    const openModal = () => {
        setEditName(Name || "");
        setEditAge(Age || "");
        setEditImage(null);
        setErrorMsg("");
        setIsEditing(true);
    };

    const closeModal = () => {
        setIsEditing(false);
    };

    const handleSaveProfile = async () => {
        setIsSaving(true);
        setErrorMsg("");
        try {
            // Update name or age if changed
            const parsedAge = parseInt(editAge);
            const hasNameChanged = editName !== Name && editName.trim() !== "";
            const hasAgeChanged = parsedAge !== Age && (!isNaN(parsedAge) && parsedAge > 0);

            if (hasNameChanged || hasAgeChanged) {
                const updatePayload = {};
                if (hasNameChanged) updatePayload.name = editName;
                if (hasAgeChanged) updatePayload.age = parsedAge;

                const updateRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URI}/user`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(updatePayload),
                    credentials: "include",
                });
                
                if (!updateRes.ok) throw new Error("Failed to update profile details");
            }

            // Update profile image if a new file is selected
            if (editImage) {
                const formData = new FormData();
                formData.append("image", editImage);
                
                const imgRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URI}/api/uploadProfile`, {
                    method: "PUT",
                    body: formData,
                    credentials: "include",
                });
                
                if (!imgRes.ok) throw new Error("Failed to upload profile image");
            }

            // Successfully updated everything, close modal and reload to see changes
            setIsEditing(false);
            window.location.reload();
        } catch (err) {
            console.error(err);
            setErrorMsg(err.message || "An error occurred while saving.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="w-full">
            <div className="relative rounded-2xl bg-gradient-to-br from-white/[0.05] to-transparent border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] p-5 overflow-hidden backdrop-blur-xl group">
                
                {/* Subtle top glow */}
                <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>

                {/* Settings Button */}
                <button 
                    onClick={openModal}
                    className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-gray-400 hover:text-white"
                    title="Edit Profile"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                </button>

                <div className="flex gap-4 items-center relative z-10">
                    <div className="relative">
                        <div className="absolute inset-0 bg-blue-500 rounded-xl blur blur-md opacity-20 group-hover:opacity-40 transition-opacity"></div>
                        <img
                            src={Profile === "" || !Profile ? "https://via.placeholder.com/150" : Profile}
                            alt={Name}
                            className="w-14 h-14 rounded-xl object-cover border border-white/20 relative z-10"
                        />
                    </div>

                    <div className="flex-1 min-w-0 pr-8">
                        <h2 className="text-gray-100 text-base font-semibold text-gradient-primary truncate">
                            {Name}
                        </h2>
                        <p className="text-[11px] text-gray-500 truncate mt-0.5">
                            {Email}
                        </p>

                        {Role === "admin" && (
                            <button 
                                onClick={handleAdminBtn} 
                                className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] uppercase font-bold tracking-wider hover:bg-blue-500/20 transition-colors"
                            >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                                Admin Panel
                            </button>
                        )}
                    </div>
                </div>

                <div className="my-5 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-white/[0.02] border border-white/[0.05] p-3 text-center transition-colors hover:bg-white/[0.04]">
                        <p className="text-xl font-bold text-white tracking-tight">{Streak}</p>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mt-1">Current Streak</p>
                    </div>

                    <div className="rounded-xl bg-white/[0.02] border border-white/[0.05] p-3 text-center transition-colors hover:bg-white/[0.04]">
                        <p className="text-xl font-bold text-white tracking-tight">{LongestStreak}</p>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mt-1">Longest</p>
                    </div>

                    <div className="rounded-xl bg-white/[0.02] border border-white/[0.05] p-3 text-center transition-colors hover:bg-white/[0.04]">
                        <p className="text-xl font-bold text-white tracking-tight">{TotalBooksRead}</p>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mt-1">Books Read</p>
                    </div>

                    <div className="rounded-xl bg-white/[0.02] border border-white/[0.05] p-3 text-center transition-colors hover:bg-white/[0.04]">
                        <p className="text-xl font-bold text-white tracking-tight">{TotalPagesRead}</p>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mt-1">Pages</p>
                    </div>
                </div>

            </div>

            {/* Edit Profile Modal */}
            {isEditing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={closeModal}
                    ></div>
                    
                    {/* Modal Content */}
                    <div className="relative w-full max-w-sm rounded-2xl bg-gray-900 border border-white/10 shadow-2xl p-6 overflow-hidden">
                        {/* Subtle top glow */}
                        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
                        
                        <h3 className="text-lg font-semibold text-white mb-4">Edit Profile</h3>

                        {errorMsg && (
                            <div className="mb-4 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs text-center">
                                {errorMsg}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                                    Display Name
                                </label>
                                <input 
                                    type="text" 
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    placeholder="Your Name"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-gray-600"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                                    Age
                                </label>
                                <input 
                                    type="number" 
                                    value={editAge}
                                    onChange={(e) => setEditAge(e.target.value)}
                                    placeholder="Your Age"
                                    min="1"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-gray-600"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                                    Profile Picture
                                </label>
                                <div className="flex items-center gap-3">
                                    {editImage ? (
                                        <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/20">
                                            <img src={URL.createObjectURL(editImage)} alt="Preview" className="w-full h-full object-cover" />
                                        </div>
                                    ) : Profile ? (
                                        <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/20">
                                            <img src={Profile} alt="Current Profile" className="w-full h-full object-cover" />
                                        </div>
                                    ) : (
                                        <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                                            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                        </div>
                                    )}
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files[0]) {
                                                setEditImage(e.target.files[0]);
                                            }
                                        }}
                                        className="block w-full text-xs text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20 file:transition-colors file:cursor-pointer"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-3 flex-wrap">
                            <button 
                                onClick={closeModal}
                                disabled={isSaving}
                                className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-400 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleSaveProfile}
                                disabled={isSaving}
                                className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 min-w-[80px]"
                            >
                                {isSaving ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        Saving...
                                    </>
                                ) : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserProfile;