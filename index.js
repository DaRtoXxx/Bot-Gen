const { Client, Collection, GatewayIntentBits } = require('discord.js');
const fs = require('node:fs');
const path = require('path');
const { REST, Routes } = require('discord.js');
require('dotenv').config(); // charge les variables d'environnement locales

// Variables d'environnement
const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

if (!token) {
    console.error("❌ Erreur : aucune variable DISCORD_TOKEN trouvée !");
    process.exit(1);
}

if (!clientId || !guildId) {
    console.warn("⚠️ CLIENT_ID ou GUILD_ID non définis — les commandes ne seront pas déployées globalement !");
}

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildPresences, GatewayIntentBits.GuildMembers]
});

// Augmenter légèrement le nombre max de listeners pour éviter les warnings si besoin
client.setMaxListeners(20);

client.cooldowns = new Collection();
client.commands = new Collection();

// --- Charger les commandes ---
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    client.commands.set(command.data.name, command);
}

// --- Déployer les commandes slash ---
const rest = new REST({ version: '10' }).setToken(token);

(async () => {
    try {
        console.log(`🔁 Début de l'enregistrement des ${client.commands.size} commandes.`);

        const commands = client.commands.map(cmd => cmd.data.toJSON());

        if (clientId && guildId) {
            await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });
            console.log(`✅ Commandes enregistrées avec succès sur le serveur ${guildId} !`);
        } else {
            console.log("⚠️ CLIENT_ID ou GUILD_ID manquants : commandes non déployées.");
        }
    } catch (error) {
        console.error('❌ Erreur lors du déploiement des commandes :', error);
    }
})();

// --- Charger les événements ---
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const event = require(path.join(eventsPath, file));
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
    } else {
        client.on(event.name, (...args) => event.execute(...args, client));
    }
}

// --- Listener unique pour les interactions ---
if (!client._interactionListenerAdded) {
    client.on('interactionCreate', async interaction => {
        if (!interaction.isChatInputCommand()) return;

        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: '❌ Il y a eu une erreur lors de l’exécution de cette commande !',
                ephemeral: true
            });
        }
    });
    client._interactionListenerAdded = true;
}

// --- Ready ---
client.once('ready', () => {
    console.log(`🤖 Connecté en tant que ${client.user.tag}`);
});

client.login(token);
