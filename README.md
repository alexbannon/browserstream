# browserstreams

### A PostgreSQL, Node, Express, and Angular app that uses Cheerio scraping, a Redis caching layer, and Mocha and Protractor tests.

#### Purpose
To create an app that allows users to browse available online streams across multiple platforms (netflix, hulu, hbo, etc).

#### Installation Instructions
```
npm setup
```
- install redis (if homebrew is installed, brew install redis will work)
- install postgresql
- create a database called browserstream and a user called "local"
- create a config.js in your config/environment directory that looks like the following (updating the connection with your API keys and postgres information): https://github.com/alexbannon/browserstream/blob/master/fakeConfigFile.js
```
npm install -g db-migrate
db-migrate up
npm start
```

#### Testing
```
npm test
```
Will kick off mocha/chai tests as well as protractor tests if the mocha/chai tests pass
