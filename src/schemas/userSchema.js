const { Schema, default: mongoose } = require("mongoose");
const userSchema = new Schema({
  UserID: { type: String, required: true },
  Win: { type: Number, default: 0 },
  Loss: { type: Number, default: 0 },
  TotalProfit: { type: Number, default: 0 },
  DayProfit: { type: Number, default: 0 },
});

const model = mongoose.model("KikitaDiscordBot", pvpInfoSchema, "usersInfo");

module.exports = model;
