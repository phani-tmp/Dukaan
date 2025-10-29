import React, { useState } from 'react';
import { collection, doc, updateDoc, addDoc, deleteDoc, setDoc, getDocs } from 'firebase/firestore';
import { getFirebaseInstances, appId } from '../../services/firebase';
import { translations } from '../../constants/translations';
import UsersManagement from './UsersManagement';
import OrderDetailsModal from '../../components/shared/OrderDetailsModal';
import VoiceInput from '../../components/shared/VoiceInput';
import BilingualVoiceInput from '../../components/shared/BilingualVoiceInput';
import {
  Search,
  MapPin,
  User,
  Package,
  ChevronLeft,
  Clock,
  Settings,
  PlusCircle,
  Edit,
  Trash2,
  Save,
  Upload,
  Star,
  Phone,
  Eye,
  XCircle,
  ShoppingBag
} from 'lucide-react';

const ShopkeeperDashboard = ({ products, allOrders, language, onExit, categoriesData, subcategoriesData }) => {
  const { db } = getFirebaseInstances();
  const t = translations[language];
  const [activeTab, setActiveTab] = useState('orders');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    discountedPrice: '',
    weight: '',
    imageUrl: '',
    category: '',
    subcategoryId: '',
    isPopular: false,
    outOfStock: false
  });
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [imagePreview, setImagePreview] = useState(null);
  
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [categoryFormData, setCategoryFormData] = useState({
    nameEn: '',
    nameTe: '',
    imageUrl: '',
    color: '#4CAF50',
    gradient: ''
  });
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [categoryImagePreview, setCategoryImagePreview] = useState(null);
  
  const [showSubcategoryForm, setShowSubcategoryForm] = useState(false);
  const [subcategoryFormData, setSubcategoryFormData] = useState({
    nameEn: '',
    nameTe: '',
    categoryId: '',
    imageUrl: ''
  });
  const [editingSubcategoryId, setEditingSubcategoryId] = useState(null);
  const [subcategoryImagePreview, setSubcategoryImagePreview] = useState(null);
  const [selectedOrderForDetails, setSelectedOrderForDetails] = useState(null);
  const [orderTab, setOrderTab] = useState('active');
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  const categories = [
    { id: 'groceries', nameEn: 'Groceries', nameTe: 'వీరగాణ', imageUrl: 'https://images.unsplash.com/photo-1588964895597-cfccd6e2dbf9?w=100&h=100&fit=crop', color: '#4CAF50', gradient: 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)' },
    { id: 'vegetables', nameEn: 'Vegetables', nameTe: 'కూరగాయలు', imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=100&h=100&fit=crop', color: '#8BC34A', gradient: 'linear-gradient(135deg, #8BC34A 0%, #9CCC65 100%)' },
    { id: 'milk', nameEn: 'Milk', nameTe: 'పాలు', imageUrl: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=100&h=100&fit=crop', color: '#5DADE2', gradient: 'linear-gradient(135deg, #5DADE2 0%, #74B9E8 100%)' },
    { id: 'snacks', nameEn: 'Snacks', nameTe: 'స్నాక్స్', imageUrl: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=100&h=100&fit=crop', color: '#FF9800', gradient: 'linear-gradient(135deg, #FF9800 0%, #FFA726 100%)' },
    { id: 'medicines', nameEn: 'Medicines', nameTe: 'మందులు', imageUrl: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=100&h=100&fit=crop', color: '#2196F3', gradient: 'linear-gradient(135deg, #2196F3 0%, #42A5F5 100%)' },
    { id: 'electronics', nameEn: 'Electronics', nameTe: 'ఎలక్ట్రానిక్స్', imageUrl: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=100&h=100&fit=crop', color: '#9C27B0', gradient: 'linear-gradient(135deg, #9C27B0 0%, #AB47BC 100%)' }
  ];

  const seedDefaultData = async () => {
    try {
      const categoriesSnapshot = await getDocs(collection(db, 'artifacts', appId, 'public', 'data', 'categories'));
      if (!categoriesSnapshot.empty) {
        alert('Categories already exist. Clear existing categories first if you want to reseed.');
        return;
      }

      const defaultCategories = [
        { id: 'groceries', nameEn: 'Groceries', nameTe: 'వీరగాణ', imageUrl: 'https://images.unsplash.com/photo-1588964895597-cfccd6e2dbf9?w=100&h=100&fit=crop', color: '#4CAF50', gradient: 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)' },
        { id: 'vegetables', nameEn: 'Vegetables', nameTe: 'కూరగాయలు', imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=100&h=100&fit=crop', color: '#8BC34A', gradient: 'linear-gradient(135deg, #8BC34A 0%, #9CCC65 100%)' },
        { id: 'milk', nameEn: 'Milk & Dairy', nameTe: 'పాలు', imageUrl: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=100&h=100&fit=crop', color: '#5DADE2', gradient: 'linear-gradient(135deg, #5DADE2 0%, #74B9E8 100%)' },
        { id: 'snacks', nameEn: 'Snacks', nameTe: 'స్నాక్స్', imageUrl: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=100&h=100&fit=crop', color: '#FF9800', gradient: 'linear-gradient(135deg, #FF9800 0%, #FFA726 100%)' },
        { id: 'medicines', nameEn: 'Medicines', nameTe: 'మందులు', imageUrl: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=100&h=100&fit=crop', color: '#2196F3', gradient: 'linear-gradient(135deg, #2196F3 0%, #42A5F5 100%)' },
        { id: 'electronics', nameEn: 'Electronics', nameTe: 'ఎలక్ట్రానిక్స్', imageUrl: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=100&h=100&fit=crop', color: '#9C27B0', gradient: 'linear-gradient(135deg, #9C27B0 0%, #AB47BC 100%)' }
      ];

      const defaultSubcategories = [
        { id: 'groceries-dals', nameEn: 'Dals & Pulses', nameTe: 'పప్పులు', categoryId: 'groceries', imageUrl: 'https://images.unsplash.com/photo-1572449102205-d51f05b2a0e0?w=100&h=100&fit=crop' },
        { id: 'groceries-rice', nameEn: 'Rice & Rice Products', nameTe: 'అన్నం', categoryId: 'groceries', imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=100&h=100&fit=crop' },
        { id: 'groceries-oils', nameEn: 'Oils & Ghee', nameTe: 'నూనెలు', categoryId: 'groceries', imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=100&h=100&fit=crop' },
        { id: 'groceries-spices', nameEn: 'Spices', nameTe: 'మసాలా', categoryId: 'groceries', imageUrl: 'https://images.unsplash.com/photo-1596040033229-a0b0b7b98adc?w=100&h=100&fit=crop' },
        { id: 'groceries-flours', nameEn: 'Flours & Atta', nameTe: 'పిండి', categoryId: 'groceries', imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=100&h=100&fit=crop' },
        { id: 'vegetables-leafy', nameEn: 'Leafy Vegetables', nameTe: 'ఆకు కూరలు', categoryId: 'vegetables', imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=100&h=100&fit=crop' },
        { id: 'vegetables-root', nameEn: 'Root Vegetables', nameTe: 'వేళ్ళు', categoryId: 'vegetables', imageUrl: 'https://images.unsplash.com/photo-1447175008436-054170c2e979?w=100&h=100&fit=crop' },
        { id: 'vegetables-seasonal', nameEn: 'Seasonal Vegetables', nameTe: 'కాల కూరలు', categoryId: 'vegetables', imageUrl: 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=100&h=100&fit=crop' },
        { id: 'milk-fresh', nameEn: 'Fresh Milk', nameTe: 'పాలు', categoryId: 'milk', imageUrl: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=100&h=100&fit=crop' },
        { id: 'milk-curd', nameEn: 'Curd & Yogurt', nameTe: 'పెరుగు', categoryId: 'milk', imageUrl: 'https://images.unsplash.com/photo-1571212515935-c0629c19f520?w=100&h=100&fit=crop' },
        { id: 'milk-butter', nameEn: 'Butter & Ghee', nameTe: 'వెన్న', categoryId: 'milk', imageUrl: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=100&h=100&fit=crop' },
        { id: 'milk-cheese', nameEn: 'Cheese & Paneer', nameTe: 'పన్నీర్', categoryId: 'milk', imageUrl: 'https://images.unsplash.com/photo-1452195100486-9cc805987862?w=100&h=100&fit=crop' },
        { id: 'snacks-namkeen', nameEn: 'Namkeen', nameTe: 'నమ్కీన్', categoryId: 'snacks', imageUrl: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=100&h=100&fit=crop' },
        { id: 'snacks-biscuits', nameEn: 'Biscuits & Cookies', nameTe: 'బిస్కెట్లు', categoryId: 'snacks', imageUrl: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=100&h=100&fit=crop' },
        { id: 'snacks-chips', nameEn: 'Chips', nameTe: 'చిప్స్', categoryId: 'snacks', imageUrl: 'https://images.unsplash.com/photo-1600952841320-db92ec8b5d2a?w=100&h=100&fit=crop' },
        { id: 'medicines-firstaid', nameEn: 'First Aid', nameTe: 'ప్రాథమిక చికిత్స', categoryId: 'medicines', imageUrl: 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=100&h=100&fit=crop' },
        { id: 'medicines-supplements', nameEn: 'Health Supplements', nameTe: 'ఆరోగ్య', categoryId: 'medicines', imageUrl: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=100&h=100&fit=crop' },
        { id: 'electronics-mobiles', nameEn: 'Mobiles & Accessories', nameTe: 'మొబైల్స్', categoryId: 'electronics', imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=100&h=100&fit=crop' },
        { id: 'electronics-headphones', nameEn: 'Headphones & Earphones', nameTe: 'హెడ్‌ఫోన్లు', categoryId: 'electronics', imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop' },
        { id: 'electronics-chargers', nameEn: 'Chargers & Cables', nameTe: 'చార్జర్లు', categoryId: 'electronics', imageUrl: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=100&h=100&fit=crop' }
      ];

      for (const cat of defaultCategories) {
        const { id, ...catData } = cat;
        await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'categories', id), {
          ...catData,
          createdAt: new Date().toISOString()
        });
      }

      for (const subcat of defaultSubcategories) {
        const { id, ...subcatData } = subcat;
        await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'subcategories', id), {
          ...subcatData,
          createdAt: new Date().toISOString()
        });
      }

      alert('Default categories and subcategories added successfully! Refresh the page to see them.');
    } catch (error) {
      console.error('Error seeding data:', error);
      alert(`Failed to seed data: ${error.message}`);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 500000) {
        alert('Image size should be less than 500KB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, imageUrl: reader.result });
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCategoryImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 500000) {
        alert('Image size should be less than 500KB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setCategoryFormData({ ...categoryFormData, imageUrl: reader.result });
        setCategoryImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubcategoryImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 500000) {
        alert('Image size should be less than 500KB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSubcategoryFormData({ ...subcategoryFormData, imageUrl: reader.result });
        setSubcategoryImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    console.log('[Shopkeeper] Updating order:', orderId, 'to status:', newStatus);
    console.log('[Shopkeeper] DB available:', !!db, 'AppId:', appId);
    try {
      if (!db) {
        throw new Error('Firebase database not initialized');
      }
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'orders', orderId), {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      alert(`Order status updated to ${newStatus}!`);
    } catch (error) {
      console.error('Error updating order:', error);
      alert(`Failed to update order status: ${error.message}`);
    }
  };

  const handleCancelOrder = async (orderId) => {
    const reason = prompt('Please enter reason for cancellation:');
    if (!reason || reason.trim() === '') return;
    
    try {
      if (!db) throw new Error('Firebase database not initialized');
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'orders', orderId), {
        status: 'cancelled',
        cancellationReason: reason.trim(),
        updatedAt: new Date().toISOString()
      });
      alert('Order cancelled successfully!');
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert(`Failed to cancel order: ${error.message}`);
    }
  };

  const handleViewOrderDetails = (order) => {
    setSelectedOrderForDetails(order);
    setShowOrderDetails(true);
  };

  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    
    if (!formData.category || !formData.subcategoryId) {
      alert('Please select both Category and Subcategory before saving the product.');
      return;
    }
    
    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        discountedPrice: formData.discountedPrice ? parseFloat(formData.discountedPrice) : null,
        isPopular: formData.isPopular || false,
        createdAt: new Date().toISOString()
      };

      if (editingId) {
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'products', editingId), productData);
        alert('Product updated successfully!');
      } else {
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'products'), productData);
        alert('Product added successfully!');
      }

      setFormData({ name: '', price: '', discountedPrice: '', weight: '', imageUrl: '', category: '', subcategoryId: '', isPopular: false, outOfStock: false });
      setImagePreview(null);
      setShowForm(false);
      setEditingId(null);
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product');
    }
  };

  const handleEditProduct = (product) => {
    setFormData({
      name: product.name,
      price: product.price.toString(),
      discountedPrice: product.discountedPrice?.toString() || '',
      weight: product.weight,
      imageUrl: product.imageUrl || '',
      category: product.category || '',
      subcategoryId: product.subcategoryId || '',
      isPopular: product.isPopular || false,
      outOfStock: product.outOfStock || false
    });
    setImagePreview(product.imageUrl || null);
    setEditingId(product.id);
    setShowForm(true);
    setActiveTab('products');
  };

  const handleDeleteProduct = async (productId) => {
    console.log('[Shopkeeper] Delete product clicked:', productId);
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        if (!db) {
          throw new Error('Firebase database not initialized');
        }
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'products', productId));
        alert('Product deleted successfully!');
      } catch (error) {
        console.error('Error deleting product:', error);
        alert(`Failed to delete product: ${error.message}`);
      }
    }
  };

  const togglePopularStatus = async (productId, currentStatus) => {
    console.log('[Shopkeeper] Toggle popular:', productId, 'current:', currentStatus);
    try {
      if (!db) {
        throw new Error('Firebase database not initialized');
      }
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'products', productId), {
        isPopular: !currentStatus
      });
      console.log('[Shopkeeper] Popular status updated successfully');
    } catch (error) {
      console.error('Error updating popular status:', error);
      alert(`Failed to update popular status: ${error.message}`);
    }
  };

  const handleSubmitCategory = async (e) => {
    e.preventDefault();
    try {
      const categoryData = {
        ...categoryFormData,
        gradient: categoryFormData.gradient || `linear-gradient(135deg, ${categoryFormData.color} 0%, ${categoryFormData.color}dd 100%)`,
        createdAt: new Date().toISOString()
      };

      if (editingCategoryId) {
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'categories', editingCategoryId), categoryData);
        alert('Category updated successfully!');
      } else {
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'categories'), categoryData);
        alert('Category added successfully!');
      }

      setCategoryFormData({ nameEn: '', nameTe: '', imageUrl: '', color: '#4CAF50', gradient: '' });
      setShowCategoryForm(false);
      setEditingCategoryId(null);
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Failed to save category');
    }
  };

  const handleEditCategory = (category) => {
    setCategoryFormData({
      nameEn: category.nameEn,
      nameTe: category.nameTe || '',
      icon: category.icon || '',
      color: category.color || '#4CAF50',
      gradient: category.gradient || ''
    });
    setEditingCategoryId(category.id);
    setShowCategoryForm(true);
  };

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm('Are you sure? This will affect related subcategories and products.')) {
      try {
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'categories', categoryId));
        alert('Category deleted successfully!');
      } catch (error) {
        console.error('Error deleting category:', error);
        alert(`Failed to delete category: ${error.message}`);
      }
    }
  };

  const handleSubmitSubcategory = async (e) => {
    e.preventDefault();
    try {
      const subcategoryData = {
        ...subcategoryFormData,
        createdAt: new Date().toISOString()
      };

      if (editingSubcategoryId) {
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'subcategories', editingSubcategoryId), subcategoryData);
        alert('Subcategory updated successfully!');
      } else {
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'subcategories'), subcategoryData);
        alert('Subcategory added successfully!');
      }

      setSubcategoryFormData({ nameEn: '', nameTe: '', categoryId: '', imageUrl: '' });
      setShowSubcategoryForm(false);
      setEditingSubcategoryId(null);
    } catch (error) {
      console.error('Error saving subcategory:', error);
      alert('Failed to save subcategory');
    }
  };

  const handleEditSubcategory = (subcategory) => {
    setSubcategoryFormData({
      nameEn: subcategory.nameEn,
      nameTe: subcategory.nameTe || '',
      categoryId: subcategory.categoryId,
      icon: subcategory.icon || ''
    });
    setEditingSubcategoryId(subcategory.id);
    setShowSubcategoryForm(true);
  };

  const handleDeleteSubcategory = async (subcategoryId) => {
    if (window.confirm('Are you sure? This will affect related products.')) {
      try {
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'subcategories', subcategoryId));
        alert('Subcategory deleted successfully!');
      } catch (error) {
        console.error('Error deleting subcategory:', error);
        alert(`Failed to delete subcategory: ${error.message}`);
      }
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return '#9E9E9E';
      case 'accepted': return '#2196F3';
      case 'out_for_delivery': return '#FF9800';
      case 'ready_for_pickup': return '#9C27B0';
      case 'delivered': return '#4CAF50';
      case 'completed': return '#4CAF50';
      case 'cancelled': return '#f44336';
      default: return '#9E9E9E';
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 'pending': return 'PENDING';
      case 'accepted': return 'ACCEPTED';
      case 'out_for_delivery': return 'OUT FOR DELIVERY';
      case 'ready_for_pickup': return 'READY FOR PICKUP';
      case 'delivered': return 'DELIVERED';
      case 'completed': return 'COMPLETED';
      case 'cancelled': return 'CANCELLED';
      default: return status.toUpperCase();
    }
  };

  const activeStatuses = ['pending', 'accepted', 'out_for_delivery', 'ready_for_pickup'];
  const completedStatuses = ['delivered', 'cancelled', 'completed'];
  
  const filteredOrders = allOrders.filter(order => {
    if (orderTab === 'active') {
      return activeStatuses.includes(order.status);
    } else {
      return completedStatuses.includes(order.status);
    }
  });
  
  const sortedOrders = [...filteredOrders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const popularProducts = products.filter(p => p.isPopular);

  return (
    <div className="shopkeeper-dashboard">
      <div className="view-header">
        <button onClick={onExit} className="back-button">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="view-title">{t.shopkeeperDashboard}</h2>
      </div>

      <div className="shopkeeper-search-bar">
        <Search className="w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search products, orders..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="shopkeeper-tabs">
        <button 
          className={`tab-button ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          <Package className="w-5 h-5" />
          Orders
        </button>
        <button 
          className={`tab-button ${activeTab === 'categories' ? 'active' : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          <Settings className="w-5 h-5" />
          Categories
        </button>
        <button 
          className={`tab-button ${activeTab === 'subcategories' ? 'active' : ''}`}
          onClick={() => setActiveTab('subcategories')}
        >
          <ShoppingBag className="w-5 h-5" />
          Subcategories
        </button>
        <button 
          className={`tab-button ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          <Package className="w-5 h-5" />
          Products
        </button>
        <button 
          className={`tab-button ${activeTab === 'popular' ? 'active' : ''}`}
          onClick={() => setActiveTab('popular')}
        >
          <Star className="w-5 h-5" />
          Popular
        </button>
        <button 
          className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <User className="w-5 h-5" />
          Users
        </button>
      </div>

      <div className="shopkeeper-content">
        {activeTab === 'orders' && (
          <div className="orders-section">
            <div className="section-header">
              <h3 className="section-subtitle">Orders Management</h3>
              <span className="count-badge">{allOrders.length}</span>
            </div>
            
            <div className="order-tabs">
              <button 
                className={`order-tab-btn ${orderTab === 'active' ? 'active' : ''}`}
                onClick={() => setOrderTab('active')}
              >
                Active Orders ({activeStatuses.reduce((count, status) => 
                  count + allOrders.filter(o => o.status === status).length, 0)})
              </button>
              <button 
                className={`order-tab-btn ${orderTab === 'completed' ? 'active' : ''}`}
                onClick={() => setOrderTab('completed')}
              >
                Completed Orders ({completedStatuses.reduce((count, status) => 
                  count + allOrders.filter(o => o.status === status).length, 0)})
              </button>
            </div>
            {sortedOrders.length === 0 ? (
              <div className="empty-state">
                <Package className="w-16 h-16 text-gray-400" />
                <p>{t.noIncomingOrders}</p>
              </div>
            ) : (
              <div className="shopkeeper-orders-list">
                {sortedOrders.map(order => (
                  <div key={order.id} className="shopkeeper-order-card-enhanced">
                    <div className="order-card-top">
                      <div className="order-info-section">
                        <div className="order-id-row">
                          <User className="w-4 h-4 text-gray-500" />
                          <span className="order-customer">Order #{order.id.substring(0, 8)}</span>
                        </div>
                        <div className="order-time-row">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="order-timestamp">{new Date(order.createdAt).toLocaleString()}</span>
                        </div>
                        {order.phoneNumber && (
                          <div className="order-phone-row">
                            <Phone className="w-4 h-4 text-green-600" />
                            <a href={`tel:${order.phoneNumber}`} className="order-phone-link">
                              {order.phoneNumber}
                            </a>
                          </div>
                        )}
                      </div>
                      <div className="order-status-badge-new" style={{ backgroundColor: getStatusColor(order.status) }}>
                        {getStatusLabel(order.status)}
                      </div>
                    </div>
                    
                    {order.deliveryAddress && (
                      <div className="order-address-section">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="order-address-text">{order.deliveryAddress}</span>
                      </div>
                    )}
                    
                    <div className="order-items-list-enhanced">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="order-item-row-enhanced">
                          <img 
                            src={item.imageUrl || 'https://via.placeholder.com/50'} 
                            alt={item.name} 
                            className="order-item-image"
                          />
                          <div className="order-item-details">
                            <span className="item-name">{item.name}</span>
                            <span className="item-weight">{item.weight}</span>
                          </div>
                          <span className="item-quantity-badge">× {item.quantity}</span>
                          <span className="item-price-bold">₹{(item.price * item.quantity).toFixed(0)}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="order-card-bottom">
                      <div className="order-total-section">
                        <span className="total-label">{t.total}</span>
                        <span className="total-amount-large">₹{order.total.toFixed(0)}</span>
                      </div>
                      
                      <div className="order-management-section">
                        <div className="order-status-controls">
                          <label className="status-dropdown-label">Status:</label>
                          <select 
                            value={order.status}
                            onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                            className="status-dropdown"
                            disabled={order.status === 'cancelled' || order.status === 'delivered' || order.status === 'completed'}
                          >
                            <option value="pending">Pending</option>
                            <option value="accepted">Accepted</option>
                            {order.deliveryMethod === 'pickup' ? (
                              <>
                                <option value="ready_for_pickup">Ready for Pickup</option>
                                <option value="completed">Completed</option>
                              </>
                            ) : (
                              <>
                                <option value="out_for_delivery">Out for Delivery</option>
                                <option value="delivered">Delivered</option>
                              </>
                            )}
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                        
                        <div className="order-action-buttons">
                          <button 
                            onClick={() => handleViewOrderDetails(order)}
                            className="view-details-btn"
                          >
                            <Eye className="w-4 h-4" />
                            View Details
                          </button>
                          
                          {order.status !== 'cancelled' && order.status !== 'delivered' && order.status !== 'completed' && (
                            <button 
                              onClick={() => handleCancelOrder(order.id)}
                              className="cancel-order-btn"
                            >
                              <XCircle className="w-4 h-4" />
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'products' && (
          <div className="products-section">
            <button onClick={() => setShowForm(!showForm)} className="add-product-btn">
              <PlusCircle className="w-5 h-5" />
              {t.addProduct}
            </button>

            {showForm && (
              <form onSubmit={handleSubmitProduct} className="product-form">
                <div className="input-with-voice">
                  <input
                    type="text"
                    placeholder={t.productName}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="form-input"
                  />
                  <VoiceInput
                    onTranscript={(text) => setFormData({ ...formData, name: text })}
                    language={language}
                  />
                </div>
                <div className="input-with-voice">
                  <input
                    type="number"
                    placeholder={t.productPrice}
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    className="form-input"
                  />
                  <VoiceInput
                    onTranscript={(text) => setFormData({ ...formData, price: text.replace(/[^0-9]/g, '') })}
                    language={language}
                  />
                </div>
                <div className="input-with-voice">
                  <input
                    type="number"
                    placeholder="Discounted Price (Optional)"
                    value={formData.discountedPrice}
                    onChange={(e) => setFormData({ ...formData, discountedPrice: e.target.value })}
                    className="form-input"
                  />
                  <VoiceInput
                    onTranscript={(text) => setFormData({ ...formData, discountedPrice: text.replace(/[^0-9]/g, '') })}
                    language={language}
                  />
                </div>
                <div className="input-with-voice">
                  <input
                    type="text"
                    placeholder={t.productWeight}
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    required
                    className="form-input"
                  />
                  <VoiceInput
                    onTranscript={(text) => setFormData({ ...formData, weight: text })}
                    language={language}
                  />
                </div>
                
                <div className="image-upload-section">
                  <label className="upload-label">
                    <Upload className="w-5 h-5" />
                    Upload Image (Max 500KB)
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="file-input-hidden"
                    />
                  </label>
                  <input
                    type="text"
                    placeholder="Or paste image URL"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="form-input"
                  />
                  {imagePreview && (
                    <div className="image-preview">
                      <img src={imagePreview} alt="Preview" />
                    </div>
                  )}
                </div>

                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value, subcategoryId: '' })}
                  className="form-input"
                  required
                >
                  <option value="">Select Category</option>
                  {categoriesData.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nameEn} / {cat.nameTe || ''}
                    </option>
                  ))}
                </select>
                
                {formData.category && (
                  <select
                    value={formData.subcategoryId}
                    onChange={(e) => setFormData({ ...formData, subcategoryId: e.target.value })}
                    className="form-input"
                    required
                  >
                    <option value="">Select Subcategory</option>
                    {subcategoriesData
                      .filter(sc => sc.categoryId === formData.category)
                      .map(sc => (
                        <option key={sc.id} value={sc.id}>
                          {sc.nameEn} / {sc.nameTe || ''}
                        </option>
                      ))}
                  </select>
                )}

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.isPopular}
                    onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                  />
                  Mark as Popular Product
                </label>

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.outOfStock}
                    onChange={(e) => setFormData({ ...formData, outOfStock: e.target.checked })}
                  />
                  Out of Stock (unavailable for pickup/delivery)
                </label>

                <div className="form-actions">
                  <button type="submit" className="save-btn">
                    <Save className="w-4 h-4" />
                    {t.save}
                  </button>
                  <button type="button" onClick={() => { setShowForm(false); setEditingId(null); setImagePreview(null); }} className="cancel-btn">
                    {t.cancel}
                  </button>
                </div>
              </form>
            )}

            <div className="category-filters">
              <button 
                className={`filter-btn ${selectedCategory === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('all')}
              >
                All ({products.length})
              </button>
              {categories.map(cat => {
                const count = products.filter(p => p.category === cat.id).length;
                return (
                  <button 
                    key={cat.id}
                    className={`filter-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(cat.id)}
                  >
                    {cat.nameEn} ({count})
                  </button>
                );
              })}
            </div>

            <div className="products-admin-list">
              <h3 className="section-subtitle">{t.manageProducts} ({filteredProducts.length})</h3>
              {filteredProducts.map(product => (
                <div key={product.id} className="admin-product-card">
                  <img src={product.imageUrl || 'https://via.placeholder.com/60'} alt={product.name} className="admin-product-img" />
                  <div className="admin-product-info">
                    <h4>{product.name}</h4>
                    <p>{product.category} • {product.weight}</p>
                    <p className="admin-price">₹{product.discountedPrice || product.price}</p>
                    {product.isPopular && <span className="popular-tag">⭐ Popular</span>}
                  </div>
                  <div className="admin-product-actions">
                    <button onClick={() => handleEditProduct(product)} className="edit-btn">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDeleteProduct(product.id)} className="delete-btn">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="categories-section">
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
              <button onClick={() => setShowCategoryForm(!showCategoryForm)} className="add-product-btn">
                <PlusCircle className="w-5 h-5" />
                Add Category
              </button>
              {categoriesData.length === 0 && (
                <button onClick={seedDefaultData} className="add-product-btn" style={{ background: '#FF9800' }}>
                  <Settings className="w-5 h-5" />
                  Seed Default Data (Zepto-style)
                </button>
              )}
            </div>

            {showCategoryForm && (
              <form onSubmit={handleSubmitCategory} className="product-form">
                <div className="bilingual-input-group">
                  <div className="input-with-voice">
                    <input
                      type="text"
                      placeholder="Category Name (English)"
                      value={categoryFormData.nameEn}
                      onChange={(e) => setCategoryFormData({ ...categoryFormData, nameEn: e.target.value })}
                      required
                      className="form-input"
                    />
                  </div>
                  <div className="input-with-voice">
                    <input
                      type="text"
                      placeholder="Category Name (Telugu)"
                      value={categoryFormData.nameTe}
                      onChange={(e) => setCategoryFormData({ ...categoryFormData, nameTe: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <BilingualVoiceInput
                    onTranscript={({ english, telugu }) => {
                      setCategoryFormData({
                        ...categoryFormData,
                        nameEn: english,
                        nameTe: telugu
                      });
                    }}
                  />
                </div>
                
                <div className="image-upload-section">
                  <label className="upload-label">
                    <Upload className="w-5 h-5" />
                    Upload Image (Max 500KB)
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCategoryImageUpload}
                      className="file-input-hidden"
                    />
                  </label>
                  <input
                    type="text"
                    placeholder="Or paste image URL"
                    value={categoryFormData.imageUrl}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, imageUrl: e.target.value })}
                    className="form-input"
                  />
                  {(categoryImagePreview || categoryFormData.imageUrl) && (
                    <div className="image-preview-container">
                      <img 
                        src={categoryImagePreview || categoryFormData.imageUrl} 
                        alt="Category preview" 
                        className="image-preview"
                      />
                    </div>
                  )}
                </div>

                <input
                  type="color"
                  value={categoryFormData.color}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, color: e.target.value })}
                  className="form-input"
                />
                <div className="form-actions">
                  <button type="submit" className="save-btn">
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                  <button type="button" onClick={() => { setShowCategoryForm(false); setEditingCategoryId(null); setCategoryImagePreview(null); }} className="cancel-btn">
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div className="products-admin-list">
              <h3 className="section-subtitle">Manage Categories ({categoriesData.length})</h3>
              {categoriesData.map(category => (
                <div key={category.id} className="admin-product-card">
                  <div className="category-icon-preview" style={{ background: category.gradient }}>
                    <img 
                      src={category.imageUrl || 'https://via.placeholder.com/40/CCCCCC/666666?text=No+Image'} 
                      alt={category.nameEn} 
                      style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '8px' }} 
                    />
                  </div>
                  <div className="admin-product-info">
                    <h4>{category.nameEn}</h4>
                    <p>{category.nameTe}</p>
                    <p className="admin-price">{category.color}</p>
                  </div>
                  <div className="admin-product-actions">
                    <button onClick={() => handleEditCategory(category)} className="edit-btn">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDeleteCategory(category.id)} className="delete-btn">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'subcategories' && (
          <div className="subcategories-section">
            <button onClick={() => setShowSubcategoryForm(!showSubcategoryForm)} className="add-product-btn">
              <PlusCircle className="w-5 h-5" />
              Add Subcategory
            </button>

            {showSubcategoryForm && (
              <form onSubmit={handleSubmitSubcategory} className="product-form">
                <select
                  value={subcategoryFormData.categoryId}
                  onChange={(e) => setSubcategoryFormData({ ...subcategoryFormData, categoryId: e.target.value })}
                  required
                  className="form-input"
                >
                  <option value="">Select Parent Category</option>
                  {categoriesData.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.nameEn}</option>
                  ))}
                </select>
                <div className="bilingual-input-group">
                  <div className="input-with-voice">
                    <input
                      type="text"
                      placeholder="Subcategory Name (English)"
                      value={subcategoryFormData.nameEn}
                      onChange={(e) => setSubcategoryFormData({ ...subcategoryFormData, nameEn: e.target.value })}
                      required
                      className="form-input"
                    />
                  </div>
                  <div className="input-with-voice">
                    <input
                      type="text"
                      placeholder="Subcategory Name (Telugu)"
                      value={subcategoryFormData.nameTe}
                      onChange={(e) => setSubcategoryFormData({ ...subcategoryFormData, nameTe: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <BilingualVoiceInput
                    onTranscript={({ english, telugu }) => {
                      setSubcategoryFormData({
                        ...subcategoryFormData,
                        nameEn: english,
                        nameTe: telugu
                      });
                    }}
                  />
                </div>
                
                <div className="image-upload-section">
                  <label className="upload-label">
                    <Upload className="w-5 h-5" />
                    Upload Image (Max 500KB)
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleSubcategoryImageUpload}
                      className="file-input-hidden"
                    />
                  </label>
                  <input
                    type="text"
                    placeholder="Or paste image URL"
                    value={subcategoryFormData.imageUrl}
                    onChange={(e) => setSubcategoryFormData({ ...subcategoryFormData, imageUrl: e.target.value })}
                    className="form-input"
                  />
                  {(subcategoryImagePreview || subcategoryFormData.imageUrl) && (
                    <div className="image-preview-container">
                      <img 
                        src={subcategoryImagePreview || subcategoryFormData.imageUrl} 
                        alt="Subcategory preview" 
                        className="image-preview"
                      />
                    </div>
                  )}
                </div>

                <div className="form-actions">
                  <button type="submit" className="save-btn">
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                  <button type="button" onClick={() => { setShowSubcategoryForm(false); setEditingSubcategoryId(null); setSubcategoryImagePreview(null); }} className="cancel-btn">
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div className="products-admin-list">
              <h3 className="section-subtitle">Manage Subcategories ({subcategoriesData.length})</h3>
              {subcategoriesData.map(subcategory => {
                const parentCategory = categoriesData.find(c => c.id === subcategory.categoryId);
                return (
                  <div key={subcategory.id} className="admin-product-card">
                    <div className="subcategory-icon-preview">
                      <img 
                        src={subcategory.imageUrl || 'https://via.placeholder.com/40/CCCCCC/666666?text=No+Image'} 
                        alt={subcategory.nameEn} 
                        style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '8px' }} 
                      />
                    </div>
                    <div className="admin-product-info">
                      <h4>{subcategory.nameEn}</h4>
                      <p>{subcategory.nameTe}</p>
                      <p className="admin-price">Parent: {parentCategory?.nameEn || 'N/A'}</p>
                    </div>
                    <div className="admin-product-actions">
                      <button onClick={() => handleEditSubcategory(subcategory)} className="edit-btn">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteSubcategory(subcategory.id)} className="delete-btn">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'popular' && (
          <div className="popular-section">
            <div className="section-header">
              <h3 className="section-subtitle">Popular Products Management</h3>
              <span className="count-badge">{popularProducts.length}</span>
            </div>
            <p className="section-description">
              Manage which products appear in the "Popular Products" section on the customer app. 
              Toggle the star to add/remove from popular items.
            </p>

            <div className="products-admin-list">
              {products.map(product => (
                <div key={product.id} className="admin-product-card">
                  <img src={product.imageUrl || 'https://via.placeholder.com/60'} alt={product.name} className="admin-product-img" />
                  <div className="admin-product-info">
                    <h4>{product.name}</h4>
                    <p>{product.category} • {product.weight}</p>
                    <p className="admin-price">₹{product.discountedPrice || product.price}</p>
                  </div>
                  <div className="admin-product-actions">
                    <button 
                      onClick={() => togglePopularStatus(product.id, product.isPopular)}
                      className={`popular-toggle-btn ${product.isPopular ? 'is-popular' : ''}`}
                      title={product.isPopular ? 'Remove from popular' : 'Add to popular'}
                    >
                      {product.isPopular ? <Star fill="gold" stroke="gold" className="w-5 h-5" /> : <Star className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <UsersManagement />
        )}
      </div>

      {showOrderDetails && selectedOrderForDetails && (
        <OrderDetailsModal 
          order={selectedOrderForDetails} 
          onClose={() => setShowOrderDetails(false)}
          language={language}
        />
      )}
    </div>
  );
};

export default ShopkeeperDashboard;
