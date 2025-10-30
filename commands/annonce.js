const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('annonce')
        .setDescription('Envoie une annonce avec un service spécifique')
        .addStringOption(option =>
            option.setName('service')
                .setDescription('Choisissez le service pour l\'annonce')
                .setRequired(true)
                .addChoices(
                    { name: 'Crunchyroll', value: 'crunchyroll' },
                    { name: 'Outlook', value: 'outlook' },
                    { name: 'Ubisoft', value: 'ubisoft' },
                    { name: 'TunnelBear', value: 'tunnelbear' },
                    { name: 'Steam', value: 'steam' },
                    { name: 'Disney+', value: 'disney' },
                    { name: 'adn+', value: 'adn' },
                    { name: 'Fortnite', value: 'fortnite' },
                    { name: 'Xbox', value: 'xbox' },
                    { name: 'Dazn', value: 'dazn' },
                    { name: 'Paramount+', value: 'paramount' },
                    { name: 'Minecraft', value: 'Minecraft' },
                    { name: 'Molotov', value: 'molotov' },
                        { name: 'skype', value: 'skype' },
            { name: 'instagram', value: 'instagram' }
                ))
        .addIntegerOption(option =>
            option.setName('nombre')
                .setDescription('Le nombre de services ajoutés')
                .setRequired(true)),
    
    async execute(interaction) {
        const allowedRoleId = '1352310502080118814';
        
        if (!interaction.member.roles.cache.has(allowedRoleId) && !interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ content: '🚫 Vous devez être administrateur ou avoir le rôle requis pour utiliser cette commande.', ephemeral: true });
        }

        const service = interaction.options.getString('service');
        const nombre = interaction.options.getInteger('nombre');
        
        let embedTitle, embedBody, imageURL, embedColor;

        const services = {
            crunchyroll: { title: 'Restock effectué', body: `> **X${nombre} Crunchyroll ajouté**`, image: 'https://cdn.discordapp.com/attachments/1341384014577143972/1348996584523956296/crunchyroll.jpg?ex=67d17e78&is=67d02cf8&hm=74af53a00c3fbca064d5f33d3b05560cc9b1f441fd5de53f635a9012372acc7f&', color: '#ff9900' },
            outlook: { title: 'Restock effectué', body: `> **X${nombre} Outlook ajouté**`, image: 'https://cdn.discordapp.com/attachments/1341384014577143972/1348996644523348039/outlook.jpg?ex=67d17e87&is=67d02d07&hm=77bf69d3841b98d5844e00874d01f85db1e58fcdbc6329ac2ca6e68ec34404ed&', color: '#0078D4' },
            ubisoft: { title: 'Restock effectué', body: `> **X${nombre} Ubisoft ajouté**`, image: 'https://cdn.discordapp.com/attachments/1341384014577143972/1348996680523186277/ubisoft.jpg?ex=67d17e8f&is=67d02d0f&hm=d32ff41c3679fb03cff11011973f0c20a768ef629e7a7d8362c01940aa43cb4b&', color: '#23272a' },
            tunnelbear: { title: 'Restock effectué', body: `> **X${nombre} TunnelBear ajouté**`, image: 'https://cdn.discordapp.com/attachments/1341384014577143972/1348996673166118922/tunnelbear.jpg?ex=67d17e8e&is=67d02d0e&hm=6c01fd6dfded847fe6be86a0abdfcd9f1313b6217d13c16eb32072b2dd659b3d&', color: '#f8d91c' },
            steam: { title: 'Restock effectué', body: `> **X${nombre} Steam ajouté**`, image: 'https://cdn.discordapp.com/attachments/1341384014577143972/1348996666509758575/steam.jpg?ex=67d17e8c&is=67d02d0c&hm=1e7b62e3d7255cd3ed9ddb7198b6e555aa664eac9c88089597ee42f11ecfd498&', color: '#206694' },
            disney: { title: 'Restock effectué', body: `> **X${nombre} Disney+ ajouté**`, image: 'https://cdn.discordapp.com/attachments/1341384014577143972/1348996603851182182/disney.jpg?ex=67d17e7d&is=67d02cfd&hm=8311d4cae414c9c3f5b4019cf501f766b4d470df4c72f5c124298a8d5b2cefbd&', color: '#1ABC9C' },
            adn: { title: 'Restock effectué', body: `> **X${nombre} Adn ajouté**`, image: 'https://cdn.discordapp.com/attachments/1341384014577143972/1348996560716828782/adn.jpg?ex=67d17e73&is=67d02cf3&hm=9592aa737b9acb9fda7fd2280f1879fa82fccb061b827ac78103ae3ab2894238&', color: '#0078D4' },
            fortnite: { title: 'Restock effectué', body: `> **X${nombre} Fortnite ajouté**`, image: 'https://cdn.discordapp.com/attachments/1341384014577143972/1348996610645823578/fortnite.jpg?ex=67d17e7f&is=67d02cff&hm=02fd3edd0918b0543149bc0759a1e656ff37126a4d0d9afb68a362a016421a71&', color: '#71368A' },
            xbox: { title: 'Restock effectué', body: `> **X${nombre} Xbox Game Pass ajouté**`, image: 'https://cdn.discordapp.com/attachments/1341384014577143972/1348996688148430878/xbox.jpg?ex=67d17e91&is=67d02d11&hm=1d894a0ca0d7eed24cbb11829197cd1eb5ec59a2418f268bbab5698bffd4dd2b&', color: '#1F8B4C' },
            dazn: { title: 'Restock effectué', body: `> **X${nombre} Dazn ajouté**`, image: 'https://cdn.discordapp.com/attachments/1341384014577143972/1348996596163149835/dazn.jpg?ex=67d17e7b&is=67d02cfb&hm=9bda48791a6c1763ddc66f9808d64efef0d83c1e5d23b3f7118d743d6ff04d60&', color: '#23272A' },
            paramount: { title: 'Restock effectué', body: `> **X${nombre} Paramount+ ajouté**`, image: 'https://cdn.discordapp.com/attachments/1341384014577143972/1348996652127752222/paramount.jpg?ex=67d17e89&is=67d02d09&hm=5accc300a9c10beeb9a6efe29de645dd741a96a4e3cfae6f864096de77fba4d7&', color: '#0078D4' },
            mystake: { title: 'Restock effectué', body: `> **X${nombre} Minecraft ajouté**`, image: 'https://cdn.discordapp.com/attachments/1352409031045677167/1352822856232206388/9a3116733571bb94a1c57220400f747a.jpg?ex=67df69f7&is=67de1877&hm=11634f21acf219f21fe5f3a9d4427c194d6e4ff2fd77289b9dd3dae4caadb415&', color: '#0078D4' },
            molotov: { title: 'Restock effectué', body: `> **X${nombre} Molotov ajouté**`, image: 'https://cdn.discordapp.com/attachments/1341384014577143972/1348996626974375956/molotov.jpg?ex=67d17e83&is=67d02d03&hm=abf5dc8b094e10fe3ef4b1a38dc519db0d49e13bdcc4cc6f36ac9f11f4198875&', color: '#FFFF00' },
                                                instagram: { title: 'Restock effectué', body: `> **X${nombre} Instagram ajouté**`, image: 'https://cdn.discordapp.com/attachments/1341384014577143972/1348996619839868979/instagram.jpg?ex=67d17e81&is=67d02d01&hm=773ccf0dcb2f06fd07674ab0746fad5a0d22ba8b6ccbc4c0e541a12868c0ee06&', color: '#FFFF00' },
            skype: { title: 'Restock effectué', body: `> **X${nombre} Skype ajouté**`, image: 'https://cdn.discordapp.com/attachments/1341384014577143972/1348996658251169872/skype.jpg?ex=67d17e8a&is=67d02d0a&hm=c226a811709751f5e963ad6e0d94c1453e8204d243a9c859b4b8afca515888fc&', color: '#FFFF00' }
        };

        if (!services[service]) {
            return interaction.reply({ content: 'Service non reconnu. Veuillez choisir un service valide.', ephemeral: true });
        }

        const { title, body, image, color } = services[service];
        const embed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(body)
            .setImage(image)
            .setColor(color)
            .setTimestamp();

        const channel = await interaction.client.channels.fetch('1352310536620216352');
        if (!channel) {
            return interaction.reply({ content: 'Le salon où envoyer l\'annonce est introuvable.', ephemeral: true });
        }

        await channel.send({ embeds: [embed] });
        await interaction.reply({ content: '✅ Annonce envoyée avec succès !', ephemeral: true });
    },
};
