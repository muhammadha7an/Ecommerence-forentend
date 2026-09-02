import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useSearchParams, Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
 

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Redux store data
  const products = useSelector((state) => state.products.items) || [];
  const categories = useSelector((state) => state.categories.items) || [];

  // Filter States
  const categoryParam = searchParams.get('category') || 'all';
  const searchParam = searchParams.get('search') || '';
  
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [searchTerm, setSearchTerm] = useState(searchParam);
  const [priceRange, setPriceRange] = useState(1000);
  const [sortBy, setSortBy] = useState('featured');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // Sync state with URL params when URL changes (e.g., clicking category link from Home page)
  useEffect(() => {
    setSelectedCategory(searchParams.get('category') || 'all');
    setSearchTerm(searchParams.get('search') || '');
  }, [searchParams]);

  // Update URL helper
  const updateUrlParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value && value !== 'all') {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  // Category change handler
  const handleCategoryChange = (catId) => {
    setSelectedCategory(catId);
    updateUrlParam('category', catId);
    setCurrentPage(1);
  };

  // Search input handler
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    updateUrlParam('search', val);
    setCurrentPage(1);
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSearchTerm('');
    setPriceRange(1000);
    setSortBy('featured');
    setInStockOnly(false);
    setSearchParams({});
    setCurrentPage(1);
  };

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        // Category Filter (Handles both string and numeric IDs)
        const matchesCategory =
          selectedCategory === 'all' ||
          String(product.categoryId) === String(selectedCategory) ||
          String(product.category) === String(selectedCategory);

        // Search Keyword Filter
        const matchesSearch =
          !searchTerm ||
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchTerm.toLowerCase());

        // Price Filter
        const matchesPrice = Number(product.price) <= priceRange;

        // Stock Filter
        const matchesStock = !inStockOnly || product.inStock !== false;

        return matchesCategory && matchesSearch && matchesPrice && matchesStock;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') return a.price - b.price;
        if (sortBy === 'price-high') return b.price - a.price;
        if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
        if (sortBy === 'newest') return (b.id || 0) - (a.id || 0);
        return 0; // Default / Featured
      });
  }, [products, selectedCategory, searchTerm, priceRange, inStockOnly, sortBy]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage]);

  return (
    <div className="shop-page">
      {/* 1. HERO & BREADCRUMB SECTION */}
      <section className="shop-hero">
        <div className="shop-hero-container">
          <nav className="breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <span className="current">Shop Collection</span>
          </nav>
          <h1>Explore Our Catalog</h1>
          <p>Discover thoughtful, high-quality home essentials designed for everyday living.</p>

          {/* Quick Category Bar */}
          <div className="quick-category-pills">
            <button
              className={`pill ${selectedCategory === 'all' ? 'active' : ''}`}
              onClick={() => handleCategoryChange('all')}
            >
              All Items
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`pill ${String(selectedCategory) === String(cat.id) ? 'active' : ''}`}
                onClick={() => handleCategoryChange(cat.id)}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 2. MAIN SHOP CONTENT (FILTERS + PRODUCTS) */}
      <div className="shop-layout-container">
        {/* Sidebar Overlay for Mobile */}
        {isMobileFilterOpen && (
          <div
            className="filter-overlay"
            onClick={() => setIsMobileFilterOpen(false)}
          ></div>
        )}

        {/* FILTER SIDEBAR */}
        <aside className={`filter-sidebar ${isMobileFilterOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            <h3>Filter Products</h3>
            <button
              className="close-mobile-filter"
              onClick={() => setIsMobileFilterOpen(false)}
            >
              ✕
            </button>
          </div>

          {/* Search Box */}
          <div className="filter-group">
            <label className="filter-label">Search</label>
            <div className="search-input-wrapper">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
          </div>

          {/* Categories List */}
          <div className="filter-group">
            <label className="filter-label">Categories</label>
            <ul className="category-list">
              <li>
                <button
                  className={selectedCategory === 'all' ? 'active' : ''}
                  onClick={() => handleCategoryChange('all')}
                >
                  <span>All Categories</span>
                  <span className="count">{products.length}</span>
                </button>
              </li>
              {categories.map((cat) => {
                const count = products.filter(
                  (p) => String(p.categoryId) === String(cat.id) || String(p.category) === String(cat.id)
                ).length;

                return (
                  <li key={cat.id}>
                    <button
                      className={String(selectedCategory) === String(cat.id) ? 'active' : ''}
                      onClick={() => handleCategoryChange(cat.id)}
                    >
                      <span>{cat.name}</span>
                      <span className="count">{count}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Price Range Slider */}
          <div className="filter-group">
            <div className="price-label-row">
              <label className="filter-label">Max Price</label>
              <span className="price-value">${priceRange}</span>
            </div>
            <input
              type="range"
              min="10"
              max="1000"
              step="10"
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className="price-slider"
            />
            <div className="price-min-max">
              <span>$10</span>
              <span>$1000</span>
            </div>
          </div>

          {/* Stock Filter Checkbox */}
          <div className="filter-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
              />
              <span>In Stock Only</span>
            </label>
          </div>

          {/* Reset Button */}
          <button className="btn btn-outline btn-reset" onClick={handleResetFilters}>
            Reset All Filters
          </button>
        </aside>

        {/* PRODUCT DISPLAY AREA */}
        <main className="shop-main">
          {/* Top Control Bar */}
          <div className="shop-toolbar">
            <div className="results-count">
              Showing <strong>{filteredProducts.length}</strong> products
            </div>

            <div className="toolbar-actions">
              <button
                className="btn-mobile-filter-trigger"
                onClick={() => setIsMobileFilterOpen(true)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                </svg>
                Filters
              </button>

              <div className="sort-dropdown">
                <label>Sort by:</label>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="newest">New Arrivals</option>
                </select>
              </div>
            </div>
          </div>

          {/* Product Grid / Empty State */}
          {paginatedProducts.length > 0 ? (
            <div className="shop-product-grid">
              {paginatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="empty-shop-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                <line x1="8" y1="11" x2="14" y2="11"></line>
              </svg>
              <h3>No products found</h3>
              <p>Try adjusting your search or filter options to find what you are looking for.</p>
              <button className="btn btn-primary" onClick={handleResetFilters}>
                Clear All Filters
              </button>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="page-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
              >
                Previous
              </button>
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index + 1}
                  className={`page-btn ${currentPage === index + 1 ? 'active' : ''}`}
                  onClick={() => setCurrentPage(index + 1)}
                >
                  {index + 1}
                </button>
              ))}
              <button
                className="page-btn"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
              >
                Next
              </button>
            </div>
          )}
        </main>
      </div>

      {/* 3. EXTRA FEATURE: SHOPPING GUARANTEE STRIP */}
      <section className="shop-guarantee-strip">
        <div className="guarantee-container">
          <div className="guarantee-card">
            <h4>Free Shipping</h4>
            <p>On all domestic orders over $75</p>
          </div>
          <div className="guarantee-card">
            <h4>Safe Packaging</h4>
            <p>100% recyclable, damage-proof packing</p>
          </div>
          <div className="guarantee-card">
            <h4>30-Day Returns</h4>
            <p>No questions asked return policy</p>
          </div>
        </div>
      </section>
    </div>
  );
}