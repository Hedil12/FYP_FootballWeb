import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import LoadingIndicator from '../components/LoadingIndicator';
import { ACCESS_TOKEN, REFRESH_TOKEN, ROLE } from "../constants";
import { jwtDecode } from "jwt-decode";
import "../styles/Form.css";

function Form({ route, method }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const name = method === "login" ? "Login" : "Register";

    const handleSubmit = async (e) => {
        setLoading(true);
        e.preventDefault();

        if (!username || !email || !password) {
            alert("All fields are required");
            setLoading(false);
            return;
        }

        try {
            const res = await api.post(route, { username, email, password });
            if (method === "login") {
                const token = res.data;
                const decoded = jwtDecode(token.access);
                localStorage.setItem(ACCESS_TOKEN, token.access);
                localStorage.setItem(REFRESH_TOKEN, token.refresh);
                localStorage.setItem(ROLE, decoded.role);

                console.log('Decode Token:', decoded);
                console.log('User Role: ', decoded.role);
                console.log('Login successful', token);

                // Redirect based on role
                navigate(decoded.role === 'Admin' ? "/admin" : "/user/home");
            } else {
                navigate("/login");
                console.log('Register successful', res.data);
            }
        } catch (error) {
            alert("Login failed: " + error.response?.data?.detail || error.message);
            console.log("Login failed: " + error.response?.data?.detail || error.message);
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
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
            />
            <input
                className="form-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="E-mail"
            />
            <input
                className="form-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
            />
            {loading && <LoadingIndicator />}
            <button className="form-button" type="submit">
                {name}
            </button>
        </form>
    );
}

export default Form;
