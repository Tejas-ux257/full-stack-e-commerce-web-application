import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/api';
import Toast from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart, CheckCircle, MapPin, CreditCard, ChevronRight } from 'lucide-react';

export default function Checkout() {
  const { user, updateCounts } = useAuth();
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchCartItems();
  }, [user]);

  const fetchCartItems = async () => {
    try {
      const res = await API.get('/cart');
      setCartItems(res.data.items);
      if (res.data.items.length === 0) {
        navigate('/cart');
      }
    } catch (err) {
      console.error(err);
      setToast({ message: 'Error loading checkout details', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!address.trim()) {
      setToast({ message: 'Please provide a shipping address', type: 'error' });
      return;
    }

    setCheckoutLoading(true);
    try {
      const res = await API.post('/orders/checkout', {
        shipping_address: address,
        payment_method: paymentMethod
      });
      updateCounts(); // Clear cart counters
      setToast({ message: 'Order placed successfully!', type: 'success' });
      
      // Delay redirection to let user see success toast
      setTimeout(() => {
        navigate('/orders');
      }, 1500);
    } catch (err) {
      console.error(err);
      setToast({ message: err.response?.data?.message || 'Checkout failed', type: 'error' });
    } finally {
      setCheckoutLoading(false);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((acc, item) => acc + (parseFloat(item.price) * item.quantity), 0);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: '16px' }}>
        <div style={{ width: '50px', height: '50px', borderRadius: '50%', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--accent-primary)', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Preparing checkout details...</p>
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

      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>
        <Link to="/cart">Cart</Link>
        <ChevronRight size={14} />
        <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>Checkout</span>
      </div>

      <h1 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '30px' }}>Shipping & Checkout</h1>

      <div className="checkout-layout">
        {/* Checkout Forms */}
        <form onSubmit={handleCheckout} className="glass-panel" style={{ padding: '30px', height: 'fit-content' }}>
          
          {/* Address Section */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', paddingBottom: '8px', borderBottom: '1px solid var(--glass-border)' }}>
            <MapPin size={20} color="var(--accent-primary)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Shipping Address</h3>
          </div>
          <div className="form-group">
            <label className="form-label">Full Address</label>
            <textarea
              className="form-input"
              rows="3"
              placeholder="House/Office No., Street, City, State, ZIP Code"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              style={{ resize: 'vertical' }}
            />
          </div>

          {/* Payment Section */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '30px', marginBottom: '16px', paddingBottom: '8px', borderBottom: '1px solid var(--glass-border)' }}>
            <CreditCard size={20} color="var(--accent-primary)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Payment Option</h3>
          </div>
          <div className="form-group">
            <label className="form-label">Choose Payment Method</label>
            <select
              className="form-input"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              style={{ appearance: 'none', cursor: 'pointer' }}
            >
              <option value="Cash on Delivery">Cash on Delivery (COD)</option>
              <option value="UPI / QR Payment">UPI / Net Banking (Mock)</option>
              <option value="Credit / Debit Card">Credit / Debit Card (Mock)</option>
            </select>
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '14px', marginTop: '30px' }}
            disabled={checkoutLoading}
          >
            {checkoutLoading ? 'Processing Order...' : <>Place Order Now <CheckCircle size={18} /></>}
          </button>
        </form>

        {/* Invoice Summary Side Panel */}
        <div className="glass-panel" style={{ padding: '24px', height: 'fit-content' }}>
          <h3 style={{ fontWeight: '700', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--glass-border)' }}>
            Items Summary ({cartItems.length})
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '250px', overflowY: 'auto', marginBottom: '20px', paddingRight: '4px' }}>
            {cartItems.map((item) => (
              <div key={item.product_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' }}>
                  {item.name} <strong style={{ color: 'var(--text-primary)' }}>x{item.quantity}</strong>
                </span>
                <span style={{ fontWeight: '600' }}>
                  ₹{(parseFloat(item.price) * item.quantity).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="summary-row" style={{ marginBottom: 0 }}>
              <span>Subtotal</span>
              <span>₹{calculateTotal().toLocaleString('en-IN')}</span>
            </div>
            <div className="summary-row" style={{ marginBottom: 0 }}>
              <span>Delivery Charges</span>
              <span style={{ color: 'var(--success)', fontWeight: '600' }}>FREE</span>
            </div>
            <div className="summary-row summary-total" style={{ margin: 0, padding: 0, border: 'none' }}>
              <span>Final Total</span>
              <span style={{ color: 'var(--text-primary)', fontSize: '1.3rem', fontWeight: '800' }}>
                ₹{calculateTotal().toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
