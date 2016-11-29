CREATE TABLE title (
  title_id serial PRIMARY KEY,
  imdb_id varchar(30) UNIQUE,
  title_name varchar(60) NOT NULL,
  year int,
  genre varchar(100),
  director varchar(100),
  actors varchar(500),
  plot varchar(1000),
  image_url varchar(350),
  imdb_rating decimal
);
