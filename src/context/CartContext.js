import { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const stored = localStorage.getItem('cartItems');
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, qty = 1) => {
    const key = product.cartKey || product._id;
    setCartItems((prev) => {
      const existing = prev.find((item) => (item.cartKey || item._id) === key);
      if (existing) {
        return prev.map((item) =>
          (item.cartKey || item._id) === key ? { ...item, qty: item.qty + qty } : item
        );
      }
      return [...prev, { ...product, cartKey: key, qty }];
    });
  };

  const removeFromCart = (cartKey) => {
    setCartItems((prev) => prev.filter((item) => (item.cartKey || item._id) !== cartKey));
  };

  const updateQty = (cartKey, qty) => {
    setCartItems((prev) =>
      prev.map((item) => ((item.cartKey || item._id) === cartKey ? { ...item, qty } : item))
    );
  };

  const clearCart = () => setCartItems([]);

  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <CartContext.Provider
      value={{ cartItems, addToCart, removeFromCart, updateQty, clearCart, totalPrice }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
