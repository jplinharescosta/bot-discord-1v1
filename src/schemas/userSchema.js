const { Schema, default: mongoose } = require("mongoose");
const userDataSchema = new Schema({
  UserID: { type: String, required: true },
  Win: { type: Number, default: 0 },
  Loss: { type: Number, default: 0 },
  TotalProfit: { type: Number, default: 0 },
  DayProfit: { type: Number, default: 0 },
});

module.exports =
  mongoose.models.userDataSchema ||
  mongoose.model("userData", userDataSchema, "userData");
