import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';

import HomePage from './pages/HomePage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderDetailPage from './pages/OrderDetailPage';
import MyOrdersPage from './pages/MyOrdersPage';
import AdminPage from './pages/AdminPage';

// Blocks access to a route unless the user is logged in
const PrivateRoute = ({ children }) => {
  const { userInfo } = useAuth();
  return userInfo ? children : <LoginPage />;
};

// Blocks access unless the user is an admin
const AdminRoute = ({ children }) => {
  const { userInfo } = useAuth();
  return userInfo?.isAdmin ? children : <LoginPage />;
};

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <Navbar />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/product/:id" element={<ProductDetailPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/checkout" element={<PrivateRoute><CheckoutPage /></PrivateRoute>} />
              <Route path="/order/:id" element={<PrivateRoute><OrderDetailPage /></PrivateRoute>} />
              <Route path="/orders" element={<PrivateRoute><MyOrdersPage /></PrivateRoute>} />
              <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;
