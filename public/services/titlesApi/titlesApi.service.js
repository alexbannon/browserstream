'use strict';

angular.module('browserstreams')

.service('TitlesApi', ['$http', '$q', function($http, $q) {
  return {
    requestTitles: function(providersArray, sort, start) {
      var count = 0;
      var url = '/api/query?sort='+sort+'&start='+start;
      for (var i = 0; i < providersArray.length; i++) {
        if (providersArray[i].selected) {
          count++;
          url+= '&providers=' + providersArray[i].queryName;
        }
      }
      if (count === 0) {
        return $q(function(resolve, reject) {
          reject({
            message: 'no provider selected'
          });
        });
      } else {
        return $http({
          method: 'GET',
          url: url,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=60'
          }
        });
      }
    },
    getAdditionalTitleInfo: function(titleId) {
      return $q(function(resolve, reject) {
        if (isNaN(titleId)) {
          reject({
            message: 'titleID Invalid'
          });
        } else {
          $http({
            method: 'GET',
            url: '/api/title/' + titleId,
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'public, max-age=60'
            }
          }).then(function(result) {
            resolve(result);
          }).catch(function(error) {
            reject(error);
          });
        }
      });
    }
  };
}]);
