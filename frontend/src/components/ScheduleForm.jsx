import React, { useState } from "react";
import { createSchedule, updateSchedule } from "../api";

const ScheduleForm = ({ schedule, onSave }) => {
  const [formData, setFormData] = useState(
    schedule || {
      event_name: "",
      event_desc: "",
      event_date_start: "",
      event_date_end: "",
      location: "",
      event_types: "club_matches",
    }
  );

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (schedule) {
        await updateSchedule(schedule.event_id, formData);
      } else {
        await createSchedule(formData);
      }
      onSave();
    } catch (error) {
      console.error("Error saving schedule:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Event Name:
        <input
          type="text"
          name="event_name"
          value={formData.event_name}
          onChange={handleChange}
        />
      </label>
      <label>
        Description:
        <textarea
          name="event_desc"
          value={formData.event_desc}
          onChange={handleChange}
        />
      </label>
      <label>
        Start Date:
        <input
          type="datetime-local"
          name="event_date_start"
          value={formData.event_date_start}
          onChange={handleChange}
        />
      </label>
      <label>
        End Date:
        <input
          type="datetime-local"
          name="event_date_end"
          value={formData.event_date_end}
          onChange={handleChange}
        />
      </label>
      <label>
        Location:
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleChange}
        />
      </label>
      <label>
        Event Type:
        <select
          name="event_types"
          value={formData.event_types}
          onChange={handleChange}
        >
          <option value="club_matches">Club Matches</option>
          <option value="club_training">Club Training</option>
          <option value="agm">Annual General Meeting</option>
          <option value="trial_selection">Trial Selection</option>
          <option value="promotion">Promotion</option>
        </select>
      </label>
      <button type="submit">Save</button>
    </form>
  );
};

export default ScheduleForm;
