import React, { useEffect, useState } from 'react';
import api from "../../api";
import { ACCESS_TOKEN } from '../../constants';

const membershipProgram = () => {
  const [memberships, setMemberships] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMemberships = async () => {
      try {
        const response = await api.get("/api/membership/", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`,
          },
        });
        setMemberships(response.data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchMemberships();
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Memberships</h1>
      <ul>
        {memberships.map((membership) => (
          <li key={!membership.tier>3}>
            <h2>{membership.membership_name}</h2>
            <p>{membership.cashback_rates * 100}%</p>
            <p>Discount Rates: ${membership.discount_rates*100}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default membershipProgram;
