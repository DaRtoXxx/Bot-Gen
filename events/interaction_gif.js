const { Events, ActionRowBuilder, StringSelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isButton() && !interaction.isStringSelectMenu() && !interaction.isModalSubmit()) return;

        if (interaction.customId === 'gif') {
            const select = new StringSelectMenuBuilder()
                .setCustomId('gifOptions')
                .setPlaceholder('Choisissez une option')
                .addOptions([
                    {
                        label: 'Panel gif',
                        value: 'panel_gif'
                    },
                    {
                        label: 'Stock gif',
                        value: 'stock_gif'
                    },
                    {
                        label: 'Gen gif',
                        value: 'gen_gif'
                    }
                ]);

            const row = new ActionRowBuilder()
                .addComponents(select);

            await interaction.reply({ content: 'Choisissez une option :', components: [row], ephemeral: true });
        } else if (interaction.customId === 'gifOptions') {
            if (interaction.values[0] === 'panel_gif' || interaction.values[0] === 'stock_gif') {
                const modal = new ModalBuilder()
                    .setCustomId(interaction.values[0] === 'panel_gif' ? 'gifPanelLink' : 'gifStockLink')
                    .setTitle(`Lien du GIF pour le ${interaction.values[0].split('_')[0]}`);

                const linkInput = new TextInputBuilder()
                    .setCustomId('gifLink')
                    .setLabel("Entrez le lien du GIF")
                    .setStyle(TextInputStyle.Short);

                const firstActionRow = new ActionRowBuilder().addComponents(linkInput);

                modal.addComponents(firstActionRow);

                await interaction.showModal(modal);
            } else if (interaction.values[0] === 'gen_gif') {
                const modal = new ModalBuilder()
                    .setCustomId('gifGenLink')
                    .setTitle('Lien du GIF pour la génération');

                const linkInput = new TextInputBuilder()
                    .setCustomId('gifLink')
                    .setLabel("Entrez le lien du GIF")
                    .setStyle(TextInputStyle.Short);

                const firstActionRow = new ActionRowBuilder().addComponents(linkInput);

                modal.addComponents(firstActionRow);

                await interaction.showModal(modal);
            }
        } else if (interaction.isModalSubmit()) {
            let filePath;
            if (interaction.customId === 'gifPanelLink') {
                filePath = path.join(__dirname, '../db/generation_systeme/gif/panel.txt');
            } else if (interaction.customId === 'gifStockLink') {
                filePath = path.join(__dirname, '../db/generation_systeme/gif/stock.txt');
            } else if (interaction.customId === 'gifGenLink') {
                filePath = path.join(__dirname, '../db/generation_systeme/gif/gen.txt');
            }

            if (filePath) {
                const link = interaction.fields.getTextInputValue('gifLink');
                fs.writeFileSync(filePath, link, { flag: 'w' });
                await interaction.reply({ content: 'Lien du GIF sauvegardé avec succès!', ephemeral: true });
            }
        }
    },
};