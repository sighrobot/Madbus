var app = angular.module('madbus', ['madbusFilters', 'google-maps']);

app.config(['$routeProvider', function ($routeProvider) {
	$routeProvider.
	when('/', {
		templateUrl: 'main.html',
		controller: 'MainCtrl'
	}).
	when('/about', {
		templateUrl: 'about.html',
		controller: 'AboutCtrl'
	}).
	when('/route/list', {
		templateUrl: 'route-list.html',
		controller: 'RouteListCtrl'
	}).
	when('/route/:routeID', {
		templateUrl: 'stop-list.html',
		controller: 'StopListCtrl'
	}).
	when('/stop/list', {
		templateUrl: 'all-stops.html',
		controller: 'AllStopsCtrl'
	}).
	when('/stop/nearby', {
		templateUrl: 'geo.html',
		controller: 'GeoCtrl'
	}).
	when('/stop/:stopID', {
		templateUrl: 'stop-detail.html',
		controller: 'StopDetailCtrl'
	}).
	otherwise({redirectTo: '/'});
}]);

app.run(function ($rootScope) {
		// New look for Google Maps
		google.maps.visualRefresh = true;
	});

