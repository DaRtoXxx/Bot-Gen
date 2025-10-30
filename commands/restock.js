const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch'); // Assure-toi que ce module est installé

module.exports = {
    data: new SlashCommandBuilder()
        .setName('restock')
        .setDescription('Ajoute des éléments à un service')
        .addStringOption(option => 
            option.setName('service')
                .setDescription('Choisissez le service')
                .setRequired(true)
                .addChoices(
                    ...(() => {
                        const stockDir = path.join(__dirname, '../db/stock');
                        try {
                            return fs.readdirSync(stockDir)
                                .filter(file => file.endsWith('.txt'))
                                .map(file => ({ name: file.replace('.txt', ''), value: file.replace('.txt', '') }));
                        } catch (error) {
                            console.error('Erreur lors de la lecture du dossier stock:', error);
                            return [];
                        }
                    })()
                )
        )
        .addAttachmentOption(option => 
            option.setName('fichier')
                .setDescription('Le fichier .txt à ajouter')
                .setRequired(true)),
    
    async execute(interaction) {
        const fournisseurRoleIdPath = path.join(__dirname, '../db/role_id/fournisseur.txt');
        let fournisseurRoleId;

        try {
            fournisseurRoleId = fs.readFileSync(fournisseurRoleIdPath, 'utf-8').trim();
        } catch (error) {
            console.error('Erreur lors de la lecture de l\'ID du rôle fournisseur:', error);
            await interaction.reply({ content: 'Une erreur est survenue lors de la vérification des permissions.', ephemeral: true });
            return;
        }

        if (!interaction.member.roles.cache.has(fournisseurRoleId)) {
            await interaction.reply({ content: 'Vous devez avoir le rôle fournisseur pour utiliser cette commande.', ephemeral: true });
            return;
        }

        const selectedService = interaction.options.getString('service');
        const file = interaction.options.getAttachment('fichier');

        if (!file.name.toLowerCase().endsWith('.txt')) {
            await interaction.reply({ content: 'Le fichier doit être un fichier .txt.', ephemeral: true });
            return;
        }

        try {
            const response = await fetch(file.url);
            const fileContent = await response.text();

            const filePath = path.join(__dirname, `../db/stock/${selectedService}.txt`);
            let existingContent = [];
            try {
                existingContent = fs.readFileSync(filePath, 'utf-8').split('\n').filter(line => line.trim() !== '');
            } catch (error) {
                console.error(`Erreur lors de la lecture du fichier pour ${selectedService}:`, error);
            }

            const updatedContent = [...existingContent, ...fileContent.split('\n').map(line => line.trim())].filter(line => line !== '').join('\n');
            fs.writeFileSync(filePath, updatedContent);

            await interaction.reply({ content: `Les éléments ont été ajoutés avec succès au service **${selectedService}**.`, ephemeral: true });

            // 🟢 Embed dans le salon #📦・restock
            const restockChannelId = '1394304547081687061'; // 👈 Ton salon restock
            const restockEmbed = new EmbedBuilder()
                .setColor('Green')
                .setTitle('✅ Restock FREE Terminé !')
                .setDescription(`${selectedService} a été restocké avec succès !`)
                .addFields(
                    { name: '📊 Détails des Comptes', value: `Nombre de comptes : ${fileContent.split('\n').filter(l => l.trim() !== '').length}`, inline: false },
                    { name: '🏷️ Service', value: selectedService, inline: true },
                    { name: '🔑 Type', value: 'VIP', inline: true },
                    { name: '🕒 Timestamp', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false }
                )
                .setImage('https://cdn.discordapp.com/attachments/1394304547081687061/1394823821063749672/standard.gif?ex=68783669&is=6876e4e9&hm=3c3e434a6c935e4ce1792b5458d610b59b35c7da94d0f2354e39a372b080b030&')
                .setFooter({ text: `Restock effectué par ${interaction.user.username}` });

            const restockChannel = interaction.client.channels.cache.get(restockChannelId);
            if (restockChannel && restockChannel.isTextBased()) {
                await restockChannel.send({ embeds: [restockEmbed] });
            }

        } catch (error) {
            console.error('Erreur lors du traitement du fichier:', error);
            await interaction.reply({ content: `Une erreur est survenue lors de l'ajout des éléments au service **${selectedService}**.`, ephemeral: true });
        }
    },
};