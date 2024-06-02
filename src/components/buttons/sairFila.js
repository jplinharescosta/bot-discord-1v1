const pvpInfos = require("../../schemas/pvpInfoSchema");
const { EmbedBuilder } = require("discord.js");
const errorEmbed = require("../../embeds/errorEmbed.js");
const { queueManager } = require("../../bot.js");

module.exports = {
  data: {
    name: "sairFila",
  },
  async execute(interaction) {
    if (!interaction.isButton()) return;

    const errorEmbedMessage = errorEmbed(
      `${interaction.user}, você não pode sair de uma fila que não está.`
    );

    const pvpInfosGet = await pvpInfos.findOne({
      MessageID: interaction.message.id,
    });
    const betPrice = pvpInfosGet.Price + "bet";
    const chatId = pvpInfosGet.MessageID;

    let userInThisQueue;

    if (queueManager.getUserQueue(interaction.user.id)) {
      userInThisQueue = queueManager
        .getUserQueue(interaction.user.id)
        .split("-")[2];
    } else {
      userInThisQueue = chatId;
    }

    if (
      !queueManager.isUserInQueue(
        interaction.user.id,
        `${betPrice}-${pvpInfosGet.Mode}-${userInThisQueue}`
      )
    ) {
      return await interaction.reply({
        embeds: [errorEmbedMessage],
        ephemeral: true,
      });
    }

    const embed = interaction.message.embeds[0];
    embed.fields[2] = {
      name: `💻 | Jogadores`,
      value: `Nenhum jogador na fila.`,
      inline: false,
    };

    const embedExitQueueToSend = EmbedBuilder.from(embed).setTimestamp();

    await interaction.update({ embeds: [embedExitQueueToSend] });

    queueManager.removeUserFromQueue(
      interaction.user.id,
      `${betPrice}-${pvpInfosGet.Mode}-${chatId}`
    );
  },
};
