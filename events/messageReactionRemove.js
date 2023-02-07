const rolesAssociation = {
    // Reaction ID: Role ID
    '1072460803300659250': '1072454179446083584',
    '1072460837647818813': '1072250641646358598',
    '1072460864512344094': '1072250096487501994',
}

module.exports = {
    name: 'messageReactionRemove',
    once: false,
    async execute(reaction, user) {
        const messageId = '1072463562276098059';

        if (reaction.message.id === messageId) {
            const guild = reaction.message.guild;
            const member = guild.members.cache.get(user.id);
            const role = guild.roles.cache.get(rolesAssociation[reaction.emoji.id]);
            member.roles.remove(role);
        }
    },
};
