const { Events, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isButton() && !interaction.isModalSubmit()) return;

        if (interaction.customId === 'service') {
            const modal = new ModalBuilder()
                .setCustomId('serviceModal')
                .setTitle('Création de Service');

            const serviceInput = new TextInputBuilder()
                .setCustomId('serviceName')
                .setLabel("Nom du service à créer")
                .setStyle(TextInputStyle.Short);

            const firstActionRow = new ActionRowBuilder().addComponents(serviceInput);

            modal.addComponents(firstActionRow);

            await interaction.showModal(modal);
        } else if (interaction.isModalSubmit() && interaction.customId === 'serviceModal') {
            const serviceName = interaction.fields.getTextInputValue('serviceName');
            
            if (serviceName && serviceName.trim()) {
                const sanitizedName = serviceName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
                const filePath = path.join(__dirname, '../db/stock', `${sanitizedName}.txt`);
                
                try {
                    if (fs.existsSync(filePath)) {
                        await interaction.reply({ content: `Service "${serviceName}" déjà existant.`, ephemeral: true });
                    } else {
                        fs.writeFileSync(filePath, '');
                        await interaction.reply({ content: `Service "${serviceName}" créé avec succès!`, ephemeral: true });
                    }
                } catch (error) {
                    console.error('Erreur lors de la gestion du service:', error);
                    await interaction.reply({ content: 'Une erreur est survenue lors de la création du service. Réessaie.', ephemeral: true });
                }
            } else {
                await interaction.reply({ content: 'Veuillez entrer un nom valide pour le service.', ephemeral: true });
            }
        }
    },
};