const express = require('express');
const path = require('path');
const mongoose = require('mongoose');

//Connect to MongoDB Database
mongoose.connect('mongodb://localhost/postsManager');
let db = mongoose.connection;

//Check Connection
db.once('open', function(){
  console.log("Connected to MongoDB");
});

//Check for DB error
db.on('error', function(err) {
  console.log("DB_ERROR:" + err);
});

//Init App
const app = express();

//Get DB Models
let Post = require('./models/post');

//Load View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//Serve Main Route
app.get('/', function(req, res) {
  res.render('index');
});

//Serve New Post Page
app.get('/posts/create', function(req, res) {
  res.render('createPost');
});

//Serve Posts Page
app.get('/posts/', function(req, res) {

  //Query the DB to get the posts
  Post.find({}, function(err, posts){
    if(err){
      console.log("ERROR_GetPosts: " + err);
    } else {
      res.render('viewPosts', {
        title: "Posts List",
        posts : posts
      });
    }

  });
});

app.listen(8080, function(){
  console.log("Started Server on port 8080");
});
