const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, default: null },
  email: { type: String, unique: true },
  password: { type: String },
  ucategory :{type:String, default:"senior"},
  token: { type: String },
  photo: { type: String },
  about: { type: String },
  location: { type: String },
  title: { type: String },
  wlink: { type: String },
  tusername: { type: String },
  gusername: { type: String },
}, { timestamps: true });

module.exports = mongoose.model("user", userSchema);