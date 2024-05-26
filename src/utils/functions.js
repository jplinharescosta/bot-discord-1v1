async function updateRanking(
  p1,
  p2,
  schema,
  winScoreP1,
  winScoreP2,
  loseScoreP1,
  loseScoreP2,
  p1TotalWon,
  p2TotalWon,
  p1DayProfit,
  p2DayProfit
) {
  const datap1 = await schema.findOne({
    UserID: p1,
  });
  const datap2 = await schema.findOne({
    UserID: p2,
  });

  await schema.findOneAndUpdate(
    {
      UserID: p1,
    },
    {
      Win: datap1["Win"] + winScoreP1,
      Loss: datap1["Loss"] + loseScoreP1,
      TotalWon: parseFloat(datap1["TotalWon"] + p1TotalWon),
      DayProfit: parseFloat(datap1["DayProfit"] + p1DayProfit),
    }
  );
  await schema.findOneAndUpdate(
    {
      UserID: p2,
    },
    {
      Win: datap2["Win"] + winScoreP2,
      Loss: datap2["Loss"] + loseScoreP2,
      TotalWon: parseFloat(datap2["TotalWon"] + p2TotalWon),
      DayProfit: parseFloat(datap2["DayProfit"] + p2DayProfit),
    }
  );
}

async function createDataRanking(user, schema) {
  const data = await schema.findOne({
    UserID: user,
  });
  if (!data) {
    await schema.create({
      UserID: user,
    });
  }
}

async function pickWinnerDatabaseUpdate(
  whoWinner,
  schema,
  id,
  player1ID,
  player2ID,
  player1Win,
  player2Win,
  player1Lose,
  player2Lose,
  p1TotalWon,
  p2TotalWon,
  p1DayProfit,
  p2DayProfit,
  playerProfitOrLoss
) {
  switch (whoWinner) {
    case "player-1":
      await schema.findOneAndUpdate(
        {
          betId: id,
        },
        {
          bettors: {
            Player1: {
              id: player1ID,
              win: player1Win + 1,
              lose: player1Lose,
              TotalWon: parseFloat(p1TotalWon + playerProfitOrLoss),
              DayProfit: parseFloat(p1DayProfit + playerProfitOrLoss),
            },
            Player2: {
              id: player2ID,
              win: player2Win,
              lose: player2Lose + 1,
              TotalWon: parseFloat(p2TotalWon - playerProfitOrLoss),
              DayProfit: parseFloat(p2DayProfit - playerProfitOrLoss),
            },
          },
        }
      );
      break;
    case "player-2":
      await schema.findOneAndUpdate(
        {
          betId: id,
        },
        {
          bettors: {
            Player1: {
              id: player1ID,
              win: player1Win,
              lose: player1Lose + 1,
              TotalWon: parseFloat(p1TotalWon - playerProfitOrLoss),
              DayProfit: parseFloat(p1DayProfit - playerProfitOrLoss),
            },
            Player2: {
              id: player2ID,
              win: player2Win + 1,
              lose: player2Lose,
              TotalWon: parseFloat(p2TotalWon + playerProfitOrLoss),
              DayProfit: parseFloat(p2DayProfit + playerProfitOrLoss),
            },
          },
        }
      );

      break;

    default:
      break;
  }
}

module.exports = { updateRanking, createDataRanking, pickWinnerDatabaseUpdate };
