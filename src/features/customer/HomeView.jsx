import React, { useMemo, useState, useEffect } from 'react';
import { ChevronLeft, Star, Plus, Minus, IndianRupee } from 'lucide-react';
import { translations } from '../../constants/translations';
import { semanticProductSearch } from '../../services/gemini';

const CategoryGrid = ({ categoriesData, onCategoryClick, language }) => {
  const t = translations[language];
  const sortedCategories = [...categoriesData].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

  return (
    <div className="category-section">
      <div className="category-grid">
        {sortedCategories.map(cat => (
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
  const productName = language === 'te' ? (product.nameTe || product.nameEn || product.name) : (product.nameEn || product.name);

  return (
    <div className={`product-card-modern ${isOutOfStock ? 'out-of-stock-card' : ''}`}>
      <img 
        src={product.imageUrl || 'https://via.placeholder.com/150'} 
        alt={productName}
        className="product-image"
      />
      {isOutOfStock && (
        <div className="out-of-stock-overlay">
          <span className="out-of-stock-badge">{t.outOfStock.toUpperCase()}</span>
        </div>
      )}
      <div className="product-info">
        <h3 className="product-name">{productName}</h3>
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
          {t.outOfStock}
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
  const sortedCategories = [...categoriesData].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  const topCategories = sortedCategories.slice(0, 6);
  
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
  const [semanticResults, setSemanticResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  
  console.log('[HomeView] Rendering with:', { 
    productsCount: products?.length, 
    categoriesCount: categoriesData?.length,
    voiceSearchResults: voiceSearchResults?.length 
  });

  useEffect(() => {
    if (!searchTerm || searchTerm.trim().length === 0) {
      setSemanticResults(null);
      return;
    }

    const performSemanticSearch = async () => {
      setIsSearching(true);
      try {
        const results = await semanticProductSearch(searchTerm, products);
        setSemanticResults(results);
      } catch (error) {
        console.error('[HomeView] Semantic search error:', error);
        setSemanticResults(null);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      performSemanticSearch();
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, products]);

  const basicSearchResults = useMemo(() => {
    if (!searchTerm) return [];
    const term = searchTerm.toLowerCase();
    return products.filter(p => 
      p.name.toLowerCase().includes(term) ||
      (p.nameTe && p.nameTe.includes(searchTerm)) ||
      (p.category && p.category.toLowerCase().includes(term))
    );
  }, [products, searchTerm]);

  const searchResults = useMemo(() => {
    if (voiceSearchResults) return voiceSearchResults;
    if (!searchTerm) return [];
    
    if (semanticResults && semanticResults.length > 0) {
      return semanticResults;
    }
    
    return basicSearchResults;
  }, [products, searchTerm, voiceSearchResults, semanticResults, basicSearchResults]);

  const popularProducts = useMemo(() => {
    return products
      .filter(p => p.isPopular === true)
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }, [products]);

  const isShowingSearchResults = searchTerm.trim().length > 0 || voiceSearchResults !== null;


  const categorySubcategories = useMemo(() => {
    if (!selectedCategory) return [];
    return subcategoriesData
      .filter(sc => sc.categoryId === selectedCategory)
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }, [subcategoriesData, selectedCategory]);

  const subcategoryProducts = useMemo(() => {
    if (!selectedSubcategory) return [];
    return products
      .filter(p => 
        p.subcategoryId === selectedSubcategory ||
        (!p.subcategoryId && selectedCategory && subcategoriesData.find(sc => sc.id === selectedSubcategory)?.categoryId === p.category)
      )
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
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
      const categoryProducts = products
        .filter(p => p.category === selectedCategory)
        .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
      
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
      {!isShowingSearchResults && !selectedCategory && (
        <QuickCategoriesBar
          categoriesData={categoriesData}
          selectedCategory={selectedCategory}
          onCategoryClick={handleCategoryClick}
          language={language}
        />
      )}
      
      {!isShowingSearchResults && (
        <CategoryGrid 
          categoriesData={categoriesData}
          onCategoryClick={handleCategoryClick}
          language={language}
        />
      )}

      {isShowingSearchResults ? (
        <div className="search-results-section">
          <h2 className="section-title">
            {voiceSearchResults ? t.voiceSearchResults : t.searchResults} ({searchResults.length})
            {isSearching && <span className="ai-searching"> 🔍 {t.aiSearching}</span>}
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
          ) : isSearching ? (
            <div className="empty-state">
              <p>{t.searchingProducts}</p>
            </div>
          ) : (
            <div className="empty-state">
              <p>{t.noProductsFound} "{searchTerm}"</p>
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
              <p>{t.noPopularProducts}</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default HomeView;
