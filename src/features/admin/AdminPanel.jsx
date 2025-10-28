import React, { useState } from 'react';
import { ChevronLeft, PlusCircle, Edit, Trash2, Save } from 'lucide-react';
import { doc, updateDoc, addDoc, collection, deleteDoc } from 'firebase/firestore';
import { getFirebaseInstances, appId } from '../../services/firebase';
import { categories } from '../../constants/categories';

const AdminPanel = ({ products, language, onClose, translations }) => {
  const { db } = getFirebaseInstances();
  const t = translations[language];
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    discountedPrice: '',
    weight: '',
    imageUrl: '',
    category: 'groceries'
  });
  const [editingId, setEditingId] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        discountedPrice: formData.discountedPrice ? parseFloat(formData.discountedPrice) : null,
        createdAt: new Date().toISOString()
      };

      if (editingId) {
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'products', editingId), productData);
        alert('Product updated successfully!');
      } else {
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'products'), productData);
        alert('Product added successfully!');
      }

      setFormData({ name: '', price: '', discountedPrice: '', weight: '', imageUrl: '', category: 'groceries' });
      setShowForm(false);
      setEditingId(null);
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product');
    }
  };

  const handleEdit = (product) => {
    setFormData({
      name: product.name,
      price: product.price.toString(),
      discountedPrice: product.discountedPrice?.toString() || '',
      weight: product.weight,
      imageUrl: product.imageUrl || '',
      category: product.category
    });
    setEditingId(product.id);
    setShowForm(true);
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'products', productId));
        alert('Product deleted successfully!');
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Failed to delete product');
      }
    }
  };

  return (
    <div className="admin-panel">
      <div className="view-header">
        <button onClick={onClose} className="back-button">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="view-title">{t.adminPanel}</h2>
      </div>

      <div className="admin-content">
        <button onClick={() => setShowForm(!showForm)} className="add-product-btn">
          <PlusCircle className="w-5 h-5" />
          {t.addProduct}
        </button>

        {showForm && (
          <form onSubmit={handleSubmit} className="product-form">
            <input
              type="text"
              placeholder={t.productName}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="form-input"
            />
            <input
              type="number"
              placeholder={t.productPrice}
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              required
              className="form-input"
            />
            <input
              type="number"
              placeholder="Discounted Price (Optional)"
              value={formData.discountedPrice}
              onChange={(e) => setFormData({ ...formData, discountedPrice: e.target.value })}
              className="form-input"
            />
            <input
              type="text"
              placeholder={t.productWeight}
              value={formData.weight}
              onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
              required
              className="form-input"
            />
            <input
              type="text"
              placeholder={t.productImage}
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              className="form-input"
            />
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="form-input"
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.nameEn} / {cat.nameTe}
                </option>
              ))}
            </select>
            <div className="form-actions">
              <button type="submit" className="save-btn">
                <Save className="w-4 h-4" />
                {t.save}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="cancel-btn">
                {t.cancel}
              </button>
            </div>
          </form>
        )}

        <div className="products-admin-list">
          <h3 className="section-subtitle">{t.manageProducts} ({products.length})</h3>
          {products.map(product => (
            <div key={product.id} className="admin-product-card">
              <img src={product.imageUrl || 'https://via.placeholder.com/60'} alt={product.name} className="admin-product-img" />
              <div className="admin-product-info">
                <h4>{product.name}</h4>
                <p>{product.category} • {product.weight}</p>
                <p className="admin-price">₹{product.discountedPrice || product.price}</p>
              </div>
              <div className="admin-product-actions">
                <button onClick={() => handleEdit(product)} className="edit-btn">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(product.id)} className="delete-btn">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
