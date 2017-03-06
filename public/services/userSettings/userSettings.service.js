'use strict';

angular.module('browserstreams')

.service('UserSettings', ['LocalStorage', function(LocalStorage) {
  return {
    generateUserSettings: function(override) {
      if (override) {
        LocalStorage.clearStorage();
      }
      var localStorageSelections = LocalStorage.getFromStorage('providerSelections');
      localStorageSelections = localStorageSelections ? localStorageSelections.split(',') : ['netflix', 'hbo_go', 'amazon_prime', 'hulu'];
      var localStorageTitleTypes = LocalStorage.getFromStorage('titleTypes');
      localStorageTitleTypes = localStorageTitleTypes ? localStorageTitleTypes.split(',') : ['movie', 'series'];
      var localStorageGenres = LocalStorage.getFromStorage('genres');
      localStorageGenres = localStorageGenres ? localStorageGenres.split(',') : ['Action/Adventure', 'Comedy', 'Drama', 'Family', 'Fantasy', 'Horror/Thriller', 'Mystery/Crime', 'Romance'];
      var localStorageSortBy = LocalStorage.getFromStorage('sortBy');
      localStorageSortBy = localStorageSortBy ? localStorageSortBy : 'best';
      if (localStorageSortBy !== 'best' && localStorageSortBy !== 'worst' && localStorageSortBy !== 'alphabetical') {
        localStorageSortBy = 'best';
      }

      return {
        providers: [{
          name: 'Netflix',
          queryName: 'netflix',
          selected: (localStorageSelections.indexOf('netflix') > -1),
          imageSource: '/assets/netflixLogo.png'
        },{
          name: 'HBO GO',
          queryName: 'hbo_go',
          selected: (localStorageSelections.indexOf('hbo_go') > -1),
          imageSource: '/assets/hboGoLogo.png',
        },{
          name: 'Amazon',
          queryName: 'amazon_prime',
          selected: (localStorageSelections.indexOf('amazon_prime') > -1),
          imageSource: '/assets/amazonPrimeLogo.png',
        },{
          name: 'Hulu',
          queryName: 'hulu',
          selected: (localStorageSelections.indexOf('hulu') > -1),
          imageSource: '/assets/huluLogo.png'
        }],
        titleType: [{
          name: 'Movies',
          queryName: 'movie',
          selected: (localStorageTitleTypes.indexOf('movie') > -1)
        }, {
          name: 'TV Shows',
          queryName: 'series',
          selected: (localStorageTitleTypes.indexOf('series') > -1)
        }],
        sortBy: localStorageSortBy,
        sortList: ['best', 'worst', 'alphabetical'],
        genres: [{
          name: 'Action/Adventure',
          // db separates these values out and this allows a quick url addition on service http request
          queryName: 'Action&genre=Adventure',
          selected: (localStorageGenres.indexOf('Action/Adventure') > -1)
        },{
          name: 'Comedy',
          queryName: 'Comedy',
          selected: (localStorageGenres.indexOf('Comedy') > -1)
        },{
          name: 'Drama',
          queryName: 'Drama',
          selected: (localStorageGenres.indexOf('Drama') > -1)
        },{
          name: 'Family',
          queryName: 'Family',
          selected: (localStorageGenres.indexOf('Family') > -1)
        },{
          name: 'Fantasy',
          queryName: 'Fantasy',
          selected: (localStorageGenres.indexOf('Fantasy') > -1)
        },{
          name: 'Horror/Thriller',
          queryName: 'Horror&genre=Thriller',
          selected: (localStorageGenres.indexOf('Horror/Thriller') > -1)
        },{
          name: 'Mystery/Crime',
          queryName: 'Mystery&genre=Crime',
          selected: (localStorageGenres.indexOf('Mystery/Crime') > -1)
        },{
          name: 'Romance',
          queryName: 'Romance',
          selected: (localStorageGenres.indexOf('Romance') > -1)
        }],
        changeMade: true
      };
    }
  };
}]);
