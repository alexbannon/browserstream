'use strict';

angular.module('browserstreams')

.service('UserSettings', ['LocalStorage', function(LocalStorage) {
  return {
    generateUserSettings: function() {
      var localStorageSelections = LocalStorage.getFromStorage('providerSelections');
      localStorageSelections = localStorageSelections ? localStorageSelections.split(',') : ['netflix', 'hbo_go', 'amazon_prime', 'hulu'];
      var localStorageTitleTypes = LocalStorage.getFromStorage('titleTypes');
      localStorageTitleTypes = localStorageTitleTypes ? localStorageTitleTypes.split(',') : ['movie', 'series'];
      var localStorageSortBy = LocalStorage.getFromStorage('sortBy');
      localStorageSortBy = localStorageSortBy ? localStorageSortBy : 'best';
      if (localStorageSortBy !== 'best' || localStorageSortBy !== 'worst' || localStorageSortBy !== 'alphabetical') {
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
        genres: [],
        changeMade: true
      };
    }
  };
}]);
