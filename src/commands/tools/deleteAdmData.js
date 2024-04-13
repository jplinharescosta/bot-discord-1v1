const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const admDataInfos = require("../../schemas/admDataInfos.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("del-adm-db")
    .setDescription("Apagar dados usuario ADM")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addUserOption((op) =>
      op
        .setName("user")
        .setDescription("Usuario para cadastro")
        .setRequired(true)
    ),
  async execute(interaction, client) {
    const user = await interaction.options.getUser("user");
    let data = await admDataInfos.findOne({
      UserId: user.id,
    });
    if (!data) {
      return await interaction.reply({
        content: `O usuario ${user} não pode ser deletado pois não cadastrado no bando de dados.`,
        ephemeral: true,
      });
    }

    await admDataInfos.findOneAndDelete({
      UserId: user.id,
    });

    await interaction.reply({
      content: `O usuario ${user} foi deletado com sucesso.`,
      ephemeral: true,
    });
  },
};
