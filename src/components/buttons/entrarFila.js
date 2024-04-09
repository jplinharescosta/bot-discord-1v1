const pvpInfosSchema = require("../../schemas/pvpInfoSchema");
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
    name: "entrarFila",
  },
  async execute(interaction, client) {
    if (!interaction.isButton()) return;
    if (queues.AdmQueue.length == 0) {
      return await interaction.reply({
        content: "Não temos ADM online no momento!",
        ephemeral: true,
      });
    }
    const interactionMessageId = interaction.message.id;
    const pvpInfosGet = await pvpInfosSchema.findOne({
      MessageID: interactionMessageId,
    });
    const gameMode = pvpInfosGet.Mode;
    const messageId = pvpInfosGet.MessageID;
    const betPrice = pvpInfosGet.Price + "bet";
    if (queues.GeneralQueue.includes(interaction.user.id)) {
      return await interaction.reply({
        content: "Você já está na em alguma fila!",
        ephemeral: true,
      });
    }

    if (!queues[gameMode][betPrice]) {
      queues[gameMode][betPrice] = [interaction.user.id];
    } else {
      queues[gameMode][betPrice].push(interaction.user.id);
    }

    queues.GeneralQueue.push(interaction.user.id);
    // const arrayLength = queues[gameMode][betPrice].push(interaction.user.id);
    await interaction.reply({
      content: "Você entrou na fila!",
      ephemeral: true,
    });
    console.log(`Array Length - Queue${gameMode}`, queues.GeneralQueue.length);
    console.log("General Queue ->", queues.GeneralQueue);
    console.log("GameMode Queue -> ", queues[gameMode]);
    console.log(messageId);
    // console.log("1v1 Queue", queues.Queue1v1);
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
          value: `${interaction.user}`,
          inline: false,
        }
      )
      .setThumbnail(client.user.displayAvatarURL());

    const msgToUpdate = interaction.message
      .fetch(messageId)
      .then(
        async (msg) =>
          await msg.edit({
            embeds: [embedUpdate],
          })
      )
      .catch((err) => console.error(err));

    switch (gameMode) {
      case "1v1":
        if (queues[gameMode][betPrice].length == 2) {
          const players = queues[gameMode][betPrice].splice(0, 2);
          removeItemOnce(queues.GeneralQueue, players[0]);
          removeItemOnce(queues.GeneralQueue, players[1]);
          const p1 = client.users.fetch(players[0]);
          const p2 = client.users.fetch(players[1]);
          console.log("PLAYER 1 -> ", p1);
          console.log("PLAYER 2 -> ", p2);
        }
        break;
      case "2v2":
        if (queues[gameMode][betPrice].length == 4) {
          const players = queues[gameMode].splice(0, 4);
          for (let i = 0; i <= players.length; i++) {
            removeItemOnce(queues.GeneralQueue, players[i]);
          }
          const p1 = client.users.fetch(players[0]);
          const p2 = client.users.fetch(players[1]);
          const p3 = client.users.fetch(players[2]);
          const p4 = client.users.fetch(players[3]);
          console.log("PLAYER 1 -> ", p1);
          console.log("PLAYER 2 -> ", p2);
          console.log("PLAYER 3 -> ", p3);
          console.log("PLAYER 4 -> ", p4);
        }
        break;
      default:
        break;
      // if (arrayLength == 2) {
      //   const players = queues[gameMode].splice(0, 2);
      //   removeItemOnce(queues.GeneralQueue, players[0]);
      //   removeItemOnce(queues.GeneralQueue, players[1]);
      //   const p1 = client.users.fetch(players[0]);
      //   const p2 = client.users.fetch(players[1]);
      //   console.log("PLAYER 1 -> ", p1);
      //   console.log("PLAYER 2 -> ", p2);
      // }
    }
  },
};
