'use strict';

angular.module('browserstreams')

.service('UserSettings', ['LocalStorage', function(LocalStorage) {
  return {
    generateUserSettings: function() {
      var localStorageSelections = LocalStorage.getFromStorage('providerSelections');
      localStorageSelections = localStorageSelections ? localStorageSelections.split(',') : ['netflix'];
      var localStorageTitleTypes = LocalStorage.getFromStorage('titleTypes');
      localStorageTitleTypes = localStorageTitleTypes ? localStorageTitleTypes.split(',') : ['movies', 'series'];

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
          name: 'Amazon Prime',
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
          selected: (localStorageTitleTypes.indexOf('movies') > -1)
        }, {
          name: 'TV Shows',
          queryName: 'series',
          selected: (localStorageTitleTypes.indexOf('series') > -1)
        }],
        sortBy: 'alphabetical',
        sortList: ['best', 'worst', 'alphabetical'],
        genres: []
      };
    }
  };
}]);
