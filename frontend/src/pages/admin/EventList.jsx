import React, { useEffect, useState } from 'react';
import api from "../../api";
import { ACCESS_TOKEN } from "../../constants";
import LoadingIndicator from '../../components/LoadingIndicator';
import "../../styles/EventList.css";

const EventList = () => {
    const [events, setEvents] = useState([]);
    const [eventData, setEventData] = useState({
        event_name: '',
        event_desc: '',
        event_types: '',
        event_date_start: '',
        event_date_end: '',
        location: '',
        is_active: true,
        event_img: null,
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [editEventId, setEditEventId] = useState(null);
    const eventTypes = [
        { key: 'club_matches', label: 'Club matches schedule' },
        { key: 'club_training', label: 'Club training sessions schedule' },
        { key: 'agm', label: 'Annual General Meeting' },
        { key: 'trial_selection', label: 'Trial selection' },
        { key: 'promotion', label: 'Promotion' },
    ];

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
            setEvents(response.data);
        } catch (err) {
            setError("Failed to load events. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEventData({ ...eventData, [name]: value });
    };

    const handleImageChange = (e) => {
        setEventData({ ...eventData, event_img: e.target.files[0] });
      };

    const handleEdit = (item) => {
        const formatDate = (date) => {
            return date ? new Date(date).toISOString().slice(0, 16) : '';
        };
    
        setEventData({
            event_name: item.event_name,
            event_desc: item.event_desc,
            event_types: item.event_types,
            event_date_start: formatDate(item.event_date_start),
            event_date_end: formatDate(item.event_date_end),
            location: item.location,
            is_active: item.is_active,
            event_img: item.event_img,
        });
        setEditEventId(item.event_id);
    };
    
    const handleCreateOrUpdate = async (e) => {
        e.preventDefault();
    
        if (!eventData.event_name || !eventData.event_desc || !eventData.event_types || !eventData.event_date_start || !eventData.event_date_end || !eventData.location) {
            console.log("One or more fields are not filled");
            setError("Please fill in all required fields.");
            return;
        }
    
        const formDataObj = new FormData();
        Object.keys(eventData).forEach((key) => {
            if (eventData[key] !== null) {
                formDataObj.append(key, eventData[key]);
            }
        });
    
        try {
            const headers = {
                Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`,
                "Content-Type": "multipart/form-data",
            };
    
            let response;
    
            if (editEventId) {
                console.log("Sending PUT request to update event with ID:", editEventId);
                response = await api.put(`/api/events/edit/${editEventId}/`, formDataObj, { headers });
                console.log("Updated event response:", response.data);
            } else {
                console.log("Sending POST request to create a new event");
                response = await api.post('/api/events/create/', formDataObj, { headers });
                console.log("Created item response:", response.data);
            }
    
            // Update the events after creation or update
            setEvents((prevEvents) => [...prevEvents, response.data]);
    
            resetForm();
        } catch (err) {
            console.error("Error during create/update:", err);
            setError("Failed to create or update event. Please try again later.");
        }
    };

    const handleDelete = async (eventId) => {
        if (window.confirm("Are you sure you want to delete this event?")) {
            try {
                const response = await api.delete(`/api/events/delete/${eventId}/`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`,
                    },
                });
                console.log("Delete response:", response.data);
                fetchEvents();
            } catch {
                setError("Failed to delete event. Please try again later.");
            }
        }
    };

    const resetForm = () => {
        setEventData({
            event_name: '',
            event_desc: '',
            event_types: '',
            event_date_start: '',
            event_date_end: '',
            location: '',
            is_active: true,
            event_img: null,
        });
        setEditEventId(null);
    };

    return (
        <div className="event-list-container">
            <h1>Event Manager</h1>
            {error && <p className="error-message">{error}</p>}

            <h2>Create New Event</h2>
            <form onSubmit={handleCreateOrUpdate} className="event-form">
                <input name="event_name" value={eventData.event_name || ""} onChange={handleInputChange} placeholder="Event Name" />
                <input name="event_desc" value={eventData.event_desc || ""} onChange={handleInputChange} placeholder="Event Description" />
                <select name="event_types" value={eventData.event_types || ""} onChange={handleInputChange}>
                <option value="">Select Event Type</option>
                {eventTypes.map((type) => (
                    <option key={type.key} value={type.key}>
                        {type.label}
                    </option>
                    ))}
                </select>
                <input name="event_date_start" type="datetime-local" value={eventData.event_date_start || ""} onChange={handleInputChange} />
                <input name="event_date_end" type="datetime-local" value={eventData.event_date_end || ""} onChange={handleInputChange} />
                <input name="location" value={eventData.location || ""} onChange={handleInputChange} placeholder="Location" />
                <input type="file" accept="*" onChange={handleImageChange} required={!editEventId || eventData.event_img === null}/>
                <button type="submit">{editEventId ? "Update Event" : "Create Event"}</button>
                {editEventId && <button type="button" onClick={resetForm}>Cancel</button>}
            </form>

            <h2>Existing Events</h2>
            {loading && <LoadingIndicator />}            
            <div className="event-grid">
                {events.map((event) => (
                    <div key={event.event_id} className="event-card">
                        <img src={event.event_img ? `https://res.cloudinary.com/dzieqk9ly/${event.event_img}` : "https://res.cloudinary.com/dzieqk9ly/image/upload/v1736636312/No_Image_Available_pt1pcr.jpg"}
                        alt={event.event_name || "No Name"}/>
                        <strong>{event.event_name}</strong>
                        <p>{event.event_desc}</p>
                        <p><em>Type:</em> {event.event_types}</p>
                        <p><em>Starts:</em> {new Date(event.event_date_start).toLocaleString()}</p>
                        <p><em>Ends:</em> {new Date(event.event_date_end).toLocaleString()}</p>
                        <p><em>Location:</em> {event.location}</p>
                        <button onClick={() => handleEdit(event)}>Edit</button>
                        <button onClick={() => handleDelete(event.event_id)}>Delete</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default EventList;
