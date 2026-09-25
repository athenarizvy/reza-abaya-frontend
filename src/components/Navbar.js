import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { userInfo, logout } = useAuth();
  const { cartItems } = useCart();
  const navigate = useNavigate();

  const cartCount = cartItems.reduce((sum, item) => sum + item.qty, 0);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">Reza&nbsp;Abaya</Link>
      <div className="navbar-links">
        <Link to="/cart">Cart ({cartCount})</Link>
        {userInfo ? (
          <>
            <Link to="/orders">My Orders</Link>
            {userInfo.isAdmin && <Link to="/admin">Admin</Link>}
            <button onClick={handleLogout} className="navbar-logout-btn">Logout</button>
          </>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;