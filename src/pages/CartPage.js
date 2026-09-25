import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const CartPage = () => {
  const { cartItems, removeFromCart, updateQty, totalPrice } = useCart();
  const { userInfo } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    navigate(userInfo ? '/checkout' : '/login?redirect=/checkout');
  };

  if (cartItems.length === 0) {
    return (
      <div className="cart-wrap">
        <p>Your cart is empty. <Link to="/" style={{ color: 'var(--color-accent-dark)', textDecoration: 'underline' }}>Go shopping</Link></p>
      </div>
    );
  }

  return (
    <div className="cart-wrap">
      <h2>Shopping Cart</h2>
      {cartItems.map((item) => (
        <div key={item.cartKey || item._id} className="cart-row">
          <img src={item.image} alt={item.name} />
          <div style={{ flex: 1 }}>
            <Link to={`/product/${item._id}`}>{item.name}</Link>
            {(item.selectedSize || item.selectedColor) && (
              <p className="variant">
                {item.selectedColor} {item.selectedSize && `· Size: ${item.selectedSize}`}
              </p>
            )}
          </div>
          <span>₹{item.price}</span>
          <select value={item.qty} onChange={(e) => updateQty(item.cartKey || item._id, Number(e.target.value))}>
            {[...Array(10).keys()].map((x) => (
              <option key={x + 1} value={x + 1}>{x + 1}</option>
            ))}
          </select>
          <button onClick={() => removeFromCart(item.cartKey || item._id)} className="cart-remove">Remove</button>
        </div>
      ))}

      <div className="cart-summary">
        <h3>Total: ₹{totalPrice.toFixed(2)}</h3>
        <button onClick={handleCheckout} className="btn-primary">Proceed to Checkout</button>
      </div>
    </div>
  );
};

export default CartPage;
