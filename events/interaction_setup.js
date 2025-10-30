const { Events } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Charge les IDs d'émojis depuis le fichier .txt
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
    console.log('Le fichier des IDs d\'émojis n\'existe pas encore, il sera créé.');
}

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isButton()) return;

        if (interaction.customId === 'emojis') {
            try {
                await interaction.deferReply();

                const emojisDir = path.join(__dirname, '../db/emojis_systeme/emojis');
                const files = fs.readdirSync(emojisDir);

                // Liste des noms d'émojis dans le dossier
                const expectedEmojis = files.map(file => path.parse(file).name);

                // Liste des noms d'émojis sur le serveur
                const serverEmojis = interaction.guild.emojis.cache.map(emoji => emoji.name);

                // Trouver les émojis manquants en comparant les deux listes
                const missingEmojis = expectedEmojis.filter(emojiName => !serverEmojis.includes(emojiName));

                if (missingEmojis.length === 0) {
                    const setupMessage = await interaction.followUp({ content: '🔧 Setup déjà effectué sur votre serveur.' });
                    
                    // Supprimer le message après 10 secondes
                    setTimeout(() => {
                        setupMessage.delete().catch(error => console.error('Impossible de supprimer le message:', error));
                    }, 10000);
                } else {
                    let addedEmojis = [];
                    for (const emojiName of missingEmojis) {
                        const filePath = path.join(emojisDir, `${emojiName}.png`); // Assurez-vous que l'extension correspond à vos fichiers
                        const newEmoji = await interaction.guild.emojis.create({
                            attachment: filePath,
                            name: emojiName
                        });
                        addedEmojis.push(emojiName);
                        // Commenté : console.log(`Émoji ajouté : ${emojiName}`);
                        
                        // Mettre à jour ou ajouter l'ID de l'émoji dans emojiIds
                        emojiIds[emojiName] = newEmoji.id;
                    }

                    // Sauvegarder les IDs dans un fichier .txt
                    const updatedIds = Object.entries(emojiIds).map(([name, id]) => `${name}:${id}`).join('\n');
                    fs.writeFileSync(path.join(__dirname, '../db/emojis_systeme/emojiIds.txt'), updatedIds);

                    await interaction.followUp({ content: `Émojis manquants ajoutés : ${addedEmojis.join(', ')}. IDs mises à jour.` });
                }
            } catch (error) {
                console.error('Erreur lors de la gestion des émojis:', error);
                await interaction.followUp({ content: 'Une erreur est survenue lors de la gestion des émojis.' });
            }
        }
    },
};