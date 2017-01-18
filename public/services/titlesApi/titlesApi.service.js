'use strict';

angular.module('browserstreams')

.service('TitlesApi', ['$http', '$q', function($http, $q) {
  return {
    requestTitles: function(providersArray, sort, start) {
      var dataObject = {
        sort: sort,
        start: start,
        providers: []
      };
      var url = '/api/query';
      for (var i = 0; i < providersArray.length; i++) {
        if (providersArray[i].selected) {
          dataObject.providers.push({
            name: providersArray[i].queryName
          })
        }
      }
      if (dataObject.providers.length === 0) {
        return $q(function(resolve, reject) {
          reject({
            message: 'no provider selected'
          });
        });
      } else {
        return $http({
          method: 'POST',
          url: url,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=60'
          },
          data: dataObject
        });
      }
    }
  }
}]);
