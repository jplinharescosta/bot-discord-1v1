const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  PermissionFlagsBits,
  PermissionsBitField,
} = require("discord.js");
const { thumbnail } = process.env;
const pvpInfoSchemas = require("../../schemas/pvpInfoSchema.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("pvp")
    .setDescription("Criar sala de pvp")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption((option) =>
      option
        .setName("modo")
        .setDescription("Modos disponiveis: 1v1, 2v2, 3v3, 4v4, 5v5")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("valor")
        .setDescription("Valor da Aposta")
        .setRequired(true)
    )
    .addChannelOption((option) =>
      option
        .setName("canal")
        .setDescription("Digite a sala onde a aposta será criada.")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option.setName("thumb").setDescription("Definir thumbnail da fila.")
    )
    .addStringOption((option) =>
      option
        .setName("color")
        .setDescription("Definir cor da linha lateral da fila.")
    )
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator),
  async execute(interaction, client) {
    const channelToSend = interaction.options.get("canal");
    const valor = interaction.options.get("valor");
    const modo = interaction.options.get("modo");
    const thumb = interaction.options.getString("thumb");
    const color = interaction.options.getString("color");

    const enterButton = new ButtonBuilder({
      custom_id: "entrarFila",
      label: "Entrar na fila",
      style: ButtonStyle.Primary,
    });

    const exitButton = new ButtonBuilder({
      custom_id: "sairFila",
      label: "Sair da fila",
      style: ButtonStyle.Danger,
    });

    const buttons = new ActionRowBuilder().addComponents(
      enterButton,
      exitButton
    );

    const embed = new EmbedBuilder()
      .setTitle(`${modo.value.split(" ")[0]} | Fila de Apostas`)
      .addFields(
        {
          name: `👤 | Modo de jogo`,
          value: `${modo.value}`,
          inline: false,
        },
        {
          name: `💰 | Valor da aposta`,
          value: `R$ ${valor.value},00`,
          inline: false,
        },
        {
          name: `💻 | Apostadores`,
          value: "Nenhum apostador na fila.",
          inline: false,
        }
      )
      .setThumbnail(thumb || thumbnail)
      .setFooter({ text: "Horário" })
      .setColor(color || "White")
      .setTimestamp();

    const msg = await channelToSend.channel.send({
      embeds: [embed],
      components: [buttons],
    });

    const dataAtual = new Date();
    const options = { timeZone: "America/Sao_Paulo" };
    const dataHoraBrasil = dataAtual.toLocaleString("pt-BR", options);

    const savePvpInfo = await pvpInfoSchemas.create({
      ChatID: channelToSend.channel.id,
      MessageID: msg.id,
      Price: valor.value,
      Mode: modo.value,
      createdTime: dataHoraBrasil,
    });

    await interaction.reply({
      content: `Sala PVP criada com sucesso em -> ${channelToSend.channel}`,
      ephemeral: true,
    });
  },
};
