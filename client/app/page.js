"use client";
import React, { useEffect, useState } from "react";
import Home from "./pages/Home";
import Loading from "./components/Loading";
import { useRouter } from "next/navigation";

const Page = () => {
  const [status, setStatus] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchIsUser = async () => {
      try {
        const res = await fetch(
          process.env.NEXT_PUBLIC_BACKEND_URI + "/api",
          {
            method: "GET",
            credentials: "include",
          }
        );

        setStatus(res.status);
      } catch (err) {
        console.error("Some error occurred", err);
        setStatus(500);
      }
    };

    fetchIsUser();
  }, []);

  useEffect(() => {
    if (status && status !== 200) {
      router.push("/signup");
    }
  }, [status, router]);

  if (status === null) return <Loading />;

  if (status === 200) return <Home />;

  return null;
};

export default Page;