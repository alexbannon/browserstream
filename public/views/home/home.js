'use strict';

angular.module('browserstream.home', ['ngRoute', 'ngCookies'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/', {
    templateUrl: 'views/home/home.html',
    controller: 'HomeCtrl'
  });
}])

.controller('HomeCtrl', [ '$http', '$scope', '$window', '$cookies', function($http, $scope, $window, $cookies) {

  $scope.selectedTitleObject = {};
  $scope.displayModal = false;

  $scope.providers = [{
    name: 'Netflix',
    queryName: 'netflix',
    selected: true,
    imageSource: 'http://vignette4.wikia.nocookie.net/smurfs/images/a/a1/Netflix-logo.png/revision/latest?cb=20150508223333'
  },{
    name: 'HBO GO',
    queryName: 'hbogo',
    selected: false,
    imageSource: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/HBOGO.svg/2000px-HBOGO.svg.png',
  },{
    name: 'Amazon Prime',
    queryName: 'amazonprime',
    selected: false,
    imageSource: 'http://vignette1.wikia.nocookie.net/logopedia/images/2/26/Amazon-prime.png/revision/latest?cb=20150709185638',
  },{
    name: 'Hulu',
    queryName: 'hulu',
    selected: false,
    imageSource: 'https://assetshuluimcom-a.akamaihd.net/kitty-staging/uploads/logo_download/file/7/Hulu_Logo_Option_A.png'
  }];

  $scope.displaySummary = function(titleObject) {
    $scope.selectedTitleObject = titleObject;
    $scope.displayModal = true;
  }

  function handleProviderTitleClick(provider, titleName) {
    var destinationUrl;
    switch (provider) {
      case 'netflix':
        var title = encodeURI($scope.selectedTitleObject.title_name);
        destinationUrl = 'https://www.netflix.com/search?q=' + title;
        break;
      case 'hbo_go':
        break;
      case 'hulu':
        break;
      case 'amazon_prime':
        break;
      default:
        console.log('provider not found');
    }
    $window.location.href = destinationUrl;
  }

  $scope.clickModal = function($event) {
    $event.stopPropagation();
    handleProviderTitleClick($scope.selectedTitleObject.name, $scope.selectedTitleObject.title_name);
  }

  function requestTitles() {
    var url = '/api/query?provider=';
    for (var i = 0; i < $scope.providers.length; i++) {
      if ($scope.providers[i].selected) {
        url += $scope.providers[i].queryName + ',';
      }
    }
    url = url.substring(0, url.length - 1);
    console.log(url);
    $http({
      method: 'GET',
      url: url
    }).then(function successCallback(response) {
      $scope.titles = response.data;
    }, function errorCallback(response) {
      console.log(response);
    });

  }

  requestTitles();

}]);
