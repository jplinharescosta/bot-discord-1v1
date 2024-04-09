const { Schema, default: mongoose } = require("mongoose");
const admQueueInfoSchema = new Schema({
  ChatID: { type: String, required: true },
  MessageID: { type: String, required: true },
});

const model = mongoose.model(
  "KikitaDiscordBot",
  admQueueInfoSchema,
  "admQueueInfo"
);

module.exports = model;
