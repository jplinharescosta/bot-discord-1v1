const { Schema, default: mongoose } = require("mongoose");
const admDataInfos = new Schema({
  UserId: { type: String, required: true },
  ammountBets: Number,
  registeredDate: String,
});

module.exports =
  mongoose.models.admDataInfos ||
  mongoose.model("admDataInfos", pvpInfoSchema, "admDataInfos");
