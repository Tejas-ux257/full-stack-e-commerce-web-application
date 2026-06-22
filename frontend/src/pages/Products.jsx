import { useEffect, useState } from 'react';
import API from '../api/api';
import ProductCard from '../components/ProductCard';
import Toast from '../components/Toast';
import { Search, SlidersHorizontal, ArrowUpDown } from 'lucide-react';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Filters State
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [wishlistIds, setWishlistIds] = useState(new Set());

  useEffect(() => {
    fetchCategories();
    fetchUserWishlist();
  }, []);

  useEffect(() => {
    // Debounce product fetching when filters change
    const timer = setTimeout(() => {
      fetchProducts();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, selectedCategory, minPrice, maxPrice, sort, page]);

  const fetchCategories = async () => {
    try {
      const res = await API.get('/categories');
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUserWishlist = async () => {
    try {
      const res = await API.get('/wishlist');
      const ids = new Set(res.data.map(item => item.id));
      setWishlistIds(ids);
    } catch (err) {
      // User might be a guest
      console.log('Guest user, skipping wishlist checks');
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const query = `/products?search=${search}&category_id=${selectedCategory}&min_price=${minPrice}&max_price=${maxPrice}&sort=${sort}&page=${page}&limit=6`;
      const res = await API.get(query);
      setProducts(res.data.products);
      setTotalPages(res.data.pagination.pages);
    } catch (err) {
      console.error(err);
      setToast({ message: 'Error loading products catalog', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (id) => {
    setSelectedCategory(id);
    setPage(1);
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setMinPrice('');
    setMaxPrice('');
    setSort('');
    setPage(1);
  };

  return (
    <div className="fade-in">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: '800' }}>Products Catalog</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Browse premium items with live filtering, sorting, and pagination</p>
      </div>

      <div className="catalog-layout">
        {/* Sidebar Filters */}
        <aside className="filter-sidebar glass-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', fontWeight: '700' }}>
              <SlidersHorizontal size={18} /> Filters
            </h3>
            <button
              onClick={clearFilters}
              style={{ background: 'transparent', border: 'none', color: 'var(--accent-primary)', fontSize: '0.85rem', cursor: 'pointer', fontWeight: '600' }}
            >
              Reset
            </button>
          </div>

          {/* Search bar */}
          <div className="filter-section">
            <h4 className="filter-title">Search</h4>
            <div className="search-input-wrapper">
              <Search size={16} className="search-icon-svg" />
              <input
                type="text"
                placeholder="Product name..."
                className="search-input"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="filter-section">
            <h4 className="filter-title">Categories</h4>
            <div className="category-list">
              <button
                className={`category-item ${selectedCategory === '' ? 'active' : ''}`}
                onClick={() => handleCategorySelect('')}
              >
                All Categories
              </button>
              {categories.map(c => (
                <button
                  key={c.id}
                  className={`category-item ${selectedCategory === c.id.toString() ? 'active' : ''}`}
                  onClick={() => handleCategorySelect(c.id.toString())}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="filter-section">
            <h4 className="filter-title">Price Range (₹)</h4>
            <div className="price-inputs">
              <input
                type="number"
                placeholder="Min"
                className="price-box"
                value={minPrice}
                onChange={(e) => { setMinPrice(e.target.value); setPage(1); }}
              />
              <input
                type="number"
                placeholder="Max"
                className="price-box"
                value={maxPrice}
                onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
              />
            </div>
          </div>

          {/* Sort selection */}
          <div className="filter-section" style={{ borderBottom: 'none', marginBottom: 0, paddingBottom: 0 }}>
            <h4 className="filter-title">Sort By</h4>
            <div className="search-input-wrapper">
              <ArrowUpDown size={16} className="search-icon-svg" />
              <select
                className="search-input"
                value={sort}
                onChange={(e) => { setSort(e.target.value); setPage(1); }}
                style={{ appearance: 'none', cursor: 'pointer' }}
              >
                <option value="">Newest Arrivals</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="popularity">Most Popular</option>
              </select>
            </div>
          </div>
        </aside>

        {/* Products Grid Area */}
        <main>
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '24px' }}>
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="glass-panel" style={{ height: '365px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--accent-primary)', animation: 'spin 1s linear infinite' }} />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="glass-panel" style={{ padding: '60px', textCenter: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <h3 style={{ fontSize: '1.4rem' }}>No products found</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Try adjusting your filters or search terms.</p>
              <button className="btn-primary" onClick={clearFilters}>Reset Filters</button>
            </div>
          ) : (
            <>
              <div className="product-grid">
                {products.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onNotification={setToast}
                    inWishlist={wishlistIds.has(product.id)}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination-row">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      className={`page-btn ${page === p ? 'active' : ''}`}
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
