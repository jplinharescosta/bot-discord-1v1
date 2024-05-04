const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  PermissionFlagsBits,
  PermissionsBitField,
} = require("discord.js");

const admQueueSchema = require("../../schemas/admQueueSchema.js");
const errorEmbed = require("../../embeds/errorEmbed.js");
const sucessEmbed = require("../../embeds/sucessEmbed.js");
const envConfig = require("../../schemas/envConfig.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("fc")
    .setDescription("Gerenciar sistema de fila de controle")
    .addSubcommand((command) =>
      command
        .setName("setup")
        .setDescription("Configura fila de controle")
        .addChannelOption((option) =>
          option
            .setName("canal")
            .setDescription("Canal em que será configurado a fila de controle.")
            .setRequired(true)
        )
    )
    .addSubcommand((command) =>
      command.setName("remover").setDescription("Desabilita fila de controle.")
    )
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator),
  async execute(interaction, client) {
    const { DefaultThumbNail } = await envConfig.findOne({
      Name: "envConfig",
    });
    const { options } = interaction;
    const sub = options.getSubcommand();
    const channelToSend = options.get("canal");
    const data = await admQueueSchema.findOne({
      GuildID: interaction.guild.id,
    });

    switch (sub) {
      case "setup":
        if (data) {
          return await interaction.reply({
            embeds: [
              errorEmbed(
                `A fila de controle nesse servidor já está configurada.`
              ),
            ],
            ephemeral: true,
          });
        }

        const enterButton = new ButtonBuilder({
          custom_id: "entrarFilaAdm",
          label: "Entrar na fila",
          style: ButtonStyle.Primary,
        });

        const exitButton = new ButtonBuilder({
          custom_id: "sairFilaAdm",
          label: "Sair da fila",
          style: ButtonStyle.Danger,
        });

        const admQueueEmbed = new EmbedBuilder()
          .setTitle("Fila de ADMs")
          .addFields({
            name: "Mediadores disponiveis",
            value: `Nenhum mediador na fila.`,
          })
          .setThumbnail(DefaultThumbNail)
          .setFooter({ text: "Todos os mediadores estão aleatorizados!" });

        const buttons = new ActionRowBuilder().addComponents(
          enterButton,
          exitButton
        );

        const msg = await channelToSend.channel.send({
          embeds: [admQueueEmbed],
          components: [buttons],
        });

        await admQueueSchema.create({
          GuildID: interaction.guild.id,
          MessageID: msg.id,
          ChatID: channelToSend.channel.id,
        });

        await interaction.reply({
          embeds: [
            sucessEmbed(
              `Fila de controle configurada com sucesso no canal -> ${channelToSend.channel}`
            ),
          ],
          ephemeral: true,
        });

        break;
      case "remover":
        if (!data) {
          return await interaction.reply({
            embeds: [
              errorEmbed(
                `A fila de controle ainda não está configurada. Utilize /fc setup [canal]`
              ),
            ],
            ephemeral: true,
          });
        }

        await admQueueSchema.findOneAndDelete({
          GuildID: interaction.guild.id,
        });

        const channel = await interaction.channel.fetch(data.ChatID);
        await channel.messages
          .fetch(data.MessageID)
          .then((msg) => msg.delete());

        await interaction.reply({
          embeds: [
            sucessEmbed(
              `Configuração de fila de controle removida com sucesso.`
            ),
          ],
          ephemeral: true,
        });
        break;

      default:
        break;
    }
  },
};
