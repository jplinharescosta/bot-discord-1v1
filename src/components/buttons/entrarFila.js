const pvpInfosSchema = require("../../schemas/pvpInfoSchema");
const {
  EmbedBuilder,
  ButtonBuilder,
  ChannelType,
  PermissionOverwrites,
  PermissionFlagsBits,
  PermissionsBitField,
  permissionFlagsBits,
} = require("discord.js");
const { queues } = require("../../bot.js");
const betOnGoing = require("../../schemas/betOnGoing.js");
const confirmEmbedAndButtons = require("../../embeds/confirmEmbed.js");
const { Mongoose } = require("mongoose");

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

    if (queues.GeneralQueue.includes(interaction.user.id)) {
      return await interaction.reply({
        content: "Você já está na em alguma fila!",
        ephemeral: true,
      });
    }

    const embed = interaction.message.embeds[0];
    embed.fields[2] = {
      name: `💻 | Apostadores`,
      value: `${interaction.user}`,
      inline: false,
    };
    await interaction.message.edit({ embeds: [embed] });
    queues.GeneralQueue.push(interaction.user.id);

    const pvpInfosGet = await pvpInfosSchema.findOne({
      MessageID: interaction.message.id,
    });
    const gameMode = pvpInfosGet.Mode;
    const betPrice = pvpInfosGet.Price + "bet";

    if (!queues[gameMode][betPrice]) {
      queues[gameMode][betPrice] = [interaction.user.id];
    } else {
      queues[gameMode][betPrice].push(interaction.user.id);
    }

    // const arrayLength = queues[gameMode][betPrice].push(interaction.user.id);
    console.log(`Array Length - Queue${gameMode}`, queues.GeneralQueue.length);
    console.log("General Queue ->", queues.GeneralQueue);
    console.log("GameMode Queue -> ", queues[gameMode]);

    const dataAtual = new Date();
    const options = { timeZone: "America/Sao_Paulo" };
    const dataHoraBrasil = dataAtual.toLocaleString("pt-BR", options);

    await interaction.deferUpdate();
    switch (gameMode) {
      case "1v1":
        if (queues[gameMode][betPrice].length == 2) {
          const players = queues[gameMode][betPrice].splice(0, 2);
          removeItemOnce(queues.GeneralQueue, players[0]);
          removeItemOnce(queues.GeneralQueue, players[1]);
          const player1 = await client.users.fetch(players[0]);
          const player2 = await client.users.fetch(players[1]);
          console.log("PLAYER 1 -> ", player1.id);
          console.log("PLAYER 2 -> ", player2.id);

          // const randomADM = Math.floor(Math.random * queues.AdmQueue.length);
          const adminRandom = await client.users.fetch(
            queues.AdmQueue[(Math.random() * queues.AdmQueue.length) | 0]
          );
          console.log(adminRandom);

          const newCategoryCreated = await interaction.guild.channels.create({
            name: `${adminRandom.username.toUpperCase()} | ${
              process.env.org_name
            }`,
            type: ChannelType.GuildCategory,
            permissionOverwrites: [
              {
                id: interaction.guild.roles.everyone,
                deny: [PermissionFlagsBits.ViewChannel],
              },
              {
                id: player1.id,
                allow: [PermissionFlagsBits.ViewChannel],
              },
              {
                id: player2.id,
                allow: [PermissionFlagsBits.ViewChannel],
              },
              {
                id: adminRandom.id,
                allow: [PermissionFlagsBits.ViewChannel],
              },
            ],
          });

          const newChannelCreated = await newCategoryCreated.children.create({
            name: `aposta-QTD-APOSTAS-ADM`,
            type: ChannelType.GuildText,
            permissionOverwrites: [
              {
                id: interaction.guild.roles.everyone,
                deny: [PermissionFlagsBits.ViewChannel],
              },
              {
                id: player1.id,
                allow: [PermissionFlagsBits.ViewChannel],
              },
              {
                id: player2.id,
                allow: [PermissionFlagsBits.ViewChannel],
              },
              {
                id: adminRandom.id,
                allow: [PermissionFlagsBits.ViewChannel],
              },
            ],
          });
          let id = Math.random().toString(16).slice(2);
          const betOnGoingNow = await betOnGoing.create({
            betId: id,
            Player1: player1.id,
            Player2: player2.id,
            AMD: adminRandom.id,
            Status: "",
            betPrice: pvpInfosGet.Price,
            createdTime: dataHoraBrasil,
          });
          await betOnGoingNow.save().catch((err) => console.err(err));
          // await interaction.editReply({
          //   content: `${newChannelCreated} `,
          //   ephemeral: true,
          // });
          const { confirmEmbed, buttons } = confirmEmbedAndButtons(
            gameMode,
            adminRandom,
            pvpInfosGet.Price,
            id
          );
          await newChannelCreated.send({
            content: `${player1} ${player2}`,
            embeds: [confirmEmbed],
            components: [buttons],
          });
        }
        break;
      case "2v2":
        if (queues[gameMode][betPrice].length == 4) {
          const players = queues[gameMode].splice(0, 4);
          for (let i = 0; i <= players.length; i++) {
            removeItemOnce(queues.GeneralQueue, players[i]);
          }
          const p1 = await client.users.fetch(players[0]);
          const p2 = await client.users.fetch(players[1]);
          const p3 = await client.users.fetch(players[2]);
          const p4 = await client.users.fetch(players[3]);
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
