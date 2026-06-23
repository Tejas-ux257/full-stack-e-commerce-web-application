import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, ThumbsUp, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API from '../api/api';

export default function ProductCard({ product, onNotification, inWishlist: initialInWishlist = false }) {
  const { user, updateCounts } = useAuth();
  const [likes, setLikes] = useState(product.likes || 0);
  const [isLiking, setIsLiking] = useState(false);
  const [inWishlist, setInWishlist] = useState(initialInWishlist);

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isLiking) return;
    setIsLiking(true);
    try {
      const res = await API.post(`/products/like/${product.id}`);
      setLikes(res.data.likes);
      if (onNotification) onNotification({ message: 'Product liked!', type: 'success' });
    } catch (err) {
      console.error(err);
    } finally {
      setIsLiking(false);
    }
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      if (onNotification) onNotification({ message: 'Please login to add items to cart', type: 'error' });
      return;
    }
    try {
      await API.post('/cart/add', { product_id: product.id, quantity: 1 });
      updateCounts();
      if (onNotification) onNotification({ message: `Added ${product.name} to cart!`, type: 'success' });
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || 'Failed to add item to cart';
      if (onNotification) onNotification({ message: errMsg, type: 'error' });
    }
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      if (onNotification) onNotification({ message: 'Please login to manage wishlist', type: 'error' });
      return;
    }
    try {
      if (inWishlist) {
        await API.delete(`/wishlist/remove/${product.id}`);
        setInWishlist(false);
        if (onNotification) onNotification({ message: 'Removed from wishlist', type: 'success' });
      } else {
        await API.post('/wishlist/add', { product_id: product.id });
        setInWishlist(true);
        if (onNotification) onNotification({ message: 'Added to wishlist!', type: 'success' });
      }
      updateCounts();
    } catch (err) {
      console.error(err);
      if (onNotification) onNotification({ message: 'Failed to update wishlist', type: 'error' });
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://picsum.photos/400/400?random=' + product.id;
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:5000${imagePath}`;
  };

  const renderStars = (rating) => {
    const stars = [];
    const floorRating = Math.floor(rating);
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          size={14}
          fill={i <= floorRating ? '#f59e0b' : 'none'}
          color={i <= floorRating ? '#f59e0b' : '#64748b'}
        />
      );
    }
    return stars;
  };

  return (
    <Link to={`/products/${product.id}`} className="product-card glass-panel fade-in">
      <div className="card-image-wrapper">
        <img
          src={getImageUrl(product.primary_image)}
          alt={product.name}
          className="card-image"
          loading="lazy"
        />
        <button
          className={`wishlist-heart-btn ${inWishlist ? 'active' : ''}`}
          onClick={handleWishlist}
          title={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart size={16} fill={inWishlist ? '#ef4444' : 'none'} />
        </button>
      </div>

      <div className="card-category">{product.category_name || 'General'}</div>
      <h3 className="card-title" title={product.name}>{product.name}</h3>

      <div className="rating-row">
        <div className="stars-container">{renderStars(product.average_rating)}</div>
        <span style={{ color: 'var(--text-secondary)' }}>
          ({product.reviews_count || 0})
        </span>
      </div>

      <div className="card-price-row">
        <div className="card-price">₹{parseFloat(product.price).toLocaleString('en-IN')}</div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button className="card-likes" onClick={handleLike} disabled={isLiking}>
            <ThumbsUp size={14} />
            <span>{likes}</span>
          </button>
          
          <button
            className="btn-add-cart"
            onClick={handleAddToCart}
            title="Add to Cart"
          >
            <ShoppingCart size={16} />
          </button>
        </div>
      </div>
    </Link>
  );
}

