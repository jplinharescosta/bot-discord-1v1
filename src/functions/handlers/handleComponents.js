import { readdirSync } from "fs";

module.exports = (client) => {
  client.handleComponents = async () => {
    const componentFolder = readdirSync("./src/components");
    for (const folder of componentFolder) {
      const componentFiles = readdirSync(`./src/components/${folder}`).filter(
        (file) => file.endsWith(".js")
      );

      const { buttons } = client;

      switch (folder) {
        case "buttons":
          for (const file of componentFiles) {
            const button = require(`../../components/${folder}/${file}`);
          }
          break;

        default:
          break;
      }
    }
  };
};
