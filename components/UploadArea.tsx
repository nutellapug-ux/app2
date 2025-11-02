import React, { useCallback, useState } from 'react';
import Icon from './Icon';

interface UploadAreaProps {
  onUpload: (file: File) => void;
}

const UploadArea: React.FC<UploadAreaProps> = ({ onUpload }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUpload(e.target.files[0]);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onUpload(e.dataTransfer.files[0]);
    }
  }, [onUpload]);

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  return (
    <div className="w-full max-w-2xl mt-10">
      <label
        htmlFor="file-upload"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-3xl cursor-pointer bg-white/5 backdrop-blur-md transition-all duration-300 ease-in-out ${isDragging ? 'border-sky-400 bg-sky-500/10' : 'border-gray-600 hover:border-gray-400'}`}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
          <Icon name="upload" className={`w-12 h-12 mb-4 text-gray-400 transition-colors ${isDragging ? 'text-sky-300' : ''}`} />
          <p className="mb-2 text-lg font-semibold text-gray-300">
            <span className="font-bold text-sky-400">Click to upload</span> or drag and drop
          </p>
          {/* FIX: Corrected file types and max size to match validation logic in App.tsx */}
          <p className="text-sm text-gray-500">JPG or PNG (max 5MB)</p>
        </div>
        <input 
          id="file-upload" 
          type="file" 
          className="hidden" 
          // FIX: Corrected accepted file types to match validation logic in App.tsx
          accept="image/jpeg, image/png"
          onChange={handleFileChange} 
        />
      </label>
      <p className="text-xs text-gray-600 mt-4 text-center">
        Please ensure you have the rights to use the images you upload.
      </p>
    </div>
  );
};

export default UploadArea;