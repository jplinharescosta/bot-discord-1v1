const pvpInfosSchema = require("../../schemas/pvpInfoSchema");
const {
  EmbedBuilder,
  ChannelType,
  PermissionsBitField,
  ComponentType,
  ActionRowBuilder,
} = require("discord.js");

const betOnGoing = require("../../schemas/betOnGoing.js");
const inBetEmbedAndButtons = require("../../embeds/inBetEmbed.js");
const confirmEmbedAndButtons = require("../../embeds/confirmEmbed.js");
const admDataInfos = require("../../schemas/admDataInfos.js");
const errorEmbed = require("../../embeds/errorEmbed.js");
const {
  queueManager,
  admQueueManager,
  confirmationFaseQueue,
} = require("../../bot.js");

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = {
  data: {
    name: "entrarFila",
  },
  async execute(interaction, client) {
    if (!interaction.isButton()) return;

    if (admQueueManager.countTotalUsers() === 0) {
      return await interaction.reply({
        embeds: [
          errorEmbed(`${interaction.user}, não temos ADM online no momento!`),
        ],
        ephemeral: true,
      });
    }

    if (queueManager.isUserInAnyQueue(interaction.user.id)) {
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

    await interaction.update({ embeds: [embedGetQueueToSend] });

    const pvpInfosGet = await pvpInfosSchema.findOne({
      MessageID: interaction.message.id,
    });
    const gameMode = pvpInfosGet.Mode.split(" ")[0];
    const fullGameMode = pvpInfosGet.Mode;
    const betPrice = pvpInfosGet.Price + `bet`;
    const chatId = pvpInfosGet.MessageID;

    queueManager.addUserToQueue(
      interaction.user.id,
      `${betPrice}-${pvpInfosGet.Mode}-${chatId}`
    );

    const dataAtual = new Date();
    const options = { timeZone: "America/Sao_Paulo" };
    const dataHoraBrasil = dataAtual.toLocaleString("pt-BR", options);

    //await interaction.deferUpdate();
    switch (gameMode) {
      case gameMode:
        if (
          queueManager.queues[`${betPrice}-${pvpInfosGet.Mode}-${chatId}`]
            .length == 2
        ) {
          const embedReset = interaction.message.embeds[0];
          embedReset.fields[2] = {
            name: `💻 | Apostadores`,
            value: `Nenhum apostador na fila.`,
            inline: false,
          };

          await interaction.message.edit({ embeds: [embedReset] });

          const players = queueManager.queues[
            `${betPrice}-${pvpInfosGet.Mode}-${chatId}`
          ].splice(0, 2);

          queueManager.removeUserFromQueue(
            players[0],
            `${betPrice}-${pvpInfosGet.Mode}-${chatId}`
          );
          queueManager.removeUserFromQueue(
            players[1],
            `${betPrice}-${pvpInfosGet.Mode}-${chatId}`
          );

          const copyAdm = [...admQueueManager.queues["admQueue"]];
          const randomElement = copyAdm.sort(() => 0.5 - Math.random())[0];

          const adminRandom = await client.users.fetch(randomElement);

          const admData = await admDataInfos.findOne({
            UserId: adminRandom.id,
          });

          const categoryAdm = await interaction.guild.channels.cache.get(
            admData.categoryId
          );

          const player1 = await client.users.fetch(players[0]);
          const player2 = await client.users.fetch(players[1]);

          const newChannelCreated = await interaction.guild.channels.create({
            name: `aposta-aguardando`,
            type: ChannelType.GuildText,
            parent: categoryAdm,
            permissionOverwrites: [
              {
                id: interaction.guild.id,
                deny: [PermissionsBitField.Flags.ViewChannel],
              },
              {
                id: player1.id,
                allow: [
                  PermissionsBitField.Flags.ViewChannel,
                  PermissionsBitField.Flags.SendMessages,
                  PermissionsBitField.Flags.ReadMessageHistory,
                ],
              },
              {
                id: player2.id,
                allow: [
                  PermissionsBitField.Flags.ViewChannel,
                  PermissionsBitField.Flags.SendMessages,
                  PermissionsBitField.Flags.ReadMessageHistory,
                ],
              },
              {
                id: adminRandom.id,
                allow: [
                  PermissionsBitField.Flags.ViewChannel,
                  PermissionsBitField.Flags.SendMessages,
                  PermissionsBitField.Flags.ReadMessageHistory,
                ],
              },
            ],
          });

          let id = Math.random().toString(16).slice(2); //IMPORTANT

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

          const adm = await admDataInfos.findOne({ UserId: adminRandom.id });

          await admDataInfos.findOneAndUpdate(
            {
              UserId: adminRandom.id,
            },
            { ammountBets: adm.ammountBets + 1 }
          );

          //COLLECTOR A PARTIR DAQUI

          const filter = (i) =>
            i.user.id === player1.id || i.user.id === player2.id;

          const { inBetEmbed, menu } = inBetEmbedAndButtons(
            fullGameMode,
            adminRandom,
            pvpInfosGet.Price,
            process.env.channel_value,
            player1,
            player2,
            id
          );

          const time = 180_000;
          const collector = send.createMessageComponentCollector({
            componentType: ComponentType.Button,
            filter,
            time,
          });

          collector.on("collect", async (i) => {
            if (!i.isButton()) return;
            if (i.customId === `confirmBet-${id}`) {
              collector.resetTimer();

              if (
                confirmationFaseQueue.isUserInQueue(
                  i.user.id,
                  `ConfirmationFase${id}`
                )
              ) {
                return i.reply({
                  content: `${i.user} você já aceitou essa partida.`,
                  ephemeral: true,
                });
              }

              confirmationFaseQueue.addUserToQueue(
                i.user.id,
                `ConfirmationFase${id}`
              );

              const componentToEdit = i.message.components[0];

              componentToEdit.components[0].data.label = `Confirmar [${
                confirmationFaseQueue.queues[`ConfirmationFase${id}`].length
              }/2]`;

              const componentToSend = ActionRowBuilder.from(componentToEdit);
              await i.update({
                components: [componentToSend],
              });
            }
            if (i.customId === `cancelBet`) {
              if (
                confirmationFaseQueue.isUserInQueue(
                  i.user.id,
                  `ConfirmationFase${id}`
                )
              ) {
                return i.reply({
                  content: `${i.user} você aceitou e não pode cancelar.`,
                  ephemeral: true,
                });
              }

              confirmationFaseQueue.deleteQueue(`ConfirmationFase${id}`);

              await i.reply({
                embeds: [
                  new EmbedBuilder().setDescription(
                    `${i.user} cancelou a aposta, a sala fechará automaticamente em 5 segundos.`
                  ),
                ],
              });

              delay(5000).then(async () => {
                await i.channel.delete();
              });
            }
            // BOTH CONFIRM THE BET

            if (
              confirmationFaseQueue.countUsersInQueue(
                `ConfirmationFase${id}`
              ) === 2
            ) {
              await betOnGoing.create({
                betId: id,
                Format: fullGameMode,
                Channel: newChannelCreated.id,
                ChannelNumber: admData.ammountBets,
                bettors: {
                  Player1: {
                    id: player1.id,
                  },
                  Player2: {
                    id: player2.id,
                  },
                },
                ADM: adminRandom.id,
                betPrice: pvpInfosGet.Price,
                createdTime: dataHoraBrasil,
              });

              await newChannelCreated.edit({
                name: `aposta-${admData.ammountBets}`,
              });

              await i.message.delete();

              await i.channel.send({
                content: `${player1}, ${player2}`,
                embeds: [inBetEmbed],
                components: [menu],
              });
            }
          });

          collector.on("end", async () => {
            if (
              newChannelCreated &&
              confirmationFaseQueue.countUsersInQueue(`ConfirmationFase${id}`) <
                2
            ) {
              await newChannelCreated.send({
                embeds: [
                  errorEmbed(
                    `Por ausência de confirmação essa sala fechará automaticamente em 5 seg`
                  ),
                ],
              });

              delay(5000).then(async () => {
                await newChannelCreated.delete();
              });
            }
          });
        }
        break;
      default:
        break;
    }
  },
};
