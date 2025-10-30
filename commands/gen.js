const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gen')
        .setDescription('Affiche le panel GIF (Admins uniquement)'),
    async execute(interaction) {
        // VÃ©rifier si l'utilisateur a la permission ADMINISTRATOR
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            await interaction.reply({ content: 'Vous devez Ãªtre administrateur pour utiliser cette commande.', ephemeral: true });
            return;
        }

        try {
            // Charger l'URL du GIF depuis le fichier
            const gifUrl = fs.readFileSync(path.join(__dirname, '../db/generation_systeme/gif/panel.txt'), 'utf-8');

            const embed = new EmbedBuilder()
                .setTitle('｡+ﾟ☆ﾟ+｡★｡+ﾟ☆ﾟ+｡★｡+ﾟ☆ﾟ+｡★｡+ﾟ☆ﾟ+｡｡+ﾟ☆ﾟ+｡★｡+ﾟ')
                .setImage(gifUrl);

            const stockDir = path.join(__dirname, '../db/stock');
            let files = [];

            try {
                files = fs.readdirSync(stockDir).filter(file => file.endsWith('.txt'));
            } catch (error) {
                console.error('Erreur lors de la lecture du dossier stock:', error);
            }

            // Charger les IDs des Ã©mojis depuis le fichier
            let emojiIds = {};
            try {
                const fileContent = fs.readFileSync(path.join(__dirname, '../db/emojis_systeme/emojiIds.txt'), 'utf-8');
                fileContent.split('\n').forEach(line => {
                    if (line.trim()) {
                        const [name, id] = line.trim().split(':');
                        emojiIds[name] = id;
                    }
                });
            } catch (error) {
                console.error('Impossible de lire les IDs des Ã©mojis:', error);
            }

            // CrÃ©er le bouton avec l'Ã©moji stock
            const stockButton = new ButtonBuilder()
                .setCustomId('stock')
                .setLabel('Stock')
                .setStyle(ButtonStyle.Primary);

            // VÃ©rifier si l'emoji "stock" est valide
            if (emojiIds.stock) {
                try {
                    const emoji = `<:${'stock'}:${emojiIds.stock}>`;
                    stockButton.setEmoji(emoji);
                } catch (error) {
                    console.error(`Erreur avec l'Ã©moji stock:`, error);
                }
            }

            const serviceButtons = files.map(file => {
                const fileName = path.parse(file).name; // Retire l'extension .txt
                const button = new ButtonBuilder()
                    .setCustomId(`service_${fileName}`)
                    .setLabel(fileName)
                    .setStyle(ButtonStyle.Secondary);

                // Ajouter l'Ã©moji correspondant si existant
                if (emojiIds[fileName]) {
                    try {
                        const emojiId = emojiIds[fileName];
                        const emoji = `<:${fileName}:${emojiId}>`; // CrÃ©er l'emoji
                        button.setEmoji(emoji); // Ajouter l'emoji au bouton
                    } catch (error) {
                        console.error(`Erreur avec l'Ã©moji ${fileName}:`, error);
                    }
                }

                return button;
            });

            // RÃ©partir les boutons dans plusieurs lignes d'action si nÃ©cessaire
            const rows = [];
            let currentRow = new ActionRowBuilder();
            let buttonCount = 0;

            for (const button of [...serviceButtons, stockButton]) { // Ajoute le bouton stock Ã  la fin
                if (buttonCount < 5) { // Si la ligne a moins de 5 boutons, ajoute le bouton
                    currentRow.addComponents(button);
                    buttonCount++;
                } else {
                    rows.push(currentRow); // Ajoute la ligne complÃ¨te aux rows
                    currentRow = new ActionRowBuilder().addComponents(button); // Commence une nouvelle ligne
                    buttonCount = 1; // RÃ©initialise le compteur de boutons
                }
            }

            if (currentRow.components.length > 0) {
                rows.push(currentRow); // Ajoute la derniÃ¨re ligne si elle n'est pas vide
            }

            // Envoyer l'embed avec les boutons et rÃ©cupÃ©rer l'ID du message
            const message = await interaction.reply({ embeds: [embed], components: rows, fetchReply: true });

            // Sauvegarder l'ID du message dans le fichier
            const filePath = path.join(__dirname, '../db/generation_systeme/id/panel.txt');
            fs.writeFileSync(filePath, message.id);
        } catch (error) {
            console.error('Erreur lors de la lecture du fichier GIF, de la crÃ©ation de l\'embed ou de la sauvegarde de l\'ID:', error);
            await interaction.reply({ content: 'Une erreur est survenue lors de l\'affichage ou de la gestion du panel.', ephemeral: true });
        }
    },
};