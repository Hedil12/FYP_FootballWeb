import React, { useState, useEffect } from "react";
import api from "../../api";
import { ACCESS_TOKEN } from "../../constants";
import "../../styles/UserList.css";
import LoadingIndicator from "../../components/LoadingIndicator";
import Form from "../../components/Form";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    member_name: "",
    username: "",
    password: "",
    member_email: "",
    cashback_points: 0,
    expiration_date: null,
    membership_id: 0,
  });
  const [editingUserId, setEditingUserId] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState("member_name");
  const [sortOrder, setSortOrder] = useState("asc");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get("api/members/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`,
        },
      });
      setUsers(response.data);
    } catch (err) {
      console.error("Failed to load users:", err);
      setError("Failed to load users. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleExpirationChange = (e) => {
    const { value } = e.target;
    setFormData({ ...formData, expiration_date: value === "null" ? null : value });
  };

  const handleEdit = (user) => {
    setFormData({
      member_name: user.member_name,
      username: user.username,
      password: "", // Reset password field for security
      member_email: user.member_email,
      cashback_points: user.cashback_points || 0,
      expiration_date: user.expiration_date,
      membership_id: user.membership_id,
    });
    setEditingUserId(user.member_id);
    setIsRegistering(false);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!formData.member_name || !formData.username || !formData.member_email || !formData.membership_id) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      const headers = {
        Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`,
        "Content-Type": "application/json",
      };

      if (editingUserId) {
        await api.put(`api/member/edit/${editingUserId}/`, formData, { headers });
        setSuccess("User updated successfully.");
      }
      fetchUsers();
      resetForm();
    } catch (err) {
      console.error("Failed to save user:", err);
      setError("Failed to save user. Please try again.");
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await api.delete(`api/members/delete/${userId}/`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`,
          },
        });
        setSuccess("User deleted successfully.");
        fetchUsers();
      } catch (err) {
        console.error("Failed to delete user:", err);
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
      expiration_date: null,
      membership_id: 0,
    });
    setEditingUserId(null);
  };

  const handleSort = (field) => {
    const order = sortField === field && sortOrder === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortOrder(order);
  };

  const sortedUsers = [...users].sort((a, b) => {
    const aField = a[sortField]?.toString().toLowerCase() || "";
    const bField = b[sortField]?.toString().toLowerCase() || "";
    if (aField < bField) return sortOrder === "asc" ? -1 : 1;
    if (aField > bField) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const filteredUsers = sortedUsers.filter(
    (user) =>
      user.member_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.member_email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="user-list-container">
      <h2>Manage Users</h2>
      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}
      {loading && <LoadingIndicator />}

      <input
        type="text"
        placeholder="Search users..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="search-bar"
      />

      <div className="form-toggle-buttons">
        <button onClick={() => setIsRegistering(false)}>Edit User</button>
        <button onClick={() => setIsRegistering(true)}>Register User</button>
      </div>

      {!isRegistering && (
        <form onSubmit={handleUpdate} className="user-form">
          <h1>Edit User</h1>
          <input type="text" name="member_name" placeholder="Name" value={formData.member_name} onChange={handleInputChange} required />
          <input type="text" name="username" placeholder="Username" value={formData.username} onChange={handleInputChange} required />
          <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleInputChange} required={!editingUserId} />
          <input type="email" name="member_email" placeholder="Email" value={formData.member_email} onChange={handleInputChange} required />
          <input type="number" name="cashback_points" placeholder="Cashback Points" value={formData.cashback_points} onChange={handleInputChange} />

          <select name="expiration_option" onChange={handleExpirationChange} value={formData.expiration_date === null ? "null" : "date"}>
            <option value="null">No Expiration Date</option>
            <option value="date">Set Expiration Date</option>
          </select>

          {formData.expiration_date !== null && (
            <input type="date" name="expiration_date" value={formData.expiration_date} onChange={handleInputChange} />
          )}

          <select name="membership_id" value={formData.membership_id} onChange={handleInputChange} required>
            <option value="" disabled>Select Membership Tier</option>
            <option value={1}>Bronze</option>
            <option value={2}>Silver</option>
            <option value={3}>Gold</option>
          </select>

          <button type="submit">{editingUserId ? "Update" : "Edit"} User</button>
        </form>
      )}

      <div className="sort-buttons">
        <button onClick={() => handleSort("member_name")}>Sort by Name ({sortOrder})</button>
        <button onClick={() => handleSort("username")}>Sort by Username ({sortOrder})</button>
        <button onClick={() => handleSort("member_email")}>Sort by Email ({sortOrder})</button>
      </div>

      <div className="user-grid">
        {filteredUsers.map((user) => (
          <div key={user.member_id} className="user-card">
            <h3>Name: {user.member_name || "No Name Provided"}</h3>
            <p>Username: {user.username || "No Username Provided"}</p>
            <p>Email: {user.member_email || "No Email Provided"}</p>
            <p>Membership ID: {user.membership_id || "No Membership ID Provided"}</p>
            <p>Expiration Date: {user.expiration_date || "No Expiration Date Provided"}</p>
            <p>Cashback Points: {user.cashback_points || 0}</p>
            <button onClick={() => handleEdit(user)}>Edit</button>
            <button onClick={() => handleDelete(user.member_id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserList;
