import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, Heart, LogOut, BarChart2, Settings, User, Mail, Home, Info } from 'lucide-react';

export default function Navbar() {
  const { user, logout, cartCount, wishlistCount } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header>
      <div className="nav-container">
        <Link to="/" className="logo">
          <ShoppingBag size={24} />
          <span>ZenCart</span>
        </Link>

        <nav>
          <ul className="nav-links">
            <li>
              <Link to="/" className={`nav-item ${isActive('/') ? 'active' : ''}`}>
                <Home size={16} /> Home
              </Link>
            </li>
            <li>
              <Link to="/products" className={`nav-item ${isActive('/products') ? 'active' : ''}`}>
                <ShoppingBag size={16} /> Products
              </Link>
            </li>
            <li>
              <Link to="/about" className={`nav-item ${isActive('/about') ? 'active' : ''}`}>
                <Info size={16} /> About
              </Link>
            </li>
            <li>
              <Link to="/contact" className={`nav-item ${isActive('/contact') ? 'active' : ''}`}>
                <Mail size={16} /> Contact
              </Link>
            </li>
          </ul>
        </nav>

        <div className="nav-actions">
          {user ? (
            <>
              {user.role === 'admin' && (
                <>
                  <Link to="/admin" className="icon-btn" title="Admin Control Panel">
                    <Settings size={20} />
                  </Link>
                  <Link to="/analytics" className="icon-btn" title="Analytics Dashboard">
                    <BarChart2 size={20} />
                  </Link>
                </>
              )}

              <Link to="/wishlist" className="icon-btn" title="Wishlist">
                <Heart size={20} />
                {wishlistCount > 0 && <span className="badge">{wishlistCount}</span>}
              </Link>

              <Link to="/cart" className="icon-btn" title="Shopping Cart">
                <ShoppingBag size={20} />
                {cartCount > 0 && <span className="badge">{cartCount}</span>}
              </Link>

              <div className="user-profile-nav" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Link to="/orders" className="icon-btn" title="Order History" style={{ gap: '6px', fontSize: '0.9rem' }}>
                  <User size={18} />
                  <span>{user.username}</span>
                </Link>
                
                <button onClick={logout} className="icon-btn" title="Logout" style={{ color: '#ef4444' }}>
                  <LogOut size={20} />
                </button>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '10px' }}>
              <Link to="/login" className="btn-outline" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
                Login
              </Link>
              <Link to="/register" className="btn-login" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
