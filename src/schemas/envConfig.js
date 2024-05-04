const { Schema, default: mongoose } = require("mongoose");

const envSchema = new Schema({
  Name: { type: String, default: "envConfig" },
  WelcomeChatID: String,
  OrgName: { type: String, default: "ORG ACE" },
  MemberRoleID: String,
  MediatorRoleId: String,
  ClientIDCreator: String,
  ClientIDAssistant: String,
  GuildID: String,
  BlackListChatID: String,
  ReachargeCategoryID: { type: String, default: "" },
  DefaultThumbNail: { type: String, default: "" },
  ChannelValue: { type: String, default: "1.80" },
  LinkToRulesChannel: { type: String, default: "" },
  TaxToMediator: { type: String, default: "0" },
});

module.exports =
  mongoose.models.envSchema ||
  mongoose.model("envConfig", envSchema, "envConfig");
