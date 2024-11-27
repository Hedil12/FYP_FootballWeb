import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../api";
import { ACCESS_TOKEN } from "../../constants";
import '../../styles/ProductList.css'; // Import your custom styles for consistent design

const ProductList = () => {
  const [storeItems, setStoreItems] = useState([]);
  const [formData, setFormData] = useState({
    item_name: "",
    item_desc: "",
    item_qty: "",
    item_price: "",
    discount_rates: "",
  });
  const [editingItemId, setEditingItemId] = useState(null);
  const [error, setError] = useState(null);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    try {
      if (editingItemId) {
        await api.put(`api/products/${editingItemId}/`, formData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`,
            'Content-type': 'application/json',
          },
        });
      } else {
        await api.post("api/products/", formData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`,
            'Content-type': 'application/json',
          },
        });
      }
      fetchStoreItems();
      resetForm();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (itemId) => {
    try {
      await api.delete(`api/products/${itemId}/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`,
          'Content-type': 'application/json',
        },
      });
      fetchStoreItems();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (item) => {
    setFormData({
      item_name: item.item_name,
      item_desc: item.item_desc,
      item_qty: item.item_qty,
      item_price: item.item_price,
      discount_rates: item.discount_rates,
    });
    setEditingItemId(item.item_id);
  };

  const resetForm = () => {
    setFormData({
      item_name: "",
      item_desc: "",
      item_qty: "",
      item_price: "",
      discount_rates: "",
    });
    setEditingItemId(null);
  };

  return (
    <div className="product-list-container">
      <div className="sidebar">
        <h1>Store Management</h1>
        <ul>
          <li>
            <Link to="/dashboard">Back to Dashboard</Link>
          </li>
        </ul>
      </div>
      <div className="main-content">
        <h2>Manage Products</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleCreateOrUpdate} className="product-form">
          <input
            type="text"
            name="item_name"
            placeholder="Item Name"
            value={formData.item_name}
            onChange={handleInputChange}
            required
          />
          <input
            type="text"
            name="item_desc"
            placeholder="Item Description"
            value={formData.item_desc}
            onChange={handleInputChange}
            required
          />
          <input
            type="number"
            name="item_qty"
            placeholder="Quantity"
            value={formData.item_qty}
            onChange={handleInputChange}
            required
          />
          <input
            type="number"
            name="item_price"
            placeholder="Price"
            value={formData.item_price}
            onChange={handleInputChange}
            required
          />
          <input
            type="number"
            step="0.01"
            name="discount_rates"
            placeholder="Discount Rates"
            value={formData.discount_rates}
            onChange={handleInputChange}
            required
          />
          <button type="submit">{editingItemId ? "Update Item" : "Create Item"}</button>
          {editingItemId && <button type="button" onClick={resetForm}>Cancel</button>}
        </form>

        <div className="product-list">
          <ul>
            {storeItems.map((item) => (
              <li key={item.item_id} className="product-item">
                <div className="product-details">
                  <h3>{item.item_name}</h3>
                  <p>{item.item_desc}</p>
                  <p><strong>Qty:</strong> {item.item_qty}</p>
                  <p><strong>Price:</strong> ${item.item_price}</p>
                  <p><strong>Discount:</strong> {item.discount_rates}%</p>
                </div>
                <div className="product-actions">
                  <button onClick={() => handleEdit(item)}>Edit</button>
                  <button onClick={() => handleDelete(item.item_id)}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ProductList;
