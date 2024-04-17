const { Schema, default: mongoose } = require("mongoose");
const admQueueInfoSchema = new Schema({
  ChatID: { type: String, required: true },
  MessageID: { type: String, required: true },
});

module.exports =
  mongoose.models.admQueueInfoSchema ||
  mongoose.model("admQueueInfo", admQueueInfoSchema, "admQueueInfo");
