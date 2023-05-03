import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import "./styles.css"
 
export default function Edit() {
 const [form, setForm] = useState({
    date: "",
    time: "",
    topspeed: "",
    avgspeed: "",
    duration: "",
    level: "",
    records: [],
 });
 const params = useParams();
 const navigate = useNavigate();
 
 useEffect(() => {
   async function fetchData() {
     const id = params.id.toString();
     const response = await fetch(`http://localhost:5000/record/${params.id.toString()}`);
 
     if (!response.ok) {
       const message = `An error has occurred: ${response.statusText}`;
       window.alert(message);
       return;
     }
 
     const record = await response.json();
     if (!record) {
       window.alert(`Record with id ${id} not found`);
       navigate("/");
       return;
     }
 
     setForm(record);
   }
 
   fetchData();
 
   return;
 }, [params.id, navigate]);
 
 // These methods will update the state properties.
 function updateForm(value) {
   return setForm((prev) => {
     return { ...prev, ...value };
   });
 }
 
 async function onSubmit(e) {
   e.preventDefault();
   const editedRecord = {
      date: req.body.date,
      time: req.body.time,
      topspeed: req.body.topspeed,
      avgspeed: req.body.avgspeed,
      duration: req.body.duration,
      level: req.body.level,
   };
 
   // This will send a post request to update the data in the database.
   await fetch(`http://localhost:5000/update/${params.id}`, {
     method: "POST",
     body: JSON.stringify(editedRecord),
     headers: {
       'Content-Type': 'application/json'
     },
   });
 
   navigate("/");
 }
 
 // This following section will display the form that takes input from the user to update the data.
 return (
   <div>
     <h3>Update Record</h3>
     <form onSubmit={onSubmit}>
       <div className="form-group">
         <label htmlFor="date">Date: </label>
         <input
           type="date"
           className="form-control"
           min="2022-11-01" 
           id="date"
           value={form.date}
           onChange={(e) => updateForm({ date: e.target.value })}
         />
       </div>
       <div className="form-group">
         <label htmlFor="time">Time: </label>
         <input
           type="time"
           className="form-control"
           id="time"
           value={form.time}
           onChange={(e) => updateForm({ time: e.target.value })}
         />
       </div>
       <div className="form-group">
         <label htmlFor="topspeed">Top Speed: </label>
         <input
           type="number"
           min="0" 
           max="500"
           className="form-control"
           id="topspeed"
           value={form.topspeed}
           onChange={(e) => updateForm({ topspeed: e.target.value })}
         />
         <span htmlFor="duration" class= "suffix">Km/H </span>
       </div>
       <div className="form-group">
         <label htmlFor="avgspeed">Average Speed: </label>
         <input
           type="number"
           min="0" 
           max="500"
           className="form-control"
           id="avgspeed"
           value={form.avgspeed}
           onChange={(e) => updateForm({ avgspeed: e.target.value })}
         />
         <span htmlFor="duration" class= "suffix">Km/H </span>
       </div>
       <div className="form-group">
         <label htmlFor="duration">Trip Duration: </label>
         <input
           type="number"
           min="0" 
           max="100"
           className="form-control"
           id="duration"
           value={form.duration}
           onChange={(e) => updateForm({ duration: e.target.value })}
         />
         <span htmlFor="duration" class= "suffix">Hours </span>
       </div>
       <div className="form-group">
         <div className="form-check form-check-inline">
           <input
             className="form-check-input"
             type="radio"
             name="riskLevel"
             id="levelOne"
             value="Level 1"
             checked={form.level === "Level 1"}
             onChange={(e) => updateForm({ level: e.target.value })}
           />
           <label htmlFor="levelOne" className="form-check-label">Level 1</label>
         </div>
         <div className="form-check form-check-inline">
           <input
             className="form-check-input"
             type="radio"
             name="riskLevel"
             id="levelTwo"
             value="Level 2"
             checked={form.level === "Level 2"}
             onChange={(e) => updateForm({ level: e.target.value })}
           />
           <label htmlFor="levelTwo" className="form-check-label">Level 2</label>
         </div>
         <div className="form-check form-check-inline">
           <input
             className="form-check-input"
             type="radio"
             name="riskLevel"
             id="levelThree"
             value="Level 3"
             checked={form.level === "Level 3"}
             onChange={(e) => updateForm({ level: e.target.value })}
           />
           <label htmlFor="levelThree" className="form-check-label">Level 3</label>
       </div>
       </div>
       <br />
 
       <div className="form-group">
         <input
           type="submit"
           value="Update Record"
           className="btn btn-primary"
         />
       </div>
     </form>
   </div>
 );
}