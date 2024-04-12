const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
  },
  mobile: {
    type: String,
    required: true,
    unique: true,
    match: /^(\+[0-9]{2}-[0-9]{10}|[0-9]{10})$/,
  },
  image: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  is_admin: {
    type: Number,
    required: true,
  },
  is_verified: {
    type: Number,
    default: false,
  },
  token: {
    type : String,
    default : ''
  }
});

module.exports = mongoose.model("User", userSchema);
