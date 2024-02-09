const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const dislikesSchema = new mongoose.Schema({
  userID: { 
    type: Schema.Types.ObjectId,
    ref: 'user'
  },
  answerID: 
  { 
      type: Schema.Types.ObjectId,
      ref: 'answer'
  }
}, { timestamps: true });


module.exports = mongoose.model("Dislikes", dislikesSchema);