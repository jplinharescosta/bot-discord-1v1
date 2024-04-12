const { EmbedBuilder, Colors } = require("discord.js");
const { queues } = require("../../bot.js");
const admQueueInfoSchema = require("../../schemas/admQueueInfoSchema.js");

module.exports = {
  data: {
    name: "entrarFilaAdm",
  },
  async execute(interaction, client) {
    if (!interaction.isButton()) return;

    if (queues.AdmQueue.includes(interaction.user.id)) {
      return await interaction.reply({
        content: `Você já está na fila de ADM.`,
        ephemeral: true,
      });
    }
    queues.AdmQueue.push(interaction.user.id);

    let string;
    let num = 1;
    await queues.AdmQueue.forEach(async (value) => {
      let adm = await client.users.fetch(value);
      string += `${num}. ${adm}\n`;
      num++;
    });

    string = string.replace("undefined", "");

    // const admQueueEmbedUpdate = new EmbedBuilder()
    //   .setTitle("Fila de ADMs")
    //   .addFields({
    //     name: "Mediadores disponiveis",
    //     value: `${string || "Nenhum mediador na fila."}`,
    //   })
    //   .setFooter({ text: "Todos os mediadores estão aleatorizados!" })
    //   .setColor(Colors.Green)
    //   .setThumbnail(client.user.displayAvatarURL());

    const embed = interaction.message.embeds[0];
    embed.fields[0] = {
      name: "Mediadores disponiveis",
      value: `${string || "Nenhum mediador na fila."}`,
    };
    await interaction.message.edit({
      embeds: [embed],
    });

    // await interaction.message.fetch(interaction.message.id).then(async (msg) =>
    //   msg.edit({
    //     embeds: [admQueueEmbedUpdate],
    //   })
    // );

    await interaction.reply({
      content: `${interaction.user}, você entrou na fila de ADM.`,
      ephemeral: true,
    });
  },
};
