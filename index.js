const { Client, Collection, GatewayIntentBits, REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

// --- Variables d'environnement ---
let token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID?.trim();
const guildId = process.env.GUILD_ID?.trim();

// Vérification et nettoyage du token
if (!token) {
    console.error("❌ DISCORD_TOKEN manquant !");
    process.exit(1);
}
token = token.trim().replace(/"/g, ''); // trim et suppression des guillemets

console.log("🔹 Token (longueur) :", token.length);
console.log("🔹 Client ID présent :", !!clientId);
console.log("🔹 Guild ID présent :", !!guildId);

// --- Création du client ---
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildPresences]
});

client.setMaxListeners(20);
client.commands = new Collection();
client.cooldowns = new Collection();

// --- Chargement des commandes ---
const commandsPath = path.join(__dirname, 'commands');
if (fs.existsSync(commandsPath)) {
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const command = require(path.join(commandsPath, file));
        client.commands.set(command.data.name, command);
    }
}

// --- Chargement des événements ---
const eventsPath = path.join(__dirname, 'events');
if (fs.existsSync(eventsPath)) {
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
    for (const file of eventFiles) {
        const event = require(path.join(eventsPath, file));
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args, client));
        } else {
            client.on(event.name, (...args) => event.execute(...args, client));
        }
    }
}

// --- Listener global pour les interactions ---
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
                content: '❌ Une erreur est survenue lors de l’exécution de cette commande !',
                ephemeral: true
            });
        }
    });
    client._interactionListenerAdded = true;
}

// --- Ready + déploiement des commandes ---
client.once('ready', async () => {
    console.log(`🤖 Connecté en tant que ${client.user.tag}`);

    if (clientId && guildId && client.commands.size > 0) {
        const rest = new REST({ version: '10' }).setToken(token);
        const commandsData = client.commands.map(cmd => cmd.data.toJSON());

        try {
            await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commandsData });
            console.log(`✅ Commandes enregistrées avec succès sur le serveur ${guildId} !`);
        } catch (err) {
            console.error('❌ Erreur lors du déploiement des commandes :', err);
        }
    } else {
        console.log("⚠️ Pas de commandes à déployer ou variables manquantes.");
    }
});

// --- Login ---
client.login(token).catch(err => {
    console.error("❌ Impossible de se connecter : Token invalide ou problème réseau.", err);
    process.exit(1);
});
