import React, { useEffect, useState } from 'react';
const ProductList = () => {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        products();
    }, []);

    const getProfile = () => {
        api.get('/api/products/')
        .then(res => {res.data})
        .then((data)=>setProducts(data))
        .catch((err)=>alert(err))
    }

  return (
    <div>
      <h2>Football Gear Catalog</h2>
      <ul>
        {products.map(product => (
          <li key={product.id}>
            {product.name} - ${product.price} - {product.stock} in stock
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProductList;
