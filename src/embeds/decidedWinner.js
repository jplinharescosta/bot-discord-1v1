const { EmbedBuilder } = require("discord.js");

const decidedWinner = (winner, looser) => {
  const winnerEmbed = new EmbedBuilder()
    .setTitle(`Vencedor Definido!`)
    .setDescription(
      `As pontuações de ${winner}, ${looser} foram contabilizadas com sucesso!`
    )
    .addFields(
      {
        name: `Vencedor`,
        value: `${winner} (${winner.id})`,
        inline: false,
      },
      { name: `Perdedor`, value: `${looser} (${looser.id})`, inline: false }
    )
    .setFooter({ text: "Horário" })
    .setTimestamp();

  return winnerEmbed;
};

module.exports = decidedWinner;
