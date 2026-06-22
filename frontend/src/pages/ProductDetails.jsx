import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/api';
import Toast from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import { Heart, ShoppingCart, ThumbsUp, Star, ArrowLeft } from 'lucide-react';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, updateCounts } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isLiking, setIsLiking] = useState(false);
  const [likes, setLikes] = useState(0);

  // Review Form state
  const [ratingInput, setRatingInput] = useState(5);
  const [reviewInput, setReviewInput] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  const fetchProductDetails = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/products/${id}`);
      setProduct(res.data);
      setLikes(res.data.likes);
      
      // Set primary image first
      if (res.data.images && res.data.images.length > 0) {
        const primary = res.data.images.find(img => img.is_primary) || res.data.images[0];
        setActiveImage(primary.image_url);
      } else {
        setActiveImage('https://picsum.photos/400/400?random=' + res.data.id);
      }
    } catch (err) {
      console.error(err);
      setToast({ message: 'Failed to load product details', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);
    try {
      const res = await API.post(`/products/like/${product.id}`);
      setLikes(res.data.likes);
      setToast({ message: 'Liked product!', type: 'success' });
    } catch (err) {
      console.error(err);
    } finally {
      setIsLiking(false);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      setToast({ message: 'Please login to add items to cart', type: 'error' });
      return;
    }
    if (quantity > product.stock) {
      setToast({ message: `Only ${product.stock} items available in stock.`, type: 'error' });
      return;
    }
    try {
      await API.post('/cart/add', { product_id: product.id, quantity });
      updateCounts();
      setToast({ message: 'Product added to cart!', type: 'success' });
    } catch (err) {
      console.error(err);
      setToast({ message: err.response?.data?.message || 'Failed to add item to cart', type: 'error' });
    }
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!reviewInput.trim()) {
      setToast({ message: 'Please write a review message', type: 'error' });
      return;
    }

    setReviewLoading(true);
    try {
      await API.post('/reviews', {
        product_id: product.id,
        review: reviewInput,
        rating: ratingInput
      });
      setToast({ message: 'Review added successfully!', type: 'success' });
      setReviewInput('');
      setRatingInput(5);
      fetchProductDetails(); // Reload reviews list
    } catch (err) {
      console.error(err);
      setToast({ message: 'Failed to save review', type: 'error' });
    } finally {
      setReviewLoading(false);
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:5000${imagePath}`;
  };

  const renderStars = (ratingVal, interactive = false) => {
    const stars = [];
    const val = Math.floor(ratingVal);
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          size={interactive ? 24 : 14}
          fill={i <= val ? '#f59e0b' : 'none'}
          color={i <= val ? '#f59e0b' : '#64748b'}
          className={interactive ? 'star-input' : ''}
          onClick={interactive ? () => setRatingInput(i) : undefined}
          style={interactive ? { cursor: 'pointer', color: i <= ratingInput ? '#f59e0b' : '#64748b' } : undefined}
        />
      );
    }
    return stars;
  };

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: '16px' }}>
        <div style={{ width: '50px', height: '50px', borderRadius: '50%', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--accent-primary)', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Loading details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="glass-panel" style={{ padding: '60px', textAlign: 'center' }}>
        <h2>Product Not Found</h2>
        <button className="btn-primary" onClick={() => navigate('/products')} style={{ marginTop: '20px' }}>
          Back to Catalog
        </button>
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

      <button onClick={() => navigate(-1)} className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', marginBottom: '20px' }}>
        <ArrowLeft size={16} /> Back
      </button>

      <div className="details-container">
        {/* Gallery */}
        <div className="details-gallery">
          <div className="main-image-wrapper">
            <img src={getImageUrl(activeImage)} alt={product.name} className="main-image" />
          </div>
          
          {product.images && product.images.length > 1 && (
            <div className="thumbnails-row">
              {product.images.map((img) => (
                <button
                  key={img.id}
                  className={`thumbnail-btn ${activeImage === img.image_url ? 'active' : ''}`}
                  onClick={() => setActiveImage(img.image_url)}
                >
                  <img src={getImageUrl(img.image_url)} alt="thumbnail" className="thumbnail-img" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info Column */}
        <div className="details-info">
          <span className="card-category" style={{ fontSize: '0.85rem' }}>{product.category_name || 'General'}</span>
          <h1 className="details-title">{product.name}</h1>
          
          <div className="rating-row" style={{ fontSize: '1rem', marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '3px' }}>{renderStars(product.average_rating)}</div>
            <span style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>
              {parseFloat(product.average_rating).toFixed(1)} / 5.0
            </span>
            <span style={{ color: 'var(--text-muted)' }}>
              ({product.reviews_count} reviews)
            </span>
          </div>

          <div className="details-price">₹{parseFloat(product.price).toLocaleString('en-IN')}</div>
          
          <div className="details-desc">{product.description || 'No description available for this item.'}</div>

          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '30px' }}>
            <span style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Availability:</span>
            {product.stock > 0 ? (
              <span className="badge-status badge-delivered" style={{ textTransform: 'none' }}>
                {product.stock} Units in stock
              </span>
            ) : (
              <span className="badge-status badge-cancelled" style={{ textTransform: 'none' }}>
                Out of Stock
              </span>
            )}
          </div>

          {product.stock > 0 && (
            <div className="details-actions">
              <div className="qty-selector">
                <button className="qty-btn" onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
                <span className="qty-value">{quantity}</span>
                <button className="qty-btn" onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}>+</button>
              </div>

              <button className="btn-primary" onClick={handleAddToCart} style={{ flex: 1, justifyContent: 'center' }}>
                <ShoppingCart size={18} /> Add to Cart
              </button>

              <button className="btn-outline" onClick={handleLike} disabled={isLiking} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ThumbsUp size={16} /> <span>{likes}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      <section className="reviews-container">
        <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '30px' }}>Customer Reviews</h2>

        <div className="reviews-header-grid">
          {/* Average statistics card */}
          <div className="average-score-card glass-panel">
            <div className="avg-score">{parseFloat(product.average_rating).toFixed(1)}</div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginBottom: '8px' }}>
              {renderStars(product.average_rating)}
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Based on {product.reviews_count} reviews</p>
          </div>

          {/* Review write card */}
          <div className="review-form-card glass-panel">
            <h4 style={{ fontWeight: '700', marginBottom: '14px' }}>Write a Review</h4>
            <form onSubmit={handleAddReview}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Your Rating:</span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={24}
                      fill={star <= ratingInput ? '#f59e0b' : 'none'}
                      color={star <= ratingInput ? '#f59e0b' : '#64748b'}
                      onClick={() => setRatingInput(star)}
                      style={{ cursor: 'pointer' }}
                    />
                  ))}
                </div>
              </div>

              <div className="form-group">
                <textarea
                  className="form-input"
                  rows="3"
                  placeholder="Share your thoughts about this product..."
                  value={reviewInput}
                  onChange={(e) => setReviewInput(e.target.value)}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <button type="submit" className="btn-primary" style={{ padding: '10px 20px', fontSize: '0.9rem' }} disabled={reviewLoading}>
                {reviewLoading ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>
        </div>

        {/* Reviews List */}
        <div className="reviews-list">
          {product.reviews && product.reviews.length === 0 ? (
            <div className="glass-panel" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No reviews yet. Be the first to share your thoughts!
            </div>
          ) : (
            product.reviews.map((r) => (
              <div key={r.id} className="review-item glass-panel fade-in">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div>
                    <span className="review-author">{r.reviewer_name}</span>
                    <span className="review-date">{new Date(r.created_at).toLocaleDateString()}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '2px' }}>
                    {renderStars(r.rating)}
                  </div>
                </div>
                <div className="review-text">{r.review}</div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
