import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/SEO';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { userInfo } = useAuth();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [activeImage, setActiveImage] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [qty, setQty] = useState(1);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [reviewError, setReviewError] = useState('');

  const fetchProduct = async () => {
    const { data } = await api.get(`/products/${id}`);
    setProduct(data);
    setSelectedSize(data.sizes?.[0]?.size || '');
    setSelectedColor(data.colors?.[0] || '');
  };

  const fetchReviews = async () => {
    const { data } = await api.get(`/products/${id}/reviews`);
    setReviews(data);
  };

  useEffect(() => {
    fetchProduct();
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!product) return <p style={{ padding: '56px', textAlign: 'center' }}>Loading...</p>;

  const sizeStock = product.sizes?.find((s) => s.size === selectedSize)?.countInStock || 0;
  const discount = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    addToCart(
      { ...product, image: product.images[0], selectedSize, selectedColor, cartKey: `${product._id}-${selectedSize}-${selectedColor}` },
      Number(qty)
    );
    navigate('/cart');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError('');
    try {
      await api.post(`/products/${id}/reviews`, reviewForm);
      setReviewForm({ rating: 5, comment: '' });
      fetchProduct();
      fetchReviews();
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Could not submit review');
    }
  };

  return (
    <div className="pd-wrap">
      <SEO
        title={product.name}
        description={product.description.slice(0, 155)}
        image={product.images[0]}
        url={window.location.href}
      />
      {/* Structured data: helps Google show price, availability, and rating directly in search results */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org/',
          '@type': 'Product',
          name: product.name,
          image: product.images,
          description: product.description,
          brand: { '@type': 'Brand', name: 'Reza Abaya' },
          offers: {
            '@type': 'Offer',
            priceCurrency: 'INR',
            price: product.price,
            availability:
              sizeStock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
          },
          ...(product.rating > 0 && {
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: product.rating,
              reviewCount: product.numReviews,
            },
          }),
        })}
      </script>

      <div className="pd-layout">
        <div>
          <div className="pd-image-zoom-wrap" onClick={() => setZoomOpen(true)}>
            <img src={product.images[activeImage]} alt={product.name} className="pd-main-image" />
            <span className="pd-zoom-hint">🔍 Click to zoom</span>
          </div>
          {product.images.length > 1 && (
            <div className="pd-thumbs">
              {product.images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={`${product.name} view ${i + 1}`}
                  onClick={() => setActiveImage(i)}
                  className={`pd-thumb ${activeImage === i ? 'active' : ''}`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="pd-info">
          <h2>{product.name}</h2>
          <p className="pd-category">{product.category} {product.fabric && `· ${product.fabric}`}</p>
          {product.rating > 0 && (
            <p className="pd-rating">★ {product.rating.toFixed(1)} ({product.numReviews} reviews)</p>
          )}
          <p className="pd-desc">{product.description}</p>

          <div className="pd-price-row">
            <h3>₹{product.price}</h3>
            {discount > 0 && (
              <>
                <span className="price-original">₹{product.compareAtPrice}</span>
                <span className="discount-badge">-{discount}%</span>
              </>
            )}
          </div>

          {product.colors?.length > 0 && (
            <div className="pd-field">
              <label>Color</label>
              <select value={selectedColor} onChange={(e) => setSelectedColor(e.target.value)}>
                {product.colors.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          )}

          {product.sizes?.length > 0 && (
            <div className="pd-field">
              <label>Size</label>
              <select value={selectedSize} onChange={(e) => setSelectedSize(e.target.value)}>
                {product.sizes.map((s) => (
                  <option key={s.size} value={s.size} disabled={s.countInStock === 0}>
                    {s.size} {s.countInStock === 0 ? '(Out of stock)' : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          <p className="pd-stock">{sizeStock > 0 ? `In Stock (${sizeStock})` : 'Out of Stock in this size'}</p>

          {sizeStock > 0 && (
            <>
              <div className="pd-field">
                <label>Qty</label>
                <select value={qty} onChange={(e) => setQty(e.target.value)}>
                  {[...Array(Math.min(sizeStock, 10)).keys()].map((x) => (
                    <option key={x + 1} value={x + 1}>{x + 1}</option>
                  ))}
                </select>
              </div>
              <button onClick={handleAddToCart} className="btn-primary">Add to Cart</button>
            </>
          )}
        </div>
      </div>

      <div className="pd-reviews">
        <h3>Customer Reviews ({reviews.length})</h3>
        {reviews.length === 0 && <p style={{ color: 'var(--color-ink-soft)' }}>No reviews yet — be the first!</p>}
        {reviews.map((r) => (
          <div key={r._id} className="review-item">
            <strong>{r.name}</strong> <span style={{ color: 'var(--color-gold)' }}>{'★'.repeat(r.rating)}</span>
            <p>{r.comment}</p>
          </div>
        ))}

        {userInfo ? (
          <form onSubmit={handleReviewSubmit} className="review-form">
            <h4>Write a Review</h4>
            {reviewError && <p className="auth-error">{reviewError}</p>}
            <label style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-ink-soft)' }}>Rating</label>
            <select
              value={reviewForm.rating}
              onChange={(e) => setReviewForm({ ...reviewForm, rating: e.target.value })}
              style={{ display: 'block', marginTop: '6px' }}
            >
              {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} Star{n > 1 ? 's' : ''}</option>)}
            </select>
            <textarea
              placeholder="Share your experience..."
              value={reviewForm.comment}
              onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
              required
              rows={3}
            />
            <button type="submit" className="btn-primary">Submit Review</button>
          </form>
        ) : (
          <p style={{ color: 'var(--color-ink-soft)' }}>Please log in to write a review.</p>
        )}
      </div>

      {zoomOpen && (
        <div className="pd-lightbox" onClick={() => setZoomOpen(false)}>
          <button className="pd-lightbox-close" onClick={() => setZoomOpen(false)}>✕</button>
          <img src={product.images[activeImage]} alt={product.name} className="pd-lightbox-image" />
          {product.images.length > 1 && (
            <div className="pd-lightbox-nav">
              <button
                onClick={(e) => { e.stopPropagation(); setActiveImage((activeImage - 1 + product.images.length) % product.images.length); }}
              >‹</button>
              <button
                onClick={(e) => { e.stopPropagation(); setActiveImage((activeImage + 1) % product.images.length); }}
              >›</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;