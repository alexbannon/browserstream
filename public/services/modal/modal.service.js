'use strict';

angular.module('browserstream')

.service('Modal', ['$window', function($window) {
  return {
    handleProviderTitleClick: function(providerObject) {
      var destinationUrl;
      switch (providerObject.name) {
        case 'netflix':
          var title = encodeURI(providerObject.title_name);
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
  }
}])
