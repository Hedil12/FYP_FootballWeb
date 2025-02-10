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
  const [associatedItems, setAssociatedItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
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
      fetchAssociatedItems(response.data.product_group);
    } catch (err) {
      console.error("Error fetching product details:", err);
      setError("Failed to load product details.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAssociatedItems = async (groupId) => {
    if (!groupId) return;
    try {
      const response = await api.get(`/api/products/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`,
        },
      });
      const filteredItems = response.data.filter(item => item.product_group === groupId);
      setAssociatedItems(filteredItems);
      setSelectedItem(filteredItems[0]);
    } catch (err) {
      console.error("Error fetching associated items:", err);
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
    if (!selectedItem) {
      alert("Please select a size.");
      return;
    }

    if (quantity <= 0 || quantity > selectedItem.item_qty) {
      alert(`Invalid quantity. Please select a number between 1 and ${selectedItem.item_qty}.`);
      return;
    }

    try {
      await api.post(
        `api/cart/add/${selectedItem.item_id}/`,
        { quantity },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`,
          },
        }
      );
      alert(`${quantity} x ${selectedItem.item_name} (Size: ${selectedItem.size}) added to cart!`);
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Failed to add item to cart. Please try again.");
    }
  };

  const handleBuyNow = async () => {
    if (!selectedItem) {
      alert("Please select a size.");
      return;
    }

    try {
      await api.post(
        `api/cart/add/${selectedItem.item_id}/`,
        { quantity: 1 },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`,
          },
        }
      );
      navigate("/user-Dashboard/store/view-cart");
    } catch (error) {
      console.error("Error buying item:", error);
      alert("Failed to proceed to payment. Please try again.");
    }
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    const maxQty = selectedItem ? selectedItem.item_qty : product.item_qty;

    if (!isNaN(value) && value >= 1 && value <= maxQty) {
      setQuantity(value);
    } else if (value > maxQty) {
      alert(`Selected quantity exceeds available stock (${maxQty}).`);
      setQuantity(maxQty);
    }
  };

  const handleSizeChange = (itemId) => {
    const selected = associatedItems.find(item => item.item_id === itemId);
    setSelectedItem(selected);
  };

  if (loading) return <LoadingIndicator />;
  if (error) return <NotFound />;
  if (!product) return <p>No item available</p>;

  return (
    <div className="product-details-container">
      {error && <p className="error-message">{error}</p>}

      <div className="product-details-wrapper">
        <div className="product-image">
          <img
            src={
              selectedItem && selectedItem.item_img
                ? `https://res.cloudinary.com/dzieqk9ly/${selectedItem.item_img}`
                : product.item_img
                ? `https://res.cloudinary.com/dzieqk9ly/${product.item_img}`
                : noImgURL
            }
            alt={selectedItem ? selectedItem.item_name : product.item_name}
            className="product-details-image"
          />
        </div>

        <div className="product-info">
          <h1 className="product-title">{selectedItem ? selectedItem.item_name : product.item_name}</h1>
          <p className="product-price">${selectedItem ? selectedItem.item_price : product.item_price}</p>

          {selectedItem && selectedItem.discount_rates > 0 && (
            <div className="discount-container">
              <span className="discount-label">Discount</span>
              <span className="discount-amount">{selectedItem.discount_rates}%</span>
            </div>
          )}

          <p className="product-description">
            <strong>Description: </strong>
            {selectedItem ? selectedItem.item_desc : product.item_desc}
          </p>

          <p className="product-availability">
            <strong>Availability: </strong>
            {selectedItem ? (selectedItem.is_available ? "Available" : "Out of Stock") : (product.is_available ? "Available" : "Out of Stock")}
          </p>

          {/* Size Selection */}
          {associatedItems.length > 0 && (
            <div className="size-selection">
              <h4>Select Size:</h4>
              {associatedItems.map((item) => (
                <div key={item.item_id} className="size-option">
                  <input
                    type="radio"
                    id={`size-${item.item_id}`}
                    name="size"
                    value={item.item_id}
                    checked={selectedItem && selectedItem.item_id === item.item_id}
                    onChange={() => handleSizeChange(item.item_id)}
                  />
                  <label htmlFor={`size-${item.item_id}`}>{item.size}</label>
                </div>
              ))}
            </div>
          )}

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
              max={selectedItem ? selectedItem.item_qty : product.item_qty}
            />
            <button
              onClick={() =>
                setQuantity(
                  Math.min(
                    selectedItem ? selectedItem.item_qty : product.item_qty,
                    quantity + 1
                  )
                )
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
