const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const { client_id, guild_id } = process.env;
const fs = require("fs");

module.exports = (client) => {
  client.handleCommands = async () => {
    const commandsFolders = fs.readdirSync("./src/commands");
    for (const folder of commandsFolders) {
      const commandFiles = fs
        .readdirSync(`./src/commands/${folder}`)
        .filter((file) => file.endsWith(".js"));
      const { commands, commandArray } = client;

      for (const file of commandFiles) {
        const command = require(`../../commands/${folder}/${file}`);
        commands.set(command.data.name, command);
        commandArray.push(command.data.toJSON());
      }
    }

    const clientId = client_id;
    const guildId = guild_id;
    const rest = new REST({ version: "10" }).setToken(process.env.token);

    try {
      console.log("Comandos de atualização do aplicativo (/) iniciados");
      await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
        body: client.commandArray,
      });

      console.log("Comandos do aplicativo (/) atualizados com sucesso");
    } catch (error) {
      console.error(error);
    }
  };
};
