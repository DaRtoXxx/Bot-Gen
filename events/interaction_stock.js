// handleStock.js
const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

function countLines(filePath) {
    return new Promise((resolve, reject) => {
        let lineCount = 0;
        const readStream = fs.createReadStream(filePath, { encoding: 'utf-8' });

        readStream.on('data', (chunk) => {
            lineCount += (chunk.match(/\n/g) || []).length;
        });

        readStream.on('end', () => {
            const content = fs.readFileSync(filePath, 'utf-8');
            resolve(content.length > 0 ? (lineCount === 0 ? 1 : lineCount + 1) : 0);
        });

        readStream.on('error', (error) => {
            console.error(`Erreur lors de la lecture de ${filePath}:`, error);
            reject(error);
        });
    });
}

async function handleStockRequest(interaction) {
    try {
        await interaction.deferReply({ ephemeral: true });

        const stockDir = path.join(__dirname, '../db/stock');
        let files = [];

        try {
            files = fs.readdirSync(stockDir).filter(file => file.endsWith('.txt'));
        } catch (error) {
            console.error('Erreur lors de la lecture du dossier stock:', error);
            await interaction.editReply('Une erreur est survenue lors de la lecture des fichiers du stock.');
            return;
        }

        const stockEmoji = interaction.guild.emojis.cache.find(emoji => emoji.name === 'stock');
        const successEmoji = interaction.guild.emojis.cache.find(emoji => emoji.name === 'success') || '✅';
        const failureEmoji = interaction.guild.emojis.cache.find(emoji => emoji.name === 'failure') || '❌';

        let stockGif = '';
        try {
            stockGif = fs.readFileSync(path.join(__dirname, '../db/generation_systeme/gif/stock.txt'), 'utf-8').trim();
        } catch (error) {
            console.error('Erreur lors de la lecture du fichier stock GIF:', error);
            stockGif = ''; 
        }

        if (files.length === 0) {
            const embed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle(`${stockEmoji ? stockEmoji.toString() : ':package:'} Services Disponibles`)
                .setDescription(`${failureEmoji} Aucun service dans votre stock.`);

            await interaction.editReply({ embeds: [embed] });
        } else {
            const fileLines = await Promise.all(files.map(async file => {
                const filePath = path.join(stockDir, file);
                const lineCount = await countLines(filePath);
                return { 
                    name: path.parse(file).name, 
                    lines: lineCount, 
                    emoji: lineCount > 0 ? successEmoji : failureEmoji 
                };
            }));

            const formattedList = fileLines.map(item => `${item.emoji} **${item.name}** - \`${item.lines}\``).join('\n');
            const embed = new EmbedBuilder()
                .setColor(0x0099ff)
                .setTitle(`${stockEmoji ? stockEmoji.toString() : ':package:'} Services Disponibles`)
                .setDescription(formattedList);

            if (stockGif && /^https?:\/\//.test(stockGif)) {
                embed.setImage(stockGif);
            } else {
                embed.setFooter({ text: 'Aucun GIF défini pour le stock ou URL invalide.' });
            }

            await interaction.editReply({ embeds: [embed] });
        }
    } catch (error) {
        console.error('Erreur lors de la gestion du bouton stock:', error);
        await interaction.editReply('Une erreur est survenue lors de l\'affichage des services du stock.');
    }
}

module.exports = { handleStockRequest };
