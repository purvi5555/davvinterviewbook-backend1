const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema({
  questionID: { type: String },
  answer: { type: String, default: null },
  user: { type: String },
  userID: { type: String},
  query: { type: String},
}, { timestamps: true });

module.exports = mongoose.model("Answer", answerSchema);