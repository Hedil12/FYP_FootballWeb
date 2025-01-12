import React, { useState, useEffect } from "react";
import api from "../../api";
import { ACCESS_TOKEN } from "../../constants";
import "../../styles/ProductList.css";
import LoadingIndicator from '../../components/LoadingIndicator';

const ProductList = () => {
  const [storeItems, setStoreItems] = useState([]);
  const [formData, setFormData] = useState({
    item_name: "",
    item_desc: "",
    item_qty: "",
    item_price: "",
    discount_rates: 0,
    has_discounts: false,
    is_available: false, // New state for availability
    item_image: null, // To handle the image file
  });
  const [editingItemId, setEditingItemId] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchStoreItems();
  }, []);

  const fetchStoreItems = async () => {
    setLoading(true);
    try {
      const response = await api.get("api/products/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`,
        },
      });
      console.log("Fetched Items:", response.data); // Log API response
      setStoreItems(response.data);
    } catch (err) {
      console.error("Failed to load products:", err);
      setError("Failed to load products. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "has_discounts") {
      setFormData({
        ...formData,
        [name]: e.target.checked,
        discount_rates: e.target.checked ? 0 : formData.discount_rates, // Reset discount rates to 0 if unchecked
      });
    } else if (name === "is_available") {
      setFormData({
        ...formData,
        [name]: e.target.checked,
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleImageChange = (e) => {
    setFormData({ ...formData, item_img: e.target.files[0] });
  };

  const handleEdit = (item) => {
    setFormData({
      item_name: item.item_name,
      item_desc: item.item_desc,
      item_qty: item.item_qty,
      item_price: item.item_price,
      discount_rates: item.discount_rates || 0,
      has_discounts: item.has_discounts,
      is_available: item.is_available,
      item_image: null, // Reset the image input for editing
    });
    console.log("Editing item with ID:", item.id); // Debugging log
    setEditingItemId(item.id); // Set the editing item ID
  };
  
  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
  
    // Validation
    if (!formData.item_name || !formData.item_desc || !formData.item_qty || !formData.item_price) {
      setError("Please fill in all required fields.");
      return;
    }
  
    const formDataObj = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== null) {
        formDataObj.append(key, formData[key]);
      }
    });
  
    try {
      const headers = {
        Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`,
        "Content-Type": "multipart/form-data",
      };
  
      if (editingItemId) {
        // Update the item
        console.log("Sending PUT request to update item with ID:", editingItemId);
        const response = await api.put(`api/products/edit/${editingItemId}/`, formDataObj, { headers });
        console.log("Updated item response:", response.data);
      } else {
        // Create a new item
        console.log("Sending POST request to create a new item");
        const response = await api.post("api/products/create/", formDataObj, { headers });
        console.log("Created item response:", response.data);
      }
  
      fetchStoreItems();
      resetForm();
    } catch (err) {
      console.error("Error during create/update:", err);
      setError("Failed to save item. Please try again.");
    }
  };
  
  const handleDelete = async (itemId) => {
    console.log("Attempting to delete item with ID:", itemId); // Debugging log
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        const response = await api.delete(`api/products/delete/${itemId}/`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`,
          },
        });
        console.log("Delete response:", response.data); // Log success
        fetchStoreItems(); // Refresh the list
      } catch (err) {
        console.error("Failed to delete item:", err.response || err.message);
        setError("Failed to delete the item. Please try again.");
      }
    }
  };
  
  
  const resetForm = () => {
    setFormData({
      item_name: "",
      item_desc: "",
      item_qty: "",
      item_price: "",
      discount_rates: 0,
      has_discounts: false,
      is_available: false, // Reset availability
      item_image: null,
    });
    setEditingItemId(null);
  };

  return (
    <div className="product-list-container">
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
          placeholder="Discount Rates (%)"
          value={formData.discount_rates}
          onChange={handleInputChange}
          disabled={!formData.has_discounts} // Disable when "Has Discounts" is unchecked
        />
        <label>
          <input
            type="checkbox"
            name="has_discounts"
            checked={formData.has_discounts}
            onChange={handleInputChange}
          />
          Has Discounts?
        </label>
        <input
          type="file"
          accept="*"
          onChange={handleImageChange}
          required={!editingItemId || formData.item_image === null}
        />
        
        <button type="submit">
          {editingItemId ? "Update Item" : "Create Item"}
        </button>
        {editingItemId && <button onClick={resetForm}>Cancel</button>}
      </form>

      {loading && <LoadingIndicator />}

      <div className="product-grid">
        {storeItems.map((item) => (
          <div key={item.item_id+item.item_name} className="product-card">
            <img
              src={item.item_img ? `https://res.cloudinary.com/dzieqk9ly/${item.item_img}` : "https://res.cloudinary.com/dzieqk9ly/image/upload/v1736636312/No_Image_Available_pt1pcr.jpg"}
              alt={item.item_name || "No Name"}
            />
            <h3>{item.item_name || "No Name Provided"}</h3>
            <p>{item.item_desc || "No Description"}</p>
            <p>${item.item_price || "0.00"}</p>
            <p>Quantity: {item.item_qty || "N/A"}</p>
            <p>
              Discount: {item.has_discounts ? `${item.discount_rates}%` : "No Discounts"}
            </p>
            <p>
              Availability: {item.is_available ? "Available" : "Not Available"}
            </p>
            <button onClick={() => handleEdit(item)}>Edit</button>
            <button onClick={() => handleDelete(item.item_id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;
