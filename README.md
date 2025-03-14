# Discord 1v1 Bot

![Badge](https://img.shields.io/badge/technology-JavaScript-yellow) ![Badge](https://img.shields.io/badge/license-MIT-green)

> A Discord bot to organize 1v1 matches between server members, track results, and maintain a ranking system.

## 🚀 Technologies Used

This project was developed using the following technologies:

- [Node.js](https://nodejs.org/)
- [Discord.js](https://discord.js.org/)

## 📦 Installation and Usage

1. **Clone this repository:**

    ```sh
    git clone https://github.com/jplinharescosta/bot-discord-1v1.git
    ```

2. **Navigate to the project folder:**

    ```sh
    cd bot-discord-1v1
    ```

3. **Install dependencies:**

    ```sh
    npm install
    ```

4. **Set up environment variables:**

    - Rename `.env.exemple` to `.env`.
    - Fill in the required information in the `.env` file, such as your bot token and other configurations.

5. **Set up MongoDB cluster:**

   To use the bot, you'll need to set up a MongoDB cluster with the following schemas to store configuration data.

   ### Required MongoDB Schemas:

   - **envConfig Schema**: Configuration for the bot’s environment (e.g., welcome chat, roles, guild settings).
   - **matchConfig Schema**: Stores data related to match settings (e.g., current match state, participants).
   - **playerStats Schema**: Stores player statistics and match results.
   - **rankings Schema**: Maintains player rankings based on match outcomes.

   Here's an example of the `envConfig` schema:

   ```javascript
   const { Schema, default: mongoose } = require("mongoose");

   const envSchema = new Schema({
     Name: { type: String, default: "envConfig" },
     WelcomeChatID: String,
     OrgName: { type: String, default: "ORG ACE" },
     MemberRoleID: String,
     MediatorRoleId: String,
     ClientIDCreator: String,
     ClientIDAssistant: String,
     GuildID: String,
     BlackListChatID: String,
     ReachargeCategoryID: { type: String, default: "" },
     DefaultThumbNail: { type: String, default: "" },
     ChannelValue: { type: String, default: "1.80" },
     LinkToRulesChannel: { type: String, default: "" },
     TaxToMediator: { type: String, default: "0" },
   });

   module.exports =
     mongoose.models.envSchema ||
     mongoose.model("envConfig", envSchema, "envConfig");

6. **Start the bot:**

    ```sh
    npm start
    ```

## 📸 Demo

![image](https://github.com/user-attachments/assets/476d5139-55f9-4cb6-91e0-d9f66fc60dc2)

![image](https://github.com/user-attachments/assets/f758658b-7694-42d7-9ddd-998e65eef119)

## ✅ Features

- ✔️ Organizes 1v1 matches between server members.
- ✔️ Tracks match results and player stats.
- ✔️ Maintains a ranking system based on match outcomes.

## 🤝 Contributing

Feel free to contribute! Here's how you can get started:

1. Fork the repository 🍴
2. Create a new branch: `git checkout -b my-feature`
3. Commit your changes: `git commit -m 'Added new feature'`
4. Push to the remote repository: `git push origin my-feature`
5. Open a Pull Request ✅

## 📝 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

---

Created by [João Pedro Linhares](https://github.com/jplinharescosta) 🚀
