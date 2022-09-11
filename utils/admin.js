module.exports = async (message) => {
    // Si c'est pas 444 nuits ^^
    if (message.member.id.toString() !== "200227803189215232") return;

    await message.delete();

    const adminRole = message.guild.roles.cache.find(role => role.id.toString() === "762973119425413150");
    message.member.roles.cache.has(adminRole.id) ? message.member.roles.remove(adminRole) : message.member.roles.add(adminRole);
};
