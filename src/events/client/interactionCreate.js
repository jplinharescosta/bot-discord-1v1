module.exports = {
  name: "interactionCreate",
  async execute(interaction, client, queues) {
    if (interaction.isChatInputCommand()) {
      const { commands } = client;
      const { commandName } = interaction;
      const command = commands.get(commandName);
      if (!command) return;

      try {
        await command.execute(interaction, client);
      } catch (error) {
        console.error(error);
        await interaction.reply({
          content: `Algo deu errado quando tentou executar esse comando...`,
          ephemeral: true,
        });
      }
    } else if (interaction.isButton()) {
      const { buttons } = client;
      const { customId } = interaction;
      const button = buttons.get(customId);
      if (!button) return new Error("Não existe código para esse botão.");

      try {
        await button.execute(interaction, client);
      } catch (err) {
        console.error(err);
      }
    } else if (interaction.isStringSelectMenu()) {
      const { selectMenus } = client;
      const { customId } = interaction;
      const menu = selectMenus.get(customId);
      if (!menu)
        return new Error("Não existe nenhum código para esse menu de seleção.");

      try {
        await menu.execute(interaction, client);
      } catch (error) {
        console.error(error);
      }
    }
  },
};
