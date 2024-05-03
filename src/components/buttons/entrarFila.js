const pvpInfosSchema = require("../../schemas/pvpInfoSchema");
const {
  EmbedBuilder,
  ChannelType,
  PermissionsBitField,
  ComponentType,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const { adm_role_id, channel_value } = process.env;

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
const clipboardy = require("clipboardy");

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const historyMessages = [];

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
          queueManager.countUsersInQueue(
            `${betPrice}-${pvpInfosGet.Mode}-${chatId}`
          ) == 2
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

          //const adminRandom = await client.users.fetch(randomElement);
          const adminRandom = randomElement;

          const admData = await admDataInfos.findOne({
            UserId: adminRandom,
          });

          const categoryAdm = await interaction.guild.channels.cache.get(
            admData.categoryId
          );

          //const player1 = await client.users.fetch(players[0]);
          //const player2 = await client.users.fetch(players[1]);

          const player1 = players[0];
          const player2 = players[1];

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
                id: player1,
                allow: [
                  PermissionsBitField.Flags.ViewChannel,
                  PermissionsBitField.Flags.SendMessages,
                  PermissionsBitField.Flags.ReadMessageHistory,
                ],
              },
              {
                id: player2,
                allow: [
                  PermissionsBitField.Flags.ViewChannel,
                  PermissionsBitField.Flags.SendMessages,
                  PermissionsBitField.Flags.ReadMessageHistory,
                ],
              },
              {
                id: adminRandom,
                allow: [
                  PermissionsBitField.Flags.ViewChannel,
                  PermissionsBitField.Flags.SendMessages,
                  PermissionsBitField.Flags.ReadMessageHistory,
                ],
              },
            ],
          });

          const collectorFilter = (m) => !m.author.bot;

          const channelCollector = newChannelCreated.createMessageCollector({
            filter: collectorFilter,
          });
          let id = Math.random().toString(16).slice(2);

          channelCollector.on("collect", async (m) => {
            if (!m.author.bot) {
              historyMessages.push(
                `[${new Date(m.createdTimestamp).toLocaleString("pt-BR")}] ${
                  m.author.username
                }: ${m.content}`
              );
            }
            if (
              m.content.length == 2 &&
              m.member.roles.cache.has(adm_role_id) &&
              /^\d+$/.test(m.content)
            ) {
              const lastMessages = await m.channel.messages.fetch({ limit: 2 });
              const previousMessage = lastMessages.last();

              const betPrice = pvpInfosGet.Price * 2;
              const valueToPay = betPrice - parseFloat(channel_value);

              const msg = await newChannelCreated.send({
                content: `<@${player1}>, <@${player2}>`,
                embeds: [
                  new EmbedBuilder()
                    .setTitle(`🎫 A sala foi criada!`)
                    .setDescription(
                      `
Em **3 minutos** a sala será iniciada!
                    
**• ID:** ${previousMessage.content}
**• Senha:** ${m.content}
**• Total a Pagar** ~ R$ ${valueToPay.toFixed(2)}

                    `
                    )
                    .setColor("Yellow")
                    .setFooter({ text: `Horário` })
                    .setTimestamp(),
                ],
                // components: [
                //   new ActionRowBuilder().addComponents(
                //     new ButtonBuilder()
                //       .setLabel("Copiar ID")
                //       .setCustomId(`copy-id-${id}`)
                //       .setStyle(ButtonStyle.Secondary)
                //   ),
                // ],
              });

              // const collector = msg.createMessageComponentCollector({
              //   componentType: ComponentType.Button,
              // });

              // collector.on("collect", async (i) => {
              //   if (!i.isButton()) return;
              //   if (i.customId === `copy-id-${id}`) {
              //     const messageToCopy = previousMessage.content;
              //     await clipboardy.write(messageToCopy);
              //     await i.reply({
              //       content: `Copiado com sucesso.`,
              //       ephemeral: true,
              //     });
              //   }
              // });
            }
          });

          //IMPORTANT

          const { confirmEmbed, buttons } = confirmEmbedAndButtons(
            fullGameMode,
            adminRandom,
            pvpInfosGet.Price,
            id
          );
          const send = await newChannelCreated.send({
            content: `<@${player1}> <@${player2}>`,
            embeds: [confirmEmbed],
            components: [buttons],
          });

          const adm = await admDataInfos.findOne({ UserId: adminRandom });

          await admDataInfos.findOneAndUpdate(
            {
              UserId: adminRandom,
            },
            { ammountBets: adm.ammountBets + 1 }
          );

          //COLLECTOR A PARTIR DAQUI

          const filter = (i) => i.user.id === player1 || i.user.id === player2;

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
            time,
          });

          //confirmationFaseQueue.queues[`ConfirmationFase${id}`] = [];
          confirmationFaseQueue.queues[`ConfirmationFase-${id}`] = [];
          collector.on("collect", async (i) => {
            if (!i.isButton()) return;
            if (i.customId === `confirmBet-${id}`) {
              if (
                confirmationFaseQueue.isUserInQueue(
                  i.user.id,
                  `ConfirmationFase-${id}`
                )
              ) {
                return i.reply({
                  content: `${i.user} você já aceitou essa partida.`,
                  ephemeral: true,
                });
              }

              confirmationFaseQueue.addUserToQueue(
                i.user.id,
                `ConfirmationFase-${id}`
              );

              const componentToEdit = i.message.components[0];

              componentToEdit.components[0].data.label = `Confirmar [${confirmationFaseQueue.countUsersInQueue(
                `ConfirmationFase-${id}`
              )}/2]`;

              const componentToSend = ActionRowBuilder.from(componentToEdit);
              await i.update({
                components: [componentToSend],
              });

              collector.resetTimer();
            }
            if (i.customId === `cancelBet`) {
              if (
                confirmationFaseQueue.isUserInQueue(
                  i.user.id,
                  `ConfirmationFase-${id}`
                )
              ) {
                return i.reply({
                  content: `${i.user} você aceitou e não pode cancelar.`,
                  ephemeral: true,
                });
              }

              confirmationFaseQueue.deleteQueue(`ConfirmationFase-${id}`);

              await i.reply({
                embeds: [
                  new EmbedBuilder().setDescription(
                    `${i.user} cancelou a aposta, a sala fechará automaticamente em 5 segundos.`
                  ),
                ],
              });

              return delay(5000).then(async () => {
                await i.channel.delete();
              });
            }
            // BOTH CONFIRM THE BET

            if (
              confirmationFaseQueue.countUsersInQueue(
                `ConfirmationFase-${id}`
              ) === 2
            ) {
              await betOnGoing.create({
                betId: id,
                Format: fullGameMode,
                Channel: newChannelCreated.id,
                ChannelNumber: admData.ammountBets,
                bettors: {
                  Player1: {
                    id: player1,
                  },
                  Player2: {
                    id: player2,
                  },
                },
                ADM: adminRandom,
                betPrice: pvpInfosGet.Price,
                createdTime: dataHoraBrasil,
              });

              await newChannelCreated.edit({
                name: `aposta-${admData.ammountBets}`,
              });

              confirmationFaseQueue.deleteQueue(`ConfirmationFase-${id}`);

              await i.message.delete();

              await i.channel
                .send({
                  content: `<@${player1}>, <@${player2}>`,
                  embeds: [inBetEmbed],
                  components: [menu],
                })
                .then((msg) => msg.pin());

              await i.channel.send({
                content: `${admData.pixQrCode}`,
              });

              const playerValueRoom = channel_value / 2;

              const valueToPay = pvpInfosGet.Price + playerValueRoom;

              await i.channel.send({
                content: `
**CHAVE PIX:** 

${admData.linkPix}

**VALOR A PAGAR:** R$ ${valueToPay.toFixed(2)}
                
                `,
              });
            }
          });

          collector.on("end", async () => {
            if (newChannelCreated.name == "aposta-aguardando") {
              if (newChannelCreated) {
                await newChannelCreated.send({
                  embeds: [
                    errorEmbed(
                      `Por ausência de confirmação essa sala fechará automaticamente em 5 seg`
                    ),
                  ],
                });
                return delay(5000).then(async () => {
                  await newChannelCreated.delete();
                });
              }
            }
          });
        }
        break;
      default:
        break;
    }
  },
  historyMessages,
};
