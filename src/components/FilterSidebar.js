import React, { useState } from 'react';
import { Filter, X } from 'lucide-react';

const FilterSidebar = ({ onFilterChange, categories = [] }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState(2000);

  const defaultCategories = [
    { value: 'all', label: 'All Products', icon: '📦' },
    { value: 'magnetic', label: 'Magnetic', icon: '✨' },
    { value: 'keychain', label: 'Keychains', icon: '👑' },
    { value: 'acrylic', label: 'Acrylic', icon: '⚡' },
    { value: 'mdf', label: 'MDF', icon: '👑' }
  ];

  const allCategories = [...defaultCategories, ...categories.map(cat => ({
    value: cat.toLowerCase(),
    label: cat.charAt(0).toUpperCase() + cat.slice(1),
    icon: '📌'
  }))];

  const priceRanges = [
    { label: 'Under ₹500', min: 0, max: 500 },
    { label: '₹500 - ₹1000', min: 500, max: 1000 },
    { label: '₹1000 - ₹1500', min: 1000, max: 1500 },
    { label: 'Above ₹1500', min: 1500, max: 10000 }
  ];

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    onFilterChange({
      category: category === 'all' ? null : category,
      maxPrice: priceRange
    });
  };

  const handlePriceChange = (e) => {
    const price = parseInt(e.target.value);
    setPriceRange(price);
    onFilterChange({
      category: selectedCategory === 'all' ? null : selectedCategory,
      maxPrice: price
    });
  };

  const handlePriceRangeClick = (range) => {
    setPriceRange(range.max);
    onFilterChange({
      category: selectedCategory === 'all' ? null : selectedCategory,
      maxPrice: range.max
    });
  };

  const handleReset = () => {
    setSelectedCategory('all');
    setPriceRange(2000);
    onFilterChange({
      category: null,
      maxPrice: 2000
    });
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed bottom-6 right-6 bg-blue-600 text-white p-3 rounded-full shadow-lg z-40"
      >
        <Filter className="h-6 w-6" />
      </button>

      {/* Sidebar */}
      <div
        className={`fixed md:static inset-0 bg-black bg-opacity-50 md:bg-opacity-0 transition-opacity z-30 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      />

      <aside
        className={`fixed md:relative left-0 top-0 h-screen md:h-auto w-72 md:w-64 bg-white shadow-lg md:shadow-none p-6 overflow-y-auto transition-transform z-40 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Filter className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Filters</h2>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="md:hidden text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Category</h3>
          <div className="space-y-3">
            {allCategories.map((cat) => (
              <label
                key={cat.value}
                className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded transition"
              >
                <input
                  type="radio"
                  name="category"
                  value={cat.value}
                  checked={selectedCategory === cat.value}
                  onChange={() => handleCategoryChange(cat.value)}
                  className="w-4 h-4 text-blue-600 cursor-pointer"
                />
                <span className="text-lg">{cat.icon}</span>
                <span className="text-gray-700 font-medium">{cat.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Price Range Filter */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Price Range</h3>

          {/* Slider */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-gray-600">₹0</span>
              <span className="text-sm text-gray-600">₹2000</span>
            </div>
            <input
              type="range"
              min="0"
              max="2000"
              value={priceRange}
              onChange={handlePriceChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="mt-3 text-center">
              <span className="text-lg font-semibold text-blue-600">
                Up to ₹{priceRange}
              </span>
            </div>
          </div>

          {/* Quick Price Ranges */}
          <div className="space-y-2">
            {priceRanges.map((range) => (
              <button
                key={range.label}
                onClick={() => handlePriceRangeClick(range)}
                className={`w-full text-left px-4 py-3 rounded border-2 transition ${
                  priceRange === range.max
                    ? 'border-blue-600 bg-blue-50 text-blue-600 font-medium'
                    : 'border-gray-200 text-gray-700 hover:border-blue-300'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {/* Reset Button */}
        <button
          onClick={handleReset}
          className="w-full bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium py-2 px-4 rounded transition"
        >
          Reset Filters
        </button>

        {/* Divider for mobile */}
        <div className="mt-6 pt-6 border-t border-gray-200 md:hidden">
          <button
            onClick={() => setIsOpen(false)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition"
          >
            Apply Filters
          </button>
        </div>
      </aside>
    </>
  );
};

export default FilterSidebar;
