import { useState, useEffect } from 'react';
import api from '../api/axios';

const CATEGORIES = ['Luxury Abaya', 'Printed Abaya', 'Budget Abaya', 'Jilbab', 'Hijab', 'Accessories', 'Modest Collection'];

const emptyForm = {
  name: '',
  description: '',
  price: '',
  compareAtPrice: '',
  imagesText: '',
  category: CATEGORIES[0],
  fabric: '',
  colorsText: '',
  sizesText: 'Free Size:10',
  sku: '',
  tagsText: '',
  featured: false,
};

const AdminPage = () => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [tab, setTab] = useState('products');

  const loadProducts = async () => {
    const { data } = await api.get('/products');
    setProducts(data);
  };

  const loadOrders = async () => {
    const { data } = await api.get('/orders');
    setOrders(data);
  };

  useEffect(() => {
    loadProducts();
    loadOrders();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const buildPayload = () => ({
    name: form.name,
    description: form.description,
    price: Number(form.price),
    compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : undefined,
    images: form.imagesText.split(',').map((s) => s.trim()).filter(Boolean),
    category: form.category,
    fabric: form.fabric,
    colors: form.colorsText.split(',').map((s) => s.trim()).filter(Boolean),
    sizes: form.sizesText
      .split(',')
      .map((pair) => {
        const [size, count] = pair.split(':').map((s) => s.trim());
        return size ? { size, countInStock: Number(count) || 0 } : null;
      })
      .filter(Boolean),
    sku: form.sku || undefined,
    tags: form.tagsText.split(',').map((s) => s.trim()).filter(Boolean),
    featured: form.featured,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = buildPayload();
    if (editingId) {
      await api.put(`/products/${editingId}`, payload);
    } else {
      await api.post('/products', payload);
    }
    setForm(emptyForm);
    setEditingId(null);
    loadProducts();
  };

  const handleEdit = (product) => {
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      compareAtPrice: product.compareAtPrice || '',
      imagesText: (product.images || []).join(', '),
      category: product.category,
      fabric: product.fabric || '',
      colorsText: (product.colors || []).join(', '),
      sizesText: (product.sizes || []).map((s) => `${s.size}:${s.countInStock}`).join(', '),
      sku: product.sku || '',
      tagsText: (product.tags || []).join(', '),
      featured: product.featured || false,
    });
    setEditingId(product._id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this product?')) {
      await api.delete(`/products/${id}`);
      loadProducts();
    }
  };

  const handleDeliver = async (id) => {
    await api.put(`/orders/${id}/deliver`);
    loadOrders();
  };

  return (
    <div className="admin-wrap">
      <h2>Admin Dashboard</h2>
      <div className="admin-tabs">
        <button className={tab === 'products' ? 'active' : ''} onClick={() => setTab('products')}>Products</button>
        <button className={tab === 'orders' ? 'active' : ''} onClick={() => setTab('orders')}>Orders</button>
      </div>

      {tab === 'products' && (
        <>
          <form onSubmit={handleSubmit} className="admin-form">
            <input name="name" placeholder="Product Name (e.g. Zaytoon Khaleeji Abayah)" value={form.name} onChange={handleChange} required />
            <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} required rows={3} />
            <div style={{ display: 'flex', gap: '10px' }}>
              <input name="price" type="number" placeholder="Price (₹)" value={form.price} onChange={handleChange} required />
              <input name="compareAtPrice" type="number" placeholder="Original Price (optional)" value={form.compareAtPrice} onChange={handleChange} />
            </div>
            <input name="imagesText" placeholder="Image URLs, comma-separated" value={form.imagesText} onChange={handleChange} required />
            <select name="category" value={form.category} onChange={handleChange}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <input name="fabric" placeholder="Fabric (e.g. Imported Nida)" value={form.fabric} onChange={handleChange} />
            <input name="colorsText" placeholder="Colors, comma-separated" value={form.colorsText} onChange={handleChange} />
            <input name="sizesText" placeholder="Sizes with stock (e.g. S:5, M:8, L:6)" value={form.sizesText} onChange={handleChange} required />
            <input name="sku" placeholder="SKU (optional)" value={form.sku} onChange={handleChange} />
            <input name="tagsText" placeholder="Tags, comma-separated" value={form.tagsText} onChange={handleChange} />
            <label style={{ display: 'block', marginBottom: '14px', fontSize: '13px' }}>
              <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} style={{ width: 'auto', marginRight: '8px' }} /> Feature on homepage
            </label>
            <button type="submit" className="btn-primary">{editingId ? 'Update Product' : 'Add Product'}</button>
          </form>

          <table className="admin-table">
            <thead>
              <tr><th>Name</th><th>Price</th><th>Stock</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id}>
                  <td>{p.name}</td>
                  <td>₹{p.price}</td>
                  <td>{p.countInStock}</td>
                  <td>
                    <button onClick={() => handleEdit(p)} className="admin-small-btn">Edit</button>
                    <button onClick={() => handleDelete(p._id)} className="admin-small-btn danger">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {tab === 'orders' && (
        <table className="admin-table">
          <thead>
            <tr><th>Order ID</th><th>User</th><th>Total</th><th>Delivered</th><th>Action</th></tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o._id}>
                <td>{o._id}</td>
                <td>{o.user?.name}</td>
                <td>₹{o.totalPrice.toFixed(2)}</td>
                <td>{o.isDelivered ? 'Yes' : 'No'}</td>
                <td>
                  {!o.isDelivered && (
                    <button onClick={() => handleDeliver(o._id)} className="admin-small-btn">Mark Delivered</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminPage;
