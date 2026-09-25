import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const MyOrdersPage = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      const { data } = await api.get('/orders/myorders');
      setOrders(data);
    };
    fetchOrders();
  }, []);

  return (
    <div className="cart-wrap">
      <h2>My Orders</h2>
      {orders.length === 0 && <p>You have no orders yet.</p>}
      {orders.map((order) => (
        <div key={order._id} className="cart-row" style={{ display: 'block' }}>
          <Link to={`/order/${order._id}`} style={{ color: 'var(--color-accent-dark)' }}>Order #{order._id}</Link>
          <p>Total: ₹{order.totalPrice.toFixed(2)} — {order.isDelivered ? 'Delivered' : 'Processing'}</p>
        </div>
      ))}
    </div>
  );
};

export default MyOrdersPage;
