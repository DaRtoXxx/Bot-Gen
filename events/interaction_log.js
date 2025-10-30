const { Events, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isButton() && !interaction.isModalSubmit()) return;

        if (interaction.customId === 'log') {
            const modal = new ModalBuilder()
                .setCustomId('logChannelId')
                .setTitle('Setup Log Channel');

            const channelIdInput = new TextInputBuilder()
                .setCustomId('channelId')
                .setLabel("ID du salon de log")
                .setStyle(TextInputStyle.Short);

            const firstActionRow = new ActionRowBuilder().addComponents(channelIdInput);

            modal.addComponents(firstActionRow);

            await interaction.showModal(modal);
        } else if (interaction.isModalSubmit() && interaction.customId === 'logChannelId') {
            const channelId = interaction.fields.getTextInputValue('channelId');
            
            if (channelId && /^\d{17,20}$/.test(channelId)) {  // Vérifie si c'est un ID de canal valide
                const filePath = path.join(__dirname, '../db/log/gen.txt');
                try {
                    fs.writeFileSync(filePath, channelId, { flag: 'w' });
                    await interaction.reply({ content: 'ID du salon de log sauvegardé avec succès!', ephemeral: true });
                } catch (error) {
                    console.error('Erreur lors de l\'écriture dans le fichier:', error);
                    await interaction.reply({ content: 'Une erreur est survenue lors de la sauvegarde de l\'ID du salon de log.', ephemeral: true });
                }
            } else {
                await interaction.reply({ content: 'Veuillez entrer un ID de canal valide.', ephemeral: true });
            }
        }
    },
};