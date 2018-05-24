const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');

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
let User = require('./models/user');

//Load View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

/**BODY PARSER MIDDLEWARE**/

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

/*************************/

// Set public folder
app.use(express.static(path.join(__dirname, 'public')));

//use sessions for tracking logins
app.use(session({
  secret: '9/11 was an inside job',
  resave: true,
  saveUninitialized: false
}));

//Serve Main Route
app.get('/', function(req, res) {
  // res.render('index', {
  //   title: "Home Page"
  // });

  Post.find({}, function(err, posts){
    if(err){ // If an error occurs, output the error message
      console.log("ERROR_GetPosts: " + err);
    } else { // Ohterwise, there are no errors, so render the page
      res.render('viewPosts', {
        title: "Posts List",
        posts : posts
      });
    }

  });


});

//Serve New Post Page
app.get('/posts/create', function(req, res, next) {
  if (req.session && req.session.userId) {
    res.render('createPost', {
      title: "Create Post"
    });
  } else {
    req.redirectPath = "/posts/create";
    res.redirect("/users/login");
  }

});


// Create Post POST Request
app.post('/posts/create', function(req, res){
  let post = new Post();
  post.title = req.body.title;
  post.content = req.body.content;
  post.bgImg = req.body.bgImg;
  post.textColor = req.body.textColor;
  if(req.body.link !== "") {
    if(req.body.linkLabel !== "") {
      post.link = req.body.link;
      post.linkLabel = req.body.linkLabel;
    }
  }

  post.save(function(err){
    if(err) {
      console.log("ERROR_CreatePost: " + err);
      return;
    } else {
      console.log("New post added!");
      res.redirect('/posts/')
    }
  });
});

//Serve Posts Page
app.get('/posts/', function(req, res) {

  //Query the DB to get the posts
  Post.find({}, function(err, posts){
    if(err){ // If an error occurs, output the error message
      console.log("ERROR_GetPosts: " + err);
    } else { // Ohterwise, there are no errors, so render the page
      res.render('viewPosts', {
        title: "Posts List",
        posts : posts
      });
    }

  });
});



app.get('/users/profile', function(req, res, next) {
  console.log("estou aqui, a seesion user id é: " + req.session.userId);

  //Query the DB to get the users
  User.find({'_id':req.session.userId}, function(err, user){
    if(err){ // If an error occurs, output the error message
      console.log("ERROR_GetUsers: " + err);
    } else { // Ohterwise, there are no errors, so render the page
      if(user.length === 0) res.redirect('/posts/');
      else {
        res.render('userPage', {
          title: "User Area",
          user : user[0]
        });
      }
    }

  });
});

//Serve Register Users Page
app.get('/users/register', function(req, res) {

  res.render('registerUser', {
    title: "Register User"
  });

});

app.post('/users/register', function(req, res, next) {
  if (req.body.email &&
  req.body.username &&
  req.body.password) {

    if (req.body.passwordConfirmation !== req.body.password) {
      let err = new Error('Passwords do not match.');
      err.status = 400;
      res.send("Passwords don't match");
      return next(err);
    }

    let userData = {
      email: req.body.email,
      username: req.body.username,
      password: req.body.password,
      passwordConfirmation: req.body.passwordConfirmation
    }

    //use Schema.create to insert data into the db
    User.create(userData, function (err, user) {
      if (err) {
        return next(err)
      } else {
        req.session.userId = user._id;
        return res.redirect('/users/profile');
      }
    })
  }
  else { // Post Information incomplete or invalid
    let err = new Error('All fields must be filled in.');
    err.status = 400;
    res.send("All fields must be filled in.");
    return next(err);
  }
});

app.get('/users/login', function(req, res) {

  res.render('userLogin', {
    title: "User Login"
  });

});

app.post('/users/login', function(req, res, next) {
  if (req.body.email && req.body.password) {

    User.authenticate(req.body.email, req.body.password, function (error, user) {
      if (error || !user) {
        var err = new Error('Wrong email or password.');
        err.status = 401;
        return next(err);
      } else {
        req.session.userId = user._id;
        res.redirect(redirectPath);
      }
    });

  }
  else { // Post Information incomplete or invalid
    let err = new Error('All fields must be filled in.');
    err.status = 400;
    res.send("All fields must be filled in.");
    return next(err);
  }
});


// Start the Server on port 8080
app.listen(8080, function(){
  console.log("Started Server on port 8080");
});
