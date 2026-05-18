"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("theme");
      if (saved === "dark") {
        document.documentElement.classList.add("dark");
        setTheme("dark");
        return;
      }
      if (saved === "light") {
        document.documentElement.classList.remove("dark");
        setTheme("light");
        return;
      }
      // No saved preference, use system preference
      const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefersDark) {
        document.documentElement.classList.add("dark");
        setTheme("dark");
      } else {
        document.documentElement.classList.remove("dark");
        setTheme("light");
      }
    } catch (e) {
      // ignore (server environments)
    }
  }, []);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    if (next === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
    try {
      localStorage.setItem("theme", next);
    } catch (e) {}
    setTheme(next);
  }

  return (
    <button
      onClick={toggleTheme}
      aria-label="Alternar tema"
      title="Alternar tema"
      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-transparent bg-transparent text-sm"
    >
      {theme === "dark" ? "🌙" : "☀️"}
    </button>
  );
}
