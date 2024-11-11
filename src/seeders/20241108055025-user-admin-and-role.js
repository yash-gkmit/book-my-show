'use strict';
const bcrypt = require('bcrypt');
const process = require('process');

require('dotenv').config({ path: __dirname + '/../../.env' });

module.exports = {
  async up(queryInterface) {
    const roles = await queryInterface.bulkInsert(
      'roles',
      [{ name: 'Admin' }, { name: 'Theater Owner' }, { name: 'Customer' }],
      { returning: ['id', 'name'] },
    );

    const roleMap = Object.fromEntries(roles.map(role => [role.name, role]));

    const users = await queryInterface.bulkInsert(
      'users',
      [
        {
          name: 'Yash Gupta',
          email: 'yashgupta@gkmit.co',
          password: await bcrypt.hash(process.env.ADMIN_PASSWORD, 10),
          phone: '9462847225',
        },
      ],
      { returning: ['id', 'email'] },
    );

    await queryInterface.bulkInsert('users_roles', [
      {
        user_id: users.find(user => user.email === 'yashgupta@gkmit.co').id,
        role_id: roleMap['Admin'].id,
      },
    ]);
  },
  async down() {},
};
