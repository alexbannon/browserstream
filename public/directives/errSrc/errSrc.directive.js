'use strict';

angular.module('browserstreams')

.directive('errSrc', ['$compile', function($compile) {
  return {
    scope: {
      replacedTitle: '@'
    },
    link: function(scope, element) {
      element.bind('error', function() {
        var e = $compile('<div class="titleImageContainer"><div class="titleName">{{replacedTitle}}</div></div>')(scope);
        scope.$apply(function() {
          element.replaceWith(e);
        });
      });
    }
  };
}]);
