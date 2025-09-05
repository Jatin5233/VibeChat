import { useEffect, useRef } from "react";

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
  onClose, }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      style={{ top: y, left: x }}
      className="fixed z-5000 bg-gray-800 text-white rounded-lg shadow-md p-2"
    >
      <button
        className="block w-full text-left px-4 py-2 hover:bg-gray-600 rounded"
        onClick={() => {
         onEdit({ _id: msgId, content });
          onClose();
        }}
      >
        ✏️ Edit
      </button>
      <button
        className="block w-full text-left px-4 py-2 hover:bg-red-600 rounded"
        onClick={() => {
          onDelete(msgId);
          onClose();
        }}
      >
        🗑 Delete
      </button>
    </div>
  );
}
