import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  restaurantId: string;
  restaurantName: string;
}

interface CartContextType {
  items: CartItem[];
  restaurantId: string | null;
  restaurantName: string | null;
  total: number;
  itemCount: number;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getItemQuantity: (id: string) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [restaurantName, setRestaurantName] = useState<string | null>(null);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const addItem = (newItem: Omit<CartItem, 'quantity'>) => {
    if (restaurantId && restaurantId !== newItem.restaurantId) {
      if (!window.confirm('Votre panier contient des articles d\'un autre restaurant. Vider et recommencer?')) return;
      setItems([]);
    }
    setRestaurantId(newItem.restaurantId);
    setRestaurantName(newItem.restaurantName);
    setItems(prev => {
      const existing = prev.find(i => i.id === newItem.id);
      if (existing) return prev.map(i => i.id === newItem.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...newItem, quantity: 1 }];
    });
  };

  const removeItem = (id: string) => {
    setItems(prev => {
      const filtered = prev.filter(i => i.id !== id);
      if (filtered.length === 0) { setRestaurantId(null); setRestaurantName(null); }
      return filtered;
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) { removeItem(id); return; }
    setItems(prev => prev.map(i => i.id === id ? { ...i, quantity } : i));
  };

  const clearCart = () => {
    setItems([]);
    setRestaurantId(null);
    setRestaurantName(null);
  };

  const getItemQuantity = (id: string) => items.find(i => i.id === id)?.quantity ?? 0;

  return (
    <CartContext.Provider value={{ items, restaurantId, restaurantName, total, itemCount, addItem, removeItem, updateQuantity, clearCart, getItemQuantity }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
