angular.module('browserstreams')

.factory('TitleScroll', function($http, $rootScope, $timeout) {
  var TitleScroll = function(sort, limit) {
    this.sort = sort;
    this.items = [];
    this.busy = false;
    this.start = 0;
    this.limit = limit;
    this.error = false;
  };

  TitleScroll.prototype.nextPage = function(providersArray, titleTypeArray, emitEvent) {
    if (this.busy || this.error) return;
    this.busy = true;
    var count = 0;
    var url = '/api/query?sort='+this.sort+'&start='+this.start;
    for (var i = 0; i < providersArray.length; i++) {
      if (providersArray[i].selected) {
        count++;
        url+= '&providers=' + providersArray[i].queryName;
      }
    }
    if (count === 0) {
      this.busy = false;
      return;
    }

    for (var x = 0; x < titleTypeArray.length; x++) {
      url+= '&titletype=' + titleTypeArray[x].queryName;
    }
    url += '&limit=' + this.limit;

    $http({
      method: 'GET',
      url: url,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60'
      }
    }).then(function(response) {
      if (this.items.length === 0) {
        this.items = response.data;
      } else {
        this.items.push(...response.data);
      }
      this.start += this.limit;
      $timeout(function(){
        this.busy = false;
      }.bind(this), 50);
      if (emitEvent) {
        // fixing ng-infinite-scroll bug on item change
        $rootScope.$emit('itemsNotLongEnough');
      }
    }.bind(this)).catch(function(err) {
      console.log(err);
      this.busy = false;
      this.error = true;
    }.bind(this));

  };

  TitleScroll.prototype.changeItemsList = function(newSort, providersArray, titleTypeArray) {
    this.sort = newSort;
    this.error = false;
    this.items = [];
    this.start = 0;
    this.nextPage(providersArray, titleTypeArray, true);
  };

  return TitleScroll;
});
