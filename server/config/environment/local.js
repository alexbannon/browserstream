'use strict';

module.exports = {
  port:   process.env.PORT || 9000,
  NODE_ENV: 'local',
  POSTGRES_CONNECT: 'postgres://local:password@localhost/browserstream',
  CACHE_TIME_IN_SECONDS: '60',
};
