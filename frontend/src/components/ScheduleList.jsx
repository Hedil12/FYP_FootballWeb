import React, { useEffect, useState } from "react";
import { fetchSchedules, deleteSchedule } from "../api";

const ScheduleList = ({ onEdit }) => {
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    try {
      const data = await fetchSchedules();
      setSchedules(data);
    } catch (error) {
      console.error("Error fetching schedules:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteSchedule(id);
      loadSchedules(); // Refresh the list after deletion
    } catch (error) {
      console.error("Error deleting schedule:", error);
    }
  };

  return (
    <div>
      <h1>Schedule Management</h1>
      <ul>
        {schedules.map((schedule) => (
          <li key={schedule.event_id}>
            <h2>{schedule.event_name}</h2>
            <p>{schedule.event_desc}</p>
            <p>
              Start: {new Date(schedule.event_date_start).toLocaleString()} | End:{" "}
              {new Date(schedule.event_date_end).toLocaleString()}
            </p>
            <p>Location: {schedule.location}</p>
            <button onClick={() => onEdit(schedule)}>Edit</button>
            <button onClick={() => handleDelete(schedule.event_id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ScheduleList;
