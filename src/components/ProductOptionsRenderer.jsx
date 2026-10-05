import React, { useState, useEffect } from 'react';
import { useProductVariants } from '../context/ProductVariantContext';
import { FiUpload, FiX } from 'react-icons/fi';

/**
 * Dynamic renderer for product options/variants
 * Handles select, text, number, and image_upload option types
 */
const ProductOptionsRenderer = ({
  productId,
  onOptionsChange,
  selectedOptions = {},
  uploadedImages = {},
  onImageUpload,
  readOnly = false,
}) => {
  const { getProductOptions, loading } = useProductVariants();
  const [options, setOptions] = useState([]);
  const [fileInputs, setFileInputs] = useState({});

  // Fetch product options
  useEffect(() => {
    const fetchOptions = async () => {
      const productOptions = await getProductOptions(productId);
      setOptions(productOptions || []);
    };
    fetchOptions();
  }, [productId, getProductOptions]);

  const handleOptionChange = (optionName, value) => {
    if (readOnly) return;
    
    onOptionsChange({
      ...selectedOptions,
      [optionName]: value,
    });
  };

  const handleImageSelect = async (event, optionId, optionName) => {
    if (readOnly) return;

    const file = event.target.files[0];
    if (!file) return;

    if (onImageUpload) {
      await onImageUpload(file, optionId, optionName);
    }
  };

  const removeImage = (optionName) => {
    if (readOnly) return;
    
    const newUploaded = { ...uploadedImages };
    delete newUploaded[optionName];
    onImageUpload(null, null, optionName, newUploaded);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-ivory-sand animate-pulse" />
        <div className="h-10 bg-ivory-sand animate-pulse" />
      </div>
    );
  }

  if (options.length === 0) {
    return (
      <div className="text-center py-6 text-xs text-ink-muted uppercase tracking-wider font-light">
        Standard Customization Available
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {options.map((option) => (
        <div key={option.id} className="space-y-2">
          <label className="block text-micro font-medium uppercase tracking-widest text-charcoal">
            {option.option_name}
            {option.is_required && <span className="text-accent ml-1">*</span>}
          </label>

          {/* SELECT Type */}
          {option.option_type === 'select' && (
            <select
              value={selectedOptions[option.option_name] || ''}
              onChange={(e) => handleOptionChange(option.option_name, e.target.value)}
              disabled={readOnly}
              required={option.is_required}
              className="w-full px-4 py-3 border border-charcoal/15 bg-white text-charcoal text-xs focus:outline-none focus:border-charcoal transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Choose {option.option_name}</option>
              {option.values && option.values.map((value) => (
                <option key={value.id} value={value.value}>
                  {value.display_label}
                  {value.price_modifier > 0 && ` (+₹${value.price_modifier})`}
                  {value.price_modifier < 0 && ` (-₹${Math.abs(value.price_modifier)})`}
                </option>
              ))}
            </select>
          )}

          {/* TEXT Type */}
          {option.option_type === 'text' && (
            <input
              type="text"
              value={selectedOptions[option.option_name] || ''}
              onChange={(e) => handleOptionChange(option.option_name, e.target.value)}
              placeholder={`Enter custom ${option.option_name.toLowerCase()}`}
              disabled={readOnly}
              required={option.is_required}
              className="w-full px-4 py-3 border border-charcoal/15 bg-white text-charcoal text-xs focus:outline-none focus:border-charcoal transition-colors placeholder:text-ink-muted/50 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          )}

          {/* NUMBER Type */}
          {option.option_type === 'number' && (
            <input
              type="number"
              value={selectedOptions[option.option_name] || ''}
              onChange={(e) => handleOptionChange(option.option_name, e.target.value)}
              placeholder={`Enter ${option.option_name.toLowerCase()}`}
              disabled={readOnly}
              required={option.is_required}
              min="0"
              className="w-full px-4 py-3 border border-charcoal/15 bg-white text-charcoal text-xs focus:outline-none focus:border-charcoal transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            />
          )}

          {/* IMAGE UPLOAD Type */}
          {option.option_type === 'image_upload' && (
            <div className="space-y-3">
              {uploadedImages[option.option_name] ? (
                <div className="relative bg-ivory p-2 border border-charcoal/15">
                  <img
                    src={uploadedImages[option.option_name].preview || uploadedImages[option.option_name]}
                    alt={option.option_name}
                    className="w-full h-36 object-cover"
                  />
                  {!readOnly && (
                    <button
                      onClick={() => removeImage(option.option_name)}
                      className="absolute top-4 right-4 p-1.5 bg-charcoal text-ivory hover:bg-black transition-colors"
                      title="Remove image"
                    >
                      <FiX className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <p className="text-micro text-ink-muted mt-2 tracking-wide truncate">
                    {uploadedImages[option.option_name].name || 'Selected Photograph'}
                  </p>
                </div>
              ) : (
                <label className="block">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageSelect(e, option.id, option.option_name)}
                    disabled={readOnly}
                    ref={(el) => setFileInputs(prev => ({ ...prev, [option.id]: el }))}
                    className="hidden"
                  />
                  <div
                    onClick={() => !readOnly && fileInputs[option.id]?.click()}
                    className={`border border-dashed border-charcoal/20 p-6 text-center cursor-pointer transition-all bg-white hover:border-charcoal hover:bg-ivory/50 ${
                      readOnly ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <FiUpload className="w-5 h-5 mx-auto text-charcoal/60 mb-2" />
                    <p className="text-xs font-medium uppercase tracking-wider text-charcoal">
                      Upload Photograph
                    </p>
                    <p className="text-micro text-ink-muted mt-1">
                      High resolution JPEG, PNG or WebP
                    </p>
                  </div>
                </label>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ProductOptionsRenderer;
