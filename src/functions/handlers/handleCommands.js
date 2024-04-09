import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v10";
import fs from "fs";

module.exports = (client) => {
  client.handleCommands = async () => {
    const commandsFolders = fs.readdirSync("./src/commands");
    for (const folder of commandsFolders) {
      const commandFiles = fs
        .readdirSync(`./src/commands/${folder}`)
        .filter((file) => file.endsWith(".js"));
      const { commads, commandArray } = client;

      for (const file of commandFiles) {
        const command = require(`../../commands/${folder}/${file}`);
        commads.set(command.data.name, command);
        commandArray.push(command.data.toJSON());
      }
    }

    const clientId = "";
    const guildId = "";
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
