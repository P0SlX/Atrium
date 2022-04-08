module.exports = {
	name: 'guildMemberAdd',
	once: false,
	async execute(member) {
		const db = global.DB;

		const sql = `SELECT roles, nickname
                     FROM ROLES
                     WHERE id = ?`;

		db.serialize(() => {
			db.get(sql, [member.id.toString() + member.guild.id.toString()], (err, row) => {
				if (err) console.error(err.message);

				// Nouvel utilisateur
				if (row == null) return;

				const roles = row.roles.split(',');
				const pseudo = row.nickname;

				member.edit({ nick: pseudo, roles: roles });
			});
		});
	},
};
