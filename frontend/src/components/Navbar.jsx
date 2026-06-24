import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, Heart, LogOut, BarChart2, Settings, User, Mail, Home, Info, Menu, Moon, Sun, Bell, X } from 'lucide-react';
import { getStoredTheme, requestNotificationPermission, setTheme, showAppNotification, subscribeToPushNotifications } from '../pwa';

export default function Navbar() {
  const { user, logout, cartCount, wishlistCount } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setThemeMode] = useState(getStoredTheme());
  const [installPrompt, setInstallPrompt] = useState(null);

  // Keep the install prompt available so the app can be installed from supported browsers.

  useEffect(() => {
    const handler = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const isActive = (path) => location.pathname === path;

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setThemeMode(nextTheme);
    setTheme(nextTheme);
  };

  const handleNotify = async () => {
    const permission = await requestNotificationPermission();
    if (permission === 'granted') {
      try {
        await subscribeToPushNotifications();
      } catch (error) {
        console.error('Push subscription setup failed:', error);
      }
      showAppNotification('ZenCart updates', { body: 'You will now get offers and order updates.' });
    }
  };

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  };

  return (
    <header>
      <div className="nav-container">
        <Link to="/" className="logo" onClick={() => setMenuOpen(false)}>
          <ShoppingBag size={24} />
          <span>ZenCart</span>
        </Link>

        <nav className={`nav-links ${menuOpen ? 'open' : ''}`}>
          <Link to="/" className={`nav-item ${isActive('/') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
            <Home size={16} /> Home
          </Link>
          <Link to="/products" className={`nav-item ${isActive('/products') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
            <ShoppingBag size={16} /> Products
          </Link>
          <Link to="/about" className={`nav-item ${isActive('/about') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
            <Info size={16} /> About
          </Link>
          <Link to="/contact" className={`nav-item ${isActive('/contact') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
            <Mail size={16} /> Contact
          </Link>
        </nav>

        <div className="nav-actions">
          <button className="icon-btn" onClick={toggleTheme} title="Toggle theme">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button className="icon-btn" onClick={handleNotify} title="Enable notifications">
            <Bell size={18} />
          </button>
          {installPrompt && (
            <button className="icon-btn" onClick={handleInstall} title="Install app">
              <ShoppingBag size={18} />
            </button>
          )}

          {user ? (
            <>
              {user.role === 'admin' && (
                <>
                  <Link to="/admin" className="icon-btn" title="Admin Control Panel" onClick={() => setMenuOpen(false)}>
                    <Settings size={20} />
                  </Link>
                  <Link to="/analytics" className="icon-btn" title="Analytics Dashboard" onClick={() => setMenuOpen(false)}>
                    <BarChart2 size={20} />
                  </Link>
                </>
              )}

              <Link to="/wishlist" className="icon-btn" title="Wishlist" onClick={() => setMenuOpen(false)}>
                <Heart size={20} />
                {wishlistCount > 0 && <span className="badge">{wishlistCount}</span>}
              </Link>

              <Link to="/cart" className="icon-btn" title="Shopping Cart" onClick={() => setMenuOpen(false)}>
                <ShoppingBag size={20} />
                {cartCount > 0 && <span className="badge">{cartCount}</span>}
              </Link>

              <div className="user-profile-nav">
                <Link to="/orders" className="icon-btn" title="Order History" onClick={() => setMenuOpen(false)}>
                  <User size={18} />
                  <span>{user.username}</span>
                </Link>
                <button onClick={() => { logout(); setMenuOpen(false); }} className="icon-btn" title="Logout" style={{ color: '#ef4444' }}>
                  <LogOut size={20} />
                </button>
              </div>
            </>
          ) : (
            <div className="auth-actions">
              <Link to="/login" className="btn-outline" onClick={() => setMenuOpen(false)}>
                Login
              </Link>
              <Link to="/register" className="btn-login" onClick={() => setMenuOpen(false)}>
                Register
              </Link>
            </div>
          )}

          <button className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation">
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
    </header>
  );
}
