const pvpInfos = require("../../schemas/pvpInfoSchema");
const { EmbedBuilder } = require("discord.js");
const { queues } = require("../../bot.js");
const errorEmbed = require("../../embeds/errorEmbed.js");

function removeItemOnce(arr, value) {
  var index = arr.indexOf(value);
  if (index > -1) {
    arr.splice(index, 1);
  }
  return arr;
}

module.exports = {
  data: {
    name: "sairFila",
  },
  async execute(interaction, client) {
    if (!interaction.isButton()) return;

    const errorEmbedMessage = errorEmbed(
      `${interaction.user}, você não pode sair de uma fila que não está.`
    );

    if (!queues.GeneralQueue.includes(interaction.user.id)) {
      return await interaction.reply({
        embeds: [errorEmbedMessage],
        ephemeral: true,
      });
    }
    // GET THE LAST ONE IN THE QUEUE
    // let player;
    // if (queues[gameMode][betPrice][0]) {
    //   const data = queues[gameMode][betPrice];
    //   try {
    //     player = await client.users.fetch(data[0]);
    //   } catch (error) {}
    // } else {
    //   player = "Nenhum apostador na fila.";
    // }

    const embed = interaction.message.embeds[0];
    embed.fields[2] = {
      name: `💻 | Apostadores`,
      value: `Nenhum apostador na fila.`,
      inline: false,
    };

    const embedExitQueueToSend = EmbedBuilder.from(embed).setTimestamp();

    await interaction.message.edit({ embeds: [embedExitQueueToSend] });

    const pvpInfosGet = await pvpInfos.findOne({
      MessageID: interaction.message.id,
    });
    const gameMode = pvpInfosGet.Mode.split(" ")[0];
    const betPrice = pvpInfosGet.Price + "bet";
    const chatId = pvpInfosGet.MessageID;

    removeItemOnce(
      queues[gameMode][`${betPrice}-${pvpInfosGet.Mode}-${chatId}`],
      interaction.user.id
    );
    removeItemOnce(queues.GeneralQueue, interaction.user.id);

    await interaction.deferUpdate();
  },
};
