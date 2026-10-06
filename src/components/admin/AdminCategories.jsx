import React, { useState } from 'react';
import { useCategories } from '../../context/CategoryContext';
import { useProducts } from '../../context/ProductContext';
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';

const AdminCategories = () => {
  const { categories, loading, createCategory, updateCategory, deleteCategory } = useCategories();
  const { products, deleteProduct } = useProducts();
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openAddModal = () => {
    setEditingCategory(null);
    setFormData({ name: '' });
    setError('');
    setShowModal(true);
  };

  const openEditModal = (category) => {
    setEditingCategory(category);
    setFormData({ name: category.name });
    setError('');
    setShowModal(true);
  };

  const handleSaveCategory = async () => {
    setError('');

    if (!formData.name.trim()) {
      setError('Category name is required');
      return;
    }

    const isDuplicate = categories.some(
      (cat) =>
        cat.name.toLowerCase() === formData.name.toLowerCase() &&
        cat.id !== editingCategory?.id
    );

    if (isDuplicate) {
      setError('A category with this name already exists');
      return;
    }

    try {
      setIsSubmitting(true);

      if (editingCategory) {
        await updateCategory(editingCategory.id, { name: formData.name });
      } else {
        await createCategory({ name: formData.name });
      }

      setShowModal(false);
    } catch (err) {
      setError(err.message || 'Failed to save category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    const productsInCategory = products.filter((p) => p.category_id === categoryId);

    if (productsInCategory.length > 0) {
      const confirmDeleteAll = window.confirm(
        `This category contains ${productsInCategory.length} product(s). Deleting this category will also remove these products. Do you want to proceed?`
      );
      if (!confirmDeleteAll) return;

      try {
        for (const prod of productsInCategory) {
          await deleteProduct(prod.id);
        }
      } catch (err) {
        alert(`Failed to delete products in category: ${err.message}`);
        return;
      }
    } else {
      if (!window.confirm('Are you sure you want to delete this category?')) {
        return;
      }
    }

    try {
      await deleteCategory(categoryId);
      alert('Category deleted successfully!');
    } catch (err) {
      alert(`Failed to delete category: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#1C1917]">Frame Categories</h2>
          <p className="text-xs text-[#5A5550] mt-1 font-medium">
            Manage product collections and groupings
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-[#1C1917] hover:bg-[#332E2A] text-white font-bold flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs uppercase tracking-wider transition-colors shadow-xs"
        >
          <FiPlus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full flex items-center justify-center py-12">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[#1C1917]"></div>
            <p className="ml-3 text-xs font-semibold text-[#5A5550]">Loading categories...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="col-span-full bg-white border border-[#E7E2DC] rounded-xl p-12 text-center">
            <p className="text-sm font-semibold text-[#5A5550] mb-3">No categories created yet</p>
            <button
              onClick={openAddModal}
              className="text-[#B86B57] text-xs uppercase tracking-wider hover:underline font-bold"
            >
              Create the first category →
            </button>
          </div>
        ) : (
          categories.map((category) => {
            const categoryProductCount = products.filter((p) => p.category_id === category.id).length;
            return (
              <div
                key={category.id}
                className="bg-white border border-[#E7E2DC] rounded-xl p-5 flex flex-col justify-between hover:border-[#B5B0AB] transition-all shadow-xs"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-[#1C1917]">
                      {category.name}
                    </h3>
                    <p className="text-xs font-medium text-[#78716C] mt-1">
                      {categoryProductCount} frame{categoryProductCount !== 1 ? 's' : ''} assigned
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEditModal(category)}
                      className="p-2 text-[#5A5550] hover:text-[#1C1917] hover:bg-[#FAF7F4] rounded-lg transition-colors"
                      title="Edit category"
                    >
                      <FiEdit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="p-2 text-[#8A8580] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      disabled={categoryProductCount > 0}
                      title={categoryProductCount > 0 ? 'Cannot delete category with active products' : 'Delete category'}
                    >
                      <FiTrash2 className={`w-4 h-4 ${categoryProductCount > 0 ? 'opacity-30' : ''}`} />
                    </button>
                  </div>
                </div>

                {categoryProductCount > 0 && (
                  <div className="text-[11px] font-medium text-[#5A5550] bg-[#FAF7F4] p-2.5 rounded-lg border border-[#E7E2DC]">
                    Protected: Contains active store frames
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Category Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-[#E7E2DC] rounded-xl max-w-md w-full shadow-xl animate-scale-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#E7E2DC]">
              <h3 className="text-lg font-bold text-[#1C1917]">
                {editingCategory ? 'Edit Category' : 'New Frame Category'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-[#78716C] hover:text-[#1C1917]"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-xs font-semibold">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1C1917] mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ name: e.target.value })}
                  placeholder="e.g., Minimalist Magnetic Frames"
                  className="w-full px-4 py-2.5 border border-[#DCD6CE] rounded-lg text-sm font-medium text-[#1C1917] focus:outline-none focus:border-[#1C1917] bg-[#FCFAF8]"
                  autoFocus
                />
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
                onClick={handleSaveCategory}
                disabled={isSubmitting}
                className="flex-1 bg-[#1C1917] text-white font-bold py-2.5 rounded-lg text-xs uppercase tracking-wider hover:bg-[#332E2A] disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : editingCategory ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
