import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import LoadingIndicator from '../components/LoadingIndicator';
import { ACCESS_TOKEN, REFRESH_TOKEN, UserInfo, ROLE } from "../constants";
import { jwtDecode } from "jwt-decode";
import "../styles/Form.css";

function Form({ route, method }) {
    const [member_name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [member_email, setEmail] = useState("");
    const [membership, setMembership] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const name = method === "login" ? "Login" : "Register";

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
    
        if (!username || !password) {
            alert("Username and password are required");
            setLoading(false);
            return;
        }
    
        if (method !== "login" && (!member_email || !membership)) {
            alert("Email and membership are required for registration");
            setLoading(false);
            return;
        }
    
        try {
            if (method === "login") {
                const res = await api.post(route, { username, password });
                const token = res.data;
    
                localStorage.setItem(ACCESS_TOKEN, token.access);
                localStorage.setItem(REFRESH_TOKEN, token.refresh);
                localStorage.setItem(UserInfo, JSON.stringify(token));
                localStorage.setItem(ROLE, token.role);
    
                console.log("Login successful:", token);
                navigate(token.role === "Admin" ? "/admin-Dashboard" : "/user-Dashboard");
            } else if (method === "register") {
                const payload = {
                    member_name,
                    username,
                    password,
                    member_email,
                    membership,
                    role: 1
                };
    
                console.log("Submitting Registration Payload:", payload);
                const res = await api.post(route, payload);
                console.log("Registration successful:", res.data);
    
                navigate("/admin-Dashboard");
            }
        } catch (error) {
            console.error("Registration error:", error.response?.data || error.message);
            alert("Error: " + JSON.stringify(error.response?.data || error.message, null, 2));
        } finally {
            setLoading(false);
        }
    };
    
    
    return (
        <form onSubmit={handleSubmit} className="form-container">
            <h1>{name}</h1>
            <input
                className="form-input"
                type="text"
                value={username}
                onChange={(e) => {
                    setUsername(e.target.value);
                    setName(e.target.value);
                }}
                placeholder="Username"
                required
            />
            {method !== "login" && (
                <>
                    <input
                        className="form-input"
                        type="email"
                        value={member_email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        required
                    />
                    <select
                        className="form-input"
                        type="text"
                        value={membership}
                        onChange={(e) => setMembership(e.target.value)}
                        required
                    >
                        <option value="" disabled>Select Membership Tier</option>
                        <option value={1}>Bronze</option>
                        <option value={2}>Silver</option>
                        <option value={3}>Gold</option>
                        <option value={4}>Admin</option>
                    </select>
                </>
            )}
            <input
                className="form-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
            />
            {loading && <LoadingIndicator />}
            <button className="form-button" type="submit" disabled={loading}>
                {loading ? "Submitting" : name}
            </button>
        </form>
    );
}

export default Form;