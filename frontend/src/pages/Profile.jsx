import React, { useEffect, useState } from "react";
import api from "../api";
import refreshAccessToken from "../components/refreshToken";

function Profile() {
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

  if (error) return <div>Error: {error}</div>;
  if (!profile) return <div>Loading...</div>;

    return (
        <div>
            <h1>Profile</h1>
            <p><strong>Username:</strong> {profile.username}</p>
            <p><strong>Email:</strong> {profile.email}</p>
            <p><strong>Membership Tier:</strong> {profile.membership_tier}</p>
            <p><strong>Cashback Points:</strong> {profile.cashback_points}</p>
            <p><strong>Expirtation Date:</strong> {profile.expiration_date}</p>
        </div>
    );
}

export default Profile;
