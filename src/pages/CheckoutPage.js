import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const CheckoutPage = () => {
  const { cartItems, totalPrice, clearCart } = useCart();
  const { userInfo } = useAuth();
  const navigate = useNavigate();
  const [address, setAddress] = useState({ address: '', city: '', postalCode: '', country: 'India' });
  const [error, setError] = useState('');
  const [placing, setPlacing] = useState(false);

  const shippingPrice = totalPrice > 999 ? 0 : 60;
  const grandTotal = totalPrice + shippingPrice;

  const buildOrderItems = () =>
    cartItems.map((item) => ({
      name: item.name,
      qty: item.qty,
      price: item.price,
      product: item._id,
    }));

  // Saves the order to our own database once payment is confirmed (or for Cash on Delivery)
  const saveOrder = async (paymentResult) => {
    const { data } = await api.post('/orders', {
      orderItems: buildOrderItems(),
      shippingAddress: address,
      paymentMethod: paymentResult ? 'Razorpay' : 'Cash on Delivery',
      itemsPrice: totalPrice,
      shippingPrice,
      totalPrice: grandTotal,
      paymentResult,
    });
    clearCart();
    navigate(`/order/${data._id}`);
  };

  // Opens the Razorpay popup and handles the payment flow
  const handleRazorpayPayment = async () => {
    setError('');
    setPlacing(true);
    try {
      // Ask our backend to create a Razorpay order for this amount
      const { data: razorpayOrder } = await api.post('/payment/create-order', {
        amount: grandTotal,
      });

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        currency: 'INR',
        name: 'Reza Abaya',
        description: 'Order Payment',
        order_id: razorpayOrder.id,
        handler: async (response) => {
          try {
            // Verify the payment signature with our backend before trusting it
            await api.post('/payment/verify', response);
            await saveOrder({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
            });
          } catch (err) {
            setError('Payment verification failed. Please contact support.');
            setPlacing(false);
          }
        },
        prefill: {
          name: userInfo?.name,
          email: userInfo?.email,
        },
        theme: { color: '#B5677D' },
        modal: {
          ondismiss: () => setPlacing(false),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not start payment');
      setPlacing(false);
    }
  };

  const handleCOD = async (e) => {
    e.preventDefault();
    setError('');
    setPlacing(true);
    try {
      await saveOrder(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not place order');
      setPlacing(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // The address form's submit button triggers Razorpay by default; COD has its own button below
    handleRazorpayPayment();
  };

  return (
    <div className="auth-wrap" style={{ maxWidth: '460px', textAlign: 'left' }}>
      <h2 style={{ textAlign: 'center' }}>Shipping Address</h2>
      {error && <p className="auth-error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input placeholder="Address" required value={address.address} onChange={(e) => setAddress({ ...address, address: e.target.value })} />
        <input placeholder="City" required value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} />
        <input placeholder="Postal Code" required value={address.postalCode} onChange={(e) => setAddress({ ...address, postalCode: e.target.value })} />
        <input placeholder="Country" required value={address.country} onChange={(e) => setAddress({ ...address, country: e.target.value })} />

        <div style={{ margin: '18px 0', fontSize: '14px', color: 'var(--color-ink-soft)' }}>
          <p>Items: ₹{totalPrice.toFixed(2)}</p>
          <p>Shipping: ₹{shippingPrice.toFixed(2)}</p>
          <h3 style={{ color: 'var(--color-ink)' }}>Total: ₹{grandTotal.toFixed(2)}</h3>
        </div>

        <button type="submit" className="btn-primary" disabled={placing} style={{ width: '100%', marginBottom: '10px' }}>
          {placing ? 'Processing...' : 'Pay Now (Card / UPI / Netbanking)'}
        </button>
        <button type="button" onClick={handleCOD} className="btn-outline" disabled={placing} style={{ width: '100%' }}>
          Cash on Delivery
        </button>
      </form>
    </div>
  );
};

export default CheckoutPage;