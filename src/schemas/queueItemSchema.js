const { Schema, default: mongoose } = require("mongoose");

const queueItemSchema = new Schema({
  userName: { type: String, required: true },
  queueName: { type: String, required: true },
});

module.exports =
  mongoose.models.queueItemSchema ||
  mongoose.model("QueueItem", queueItemSchema, "QueueItem");
