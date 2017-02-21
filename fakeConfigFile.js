'use strict';

var developmentSetting = {
  port:   process.env.PORT || 9000,
  // POSTGRES CONNECT EXAMPLE
  POSTGRES_CONNECT: 'postgres://local:password@localhost/browserstream',
  GUIDEBOX_API_KEY: 'INSERT GUIDEBOX API KEY HERE',
  OMDB_API_URL: 'http://www.omdbapi.com/?',
  // PG POOL EXAMPLE
  PG_POOL_CONFIG: {
    database: 'browserstream',
    user: 'local',
    password: 'password',
    port: 5432,
    max: 20, //set pool max size to 20
    min: 4, //set min pool size to 4
    idleTimeoutMillis: 1000 //close idle clients after 1 second
  },
  REDIS_CACHE_TIME: 100,
  BROWSER_CACHE_TIME: 3600,
};

var productionSetting = {
  port:   process.env.PORT || 9000,
  POSTGRES_CONNECT: 'postgres://PROD_SETTING:PROD_PASSWORD@PROD_CONNECTION/PROD_DATABASE',
  GUIDEBOX_API_KEY: 'INSERT GUIDEBOX API KEY HERE',
  OMDB_API_URL: 'http://www.omdbapi.com/?',
  PG_POOL_CONFIG: {
    database: 'PROD_DB',
    user: 'PROD_USER',
    password: 'PROD_PASSWORD',
    port: 'PROD_PORT',
    max: 20, //set pool max size to 20
    min: 4, //set min pool size to 4
    idleTimeoutMillis: 1000 //close idle clients after 1 second
  },
  REDIS_CACHE_TIME: 86400,
  BROWSER_CACHE_TIME: 43200,
};

module.exports = function(){
    switch(process.env.NODE_ENV){
        case 'development':
            return developmentSetting;

        case 'production':
            return productionSetting;

        default:
            return developmentSetting;
    }
};
