import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/api';
import Toast from '../components/Toast';
import ProductCard from '../components/ProductCard';
import { useAuth } from '../context/AuthContext';
import { Heart } from 'lucide-react';

export default function Wishlist() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchWishlistItems();
  }, [user]);

  const fetchWishlistItems = async () => {
    setLoading(true);
    try {
      const res = await API.get('/wishlist');
      setItems(res.data);
    } catch (err) {
      console.error(err);
      setToast({ message: 'Failed to load wishlist items', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const triggerToast = (toastObj) => {
    setToast(toastObj);
    if (toastObj.message === 'Removed from wishlist') {
      fetchWishlistItems();
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: '16px' }}>
        <div style={{ width: '50px', height: '50px', borderRadius: '50%', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--accent-primary)', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Loading wishlist...</p>
      </div>
    );
  }

  return (
    <div className="fade-in">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <h1 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '8px' }}>My Wishlist</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>Your saved items that you would like to buy later</p>

      {items.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          <Heart size={64} color="var(--text-muted)" />
          <h3>Your wishlist is empty</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Explore products and click the heart icon to save products here.</p>
          <Link to="/products" className="btn-primary">
            Start Exploring
          </Link>
        </div>
      ) : (
        <div className="product-grid">
          {items.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onNotification={triggerToast}
              inWishlist={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}

