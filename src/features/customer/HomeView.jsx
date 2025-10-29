import React, { useMemo } from 'react';
import { ChevronLeft, Star, Plus, Minus, IndianRupee } from 'lucide-react';
import { translations } from '../../constants/translations';

const CategoryGrid = ({ categoriesData, onCategoryClick, language }) => {
  const t = translations[language];

  return (
    <div className="category-section">
      <div className="category-grid">
        {categoriesData.map(cat => (
          <button
            key={cat.id}
            onClick={() => onCategoryClick(cat.id)}
            className="category-card"
            style={{ background: cat.gradient }}
          >
            <div className="category-icon">
              <img 
                src={cat.imageUrl || 'https://via.placeholder.com/50/CCCCCC/666666?text=No+Image'} 
                alt={cat.nameEn} 
                className="category-image" 
              />
            </div>
            <div className="category-labels">
              <div className="category-name-en">{cat.nameEn}</div>
              <div className="category-name-te">/ {cat.nameTe}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

const ProductCard = ({ product, onAddToCart, cartItems, language }) => {
  const t = translations[language];
  const quantity = cartItems[product.id]?.quantity || 0;
  const isOutOfStock = product.outOfStock === true;

  return (
    <div className={`product-card-modern ${isOutOfStock ? 'out-of-stock-card' : ''}`}>
      <img 
        src={product.imageUrl || 'https://via.placeholder.com/150'} 
        alt={product.name}
        className="product-image"
      />
      {isOutOfStock && (
        <div className="out-of-stock-overlay">
          <span className="out-of-stock-badge">OUT OF STOCK</span>
        </div>
      )}
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-weight">{product.weight}</p>
        <div className="product-price-row">
          <span className="product-price">
            <IndianRupee className="w-4 h-4" />
            {product.discountedPrice || product.price}
          </span>
          {product.discountedPrice && (
            <span className="product-original-price">
              <IndianRupee className="w-3 h-3" />
              {product.price}
            </span>
          )}
        </div>
      </div>
      
      {isOutOfStock ? (
        <button
          className="add-to-cart-btn disabled-btn"
          disabled
        >
          Out of Stock
        </button>
      ) : quantity === 0 ? (
        <button
          onClick={() => onAddToCart(product)}
          className="add-to-cart-btn"
        >
          {t.addToCart}
        </button>
      ) : (
        <div className="quantity-controls">
          <button onClick={() => onAddToCart(product, -1)} className="quantity-btn">
            <Minus className="w-4 h-4" />
          </button>
          <span className="quantity-display">{quantity}</span>
          <button onClick={() => onAddToCart(product, 1)} className="quantity-btn">
            <Plus className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

const QuickCategoriesBar = ({ categoriesData, selectedCategory, onCategoryClick, language }) => {
  const topCategories = categoriesData.slice(0, 6);
  
  return (
    <div className="quick-categories-bar">
      {topCategories.map(cat => (
        <button
          key={cat.id}
          onClick={() => onCategoryClick(cat.id)}
          className={`quick-category-chip ${selectedCategory === cat.id ? 'active' : ''}`}
        >
          {language === 'en' ? cat.nameEn : cat.nameTe}
        </button>
      ))}
    </div>
  );
};

const HomeView = ({ 
  products, 
  onAddToCart, 
  cartItems, 
  setCurrentView, 
  selectedCategory,
  setSelectedCategory,
  selectedSubcategory,
  setSelectedSubcategory,
  searchTerm, 
  language,
  categoriesData,
  subcategoriesData,
  voiceSearchResults = null,
  setVoiceSearchResults = () => {}
}) => {
  const t = translations[language];
  
  console.log('[HomeView] Rendering with:', { 
    productsCount: products?.length, 
    categoriesCount: categoriesData?.length,
    voiceSearchResults: voiceSearchResults?.length 
  });

  const searchResults = useMemo(() => {
    if (voiceSearchResults) return voiceSearchResults;
    if (!searchTerm) return [];
    const term = searchTerm.toLowerCase();
    return products.filter(p => 
      p.name.toLowerCase().includes(term)
    );
  }, [products, searchTerm, voiceSearchResults]);

  const popularProducts = useMemo(() => {
    return products.filter(p => p.isPopular === true);
  }, [products]);

  const isSearching = searchTerm.trim().length > 0 || voiceSearchResults !== null;


  const categorySubcategories = useMemo(() => {
    if (!selectedCategory) return [];
    return subcategoriesData.filter(sc => sc.categoryId === selectedCategory);
  }, [subcategoriesData, selectedCategory]);

  const subcategoryProducts = useMemo(() => {
    if (!selectedSubcategory) return [];
    return products.filter(p => 
      p.subcategoryId === selectedSubcategory ||
      (!p.subcategoryId && selectedCategory && subcategoriesData.find(sc => sc.id === selectedSubcategory)?.categoryId === p.category)
    );
  }, [products, selectedSubcategory, selectedCategory, subcategoriesData]);

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId);
    setSelectedSubcategory(null);
  };

  const handleSubcategoryClick = (subcategoryId) => {
    setSelectedSubcategory(subcategoryId);
  };

  const handleBack = () => {
    if (selectedSubcategory) {
      setSelectedSubcategory(null);
    } else if (selectedCategory) {
      setSelectedCategory(null);
    }
  };

  if (selectedSubcategory) {
    const subcategory = subcategoriesData.find(sc => sc.id === selectedSubcategory);
    const category = categoriesData.find(c => c.id === selectedCategory);
    
    return (
      <div className="subcategory-products-view">
        <div className="view-header">
          <button onClick={handleBack} className="back-button">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h2 className="view-title">
            {language === 'en' ? subcategory?.nameEn : subcategory?.nameTe || subcategory?.nameEn}
          </h2>
        </div>
        <div className="products-grid">
          {subcategoryProducts.length > 0 ? (
            subcategoryProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={onAddToCart}
                cartItems={cartItems}
                language={language}
              />
            ))
          ) : (
            <div className="empty-state">
              <p>No products in this subcategory yet.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (selectedCategory) {
    const category = categoriesData.find(c => c.id === selectedCategory);
    
    if (categorySubcategories.length === 0) {
      const categoryProducts = products.filter(p => p.category === selectedCategory);
      
      return (
        <div className="subcategory-products-view">
          <div className="view-header">
            <button onClick={handleBack} className="back-button">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h2 className="view-title">
              {language === 'en' ? category?.nameEn : category?.nameTe || category?.nameEn}
            </h2>
          </div>
          <div className="products-grid">
            {categoryProducts.length > 0 ? (
              categoryProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={onAddToCart}
                  cartItems={cartItems}
                  language={language}
                />
              ))
            ) : (
              <div className="empty-state">
                <p>No products in this category yet.</p>
              </div>
            )}
          </div>
        </div>
      );
    }
    
    return (
      <div className="subcategories-view">
        <div className="view-header">
          <button onClick={handleBack} className="back-button">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h2 className="view-title">
            {language === 'en' ? category?.nameEn : category?.nameTe || category?.nameEn}
          </h2>
        </div>
        <div className="subcategory-grid">
          {categorySubcategories.map(subcategory => (
            <button
              key={subcategory.id}
              onClick={() => handleSubcategoryClick(subcategory.id)}
              className="subcategory-card"
            >
              <span className="subcategory-icon">
                <img 
                  src={subcategory.imageUrl || 'https://via.placeholder.com/48/CCCCCC/666666?text=No+Image'} 
                  alt={subcategory.nameEn} 
                  className="subcategory-image" 
                />
              </span>
              <span className="subcategory-name">
                {language === 'en' ? subcategory.nameEn : subcategory.nameTe || subcategory.nameEn}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="home-view">
      {!isSearching && !selectedCategory && (
        <QuickCategoriesBar
          categoriesData={categoriesData}
          selectedCategory={selectedCategory}
          onCategoryClick={handleCategoryClick}
          language={language}
        />
      )}
      
      {!isSearching && (
        <CategoryGrid 
          categoriesData={categoriesData}
          onCategoryClick={handleCategoryClick}
          language={language}
        />
      )}

      {isSearching ? (
        <div className="search-results-section">
          <h2 className="section-title">
            {voiceSearchResults ? 'Voice Search Results' : 'Search Results'} ({searchResults.length})
          </h2>
          {searchResults.length > 0 ? (
            <div className="products-grid">
              {searchResults.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={onAddToCart}
                  cartItems={cartItems}
                  language={language}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No products found for "{searchTerm}"</p>
            </div>
          )}
        </div>
      ) : (
        <div className="popular-section">
          <h2 className="section-title">{t.popularProducts}</h2>
          {popularProducts.length > 0 ? (
            <div className="products-grid">
              {popularProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={onAddToCart}
                  cartItems={cartItems}
                  language={language}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No popular products yet. Visit Shopkeeper Dashboard to mark products as popular.</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default HomeView;
