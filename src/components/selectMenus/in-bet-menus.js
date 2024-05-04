const errorEmbed = require("../../embeds/errorEmbed.js");
const pickWinnerMenu = require("../../menus/pickWinner.js");
const betOnGoing = require("../../schemas/betOnGoing.js");
const updateInBetMenu = require("../../embeds/updateInBetMenu.js");
const decidedWinner = require("../../embeds/decidedWinner.js");
const { EmbedBuilder } = require("discord.js");
const userDataSchema = require("../../schemas/userSchema.js");
const { messages } = require("../../components/buttons/entrarFila.js");
const envConfig = require("../../schemas/envConfig.js");

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = {
  data: {
    name: "in-bet-select-menu",
  },
  async execute(interaction, client) {
    const { MediatorRoleId } = await envConfig.findOne({
      Name: "envConfig",
    });

    if (
      !interaction.member.roles.cache.has(MediatorRoleId) &&
      !interaction.member.permissions.has(
        PermissionsBitField.Flags.Administrator
      )
    ) {
      return interaction.reply({
        embeds: [
          errorEmbed(
            `${interaction.user}, esses comandos só estão disponiveis para Mediadores.`
          ),
        ],
        ephemeral: true,
      });
    }

    const id = interaction.values[0].split("_")[0];
    const value = interaction.values[0].split("_")[1];
    const betData = await betOnGoing.findOne({
      betId: id,
    });
    // const p1 = await client.users.fetch(betData.bettors.Player1.id);
    // const p2 = await client.users.fetch(betData.bettors.Player2.id);

    const p1 = betData.bettors.Player1.id;
    const p2 = betData.bettors.Player2.id;

    const { auxEmbed, menuUpdate, rulesButton } = updateInBetMenu(id);

    switch (value) {
      case "in-bet-pick-winner":
        const { pickWinnerEmbed, menu } = await pickWinnerMenu(id, client);
        await interaction.reply({
          embeds: [pickWinnerEmbed],
          components: [menu],
        });
        //interaction.deferUpdate();
        break;
      case "end-up-bet":
        //const arrayMsg = [...historyMessages];
        // const msg = await interaction.channel.messages.fetch();
        // msg.forEach((msg) => {
        //   if (!msg.author.bot)
        //     arrayMsg.push(
        //       `[${new Date(msg.createdTimestamp).toLocaleString("pt-BR")}] ${
        //         msg.author.username
        //       }: ${msg.content}`
        //     );
        // });

        // UPDATE END DATE IN BET
        const dataAtual = new Date();
        const options = { timeZone: "America/Sao_Paulo" };
        const dataHoraBrasil = dataAtual.toLocaleString("pt-BR", options);

        await betOnGoing.findOneAndUpdate(
          {
            betId: id,
          },
          {
            Status: "ended",
            endTime: dataHoraBrasil,
            historyMessages: messages[`historyMessage-${id}`],
          }
        );

        delete messages[`historyMessage-${id}`];

        // UPDATE END DATE IN BET

        let userDataPlayer1 = await userDataSchema.findOne({
          UserID: betData.bettors.Player1.id,
        });
        let userDataPlayer2 = await userDataSchema.findOne({
          UserID: betData.bettors.Player2.id,
        });

        if (!userDataPlayer1 || !userDataPlayer2) {
          userDataPlayer1 = await userDataSchema.create({
            UserID: betData.bettors.Player1.id,
          });
          userDataPlayer2 = await userDataSchema.create({
            UserID: betData.bettors.Player2.id,
          });
        }

        await userDataSchema.findOneAndUpdate(
          {
            UserID: betData.bettors.Player1.id,
          },
          {
            Win: userDataPlayer1.Win + betData.bettors.Player1.win,
            Loss: userDataPlayer1.Loss + betData.bettors.Player1.lose,
          }
        );
        await userDataSchema.findOneAndUpdate(
          {
            UserID: betData.bettors.Player2.id,
          },
          {
            Win: userDataPlayer2.Win + betData.bettors.Player2.win,
            Loss: userDataPlayer2.Loss + betData.bettors.Player2.lose,
          }
        );

        await interaction.reply({
          embeds: [
            new EmbedBuilder().setDescription(
              `${interaction.user} finalizou a aposta, a sala fechará automaticamente em 5 segundos.`
            ),
          ],
        });

        delay(5000).then(async () => {
          await interaction.channel.delete();
        });

        break;

      case "player-1":
        const p1winner = decidedWinner(p1, p2);
        await interaction.update({
          embeds: [p1winner],
          components: [],
        });

        await interaction.channel.send({
          embeds: [auxEmbed],
          components: [menuUpdate, rulesButton],
        });

        // UPDATE DATABASE - USER
        await betOnGoing.findOneAndUpdate(
          {
            betId: id,
          },
          {
            bettors: {
              Player1: {
                id: betData.bettors.Player1.id,
                win: betData.bettors.Player1.win + 1,
                lose: betData.bettors.Player1.lose,
              },
              Player2: {
                id: betData.bettors.Player2.id,
                win: betData.bettors.Player2.win,
                lose: betData.bettors.Player2.lose + 1,
              },
            },
          }
        );

        break;
      case "player-2":
        const p2winner = decidedWinner(p2, p1);
        await interaction.update({
          embeds: [p2winner],
          components: [],
        });

        await interaction.channel.send({
          embeds: [auxEmbed],
          components: [menuUpdate, rulesButton],
        });

        // UPDATE DATABASE - USER
        await betOnGoing.findOneAndUpdate(
          {
            betId: id,
          },
          {
            bettors: {
              Player1: {
                id: betData.bettors.Player1.id,
                win: betData.bettors.Player1.win,
                lose: betData.bettors.Player1.lose + 1,
              },
              Player2: {
                id: betData.bettors.Player2.id,
                win: betData.bettors.Player2.win + 1,
                lose: betData.bettors.Player2.lose,
              },
            },
          }
        );

        break;
      default:
        break;
    }
  },
};
