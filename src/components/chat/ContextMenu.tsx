"use client";

import { useEffect, useRef, useState } from "react";
import { Pencil, Trash2 } from "lucide-react"; // Using icons for a cleaner look

interface ContextMenuProps {
  x: number;
  y: number;
  msgId: string;
  content: string;
  onEdit: (msg: { _id: string; content: string }) => void;
  onDelete: (msgId: string) => void;
  onClose: () => void;
}

export default function ContextMenu({
  x,
  y,
  msgId,
  content,
  onEdit,
  onDelete,
  onClose,
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [position, setPosition] = useState({ top: y, left: x });

  // Effect to handle clicking outside the menu to close it
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  // Effect to adjust menu position to keep it within the viewport
  useEffect(() => {
    if (menuRef.current) {
      const { innerWidth, innerHeight } = window;
      const menuRect = menuRef.current.getBoundingClientRect();

      let newLeft = x;
      let newTop = y;

      // Adjust horizontally if it overflows
      if (x + menuRect.width > innerWidth) {
        newLeft = x - menuRect.width;
      }

      // Adjust vertically if it overflows
      if (y + menuRect.height > innerHeight) {
        newTop = y - menuRect.height;
      }

      setPosition({ top: newTop, left: newLeft });
    }
  }, [x, y]);

  const handleEdit = () => {
    onEdit({ _id: msgId, content });
    onClose();
  };

  const handleDelete = () => {
    onDelete(msgId);
    onClose();
  };

  return (
    <div
      ref={menuRef}
      style={{ top: position.top, left: position.left }}
      // Added entrance animation and improved styling
      className="fixed z-50 w-40 rounded-lg bg-gray-800 p-1.5 shadow-xl ring-1 ring-white/10 animate-in fade-in zoom-in-95 duration-150"
      // Stop propagation to prevent the backdrop click from firing
      onClick={(e) => e.stopPropagation()} 
    >
      <button
        className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-white hover:bg-gray-700"
        onClick={handleEdit}
      >
        <Pencil size={14} />
        <span>Edit</span>
      </button>

      {/* Divider for better visual separation */}
      <div className="my-1 h-px bg-gray-700" />
      
      <button
        className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-red-400 hover:bg-red-500 hover:text-white"
        onClick={handleDelete}
      >
        <Trash2 size={14} />
        <span>Delete</span>
      </button>
    </div>
  );
}