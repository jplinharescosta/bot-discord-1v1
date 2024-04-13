const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const { queues } = require("../../bot.js");
const admQueueInfoSchemas = require("../../schemas/admQueueInfoSchema.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("set-adm-queue")
    .setDescription("Criar sala queue para ADM")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption((option) =>
      option
        .setName("canal")
        .setDescription("Sala onde será criada")
        .setRequired(true)
    ),

  async execute(interaction, client) {
    const enterButton = new ButtonBuilder({
      custom_id: "entrarFilaAdm",
      label: "Entrar na fila",
      style: ButtonStyle.Primary,
    });

    const exitButton = new ButtonBuilder({
      custom_id: "sairFilaAdm",
      label: "Sair da fila",
      style: ButtonStyle.Danger,
    });

    let string;
    let num = 1;
    await queues.AdmQueue.forEach(async (value) => {
      let adm = client.users.fetch(value);
      string += `${num} - ${adm.user}\n`;
      num++;
    });

    // string = string.replace(undefined, "");

    const admQueueEmbed = new EmbedBuilder()
      .setTitle("Fila de ADMs")
      .addFields({
        name: "Mediadores disponiveis",
        value: `Nenhum mediador na fila.`,
      })
      .setFooter({ text: "Todos os mediadores estão aleatorizados!" });

    const buttons = new ActionRowBuilder().addComponents(
      enterButton,
      exitButton
    );

    const channelToSend = interaction.options.get("canal");
    const msg = await channelToSend.channel.send({
      embeds: [admQueueEmbed],
      components: [buttons],
    });

    const saveAdmInfo = await admQueueInfoSchemas.create({
      ChatID: channelToSend.channel.id,
      MessageID: msg.id,
    });
    await saveAdmInfo.save().catch((err) => console.error(err));
    await interaction.reply({
      content: `Sala ADM criada com sucesso em -> ${channelToSend.channel}`,
      ephemeral: true,
    });
  },
};
