import { createContext, useState, useEffect, useContext } from 'react';
import API from '../api/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  // Configure Axios default header
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUserProfile();
      fetchCartAndWishlistCount();
    } else {
      localStorage.removeItem('token');
      delete API.defaults.headers.common['Authorization'];
      setUser(null);
      setCartCount(0);
      setWishlistCount(0);
      setLoading(false);
    }
  }, [token]);

  const fetchUserProfile = async () => {
    try {
      const res = await API.get('/auth/profile');
      setUser(res.data.user);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const fetchCartAndWishlistCount = async () => {
    try {
      const [cartRes, wishlistRes] = await Promise.all([
        API.get('/cart'),
        API.get('/wishlist')
      ]);
      
      const totalCartQty = cartRes.data.items.reduce((acc, item) => acc + item.quantity, 0);
      setCartCount(totalCartQty);
      setWishlistCount(wishlistRes.data.length);
    } catch (error) {
      console.error('Error fetching cart/wishlist counters:', error);
    }
  };

  const login = async (email, password) => {
    const res = await API.post('/auth/login', { email, password });
    setToken(res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  const register = async (username, email, password) => {
    const res = await API.post('/auth/register', { username, email, password });
    setToken(res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = () => {
    setToken('');
    setUser(null);
  };

  const updateCounts = () => {
    if (token) {
      fetchCartAndWishlistCount();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        cartCount,
        wishlistCount,
        login,
        register,
        logout,
        updateCounts
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
