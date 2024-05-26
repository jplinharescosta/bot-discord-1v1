const { Schema, default: mongoose } = require("mongoose");
const monthRankingSchema = new Schema({
  UserID: String,
  Win: { type: Number, default: 0 },
  Loss: { type: Number, default: 0 },
  TotalWon: { type: Number, default: 0 },
  DayProfit: { type: Number, default: 0 },
});

module.exports =
  mongoose.models.monthRankingSchema ||
  mongoose.model("month-ranking", monthRankingSchema, "month-ranking");
