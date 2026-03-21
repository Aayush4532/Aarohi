"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Book from "./Book";

const Books = ({ type }) => {
    const [books, setBooks] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(null);
    const [loading, setLoading] = useState(false);
    const observerRef = useRef(null);
    const fetchingRef = useRef(false);

    const fetchBooks = async (pageNumber) => {
        if (fetchingRef.current) return;
        fetchingRef.current = true;

        try {
            setLoading(true);

            // Build the URL based on whether a type is provided
            let apiUrl = `${process.env.NEXT_PUBLIC_BACKEND_URI}/api?page=${pageNumber}`;
            // Assuming "recommended" is the default and does not need a query param
            if (type && type !== "recommended") {
                apiUrl += `&bookType=${type}`;
            }

            const res = await fetch(
                apiUrl,
                {
                    method: "GET",
                    credentials: "include",
                }
            );

            const data = await res.json();
            setBooks(prev => {
                const map = new Map();
                prev.forEach(b => map.set(b.id, b));
                data?.books?.forEach(b => map.set(b.id, b));
                return Array.from(map.values());
            });

            setTotalPages(data.total_pages);
        } catch (err) {
            console.error("Error fetching books:", err);
        } finally {
            setLoading(false);
            fetchingRef.current = false;
        }
    };

    useEffect(() => {
        setBooks([]); // Reset books if type changes
        setPage(1);
        setTotalPages(null);
        fetchingRef.current = false;
        fetchBooks(1);
    }, [type]);

    const lastBookRef = useCallback((node) => {
        if (loading) return;
        if (observerRef.current) observerRef.current.disconnect();

        observerRef.current = new IntersectionObserver((entries) => {
            if (!entries[0].isIntersecting) return;
            if (totalPages !== null && page >= totalPages) return;
            const nextPage = page + 1;
            setPage(nextPage);
            fetchBooks(nextPage);
        }, {
            rootMargin: "300px"
        });

        if (node) observerRef.current.observe(node);
    }, [loading, page, totalPages]);

    return (
        <div className="w-full mx-auto py-4 h-[420px] overflow-hidden">
            <div className="flex flex-wrap gap-6 lg:gap-8 justify-start">
                {books?.map((book, index) => {
                    if (index === books.length - 1) {
                        return (
                            <div ref={lastBookRef} key={book.id}>
                                <Book val={book} />
                            </div>
                        );
                    }
                    return <Book key={book.id} val={book} />;
                })}
            </div>

            {loading && (
                <div className="text-center mt-10 text-gray-500 text-sm">
                    Loading more books...
                </div>
            )}
        </div>
    );
};

export default Books;