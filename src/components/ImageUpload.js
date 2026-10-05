import React, { useState } from 'react';
import { FiUpload, FiX, FiImage } from 'react-icons/fi';

const ImageUpload = ({ onImageUpload, currentImage }) => {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState(currentImage || null);

  const handleFile = (file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target.result;
        setPreview(imageData);
        onImageUpload(imageData);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const removeImage = () => {
    setPreview(null);
    onImageUpload(null);
  };

  return (
    <div className="w-full">
      <label className="block text-micro font-medium uppercase tracking-widest text-charcoal mb-2">
        Upload Your Photograph
      </label>
      
      {preview ? (
        <div className="relative bg-ivory p-2 border border-charcoal/15">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-56 object-cover"
          />
          <button
            onClick={removeImage}
            className="absolute top-4 right-4 bg-charcoal text-ivory p-2 hover:bg-black transition-colors"
            title="Remove photo"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          className={`relative border border-dashed p-8 text-center transition-all bg-white cursor-pointer ${
            dragActive ? 'border-charcoal bg-ivory' : 'border-charcoal/20 hover:border-charcoal/60 hover:bg-ivory/40'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          
          <div className="space-y-2">
            <div className="flex justify-center">
              <FiUpload className="h-8 w-8 text-charcoal/50" />
            </div>
            
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-charcoal">
                {dragActive ? 'Drop your photograph here' : 'Select or drop photograph'}
              </p>
              <p className="text-micro text-ink-muted mt-1">
                JPEG, PNG, WebP • Up to 10MB
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;