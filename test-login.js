const { Client, GatewayIntentBits } = require('discord.js');

// --- Récupération et nettoyage du token ---
let token = process.env.DISCORD_TOKEN;
if (!token) {
    console.error("❌ DISCORD_TOKEN manquant !");
    process.exit(1);
}

// Trim et suppression des guillemets éventuels ajoutés par Render
token = token.trim().replace(/"/g, '');

console.log("🔹 Token (longueur) :", token.length);
console.log("🔹 Token codes ASCII :", [...token].map(c => c.charCodeAt(0)));

// --- Création du client minimal ---
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', () => {
    console.log(`✅ Connecté avec succès en tant que ${client.user.tag}`);
});

client.login(token).catch(err => {
    console.error("❌ Impossible de se connecter : Token invalide ou problème réseau.", err);
});
