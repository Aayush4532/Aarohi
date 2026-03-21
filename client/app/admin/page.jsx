"use client";
import React, { useEffect, useState } from 'react';
import Loading from '../components/Loading';
import AdminPage from '../pages/AdminPage';
const page = () => {
    const [admin, setAdmin] = useState("");
    useEffect (() => {
        const CheckAdmin = async () => {
            const res = await fetch(process.env.NEXT_PUBLIC_BACKEND_URI + "/api/isAdmin", {
                method : "GET",
                credentials : "include",
            })

            setAdmin(res.status);
        }
        CheckAdmin();
    }, []);

    if (admin === "") return <Loading />;
    if (admin == 200) {
        return <AdminPage />
    } else {
        return (
            <div>
                forbidden you are not allowed here..
            </div>
        )
    }
}

export default page;