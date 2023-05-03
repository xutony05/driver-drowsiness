//////////////////////////////////settings
var lowwarning = new Audio("audio/warning2.mp3");
var mediumwarning = new Audio("audio/warning3.mp3");
var highwarning = new Audio("audio/warning1.mp3");
var volume_value = 50;
var yawning_percent;
var eyes_percent;
var faceMeshResults;
var drowsy_eye_count;
var mouth_open_count;
var eyes_closed_count;

function volume(volume_value) {
  var sound = lowwarning;
  //var sound2 = mediumwarning;
  var sound3 = highwarning;
  document.getElementById("volume-slider").innerHTML = volume_value;
  sound.volume = volume_value / 100;
  //sound2.volume = volume_value / 100;
  sound3.volume = volume_value / 100;
  sound.play();
  sliderValue = document.querySelector(".sliderValue");
  sliderValue.innerHTML = volume_value;

  localStorage.setItem("storedVolume", volume_value);
}

function invalidLogin(){
  document.getElementById("error").style.visibility = "visible";
}

/*function setVoume(){
    document.getElementById("volume-slider").innerHTML=volume_value;
    localStorage.setItem("storedVolume",volume_value);
}*/

function playWarning1() {
  volume_value = localStorage.getItem("storedVolume");
  lowwarning.volume = volume_value / 100;
  lowwarning.play();
}

function stopWarning1()
{
  lowwarning.pause();
}
/*
function playWarning2() {
  volume_value = localStorage.getItem("storedVolume");
  mediumwarning.volume = volume_value / 100;
  mediumwarning.play();
}

function stopWarning2()
{
  mediumwarning.pause();
}*/

function playWarning3() {
  volume_value = localStorage.getItem("storedVolume");
  highwarning.volume = volume_value / 100;
  highwarning.play();
}

function stopWarning3()
{
  highwarning.pause();
}

///////////////////////index page

function drive() {
  document.getElementById("parkbtn").style.visibility = "visible";
//  document.getElementById("drivebtn").style.visibility = "visible";
//  document.getElementById("drivebtn2").style.visibility = "visible";
//  document.getElementById("drivebtn3").style.visibility = "visible";
  startCapture();

  drowsy_eye_count = 0;
  mouth_open_count = 0;
  eyes_closed_count = 0;
}

const openModalButtons = document.querySelectorAll("[data-modal-target]");
const closeModalButtons = document.querySelectorAll("[data-close-button]");
const overlay = document.getElementById("overlay");

var sTime;

openModalButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const modal = document.querySelector(button.dataset.modalTarget);
    openModal(modal);
  });
});

closeModalButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const modal = button.closest(".modal");
    closeModal(modal);
  });
});

function openModal(modal) {
  if (modal == null) return;
  modal.classList.add("active");
  overlay.classList.add("active");
}

function closeModal(modal){
  if(modal ==null) return
  modal.classList.remove('active')
  overlay.classList.remove('active')
}

///////setting for time duration

function setDuration() {
  var type = document.getElementsByName("time_duration");
  if (type[0].checked) {
    timeDuration = document.getElementById("5sec").value;
    //right now setTime is a string
    //alert(typeof timeDuration);
    sTime = parseInt(timeDuration);
    //alert(typeof sTime);
  }
  if (type[1].checked) {
    timeDuration = document.getElementById("10sec").value;
    //alert(timeDuration);
    sTime = parseInt(timeDuration);
    //alert(typeof sTime);
  }
  if (type[2].checked) {
    timeDuration = document.getElementById("20sec").value;
    //alert(timeDuration);
    sTime = parseInt(timeDuration);
    //alert(sTime);
  }

  localStorage.setItem("storedTime", sTime);
}

//function to record information after parking
var alerts = [];
var times = [];

function parkCar() {
  var date = new Date();
  const jsonAlerts = [];
  const jsonTimes = [];

  //check if there are no elements in the arrays
  if (alerts.length == 0) {
    alerts.push(JSON.stringify("Safe Ride"));
  }

  if (times.length == 0) {
    times.push(
      JSON.stringify(
        date.getHours().toString().padStart(2, "0") +
          ":" +
          date.getMinutes().toString().padStart(2, "0") +
          ":" +
          date.getSeconds().toString().padStart(2, "0")
      )
    );
  }

  //convert array elements to json
  alerts.forEach(function (element) {
    jsonAlerts.push(
      JSON.stringify(element).replace(/\\/g, "").replace(/"/g, "")
    );
  });

  times.forEach(function (element) {
    jsonTimes.push(
      JSON.stringify(element).replace(/\\/g, "").replace(/"/g, "")
    );
  });

  //records alert information to data base
  var recordPark = JSON.stringify({
    date:
      date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
    time: jsonTimes,
    level: jsonAlerts,
    speed: Math.floor(Math.random() * (150 - 50) + 50) + " km/h",
    duration:
      Math.floor(Math.random() * (8 - 0.1) + 0.1) +
      " hours " +
      Math.floor(Math.random() * (59 - 0) + 0) +
      " minutes",
  });
  fetch("http://localhost:5001/record/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: recordPark,
  }).catch((error) => {
    console.log(error);
    return;
  });

  //stops camera
  clearInterval(captureFreq);
}

////////////////////////////////////////////timer 1

let minute = 0;
let second = 0;
let millisecond = 0;

let cron;

function start() {
  var date = new Date();
  alerts.push(JSON.stringify("Level 1"));
  times.push(
    JSON.stringify(
      date.getHours().toString().padStart(2, "0") +
        ":" +
        date.getMinutes().toString().padStart(2, "0") +
        ":" +
        date.getSeconds().toString().padStart(2, "0")
    )
  );

  pause();
  //sTime right now is undefined
  cron = setInterval(() => {
    timer();
  }, 10);
}

function pause() {
  clearInterval(cron);
}

//resets all values when reset button is pushed
function reset() {
  minute = 0;
  second = 0;
  millisecond = 0;

  document.getElementById("minute").innerText = "00";
  document.getElementById("second").innerText = "00";
}

function timer() {
  sTime = localStorage.getItem("storedTime");

  if ((millisecond += 10) == 1000) {
    millisecond = 0;
    second++;
  }
  //if 60 seconds pass then minute increments and seconds display resets
  if (second == 60) {
    second = 0;
    minute++;
  }
  //sTime undefined right now
  if (second == sTime) {
    reset();
    pause();
    currentModal1 = document.getElementById("modal");
    closeModal(currentModal1);
  }

  document.getElementById("minute").innerText = returnData(minute);
  document.getElementById("second").innerText = returnData(second);
}

function returnData(input) {
  return input > 10 ? input : `0${input}`;
}

/////////////////////////////////////////////////timer 2
/*
let minute2 = 0;
let second2 = 0;
let millisecond2 = 0;

let cron2;

function start2() {
  var date = new Date();
  alerts.push(JSON.stringify("Level 2"));
  times.push(
    JSON.stringify(
      date.getHours().toString().padStart(2, "0") +
        ":" +
        date.getMinutes().toString().padStart(2, "0") +
        ":" +
        date.getSeconds().toString().padStart(2, "0")
    )
  );

  pause2();
  cron2 = setInterval(() => {
    timer2();
  }, 10);
}

function pause2() {
  clearInterval(cron2);
}

//resets all values when reset button is pushed
function reset2() {
  minute2 = 0;
  second2 = 0;
  millisecond2 = 0;

  document.getElementById("minute2").innerText = "00";
  document.getElementById("second2").innerText = "00";
}

function timer2() {
  sTime = localStorage.getItem("storedTime");
  if ((millisecond2 += 10) == 1000) {
    millisecond2 = 0;
    second2++;
  }
  //if 60 seconds pass then minute increments and seconds display resets
  if (second2 == 60) {
    second2 = 0;
    minute2++;
  }

  if (second2 == sTime) {
    reset2();
    pause2();
    currentModal2 = document.getElementById("modal2");
    closeModal(currentModal2);
  }

  document.getElementById("minute2").innerText = returnData2(minute2);
  document.getElementById("second2").innerText = returnData2(second2);
}
*/
function returnData2(input) {
  return input > 10 ? input : `0${input}`;
}

/////////////////////////////////////////////////timer 3

let minute3 = 0;
let second3 = 0;
let millisecond3 = 0;

let cron3;

function start3() {
  var date = new Date();
  alerts.push(JSON.stringify("Level 3"));
  times.push(
    JSON.stringify(
      date.getHours().toString().padStart(2, "0") +
        ":" +
        date.getMinutes().toString().padStart(2, "0") +
        ":" +
        date.getSeconds().toString().padStart(2, "0")
    )
  );

  pause3();
  cron3 = setInterval(() => {
    timer3();
  }, 10);
}

function pause3() {
  clearInterval(cron3);
}

//resets all values when reset button is pushed
function reset3() {
  minute3 = 0;
  second3 = 0;
  millisecond3 = 0;

  document.getElementById("minute3").innerText = "00";
  document.getElementById("second3").innerText = "00";
}

function timer3() {
  sTime = localStorage.getItem("storedTime");
  if ((millisecond3 += 10) == 1000) {
    millisecond3 = 0;
    second3++;
  }
  //if 60 seconds pass then minute increments and seconds display resets
  if (second3 == 60) {
    second3 = 0;
    minute3++;
  }

  if (second3 == sTime) {
    reset3();
    pause3();
    currentModal3 = document.getElementById("modal3");
    closeModal(currentModal3);
  }

  document.getElementById("minute3").innerText = returnData2(minute3);
  document.getElementById("second3").innerText = returnData2(second3);
}

function returnData3(input) {
  return input > 10 ? input : `0${input}`;
}

let btnTime = document.querySelector("button");
let result = document.querySelector("h1");

// btnTime.addEventListener('click', () =>{
//     let selected = document.querySelector('input[type="radio"]:checked');
//     result.innerHTML = selected.parentElement.textContent;
// })

///////////////////////park page
async function getLatestData(url) {
  // Storing response
  const response = await fetch(url);

  // Storing data in form of JSON
  var dataLatest = await response.json();
  showLatest(dataLatest);
}

getLatestData("http://localhost:5001/record/");

// Function to define innerHTML for HTML table
function showLatest(data) {
  let tab = `<tr>
          <th>Date</th>
          <th>Time</th>
          <th>Levels</th>
          <th>Average Trip Speed</th>
          <th>Trip Duration</th>
         </tr>`;

  let x = 0;
  for (let i = 0; i < data.length - 1; i++) {
    x++;
  }

  const myJSONLength = Object.keys(data[x].time).length;
  tab += `<tr>`;
  tab += `<td rowspan="${myJSONLength + 1}">${data[x].date} </td>`;
  tab += `<tr>
                <td>${data[x].time[0]}</td>
                <td>${data[x].level[0]}</td>
                <td rowspan="${myJSONLength}">${data[x].speed}</td>  
                <td rowspan="${myJSONLength}">${data[x].duration}</td>
            </tr>
        `;
  for (let i = 1; i < myJSONLength; i++) {
    tab += `<tr>
                    <td>${data[x].time[i]}</td>
                    <td>${data[x].level[i]}</td>
                </tr>`;
  }
  tab += `</tr>`;

  // Setting innerHTML as tab variable
  document.getElementById("trips").innerHTML = tab;
}

///////////////////////admin page

async function getData(url) {
  // Storing response
  const response = await fetch(url);

  // Storing data in form of JSON
  var data = await response.json();
  show(data);
}

getData("http://localhost:5001/record/");

// Function to define innerHTML for HTML table
function show(data) {
  let tab = `<tr>
        <th>Date</th>
        <th>Time</th>
        <th>Level</th>
        <th>Average Trip Speed</th>
        <th>Trip Duration</th>
         </tr>`;

  // Loop to access all rows
  for (let x = 0; x < data.length; x++) {
    const myJSONLength = Object.keys(data[x].time).length;
    tab += `<tr>`;
    tab += `<td rowspan="${myJSONLength + 1}">${data[x].date} </td>`;
    tab += `<tr>
                    <td>${data[x].time[0]}</td>
                    <td>${data[x].level[0]}</td>
                    <td rowspan="${myJSONLength}">${data[x].speed}</td>  
                    <td rowspan="${myJSONLength}">${data[x].duration}</td>
                </tr>
            `;
    for (let i = 1; i < myJSONLength; i++) {
      tab += `<tr>
                        <td>${data[x].time[i]}</td>
                        <td>${data[x].level[i]}</td>
                    </tr>`;
    }
    tab += `</tr>`;
  }

  // Setting innerHTML as tab variable
  document.getElementById("tripsAll").innerHTML = tab;
}

//////////////////////////////////Camera Functionality
let camera_button = document.querySelector("#startbtn");
let video = document.querySelector("#video");
let context = document.querySelector("#canvas");
camera_button.addEventListener("click", async function () {
  //activates the camera and renders it
  let stream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: false,
  });
  video.srcObject = stream;
});

let captureFreq;
function startCapture() {
  captureFreq = setInterval(capture, 500); //sets the camera capture function to trigger every ___ seconds
}

function capture() {
  context.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height); //captures the image
  let image_data_url = canvas.toDataURL("image/jpeg");
  // get prediction
  fetch("http://127.0.0.1:5000/predict", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify({
      img: image_data_url,
    }),
  }).then((response) => {
    response.json().then((text) => {
      console.log(text);
      reportDrowsiness(text.yawnning, text.eyes, text.faceMeshResults);
      //alert("Yawn: " + text.yawnning + "\n" + "Eyes: " + text.eyes);
    });
  });

  //stores the image to the data base
  var date = new Date();
  fetch("http://localhost:5001/record/addpic", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      date:
        date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
      time: date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds(),
      img: image_data_url,
    }),
  }).catch((error) => {
    console.log(error);
    return;
  });
}

async function testCam() {
  let vid = document.querySelector("#videotest");
  let stream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: false,
  });
  vid.srcObject = stream;
}

// Driver alerts logic
function reportDrowsiness(yawning_percent, eyes_percent, faceMeshResults){

  //yawn warning is triggered when yawning for 1 second --> LOW WARNING
  if(yawning_percent > 70 && faceMeshResults == true){
    mouth_open_count++;
    if(mouth_open_count == 2)
    {
      start();

      const modal = document.getElementById("modal");
      openModal(modal);

      const modal2 = document.getElementById("modal3");
      closeModal(modal2);
      
      //stop other warnings already playing
      stopWarning3();
      //play new warning 
      playWarning1();
      mouth_open_count = 0;
    }
  }
  else{
    mouth_open_count = 0;
  }

  //drowsy eye warning is triggered when you have drowsy eyes for 3 secs --> LOW WARNING
  if(eyes_percent > 20 && faceMeshResults == true)
  {
    drowsy_eye_count++;
    if(drowsy_eye_count == 6)
    {
        start();
        const modal1 = document.getElementById("modal");
        openModal(modal1);

        const modal2 = document.getElementById("modal3");
        closeModal(modal2);

        //stop other warnings already playing
        stopWarning3();
        //play new warning  
        playWarning1();
        drowsy_eye_count = 0;
    }
  }
  else{
    drowsy_eye_count = 0;
  }

  //when your eyes are very much closed for 1.5 secs --> HIGH WARNING
  if(eyes_percent > 90 && faceMeshResults == true)
  {
    eyes_closed_count++;
    if(eyes_closed_count == 3)
    {
        
       
        start3();

        const modal2 = document.getElementById("modal3");
        openModal(modal2);
        const modal1 = document.getElementById("modal");
        closeModal(modal1);
        //stop other warnings already playing
        stopWarning1();
        //play new warning
        playWarning3();
        eyes_closed_count = 0;
    }
  }
  else{
    eyes_closed_count = 0;
  }
}