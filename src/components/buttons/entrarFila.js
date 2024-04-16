const pvpInfosSchema = require("../../schemas/pvpInfoSchema");
const {
  EmbedBuilder,
  ButtonBuilder,
  ChannelType,
  PermissionOverwrites,
  PermissionFlagsBits,
  PermissionsBitField,
  permissionFlagsBits,
  createMessageComponentCollector,
  ComponentType,
  ActionRowBuilder,
} = require("discord.js");
const { queues } = require("../../bot.js");
const betOnGoing = require("../../schemas/betOnGoing.js");
const inBetEmbedAndButtons = require("../../embeds/inBetEmbed.js");
const confirmEmbedAndButtons = require("../../embeds/confirmEmbed.js");
const admDataInfos = require("../../schemas/admDataInfos.js");
const errorEmbed = require("../../embeds/errorEmbed.js");

function removeItemOnce(arr, value) {
  var index = arr.indexOf(value);
  if (index > -1) {
    arr.splice(index, 1);
  }
  return arr;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = {
  data: {
    name: "entrarFila",
  },
  async execute(interaction, client) {
    if (!interaction.isButton()) return;

    if (queues.AdmQueue.length == 0) {
      return await interaction.reply({
        embeds: [
          errorEmbed(`${interaction.user}, não temos ADM online no momento!`),
        ],
        ephemeral: true,
      });
    }

    if (queues.GeneralQueue.includes(interaction.user.id)) {
      return await interaction.reply({
        embeds: [
          errorEmbed(`${interaction.user}, você já está na em alguma fila!`),
        ],
        ephemeral: true,
      });
    }

    const embedGetQueue = interaction.message.embeds[0];
    embedGetQueue.fields[2] = {
      name: `💻 | Apostadores`,
      value: `${interaction.user}`,
      inline: false,
    };

    const embedGetQueueToSend = EmbedBuilder.from(embedGetQueue).setTimestamp();

    await interaction.message.edit({ embeds: [embedGetQueueToSend] });

    queues.GeneralQueue.push(interaction.user.id);
    console.log("MESSAGE ID ->", interaction.message.id);

    const pvpInfosGet = await pvpInfosSchema.findOne({
      MessageID: interaction.message.id,
    });
    const gameMode = pvpInfosGet.Mode.split(" ")[0];
    const fullGameMode = pvpInfosGet.Mode;
    const betPrice = pvpInfosGet.Price + `bet`;
    const chatId = pvpInfosGet.MessageID;

    if (!queues[gameMode][`${betPrice}-${pvpInfosGet.Mode}-${chatId}`]) {
      queues[gameMode][`${betPrice}-${pvpInfosGet.Mode}-${chatId}`] = [
        interaction.user.id,
      ];
    } else {
      queues[gameMode][`${betPrice}-${pvpInfosGet.Mode}-${chatId}`].push(
        interaction.user.id
      );
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
      case gameMode:
        if (
          queues[gameMode][`${betPrice}-${pvpInfosGet.Mode}-${chatId}`]
            .length == 2
        ) {
          const embedReset = interaction.message.embeds[0];
          embedReset.fields[2] = {
            name: `💻 | Apostadores`,
            value: `Nenhum apostador na fila.`,
            inline: false,
          };
          await interaction.message.edit({ embeds: [embedReset] });

          const players = queues[gameMode][
            `${betPrice}-${pvpInfosGet.Mode}-${chatId}`
          ].splice(0, 2);
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

          const dataAdm = await admDataInfos.findOne({
            UserId: adminRandom.id,
          });

          const newChannelCreated = await newCategoryCreated.children.create({
            name: `aposta-${dataAdm.ammountBets}`,
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
            ADM: adminRandom.id,
            Status: "",
            betPrice: pvpInfosGet.Price,
            createdTime: dataHoraBrasil,
          });
          await betOnGoingNow.save().catch((err) => console.error(err));
          // await interaction.editReply({
          //   content: `${newChannelCreated} `,
          //   ephemeral: true,
          // });
          const { confirmEmbed, buttons } = confirmEmbedAndButtons(
            fullGameMode,
            adminRandom,
            pvpInfosGet.Price,
            id
          );
          const send = await newChannelCreated.send({
            content: `${player1} ${player2}`,
            embeds: [confirmEmbed],
            components: [buttons],
          });

          const filter = (i) =>
            i.user.id === player1.id || i.user.id === player2.id;

          const collector = send.createMessageComponentCollector({
            componentType: ComponentType.Button,
            filter,
          });

          const { inBetEmbed, menu } = inBetEmbedAndButtons(
            fullGameMode,
            adminRandom,
            pvpInfosGet.Price,
            process.env.channel_value,
            player1,
            player2,
            id
          );

          queues.ConfirmationFase[id] = [];
          collector.on("collect", async (i) => {
            if (!i.isButton()) return;
            if (i.customId === `confirmBet-${id}`) {
              if (queues.ConfirmationFase[id].includes(i.user.id)) {
                return i.reply({
                  content: `${i.user} você já aceitou essa partida.`,
                  ephemeral: true,
                });
              }
              queues.ConfirmationFase[id].push(i.user.id);
              console.log(queues.ConfirmationFase);

              const componentToEdit = i.message.components[0];
              componentToEdit.components[0].data.label = `Confirmar [${queues.ConfirmationFase[id].length}/2]`;

              const componentToSend = ActionRowBuilder.from(componentToEdit);
              await i.message.edit({
                components: [componentToSend],
              });
            }
            if (i.customId === `cancelBet-${id}`) {
              if (queues.ConfirmationFase[id].includes(i.user.id)) {
                return i.reply({
                  content: `${i.user} você aceitou e não pode cancelar.`,
                  ephemeral: true,
                });
              }
              if (queues.ConfirmationFase[id]) {
                delete queues.ConfirmationFase[id];
              }
              await i.channel.send({
                embeds: [
                  new EmbedBuilder().setDescription(
                    `${i.user} cancelou a aposta, a sala fechará automaticamente em 5 segundos.`
                  ),
                ],
              });

              delay(5000).then(async () => {
                await i.channel.parent.delete(); // CATEGORIA DO ADM... RETIRAR DEPOIS QUE CONFIGURAR
                await i.channel.delete();
              });
            }

            if (
              queues.ConfirmationFase[id] &&
              queues.ConfirmationFase[id].length === 2
            ) {
              await i.message.delete();

              await i.channel.send({
                content: `${player1}, ${player2}`,
                embeds: [inBetEmbed],
                components: [menu],
              });
            }
            await i.deferUpdate();
          });
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
