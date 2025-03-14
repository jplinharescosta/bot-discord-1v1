const admDataInfos = require("../../schemas/admDataInfos.js");
const { admQueueManager } = require("../../bot.js");
const errorEmbed = require("../../embeds/errorEmbed.js");
const queueName = "admQueue";

module.exports = {
  data: {
    name: "entrarFilaAdm",
  },
  async execute(interaction, client) {
    if (!interaction.isButton()) return;

    const dataAdm = await admDataInfos.findOne({
      UserId: interaction.user.id,
    });

    if (!dataAdm) {
      return interaction.reply({
        embeds: [
          errorEmbed(
            `${interaction.user} você não está cadastrado no Banco de dados, entre em contato com algum supervisor.`
          ),
        ],
        ephemeral: true,
      });
    }

    if (!dataAdm.linkPix || !dataAdm.pixQrCode) {
      return interaction.reply({
        embeds: [
          errorEmbed(
            `${interaction.user} você não tem seu PIX e/ou QRCode cadastrados no Banco de dados. Utilize /mediador add-pix e add-qr para adiciona-los.`
          ),
        ],
        ephemeral: true,
      });
    }

    if (admQueueManager.isUserInAnyQueue(interaction.user.id)) {
      return await interaction.reply({
        content: `Você já está na fila de ADM.`,
        ephemeral: true,
      });
    }

    admQueueManager.addUserToQueue(interaction.user.id, queueName);

    let string = "";
    let num = 1;
    admQueueManager.queues[queueName].forEach(async (value) => {
      let adm = value;
      string += `${num}. <@${adm}>\n`;
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
