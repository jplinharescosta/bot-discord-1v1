const {
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
} = require("discord.js");

const confirmEmbedAndButtons = (format, adm, betValue, betId) => {
  const confirmEmbed = new EmbedBuilder()
    .setTitle("Aguardando confirmações")
    .setDescription(
      "Os dois apostadores precisam pressionar o botão de confirmar."
    )
    .addFields(
      {
        name: "Formato",
        value: `${format}`,
        inline: false,
      },
      {
        name: "Mediador",
        value: `<@${adm}>`,
        inline: false,
      },
      {
        name: "Valor",
        value: `R$ ${betValue},00`,
        inline: false,
      }
    );

  const confirmButton = new ButtonBuilder({
    custom_id: `confirmBet-${betId}`,
    label: "Confirmar [0/2]",
    style: ButtonStyle.Success,
  });
  const cancelButton = new ButtonBuilder({
    custom_id: `cancelBet`,
    label: "Cancelar",
    style: ButtonStyle.Danger,
  });

  const buttons = new ActionRowBuilder().addComponents(
    confirmButton,
    cancelButton
  );

  return { confirmEmbed, buttons };
};

module.exports = confirmEmbedAndButtons;
