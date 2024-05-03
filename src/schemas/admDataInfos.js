const { Schema, default: mongoose } = require("mongoose");
const admDataInfos = new Schema({
  UserId: { type: String, required: true },
  ammountBets: { type: Number, default: 0 },
  categoryId: { type: String, required: true },
  linkPix: String,
  pixQrCode: String,
  registeredDate: String,
});

module.exports =
  mongoose.models.admDataInfos ||
  mongoose.model("admDataInfos", admDataInfos, "admDataInfos");
