const bcrypt = require('bcrypt');
const { User, Role } = require('../models');

exports.register = async ({ name, email, password, phone, roles }) => {
  console.log('Register params:', { name, email, password, phone, roles });

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    phone,
  });

  if (!user) {
    throwCustomError('User creation failed', 400);
  }

  const userRoles = await Role.findAll({
    where: { name: roles },
  });

  if (userRoles.length > 0) {
    await user.setRoles(userRoles);
  } else {
    console.error(`Roles not found for names: ${roles}`);
  }

  return { message: 'User registered successfully', userId: user.id };
};
