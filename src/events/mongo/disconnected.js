const chalk = require("chalk");

module.exports = {
  name: "disconnected",
  execute(client) {
    console.log(chalk.green("[Database Status]: Desconectado."));
  },
};
