const { SlashCommandBuilder } = require("discord.js");
const admDataInfos = require("../../schemas/admDataInfos.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("add-adm-db")
    .setDescription("Criar dados usuario ADM")
    .addUserOption((op) =>
      op
        .setName("user")
        .setDescription("Usuario para cadastro")
        .setRequired(true)
    ),
  async execute(interaction, client) {
    const user = await interaction.options.getUser("user");
    const data = await admDataInfos.findOne({
      UserId: user.id,
    });
    if (data) {
      return await interaction.reply({
        content: `O usuario ${user} já está cadastrado no bando de dados.`,
        ephemeral: true,
      });
    }
    const dataAtual = new Date();

    const options = { timeZone: "America/Sao_Paulo" };

    const dataHoraBrasil = dataAtual.toLocaleString("pt-BR", options);

    const AddUserDB = await admDataInfos.create({
      UserId: user.id,
      registeredDate: dataHoraBrasil,
    });

    AddUserDB.save().catch((err) => console.error(err));

    await interaction.reply({
      content: `O usuario ${user} foi adicionado com sucesso na database.`,
      ephemeral: true,
    });
  },
};
