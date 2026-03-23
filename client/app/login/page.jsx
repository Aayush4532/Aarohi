"use client";
import React, { useEffect } from "react";
import { useToast } from "../contexts/ToastContext";
import { useAuth } from "../contexts/AuthContext";

const Page = () => {
    const { addToast } = useToast();
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");

    const [errors, setErrors] = React.useState({});
    const [loading, setLoading] = React.useState(false);

    const { login, user } = useAuth();

    useEffect(() => {
        if (user) {
            window.location.href = "/";
        }
    }, [user]);
    const validate = () => {
        let newErrors = {};

        if (!email.trim()) {
            newErrors.email = "Email is required";
        } else if (
            !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)
        ) {
            newErrors.email = "Invalid email format";
        }

        if (!password) {
            newErrors.password = "Password is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = async () => {
        if (!validate()) {
            addToast("Please fix the highlighted errors.", "error");
            return;
        }

        try {
            setLoading(true);
            const data = await fetch(
                process.env.NEXT_PUBLIC_BACKEND_URI + "/auth/login",
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ email, password }),
                }
            );

            if (data.ok) {
                const result = await data.json();
                login(result.user);
                addToast("Welcome back to Aarohi!", "success");
                window.location.href = "/";
            } else {
                setErrors({ general: "Invalid email or password" });
                addToast("Invalid email or password", "error");
            }
        } catch (err) {
            console.error("Error:", err);
            setErrors({ general: "Something went wrong. Try again." });
            addToast("Connection error. Please try again.", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center bg-[#05080f] overflow-hidden">
            
            {/* Elegant Background Blurs */}
            <div className="absolute w-[800px] h-[800px] bg-blue-600/10 blur-[160px] rounded-full top-[-300px] left-[-200px] pointer-events-none" />
            <div className="absolute w-[600px] h-[600px] bg-indigo-600/10 blur-[150px] rounded-full bottom-[-200px] right-[-100px] pointer-events-none" />

            {/* Premium Glassmorphic Card */}
            <div className="relative w-full max-w-md bg-white/[0.02] border border-white/10 backdrop-blur-3xl rounded-3xl p-10 md:p-12 shadow-[0_0_80px_rgba(37,99,235,0.15)] z-10 mx-4">
                
                <div className="text-center mb-10 space-y-4">
                    <img
                        src="/logo.png"
                        alt="Aarohi Logo"
                        className="mx-auto w-auto h-16 object-contain"
                    />
                    <div className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10">
                        <p className="text-gray-300 text-sm tracking-widest font-medium">
                            सा विद्या या विमुक्तये।
                        </p>
                    </div>
                </div>

                <div className="space-y-6" onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        handleLogin();
                    }
                }}>
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Email</label>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={`w-full bg-black/40 border focus:outline-none focus:ring-2 transition-all duration-300 rounded-xl px-5 py-4 text-white placeholder-gray-600 font-light ${
                                errors.email 
                                    ? "border-rose-500/50 focus:ring-rose-500/30 animate-[shake_0.4s_ease-in-out]" 
                                    : "border-white/10 focus:border-transparent focus:ring-blue-500/50"
                            }`}
                        />
                        {errors.email && (
                            <p className="text-rose-400 text-xs mt-1 ml-1 font-medium flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                                {errors.email}
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Password</label>
                        <input
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={`w-full bg-black/40 border focus:outline-none focus:ring-2 transition-all duration-300 rounded-xl px-5 py-4 text-white placeholder-gray-600 font-light ${
                                errors.password 
                                    ? "border-rose-500/50 focus:ring-rose-500/30 animate-[shake_0.4s_ease-in-out]" 
                                    : "border-white/10 focus:border-transparent focus:ring-blue-500/50"
                            }`}
                        />
                        {errors.password && (
                            <p className="text-rose-400 text-xs mt-1 ml-1 font-medium flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                                {errors.password}
                            </p>
                        )}
                    </div>

                    {errors.general && (
                        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm text-center flex items-center justify-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse"></span>
                            {errors.general}
                        </div>
                    )}
                </div>

                <button
                    onClick={handleLogin}
                    disabled={loading}
                    className="w-full mt-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold tracking-wide py-4 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] disabled:opacity-50 disabled:cursor-not-allowed group flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
                            Authenticating...
                        </>
                    ) : (
                        <>
                            Enter Aarohi
                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                        </>
                    )}
                </button>

                <div className="text-center text-sm text-gray-500 mt-6">
                    New here?{" "}
                    <button
                        onClick={() => {
                            window.location.href = "/signup";
                        }}
                        className="text-white hover:text-blue-400 font-semibold transition-colors decoration-blue-400/50 hover:underline underline-offset-4 cursor-pointer"
                    >
                        Create account
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Page;