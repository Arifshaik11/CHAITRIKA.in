import React, { useState } from 'react';
import { useProducts } from '../../context/ProductContext';
import { useCategories } from '../../context/CategoryContext';
import { supabase } from '../../supabase';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX, FiUpload } from 'react-icons/fi';
import { uploadProductImage } from '../../utils/imageUpload';

const AdminProducts = () => {
  const { products, loading: productsLoading, addProduct, updateProduct, deleteProduct } = useProducts();
  const { categories } = useCategories();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    description: '',
    price: '',
    discount_percent: 0,
    moq: 1,
    image_url: '',
    active: true,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || product.category_id === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = async () => {
    if (!imageFile) return;
    setUploading(true);
    try {
      const result = await uploadProductImage(imageFile);
      if (result.error) {
        alert(`Upload failed: ${result.error}`);
      } else {
        setFormData({ ...formData, image_url: result.url });
        setImageFile(null);
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category_id: categories[0]?.id || '',
      description: '',
      price: '',
      discount_percent: 0,
      moq: 1,
      image_url: '',
      active: true,
    });
    setImagePreview(null);
    setImageFile(null);
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    const resolvedCatId = product.category_id || categories.find(c => c.slug === product.category || c.name?.toLowerCase() === product.category?.toLowerCase())?.id || categories[0]?.id || '';
    const resolvedImg = product.image_url || product.image || '';
    setFormData({
      ...product,
      category_id: resolvedCatId,
      image_url: resolvedImg,
      price: product.price ?? '',
    });
    setImagePreview(resolvedImg);
    setImageFile(null);
    setShowModal(true);
  };

  const handleSaveProduct = async () => {
    if (!formData.name || !formData.category_id || !formData.price) {
      alert('Please fill in all required fields (Name, Category, Price)');
      return;
    }

    try {
      let finalImageUrl = formData.image_url;

      if (imageFile && !finalImageUrl) {
        setUploading(true);
        try {
          const uploadRes = await uploadProductImage(imageFile);
          if (uploadRes?.url) {
            finalImageUrl = uploadRes.url;
          } else if (imagePreview) {
            finalImageUrl = imagePreview;
          }
        } catch (imgErr) {
          console.warn('Auto upload failed, using image preview:', imgErr);
          if (imagePreview) finalImageUrl = imagePreview;
        } finally {
          setUploading(false);
        }
      } else if (!finalImageUrl && imagePreview) {
        finalImageUrl = imagePreview;
      }

      const productData = {
        ...(editingProduct || {}),
        ...formData,
        name: formData.name,
        category_id: formData.category_id,
        description: formData.description || '',
        price: parseFloat(formData.price),
        discount_percent: parseInt(formData.discount_percent) || 0,
        moq: parseInt(formData.moq) || 1,
        image_url: finalImageUrl || '',
        image: finalImageUrl || '',
        active: formData.active !== false,
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
      } else {
        await addProduct(productData);
      }
      setShowModal(false);
    } catch (err) {
      console.error('Save error details:', err);
      alert(`Failed to save product: ${err.message}`);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product? This will also delete all related order items.')) return;

    try {
      await deleteProduct(productId);
    } catch (err) {
      console.error('Delete error:', err);
      alert(`Failed to delete product: ${err.message || 'Unknown error'}`);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#1C1917]">Products & Frames</h1>
          <p className="text-xs font-medium text-[#5A5550] mt-1">Manage catalog items, pricing and stock</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-[#1C1917] hover:bg-[#332E2A] text-white font-bold flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs uppercase tracking-wider transition-colors shadow-xs"
        >
          <FiPlus className="w-4 h-4" />
          Add Frame
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white border border-[#E7E2DC] rounded-xl p-4 flex flex-wrap gap-4 shadow-xs">
        {/* Search */}
        <div className="flex-1 min-w-[240px] flex items-center gap-2 bg-[#FAF7F4] border border-[#DCD6CE] rounded-lg px-3.5 py-2">
          <FiSearch className="w-4 h-4 text-[#78716C]" />
          <input
            type="text"
            placeholder="Search frame by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent outline-none flex-1 text-xs font-medium text-[#1C1917] placeholder:text-[#9A9590]"
          />
        </div>

        {/* Category Filter */}
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-3.5 py-2 bg-[#FAF7F4] border border-[#DCD6CE] rounded-lg text-xs font-medium text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
        >
          <option value="all">All Frame Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-[#E7E2DC] rounded-xl shadow-xs overflow-hidden">
        {productsLoading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[#1C1917]"></div>
            <p className="mt-2 text-xs font-semibold text-[#5A5550]">Loading frames...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm font-semibold text-[#5A5550] mb-3">No products found</p>
            <button
              onClick={openAddModal}
              className="text-[#B86B57] text-xs uppercase tracking-wider hover:underline font-bold"
            >
              Add the first frame →
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF7F4] border-b border-[#E7E2DC]">
                <tr>
                  <th className="px-6 py-3.5 font-bold uppercase tracking-wider text-[#1C1917]">Preview</th>
                  <th className="px-6 py-3.5 font-bold uppercase tracking-wider text-[#1C1917]">Product Name</th>
                  <th className="px-6 py-3.5 font-bold uppercase tracking-wider text-[#1C1917]">Category</th>
                  <th className="px-6 py-3.5 font-bold uppercase tracking-wider text-[#1C1917]">Price</th>
                  <th className="px-6 py-3.5 font-bold uppercase tracking-wider text-[#1C1917]">Status</th>
                  <th className="px-6 py-3.5 text-right font-bold uppercase tracking-wider text-[#1C1917]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E2DC]">
                {filteredProducts.map((product) => {
                  const category = categories.find((c) => c.id === product.category_id);
                  const imageUrl = product.image_url || product.image;
                  return (
                    <tr key={product.id} className="hover:bg-[#FAF7F4] transition-colors">
                      <td className="px-6 py-3.5">
                        {imageUrl ? (
                          <div className="w-12 h-14 bg-[#FAF7F4] rounded border border-[#E7E2DC] overflow-hidden">
                            <img
                              src={imageUrl}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-14 bg-[#FAF7F4] rounded border border-[#E7E2DC] flex items-center justify-center text-[#9A9590]">
                            <FiUpload className="w-4 h-4" />
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-3.5">
                        <p className="font-bold text-[#1C1917] text-sm">{product.name}</p>
                        {product.discount_percent > 0 && (
                          <span className="text-[10px] font-bold text-[#B86B57] bg-[#F9ECE8] px-1.5 py-0.5 rounded mt-1 inline-block">
                            {product.discount_percent}% Off
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="text-xs font-medium text-[#5A5550]">{category?.name || 'Uncategorized'}</span>
                      </td>
                      <td className="px-6 py-3.5">
                        <p className="text-sm font-bold text-[#1C1917]">₹{product.price}</p>
                      </td>
                      <td className="px-6 py-3.5">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                            product.active
                              ? 'text-emerald-800 bg-emerald-50'
                              : 'text-[#78716C] bg-[#EFEBE6]'
                          }`}
                        >
                          {product.active ? 'Active' : 'Archived'}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(product)}
                            className="p-2 text-[#5A5550] hover:text-[#1C1917] hover:bg-[#FAF7F4] rounded-lg transition-colors"
                            title="Edit"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="p-2 text-[#8A8580] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto animate-fade-in">
          <div className="bg-white border border-[#E7E2DC] rounded-xl max-w-2xl w-full my-8 shadow-2xl animate-scale-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#E7E2DC]">
              <h2 className="text-lg font-bold text-[#1C1917]">
                {editingProduct ? 'Edit Frame Product' : 'Add New Frame'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-[#78716C] hover:text-[#1C1917]"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="p-6 space-y-4 max-h-[calc(85vh-160px)] overflow-y-auto">
              {/* Image Upload Section */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1C1917]">
                  Product Image (URL or File)
                </label>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full px-4 py-2.5 border border-[#DCD6CE] rounded-lg text-sm text-[#1C1917] focus:outline-none focus:border-[#1C1917] bg-[#FCFAF8]"
                  />

                  <div className="flex gap-2 items-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="text-xs flex-1 text-[#5A5550]"
                      disabled={uploading}
                    />
                    <button
                      onClick={handleImageUpload}
                      disabled={!imageFile || uploading}
                      className="bg-white border border-[#DCD6CE] text-[#1C1917] font-bold px-3 py-2 rounded-lg text-xs uppercase tracking-wider hover:bg-[#FAF7F4]"
                    >
                      {uploading ? 'Uploading...' : 'Upload Image'}
                    </button>
                  </div>
                </div>

                {formData.image_url && (
                  <div className="w-24 h-28 bg-[#FAF7F4] border border-[#E7E2DC] rounded-lg overflow-hidden mt-2">
                    <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Product Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1C1917] mb-1.5">
                  Product Title *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-[#DCD6CE] rounded-lg text-sm font-medium text-[#1C1917] focus:outline-none focus:border-[#1C1917] bg-[#FCFAF8]"
                  placeholder="e.g., Signature Matte Black Frame"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1C1917] mb-1.5">
                  Category *
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full px-4 py-2.5 border border-[#DCD6CE] rounded-lg text-sm font-medium text-[#1C1917] focus:outline-none focus:border-[#1C1917] bg-[#FCFAF8]"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price & Discount */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1C1917] mb-1.5">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-2.5 border border-[#DCD6CE] rounded-lg text-sm font-medium text-[#1C1917] focus:outline-none focus:border-[#1C1917] bg-[#FCFAF8]"
                    placeholder="799"
                    step="1"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1C1917] mb-1.5">
                    Discount (%)
                  </label>
                  <input
                    type="number"
                    value={formData.discount_percent}
                    onChange={(e) => setFormData({ ...formData, discount_percent: e.target.value })}
                    className="w-full px-4 py-2.5 border border-[#DCD6CE] rounded-lg text-sm font-medium text-[#1C1917] focus:outline-none focus:border-[#1C1917] bg-[#FCFAF8]"
                    min="0"
                    max="100"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1C1917] mb-1.5">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 border border-[#DCD6CE] rounded-lg text-sm font-medium text-[#1C1917] focus:outline-none focus:border-[#1C1917] bg-[#FCFAF8] resize-none"
                  rows="3"
                  placeholder="Frame material, dimensions, glass finish..."
                />
              </div>

              {/* Active Status */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="w-4 h-4 accent-[#1C1917]"
                  id="active-checkbox"
                />
                <label htmlFor="active-checkbox" className="text-xs font-bold text-[#1C1917] cursor-pointer">
                  Active (Visible on public storefront)
                </label>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 p-6 border-t border-[#E7E2DC] bg-[#FAF7F4] rounded-b-xl">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 bg-white border border-[#DCD6CE] text-[#1C1917] font-bold py-2.5 rounded-lg text-xs uppercase tracking-wider hover:bg-[#F3EFEA]"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProduct}
                className="flex-1 bg-[#1C1917] text-white font-bold py-2.5 rounded-lg text-xs uppercase tracking-wider hover:bg-[#332E2A]"
              >
                {editingProduct ? 'Update Frame' : 'Publish Frame'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
