import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api";

function Home(){
    const [profile, setProfile] = useState(null);
    const [error, setError] = useState(null);
  
    useEffect(() => {
      const fetchProfile = async () => {
        try {
          const response = await api.get("api/profile/", {
              headers: {
                  Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                  'Content-type': 'application/json',
                  }
          }); // Correct relative endpoint
          setProfile(response.data);
        } catch (err) {
          setError(err.message);
        }
      };
  
      fetchProfile();
    }, []);

    return (
        <div className="container">
            <div className="info">
                <h2>Welcome back {profile.name}!</h2>
            </div>
            <nav className="navigation">
                <ul>
                    <li>
                    <Link to="/profile">Profile</Link>
                    </li>
                    <li>
                    <Link to="/catalog">Catalog</Link>
                    </li>
                    <li>
                    <Link to="/incentives">Incentives</Link>
                    </li>
                    <li>
                    <Link to="/events">Events</Link>
                    </li>
                    <li>
                    <Link to="/settings">Settings</Link>
                    </li>
                </ul>
            </nav>
        </div>
    );
}

export default Home