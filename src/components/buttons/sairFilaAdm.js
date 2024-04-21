const { admQueueManager } = require("../../bot.js");
const queueName = "admQueue";

module.exports = {
  data: {
    name: "sairFilaAdm",
  },
  async execute(interaction, client) {
    if (!interaction.isButton()) return;

    if (!admQueueManager.isUserInAnyQueue(interaction.user.id)) {
      return await interaction.reply({
        content: `Você não está na fila de ADM`,
        ephemeral: true,
      });
    }

    admQueueManager.removeUserFromQueue(interaction.user.id, queueName);

    let string = "";
    let num = 1;
    await admQueueManager.queues[queueName].forEach(async (value) => {
      let adm = await client.users.fetch(value);
      string += `${num}. ${adm}\n`;
      num++;
    });

    string = string.replace("undefined", "");

    const embed = interaction.message.embeds[0];
    embed.fields[0] = {
      name: "Mediadores disponiveis",
      value: `${string || "Nenhum mediador na fila."}`,
    };
    await interaction.update({
      embeds: [embed],
    });
  },
};
