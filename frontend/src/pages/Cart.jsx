import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/api';
import Toast from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import { Trash2, ArrowRight, ShoppingBag, Plus, Minus } from 'lucide-react';

export default function Cart() {
  const { user, updateCounts } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchCartItems();
  }, [user]);

  const fetchCartItems = async () => {
    setLoading(true);
    try {
      const res = await API.get('/cart');
      setItems(res.data.items);
    } catch (err) {
      console.error(err);
      setToast({ message: 'Failed to load shopping cart', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityUpdate = async (productId, currentQty, stock, increment) => {
    let newQty = increment ? currentQty + 1 : currentQty - 1;
    if (newQty <= 0) return;
    if (newQty > stock) {
      setToast({ message: `Only ${stock} items available in stock`, type: 'error' });
      return;
    }

    try {
      await API.put('/cart/update', { product_id: productId, quantity: newQty });
      setItems(items.map(item => item.product_id === productId ? { ...item, quantity: newQty } : item));
      updateCounts();
    } catch (err) {
      console.error(err);
      setToast({ message: 'Failed to update quantity', type: 'error' });
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      await API.delete(`/cart/remove/${productId}`);
      setItems(items.filter(item => item.product_id !== productId));
      updateCounts();
      setToast({ message: 'Removed from cart', type: 'success' });
    } catch (err) {
      console.error(err);
      setToast({ message: 'Failed to remove item', type: 'error' });
    }
  };

  const handleClearCart = async () => {
    try {
      await API.delete('/cart/clear');
      setItems([]);
      updateCounts();
      setToast({ message: 'Cart cleared', type: 'success' });
    } catch (err) {
      console.error(err);
      setToast({ message: 'Failed to clear cart', type: 'error' });
    }
  };

  const getImageUrl = (imagePath, productId) => {
    if (!imagePath) return 'https://picsum.photos/400/400?random=' + productId;
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:5000${imagePath}`;
  };

  const calculateSubtotal = () => {
    return items.reduce((acc, item) => acc + (parseFloat(item.price) * item.quantity), 0);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: '16px' }}>
        <div style={{ width: '50px', height: '50px', borderRadius: '50%', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--accent-primary)', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Loading cart...</p>
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

      <h1 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '8px' }}>Shopping Cart</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>Manage items in your shopping cart before checkout</p>

      {items.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          <ShoppingBag size={64} color="var(--text-muted)" />
          <h3>Your cart is empty</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Looks like you haven't added anything to your cart yet.</p>
          <Link to="/products" className="btn-primary">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          {/* Items Panel */}
          <div className="cart-items-panel glass-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid var(--glass-border)' }}>
              <h3 style={{ fontWeight: '700' }}>Cart Items ({items.length})</h3>
              <button
                onClick={handleClearCart}
                className="btn-outline"
                style={{ padding: '6px 12px', fontSize: '0.8rem', borderColor: 'var(--danger)', color: 'var(--danger)' }}
              >
                Clear Cart
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {items.map((item) => (
                <div key={item.product_id} className="cart-item-row">
                  <img
                    src={getImageUrl(item.primary_image, item.product_id)}
                    alt={item.name}
                    className="cart-item-img"
                  />
                  
                  <div className="cart-item-details">
                    <Link to={`/products/${item.product_id}`} className="cart-item-name hover-underline">
                      {item.name}
                    </Link>
                    <div className="cart-item-price">₹{parseFloat(item.price).toLocaleString('en-IN')}</div>
                  </div>

                  {/* Quantity controls */}
                  <div className="qty-selector" style={{ margin: '0 20px' }}>
                    <button
                      className="qty-btn"
                      onClick={() => handleQuantityUpdate(item.product_id, item.quantity, item.stock, false)}
                      disabled={item.quantity <= 1}
                    >
                      <Minus size={14} />
                    </button>
                    <span className="qty-value">{item.quantity}</span>
                    <button
                      className="qty-btn"
                      onClick={() => handleQuantityUpdate(item.product_id, item.quantity, item.stock, true)}
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  {/* Subtotal & Action */}
                  <div style={{ width: '120px', textAlign: 'right', fontWeight: '700' }}>
                    ₹{(parseFloat(item.price) * item.quantity).toLocaleString('en-IN')}
                  </div>

                  <button
                    onClick={() => handleRemoveItem(item.product_id)}
                    className="icon-btn"
                    style={{ color: 'var(--danger)', marginLeft: '10px' }}
                    title="Remove from Cart"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Summary Panel */}
          <div className="cart-summary-panel glass-panel">
            <h3 style={{ fontWeight: '700', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid var(--glass-border)' }}>
              Order Summary
            </h3>

            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{calculateSubtotal().toLocaleString('en-IN')}</span>
            </div>
            
            <div className="summary-row">
              <span>Shipping</span>
              <span style={{ color: 'var(--success)', fontWeight: '600' }}>FREE</span>
            </div>

            <div className="summary-row summary-total">
              <span>Total</span>
              <span>₹{calculateSubtotal().toLocaleString('en-IN')}</span>
            </div>

            <Link
              to="/checkout"
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', marginTop: '24px', padding: '14px' }}
            >
              Proceed to Checkout <ArrowRight size={18} />
            </Link>

            <Link
              to="/products"
              className="btn-outline"
              style={{ width: '100%', justifyContent: 'center', marginTop: '12px', padding: '14px', display: 'block', textAlign: 'center' }}
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
