"use client";
import React from "react";
import { useRouter } from "next/navigation";

const Book = ({ val }) => {
    const router = useRouter();

    if (!val) return null;

    const {
        id,
        title,
        author,
        thumbnail,
        total_rating,
        total_review,
    } = val;

    const average_rating =
        total_review > 0 ? (total_rating / total_review).toFixed(1) : "0.0";

    const handleClickOnDiv = () => {
        router.push(`/book/${id}`);
    };

    const formatReviews = (num) => {
        if (!num) return "0";
        if (num >= 1000) return (num / 1000).toFixed(1) + "k";
        return num.toString();
    };

    return (
        <div
            onClick={handleClickOnDiv}
            className="group w-[150px] sm:w-[180px] md:w-[200px] cursor-pointer"
        >
            <div className="relative aspect-[2/3] w-full mb-4 overflow-hidden rounded-xl shadow-[0_8px_20px_rgba(0,0,0,0.4)] transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-[0_20px_40px_rgba(59,130,246,0.2)] border border-transparent group-hover:border-blue-500/30">
                <img
                    src={thumbnail || "/featured-book.png"}
                    alt={title}
                    className="w-full h-full object-cover"
                />
            </div>

            <div className="px-1">
                <h3 className="text-gray-100 group-hover:text-blue-400 font-semibold text-base leading-tight line-clamp-2 mb-1">
                    {title}
                </h3>

                <p className="text-gray-400 text-sm mb-2 line-clamp-1">
                    {author}
                </p>

                <div className="flex items-center gap-1.5 text-sm">
                    <span className="text-amber-500 text-xs">★</span>
                    <span className="text-white font-medium">{average_rating}</span>
                    <span className="text-gray-500">
                        ({formatReviews(total_review)})
                    </span>
                </div>
            </div>
        </div>
    );
};

export default Book;