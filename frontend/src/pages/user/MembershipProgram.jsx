import React, { useEffect, useState } from 'react';
import api from "../../api";
import { ACCESS_TOKEN } from '../../constants';
import NotFound from '../NotFound';

const MembershipProgram = () => {
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
    return <NotFound/>;
  }

  return (
    <div>
      <h1>Memberships</h1>
      <ul>
        {memberships
          .filter(membership => membership.membership_tier !== 4) // Exclude membership with id 4
          .map((membership) => (
            <li key={membership.membership_tier+membership.membership_name}>
              <h2>{membership.membership_name}</h2>
              <p>Cashback Rates: {(membership.cashback_rates * 100).toFixed(2)}%</p>
              <p>Discount Rates: {(membership.discount_rates * 100).toFixed(2)}%</p>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default MembershipProgram;
