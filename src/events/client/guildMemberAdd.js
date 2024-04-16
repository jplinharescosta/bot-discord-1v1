const { EmbedBuilder } = require("discord.js");
const userSchema = require("../../schemas/userSchema.js");

const { welcome_chat_id, org_name, member_role_id } = process.env;

module.exports = {
  name: "guildMemberAdd",
  async execute(member) {
    const { user, guild } = member;
    const role = guild.roles.cache.get(member_role_id);
    await member.roles.add(role);
    const welcomeChannel = guild.channels.cache.get(welcome_chat_id);
    const welcomeMessage = `    
Olá ${user}, seja bem-vindo(a) ao ${org_name}!

🚨 Para mais informações sobre o servidor leia os canais abaixo!

⁠📬 Utilize o <#1229516439514517566> caso queira convidar alguma pessoa para o nosso discord

📛 Veja o canal <#1229346961438675035> para ficar por dentro sobre todas as novidades do nosso discord!

👮 Consulte o canal de <#1229346446533201940> para ficar por dentro das normas do nosso servidor para evitar punições!

❓ Ficou em duvida de como apostar? De uma olhada no <#1229346667250061363> para melhor entendimento do processo!

🤔 Caso fique com alguma duvida ou queira fazer uma denuncia, utilize o canal de <#1229348303213297754>
    
    `;

    const welcomeEmbed = new EmbedBuilder()
      .setColor("Random")
      .setTitle(`${org_name} | BEM-VINDO(A)!`)
      .setDescription(welcomeMessage)
      .setFooter({ text: `${org_name} • © Todos os direitos reservados.` })
      .setTimestamp();

    await welcomeChannel.send({
      content: `${user}`,
      embeds: [welcomeEmbed],
    });
    const checkData = await userSchema.findOne({
      UserID: user.id,
    });
    if (!checkData) {
      const userData = await userSchema.create({
        UserID: user.id,
      });
      await userData.save().catch((err) => console.error(err));
    }
  },
};
