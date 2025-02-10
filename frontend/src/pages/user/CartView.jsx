import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api";
import { ACCESS_TOKEN, noImgURL } from "../../constants";
import "../../styles/CartView.css";
import LoadingIndicator from "../../components/LoadingIndicator";
import NotFound from "../NotFound";

const CartView = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subtotal, setSubtotal] = useState(0);
  const [showCount, setShowCount] = useState(4);
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    fetchCartItems();
  }, []);

  useEffect(() => {
    if (cartItems.length > 0) {
      fetchRelatedProducts();
    }
  }, [cartItems]);

  // Fetch cart items
  const fetchCartItems = async () => {
    try {
      const response = await api.get("api/cart/view/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`,
        },
      });
      console.log("Cart Items Response:", response.data); // Inspect the response
      setCartItems(response.data.cart_items || []);
      setSubtotal(response.data.total_price);
    } catch (error) {
      setError("Failed to fetch cart items.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch related products
  const fetchRelatedProducts = async () => {
    try {
      const response = await api.get(`/api/products/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`,
        },
      });
      setRelatedProducts(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Error fetching related products:", err);
    }
  };

  // Update quantity
  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) {
      // Remove item if quantity reaches 0
      await handleDeleteItem(itemId);
      return;
    }

    try {
      await api.post(
        `api/cart/add/${itemId}/`,
        { quantity: Number(newQuantity) },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`,
          },
        }
      );
      fetchCartItems(); // Refresh the cart
    } catch (error) {
      console.error("Failed to update quantity:", error);
      alert("Failed to update quantity. Please try again.");
    }
  };

  // Delete item
  const handleDeleteItem = async (itemId) => {
    try {
      await api.delete(`api/cart/delete/${itemId}/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`,
        },
      });
      alert("Item removed from cart!");
      fetchCartItems(); // Refresh the cart
    } catch (error) {
      console.error("Failed to delete item:", error);
      alert("Failed to remove item from cart. Please try again.");
    }
  };

  if (error) return <NotFound />;

  return (
    <div className="cart-view">
      <h1>Shopping Cart</h1>

      {loading && <LoadingIndicator />}

      <div className="cart-items">
        {cartItems.map((item, index) => (
          <div key={index} className="cart-item">
            <img
              src={item.product.image || noImgURL}
              alt={item.product.name}
              className="item-image"
            />
            <div className="item-details">
              <h2>{item.product.name}</h2>
              <p>Price: ${item.product.price.toFixed(2)}</p>
              <div className="quantity-controls">
                <button
                  onClick={() =>
                    handleUpdateQuantity(item.product.id, item.quantity - 1)
                  }
                >
                  -
                </button>
                <span>{item.quantity}</span>
                <button
                  onClick={() =>
                    handleUpdateQuantity(item.product.id, item.quantity + 1)
                  }
                >
                  +
                </button>
              </div>
              <button
                className="remove-btn"
                onClick={() => handleDeleteItem(item.product.id)}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="cart-summary">
        <h3>Subtotal: ${subtotal.toFixed(2)}</h3>
        <button className="checkout-btn">Proceed to Payment</button>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="related-products-container">
          <h2>Products You Might Like</h2>
          <div className="related-products-grid">
            {relatedProducts.slice(0, showCount).map((p) => (
              <div className="related-product-item" key={p.item_id}>
                <Link to={`user-Dashboard/store/products/${p.item_id}`}>
                  <img
                    src={p.item_img ? `https://res.cloudinary.com/dzieqk9ly/${p.item_img}` : noImgURL}
                    alt={p.item_name}
                    className="related-product-image"
                  />
                  <h3 className="related-product-title">{p.item_name}</h3>
                  <p className="related-product-price">${p.item_price}</p>
                </Link>
              </div>
            ))}
          </div>
          {showCount < relatedProducts.length && (
            <button className="btn show-more" onClick={() => setShowCount(showCount + 4)}>
              Show More
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CartView;