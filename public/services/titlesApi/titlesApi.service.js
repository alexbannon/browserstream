'use strict';

angular.module('browserstream')

.service('TitlesApi', ['$http', function($http) {
  return {
    requestTitles: function(providersArray) {
      var url = '/api/query?provider=';
      for (var i = 0; i < providersArray.length; i++) {
        if (providersArray[i].selected) {
          url += providersArray[i].queryName + ',';
        }
      }
      url = url.substring(0, url.length - 1);
      return $http({
        method: 'GET',
        url: url
      })
    }
  }
}]);
