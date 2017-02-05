'use strict';

angular.module('browserstreams')

.directive('backgroundImage', function() {
  return function(scope, element, attrs) {
    var url = attrs.backgroundImage;
    console.log(url);
    element.css({
      'background-image': 'url(' + url + ')',
      'background-size': 'cover'
    });
  };
});
