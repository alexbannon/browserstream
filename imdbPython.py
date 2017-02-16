from imdb import IMDb

# http://imdbpy.sourceforge.net/docs/README.package.txt

ia = IMDb('sql', uri='postgres://local:password@localhost/imdb')
# movie_list is a list of Movie objects, with only attributes like 'title'
# and 'year' defined.

for x in range(100, 100100):
    movie = ia.get_movie(x)
    url = ia.get_imdbURL(movie)
    print url


# movie = ia.get_movie(1)
# ia.update(movie)
# url = ia.get_imdbURL(movie)
# print url
# print movie.summary()
#
# missing:
# -- image_url varchar(350),
# -- awards varchar(250),
# -- metascore decimal,
