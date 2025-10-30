const { Events, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (interaction.isButton() && interaction.customId === 'fournisseur') {
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                await interaction.reply({ content: 'Vous devez être administrateur pour utiliser cette fonctionnalité.', ephemeral: true });
                return;
            }

            const modal = new ModalBuilder()
                .setCustomId('setupFournisseur')
                .setTitle('Setup du rôle fournisseur');

            const roleIdInput = new TextInputBuilder()
                .setCustomId('roleId')
                .setLabel('ID du rôle fournisseur')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('Entrez l\'ID du rôle fournisseur')
                .setRequired(true);

            const firstActionRow = new ActionRowBuilder().addComponents(roleIdInput);

            modal.addComponents(firstActionRow);

            await interaction.showModal(modal);
        } else if (interaction.isModalSubmit() && interaction.customId === 'setupFournisseur') {
            const roleId = interaction.fields.getTextInputValue('roleId');

            if (!roleId || isNaN(roleId)) {
                await interaction.reply({ content: 'Veuillez entrer un ID de rôle valide.', ephemeral: true });
                return;
            }

            const roleIdPath = path.join(__dirname, '../db/role_id/fournisseur.txt');
            fs.writeFileSync(roleIdPath, roleId);

            await interaction.reply({ content: `L'ID du rôle fournisseur a été enregistré : **${roleId}**.`, ephemeral: true });
        }
    },
};