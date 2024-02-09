const mongoose = require("mongoose");

const experienceSchema = new mongoose.Schema({
  query: { type: String, default: null },
  author: { type: String },
  authorID: { type: String},
  authorcontact: {type: String,default: null},
  authoremail: {type: String},
  authorlinkedin: {type: String },
  views: { type: Number},
  company: {type: String},
  year: {type: String},
  expname: { type: String},
}, { timestamps: true });

module.exports = mongoose.model("Experience", experienceSchema);