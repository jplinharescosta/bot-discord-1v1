const {
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ActionRowBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const envConfig = require("../schemas/envConfig");

const updateInBetMenu = async (id) => {
  const { LinkToRulesChannel } = await envConfig.findOne({
    Name: "envConfig",
  });

  const auxEmbed = new EmbedBuilder()
    .setTitle(`Menu Auxiliar`)
    .setDescription(
      `Pressione abaixo para realizar alguma ação nesta partida.`
    );

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId("in-bet-select-menu")
    .setPlaceholder("Selecione a ação que deseja realizar.")
    .addOptions(
      new StringSelectMenuOptionBuilder()
        .setLabel("🪧 Finalizar Aposta")
        .setValue(`${id}_end-up-bet`),
      new StringSelectMenuOptionBuilder()
        .setLabel("🎲 Definir Vencedor")
        .setValue(`${id}_in-bet-pick-winner`)
    );

  const menuUpdate = new ActionRowBuilder().addComponents(selectMenu);

  const button = new ButtonBuilder({
    label: "📖 Regras",
    style: ButtonStyle.Link,
    url: LinkToRulesChannel,
  });

  const rulesButton = new ActionRowBuilder().addComponents(button);

  return { auxEmbed, menuUpdate, rulesButton };
};

module.exports = updateInBetMenu;
