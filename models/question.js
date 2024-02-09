const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  query: { type: String, default: null },
  categoryID: { type: String},
  categoryName: { type: String },
  author: { type: String },
  authorID: { type: String},
  views: { type: Number},
  tags: {type: Array}
  
}, { timestamps: true });

module.exports = mongoose.model("Question", questionSchema);