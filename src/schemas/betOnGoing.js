const { Schema, default: mongoose } = require("mongoose");
const betOnGoingSchema = new Schema({
  betId: String,
  Player1: String,
  Player2: String,
  ADM: String,
  Status: String,
  betPrice: String,
  createdTime: String,
});

module.exports =
  mongoose.models.betOnGoing ||
  mongoose.model("betOnGoing", betOnGoingSchema, "betOnGoing");
