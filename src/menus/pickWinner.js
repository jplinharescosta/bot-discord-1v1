const {
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ActionRowBuilder,
  EmbedBuilder,
} = require("discord.js");
const betOnGoing = require("../schemas/betOnGoing");

const pickWinnerMenu = async (id, client) => {
  const betData = await betOnGoing.findOne({
    betId: id,
  });
  const p1 = await client.users.fetch(betData.bettors.Player1.id);
  const p2 = await client.users.fetch(betData.bettors.Player2.id);
  const adm = betData.ADM;

  const pickWinnerEmbed = new EmbedBuilder()
    .setTitle(`Definir Vencedor`)
    .setDescription(
      `<@${adm}>, por gentiliza, selecione abaixo o jogador que venceu esta partida`
    )
    .setFooter({ text: "Horário" })
    .setTimestamp()
    .setColor("Green");

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId("in-bet-select-menu")
    .setPlaceholder("Selecione o jogador que venceu a esta partida.")
    .setMaxValues(1)
    .setMinValues(1)
    .setDisabled(false)
    .addOptions(
      new StringSelectMenuOptionBuilder()
        .setLabel(`@${p1.username}`)
        .setValue(`${id}_player-1`)
        .setDescription(`ID: ${p1.id}`)
        .setEmoji(`🟩`),
      new StringSelectMenuOptionBuilder()
        .setLabel(`@${p2.username}`)
        .setValue(`${id}_player-2`)
        .setDescription(`ID: ${p2.id}`)
        .setEmoji(`🟩`)
    );

  const menu = new ActionRowBuilder().setComponents(selectMenu);

  return { pickWinnerEmbed, menu };
};

module.exports = pickWinnerMenu;
