from imdb import IMDb

# http://imdbpy.sourceforge.net/docs/README.package.txt

ia = IMDb('sql', uri='postgres://local:password@localhost/imdb')
# movie_list is a list of Movie objects, with only attributes like 'title'
# and 'year' defined.
movie_list = ia.search_movie('Avatar (2009)')
print movie_list
first_match = movie_list[0]
ia.update(first_match)
print first_match['trivia']

print ia.get_imdbURL(first_match)


# missing:
# -- image_url varchar(350),
# -- awards varchar(250),
# -- metascore decimal,
