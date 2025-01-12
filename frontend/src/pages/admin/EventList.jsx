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
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const eventTypes = [
      'Club matches schedule',
      'Club training sessions schedule',
      'Annual General Meeting',
      'Trial selection'
    ];
    
    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
      setLoading(true);
      try{
        const response = await api.get('/api/events/',{
          headers: {
            Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`,
          },
        });
        setEvents(response.data);
    } catch (err){
      setError("Failed to load events. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEventData({ ...eventData, [name]: value });
    };

    const createEvent = async () => {
      try {
        await api.post('/api/events/create/', eventData,{
          headers: {
            Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`,
            "Content-Type": "multipart/form-data"
          },
        });
        fetchEvents(); // Refresh the event list
    } catch (err){
      console.log(err)
      setError("Failed to create event. Please try again later.");
    }};

    const deleteEvent = async (id) => {
      if (window.confirm("Are you sure you want to delete this item?")) {
        try{
        await api.delete(`/api/events/delete/${id}/`,{
          headers: {
            Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`,
          },
        });
        fetchEvents(); // Refresh the event list
        }catch{
          setError("Failed to delete event. Please try again later.");
        }}};

    return (
        <div className='event-list-container'>
            <h1>Event Manager</h1>
            {error && <p className="error-message">{error}</p>}
            <div className='event-form'>
              <input name="event_name" onChange={handleInputChange} placeholder="Event Name" />
              <input name="event_desc" onChange={handleInputChange} placeholder="Event Description" />
              <input 
                name="event_types" 
                list="event-types" 
                onChange={handleInputChange} 
                placeholder="Select Event Type" 
            />
            <datalist id="event-types">
                {eventTypes.map((type, index) => (
                    <option key={index} value={type} />
                ))}
            </datalist>
              <input name="event_date_start" type="datetime-local" onChange={handleInputChange} />
              <input name="event_date_end" type="datetime-local" onChange={handleInputChange} />
              <input name="location" onChange={handleInputChange} placeholder="Location" />
              <button onClick={createEvent}>Create Event</button>
            </div>
            {loading && <LoadingIndicator />}

            <h2>Existing Events</h2>
            <ul>
                {events.map(event => (
                    <li key={event.event_id}>
                        {event.event_name} - {event.event_desc}
                        <button onClick={() => deleteEvent(event.event_id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default EventList;