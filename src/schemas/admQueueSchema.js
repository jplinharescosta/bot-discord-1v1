const { Schema, default: mongoose } = require("mongoose");

const admQueueSchema = new Schema({
  GuildID: { type: String, required: true },
  MessageID: { type: String, required: true },
  ChatID: { type: String, required: true },
});

module.exports =
  mongoose.models.admQueueSchema ||
  mongoose.model("admQueueConfig", admQueueSchema, "admQueueConfig");
