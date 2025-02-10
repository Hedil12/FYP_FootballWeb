import React, { useState, useEffect } from "react";
import api from "../../api";
import { ACCESS_TOKEN, noImgURL } from "../../constants";
import "../../styles/ProductList.css";
import LoadingIndicator from "../../components/LoadingIndicator";
import AssociateProducts from "./AssociateProducts";

const ProductList = () => {
  const [storeItems, setStoreItems] = useState([]);
  const [mode, setMode] = useState("create");
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    item_name: "",
    item_desc: "",
    item_qty: "",
    item_price: "",
    discount_rates: 0,
    has_discounts: false,
    is_available: true,
    item_image: null,
    size: "NIL",
  });
  const [editingItemId, setEditingItemId] = useState(null);
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
        },
      });
      setStoreItems(response.data);
    } catch (err) {
      console.error("Failed to load products:", err);
      setError("Failed to load products. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
      discount_rates: type === "checkbox" && !checked ? 0 : formData.discount_rates,
    });
  };

  const handleImageChange = (e) => {
    setFormData({ ...formData, item_img: e.target.files[0] });
  };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    if (!formData.item_name || !formData.item_desc || !formData.item_qty || !formData.item_price || (!editingItemId && !formData.item_img) || !formData.size) {
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
      const endpoint = editingItemId ? `api/products/edit/${editingItemId}/` : "api/products/create/";
      const method = editingItemId ? api.put : api.post;
      const response = await method(endpoint, formDataObj, { headers });

      console.log(editingItemId ? "Editing: " : "Created: ", response.data);
      fetchStoreItems();
      resetForm();
    } catch (err) {
      if (err.response) {
        console.error("Backend Error:", err.response.data);
        setError(`Error: ${err.response.data.message || "Failed to save item."}`);
      } else {
        console.error("Unexpected Error:", err);
        setError("Unexpected error occurred. Please try again.");
      }
    }
  };

  const handleEdit = (item) => {
    setFormData({
      item_name: item.item_name,
      item_desc: item.item_desc,
      item_qty: item.item_qty,
      item_price: item.item_price,
      discount_rates: item.discount_rates,
      has_discounts: item.discount_rates > 0,
      is_available: item.is_available,
      item_image: item.item_img,
      size: item.size,
    });
    setEditingItemId(item.item_id);
  };

  const handleDelete = async (itemId) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        const response = await api.delete(`api/products/delete/${itemId}/`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`,
          },
        });
        console.log("Deleted: ", response);
        fetchStoreItems();
      } catch (err) {
        console.error("Failed to delete item:", err);
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
      is_available: true,
      item_image: null,
      size: "NIL",
    });
    setEditingItemId(null);
  };

  const filteredItems = storeItems.filter(
    (item) =>
      item.item_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.item_id.toString().includes(searchQuery)
  );

  return (
    <div className="product-management">
      {error && <p className="error-message">{error}</p>}
      <div className="mode-toggle">
        <button
          className={mode === "create" ? "active" : ""}
          onClick={() => setMode("create")}
        >
          Create Product
        </button>
        <button
          className={mode === "associate" ? "active" : ""}
          onClick={() => setMode("associate")}
        >
          Associate Products
        </button>
      </div>

      {loading && <LoadingIndicator />}
      {mode === "create" ? (
        <>
          <form onSubmit={handleCreateOrUpdate} className="product-form">
            {['item_name', 'item_desc', 'item_qty', 'item_price', 'size'].map((field) => (
              <input
                key={field}
                type={field.includes("qty") || field.includes("price") ? "number" : "text"}
                name={field}
                placeholder={field.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                value={formData[field]}
                onChange={handleInputChange}
                required
              />
            ))}

            <input
              type="file"
              accept="*"
              onChange={handleImageChange}
              required={!editingItemId || formData.item_image === null}
            />

            <label className="discount-label">
              <input
                type="checkbox"
                name="has_discounts"
                checked={formData.has_discounts}
                onChange={handleInputChange}
              />
              Apply Discount
            </label>

            {formData.has_discounts && (
              <input
                type="number"
                name="discount_rates"
                placeholder="Discount Rate (%)"
                value={formData.discount_rates}
                onChange={handleInputChange}
                required
              />
            )}

            <button type="submit">{editingItemId ? "Update" : "Create"}</button>
          </form>

          <input
            type="text"
            className="search-bar"
            placeholder="Search by Name or ID"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <div className="product-grid">
            {filteredItems.map((item) => (
              <div key={item.item_id} className="product-card">
                <div className="product-image-container">
                  <img
                    src={item.item_img ? `https://res.cloudinary.com/dzieqk9ly/${item.item_img}` : noImgURL}
                    alt={item.item_name}
                    className="product-image"
                  />
                </div>
                <h3>{item.item_name}</h3>
                <p>{item.item_desc}</p>
                <p>Size: {item.size || "No size required"}</p>
                <p>${item.item_price}</p>
                {item.discount_rates > 0 && <p>Discount: {item.discount_rates}%</p>}
                <div className="card-actions">
                  <button onClick={() => handleEdit(item)}>Edit</button>
                  <button onClick={() => handleDelete(item.item_id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <AssociateProducts storeItems={storeItems} fetchStoreItems={fetchStoreItems} />
      )}
    </div>
  );
};

export default ProductList;
