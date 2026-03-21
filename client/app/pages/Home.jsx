"use client";
import React, { useState, useEffect } from "react";
import SideBar from "../components/SideBar";
import UpperBar from "../components/Upperbar";
import Books from "../components/Books";

const Home = () => {
    const [user, setUser] = useState(null);

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
                console.error(err);
            }
        };

        fetchUser();
    }, []);

    return (
        <div className="w-full text-white pb-20 px-4 md:px-8 xl:px-12">
            <div className="max-w-[1600px] mx-auto space-y-12 mt-8 md:mt-12">

                {/* HERO SECTION */}

                <section className="relative w-full rounded-2xl overflow-hidden glass-premium group">
                    {/* Background Pattern matches vertical lines in the image */}
                    <div
                        className="absolute inset-0 pointer-events-none transition-opacity duration-700"
                        style={{
                            backgroundImage: `url('/heroBackground.png')`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            opacity: 1
                        }}
                    ></div>
                    {/* Subtle gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[var(--background)]/80 via-[var(--background)]/80 to-[var(--background)]/90 pointer-events-none"></div>

                    <div className="relative z-10 p-10 md:p-14 flex flex-col md:flex-row items-center gap-12 lg:gap-20">

                        {/* Left Side: Book Image Container */}
                        <div className="hidden md:flex flex-shrink-0 w-[240px] h-[360px] relative z-20">
                            <div className="absolute inset-0 bg-cyan-500/20 blur-2xl rounded-full pointer-events-none"></div>
                            <img
                                src="https://pub-bfa8c5de740048a5a896465728b28375.r2.dev/books/69aeb707d9ec526fc3a0011f.png"
                                alt="Featured Book"
                                className="w-full h-full object-cover rounded-md shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 relative z-10"
                            />
                            {/* Book spine simulation effect */}
                            <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-black/40 to-transparent z-20 rounded-l-md pointer-events-none"></div>
                        </div>

                        {/* Right Side: Text Content */}
                        <div className="flex-1 space-y-6">
                            <div className="inline-block px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold tracking-widest rounded-full shadow-[0_0_15px_rgba(59,130,246,0.15)]">
                                FEATURED OF THE MONTH
                            </div>

                            <h1 className="text-4xl md:text-5xl lg:text-5xl font-extrabold leading-tight text-gradient-primary tracking-tight">
                                Discover Your Next <br /> Great Read
                            </h1>

                            <p className="text-gray-400 text-lg leading-relaxed max-w-xl font-light">
                                Join our vibrant community of book lovers.
                                Track your progress, share insightful annotations,
                                and connect with readers worldwide.
                            </p>

                            <div className="flex flex-wrap gap-4 pt-4">
                                <button className="bg-blue-600 hover:bg-blue-500 px-8 py-3.5 rounded-xl font-semibold text-white transition-all duration-300 shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] hover:-translate-y-0.5">
                                    Explore Now
                                </button>

                                <button className="bg-white/5 hover:bg-white/10 border border-white/10 px-8 py-3.5 rounded-xl font-semibold text-white transition-all duration-300 backdrop-blur-md hover:-translate-y-0.5 shadow-lg">
                                    View Details
                                </button>
                            </div>
                        </div>

                    </div>
                </section>

                {/* RECOMMENDED SECTION */}

                <section className="space-y-8 mt-16">

                    <div className="flex justify-between items-end border-b border-white/10 pb-4">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight text-white/90">
                                Recommended for You
                            </h2>
                        </div>

                        <button className="text-blue-400 hover:text-blue-300 text-sm font-medium tracking-wide transition-colors flex items-center gap-1 group">
                            Explore All
                            <span className="group-hover:translate-x-1 transition-transform">→</span>
                        </button>
                    </div>

                    <Books type="recommended" />

                </section>

                {/* FICTION BOOKS */}

                <section className="space-y-8 mt-16">

                    <div className="flex justify-between items-end border-b border-white/10 pb-4">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight text-white/90">
                                Fiction
                            </h2>
                        </div>

                        <button className="text-blue-400 hover:text-blue-300 text-sm font-medium tracking-wide transition-colors flex items-center gap-1 group">
                            Explore All
                            <span className="group-hover:translate-x-1 transition-transform">→</span>
                        </button>
                    </div>

                    <Books type="fiction" />
                </section>

                {/* PHILOSOPHY BOOKS */}

                <section className="space-y-8 mt-16">

                    <div className="flex justify-between items-end border-b border-white/10 pb-4">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight text-white/90">
                                Philosophy
                            </h2>
                        </div>

                        <button className="text-blue-400 hover:text-blue-300 text-sm font-medium tracking-wide transition-colors flex items-center gap-1 group">
                            Explore All
                            <span className="group-hover:translate-x-1 transition-transform">→</span>
                        </button>
                    </div>

                    <Books type="philosophy" />
                </section>

                {/* SPIRITUALITY BOOKS */}

                <section className="space-y-8 mt-16">

                    <div className="flex justify-between items-end border-b border-white/10 pb-4">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight text-white/90">
                                Spirituality
                            </h2>
                        </div>

                        <button className="text-blue-400 hover:text-blue-300 text-sm font-medium tracking-wide transition-colors flex items-center gap-1 group">
                            Explore All
                            <span className="group-hover:translate-x-1 transition-transform">→</span>
                        </button>
                    </div>

                    <Books type="spirituality" />
                </section>

                {/* BIOGRAPHY BOOKS */}

                <section className="space-y-8 mt-16">

                    <div className="flex justify-between items-end border-b border-white/10 pb-4">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight text-white/90">
                                Biography
                            </h2>
                        </div>

                        <button className="text-blue-400 hover:text-blue-300 text-sm font-medium tracking-wide transition-colors flex items-center gap-1 group">
                            Explore All
                            <span className="group-hover:translate-x-1 transition-transform">→</span>
                        </button>
                    </div>

                    <Books type="biography" />
                </section>

                {/* SCIENCE BOOKS */}

                <section className="space-y-8 mt-16">

                    <div className="flex justify-between items-end border-b border-white/10 pb-4">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight text-white/90">
                                Science
                            </h2>
                        </div>

                        <button className="text-blue-400 hover:text-blue-300 text-sm font-medium tracking-wide transition-colors flex items-center gap-1 group">
                            Explore All
                            <span className="group-hover:translate-x-1 transition-transform">→</span>
                        </button>
                    </div>

                    <Books type="science" />
                </section>

                {/* MYSTERY BOOKS */}

                <section className="space-y-8 mt-16">

                    <div className="flex justify-between items-end border-b border-white/10 pb-4">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight text-white/90">
                                Mystery
                            </h2>
                        </div>

                        <button className="text-blue-400 hover:text-blue-300 text-sm font-medium tracking-wide transition-colors flex items-center gap-1 group">
                            Explore All
                            <span className="group-hover:translate-x-1 transition-transform">→</span>
                        </button>
                    </div>

                    <Books type="mystery" />
                </section>

                {/* HISTORY BOOKS */}

                <section className="space-y-8 mt-16 pb-12">

                    <div className="flex justify-between items-end border-b border-white/10 pb-4">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight text-white/90">
                                History
                            </h2>
                        </div>

                        <button className="text-blue-400 hover:text-blue-300 text-sm font-medium tracking-wide transition-colors flex items-center gap-1 group">
                            Explore All
                            <span className="group-hover:translate-x-1 transition-transform">→</span>
                        </button>
                    </div>

                    <Books type="history" />
                </section>
            </div>
        </div>
    );
};

export default Home;