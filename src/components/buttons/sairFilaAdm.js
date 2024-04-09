const { EmbedBuilder, Colors } = require("discord.js");
const { queues } = require("../../bot.js");
const admQueueInfoSchema = require("../../schemas/admQueueInfoSchema.js");

function removeItemOnce(arr, value) {
  var index = arr.indexOf(value);
  if (index > -1) {
    arr.splice(index, 1);
  }
  return arr;
}

module.exports = {
  data: {
    name: "sairFilaAdm",
  },
  async execute(interaction, client) {
    if (!interaction.isButton()) return;

    if (!queues.AdmQueue.includes(interaction.user.id)) {
      return await interaction.reply({
        content: `Você não está na fila de ADM`,
        ephemeral: true,
      });
    }
    removeItemOnce(queues.AdmQueue, interaction.user.id);

    let string = "";
    let num = 1;
    await queues.AdmQueue.forEach(async (value) => {
      let adm = await client.users.fetch(value);
      string += `${num}. ${adm}\n`;
      num++;
    });

    string = string.replace("undefined", "");

    const admQueueEmbedUpdate = new EmbedBuilder()
      .setTitle("Fila de ADMs")
      .addFields({
        name: "Mediadores disponiveis",
        value: `${string || "Nenhum mediador na fila."}`,
      })
      .setFooter({ text: "Todos os mediadores estão aleatorizados!" })
      .setColor(Colors.Green)
      .setThumbnail(client.user.displayAvatarURL());

    await interaction.message.fetch(interaction.message.id).then(async (msg) =>
      msg.edit({
        embeds: [admQueueEmbedUpdate],
      })
    );

    await interaction.reply({
      content: `${interaction.user}, você saiu da fila de ADM.`,
      ephemeral: true,
    });
  },
};
