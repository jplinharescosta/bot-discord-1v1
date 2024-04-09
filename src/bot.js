require("dotenv").config();
const { token, databaseToken, slaveToken } = process.env;
const { connect } = require("mongoose");
const { Client, Collection, GatewayIntentBits } = require("discord.js");
const fs = require("fs");

module.exports = {
  queues: {
    AdmQueue: [],
    GeneralQueue: [],
    "1v1": [],
    "2v2": [],
    "3v3": [],
    "4v4": [],
    "5v5": [],
  },
};

const client = new Client({
  intents: [
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
  ],
});

client.commands = new Collection();
client.buttons = new Collection();
client.commandArray = [];

const functionFolders = fs.readdirSync(`./src/functions`);
for (const folder of functionFolders) {
  const functionFiles = fs
    .readdirSync(`./src/functions/${folder}`)
    .filter((file) => file.endsWith(".js"));
  for (const file of functionFiles)
    require(`./functions/${folder}/${file}`)(client);
}

client.handleEvents();
client.handleCommands();
client.handleComponents();
client.login(token);
(async () => {
  await connect(databaseToken).catch(console.error);
})();
