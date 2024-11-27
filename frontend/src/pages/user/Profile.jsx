import React, { useEffect, useState } from "react";
import api from "../../api";
import { ACCESS_TOKEN } from "../../constants";
import LoadingIndicator from '../../components/LoadingIndicator';

function Profile() {
  const [profile, setProfile] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("api/profile/", {
            headers: {
                Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`,
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
  if (!profile) return <div><LoadingIndicator /></div>;

    return (
        <div>
            <h1>Profile</h1>
            <p><strong>Username:</strong> {profile.username}</p>
            <p><strong>Email:</strong> {profile.member_email}</p>
            <p><strong>Membership Tier:</strong> {profile.membership_tier === 1? "Silver":"Bronze"}</p>
            <p><strong>Cashback Points:</strong> {profile.cashback_points > 0? profile.cashback_points : 0}</p>
            <p><strong>Expirtation Date:</strong> {profile.expiration_date}</p>
        </div>
    );
}

export default Profile;
