const { Events, StringSelectMenuBuilder, ActionRowBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (interaction.isButton() && interaction.customId === 'checkButton') {
            // Charger l'ID du rôle fournisseur
            const fournisseurRoleIdPath = path.join(__dirname, '../db/role_id/fournisseur.txt');
            let fournisseurRoleId;
            try {
                fournisseurRoleId = fs.readFileSync(fournisseurRoleIdPath, 'utf-8').trim();
            } catch (error) {
                console.error('Erreur lors de la lecture de l\'ID du rôle fournisseur:', error);
                await interaction.reply({ content: 'Une erreur est survenue lors de la vérification des permissions.', ephemeral: true });
                return;
            }

            // Vérifier si l'utilisateur est administrateur ou a le rôle fournisseur
            if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator) && !interaction.member.roles.cache.has(fournisseurRoleId)) {
                await interaction.reply({ content: 'Vous devez être administrateur ou fournisseur pour utiliser cette fonctionnalité.', ephemeral: true });
                return;
            }

            // Charger les noms des fichiers dans db/stock pour le menu déroulant
            const stockDir = path.join(__dirname, '../db/stock');
            let stockFiles = [];
            try {
                stockFiles = fs.readdirSync(stockDir).filter(file => file.endsWith('.txt')).map(file => file.replace('.txt', ''));
            } catch (error) {
                console.error('Erreur lors de la lecture du dossier stock:', error);
                await interaction.reply({ content: 'Une erreur est survenue lors de la génération du menu déroulant.', ephemeral: true });
                return;
            }

            // Créer le menu déroulant
            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('selectStockFileCheck')
                .setPlaceholder('Choisissez un service à vérifier')
                .addOptions(
                    stockFiles.map(fileName => {
                        return {
                            label: fileName,
                            value: fileName
                        };
                    })
                );

            const row = new ActionRowBuilder().addComponents(selectMenu);

            await interaction.reply({ content: 'Sélectionnez le service dont vous voulez vérifier le contenu :', components: [row], ephemeral: true });
        } else if (interaction.isStringSelectMenu() && interaction.customId === 'selectStockFileCheck') {
            const selectedService = interaction.values[0];

            // Charger le contenu du fichier sélectionné
            const filePath = path.join(__dirname, `../db/stock/${selectedService}.txt`);
            let fileContent;
            try {
                fileContent = fs.readFileSync(filePath, 'utf-8');
                if (fileContent.trim() === '') {
                    fileContent = 'Ce service est actuellement vide.';
                }
            } catch (error) {
                console.error(`Erreur lors de la lecture du fichier pour ${selectedService}:`, error);
                fileContent = `Une erreur est survenue lors de la lecture du fichier pour le service **${selectedService}**.`;
            }

            // Créer un buffer avec le contenu du fichier
            const buffer = Buffer.from(fileContent, 'utf-8');

            // Envoyer le fichier en tant que réponse
            await interaction.update({ content: `Voici le contenu du service **${selectedService}** :`, files: [{ attachment: buffer, name: `${selectedService}_content.txt` }], components: [] });
        }
    },
};
