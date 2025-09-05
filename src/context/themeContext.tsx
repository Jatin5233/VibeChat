"use client";

import { createContext, useContext, useEffect, useState } from "react";
import api from "@/utils/refreshAccess";
import { themes } from "@/theme";

export type ThemeKey = keyof typeof themes;

type ThemeContextType = {
  theme: ThemeKey;
  setTheme: (theme: ThemeKey) => void;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: "midnight",
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeKey>("midnight");

  // 🔹 Load saved theme (from DB or localStorage)
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const res = await api.get("/api/auth/me", { withCredentials: true });
        if (res.data?.user?.theme) {
          setThemeState(res.data.user.theme as ThemeKey);
          localStorage.setItem("theme", res.data.user.theme);
          return;
        }
      } catch (err) {
        console.warn("⚠️ Could not load theme from DB, fallback to localStorage.");
      }

      // fallback → localStorage
      const local = localStorage.getItem("theme") as ThemeKey | null;
      if (local && themes[local]) {
        setThemeState(local);
      }
    };

    loadTheme();
  }, []);

  // 🔹 Save theme (DB + localStorage)
  const setTheme = (newTheme: ThemeKey) => {
    setThemeState(newTheme);
    localStorage.setItem("theme", newTheme);

    // try to update user theme in DB
    api.put(
      "/api/users/profile/theme",
      { theme: newTheme },
      { withCredentials: true }
    ).catch(() => {
      console.warn("⚠️ Failed to save theme in DB, localStorage fallback works.");
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
