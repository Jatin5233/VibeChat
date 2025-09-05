"use client";

import { useState,  useRef, useCallback } from "react";
import { useTheme } from "@/context/themeContext";
import { themes } from "@/theme";
import { Search, X } from "lucide-react";

interface SearchBarProps {
  searchQuery: string;
  onSearch: (query: string) => void;
}

export default function SearchBar({
  searchQuery,
  onSearch,
}: SearchBarProps) {
  const { theme } = useTheme();
  const t = themes[theme];

  // Local state for the input - this is crucial for smooth typing
  const [inputValue, setInputValue] = useState(searchQuery);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastSearchedValue = useRef(searchQuery);

  // Sync with parent prop changes ONLY when it's different from what we last searched
 

  // Debounced search function
  const debouncedSearch = useCallback((value: string) => {
    // Clear any existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Set new timer
    timerRef.current = setTimeout(() => {
      // Only search if the value is different from what was last searched
      if (value !== lastSearchedValue.current) {
        lastSearchedValue.current = value;
        onSearch(value);
      }
    }, 300);
  }, [onSearch]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    debouncedSearch(value);
  };

  const handleClear = () => {
    // Clear the timer to prevent any pending searches
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    // Clear the input and immediately notify parent
    setInputValue("");
    lastSearchedValue.current = "";
    onSearch("");
    
    // Keep focus on the input
    if (inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      // Clear timer and search immediately
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      const trimmedValue = inputValue.trim();
      lastSearchedValue.current = trimmedValue;
      onSearch(trimmedValue);
    }
    if (e.key === 'Escape') {
      if (inputRef.current) {
        inputRef.current.blur();
      }
    }
  };

 

  return (
    <div className="relative w-full">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <Search size={18} className={t.subtext} />
      </div>
      <input
        ref={inputRef}
        type="text"
        placeholder="Search for users..."
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        className={`w-full rounded-lg border-2 border-transparent py-2 pl-10 pr-10 text-sm outline-none transition-colors ${t.card} ${t.text} placeholder:${t.subtext} focus:border-pink-500`}
      />
      {inputValue && (
        <button
          onClick={handleClear}
          onMouseDown={(e) => {
            // Prevent the input from losing focus when clicking the clear button
            e.preventDefault();
          }}
          className="absolute inset-y-0 right-0 flex items-center pr-3 hover:bg-opacity-10 rounded-r-lg transition-colors"
          aria-label="Clear search"
          type="button"
        >
          <X size={16} className={`${t.subtext} hover:${t.text} transition-colors`} />
        </button>
      )}
    </div>
  );
}