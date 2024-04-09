const pvpInfos = require("../../schemas/pvpInfoSchema");
const { EmbedBuilder } = require("discord.js");
const { queues } = require("../../bot.js");

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

    const interactionMessageId = interaction.message.id;
    const pvpInfosGet = await pvpInfos.findOne({
      MessageID: interactionMessageId,
    });
    const gameMode = pvpInfosGet.Mode;
    const messageId = pvpInfosGet.MessageID;
    const betPrice = pvpInfosGet.Price + "bet";
    if (!queues.GeneralQueue.includes(interaction.user.id)) {
      return await interaction.reply({
        content: "Você não está em nenhuma fila!",
        ephemeral: true,
      });
    }

    removeItemOnce(queues[gameMode][betPrice], interaction.user.id);
    removeItemOnce(queues.GeneralQueue, interaction.user.id);

    let player;
    if (queues[gameMode][betPrice][0]) {
      const data = queues[gameMode][betPrice];
      try {
        player = await client.users.fetch(data[0]);
      } catch (error) {}
    } else {
      player = "Nenhum apostador na fila.";
    }

    const embedUpdate = new EmbedBuilder()
      .setTitle(`${gameMode} | Fila de Apostas`)
      .addFields(
        {
          name: `👤 | Modo de jogo`,
          value: `${gameMode} Fivem`,
          inline: false,
        },
        {
          name: `💰 | Valor da aposta`,
          value: `R$ ${pvpInfosGet.Price},00`,
          inline: false,
        },
        {
          name: `💻 | Apostadores`,
          value: `${player}`,
          inline: false,
        }
      )
      .setThumbnail(client.user.displayAvatarURL());

    interaction.message.fetch(messageId).then(
      async (msg) =>
        await msg.edit({
          embeds: [embedUpdate],
        })
    );

    return await interaction.reply({
      content: `${interaction.user} Você saiu da fila!`,
      ephemeral: true,
    });
  },
};
