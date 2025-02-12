import React, { useState, useEffect } from "react";
import api from "../../api";
import { ACCESS_TOKEN } from "../../constants";
import "../../styles/ProductList.css";

const ViewCart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [storeItems, setStoreItems] = useState([]);  // Available products for "Add to Cart"
  const [selectedItem, setSelectedItem] = useState("");  // Item to add
  const [quantity, setQuantity] = useState(1);  // Quantity to add
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // Fetch cart and store products on component mount
  useEffect(() => {
    fetchCart();
    fetchStoreItems();
  }, []);

  // Fetch cart items
  const fetchCart = async () => {
    try {
      const response = await api.get("cart/view/", {
        headers: { Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN)}` },
      });
      setCartItems(response.data);
    } catch (err) {
      console.error("Error fetching cart:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch available store products
  const fetchStoreItems = async () => {
    try {
      const response = await api.get("api/products/", {
        headers: { Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN)}` },
      });
      setStoreItems(response.data);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  // Add an item to the cart
  const addToCart = async () => {
    if (!selectedItem) {
      setMessage("Please select an item.");
      return;
    }

    try {
      await api.post(
        "cart/add/",
        { item_id: selectedItem, quantity },
        { headers: { Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN)}` } }
      );
      setMessage("Item added to cart!");
      fetchCart();  // Refresh cart
    } catch (error) {
      console.error("Error adding item:", error);
    }
  };

  // Remove an item from the cart
  const removeFromCart = async (cartId) => {
    try {
      await api.post(
        "cart/remove/",
        { cart_id: cartId },
        { headers: { Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN)}` } }
      );
      setMessage("Item removed from cart!");
      fetchCart();  // Refresh cart
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  // Checkout
  const checkout = async () => {
    try {
      const response = await api.post(
        "cart/checkout/",
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN)}` } }
      );
      setMessage(response.data.message);
      setCartItems([]);  // Clear cart
    } catch (error) {
      console.error("Checkout failed:", error);
    }
  };

  return (
    <div className="product-list-container">
      <h1>Shopping Cart</h1>

      {/* Add to Cart Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold">Add an Item to Cart</h3>
        <select className="border p-2 w-full" onChange={(e) => setSelectedItem(e.target.value)} value={selectedItem}>
          <option value="">Select an item</option>
          {storeItems.map((item) => (
            <option key={item.item_id} value={item.item_id}>
              {item.item_name} - ${item.item_price}
            </option>
          ))}
        </select>
        <input type="number" className="border p-2 w-full mt-2" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
        <button onClick={addToCart} className="mt-2 bg-blue-500 text-white px-4 py-2 rounded w-full">
          Add to Cart
        </button>
      </div>

      {/* View Cart Section */}
      {loading ? (
        <p>Loading...</p>
      ) : cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div>
          {cartItems.map((item, index) => (
            <div key={index} className="flex justify-between items-center border-b py-3">
              <div>
                <p className="font-semibold">{item.item_name}</p>
                <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                <p className="text-sm">Price: ${item.total_price.toFixed(2)}</p>
              </div>
              <button onClick={() => removeFromCart(item.cart_id)} className="bg-red-500 text-white px-3 py-1 rounded">
                Remove
              </button>
            </div>
          ))}

          <button onClick={checkout} className="mt-4 bg-green-500 text-white px-4 py-2 rounded w-full">
            Checkout
          </button>
        </div>
      )}

      {message && <p className="mt-4 text-blue-600">{message}</p>}
    </div>
  );
};

export default ViewCart;
