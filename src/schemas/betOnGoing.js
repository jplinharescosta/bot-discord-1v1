const { Schema, default: mongoose, Types } = require("mongoose");

const betOnGoingData = new Schema({
  betId: String,
  Format: String,
  Channel: String,
  ChannelNumber: String,
  bettors: {
    Player1: {
      id: String,
      win: { type: Number, default: 0 },
      lose: { type: Number, default: 0 },
    },
    Player2: {
      id: String,
      win: { type: Number, default: 0 },
      lose: { type: Number, default: 0 },
    },
  },
  ADM: String,
  Status: { type: String, default: "on_going" },
  betPrice: String,
  historyMessages: Array,
  createdTime: String,
  endTime: String,
});

module.exports =
  mongoose.models.betOnGoingData ||
  mongoose.model("betOnGoing", betOnGoingData, "betOnGoing");
