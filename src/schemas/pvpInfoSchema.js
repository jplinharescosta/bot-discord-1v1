const { Schema, default: mongoose } = require("mongoose");
const pvpInfoSchema = new Schema({
  ChatID: { type: String, required: true },
  MessageID: { type: String, required: true },
  CategoryID: { type: String, required: false },
  Price: { type: Number, required: true },
  Mode: { type: String, required: true },
});

module.exports =
  mongoose.models.pvpInfos ||
  mongoose.model("pvpInfos", pvpInfoSchema, "pvpInfos");
