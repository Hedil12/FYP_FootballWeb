import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api";

function Home(){
    const [profile, setProfile] = useState("")

    useEffect(() => {
        getProfile()
    }, [])

    const getProfile = async () =>
        api.get("api/profile/")
    .then((res) => res.data)
    .then((data) => setProfile(data))
    .catch((err)=>{
        console.log('Error: ', err)
        alert(err);
    })

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