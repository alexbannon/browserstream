'use strict';

angular.module('browserstreams')

.service('TitlesApi', ['$http', '$q', function($http, $q) {
  function makeHttpRequest(url) {
    return $http({
      method: 'GET',
      url: url,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60'
      }
    });
  }
  return {
    getAdditionalTitleInfo: function(titleId) {
      return $q(function(resolve, reject) {
        if (isNaN(titleId)) {
          reject({
            message: 'titleID Invalid'
          });
        } else {
          var url = '/api/title/' + titleId;
          makeHttpRequest(url).then(function(result) {
            resolve(result);
          }).catch(function(error) {
            reject(error);
          });
        }
      });
    },
    searchForTitle: function(searchQuery) {
      return $q(function(resolve, reject) {
        if (!searchQuery) {
          reject({
            message: 'no search query'
          });
        } else {
          var url = '/api/search/' + searchQuery;
          makeHttpRequest(url).then(function(result) {
            resolve(result);
          }).catch(function(error) {
            reject(error);
          });
        }
      });
    }
  };
}]);
