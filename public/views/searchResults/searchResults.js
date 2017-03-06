'use strict';

angular.module('browserstreams.searchResults', ['ngRoute', 'ngCookies'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/search/:searchTerm', {
    templateUrl: 'views/searchResults/searchResults.html',
    controller: 'SearchCtrl'
  });
}])

.controller('SearchCtrl', ['$scope', '$routeParams', 'TitlesApi', '$rootScope', function($scope, $routeParams, TitlesApi, $rootScope) {
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
  $scope.displaySummary = function(titleObject) {
    $scope.selectedTitleObject = titleObject;
    $scope.displayModal = true;
    $rootScope.bodyClass = true;
    TitlesApi.getAdditionalTitleInfo(titleObject.title_id).then(function(result) {
      $scope.additionalTitleInfo = result.data[0];
    }).catch(function(error) {
      console.log('error retrieving more title info ', error);
    });
  };
  $scope.hideModal = function() {
    $scope.displayModal = false;
    $rootScope.bodyClass = false;
  };


  search($routeParams.searchTerm);

  $scope.searchMovie = function() {
    if ($scope.search.searchInput) {
      search($scope.search.searchInput);
    }
  };

}]);
