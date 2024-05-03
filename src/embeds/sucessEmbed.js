const { EmbedBuilder } = require("discord.js");

const sucessEmbed = (msg) => {
  const embed = new EmbedBuilder().setDescription(msg).setColor("Green");

  return embed;
};

module.exports = sucessEmbed;
