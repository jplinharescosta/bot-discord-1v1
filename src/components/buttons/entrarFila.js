const { execute } = require("../../events/mongo/connecting");
const pvpInfos = require("../../schemas/pvpInfoSchema");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  data: {
    name: "entrarFila",
  },
  async execute(interaction, client) {
    queues.GeneralQueue.push(interaction.user.id);
    const arrayLength = queues.Queue1v1.push(interaction.user.id);
    console.log("Array Length - Queue1v1", arrayLength);
    console.log("General Queue", queues.GeneralQueue);
    console.log("1v1 Queue", queues.Queue1v1);
    interaction.reply({
      content: "Você entrou na fila",
      ephemeral: true,
    });
  },
};
