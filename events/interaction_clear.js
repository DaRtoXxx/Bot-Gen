const { Events, ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder, EmbedBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isButton() && !interaction.isSelectMenu()) return;

        // Étape 1 : L'utilisateur clique sur le bouton "clear"
        if (interaction.customId === 'clear') {
            const stockDir = path.join(__dirname, '../db/stock');
            const files = fs.readdirSync(stockDir).filter(file => file.endsWith('.txt'));

            if (files.length === 0) {
                await interaction.reply({ content: 'Il n\'y a pas de fichiers à supprimer.', ephemeral: true });
                return;
            }

            // Créer un menu déroulant pour sélectionner un service
            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('selectService')
                .setPlaceholder('Sélectionnez un service à supprimer')
                .addOptions(
                    files.map(file => ({
                        label: path.parse(file).name,
                        value: file,
                    }))
                );

            await interaction.reply({
                content: 'Veuillez sélectionner un service à supprimer.',
                components: [new ActionRowBuilder().addComponents(selectMenu)],
                ephemeral: true,
            });
        }

        // Étape 2 : Gestion de la sélection du service (menu déroulant)
        if (interaction.customId === 'selectService') {
            const selectedFile = interaction.values[0]; // Obtenir le fichier sélectionné
            const stockDir = path.join(__dirname, '../db/stock');
            const filePath = path.join(stockDir, selectedFile);

            // Créer un embed de confirmation
            const embed = new EmbedBuilder()
                .setTitle('Confirmation')
                .setDescription(`Êtes-vous sûr de vouloir supprimer tout le contenu du service **${path.parse(selectedFile).name}** ?`)
                .setColor(0xFF0000);

            // Créer la ligne d'action pour les boutons de confirmation
            const confirmButtonRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`confirmYes-${selectedFile}`) // Ajout du nom du fichier pour identification
                    .setLabel('Oui')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId(`confirmNo-${selectedFile}`) // Ajout du nom du fichier pour identification
                    .setLabel('Non')
                    .setStyle(ButtonStyle.Danger)
            );

            // Réponse après la sélection du service
            await interaction.update({
                content: null,
                embeds: [embed],
                components: [confirmButtonRow],
                ephemeral: true,
            });
        }

        // Étape 3 : Gestion de la confirmation (Oui ou Non)
        if (interaction.customId.startsWith('confirmYes') || interaction.customId.startsWith('confirmNo')) {
            const selectedFile = interaction.customId.split('-')[1]; // Récupérer le nom du fichier depuis le customId

            // Si l'utilisateur confirme la suppression (Oui)
            if (interaction.customId.startsWith('confirmYes')) {
                const filePath = path.join(__dirname, '../db/stock', selectedFile);
                try {
                    fs.writeFileSync(filePath, ''); // Effacer le contenu du fichier
                    await interaction.update({
                        content: `Le contenu du service **${path.parse(selectedFile).name}** a été supprimé.`,
                        components: [],
                        ephemeral: true,
                    });
                } catch (error) {
                    console.error('Erreur lors de la suppression du contenu :', error);
                    await interaction.update({ content: 'Une erreur est survenue lors de la suppression du fichier.', ephemeral: true });
                }
            }

            // Si l'utilisateur annule la suppression (Non)
            if (interaction.customId.startsWith('confirmNo')) {
                await interaction.update({
                    content: 'La suppression a été annulée.',
                    components: [],
                    ephemeral: true,
                });
            }
        }
    },
};
