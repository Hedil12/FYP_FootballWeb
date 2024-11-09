import React, { useEffect, useState } from 'react';

const IncentiveProgram = () => {
  const [incentives, setIncentives] = useState([]);

  useEffect(() => {
    getIncentives();
  }, []);

  const getIncentives = () => {
    api.get()
    .then(res => res.data)
    .then((data)=>setIncentives(data))
    .catch((err)=>alert(err))
  }
  return (
    <div>
      <h2>Incentive Program</h2>
      <ul>
        {incentives.map(incentive => (
          <li key={incentive.membership_tier}>
            {incentive.membership_tier}: {incentive.discount_rate}% discount, {incentive.cashback_rate}% cashback
          </li>
        ))}
      </ul>
    </div>
  );
};

export default IncentiveProgram;
