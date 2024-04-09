export const name = "interactionCreate";
export const execute = async (interaction, client) => {
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
  }
};
