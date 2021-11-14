module.exports = (config) => {
  const res = {
    defaultAdmin: {
      email: 'admin@admin.com',
      password: 'Azerty123@@',
      firstName: 'Admin',
      lastName: 'Admin',
      provider: 'local',
      roles: ['admin'],
    },
  };

  return {
    ...config,
    ...res,
  };
};
