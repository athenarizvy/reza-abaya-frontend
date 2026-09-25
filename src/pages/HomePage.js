import { useState, useEffect } from 'react';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';
import SEO from '../components/SEO';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchProducts = async (search = '') => {
    setLoading(true);
    const { data } = await api.get(`/products${search ? `?keyword=${search}` : ''}`);
    setProducts(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts(keyword);
  };

  return (
    <div>
      <SEO
        title="Modest Luxury Abayas & Hijabs"
        description="Discover premium abayas, hijabs, and modest wear online in India. Elegant Khaleeji, printed, and everyday abayas — crafted for confidence and grace."
      />
      <section className="hero">
        <p className="hero-eyebrow">Modest Luxury</p>
        <h1 className="hero-title">Where elegance meets <em>modesty</em></h1>
        <p className="hero-sub">
          A curated collection of premium abayas and hijabs, designed for confidence,
          comfort, and timeless grace.
        </p>
        <form onSubmit={handleSearch} style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
          <input
            type="text"
            placeholder="Search abayas, hijabs..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            style={{ width: '260px' }}
          />
          <button type="submit" className="btn-primary">Search</button>
        </form>
      </section>

      <div className="section-heading">
        <h2>The Collection</h2>
        <div className="divider" />
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', padding: '60px' }}>Loading products...</p>
      ) : (
        <div className="product-grid">
          {products.length === 0 && <p>No products found.</p>}
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}

      <footer className="site-footer">
        <div className="brand">Reza Abaya</div>
        <p>Crafted with care for the modern modest wardrobe.</p>
      </footer>
    </div>
  );
};

export default HomePage;