import React, { useState, useEffect } from "react";
import api from "../../api";
import { ACCESS_TOKEN } from "../../constants";
import "../../styles/UserList.css";
import LoadingIndicator from '../../components/LoadingIndicator';

const UserList = () => {
  const [storeUsers, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    member_name: "",
    username: "",
    password: "",
    member_email: "",
    cashback_points: 0,
    expiration_date: "",
    membership_id: 0
  });
  const [editingUserId, seteditingUserId] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get("api/member/", {
        headers: {
          Authorization: `Bearer ${localStorage.getuser(ACCESS_TOKEN)}`,
        },
      });
      console.log("Fetched users:", response.data); // Log API response
      setUsers(response.data);
    } catch (err) {
      console.error("Failed to load products:", err);
      setError("Failed to load users. Please try again later.");
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

  const handleEdit = (user) => {
    setFormData({
        member_name: user.member_name,
        username: user.username,
        password: user.password,
        member_email: user.member_email,
        cashback_points: user.cashback_points || 0,
        expiration_date: user.expiration_date,
        membership_id: user.membership_id
    });
    console.log("Editing user with ID:", user.member_id); // Debugging log
    seteditingUserId(user.member_id); // Ensure correct ID is set
};

  
  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
  
    // Validation
    if (!formData.member_name || !formData.username || !formData.password || !formData.member_email || !formData.membership_id) {
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
        Authorization: `Bearer ${localStorage.getuser(ACCESS_TOKEN)}`,
        "Content-Type": "multipart/form-data",
      };
  
      if (editingUserId) {
        // Update the user
        console.log("Sending PUT request to update user with ID:", editingUserId);
        const response = await api.put(`api/users/edit/${editingUserId}/`, formDataObj, { headers });
        console.log("Updated user response:", response.data);
      } else {
        // Create a new user
        console.log("Sending POST request to create a new user");
        const response = await api.post("api/products/create/", formDataObj, { headers });
        console.log("Created user response:", response.data);
      }
  
      fetchUsers();
      resetForm();
    } catch (err) {
      console.error("Error during create/update:", err);
      setError("Failed to save user. Please try again.");
    }
  };
  
  const handleDelete = async (userId) => {
    console.log("Attempting to delete user with ID:", userId); // Debugging log
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const response = await api.delete(`api/users/delete/${userId}/`, {
          headers: {
            Authorization: `Bearer ${localStorage.getuser(ACCESS_TOKEN)}`,
          },
        });
        console.log("Delete response:", response.data); // Log success
        fetchUsers(); // Refresh the list
      } catch (err) {
        console.error("Failed to delete user:", err.response || err.message);
        setError("Failed to delete the user. Please try again.");
      }
    }
  };
  
  const resetForm = () => {
    setFormData({
      member_name: "",
      username: "",
      password: "",
      member_email: "",
      cashback_points: 0,
      expiration_date: "",
      membership_id: 0
    });
    seteditingUserId(null);
  };

  return (
    <div className="user-list-container">
      <h2>Manage Users</h2>
      {error && <p className="error-message">{error}</p>}

      {loading && <LoadingIndicator />}

      <div className="user-grid">
        {storeUsers.map((user) => (
          <div key={user.item_id+user.member_name} className="user-card">
            <h3>{user.member_name || "No Name Provided"}</h3>
            <p>{user.username || "No Description"}</p>
            <p>${user.password || "0.00"}</p>
            <p>Quantity: {user.member_email || "N/A"}</p>
            <button onClick={() => handleEdit(user)}>Edit</button>
            <button onClick={() => handleDelete(user.user_id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserList;
