import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import api from "../../api";
import { ACCESS_TOKEN, noImgURL } from "../../constants";
import "../../styles/ProductDetails.css";
import LoadingIndicator from "../../components/LoadingIndicator";
import NotFound from "../NotFound";

const ProductDetails = () => {
  const { item_Id } = useParams();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showCount, setShowCount] = useState(4);
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    if (item_Id) {
      fetchProductDetails();
      fetchRelatedProducts();
    }
  }, [item_Id]);

  const fetchProductDetails = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/api/products/retrieve/${item_Id}/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`,
        },
      });
      setProduct(response.data);
    } catch (err) {
      console.error("Error fetching product details:", err);
      setError("Failed to load product details.");
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProducts = async () => {
    try {
      const response = await api.get(`/api/products/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`,
        },
      });
      const filteredProducts = response.data.filter(
        (p) => p.item_id !== parseInt(item_Id)
      );
      setRelatedProducts(filteredProducts);
    } catch (err) {
      console.error("Error fetching related products:", err);
    }
  };

  const handleAddToCart = async () => {
    if (quantity <= 0 || quantity > product.item_qty) {
      alert(`Invalid quantity. Please select a number between 1 and ${product.item_qty}.`);
      return;
    }

    try {
      await api.post(
        `api/cart/add/${item_Id}/`,
        { quantity },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`,
          },
        }
      );
      alert(`${quantity} x ${product.item_name} added to cart!`);
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Failed to add item to cart. Please try again.");
    }
  };

  const handleBuyNow = async () => {
    try {
      await api.post(
        `api/cart/add/${item_Id}/`,
        { quantity:1 },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`,
          },
        }
      );
      navigate("/user-Dashboard/store/view-cart"); // Redirect to cart
    } catch (error) {
      console.error("Error buying item:", error);
      alert("Failed to proceed to payment. Please try again.");
    }
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1 && value <= product.item_qty) {
      setQuantity(value);
    }
  };

  if (!product) return <p>No item available</p>;
  if (error) return <NotFound />;

  return (
    <div className="product-details-container">
      {error && <p className="error-message">{error}</p>}
      {loading && <LoadingIndicator />}

      <div className="product-details-wrapper">
        {/* Product Image */}
        <div className="product-image">
          <img
            src={
              product.item_img
                ? `https://res.cloudinary.com/dzieqk9ly/${product.item_img}`
                : noImgURL
            }
            alt={product.item_name}
            className="product-details-image"
          />
        </div>

        {/* Product Info */}
        <div className="product-info">
          <h1 className="product-title">{product.item_name}</h1>
          <p className="product-price">${product.item_price}</p>

          {product.discount_rates > 0 && (
            <div className="discount-container">
              <span className="discount-label">Discount</span>
              <span className="discount-amount">{product.discount_rates}%</span>
            </div>
          )}

          <p className="product-description">
            <strong>Description: </strong>
            {product.item_desc}
          </p>

          <p className="product-availability">
            <strong>Availability: </strong>
            {product.is_available ? "Available" : "Out of Stock"}
          </p>

          {/* Quantity Selector */}
          <div className="quantity-container">
            <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>
              -
            </button>
            <input
              type="number"
              value={quantity}
              onChange={handleQuantityChange}
              min="1"
              max={product.item_qty}
            />
            <button
              onClick={() =>
                setQuantity(Math.min(product.item_qty, quantity + 1))
              }
            >
              +
            </button>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button className="btn add-to-cart" onClick={handleAddToCart}>
              Add to Cart
            </button>
            <button className="btn buy-now" onClick={handleBuyNow}>
              Buy Now
            </button>
          </div>
        </div>
      </div>

      {/* Related Products */}
      <div className="related-products-container">
        <h2>Related Products</h2>
        <div className="related-products-grid">
          {relatedProducts.slice(0, showCount).map((p) => (
            <div className="related-product-item" key={p.item_id}>
              <Link to={`/user-Dashboard/store/products/${p.item_id}`}>
                <img
                  src={
                    p.item_img
                      ? `https://res.cloudinary.com/dzieqk9ly/${p.item_img}`
                      : noImgURL
                  }
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
          <button
            className="btn show-more"
            onClick={() => setShowCount(showCount + 4)}
          >
            Show More
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;