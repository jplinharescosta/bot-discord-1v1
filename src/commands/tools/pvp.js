const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  PermissionsBitField,
} = require("discord.js");
const pvpInfoSchema = require("../../schemas/pvpInfoSchema.js");
const envConfig = require("../../schemas/envConfig.js");
const sucessEmbed = require("../../embeds/sucessEmbed.js");
const errorEmbed = require("../../embeds/errorEmbed.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("pvp")
    .setDescription("Criar sala de pvp")
    .addSubcommand((command) =>
      command
        .setName("add")
        .setDescription("Adiciona fila de competição.")
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
    )
    .addSubcommand((command) =>
      command
        .setName("remover")
        .setDescription("Remover fila de competição especifica.")
        .addStringOption((option) =>
          option
            .setName("id-da-fila")
            .setDescription(
              "ID da mensagem da fila de competição para ser excluida."
            )
            .setRequired(true)
        )
    )

    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator),
  async execute(interaction, client) {
    const { DefaultThumbNail } = await envConfig.findOne({
      Name: "envConfig",
    });
    const channelToSend = interaction.options.get("canal");
    const valor = interaction.options.get("valor");
    const modo = interaction.options.get("modo");
    const thumb = interaction.options.getString("thumb");
    const color = interaction.options.getString("color");
    const queueMessageID = interaction.options.getString("id-da-fila");
    const sub = interaction.options.getSubcommand();

    switch (sub) {
      case "add":
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
          .setThumbnail(thumb || DefaultThumbNail)
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

        const savePvpInfo = await pvpInfoSchema.create({
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

        break;

      case "remover":
        const data = await pvpInfoSchema.findOne({
          MessageID: queueMessageID,
        });

        if (!data)
          return await interaction.reply({
            embeds: [errorEmbed(`A fila ID: ${queueMessageID} não existe!`)],
            ephemeral: true,
          });

        const channel = await interaction.channel.fetch(data.ChatID);
        await channel.messages
          .fetch(data.MessageID)
          .then((msg) => msg.delete());

        await pvpInfoSchema.findOneAndDelete({
          MessageID: queueMessageID,
        });

        await interaction.reply({
          embeds: [
            sucessEmbed(
              `A fila ID: ${queueMessageID} foi excluida com sucesso!`
            ),
          ],
          ephemeral: true,
        });

        break;

      default:
        break;
    }
  },
};
