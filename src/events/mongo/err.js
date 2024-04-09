const chalk = require("chalk");

module.exports = {
  name: "disconnected",
  execute(err) {
    console.log(
      chalk.red(`Ocorreu um erro ao se conectar com a database:\n${err}`)
    );
  },
};
