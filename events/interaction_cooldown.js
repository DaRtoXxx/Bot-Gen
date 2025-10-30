const { Events, EmbedBuilder, PermissionsBitField, ActionRowBuilder, StringSelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isButton() && !interaction.isStringSelectMenu() && !interaction.isModalSubmit()) return;

        if (interaction.customId === 'cooldown') {
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                await interaction.reply({ content: 'Vous devez être administrateur pour utiliser cette fonctionnalité.', ephemeral: true });
                return;
            }

            const guild = interaction.guild;
            let roleIds = [];

            try {
                // Lire le rôle de role_gen.txt
                const roleGenContent = fs.readFileSync(path.join(__dirname, '../db/generation_systeme/id/role_gen.txt'), 'utf-8').split('\n');
                const roleGenId = roleGenContent[0].trim();
                
                // Ajouter le rôle de role_gen.txt en premier
                roleIds.push(roleGenId);

                // Créer les rôles de cooldown
                for (let i = 1; i <= 7; i++) {
                    const roleName = `Cooldown ${i}`;
                    let role = guild.roles.cache.find(r => r.name === roleName);

                    if (!role) {
                        role = await guild.roles.create({
                            name: roleName,
                            color: '#FFFFFF',
                            reason: 'Création de rôle pour le cooldown de génération',
                        });
                    }
                    roleIds.push(role.id);
                }

                // Stocker les IDs des rôles dans le fichier
                const roleFilePath = path.join(__dirname, '../db/generation_systeme/id/cooldown_role.txt');
                fs.writeFileSync(roleFilePath, roleIds.map(id => id).join('\n'));

                // Créer le menu déroulant avec les noms des rôles
                const selectMenu = new StringSelectMenuBuilder()
                    .setCustomId('selectCooldownRole')
                    .setPlaceholder('Choisissez un rôle pour définir son cooldown')
                    .addOptions(
                        roleIds.map((id, index) => {
                            const roleName = index === 0 ? 'Rôle Gen' : `Cooldown ${index}`;
                            return {
                                label: roleName,
                                value: id
                            };
                        })
                    );

                const row = new ActionRowBuilder()
                    .addComponents(selectMenu);

                await interaction.reply({ content: 'Choisissez un rôle pour définir son cooldown:', components: [row], ephemeral: true });
            } catch (error) {
                console.error('Erreur lors de la création des rôles de cooldown:', error);
                const embed = new EmbedBuilder()
                    .setColor(0xFF0000)
                    .setDescription('Une erreur est survenue lors de la création des rôles de cooldown.');
                await interaction.reply({ embeds: [embed], ephemeral: true });
            }
        } else if (interaction.isStringSelectMenu() && interaction.customId === 'selectCooldownRole') {
            const selectedRoleId = interaction.values[0];

            // Créer un formulaire pour demander le cooldown en secondes
            const modal = new ModalBuilder()
                .setCustomId(`setCooldown-${selectedRoleId}`)
                .setTitle('Définir le cooldown pour le rôle');

            const cooldownInput = new TextInputBuilder()
                .setCustomId('cooldownValue')
                .setLabel('Cooldown en secondes')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('Entrez le nombre de secondes');

            const firstActionRow = new ActionRowBuilder().addComponents(cooldownInput);

            modal.addComponents(firstActionRow);

            await interaction.showModal(modal);
        } else if (interaction.isModalSubmit() && interaction.customId.startsWith('setCooldown-')) {
            const cooldownInSeconds = interaction.fields.getTextInputValue('cooldownValue');
            const cooldownInMilliseconds = parseInt(cooldownInSeconds) * 1000; // Conversion en millisecondes

            if (isNaN(cooldownInMilliseconds) || cooldownInMilliseconds <= 0) {
                await interaction.reply({ content: 'Veuillez entrer un nombre valide de secondes pour le cooldown.', ephemeral: true });
                return;
            }

            const selectedRoleId = interaction.customId.split('-')[1];

            // Stocker ou mettre à jour le cooldown en millisecondes dans le fichier
            const cooldownFilePath = path.join(__dirname, '../db/generation_systeme/id/cooldown_role.txt');
            let roleData = fs.readFileSync(cooldownFilePath, 'utf-8').split('\n');
            const roleIndex = roleData.findIndex(line => line.startsWith(selectedRoleId));

            if (roleIndex !== -1) {
                // Si le rôle existe, on met à jour son cooldown
                const roleId = roleData[roleIndex].split(',')[0];
                // Vérifie si le rôle a déjà un cooldown
                if (roleData[roleIndex].includes(',')) {
                    roleData[roleIndex] = `${roleId},${cooldownInMilliseconds}`;
                } else {
                    // Si le rôle n'a pas de cooldown, on en ajoute un
                    roleData[roleIndex] += `,${cooldownInMilliseconds}`;
                }
                fs.writeFileSync(cooldownFilePath, roleData.join('\n'));
                
                const roleName = roleIndex === 0 ? 'Rôle Gen' : `Cooldown ${roleIndex}`;
                const embed = new EmbedBuilder()
                    .setColor(0x000000)
                    .setDescription(`Le cooldown pour le rôle **${roleName}** a été mis à jour à **${cooldownInSeconds}** secondes (soit **${cooldownInMilliseconds}** ms).`);
                await interaction.reply({ embeds: [embed], ephemeral: true });
            } else {
                console.error('Erreur: L\'ID du rôle sélectionné n\'a pas été trouvé dans le fichier.');
                const embed = new EmbedBuilder()
                    .setColor(0xFF0000)
                    .setDescription('Une erreur est survenue lors de la mise à jour du cooldown du rôle.');
                await interaction.reply({ embeds: [embed], ephemeral: true });
            }
        }
    },
};