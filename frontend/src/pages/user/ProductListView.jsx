import React, { useState, useEffect } from "react";
import api from "../../api";
import { ACCESS_TOKEN, noImgURL } from "../../constants";
import { Link } from "react-router-dom";
import "../../styles/ProductList.css";
import LoadingIndicator from "../../components/LoadingIndicator";

const ProductListView = () => {
  const [storeItems, setStoreItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStoreItems();
  }, []);

  const fetchStoreItems = async () => {
    setLoading(true);
    try {
      const response = await api.get("/api/products/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`,
        },
      });
      const items = response.data;

      // Filter items to show only one item per associated group (smallest item_id)
      const uniqueItemsMap = new Map();

      items.forEach(item => {
        if (item.product_group) {
          if (!uniqueItemsMap.has(item.product_group)) {
            uniqueItemsMap.set(item.product_group, item);
          } else {
            const existingItem = uniqueItemsMap.get(item.product_group);
            if (item.item_id < existingItem.item_id) {
              uniqueItemsMap.set(item.product_group, item);
            }
          }
        } else {
          uniqueItemsMap.set(item.item_id, item);
        }
      });

      setStoreItems(Array.from(uniqueItemsMap.values()));
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
  };

  const filteredItems = storeItems.filter(
    (item) =>
      item.item_name.toLowerCase().includes(searchQuery) ||
      item.item_id.toString().includes(searchQuery)
  );

  return (
    <div className="product-list-view">
      <input
        type="text"
        className="search-bar"
        placeholder="Search by Name or ID"
        value={searchQuery}
        onChange={handleSearch}
      />

     {/* View Cart Button */}
      <div className="view-cart-container">
        <Link to="view-cart" className="btn view-cart-button">
          View Cart
        </Link>
      </div>

      {loading && <LoadingIndicator />}

      <div className="product-grid">
        {filteredItems.map((item) => (
          <div key={item.item_id} className="product-card">
            <img
              src={
                item.item_img
                  ? `https://res.cloudinary.com/dzieqk9ly/${item.item_img}`
                  : noImgURL
              }
              alt={item.item_name}
              className="product-image"
            />
            <h3>{item.item_name}</h3>
            <p>${item.item_price}</p>
            {item.discount_rates > 0 && <p>Discount: {item.discount_rates}%</p>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductListView; 
