'use strict';

angular.module('browserstreams')

.directive('errSrc', ['$compile', function($compile) {
  return {
    scope: {
      replacedTitle: '@'
    },
    link: function(scope, element) {
      element.bind('error', function() {
        var e = $compile('<div class="titleImageContainer">{{replacedTitle}}</div>')(scope);
        scope.$apply(function() {
          element.replaceWith(e);
        })
      });
    }
  };
}]);
