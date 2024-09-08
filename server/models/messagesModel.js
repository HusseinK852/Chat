const mongoose = require("mongoose");

const messagesSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
  },
  sender: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  roomNumber: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const Messages = mongoose.model("Messages", messagesSchema);

module.exports = Messages;
