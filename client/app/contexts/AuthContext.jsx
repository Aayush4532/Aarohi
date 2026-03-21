"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkUser = async () => {
    try {
      const res = await fetch(process.env.NEXT_PUBLIC_BACKEND_URI + "/user", {
        method: "GET",
        credentials: "include",
      });

      if (res.status === 200) {
        const data = await res.json();
        setUser(data);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("Auth check failed:", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkUser();
  }, []);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  const updateCurrentlyReading = (bookId, currentPage) => {
    setUser(prevUser => {
      if (!prevUser) return null;
      
      const current = prevUser.currently_reading || [];
      const index = current.findIndex(b => b.book_id === bookId);
      
      let newCurrentlyReading = [...current];
      if (index >= 0) {
        newCurrentlyReading[index] = { ...newCurrentlyReading[index], current_page: currentPage };
      }
      
      return { ...prevUser, currently_reading: newCurrentlyReading };
    });
  };

  const value = {
    user,
    loading,
    login,
    logout,
    checkUser,
    updateCurrentlyReading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
