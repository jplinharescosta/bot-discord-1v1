const { SlashCommandBuilder, PermissionsBitField } = require("discord.js");
const { admQueueManager } = require("../../bot.js");
const admQueueSchema = require("../../schemas/admQueueSchema.js");
const queueName = "admQueue";
const sucessEmbed = require("../../embeds/sucessEmbed.js");
const errorEmbed = require("../../embeds/errorEmbed.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("controle")
    .setDescription("Sistema de controle")
    .addSubcommand((command) =>
      command
        .setName("remover")
        .setDescription("Remova um ADM da fila de Mediadores")
        .addUserOption((option) =>
          option
            .setName("usuario")
            .setDescription("Usuario para ser removido da fila.")
        )
    )
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator),
  async execute(interaction, client) {
    const user = await interaction.options.getUser("usuario");
    const userID = user.id;
    const data = await admQueueSchema.findOne({
      GuildID: interaction.guild.id,
    });

    if (!admQueueManager.isUserInAnyQueue(user.id)) {
      return await interaction.reply({
        embeds: [errorEmbed(`O ${user} não está na fila de controle.`)],
        ephemeral: true,
      });
    }
    admQueueManager.removeUserFromQueue(userID, queueName);
    if (data) {
      const channel = await interaction.channel.fetch(data.ChatID);
      const message = await channel.messages.fetch(data.MessageID);

      let string = "";
      let num = 1;
      await admQueueManager.queues[queueName].forEach(async (value) => {
        let adm = value;
        string += `${num}. <@${adm}>\n`;
        num++;
      });

      string = string.replace("undefined", "");

      const embed = message.embeds[0];
      embed.fields[0] = {
        name: "Mediadores disponiveis",
        value: `${string || "Nenhum mediador na fila."}`,
      };
      await message.edit({
        embeds: [embed],
      });
    }

    await interaction.reply({
      embeds: [
        sucessEmbed(
          `O mediador ${user} foi removido da fila de controle com sucesso.`
        ),
      ],
      ephemeral: true,
    });
  },
};
