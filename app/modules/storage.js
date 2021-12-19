const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI, { useMongoClient: true });

let Schema = mongoose.Schema,
  ObjectId = Schema.ObjectId;

let objId = 0;

let User = mongoose.model('User', {
  username: String,
  password: String,
  email: String,
  avatar: String,
  role: String,
  tlgUser: String,
});

let Account = mongoose.model('Account', {
  authorId: Object,
  title: String,
  login: String,
  password: String,
  description: String,
  importance: Number,
  sell: String,
});

module.exports = { User, objId, Account, Schema };
