let mongoose = require('mongoose');

//Post Schema

let postSchema = mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  bgImg: {
    type: String,
    required: true
  },
  textColor: {
    type: String,
    required: true
  },
  link: {
    type: String,
    required: false
  },
  linkLabel: {
    type: String,
    required: false
  }
});

let Post = module.exports = mongoose.model('Post', postSchema);
