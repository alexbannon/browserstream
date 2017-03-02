'use strict';

angular.module('browserstreams.searchResults', ['ngRoute', 'ngCookies'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/search/:searchTerm', {
    templateUrl: 'views/searchResults/searchResults.html',
    controller: 'SearchCtrl'
  });
}])

.controller('SearchCtrl', ['$scope', '$routeParams', 'TitlesApi', function($scope, $routeParams, TitlesApi) {
  $scope.hideFilter = true;

  $scope.search = {
    searchInput: undefined
  };

  function search(searchTerm) {
    if (searchTerm) {
      TitlesApi.searchForTitle(searchTerm).then(function(result){
        $scope.items = result.data;
      }).catch(function(err){
        $scope.items = [];
        console.log('error searching api: ' + err);
      });
    }
  }

  search($routeParams.searchTerm);

  $scope.searchMovie = function() {
    if ($scope.search.searchInput) {
      search($scope.search.searchInput);
    }
  };

}]);
