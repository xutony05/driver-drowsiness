import React, { useState } from "react";
import { useNavigate } from "react-router";
import "./styles.css"
 
export default function Create() {
 const [form, setForm] = useState({
    date: "",
    time: "",
    topspeed: "",
    avgspeed: "",
    duration: "",
    level: "",
 });
 const navigate = useNavigate();
 
 // These methods will update the state properties.
 function updateForm(value) {
   return setForm((prev) => {
     return { ...prev, ...value };
   });
 }
  

 // This function will handle the submission.
 async function onSubmit(e) {
   e.preventDefault();
 
   // When a post request is sent to the create url, we'll add a new record to the database.
   const newRecord = { ...form };
 
   await fetch("http://localhost:5000/record/add", {
     method: "POST",
     headers: {
       "Content-Type": "application/json",
     },
     body: JSON.stringify(newRecord),
   })
   .catch(error => {
     window.alert(error);
     return;
   });
 
   setForm({ date: "", time: "", topspeed: "", avgspeed: "", duration: "", level: "", });
   navigate("/");
 }
 
 
 
 // This following section will display the form that takes the input from the user.
 return (
   <div>
     <h3>Create New Record</h3>
     <form onSubmit={onSubmit}>
       <div className="form-group" >
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
       <div className="form-group" style={{marginBottom: 10}}>
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
       <div className="form-group">
         <input
           type="submit"
           value="Create Record"
           className="btn btn-primary"
         />
       </div>
     </form>
   </div>
 );
}