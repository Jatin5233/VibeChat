// components/chat/FileModal.tsx
"use client";

import { useState } from "react";
import { X, Send, FileText, Image } from "lucide-react";

interface FileAttachmentModalProps {
  selectedFile: File | null;
  filePreview: string | null;
  onSend: () => void;
  onClose: () => void;
}

export default function FileAttachmentModal({
  selectedFile,
  filePreview,
  onSend,
  onClose,
}: FileAttachmentModalProps) {
  const [message, setMessage] = useState("");

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) return <FileText className="text-red-500" size={48} />;
    if (mimeType.includes('word') || mimeType.includes('document')) return <FileText className="text-blue-500" size={48} />;
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return <FileText className="text-green-500" size={48} />;
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return <FileText className="text-orange-500" size={48} />;
    if (mimeType.startsWith('image/')) return <Image className="text-purple-500" size={48} />;
    return <FileText className="text-gray-500" size={48} />;
  };

  if (!selectedFile) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-md w-full p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">Send File</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-700 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* File Preview */}
        <div className="mb-4">
          {selectedFile.type.startsWith('image/') && filePreview ? (
            <div className="relative">
              <img
                src={filePreview}
                alt={selectedFile.name}
                className="w-full max-h-64 object-contain rounded-lg bg-gray-900"
              />
            </div>
          ) : (
            <div className="flex items-center gap-3 p-4 bg-gray-700 rounded-lg">
              {getFileIcon(selectedFile.type)}
              <div className="flex-1">
                <p className="text-white font-medium truncate">{selectedFile.name}</p>
                <p className="text-gray-400 text-sm">{formatFileSize(selectedFile.size)}</p>
                <p className="text-gray-400 text-xs">{selectedFile.type}</p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSend();
              onClose();
            }}
            className="flex-1 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-500 transition-colors flex items-center justify-center gap-2"
          >
            <Send size={16} />
            Send File
          </button>
        </div>
      </div>
    </div>
  );
}