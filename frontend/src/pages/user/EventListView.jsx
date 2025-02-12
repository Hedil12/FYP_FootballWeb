import React, { useState, useEffect } from "react";
import api from "../../api";
import { ACCESS_TOKEN, noImgURL } from "../../constants";
import "../../styles/EventListView.css";
import { Link } from "react-router-dom";
import LoadingIndicator from "../../components/LoadingIndicator";

const EventListView = () =>{
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [error, setError] = useState(null);
    const [Loading, setLoading] = useState(false);
    
    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const response = await api.get('/api/events/', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`,
                    "Content-Type": "multipart/form-data",
                },
            });
            setFilteredEvents(response.data)
        } catch (err) {
            console.error("Error fetching events:", err);
            setError("Failed to load events. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);
        setFilteredEvents(
          storeItems.filter((event) =>
            event.event_name.toLowerCase().includes(query)
          )
        );
      };

    return (
        <div className="event-list-container">
            <h1>Current Event</h1>
            {error && <p className="error-message">{error}</p>}
    
            <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={handleSearch}
            />

            {Loading && <LoadingIndicator/>}

            <div className="event-grid">
                {filteredEvents.map((event) => (
                  <Link 
                    key={event.event_id} 
                    to={`schedule/${event.event_id}`} 
                    className="event-card">
                      <img
                        src={
                          event.event_img
                            ? `https://res.cloudinary.com/dzieqk9ly/${event.event_img}`
                            : noImgURL
                        }
                        alt={event.event_name || "No Name"}
                      />
                      <strong>{event.event_name}</strong>
                      <p>
                        <em>Starts:</em> {new Date(event.event_date_start).toLocaleString()}
                      </p>
                      <p>
                        <em>Ends:</em> {new Date(event.event_date_end).toLocaleString()}
                      </p>
                      <p>
                        <em>Location:</em> {event.location}
                      </p>
                    </Link>                
                ))}
            </div>
        </div>
    );
};

export default EventListView;