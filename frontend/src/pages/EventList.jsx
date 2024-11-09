// components/EventList.js
import React, { useState, useEffect } from 'react';

const EventList = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    getEvents();
  }, []);

  const getEvents = () => {
    api.get()
    .then(res => res.data)
    .then((data)=>setEvents(data))
    .catch((err)=>alert(err))
  }
  return (
    <div>
      <h2>Club Events</h2>
      <ul>
        {events.map(event => (
          <li key={event.id}>
            {event.event_type} on {event.date}: {event.description}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EventList;
