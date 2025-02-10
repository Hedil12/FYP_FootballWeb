import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../api";
import { ACCESS_TOKEN, noImgURL } from "../../constants";
import "../../styles/EventDetails.css";
import LoadingIndicator from "../../components/LoadingIndicator";
import NotFound from "../NotFound";

const EventDetails = () => {
    const { event_Id } = useParams();
    const [event, setEvent] = useState(null);
    const [relatedEvents, setRelatedEvents] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [visibleCount, setVisibleCount] = useState(4); // To manage how many related products are shown

    console.log("path: ", useParams());
    console.log("Event id: ", event_Id);
    useEffect(() => {
        if (event_Id) {
            fetchEventDetails(event_Id);
            fetchRelatedEvents();
        } else {
            console.log("No event_id");
        }
    }, [event_Id]); // Ensure the effect reruns when `item_Id` changes

    const fetchEventDetails = async (event_Id) => {
        setLoading(true);
        try {
            const response = await api.get(`/api/events/retrieve/${event_Id}/`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`,
                    "Content-Type": "multipart/form-data",
                },
            });
            setEvent(response.data);
            fetchRelatedEvents(response.data.category); // Example of category-based related products
        } catch (err) {
            console.error("Error fetching event details:", err);
            setError("Failed to load event details. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const fetchRelatedEvents = async () => {
      try {
          // Fetch all products from the API
          const response = await api.get(`/api/events/`, {
              headers: {
                  Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`,
              },
          });
  
          // Filter out the current product based on `item_Id`
          const filteredEvents = response.data.filter(
            (event) => event.event_id !== parseInt(event_Id) // Exclude current product
        );
  
          setRelatedEvents(filteredEvents);
      } catch (err) {
        console.error("Error fetching event details:", err);
        setError("Failed to load event details. Please try again later.");
      }
  };
  

    const showMoreEvents = () => {
        setVisibleCount((prevCount) => prevCount + 4); // Increase visible items by 4
    };

    if (!event) return null;
    if (error) return <NotFound/>;

    return (
        <div className="event-details-container">
            {error && <p className="error-message">{error}</p>}
            {loading && <LoadingIndicator/>}
            <div className="event-details-wrapper">
                <div className="event-image">
                    <img
                        src={
                            event.event_img
                                ? `https://res.cloudinary.com/dzieqk9ly/${event.event_img}`
                                : noImgURL
                        }
                        alt={event.event_name || "No Name"}
                        className="event-details-image"
                    />
                </div>

                <div className="event-info">
                    <h1 className="event-title">{event.event_name}</h1>
                    <p className="event-description">
                        <strong>Description: </strong>
                        {event.event_desc}
                    </p>

                    <p className="event-types">
                        <em>Type:</em> 
                        {event.event_types}
                    </p>
                    
                    <p className="event-startDate">
                        <em>Starts:</em> 
                        {new Date(event.event_date_start).toLocaleString()}
                    </p>
                        
                    <p className="event-endDate">
                        <em>Ends:</em> 
                        {new Date(event.event_date_end).toLocaleString()}
                    </p>

                    <p className="event-location">
                        <em>Location:</em> 
                        {event.location}
                    </p>

                </div>
            </div>

            {/* Related Events */}
            <div className="related-events-container">
                <h2>Related Events</h2>
                <div className="related-events-grid">
                    {relatedEvents.slice(0, visibleCount).map((event) => (
                        <Link 
                        key={event.event_id + event.event_name}
                        to={`/user-Dashboard/events/schedule/${event.event_id}`}
                        className="related-event-item">
                              <img
                                  src={`https://res.cloudinary.com/dzieqk9ly/${event.event_img}`}
                                  alt={event.event_name}
                                  className="related-event-image"
                              />
                              <h3 className="related-event-title">{event.event_name}</h3>
                        </Link>
                    ))}
                </div>
                {visibleCount < relatedEvents.length && (
                    <button className="btn show-more" onClick={showMoreEvents}>
                        Show More
                    </button>
                )}
            </div>
        </div>
    );
};

export default EventDetails;
