const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup')
        .setDescription('Commande de setup pour le bot'),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            await interaction.reply({ content: 'Vous devez être administrateur pour utiliser cette commande.', ephemeral: true });
            return;
        }

        const embed = new EmbedBuilder()
            .setColor(0x000000)
            .setTitle(`⚙️ Setup de ${interaction.client.user.tag}`)
            .setDescription('1 - Setup les émojis sur le serveur.\n2 - Setup des gifs.\n3 - Setup des services.\n4 - Setup log gen channel\n5 - Setup rôle gen et bio perso.\n6 - Setup cooldown de génération.\n**7 - Setup rôle fournisseur.**');

        const emojisButton = new ButtonBuilder()
            .setCustomId('emojis')
            .setLabel('🙂 Émojis')
            .setStyle(ButtonStyle.Primary);

        const gifButton = new ButtonBuilder()
            .setCustomId('gif')
            .setLabel('🔗 Gif')
            .setStyle(ButtonStyle.Primary);

        const serviceButton = new ButtonBuilder()
            .setCustomId('service')
            .setLabel('📦 Service')
            .setStyle(ButtonStyle.Primary);

        const logButton = new ButtonBuilder()
            .setCustomId('log')
            .setLabel('📜 Log')
            .setStyle(ButtonStyle.Primary);

        const roleButton = new ButtonBuilder()
            .setCustomId('role')
            .setLabel('👤 Rôle')
            .setStyle(ButtonStyle.Primary);

        const cooldownButton = new ButtonBuilder()
            .setCustomId('cooldown')
            .setLabel('🕚 Cooldown')
            .setStyle(ButtonStyle.Primary);

        const fournisseurButton = new ButtonBuilder()
            .setCustomId('fournisseur')
            .setLabel('🏷️ Fournisseur')
            .setStyle(ButtonStyle.Primary);

        // Diviser les boutons en deux lignes, en ajoutant le bouton fournisseur
        const firstRow = new ActionRowBuilder()
            .addComponents(emojisButton, gifButton, serviceButton);

        const secondRow = new ActionRowBuilder()
            .addComponents(logButton, roleButton, cooldownButton);

        const thirdRow = new ActionRowBuilder()
            .addComponents(fournisseurButton);

        await interaction.reply({ embeds: [embed], components: [firstRow, secondRow, thirdRow] });
    },
};