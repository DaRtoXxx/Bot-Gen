const { Events, EmbedBuilder, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isButton()) return;

        const successEmoji = interaction.guild.emojis.cache.find(emoji => emoji.name === 'success') || '✅';
        const failureEmoji = interaction.guild.emojis.cache.find(emoji => emoji.name === 'failure') || '❌';
        const stockEmoji = interaction.guild.emojis.cache.find(emoji => emoji.name === 'stock') || ':package:';
        const calendarEmoji = interaction.guild.emojis.cache.find(emoji => emoji.name === 'calendar') || ':calendar:';
        const notifEmoji = interaction.guild.emojis.cache.find(emoji => emoji.name === 'notif') || '🔔';

        if (interaction.customId.startsWith('service_')) {
            await interaction.deferReply({ ephemeral: true });

            const serviceName = interaction.customId.split('service_')[1];
            const filePath = path.join(__dirname, `../db/stock/${serviceName}.txt`);

            let requiredRoleId = '';
            let requiredBio = '';
            try {
                const roleGenContent = fs.readFileSync(path.join(__dirname, '../db/generation_systeme/id/role_gen.txt'), 'utf-8').split('\n');
                requiredRoleId = roleGenContent[0].trim();
                requiredBio = roleGenContent[1].trim();
            } catch (error) {
                console.error('Erreur lors de la lecture du fichier role_gen.txt:', error);
                await interaction.editReply({ content: 'Une erreur est survenue lors de la vérification des conditions de génération.' });
                return;
            }

            if (!interaction.member.roles.cache.has(requiredRoleId)) {
                const embed = new EmbedBuilder()
                    .setColor(0x000000)
                    .setDescription(`${failureEmoji} Please set \`${requiredBio}\` in your custom status to access this service!`);
                await interaction.editReply({ embeds: [embed] });
                return;
            }

            let roleCooldowns = {};
            try {
                const cooldownContent = fs.readFileSync(path.join(__dirname, '../db/generation_systeme/id/cooldown_role.txt'), 'utf-8').split('\n');
                cooldownContent.forEach((line, index) => {
                    const [roleId, cooldown] = line.split(',');
                    if (cooldown) {
                        roleCooldowns[roleId] = {
                            cooldown: parseInt(cooldown),
                            order: index
                        };
                    }
                });
            } catch (error) {
                console.error('Erreur lors de la lecture du fichier cooldown_role.txt:', error);
                await interaction.editReply({ content: 'Une erreur est survenue lors de la vérification des cooldowns.' });
                return;
            }

            let userOnCooldown = false;
            let applicableCooldown = null;
            for (const roleId of Object.keys(roleCooldowns).sort((a, b) => roleCooldowns[a].order - roleCooldowns[b].order)) {
                if (interaction.member.roles.cache.has(roleId)) {
                    const cooldownKey = `${interaction.user.id}-${roleId}`;
                    const lastUsedTimestamp = await interaction.client.cooldowns.get(cooldownKey);
                    if (lastUsedTimestamp) {
                        const expirationTime = lastUsedTimestamp + roleCooldowns[roleId].cooldown;
                        if (Date.now() < expirationTime) {
                            userOnCooldown = true;
                            const timeLeft = (expirationTime - Date.now()) / 1000;
                            await interaction.editReply({ content: `${failureEmoji} Vous devez attendre **${Math.ceil(timeLeft)}** secondes avant de pouvoir générer un autre service avec ce rôle.` });
                            return;
                        }
                    }
                    applicableCooldown = roleId;
                }
            }

            if (!userOnCooldown) {
                try {
                    let content = fs.readFileSync(filePath, 'utf-8').split('\n');

                    if (content.length === 0 || (content.length === 1 && content[0] === '')) {
                        const embed = new EmbedBuilder()
                            .setColor(0x000000)
                            .setDescription(`${failureEmoji} Service vide`);
                        await interaction.editReply({ embeds: [embed] });
                    } else {
                        const firstLine = content.shift();
                        fs.writeFileSync(filePath, content.join('\n'));

                        let genGif = '';
                        try {
                            genGif = fs.readFileSync(path.join(__dirname, '../db/generation_systeme/gif/gen.txt'), 'utf-8').trim();
                            if (!genGif || !/^https?:\/\//.test(genGif)) genGif = '';
                        } catch (error) {
                            console.error('Erreur lors de la lecture du fichier GIF:', error);
                            genGif = '';
                        }

                        const now = new Date();
                        const formattedDateTime = now.toLocaleString("fr-FR", { timeZone: "Europe/Paris" });

                        // Ghost ping de l'utilisateur qui a cliqué dans le salon spécifié
                        const targetChannel = interaction.guild.channels.cache.get('1352310570841411648');
                        if (targetChannel && targetChannel.isTextBased()) {
                            await targetChannel.send(`<@${interaction.user.id}>`).then(msg => msg.delete());
                        } else {
                            console.error('Salon introuvable ou non textuel pour le ghost ping.');
                        }

                        try {
                            const dmEmbed = new EmbedBuilder()
                                .setColor(0x000000)
                                .setTitle(`${notifEmoji} Account is successfully generated!`)
                                .setDescription(
                                    `${stockEmoji} **Service**\n*${serviceName}*\n\n` +
                                    `${calendarEmoji} **Generation date**\n${formattedDateTime}\n\n` +
                                    `\`\`\`${firstLine}\`\`\``
                                );
                            if (genGif) {
                                dmEmbed.setImage(genGif);
                            }
                            await interaction.user.send({ embeds: [dmEmbed] });

                            const replyEmbed = new EmbedBuilder()
                                .setColor(0x000000)
                                .setDescription(`${successEmoji} Successfully generated ${interaction.user.username}, your ${serviceName} account has been sent via DM!`);
                            if (genGif) {
                                replyEmbed.setImage(genGif);
                            }
                            await interaction.editReply({ embeds: [replyEmbed] });

                            const userId = interaction.user.id;
                            const statsPath = path.join(__dirname, `../db/log/stats/${userId}.json`);
                            let stats = { generationCount: 0, lastGeneration: '' };

                            try {
                                if (fs.existsSync(statsPath)) {
                                    stats = JSON.parse(fs.readFileSync(statsPath, 'utf-8'));
                                }
                            } catch (error) {
                                console.error('Erreur lors de la lecture des stats:', error);
                            }

                            stats.generationCount += 1;
                            stats.lastGeneration = formattedDateTime;
                            fs.writeFileSync(statsPath, JSON.stringify(stats));

                            const logChannelId = fs.readFileSync(path.join(__dirname, '../db/log/gen.txt'), 'utf-8').trim();
                            const logChannel = interaction.guild.channels.cache.get(logChannelId);
                            if (logChannel && logChannel.isTextBased()) {
                                const logEmbed = new EmbedBuilder()
                                    .setTitle('Génération de service')
                                    .setDescription(`L'utilisateur **${interaction.user.tag}** (${interaction.user}) a généré un compte.`)
                                    .setColor('#000000')
                                    .addFields(
                                        { name: 'Service généré', value: `**${serviceName}**`, inline: true },
                                        { name: 'Nombre de générations', value: `${stats.generationCount}`, inline: true },
                                        { name: 'Dernière génération', value: `${stats.lastGeneration}`, inline: true }
                                    );
                                await logChannel.send({ embeds: [logEmbed] });
                            } else {
                                console.error('Le channel de log n\'a pas été trouvé ou n\'est pas un channel texte.');
                            }

                            if (applicableCooldown) {
                                const cooldownKey = `${interaction.user.id}-${applicableCooldown}`;
                                const cooldownDuration = roleCooldowns[applicableCooldown].cooldown;
                                interaction.client.cooldowns.set(cooldownKey, Date.now());
                                setTimeout(() => {
                                    interaction.client.cooldowns.delete(cooldownKey);
                                }, cooldownDuration);
                            }
                        } catch (error) {
                            console.error('Erreur lors de l\'envoi en DM:', error);
                        }
                    }
                } catch (error) {
                    console.error('Erreur lors de la gestion du service:', error);
                }
            }
        }
    },
};