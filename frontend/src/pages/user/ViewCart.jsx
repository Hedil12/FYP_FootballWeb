import { useEffect, useState } from "react";
import axios from "axios";

//const API_BASE_URL = "http://localhost:8000/cart"; // Change if needed

export default function ViewCart() {
  const [cartItems, setCartItems] = useState([]);
  const [products, setProducts] = useState([]); // Store products for adding to cart
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [selectedItem, setSelectedItem] = useState("");
  const [quantity, setQuantity] = useState(1);

  // Fetch cart data
  const fetchCart = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/view/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setCartItems(response.data);
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch available products to add to cart
  const fetchProducts = async () => {
    try {
      const response = await axios.get("http://localhost:8000/store/", {//url change if needed
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  // Add an item to the cart
  const addToCart = async () => {
    if (!selectedItem) {
      setMessage("Please select an item to add.");
      return;
    }

    try {
      await axios.post(
        `${API_BASE_URL}/add/`,
        { item_id: selectedItem, quantity },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setMessage("Item added successfully!");
      fetchCart(); // Refresh cart after adding
    } catch (error) {
      console.error("Error adding item:", error);
    }
  };

  // Remove an item from the cart
  const removeFromCart = async (cartId) => {
    try {
      await axios.post(
        `${API_BASE_URL}/remove/`,
        { cart_id: cartId },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setMessage("Item removed successfully!");
      fetchCart();
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  // Checkout
  const checkout = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/checkout/`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setMessage(response.data.message);
      setCartItems([]);
    } catch (error) {
      console.error("Checkout failed:", error);
    }
  };

  useEffect(() => {
    fetchCart();
    fetchProducts();
  }, []);

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Shopping Cart</h2>

      {/* Add to Cart Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Add an Item to Cart</h3>
        <select
          className="border p-2 w-full"
          onChange={(e) => setSelectedItem(e.target.value)}
          value={selectedItem}
        >
          <option value="">Select an item</option>
          {products.map((product) => (
            <option key={product.item_id} value={product.item_id}>
              {product.item_name} - ${product.item_price}
            </option>
          ))}
        </select>
        <input
          type="number"
          className="border p-2 w-full mt-2"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
        <button
          onClick={addToCart}
          className="mt-2 bg-blue-500 text-white px-4 py-2 rounded w-full"
        >
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
            <div
              key={index}
              className="flex justify-between items-center border-b py-3"
            >
              <div>
                <p className="font-semibold">{item.item_name}</p>
                <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                <p className="text-sm">Price: ${item.total_price.toFixed(2)}</p>
              </div>
              <button
                onClick={() => removeFromCart(item.cart_id)}
                className="bg-red-500 text-white px-3 py-1 rounded"
              >
                Remove
              </button>
            </div>
          ))}

          <button
            onClick={checkout}
            className="mt-4 bg-green-500 text-white px-4 py-2 rounded w-full"
          >
            Checkout
          </button>
        </div>
      )}

      {message && <p className="mt-4 text-blue-600">{message}</p>}
    </div>
  );
}
