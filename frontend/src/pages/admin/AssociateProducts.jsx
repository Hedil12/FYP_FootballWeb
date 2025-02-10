import React, { useState, useEffect } from "react";
import api from "../../api";
import { ACCESS_TOKEN, noImgURL } from "../../constants";
import "../../styles/AssociateProducts.css";
import LoadingIndicator from "../../components/LoadingIndicator";
import NotFound from "../NotFound";

const AssociateProducts = ({ storeItems, fetchStoreItems }) => {
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSelectProduct = (product) => {
    if (!selectedProducts.some(p => p.item_id === product.item_id)) {
      setSelectedProducts([...selectedProducts, product]);
    }
  };

  const handleRemoveProduct = (product) => {
    setSelectedProducts(selectedProducts.filter(p => p.item_id !== product.item_id));
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
  };

  const saveAssociations = async () => {
    if (!groupName.trim()) {
      setError("Group name is required.");
      return;
    }

    try {
      setLoading(true);
      await api.post(`api/products/associate/`, {
        product_group: selectedProducts.map(product => product.item_id),
        group_name: groupName
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      alert("Products successfully associated!");
      fetchStoreItems();
      setSelectedProducts([]);
      setGroupName("");
    } catch (err) {
      if (err.response) {
        console.error("Backend Error:", err.response);
        setError(`Error: ${err.response.data.error || "Failed to save item."}`);
      } else {
        console.error("Unexpected Error:", err);
        setError("Unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const updateAssociations = async (groupId) => {
    if (!groupName.trim()) {
      setError("Group name is required.");
      return;
    }

    try {
      setLoading(true);
      await api.put(`api/products/${groupId}/associate/update/`, {
        product_group: selectedProducts.map(product => product.item_id),
        group_name: groupName
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      alert("Products successfully updated!");
      fetchStoreItems();
      setSelectedProducts([]);
      setGroupName("");
    } catch (err) {
      if (err.response) {
        console.error("Backend Error:", err.response);
        setError(`Error: ${err.response.data.error || "Failed to update item."}`);
      } else {
        console.error("Unexpected Error:", err);
        setError("Unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteAssociation = async () => {
    try {
      setLoading(true);
      await api.patch(`api/products/disassociate/`, {
        data: {
          product_group: selectedProducts.map(product => product.item_id)
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`,
          "Content-Type": "multipart/form-data"
        }
      });
      alert("Products successfully disassociated!");
      fetchStoreItems();
      setSelectedProducts([]);
    } catch (err) {
      if (err.response) {
        console.error("Backend Error:", err.response);
        setError(`Error: ${err.response.data.error || "Failed to disassociate item."}`);
      } else {
        console.error("Unexpected Error:", err);
        setError("Unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = storeItems.filter(
    (item) =>
      item.item_name.toLowerCase().includes(searchQuery) ||
      item.item_id.toString().includes(searchQuery) ||
      (item.product_group && item.product_group.toString().includes(searchQuery))
  );

  return (
    <div className="associate-products">
      <h3>Manage Product Associations</h3>
      {error && <p className="error-message">{error}</p>}
      {loading && <LoadingIndicator />}

      <div className="group-name-input">
        <input
          type="text"
          placeholder="Enter group name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />
      </div>

      <div className="selected-products-section">
        <h4>Selected Products</h4>
        {selectedProducts.length > 0 ? (
          <div className="product-grid">
            {selectedProducts.map(product => (
              <div key={product.item_id} className="product-card">
                <img
                  src={product.item_img ? `https://res.cloudinary.com/dzieqk9ly/${product.item_img}` : noImgURL}
                  alt={product.item_name}
                  className="product-image"
                />
                <h4>{product.item_name}</h4>
                <p><b>ID:</b> {product.item_id}</p>
                <p><b>Size:</b> {product.size || "No size"}</p>
                <p><b>Associate ID:</b> {product.product_group || "No association"}</p>
                <button className="remove-button" onClick={() => handleRemoveProduct(product)}>Remove</button>
              </div>
            ))}
          </div>
        ) : (
          <p>No products selected. Click products below to select.</p>
        )}
      </div>

      <input
        type="text"
        className="search-bar"
        placeholder="Search by Name, ID, or Group ID"
        value={searchQuery}
        onChange={handleSearch}
      />

      <div className="product-grid">
        {filteredItems.map(product => (
          <div key={product.item_id} className={`product-card ${product.product_group ? 'associated' : ''}`} onClick={() => handleSelectProduct(product)}>
            <img
              src={product.item_img ? `https://res.cloudinary.com/dzieqk9ly/${product.item_img}` : noImgURL}
              alt={product.item_name}
              className="product-image"
            />
            <h4>{product.item_name}</h4>
            <p><b>ID:</b> {product.item_id}</p>
            <p><b>Size:</b> {product.size || "No size"}</p>
            <p><b>Associate ID:</b>{product.product_group || "No association"}</p>
          </div>
        ))}
      </div>

      <div className="button-group">
        <button onClick={saveAssociations} className="action-button" id="save-button">Save</button>
        <button onClick={() => updateAssociations(selectedProducts[0]?.product_group)} className="action-button" id="update-button">Update</button>
        <button onClick={deleteAssociation} className="action-button" id="delete-button">Delete</button>
      </div>
    </div>
  );
};

export default AssociateProducts;
