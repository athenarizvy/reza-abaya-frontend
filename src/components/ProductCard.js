import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
  const discount = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  return (
    <Link to={`/product/${product._id}`} className="product-card">
      <div className="product-card-image-wrap">
        <img src={product.images?.[0]} alt={product.name} className="product-card-image" />
        <div className="product-card-overlay">
          <span>View Details</span>
        </div>
      </div>
      <div className="product-card-body">
        <p className="product-card-category">{product.category}</p>
        <span className="product-card-title">{product.name}</span>
        <div className="product-card-price-row">
          <span className="price-current">₹{product.price}</span>
          {discount > 0 && (
            <>
              <span className="price-original">₹{product.compareAtPrice}</span>
              <span className="discount-badge">-{discount}%</span>
            </>
          )}
        </div>
        {product.rating > 0 && (
          <p className="product-card-rating">★ {product.rating.toFixed(1)} ({product.numReviews})</p>
        )}
      </div>
    </Link>
  );
};

export default ProductCard;
