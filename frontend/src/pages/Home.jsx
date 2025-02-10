import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import api from "../../api";
import { ACCESS_TOKEN } from "../../constants";
import "../../styles/Home.css";
import LoadingIndicator from "../../components/LoadingIndicator";
import NotFound from "../NotFound";

const Home = () => {

    return(
        <div className="home-container">
            <div className="image-container">
            </div>

            <div className="catalog-container">
            </div>

            <div className="upcoming-events-container"> </div>
        </div>
    )
}

export default Home;