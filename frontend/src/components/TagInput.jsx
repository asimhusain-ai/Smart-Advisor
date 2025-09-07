import { useState } from 'react';
import { motion } from 'framer-motion';

const TagInput = ({ tags, onTagsChange, placeholder }) => {
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      onTagsChange([...tags, inputValue.trim()]);
      setInputValue('');
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      onTagsChange(tags.slice(0, -1));
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text');
    const newTags = pasteData.split(',').map(tag => tag.trim()).filter(tag => tag);
    onTagsChange([...tags, ...newTags]);
  };

  const removeTag = (indexToRemove) => {
    onTagsChange(tags.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="bg-slate-700/50 border border-slate-600 rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-teal-400">
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag, index) => (
          <motion.span
            key={index}
            className="inline-flex items-center gap-1 bg-teal-400/20 text-teal-300 px-3 py-1 rounded-full text-sm"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="text-teal-500 hover:text-teal-400 transition-colors"
              aria-label={`Remove ${tag}`}
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </motion.span>
        ))}
      </div>
      
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleInputKeyDown}
        onPaste={handlePaste}
        placeholder={placeholder}
        className="bg-transparent outline-none text-white placeholder-gray-400 w-full"
      />
    </div>
  );
};

export default TagInput;