'use strict';

angular.module('BeerPallsApp', ['ngRoute', 'ui.bootstrap'])
.config(function ($locationProvider, $routeProvider) {
  $locationProvider.hashPrefix('!');
  $routeProvider
    .when('/', {
      templateUrl: 'components/home/template.html',
      controller: 'HomeCtrl'
    })
    .when('/:user', {
      templateUrl: 'components/beerhub/template.html',
      controller: 'BeerHubCtrl',
    })
    .otherwise({
      redirectTo: '/'
    });
})
.run(function($rootScope, $location){

});