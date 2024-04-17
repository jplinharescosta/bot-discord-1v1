const errorEmbed = require("../../embeds/errorEmbed.js");
const pickWinnerMenu = require("../../menus/pickWinner.js");
const betOnGoing = require("../../schemas/betOnGoing.js");
const updateInBetMenu = require("../../embeds/updateInBetMenu.js");
const decidedWinner = require("../../embeds/decidedWinner.js");
const admDataInfos = require("../../schemas/admDataInfos.js");
const { EmbedBuilder } = require("discord.js");
const { adm_role_id } = process.env;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = {
  data: {
    name: "in-bet-select-menu",
  },
  async execute(interaction, client) {
    if (!interaction.member.roles.cache.has(adm_role_id)) {
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
    const p1 = await client.users.fetch(betData.bettors.Player1.id);
    const p2 = await client.users.fetch(betData.bettors.Player2.id);
    const dataAdm = await admDataInfos.findOne({
      UserId: interaction.user.id,
    });

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

        // UPDATE DATABASE - AMMOUNT BETS ADM
        await admDataInfos.findOneAndUpdate(
          {
            UserId: interaction.user.id,
          },
          { ammountBets: dataAdm.ammountBets + 1 }
        );

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

        // UPDATE DATABASE - AMMOUNT BETS ADM
        await admDataInfos.findOneAndUpdate(
          {
            UserId: interaction.user.id,
          },
          { ammountBets: dataAdm.ammountBets + 1 }
        );

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
