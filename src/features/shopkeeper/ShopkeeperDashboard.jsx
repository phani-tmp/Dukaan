import React, { useState } from 'react';
import { collection, doc, updateDoc, addDoc, deleteDoc, setDoc, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
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
  ShoppingBag,
  ChevronUp,
  ChevronDown,
  Calendar,
  TrendingUp,
  IndianRupee
} from 'lucide-react';

const ShopkeeperDashboard = ({ products, allOrders, allRiders, language, onExit, categoriesData, subcategoriesData, logoUrl, onLogoChange }) => {
  const { db, storage } = getFirebaseInstances();
  const t = translations[language];
  const [activeTab, setActiveTab] = useState('orders');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showForm, setShowForm] = useState(false);
  const [logoFormData, setLogoFormData] = useState('');
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [formData, setFormData] = useState({
    nameEn: '',
    nameTe: '',
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
  const [riderSortBy, setRiderSortBy] = useState('orders');

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

  const handlePrintBill = (order) => {
    const printWindow = window.open('', '_blank');
    const date = new Date(order.createdAt).toLocaleDateString('en-IN', { 
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    });
    const time = new Date(order.createdAt).toLocaleTimeString('en-IN', { 
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const billHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt - ${order.orderNumber || order.id.substring(0, 8)}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Courier New', monospace; 
              padding: 30px 20px; 
              max-width: 320px; 
              margin: 0 auto;
              background: #fff;
              color: #333;
            }
            .receipt-header { 
              text-align: center; 
              margin-bottom: 20px;
              color: #999;
            }
            .receipt-header h1 { 
              font-size: 18px; 
              font-style: italic;
              font-weight: 400;
              margin-bottom: 10px;
              letter-spacing: 2px;
            }
            .receipt-number { 
              text-align: center;
              font-size: 11px;
              margin-bottom: 20px;
              color: #666;
            }
            .items-list { 
              margin-bottom: 20px;
            }
            .item-row { 
              display: flex;
              justify-content: space-between;
              margin-bottom: 8px;
              font-size: 13px;
            }
            .item-name {
              flex: 1;
              padding-right: 10px;
            }
            .item-price {
              text-align: right;
              white-space: nowrap;
            }
            .divider {
              border-top: 1px dashed #ccc;
              margin: 15px 0;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 8px;
              font-size: 13px;
            }
            .total-row.grand {
              font-weight: bold;
              font-size: 16px;
              margin-top: 10px;
            }
            .footer {
              text-align: center;
              margin-top: 25px;
              font-size: 12px;
              color: #666;
            }
            .print-buttons {
              text-align: center;
              margin-top: 30px;
            }
            .print-buttons button {
              background: #333;
              color: white;
              border: none;
              padding: 10px 25px;
              font-size: 14px;
              cursor: pointer;
              margin: 0 5px;
              border-radius: 3px;
            }
            .print-buttons button:hover {
              background: #555;
            }
            @media print {
              body { padding: 10px; }
              .print-buttons { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="receipt-header">
            <h1>DUKAAN</h1>
            <div style="font-size: 11px; color: #999; margin-top: 5px;">
              ${order.customerName || 'Customer'}<br>
              ${date} ${time}
            </div>
          </div>
          
          <div class="receipt-number">
            ${order.orderNumber || `RECEIPT # ${order.id.substring(0, 8).toUpperCase()}`}
          </div>

          <div class="items-list">
            ${order.items.map(item => {
              const itemName = order.customerLanguage === 'te' 
                ? (item.nameTe || item.nameEn || item.name) 
                : (item.nameEn || item.name);
              return `
                <div class="item-row">
                  <span class="item-name">${itemName}</span>
                  <span class="item-price">₹${((item.price || 0) * item.quantity).toFixed(2)}</span>
                </div>
              `;
            }).join('')}
          </div>

          <div class="divider"></div>

          ${order.totalSavings && order.totalSavings > 0 ? `
            <div class="total-row">
              <span>You Saved</span>
              <span style="color: #666;">₹${order.totalSavings.toFixed(2)}</span>
            </div>
          ` : ''}

          <div class="total-row grand">
            <span>TOTAL</span>
            <span>₹${order.total.toFixed(2)}</span>
          </div>

          <div class="footer">
            *** THANK YOU ***
          </div>

          <div class="print-buttons">
            <button onclick="window.print()">Print</button>
            <button onclick="window.close()">Close</button>
          </div>
        </body>
      </html>
    `;
    
    printWindow.document.write(billHTML);
    printWindow.document.close();
  };

  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    
    if (!formData.category || !formData.subcategoryId) {
      alert('Please select both Category and Subcategory before saving the product.');
      return;
    }
    
    try {
      if (!db) {
        throw new Error('Firebase database not initialized');
      }
      
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        discountedPrice: formData.discountedPrice ? parseFloat(formData.discountedPrice) : null,
        isPopular: formData.isPopular || false,
        sortOrder: editingId ? undefined : products.length,
        createdAt: new Date().toISOString()
      };

      if (editingId) {
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'products', editingId), productData);
        alert('Product updated successfully!');
      } else {
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'products'), productData);
        alert('Product added successfully!');
      }

      setFormData({ nameEn: '', nameTe: '', price: '', discountedPrice: '', weight: '', imageUrl: '', category: '', subcategoryId: '', isPopular: false, outOfStock: false });
      setImagePreview(null);
      setShowForm(false);
      setEditingId(null);
    } catch (error) {
      console.error('Error saving product:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('AppId:', appId);
      console.error('Database instance:', db ? 'initialized' : 'not initialized');
      alert(`Failed to save product: ${error.message || error.code || 'Unknown error'}`);
    }
  };

  const handleEditProduct = (product) => {
    setFormData({
      nameEn: product.nameEn || product.name || '',
      nameTe: product.nameTe || '',
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

  const reorderItems = async (collection, items, fromIndex, toIndex) => {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= items.length || toIndex >= items.length) {
      return;
    }

    try {
      const batch = [];
      const reorderedItems = [...items];
      const [movedItem] = reorderedItems.splice(fromIndex, 1);
      reorderedItems.splice(toIndex, 0, movedItem);

      reorderedItems.forEach((item, index) => {
        batch.push(
          setDoc(doc(db, 'artifacts', appId, 'public', 'data', collection, item.id), {
            sortOrder: index
          }, { merge: true })
        );
      });

      await Promise.all(batch);
    } catch (error) {
      console.error('Error reordering items:', error);
      alert('Failed to reorder items');
    }
  };

  const moveCategory = async (categoryId, direction) => {
    const sortedCategories = [...categoriesData].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    const currentIndex = sortedCategories.findIndex(c => c.id === categoryId);
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    await reorderItems('categories', sortedCategories, currentIndex, newIndex);
  };

  const moveSubcategory = async (subcategoryId, direction) => {
    const sortedSubcategories = [...subcategoriesData].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    const currentIndex = sortedSubcategories.findIndex(s => s.id === subcategoryId);
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    await reorderItems('subcategories', sortedSubcategories, currentIndex, newIndex);
  };

  const moveProduct = async (productId, direction) => {
    const sortedProducts = [...products].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    const currentIndex = sortedProducts.findIndex(p => p.id === productId);
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    await reorderItems('products', sortedProducts, currentIndex, newIndex);
  };

  const handleSubmitCategory = async (e) => {
    e.preventDefault();
    try {
      const categoryId = categoryFormData.nameEn.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      
      const categoryData = {
        nameEn: categoryFormData.nameEn,
        nameTe: categoryFormData.nameTe,
        imageUrl: categoryFormData.imageUrl,
        color: categoryFormData.color,
        gradient: categoryFormData.gradient || `linear-gradient(135deg, ${categoryFormData.color} 0%, ${categoryFormData.color}dd 100%)`,
        sortOrder: editingCategoryId ? undefined : categoriesData.length,
        createdAt: new Date().toISOString()
      };

      if (editingCategoryId) {
        await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'categories', editingCategoryId), categoryData, { merge: true });
        alert('Category updated successfully!');
      } else {
        await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'categories', categoryId), categoryData);
        alert('Category added successfully!');
      }

      setCategoryFormData({ nameEn: '', nameTe: '', imageUrl: '', color: '#4CAF50', gradient: '' });
      setShowCategoryForm(false);
      setEditingCategoryId(null);
      setCategoryImagePreview(null);
    } catch (error) {
      console.error('Error saving category:', error);
      alert(`Failed to save category: ${error.message}`);
    }
  };

  const handleEditCategory = (category) => {
    setCategoryFormData({
      nameEn: category.nameEn || '',
      nameTe: category.nameTe || '',
      imageUrl: category.imageUrl || '',
      color: category.color || '#4CAF50',
      gradient: category.gradient || ''
    });
    setCategoryImagePreview(category.imageUrl || null);
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
      const subcategoryId = `${subcategoryFormData.categoryId}-${subcategoryFormData.nameEn.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`;
      
      const subcategoryData = {
        nameEn: subcategoryFormData.nameEn,
        nameTe: subcategoryFormData.nameTe,
        categoryId: subcategoryFormData.categoryId,
        imageUrl: subcategoryFormData.imageUrl,
        sortOrder: editingSubcategoryId ? undefined : subcategoriesData.length,
        createdAt: new Date().toISOString()
      };

      if (editingSubcategoryId) {
        await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'subcategories', editingSubcategoryId), subcategoryData, { merge: true });
        alert('Subcategory updated successfully!');
      } else {
        await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'subcategories', subcategoryId), subcategoryData);
        alert('Subcategory added successfully!');
      }

      setSubcategoryFormData({ nameEn: '', nameTe: '', categoryId: '', imageUrl: '' });
      setShowSubcategoryForm(false);
      setEditingSubcategoryId(null);
      setSubcategoryImagePreview(null);
    } catch (error) {
      console.error('Error saving subcategory:', error);
      alert(`Failed to save subcategory: ${error.message}`);
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
    const productName = product.nameEn || product.nameTe || product.name || '';
    const productNameTe = product.nameTe || '';
    const matchesSearch = productName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         productNameTe.includes(searchTerm);
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
        <button 
          className={`tab-button ${activeTab === 'riders' ? 'active' : ''}`}
          onClick={() => setActiveTab('riders')}
        >
          <User className="w-5 h-5" />
          Riders
        </button>
        <button 
          className={`tab-button ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <TrendingUp className="w-5 h-5" />
          Analytics
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
                          <span className="order-customer">{order.orderNumber || `Order #${order.id.substring(0, 8)}`}</span>
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

                        {order.deliveryMethod === 'delivery' && (order.status === 'ready_for_pickup' || order.status === 'accepted' || order.status === 'out_for_delivery' || order.status === 'delivered') && (
                          <div className="rider-assignment-section" style={{ marginTop: '12px' }}>
                            <label className="status-dropdown-label" style={{ fontSize: '13px' }}>
                              {order.riderName ? `Rider: ${order.riderName}` : 'Assign Rider:'}
                            </label>
                            {order.status !== 'delivered' ? (
                              <select 
                                value={order.riderId || ''}
                                onChange={async (e) => {
                                  const selectedRider = allRiders.find(r => r.id === e.target.value);
                                  if (selectedRider) {
                                    try {
                                      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'orders', order.id), {
                                        riderId: selectedRider.id,
                                        riderName: selectedRider.name,
                                        riderPhone: selectedRider.phone,
                                        updatedAt: new Date().toISOString()
                                      });
                                      alert(`Rider ${selectedRider.name} assigned successfully!`);
                                    } catch (error) {
                                      console.error('Error assigning rider:', error);
                                      alert('Failed to assign rider');
                                    }
                                  }
                                }}
                                className="status-dropdown"
                                style={{ fontSize: '13px', padding: '6px 8px' }}
                              >
                                <option value="">Select Rider</option>
                                {allRiders && allRiders.map(rider => (
                                  <option key={rider.id} value={rider.id}>
                                    {rider.name} - {rider.phone}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <span style={{ fontSize: '13px', color: '#4CAF50', fontWeight: '600' }}>
                                {order.riderPhone && `📞 ${order.riderPhone}`}
                              </span>
                            )}
                          </div>
                        )}
                        
                        <div className="order-action-buttons">
                          <button 
                            onClick={() => handleViewOrderDetails(order)}
                            className="view-details-btn"
                          >
                            <Eye className="w-4 h-4" />
                            View Details
                          </button>
                          
                          <button 
                            onClick={() => handlePrintBill(order)}
                            className="view-details-btn"
                            style={{ background: '#2196F3' }}
                          >
                            <Package className="w-4 h-4" />
                            {t.printBill}
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
                <div className="bilingual-input-group">
                  <div className="input-with-voice">
                    <input
                      type="text"
                      placeholder={t.productNameEn}
                      value={formData.nameEn}
                      onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                      required
                      className="form-input"
                    />
                  </div>
                  <div className="input-with-voice">
                    <input
                      type="text"
                      placeholder={t.productNameTe}
                      value={formData.nameTe}
                      onChange={(e) => setFormData({ ...formData, nameTe: e.target.value })}
                      required
                      className="form-input"
                    />
                  </div>
                  <BilingualVoiceInput
                    onTranscript={({ english, telugu }) => {
                      setFormData({
                        ...formData,
                        nameEn: english || '',
                        nameTe: telugu || ''
                      });
                    }}
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
                  <option value="">{language === 'te' ? 'వర్గం ఎంచుకోండి' : 'Select Category'}</option>
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
                    <option value="">{language === 'te' ? 'ఉప-వర్గం ఎంచుకోండి' : 'Select Subcategory'}</option>
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
                  {language === 'te' ? 'ప్రజాదరణ ఉత్పత్తిగా గుర్తించు' : 'Mark as Popular Product'}
                </label>

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.outOfStock}
                    onChange={(e) => setFormData({ ...formData, outOfStock: e.target.checked })}
                  />
                  {t.outOfStock} ({t.unavailablePickupDelivery})
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
                {language === 'te' ? 'అన్నీ' : 'All'} ({products.length})
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
                  <img src={product.imageUrl || 'https://via.placeholder.com/60'} alt={language === 'te' ? (product.nameTe || product.nameEn || product.name) : (product.nameEn || product.name)} className="admin-product-img" />
                  <div className="admin-product-info">
                    <h4>
                      {language === 'te' 
                        ? (product.nameTe || product.nameEn || product.name)
                        : (product.nameEn || product.name)
                      }
                      {product.nameEn && product.nameTe && language === 'en' && <span className="name-alt"> / {product.nameTe}</span>}
                      {product.nameEn && product.nameTe && language === 'te' && <span className="name-alt"> / {product.nameEn}</span>}
                    </h4>
                    <p>{product.category} • {product.weight}</p>
                    <p className="admin-price">₹{product.discountedPrice || product.price}</p>
                    {product.isPopular && <span className="popular-tag">⭐ {language === 'te' ? 'ప్రజాదరణ' : 'Popular'}</span>}
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
            {categoriesData.length === 0 && (
              <div style={{ 
                padding: '24px', 
                background: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)', 
                borderRadius: '12px', 
                marginBottom: '20px',
                border: '2px dashed #FF9800',
                textAlign: 'center'
              }}>
                <h3 style={{ color: '#E65100', marginBottom: '12px', fontSize: '18px' }}>
                  📦 No Categories Found in Database
                </h3>
                <p style={{ color: '#757575', marginBottom: '16px', fontSize: '14px' }}>
                  Click below to add Zepto-style default categories (Groceries, Vegetables, Milk, Snacks, Medicines, Electronics)
                </p>
                <button onClick={seedDefaultData} className="add-product-btn" style={{ background: '#FF9800', fontSize: '16px', padding: '12px 24px' }}>
                  <Settings className="w-5 h-5" />
                  Seed Default Categories
                </button>
              </div>
            )}
            
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
              <button onClick={() => setShowCategoryForm(!showCategoryForm)} className="add-product-btn">
                <PlusCircle className="w-5 h-5" />
                Add Category
              </button>
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
                        nameEn: english || '',
                        nameTe: telugu || ''
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
              {[...categoriesData].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)).map((category, index, arr) => (
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
                    <button 
                      onClick={() => moveCategory(category.id, 'up')} 
                      className="edit-btn"
                      disabled={index === 0}
                      title="Move up"
                      style={{ opacity: index === 0 ? 0.3 : 1 }}
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => moveCategory(category.id, 'down')} 
                      className="edit-btn"
                      disabled={index === arr.length - 1}
                      title="Move down"
                      style={{ opacity: index === arr.length - 1 ? 0.3 : 1 }}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
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
                        nameEn: english || '',
                        nameTe: telugu || ''
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
              {[...subcategoriesData].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)).map((subcategory, index, arr) => {
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
                      <button 
                        onClick={() => moveSubcategory(subcategory.id, 'up')} 
                        className="edit-btn"
                        disabled={index === 0}
                        title="Move up"
                        style={{ opacity: index === 0 ? 0.3 : 1 }}
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => moveSubcategory(subcategory.id, 'down')} 
                        className="edit-btn"
                        disabled={index === arr.length - 1}
                        title="Move down"
                        style={{ opacity: index === arr.length - 1 ? 0.3 : 1 }}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
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
              {[...products].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)).map((product, index, arr) => (
                <div key={product.id} className="admin-product-card">
                  <img src={product.imageUrl || 'https://via.placeholder.com/60'} alt={language === 'te' ? (product.nameTe || product.nameEn || product.name) : (product.nameEn || product.name)} className="admin-product-img" />
                  <div className="admin-product-info">
                    <h4>
                      {language === 'te' 
                        ? (product.nameTe || product.nameEn || product.name)
                        : (product.nameEn || product.name)
                      }
                    </h4>
                    <p>{product.category} • {product.weight}</p>
                    <p className="admin-price">₹{product.discountedPrice || product.price}</p>
                  </div>
                  <div className="admin-product-actions">
                    <button 
                      onClick={() => moveProduct(product.id, 'up')} 
                      className="edit-btn"
                      disabled={index === 0}
                      title="Move up"
                      style={{ opacity: index === 0 ? 0.3 : 1 }}
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => moveProduct(product.id, 'down')} 
                      className="edit-btn"
                      disabled={index === arr.length - 1}
                      title="Move down"
                      style={{ opacity: index === arr.length - 1 ? 0.3 : 1 }}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
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

        {activeTab === 'riders' && (
          <div className="riders-section">
            <div className="section-header">
              <h3 className="section-subtitle">Riders Management ({allRiders?.length || 0})</h3>
              <select
                value={riderSortBy}
                onChange={(e) => setRiderSortBy(e.target.value)}
                className="form-input"
                style={{ width: 'auto', padding: '8px 12px' }}
              >
                <option value="orders">Sort by Orders</option>
                <option value="name">Sort by Name</option>
              </select>
            </div>

            {!allRiders || allRiders.length === 0 ? (
              <div className="empty-state">
                <User className="w-16 h-16 text-gray-400" />
                <p>No riders registered yet</p>
                <p style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
                  Riders can register at: ?mode=rider
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', marginTop: '20px' }}>
                {allRiders
                  .map(rider => ({
                    ...rider,
                    totalOrders: allOrders.filter(o => o.riderId === rider.id).length,
                    activeOrders: allOrders.filter(o => o.riderId === rider.id && o.status === 'out_for_delivery').length,
                    completedOrders: allOrders.filter(o => o.riderId === rider.id && o.status === 'delivered').length
                  }))
                  .sort((a, b) => {
                    if (riderSortBy === 'orders') return b.totalOrders - a.totalOrders;
                    return a.name.localeCompare(b.name);
                  })
                  .map(rider => (
                    <div key={rider.id} style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: '1px solid #e0e0e0', position: 'relative' }}>
                      <button
                        onClick={async () => {
                          if (rider.activeOrders > 0) {
                            alert(`Cannot delete rider ${rider.name}. They have ${rider.activeOrders} active delivery in progress.`);
                            return;
                          }
                          if (window.confirm(`Are you sure you want to delete rider ${rider.name}? This action cannot be undone.`)) {
                            try {
                              await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'riders', rider.id));
                              alert(`Rider ${rider.name} deleted successfully!`);
                            } catch (error) {
                              console.error('Error deleting rider:', error);
                              alert('Failed to delete rider');
                            }
                          }
                        }}
                        className="delete-btn"
                        style={{ position: 'absolute', top: '12px', right: '12px', padding: '6px', borderRadius: '6px', background: '#fff', border: '1px solid #e0e0e0' }}
                        title="Delete Rider"
                      >
                        <Trash2 className="w-4 h-4" style={{ color: '#f44336' }} />
                      </button>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #f0f0f0' }}>
                        <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '20px', fontWeight: '700' }}>
                          {rider.name.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#333', marginBottom: '4px' }}>{rider.name}</h4>
                          <a href={`tel:${rider.phone}`} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', color: '#2196F3', textDecoration: 'none' }}>
                            <Phone className="w-4 h-4" />
                            {rider.phone}
                          </a>
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '24px', fontWeight: '700', color: '#333' }}>{rider.totalOrders}</div>
                          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>Total Orders</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '24px', fontWeight: '700', color: '#FF9800' }}>{rider.activeOrders}</div>
                          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>Active</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '24px', fontWeight: '700', color: '#4CAF50' }}>{rider.completedOrders}</div>
                          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>Completed</div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="analytics-section">
            <div className="section-header">
              <h3 className="section-subtitle">Daily Analytics</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar className="w-5 h-5 text-gray-600" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #E0E0E0',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                />
              </div>
            </div>

            {(() => {
              const dayOrders = allOrders.filter(order => {
                const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
                return orderDate === selectedDate;
              });
              
              const totalRevenue = dayOrders
                .filter(o => o.status === 'completed' || o.status === 'delivered')
                .reduce((sum, order) => sum + order.total, 0);
              const completedOrders = dayOrders.filter(o => o.status === 'completed' || o.status === 'delivered').length;
              const pendingOrders = dayOrders.filter(o => o.status === 'pending').length;
              const cancelledOrders = dayOrders.filter(o => o.status === 'cancelled').length;

              return (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '20px' }}>
                    <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <IndianRupee className="w-6 h-6" style={{ color: '#4CAF50' }} />
                        <span style={{ fontSize: '14px', color: '#666' }}>Total Revenue</span>
                      </div>
                      <div style={{ fontSize: '28px', fontWeight: '700', color: '#2E7D32' }}>
                        ₹{totalRevenue.toFixed(0)}
                      </div>
                    </div>

                    <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <Package className="w-6 h-6" style={{ color: '#2196F3' }} />
                        <span style={{ fontSize: '14px', color: '#666' }}>Total Orders</span>
                      </div>
                      <div style={{ fontSize: '28px', fontWeight: '700', color: '#1976D2' }}>
                        {dayOrders.length}
                      </div>
                    </div>

                    <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <Package className="w-6 h-6" style={{ color: '#4CAF50' }} />
                        <span style={{ fontSize: '14px', color: '#666' }}>Completed</span>
                      </div>
                      <div style={{ fontSize: '28px', fontWeight: '700', color: '#2E7D32' }}>
                        {completedOrders}
                      </div>
                    </div>

                    <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <Clock className="w-6 h-6" style={{ color: '#FF9800' }} />
                        <span style={{ fontSize: '14px', color: '#666' }}>Pending</span>
                      </div>
                      <div style={{ fontSize: '28px', fontWeight: '700', color: '#F57C00' }}>
                        {pendingOrders}
                      </div>
                    </div>
                  </div>

                  <div style={{ background: 'white', borderRadius: '12px', padding: '24px', marginTop: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                    <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
                      Orders for {new Date(selectedDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </h4>
                    {dayOrders.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                        <Package className="w-12 h-12" style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                        <p>No orders on this date</p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {dayOrders.map(order => (
                          <div key={order.id} style={{ 
                            padding: '16px', 
                            background: '#f9f9f9', 
                            borderRadius: '8px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}>
                            <div>
                              <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                                {order.orderNumber || `Order #${order.id.substring(0, 8)}`}
                              </div>
                              <div style={{ fontSize: '13px', color: '#666' }}>
                                {new Date(order.createdAt).toLocaleTimeString('en-IN')} • {order.items.length} items
                              </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontWeight: '700', fontSize: '16px', color: '#2E7D32' }}>
                                ₹{order.total.toFixed(0)}
                              </div>
                              <div style={{ 
                                fontSize: '12px', 
                                padding: '4px 8px', 
                                borderRadius: '4px',
                                background: order.status === 'completed' || order.status === 'delivered' ? '#E8F5E9' : '#FFF3E0',
                                color: order.status === 'completed' || order.status === 'delivered' ? '#2E7D32' : '#F57C00',
                                marginTop: '4px'
                              }}>
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
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
