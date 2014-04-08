'use strict';

angular.module('beerApp', ['ngRoute'])
.config(function ($locationProvider, $routeProvider) {
  $locationProvider.hashPrefix('!');
  $routeProvider
    .when('/', {
      templateUrl: 'scripts/beerhub/template.html',
      controller: 'BeerCtrl'
    })
    .when('/:user', {
      templateUrl: 'scripts/beerhub/template.html',
      controller: 'BeerCtrl',
    })
    .otherwise({
      redirectTo: '/'
    });
})
.run(function($rootScope, $location){

});
