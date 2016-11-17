CREATE TABLE title (
  title_id serial PRIMARY KEY,
  imdb_id int UNIQUE,
  name varchar(60) NOT NULL,
  year int
);
