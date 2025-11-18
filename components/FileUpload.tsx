import React, { useCallback, useState } from 'react';
import { UploadCloud, FileType, AlertCircle } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  return (
    <div
      className={`relative border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center transition-all duration-300 ease-in-out group cursor-pointer
        ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-white hover:border-blue-400 hover:bg-slate-50'}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={handleInputChange}
      />
      
      <div className="bg-blue-100 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
        <UploadCloud className="w-8 h-8 text-blue-600" />
      </div>
      
      <h3 className="text-lg font-semibold text-slate-800 mb-2">
        Upload Check Image or PDF
      </h3>
      
      <p className="text-slate-500 text-center max-w-xs mb-6">
        Drag & drop your file here, or click to browse.
        <br/>
        <span className="text-xs text-slate-400">Supports JPG, PNG, PDF</span>
      </p>

      <div className="flex items-center gap-4 text-xs text-slate-400 border-t border-slate-200 pt-6 w-full justify-center">
        <div className="flex items-center gap-1">
          <FileType className="w-4 h-4" />
          <span>Auto-Extraction</span>
        </div>
        <div className="flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          <span>Fraud Scan</span>
        </div>
      </div>
    </div>
  );
};
