import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/api';
import ProductCard from '../components/ProductCard';
import Toast from '../components/Toast';
import { ArrowRight, ShieldCheck, Truck, RotateCcw, HelpCircle } from 'lucide-react';
import { getRecentlyViewedProducts, trackRecentlyViewedProduct } from '../pwa';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchFeaturedProducts();
    setRecentProducts(getRecentlyViewedProducts());
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const res = await API.get('/products?limit=4&sort=popularity');
      setFeaturedProducts(res.data.products);
    } catch (err) {
      console.error('Error fetching featured products:', err);
    } finally {
      setLoading(false);
    }
  };

  const triggerToast = (toastObj) => {
    setToast(toastObj);
  };

  // Track the latest products so users can quickly return to items they viewed.
  const handleTrackedProduct = (product) => {
    trackRecentlyViewedProduct(product);
    setRecentProducts(getRecentlyViewedProducts());
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

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>
            Experience E-Commerce <span>Refined</span>
          </h1>
          <p>
            Welcome to ZenCart. A premium web experience built to demonstrate professional full-stack development, clean architecture, relational database design, and real-time dashboard metrics.
          </p>
          <div className="hero-buttons">
            <Link to="/products" className="btn-primary">
              Explore Products <ArrowRight size={18} />
            </Link>
            <Link to="/about" className="btn-outline">
              Architecture Details
            </Link>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-circle"></div>
          <img
            src="https://picsum.photos/600/500?random=50"
            alt="ZenCart E-Commerce Mockup"
            className="hero-img"
          />
        </div>
      </section>

      {/* Feature Badges */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', margin: '40px 0' }}>
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Truck size={36} color="var(--accent-primary)" />
          <div>
            <h4 style={{ fontWeight: '700' }}>Express Shipping</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Fast delivery straight to your door</p>
          </div>
        </div>
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <ShieldCheck size={36} color="var(--accent-primary)" />
          <div>
            <h4 style={{ fontWeight: '700' }}>Secure Payments</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Encrypted transaction gateways</p>
          </div>
        </div>
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <RotateCcw size={36} color="var(--accent-primary)" />
          <div>
            <h4 style={{ fontWeight: '700' }}>Easy Returns</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>30-day hassle-free refund policy</p>
          </div>
        </div>
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <HelpCircle size={36} color="var(--accent-primary)" />
          <div>
            <h4 style={{ fontWeight: '700' }}>24/7 Support</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Dedicated customer assistance</p>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section style={{ margin: '60px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '30px' }}>
          <div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '800' }}>Popular Products</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Our most liked items this week</p>
          </div>
          <Link to="/products" style={{ color: 'var(--accent-primary)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
            View All <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '24px' }}>
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="glass-panel" style={{ height: '350px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--accent-primary)', animation: 'spin 1s linear infinite' }} />
              </div>
            ))}
          </div>
        ) : (
          <div className="product-grid">
            {featuredProducts.map((product) => (
              <div key={product.id} onClick={() => handleTrackedProduct(product)}>
                <ProductCard
                  product={product}
                  onNotification={triggerToast}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {recentProducts.length > 0 && (
        <section style={{ margin: '60px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '24px' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Recently Viewed</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Pick up where you left off.</p>
            </div>
          </div>
          <div className="product-grid">
            {recentProducts.map((product) => (
              <Link key={product.id} to={`/products/${product.id}`} className="product-card glass-panel fade-in">
                <div className="card-image-wrapper">
                  <img src={product.image ? `http://localhost:5000${product.image}` : 'https://picsum.photos/400/400'} alt={product.name} className="card-image" loading="lazy" />
                </div>
                <div className="card-title">{product.name}</div>
                <div className="card-price">₹{parseFloat(product.price).toLocaleString('en-IN')}</div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
