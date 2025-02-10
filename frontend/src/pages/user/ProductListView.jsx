import React, { useState, useEffect } from "react";
import api from "../../api";
import { ACCESS_TOKEN } from "../../constants";
import "../../styles/ProductListView.css";
import { Link } from "react-router-dom";
import LoadingIndicator from "../../components/LoadingIndicator";

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

      {loading && <LoadingIndicator/>}

      <div className="product-grid">
        {filteredItems.map((item) => (
          <div
            key={item.item_id + item.item_name}
            className={`product-card ${
              item.discount_rates > 0 ? "discount-card" : ""
            }`}
          >
            {item.discount_rates > 0 && (
              <div className="discount-label">{item.discount_rates}% Off</div>
            )}
            <Link to={`products/${item.item_id}`}>
              <img
                src={
                  item.item_img? `https://res.cloudinary.com/dzieqk9ly/${item.item_img}` : "https://res.cloudinary.com/dzieqk9ly/image/upload/v1736636312/No_Image_Available_pt1pcr.jpg"
                }
                alt={item.item_name || "No Name"}
              />
            </Link>
            <Link to={`products/${item.item_id}`}>
              <h3>{item.item_name}</h3>
            </Link>
            <p>${item.item_price}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductListView;
