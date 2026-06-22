import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/api';
import Toast from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, Eye, X, ClipboardList } from 'lucide-react';

export default function Orders() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    try {
      const res = await API.get('/orders/my-orders');
      setOrders(res.data);
    } catch (err) {
      console.error(err);
      setToast({ message: 'Failed to load order history', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (orderId) => {
    setDetailLoading(true);
    try {
      const res = await API.get(`/orders/detail/${orderId}`);
      setSelectedOrder(res.data);
    } catch (err) {
      console.error(err);
      setToast({ message: 'Failed to load order details', type: 'error' });
    } finally {
      setDetailLoading(false);
    }
  };

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'badge-pending';
      case 'processing': return 'badge-processing';
      case 'shipped': return 'badge-shipped';
      case 'delivered': return 'badge-delivered';
      case 'cancelled': return 'badge-cancelled';
      default: return '';
    }
  };

  const getImageUrl = (imagePath, productId) => {
    if (!imagePath) return 'https://picsum.photos/100/100?random=' + productId;
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:5000${imagePath}`;
  };

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: '16px' }}>
        <div style={{ width: '50px', height: '50px', borderRadius: '50%', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--accent-primary)', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Loading orders history...</p>
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

      <h1 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '8px' }}>Order History</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>Track shipment updates and review past order transactions</p>

      {orders.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          <ClipboardList size={64} color="var(--text-muted)" />
          <h3>No orders placed yet</h3>
          <p style={{ color: 'var(--text-secondary)' }}>You haven't placed any orders yet on this account.</p>
          <button className="btn-primary" onClick={() => navigate('/products')}>
            View Product Catalog
          </button>
        </div>
      ) : (
        <div className="glass-panel table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Total Amount</th>
                <th>Payment Option</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td><strong>#{o.id}</strong></td>
                  <td>{new Date(o.created_at).toLocaleDateString()}</td>
                  <td>₹{parseFloat(o.total_amount).toLocaleString('en-IN')}</td>
                  <td>{o.payment_method}</td>
                  <td>
                    <span className={`badge-status ${getStatusClass(o.status)}`}>
                      {o.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="btn-outline"
                      onClick={() => handleViewDetails(o.id)}
                      style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Eye size={12} /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Details Modal */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Order Details #{selectedOrder.id}</h3>
              <button className="modal-close-btn" onClick={() => setSelectedOrder(null)}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '0.9rem' }}>
                <div>
                  <div style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>Date Placed</div>
                  <strong style={{ color: 'var(--text-primary)' }}>{new Date(selectedOrder.created_at).toLocaleString()}</strong>
                </div>
                <div>
                  <div style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>Current Status</div>
                  <span className={`badge-status ${getStatusClass(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                </div>
                <div>
                  <div style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>Payment Mode</div>
                  <strong style={{ color: 'var(--text-primary)' }}>{selectedOrder.payment_method}</strong>
                </div>
                <div>
                  <div style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>Billing Amount</div>
                  <strong style={{ color: 'var(--text-primary)', fontSize: '1.1rem' }}>
                    ₹{parseFloat(selectedOrder.total_amount).toLocaleString('en-IN')}
                  </strong>
                </div>
              </div>

              <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '6px' }}>Shipping Destination</div>
                <div className="glass-panel" style={{ padding: '12px', fontSize: '0.85rem', background: 'rgba(0,0,0,0.15)' }}>
                  {selectedOrder.shipping_address}
                </div>
              </div>

              <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '10px' }}>Items Summary</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {selectedOrder.items && selectedOrder.items.map((item) => (
                    <div key={item.id} style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                      <img
                        src={getImageUrl(item.primary_image, item.product_id)}
                        alt={item.name}
                        style={{ width: '45px', height: '45px', objectFit: 'cover', borderRadius: '6px', background: '#151a28' }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>{item.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          ₹{parseFloat(item.price).toLocaleString('en-IN')} x {item.quantity}
                        </div>
                      </div>
                      <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>
                        ₹{(parseFloat(item.price) * item.quantity).toLocaleString('en-IN')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
