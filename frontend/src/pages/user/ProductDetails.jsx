import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import api from "../../api";
import { ACCESS_TOKEN } from "../../constants";
import "../../styles/ProductDetails.css";
import LoadingIndicator from "../../components/LoadingIndicator";

const ProductDetails = () => {
    const { item_Id } = useParams(); // To retireve the URL/path
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showCount, setShowCount] = useState(4); // Initial count of related products
    const navigate = useNavigate();

    console.log("path: ", useParams());
    console.log("item id: ", item_Id);
    useEffect(() => {
        if (item_Id) {
            fetchProductDetails(item_Id);
            fetchRelatedProducts();
            setShowCount(4); // Reset the showCount when the item_Id changes
        } else {
            console.log("No item_id");
        }
    }, [item_Id]); // Ensure the effect reruns when `item_Id` changes

    const fetchProductDetails = async (item_Id) => {
        setLoading(true);
        try {
            const response = await api.get(`/api/products/retrieve/${item_Id}/`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`,
                    "Content-Type": "multipart/form-data",
                },
            });
            console.log("Item retrieved: ", response)
            setProduct(response.data);
        } catch (err) {
            console.error("Error fetching product details:", err);
            setError("Failed to load product details. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const fetchRelatedProducts = async () => {
        try {
            const response = await api.get(`/api/products/`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`,
                },
            });
            const filteredRelatedProducts = response.data.filter(
                (product) => product.item_id !== parseInt(item_Id)
            );
            
            setRelatedProducts(filteredRelatedProducts);
        } catch (err) {
            console.error("Error fetching related products:", err);
            setError("Failed to load related products.");
        }
    };

    const handleAddToCart = () => {
        console.log("Added to cart:", product.item_id);
    };

    const handleBuyNow = () => {
        console.log("Buying now:", product.item_id);
    };

    const handleShowMore = () => {
        setShowCount((prevCount) => prevCount + 4); // Increment by 4
    };

    if (!product) return <p>No item available</p>

   return (
        <div className="product-details-container">
            {error && <p className="error-message">{error}</p>}
            {loading && <LoadingIndicator/>}
            <div className="product-details-wrapper">
                <div className="product-image">
                    <img
                        src={
                            product.item_img
                                ? `https://res.cloudinary.com/dzieqk9ly/${product.item_img}`
                                : "https://res.cloudinary.com/dzieqk9ly/image/upload/v1736636312/No_Image_Available_pt1pcr.jpg"
                        }
                        alt={product.item_name || "No Name"}
                        className="product-details-image"
                    />
                </div>

                <div className="product-info">
                    <h1 className="product-title">{product.item_name}</h1>
                    <p className="product-price">${product.item_price}</p>

                    {product.discount_rates > 0 && (
                        <div className="discount-container">
                            <span className="discount-label">Discount</span>
                            <span className="discount-amount">
                                {product.discount_rates}%
                            </span>
                        </div>
                    )}

                    <p className="product-description">
                        <strong>Description: </strong>
                        {product.item_desc}
                    </p>

                    <p className="product-availability">
                        <strong>Availability: </strong>
                        {product.is_available ? "Available" : "Not Available"}
                    </p>

                    <div className="action-buttons">
                        <button className="btn add-to-cart" onClick={handleAddToCart}>
                            Add to Cart
                        </button>
                        <button className="btn buy-now" onClick={handleBuyNow}>
                            Buy Now
                        </button>
                    </div>
                </div>
            </div>

            {loading && <LoadingIndicator/>}

            {/* Related Products */}
            <div className="related-products-container">
                <h2>Related Products</h2>
                <div className="related-products-grid">
                    {relatedProducts.slice(0, showCount).map((product) => (
                        <div className="related-product-item" key={product.item_id}>
                            <Link to={`/user-Dashboard/store/products/${product.item_id}`}>
                                <img
                                    src={
                                        product.item_img
                                          ? `https://res.cloudinary.com/dzieqk9ly/${product.item_img}`
                                          : "https://res.cloudinary.com/dzieqk9ly/image/upload/v1736636312/No_Image_Available_pt1pcr.jpg"
                                      }
                                    alt={product.item_name}
                                    className="related-product-image"
                                />
                                <h3 className="related-product-title">{product.item_name}</h3>
                                <p className="related-product-price">${product.item_price}</p>
                            </Link>
                        </div>
                    ))}
                </div>
                {showCount < relatedProducts.length && (
                    <button className="btn show-more" onClick={handleShowMore}>
                        Show More
                    </button>
                )}
            </div>
        </div>
    );
};

export default ProductDetails;
