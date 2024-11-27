import React, { useState, useEffect } from "react";
import api from "../../api";
import { ACCESS_TOKEN } from "../../constants";
import '../../styles/ProductList.css'; // For styling consistency

const ProductListView = () => {
  const [storeItems, setStoreItems] = useState([]);
  const [error, setError] = useState(null);

  // Fetch items from the API
  useEffect(() => {
    fetchStoreItems();
  }, []);

  const fetchStoreItems = async () => {
    try {
      const response = await api.get("api/products/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`,
          'Content-type': 'application/json',
        },
      });
      setStoreItems(response.data);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="product-list-container">
      <h1>Available Products</h1>
      {error && <p className="error-message">{error}</p>}

      <div className="product-list">
        {storeItems.length > 0 ? (
          <ul>
            {storeItems.map((item) => (
              <li key={item.item_id} className="product-item">
                <div className="product-details">
                  <h3>{item.item_name}</h3>
                  <p>{item.item_desc}</p>
                  <p><strong>Price:</strong> ${item.item_price}</p>
                  <p><strong>Available Quantity:</strong> {item.item_qty}</p>
                  <p><strong>Discount:</strong> {item.discount_rates}%</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No products available at the moment. Please check back later!</p>
        )}
      </div>
    </div>
  );
};

export default ProductListView;
