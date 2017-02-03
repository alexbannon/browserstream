'use strict';

angular.module('browserstreams')

.service('Modal', ['$window', function($window) {
  return {
    handleProviderTitleClick: function(providerObject) {
      var destinationUrl;
      var title = encodeURI(providerObject.title_name);
      switch (providerObject.name) {
        case 'netflix':
          destinationUrl = 'https://www.netflix.com/search?q=' + title;
          break;
        case 'hbo_go':
          destinationUrl = 'http://www.hbo.com/search?type=schedule&q=' + title;
          break;
        case 'hulu':
        destinationUrl = 'https://www.hulu.com/search?q=' + title;
          break;
        case 'amazon_prime':
        destinationUrl = 'https://www.amazon.com/s/?url=search-alias%3Dprime-instant-video&field-keywords=' + title;
          break;
        default:
          console.log('provider not found');
      }
      $window.location.href = destinationUrl;
    }
  }
}])
