const { EmbedBuilder } = require("discord.js");

const errorEmbed = (msg) => {
  const inBetEmbed = new EmbedBuilder().setDescription(msg).setColor("Red");

  return inBetEmbed;
};

module.exports = errorEmbed;
