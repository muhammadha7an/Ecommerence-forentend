import { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useSearchParams, Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import Icon from '../components/Icon';
import EmptyState from '../components/EmptyState';
import { useFreeShippingThreshold } from '../hooks/useShipping';
import { freeShippingPhrase } from '../utils/commerce';
import '../style/pages/shop.css';

const emptyList = [];

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Redux store data
  const products = useSelector((state) => state.products.items) ?? emptyList;
  const categories = useSelector((state) => state.categories.items) ?? emptyList;
  const categoriesLoading = useSelector((state) => state.categories.loading);
  const categoriesError = useSelector((state) => state.categories.error);
  const productsLoading = useSelector((state) => state.products.loading);
  const freeShippingThreshold = useFreeShippingThreshold();

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

  const selectedCategoryRecord = useMemo(() => {
    if (selectedCategory === 'all') return null;

    return categories.find((category) => (
      [category.id, category._id, category.legacyId, category.name, category.slug]
        .filter((value) => value !== undefined && value !== null)
        .some((value) => String(value) === String(selectedCategory))
    )) || null;
  }, [categories, selectedCategory]);

  const categoryMatchesProduct = (product, category) => {
    if (!category) return false;

    const categoryValues = [
      category.id,
      category._id,
      category.legacyId,
      category.name,
      category.slug,
    ]
      .filter((value) => value !== undefined && value !== null)
      .map((value) => String(value).toLowerCase());

    return [product.categoryId, product.category]
      .filter((value) => value !== undefined && value !== null)
      .some((value) => categoryValues.includes(String(value).toLowerCase()));
  };

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        // Category Filter (Handles both string and numeric IDs)
        const matchesCategory = selectedCategory === 'all'
          || categoryMatchesProduct(product, selectedCategoryRecord);

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
  }, [products, selectedCategory, selectedCategoryRecord, searchTerm, priceRange, inStockOnly, sortBy]);

  // Close the mobile filter panel with Escape and lock page scroll while open
  useEffect(() => {
    if (!isMobileFilterOpen) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') setIsMobileFilterOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.body.classList.add('is-scroll-locked');
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.classList.remove('is-scroll-locked');
    };
  }, [isMobileFilterOpen]);

  const activeFilterCount =
    (selectedCategory !== 'all' ? 1 : 0) +
    (searchTerm ? 1 : 0) +
    (priceRange < 1000 ? 1 : 0) +
    (inStockOnly ? 1 : 0);

  // Pagination Logic
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage]);

  return (
    <div className="shop-page">
      {/* 1. PAGE HEADER */}
      <section className="ui-page-head">
        <div className="aura-container">
          <nav className="ui-breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <Icon name="chevronRight" />
            <span aria-current="page">Shop</span>
          </nav>
          <h1 className="ui-page-head__title">
            {selectedCategoryRecord ? selectedCategoryRecord.name : 'Explore our catalog'}
          </h1>
          <p className="ui-page-head__text">
            {selectedCategoryRecord?.description ||
              'Discover thoughtful, high-quality home essentials designed for everyday living.'}
          </p>

          {/* Quick category bar */}
          <div className="shop-pills" role="tablist" aria-label="Quick categories">
            <button
              type="button"
              className={`shop-pill ${selectedCategory === 'all' ? 'is-active' : ''}`}
              onClick={() => handleCategoryChange('all')}
            >
              All items
            </button>
            {categories.map((cat) => {
              const categoryValue = cat.id || cat._id || cat.legacyId || cat.name;

              return (
                <button
                  type="button"
                  key={categoryValue}
                  className={`shop-pill ${String(selectedCategory) === String(categoryValue) ? 'is-active' : ''}`}
                  onClick={() => handleCategoryChange(categoryValue)}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 2. FILTERS + PRODUCTS */}
      <div className="shop-layout">
        {/* Overlay for mobile filter drawer */}
        <div
          className={`shop-filter-overlay ${isMobileFilterOpen ? 'is-open' : ''}`}
          onClick={() => setIsMobileFilterOpen(false)}
          aria-hidden="true"
        />

        {/* FILTER SIDEBAR */}
        <aside className={`shop-filters ${isMobileFilterOpen ? 'is-open' : ''}`} aria-label="Product filters">
          <div className="shop-filters__head">
            <h2>Filters</h2>
            <button
              type="button"
              className="ui-btn ui-btn--ghost ui-btn--icon ui-btn--sm shop-filters__close"
              onClick={() => setIsMobileFilterOpen(false)}
              aria-label="Close filters"
            >
              <Icon name="close" />
            </button>
          </div>

          <div className="shop-filters__body">
            {/* Search */}
            <div className="shop-filter">
              <label className="shop-filter__label" htmlFor="shop-search">Search</label>
              <div className="ui-input-icon">
                <Icon name="search" />
                <input
                  id="shop-search"
                  type="search"
                  className="ui-input"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
            </div>

            {/* Categories */}
            <div className="shop-filter">
              <span className="shop-filter__label">Categories</span>
              <ul className="shop-cat-list">
                <li>
                  <button
                    type="button"
                    className={selectedCategory === 'all' ? 'is-active' : ''}
                    onClick={() => handleCategoryChange('all')}
                  >
                    <span>All categories</span>
                    <span className="shop-cat-list__count">{products.length}</span>
                  </button>
                </li>
                {categoriesLoading && <li className="shop-cat-list__message">Loading categories...</li>}
                {!categoriesLoading && categoriesError && (
                  <li className="shop-cat-list__message">Unable to load categories.</li>
                )}
                {!categoriesLoading && !categoriesError && categories.length === 0 && (
                  <li className="shop-cat-list__message">No categories available.</li>
                )}
                {!categoriesLoading && !categoriesError && categories.map((cat) => {
                  const categoryValue = cat.id || cat._id || cat.legacyId || cat.name;
                  const count = products.filter((product) => categoryMatchesProduct(product, cat)).length;

                  return (
                    <li key={categoryValue}>
                      <button
                        type="button"
                        className={String(selectedCategory) === String(categoryValue) ? 'is-active' : ''}
                        onClick={() => handleCategoryChange(categoryValue)}
                      >
                        <span>{cat.name}</span>
                        <span className="shop-cat-list__count">{count}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Price */}
            <div className="shop-filter">
              <div className="shop-filter__row">
                <label className="shop-filter__label" htmlFor="shop-price">Max price</label>
                <span className="shop-filter__value">${priceRange}</span>
              </div>
              <input
                id="shop-price"
                type="range"
                min="10"
                max="1000"
                step="10"
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="shop-range"
                style={{ '--range-fill': `${((priceRange - 10) / 990) * 100}%` }}
              />
              <div className="shop-filter__minmax">
                <span>$10</span>
                <span>$1000</span>
              </div>
            </div>

            {/* Stock */}
            <div className="shop-filter">
              <label className="ui-check">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                />
                <span>In stock only</span>
              </label>
            </div>
          </div>

          <div className="shop-filters__foot">
            <button type="button" className="ui-btn ui-btn--secondary ui-btn--block" onClick={handleResetFilters}>
              <Icon name="rotateCcw" />
              Reset all filters
            </button>
            <button
              type="button"
              className="ui-btn ui-btn--block shop-filters__apply"
              onClick={() => setIsMobileFilterOpen(false)}
            >
              Show {filteredProducts.length} products
            </button>
          </div>
        </aside>

        {/* PRODUCT AREA */}
        <section className="shop-main" aria-label="Products">
          <div className="shop-toolbar">
            <p className="shop-toolbar__count">
              Showing <strong>{filteredProducts.length}</strong> {filteredProducts.length === 1 ? 'product' : 'products'}
              {productsLoading && (
                <span className="shop-toolbar__sync">
                  <span className="ui-spinner" aria-hidden="true" />
                  Updating
                </span>
              )}
            </p>

            <div className="shop-toolbar__actions">
              <button
                type="button"
                className="ui-btn ui-btn--secondary ui-btn--sm shop-filter-trigger"
                onClick={() => setIsMobileFilterOpen(true)}
              >
                <Icon name="sliders" />
                Filters
                {activeFilterCount > 0 && <span className="shop-filter-trigger__count">{activeFilterCount}</span>}
              </button>

              <label className="shop-sort">
                <span>Sort by</span>
                <select
                  className="ui-select ui-select--sm"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="newest">New Arrivals</option>
                </select>
              </label>
            </div>
          </div>

          {/* Grid / skeleton / empty */}
          {productsLoading && products.length === 0 ? (
            <div className="shop-grid" aria-busy="true">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="shop-skeleton">
                  <div className="ui-skeleton shop-skeleton__img" />
                  <div className="ui-skeleton shop-skeleton__line" />
                  <div className="ui-skeleton shop-skeleton__line shop-skeleton__line--short" />
                </div>
              ))}
            </div>
          ) : paginatedProducts.length > 0 ? (
            <div className="shop-grid">
              {paginatedProducts.map((product) => (
                <ProductCard key={product.id || product._id} product={product} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon="search"
              title="No products found"
              text="Try a different search term, widen the price range or clear your filters."
            >
              <button type="button" className="ui-btn" onClick={handleResetFilters}>
                Clear all filters
              </button>
            </EmptyState>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <nav className="shop-pagination" aria-label="Pagination">
              <button
                type="button"
                className="shop-page-btn shop-page-btn--nav"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
              >
                <Icon name="chevronLeft" />
                <span>Previous</span>
              </button>
              <div className="shop-pagination__pages">
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    type="button"
                    key={index + 1}
                    className={`shop-page-btn ${currentPage === index + 1 ? 'is-active' : ''}`}
                    onClick={() => setCurrentPage(index + 1)}
                    aria-current={currentPage === index + 1 ? 'page' : undefined}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
              <button
                type="button"
                className="shop-page-btn shop-page-btn--nav"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
              >
                <span>Next</span>
                <Icon name="chevronRight" />
              </button>
            </nav>
          )}
        </section>
      </div>

      {/* 3. SHOPPING GUARANTEE STRIP */}
      <section className="shop-guarantees">
        <div className="shop-guarantees__inner">
          <div className="shop-guarantee">
            <Icon name="truck" />
            <div>
              <h4>Free Shipping</h4>
              <p>Free delivery {freeShippingPhrase(freeShippingThreshold)}</p>
            </div>
          </div>
          <div className="shop-guarantee">
            <Icon name="package" />
            <div>
              <h4>Safe Packaging</h4>
              <p>100% recyclable, damage-proof packing</p>
            </div>
          </div>
          <div className="shop-guarantee">
            <Icon name="rotateCcw" />
            <div>
              <h4>30-Day Returns</h4>
              <p>No questions asked return policy</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
