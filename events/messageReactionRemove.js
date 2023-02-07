const rolesAssociation = {
    // Reaction ID: Role ID
    '1072444962169442324': '1072250096487501994', // Lol
    '1072444732355121152': '1072250641646358598', // RL
    '1072444526834229258': '1072427169831198750', // Valorant
}

module.exports = {
    name: 'messageReactionRemove',
    once: false,
    async execute(reaction, user) {
        const messageId = '1072463562276098059';

        if (reaction.message.id !== messageId) return;

        const guild = reaction.message.guild;
        const member = guild.members.cache.get(user.id);
        const role = guild.roles.cache.get(rolesAssociation[reaction.emoji.id]);

        try {
            member.roles.remove(role);
        } catch (_) { }
    },
};
