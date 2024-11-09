// Profile.js
import React, { useEffect, useState } from 'react';
import api from "../api";


const Profile = () => {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    getProfile();
  }, []);

  const getProfile = () => {
    api.get('/api/profile/')
    .then(res => {res.data})
    .then((data)=>setProfile(data))
    .catch((err)=>alert(err))
  }

  if (!profile) return <div>Loading...</div>;

  return (
    <div>
      <h2>Membership Profile</h2>
      <p>Username: {profile.username}</p>
      <p>Email: {profile.email}</p>
      <p>Membership Tier: {profile.membership_tier}</p>
      <p>Cashback: ${profile.cashback}</p>
      <p>Cashback Expiry: {profile.cashback_expiry}</p>
    </div>
  );
};

export default Profile;
