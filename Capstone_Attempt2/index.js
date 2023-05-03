const express = require("express");
const cookieParser = require('cookie-parser');

const app = express();

//serve static content through virutal routing
app.use(express.static("static"));

app.use(cookieParser("secret"));

app.use(express.urlencoded({
  extended : true 
}))

//var lowwarning = new Audio('static/audio/warning2.mp3');
//var mediumwarning = new Audio('audioVisual/warning3.mp3');
//var highwarning = new Audio('audioVisual/warning4.mp3');

//dynamic handling
app.get("/settings", (req, res) => {
  res.redirect("/settings.html");
});

app.get("/park", (req, res) => {
  res.redirect("/park.html");
});

app.get("/index", (req, res) => {
  res.redirect("/index.html");
});

app.get("/admin", (req, res) => {
  res.redirect("/admin.html");
});

app.post('/login', (req, res) => {

  let userName = req.body.username;
  let password = req.body.password;
  let message = "Access Denied"
  if(userName == 'admin' && password == '123'){
    let message = "Welcome";
    res.redirect("/admin.html");

    res.cookie("usr", userName);
    res.cookie("pwd", password, {signed : true})
  }
  else{
    
  }

  
  //res.send(message);
})


app.listen(2000);
