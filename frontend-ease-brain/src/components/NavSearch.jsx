import React, { useState, useRef, useEffect } from "react";
import { FaSearch } from "react-icons/fa";

const NavSearch = ({ onSearch }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);

  // Auto-focus when search expands
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(query);
  };

  return (
    <div className="relative flex items-center">
      {/* Search Button Circle */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="p-2 rounded-full bg-white/30 backdrop-blur-md border border-white/40 shadow-sm 
                     hover:bg-white/50 transition-all"
        >
          <FaSearch className="text-teal-700 text-lg" />
        </button>
      )}

      {/* Expandable Search Input */}
      {open && (
        <form
          onSubmit={handleSearch}
          className="flex items-center gap-2 bg-white/40 backdrop-blur-xl
                     border border-white/50 px-4 py-2 rounded-full shadow-lg
                     w-[160px] sm:w-[200px] md:w-[240px] 
                     transition-all duration-300"
        >
          <FaSearch className="text-teal-700 text-sm" />

          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search…"
            className="bg-transparent outline-none text-teal-700 placeholder-gray-500 w-full"
          />

          {/* Close button */}
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setOpen(false);
            }}
            className="text-teal-600 font-bold text-lg px-1 hover:text-teal-800"
          >
            ×
          </button>
        </form>
      )}
    </div>
  );
};

export default NavSearch;
