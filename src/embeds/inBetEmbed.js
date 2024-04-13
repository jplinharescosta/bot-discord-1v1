const {
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} = require("discord.js");

const inBetEmbedAndButtons = (
  format,
  adm,
  betValue,
  roomValue,
  player1,
  player2
) => {
  const inBetEmbed = new EmbedBuilder()
    .setTitle(`${format} - FIVEM`)
    .addFields({
      name: "Valor",
      value: `R$ ${betValue},00`,
      inline: true,
    })
    .addFields({
      name: "Mediador",
      value: `${adm}`,
      inline: true,
    })
    .addFields({
      name: "Valor da Sala",
      value: `R$ ${roomValue}`,
      inline: true,
    })
    .addFields({
      name: "Apostadores",
      value: `${player1}\n${player2}`,
      inline: false,
    })
    .setFooter({ text: "Horário" })
    .setTimestamp()
    .setColor("Green");

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId("in-bet-select-menu")
    .setPlaceholder("Selecione a ação que deseja realizar.")
    .addOptions(
      new StringSelectMenuOptionBuilder()
        .setLabel("🪧 Finalizar Aposta")
        .setValue("end-up-bet"),
      new StringSelectMenuOptionBuilder()
        .setLabel("🎲 Definir Vencedor")
        .setValue("in-bet-pick-winner")
    );

  const menu = new ActionRowBuilder().addComponents(selectMenu);

  return { inBetEmbed, menu };
};

module.exports = inBetEmbedAndButtons;
