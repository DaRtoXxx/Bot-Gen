// check.js
const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField, EmbedBuilder, StringSelectMenuBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('check')
        .setDescription('Vérifie le contenu d\'un service (fournisseurs et admins uniquement)'),
    async execute(interaction) {
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
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator) && !interaction.member.roles.cache.has(fournisseurRoleId)) {
            await interaction.reply({ content: 'Vous devez être administrateur ou fournisseur pour utiliser cette commande.', ephemeral: true });
            return;
        }

        // Créer l'embed principal pour la commande check
        const embed = new EmbedBuilder()
            .setColor(0x000000) // Couleur de l'embed en noir
            .setTitle('🛡️ Admin Panel Check') // Ajout de l'émoji 🛡️ au début du titre
            .setDescription('1. Récupération du contenu d\'un service.\n2. Affiche le stock\n3. Efface le contenu d\'un service.');

        // Récupérer les fichiers dans db/stock
        const stockDir = path.join(__dirname, '../db/stock');
        const files = fs.readdirSync(stockDir).filter(file => file.endsWith('.txt'));

        // Créer les boutons pour l'interaction
        const checkButton = new ButtonBuilder()
            .setCustomId('checkButton')
            .setLabel('Vérifier 🔎')
            .setStyle(ButtonStyle.Primary);

        const stockButton = new ButtonBuilder()
            .setCustomId('stock')
            .setLabel('📦 Stock')
            .setStyle(ButtonStyle.Secondary);

        // Ajouter un bouton "Clear" (rouge)
        const clearButton = new ButtonBuilder()
            .setCustomId('clear')
            .setLabel('Clear 🧹')
            .setStyle(ButtonStyle.Danger);

        const row = new ActionRowBuilder().addComponents(checkButton, stockButton, clearButton);

        // Répondre avec l'embed et les boutons
        await interaction.reply({ embeds: [embed], components: [row] });
    },
};