import { useState } from 'react';
import { motion } from 'framer-motion';
import { useApi } from '../hooks/useApi';

const ResumeUpload = ({ onTextExtracted }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { post } = useApi();

  const handleFileUpload = async (file) => {
    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await post('/api/parse-resume', formData, true);
      onTextExtracted(response.text);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error parsing PDF. Please try again or paste text manually.');
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium mb-2">Upload Resume Here</label>
      
      <motion.div
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
          isDragging 
            ? 'border-teal-400 bg-teal-400/10' 
            : 'border-slate-600 hover:border-slate-500'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById('resume-upload').click()}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <input
          id="resume-upload"
          type="file"
          accept=".pdf"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <div className="space-y-2">
          <svg className="w-12 h-12 mx-auto text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          
          <div>
            <p className="text-sm text-gray-300">
              {uploading ? 'Processing...' : 'Drag & drop your resume or click to browse'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              PDF files only (max 10MB)
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ResumeUpload;