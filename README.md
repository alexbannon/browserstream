# browserstreams

### A PostgreSQL, Node, Express, and Angular app that uses Cheerio scraping, a Redis caching layer, and Mocha and Protractor tests.

#### Purpose
To create an app that allows users to browse available online streams across multiple platforms (netflix, hulu, hbo, etc).

#### Installation Instructions
```
npm setup
```
install redis (if homebrew is installed, brew install redis will work)
install postgresql
create a database called browserstream and a user called "local"
```
npm install -g db-migrate
db-migrate up
npm start
```
