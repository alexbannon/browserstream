'use strict';

angular.module('browserstreams')

.service('TitlesApi', ['$http', '$q', function($http, $q) {
  return {
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
