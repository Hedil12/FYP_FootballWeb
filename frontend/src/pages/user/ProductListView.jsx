import React, { useState, useEffect } from "react";
import api from "../../api";
import { ACCESS_TOKEN, noImgURL } from "../../constants";;
import "../../styles/ProductListView.css";
import { Link } from "react-router-dom";
import LoadingIndicator from "../../components/LoadingIndicator";
import NotFound from "../NotFound";

const ProductListView = () => {
  const [storeItems, setStoreItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStoreItems();
  }, []);

  const fetchStoreItems = async () => {
    setLoading(true);
    try {
      const response = await api.get("api/products/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setStoreItems(response.data);
      setFilteredItems(response.data);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to fetch products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    setFilteredItems(
      storeItems.filter((item) =>
        item.item_name.toLowerCase().includes(query)
      )
    );
  };

  if (error) return <NotFound/>;

  return (
    <div className="product-list-container">
      <h1>Available Products</h1>
      {error && <p className="error-message">{error}</p>}

      <input
        type="text"
        placeholder="Search products..."
        value={searchQuery}
        onChange={handleSearch}
      />

      {/* View Cart Button */}
      <div className="view-cart-container">
        <Link to="view-cart" className="btn view-cart-button">
          View Cart
        </Link>
      </div>

      {loading && <LoadingIndicator/>}

      <div className="product-grid">
        {filteredItems.map((item) => (
          <Link
            key={item.item_id + item.item_name}
            to={`products/${item.item_id}`}
            className={`product-card ${
              item.discount_rates > 0 ? "discount-card" : ""
            }`}
          >
            {item.discount_rates > 0 && (
              <div className="discount-label">{item.discount_rates}% Off</div>
            )}
            <img
              src={
                item.item_img
                  ? `https://res.cloudinary.com/dzieqk9ly/${item.item_img}`
                  : noImgURL
              }
              alt={item.item_name || "No Name"}
            />
            <h3>{item.item_name}</h3>
            <p>${item.item_price}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ProductListView;
