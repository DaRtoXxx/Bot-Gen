const { Events, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isButton() && !interaction.isModalSubmit()) return;

        if (interaction.customId === 'role') {
            const modal = new ModalBuilder()
                .setCustomId('roleGenAndBio')
                .setTitle('Setup rôle gen et bio perso.');

            // Input pour l'ID du rôle
            const roleIdInput = new TextInputBuilder()
                .setCustomId('roleId')
                .setLabel("ID du rôle pour la génération")
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('Entrez l\'ID du rôle');

            // Input pour le statut personnalisé
            const bioInput = new TextInputBuilder()
                .setCustomId('bio')
                .setLabel("Statut personnalisé à avoir")
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('Entrez le statut personnalisé');

            const firstActionRow = new ActionRowBuilder().addComponents(roleIdInput);
            const secondActionRow = new ActionRowBuilder().addComponents(bioInput);

            modal.addComponents(firstActionRow, secondActionRow);

            await interaction.showModal(modal);
        } else if (interaction.isModalSubmit() && interaction.customId === 'roleGenAndBio') {
            const roleId = interaction.fields.getTextInputValue('roleId');
            const bio = interaction.fields.getTextInputValue('bio');
            
            if (roleId && bio) {
                const filePath = path.join(__dirname, '../db/generation_systeme/id/role_gen.txt');
                const dataToSave = `${roleId}\n${bio}`;
                try {
                    fs.writeFileSync(filePath, dataToSave, { flag: 'w' });
                    await interaction.reply({ content: 'ID du rôle et statut personnalisé sauvegardés avec succès!', ephemeral: true });
                } catch (error) {
                    console.error('Erreur lors de l\'écriture dans le fichier:', error);
                    await interaction.reply({ content: 'Une erreur est survenue lors de la sauvegarde des informations.', ephemeral: true });
                }
            } else {
                await interaction.reply({ content: 'Veuillez entrer un ID de rôle et un statut personnalisé valides.', ephemeral: true });
            }
        }
    },
};