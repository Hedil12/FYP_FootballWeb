import React, { useState, useEffect } from "react";
import api from "../../api";
import { ACCESS_TOKEN } from "../../constants";
import "../../styles/ProductList.css";

const ProductListView = () => {
  const [storeItems, setStoreItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStoreItems();
  }, []);

  const fetchStoreItems = async () => {
    try {
      const response = await api.get("api/products/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`,
          "Content-type": "application/json",
        },
      });
      setStoreItems(response.data);
      setFilteredItems(response.data);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to fetch products. Please try again.");
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

      <div className="product-grid">
        {filteredItems.map((item) => (
          <div key={item.item_id} className="product-card">
            <img
              src={item.item_image_url} // URL from the database
              alt={item.item_name}
              className="product-image"
            />
            <h3>{item.item_name}</h3>
            <p>{item.item_desc}</p>
            <p>${item.item_price}</p>
            <p>Quantity: {item.item_qty}</p>
            <p>Discount: {item.discount_rates}%</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductListView;
