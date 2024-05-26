const errorEmbed = require("../../embeds/errorEmbed.js");
const pickWinnerMenu = require("../../menus/pickWinner.js");
const betOnGoing = require("../../schemas/betOnGoing.js");
const updateInBetMenu = require("../../embeds/updateInBetMenu.js");
const decidedWinner = require("../../embeds/decidedWinner.js");
const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const userDataSchema = require("../../schemas/userSchema.js");
const { messages } = require("../../components/buttons/entrarFila.js");
const envConfig = require("../../schemas/envConfig.js");
const dayRankingSchema = require("../../schemas/dayRankingSchema.js");
const weekRankingSchema = require("../../schemas/weekRankingSchema.js");
const monthRankingSchema = require("../../schemas/monthRankingSchema.js");
const {
  updateRanking,
  createDataRanking,
  pickWinnerDatabaseUpdate,
} = require("../../utils/functions.js");

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = {
  data: {
    name: "in-bet-select-menu",
  },
  async execute(interaction, client) {
    const { MediatorRoleId, ChannelValue, TaxToMediator } =
      await envConfig.findOne({
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

    const p1 = betData.bettors.Player1.id;
    const p2 = betData.bettors.Player2.id;
    const p1Win = betData.bettors.Player1.win;
    const p2Win = betData.bettors.Player2.win;
    const p1Lose = betData.bettors.Player1.lose;
    const p2Lose = betData.bettors.Player2.lose;
    const p1TotalWon = betData.bettors.Player1.TotalWon;
    const p2TotalWon = betData.bettors.Player2.TotalWon;
    const p1DayProfit = betData.bettors.Player1.DayProfit;
    const p2DayProfit = betData.bettors.Player2.DayProfit;

    const percentage = parseFloat(TaxToMediator) / 100;
    const betPrice = parseFloat(betData.betPrice);
    // prettier-ignore
    const tax = (betPrice * 2) * percentage;

    // const fullPrice = parseFloat(betPrice - ChannelValue - tax);

    const playerProfitOrLoss = betPrice - tax - ChannelValue / 2;

    const { auxEmbed, menuUpdate, rulesButton } = await updateInBetMenu(id);

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

        await createDataRanking(p1, userDataSchema);
        await createDataRanking(p2, userDataSchema);
        await updateRanking(
          p1,
          p2,
          userDataSchema,
          p1Win,
          p2Win,
          p1Lose,
          p2Lose,
          p1TotalWon,
          p2TotalWon,
          p1DayProfit,
          p2DayProfit
        );

        //RANKING
        await createDataRanking(p1, dayRankingSchema);
        await createDataRanking(p2, dayRankingSchema);

        await updateRanking(
          p1,
          p2,
          dayRankingSchema,
          p1Win,
          p2Win,
          p1Lose,
          p2Lose,
          p1TotalWon,
          p2TotalWon,
          p1DayProfit,
          p2DayProfit
        );

        await createDataRanking(p1, weekRankingSchema);
        await createDataRanking(p2, weekRankingSchema);

        await updateRanking(
          p1,
          p2,
          weekRankingSchema,
          p1Win,
          p2Win,
          p1Lose,
          p2Lose,
          p1TotalWon,
          p2TotalWon,
          p1DayProfit,
          p2DayProfit
        );

        await createDataRanking(p1, monthRankingSchema);
        await createDataRanking(p2, monthRankingSchema);

        await updateRanking(
          p1,
          p2,
          monthRankingSchema,
          p1Win,
          p2Win,
          p1Lose,
          p2Lose,
          p1TotalWon,
          p2TotalWon,
          p1DayProfit,
          p2DayProfit
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
        await pickWinnerDatabaseUpdate(
          "player-1",
          betOnGoing,
          id,
          p1,
          p2,
          p1Win,
          p2Win,
          p1Lose,
          p2Lose,
          p1TotalWon,
          p2TotalWon,
          p1DayProfit,
          p2DayProfit,
          playerProfitOrLoss
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
        await pickWinnerDatabaseUpdate(
          "player-2",
          betOnGoing,
          id,
          p1,
          p2,
          p1Win,
          p2Win,
          p1Lose,
          p2Lose,
          p1TotalWon,
          p2TotalWon,
          p1DayProfit,
          p2DayProfit,
          playerProfitOrLoss
        );

        break;
      default:
        break;
    }
  },
};
