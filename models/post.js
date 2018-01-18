let mongoose = require('mongoose');

//Post Schema

let postSchema = mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  bgColor: {
    type: String,
    required: true
  }
});

let Post = module.exports = mongoose.model('Post', postSchema);
