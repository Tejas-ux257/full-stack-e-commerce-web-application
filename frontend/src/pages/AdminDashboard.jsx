import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/api';
import Toast from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import { Settings, Package, Layers, FileText, Clipboard, Plus, Trash2, Edit2, X, Upload } from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('products'); // products, categories, orders, contacts
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [contacts, setContacts] = useState([]);

  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // null = creating
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    stock: ''
  });
  const [selectedImages, setSelectedImages] = useState([]);

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    loadTabData();
  }, [user, activeTab]);

  const loadTabData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'products') {
        const res = await API.get('/products?limit=50');
        setProducts(res.data.products);
        
        const catRes = await API.get('/categories');
        setCategories(catRes.data);
      } else if (activeTab === 'categories') {
        const res = await API.get('/categories');
        setCategories(res.data);
      } else if (activeTab === 'orders') {
        const res = await API.get('/orders/all');
        setOrders(res.data);
      } else if (activeTab === 'contacts') {
        const res = await API.get('/contacts');
        setContacts(res.data);
      }
    } catch (err) {
      console.error(err);
      setToast({ message: 'Error loading dashboard data', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    if (!categoryForm.name) return;
    try {
      await API.post('/categories', categoryForm);
      setToast({ message: 'Category added successfully!', type: 'success' });
      setCategoryForm({ name: '', description: '' });
      setShowCategoryModal(false);
      loadTabData();
    } catch (err) {
      console.error(err);
      setToast({ message: err.response?.data?.message || 'Failed to add category', type: 'error' });
    }
  };

  const handleCategoryDelete = async (id) => {
    if (!window.confirm('Delete category? Products in this category will be set to General.')) return;
    try {
      await API.delete(`/categories/${id}`);
      setToast({ message: 'Category deleted', type: 'success' });
      loadTabData();
    } catch (err) {
      console.error(err);
      setToast({ message: 'Failed to delete category', type: 'error' });
    }
  };

  const openProductCreate = () => {
    setEditingProduct(null);
    setProductForm({ name: '', description: '', price: '', category_id: '', stock: '20' });
    setSelectedImages([]);
    setShowProductModal(true);
  };

  const openProductEdit = (p) => {
    setEditingProduct(p);
    setProductForm({
      name: p.name,
      description: p.description || '',
      price: p.price,
      category_id: p.category_id || '',
      stock: p.stock
    });
    setSelectedImages([]);
    setShowProductModal(true);
  };

  const handleProductImageChange = (e) => {
    setSelectedImages(Array.from(e.target.files));
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    if (!productForm.name || !productForm.price) {
      setToast({ message: 'Name and Price are required', type: 'error' });
      return;
    }

    const formData = new FormData();
    formData.append('name', productForm.name);
    formData.append('description', productForm.description);
    formData.append('price', productForm.price);
    formData.append('category_id', productForm.category_id);
    formData.append('stock', productForm.stock);
    
    selectedImages.forEach((img) => {
      formData.append('images', img);
    });

    try {
      if (editingProduct) {
        await API.put(`/products/${editingProduct.id}`, formData);
        setToast({ message: 'Product updated successfully!', type: 'success' });
      } else {
        await API.post('/products', formData);
        setToast({ message: 'Product created successfully!', type: 'success' });
      }
      setShowProductModal(false);
      loadTabData();
    } catch (err) {
      console.error(err);
      setToast({ message: 'Failed to save product details', type: 'error' });
    }
  };

  const handleProductDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await API.delete(`/products/${id}`);
      setToast({ message: 'Product deleted successfully', type: 'success' });
      loadTabData();
    } catch (err) {
      console.error(err);
      setToast({ message: 'Failed to delete product', type: 'error' });
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await API.put(`/orders/status/${orderId}`, { status: newStatus });
      setToast({ message: `Order #${orderId} status updated to ${newStatus}`, type: 'success' });
      loadTabData();
    } catch (err) {
      console.error(err);
      setToast({ message: 'Failed to update order status', type: 'error' });
    }
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

      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '30px' }}>
        <Settings size={36} color="var(--accent-primary)" />
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: '800' }}>Admin Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage catalog products, edit categories, track client invoices and read contact forms</p>
        </div>
      </div>

      <div className="admin-layout">
        {/* Admin Navigation */}
        <nav className="admin-nav glass-panel">
          <button className={`admin-nav-item ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>
            <Package size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Products CRUD
          </button>
          <button className={`admin-nav-item ${activeTab === 'categories' ? 'active' : ''}`} onClick={() => setActiveTab('categories')}>
            <Layers size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Categories CRUD
          </button>
          <button className={`admin-nav-item ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
            <Clipboard size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Customer Orders
          </button>
          <button className={`admin-nav-item ${activeTab === 'contacts' ? 'active' : ''}`} onClick={() => setActiveTab('contacts')}>
            <FileText size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Contact Submissions
          </button>
        </nav>

        {/* Dashboard Content area */}
        <section className="admin-content">
          
          {/* Tab 1: Products */}
          {activeTab === 'products' && (
            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontWeight: '700' }}>Products Inventory ({products.length})</h3>
                <button className="btn-primary" onClick={openProductCreate}>
                  <Plus size={16} /> Create Product
                </button>
              </div>

              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
              ) : (
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Product ID</th>
                        <th>Name</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Category</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((p) => (
                        <tr key={p.id}>
                          <td>#{p.id}</td>
                          <td><strong>{p.name}</strong></td>
                          <td>₹{parseFloat(p.price).toLocaleString('en-IN')}</td>
                          <td>{p.stock} units</td>
                          <td>{p.category_name || 'General'}</td>
                          <td style={{ textAlign: 'right' }}>
                            <button className="icon-btn" onClick={() => openProductEdit(p)} style={{ color: 'var(--accent-primary)', display: 'inline-flex', marginRight: '10px' }} title="Edit Product">
                              <Edit2 size={16} />
                            </button>
                            <button className="icon-btn" onClick={() => handleProductDelete(p.id)} style={{ color: 'var(--danger)', display: 'inline-flex' }} title="Delete Product">
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Categories */}
          {activeTab === 'categories' && (
            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontWeight: '700' }}>Categories Index ({categories.length})</h3>
                <button className="btn-primary" onClick={() => setShowCategoryModal(true)}>
                  <Plus size={16} /> Add Category
                </button>
              </div>

              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
              ) : (
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Category ID</th>
                        <th>Name</th>
                        <th>Description</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map((c) => (
                        <tr key={c.id}>
                          <td>#{c.id}</td>
                          <td><strong>{c.name}</strong></td>
                          <td>{c.description || 'No description provided'}</td>
                          <td style={{ textAlign: 'right' }}>
                            <button className="icon-btn" onClick={() => handleCategoryDelete(c.id)} style={{ color: 'var(--danger)', display: 'inline-flex' }} title="Delete Category">
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Customer Orders */}
          {activeTab === 'orders' && (
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ fontWeight: '700', marginBottom: '20px' }}>System Customer Orders ({orders.length})</h3>
              
              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
              ) : (
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Date</th>
                        <th>Total Amount</th>
                        <th>Status</th>
                        <th style={{ textAlign: 'right' }}>Update Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((o) => (
                        <tr key={o.id}>
                          <td><strong>#{o.id}</strong></td>
                          <td>
                            <div>{o.customer_name}</div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{o.customer_email}</span>
                          </td>
                          <td>{new Date(o.created_at).toLocaleDateString()}</td>
                          <td>₹{parseFloat(o.total_amount).toLocaleString('en-IN')}</td>
                          <td>
                            <span className={`badge-status badge-${o.status.toLowerCase()}`}>{o.status}</span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <select
                              value={o.status}
                              onChange={(e) => handleStatusChange(o.id, e.target.value)}
                              className="form-input"
                              style={{ display: 'inline-block', width: '130px', margin: 0, padding: '4px 8px', fontSize: '0.8rem', height: 'auto', background: 'rgba(0,0,0,0.4)', borderColor: 'var(--glass-border)' }}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Processing">Processing</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Contact Submissions */}
          {activeTab === 'contacts' && (
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ fontWeight: '700', marginBottom: '20px' }}>Contact Form Messages ({contacts.length})</h3>

              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
              ) : contacts.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '20px' }}>No messages submitted yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {contacts.map((msg) => (
                    <div key={msg.id} className="glass-panel" style={{ padding: '20px', background: 'rgba(0,0,0,0.15)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                        <div>
                          <strong>{msg.name}</strong> ({msg.email})
                        </div>
                        <span style={{ color: 'var(--text-muted)' }}>{new Date(msg.created_at).toLocaleString()}</span>
                      </div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{msg.message}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </section>
      </div>

      {/* Product CRUD Modal */}
      {showProductModal && (
        <div className="modal-overlay" onClick={() => setShowProductModal(false)}>
          <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingProduct ? 'Edit Product' : 'Create Product'}</h3>
              <button className="modal-close-btn" onClick={() => setShowProductModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleProductSubmit}>
              <div className="form-group">
                <label className="form-label">Product Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-input"
                  rows="3"
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Price (₹) *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Stock Units</label>
                  <input
                    type="number"
                    className="form-input"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-input"
                  value={productForm.category_id}
                  onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })}
                >
                  <option value="">General</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label">Product Images (Upload up to 5)</label>
                <div className="glass-panel" style={{ borderStyle: 'dashed', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', background: 'rgba(0,0,0,0.1)' }}>
                  <Upload size={24} color="var(--text-secondary)" />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Click to browse files</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleProductImageChange}
                    style={{ fontSize: '0.8rem', cursor: 'pointer' }}
                  />
                  {selectedImages.length > 0 && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--success)', fontWeight: '600' }}>
                      {selectedImages.length} files selected
                    </span>
                  )}
                </div>
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                {editingProduct ? 'Update Product' : 'Create Product'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Category Add Modal */}
      {showCategoryModal && (
        <div className="modal-overlay" onClick={() => setShowCategoryModal(false)}>
          <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Add New Category</h3>
              <button className="modal-close-btn" onClick={() => setShowCategoryModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCategorySubmit}>
              <div className="form-group">
                <label className="form-label">Category Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-input"
                  rows="3"
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                />
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                Create Category
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

