import React, { useState } from "react";
import ScheduleList from "../components/ScheduleList";
import ScheduleForm from "../components/ScheduleForm";

const SchedulePage = () => {
  const [editingSchedule, setEditingSchedule] = useState(null);

  const handleEdit = (schedule) => {
    setEditingSchedule(schedule);
  };

  const handleSave = () => {
    setEditingSchedule(null); // Close the form after save
  };

  return (
    <div>
      {editingSchedule ? (
        <ScheduleForm schedule={editingSchedule} onSave={handleSave} />
      ) : (
        <div>
          <button onClick={() => setEditingSchedule({})}>Add New Schedule</button>
          <ScheduleList onEdit={handleEdit} />
        </div>
      )}
    </div>
  );
};

export default SchedulePage;
