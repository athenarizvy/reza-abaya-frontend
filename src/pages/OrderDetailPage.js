import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';

const OrderDetailPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      const { data } = await api.get(`/orders/${id}`);
      setOrder(data);
    };
    fetchOrder();
  }, [id]);

  if (!order) return <p style={{ padding: '56px', textAlign: 'center' }}>Loading...</p>;

  return (
    <div className="pd-wrap" style={{ maxWidth: '600px' }}>
      <h2>Order #{order._id}</h2>
      <p><strong>Shipping:</strong> {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.postalCode}, {order.shippingAddress.country}</p>
      <p><strong>Payment Method:</strong> {order.paymentMethod}</p>
      <p><strong>Payment Status:</strong> {order.isPaid ? `Paid ✓` : 'Not Paid (Cash on Delivery)'}</p>
      <p><strong>Status:</strong> {order.isDelivered ? 'Delivered' : 'Processing'}</p>

      <h3 style={{ marginTop: '24px' }}>Items</h3>
      {order.orderItems.map((item) => (
        <p key={item.product}>{item.name} × {item.qty} — ₹{(item.price * item.qty).toFixed(2)}</p>
      ))}

      <h3 style={{ marginTop: '16px', color: 'var(--color-accent-dark)' }}>Total: ₹{order.totalPrice.toFixed(2)}</h3>
    </div>
  );
};

export default OrderDetailPage;
