import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api";

function Home(){
    //const [membership, setMembership] = useState([])
    const [profile, setProfile] = useState("")
    //const [catalog, setCatalog] = useState([])
    //const [event, setEvents] = useState([])

    useEffect(() => {
        getProfile()
        /*getMembership(),
        getCatalog(),
        getEvents()*/
    }, [])

    const getProfile = () =>
        api.get("api/profile/")
    .then((res) => res.data)
    .then((data) => setProfile(data))
    .catch((err)=>alert(err))
/*
    const getMembership = () =>
        api.get("api/incentives/")
    .then((res) => res.data)
    .then((data) => setMembership(data))
    .catch((err)=>alert(err))

    const getCatalog = () =>
        api.get("api/products/")
    .then((res) => res.data)
    .then((data) => setCatalog(data))
    .catch((err)=>alert(err))

    const getEvents = () =>
        api.get("api/events/")
    .then((res) => res.data)
    .then((data) => setEvents(data))
    .catch((err)=>alert(err))
*/
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