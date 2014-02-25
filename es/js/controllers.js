function TitleCtrl($scope, Page) {
	$scope.Page = Page;
}


function MainCtrl($scope, $rootScope, $window, $location, Page) {
	$rootScope.$on('$viewContentLoaded', function(event) {
        ga(['_trackPageview', $location.path()]);
        ga('send', 'pageview', {
  'page': $location.path()
});
    });

	Page.setTitle('Llegadas de autob\xFAs en tiempo real');
}

var d;
app.controller('AllStopsCtrl', function ($scope, fusionService) {

	$scope.query = 'loft';

	$scope.s = function() {
		fusionService.searchAllStops($scope.query)
		.then(function (data) {
			$scope.allStops = data.rows;
		});
	}
	

	/*
	$http.get('x.php?url=http://data.cityofmadison.com/resource/f5sy-kcer.json').success(function(data) {
		$scope.allStops = data.contents;
	});
*/

$scope.sort = "intersection";

});
function allStopsCallback(data) {
	d = data;
}


app.controller('RouteListCtrl', function ($scope, routesService, Page) {

	$scope.routes = routesService.getRoutes();	
	
	$scope.sort = "routeID";

	Page.setTitle('Encuentra paradas por ruta');

});


app.controller('StopListCtrl', function ($scope, $routeParams, stopsByRouteService, Page) {

	$scope.stops = stopsByRouteService.getStopsByRoute();

	$scope.sort = 'intersection';
	$scope.routeID = $routeParams.routeID;
	$scope.sortBy = function(s) { $scope.sort = s; }

	Page.setTitle('Ruta ' + $scope.routeID.dezero());

});


var locData;
app.controller('StopDetailCtrl', function ($scope, $routeParams, Page) {

	 $scope.stopID = $routeParams.stopID;

	var query = "SELECT * FROM " +
	'17XL2E7Z6qJ1dCBPIEsokpZVs8l3kKXY8lCJ6P4c' + " WHERE 'Stop Code'=" + $routeParams.stopID;
	var encodedQuery = encodeURIComponent(query);

    // Construct the URL
    var url = ['https://www.googleapis.com/fusiontables/v1/query'];
    url.push('?sql=' + encodedQuery);
    url.push('&key=AIzaSyAEVwn-sjJfe0wkCM0z7abz-o9C889rag8');
    url.push('&callback=?');

    $.ajax({
    	url: url.join(''),
    	dataType: 'jsonp',
    	success: function (data) {
    		$scope.$apply(function() {
    	    $scope.allStops = data['rows'];
    		$scope.stopid = $scope.allStops[0][1];
    		$scope.name = $scope.allStops[0][2].split('(')[0].toStopFormat();
    		$scope.dir = $scope.allStops[0][8];
    		Page.setTitle($scope.name + ' (' + $scope.dir[0].toCapitalize() + 'B)');
    		//$scope.desc = $scope.allStops[0][3];
    		$scope.allStops[0][4].replace('(', '').replace(' ','').replace(')','');
    		var coords = $scope.allStops[0][4].split(',');
    		$scope.markerLat = coords[0].replace('(','');
    			$scope.markerLng = coords[1].replace(')', '');
    			$scope.center.lat = parseFloat($scope.markerLat);
    			$scope.center.lng = parseFloat($scope.markerLng);
    			$scope.zoom = 17;
    			$scope.addMarker();

    			
    			$scope.wheelchair = $scope.allStops[0][9];
    		});
    		}
    	});

	// default location
		$scope.center = {
			lat: 43.066667,
			lng: -89.4
		};

	$scope.latitude = null;
		$scope.longitude = null;
		
		$scope.zoom = 11;
		
		$scope.markers = [];
		
		$scope.markerLat = null;
		$scope.markerLng = null;

	$scope.addMarker = function () {
			$scope.markers.push({
				latitude: parseFloat($scope.markerLat),
				longitude: parseFloat($scope.markerLng)
			});
			
			$scope.markerLat = null;
			$scope.markerLng = null;
		};




});
function getstoplocationCallback(data) {
	locData = data;
}


app.controller('ArrivalCtrl', function ($scope, $routeParams, $timeout, arrivalsService) {



	$scope.showMessage = function(n) {
		
		return !$scope.noArrivals && n == 0;
	}

	$scope.onlyRoute = function(r) {
		$scope.RouteFilterVal = r;
	}

	$scope.onlyTime = function(t) {
		$scope.ETAFilterVal = t;
	}

	$scope.timeText = function(n) {
		if (n < 60) {
			return n + 'm';
		}
		if (n == 5000) {
			return '';
		}
		if (n >= 60) {
			return (n / 60) + 'h';
		}
	}

	$scope.noArrivals = false;

	$scope.interval = 60000;
	$scope.rList = [];

	var t1 = $timeout(function a(){
		$('#arr-loader-small').show();
		arrivalsService.getArrivals()
		.then(function(data) {
			$('#arrival-loader').hide();
			$('#arr-loader-small').hide();
			if (data.status == -1) {
				$scope.noArrivals = true;
				$('#arrival-loader').hide();
				$('#arr-loader-small').hide();
			}
			else{
				$scope.arrivals = data.stop.route;
				if ($scope.arrivals[0].minutes > 60) {
					$scope.noArrivals = true;
				}
				for (var i in data.stop.route) {
					var r = data.stop.route[i].routeID;
					if ($scope.rList.indexOf(r) < 0) $scope.rList.push(r);
					var x = data.stop.route[i].destination;
					data.stop.route[i].destination = x.split(':');
					if (data.stop.route[i].destination.length == 2) {
						data.stop.route[i].destination[1] = 'por ' + data.stop.route[i].destination[1];
					}
				}
				$scope.rList.sort();
			}
			
		});
		
		var t2 = $timeout(a, $scope.interval);

		$scope.$on('$destroy', function() {
  			$timeout.cancel(t1);
  			$timeout.cancel(t2);
		});

	}, 0, $scope.interval);

	

	$scope.stopID = $routeParams.stopID;

	$scope.ETAFilterVal = 60;
	$scope.filterByETA = function(a) {
		return parseInt(a.minutes) <= parseInt($scope.ETAFilterVal);
	}

	$scope.RouteFilterVal = 0;
	$scope.filterByRoute= function(a) {
		if ($scope.RouteFilterVal != 0) return a.routeID == $scope.RouteFilterVal;
		else return true;
	}

	$scope.calcETA = function(m) {
		if (m < 60) return '<strong>' + m + '</strong>m';
		var h = Math.floor(m / 60);
		if (m % 60 == 0) return '<strong>' + h + '</strong>h';
		else {
			return '<strong>' + h + '</strong>h&nbsp;<strong>' + (m % 60) + '</strong>m';
		}
	}

});


app.controller('GeoCtrl', function ($scope, $window, $routeParams, geoService, Page) {
	
Page.setTitle('Find stops near you');

	// default location
		$scope.center = {
			lat: 43.066667,
			lng: -89.4
		};

	$scope.latitude = null;
		$scope.longitude = null;
		
		$scope.zoom = 11;
		
		$scope.markers = [];
		
		$scope.markerLat = null;
		$scope.markerLng = null;

		var youIcon = {
      path: google.maps.SymbolPath.CIRCLE,
        strokeColor: "#000",
        fillColor: "#0095FF",
        fillOpacity:0.8,
        strokeWeight:2,
        scale: 10
      }

	$scope.addYou = function() {
		$scope.markers.push({
				latitude: $scope.center.lat,
				longitude: $scope.center.lng,
				icon: youIcon
			});
			
		//$scope.markerLat = null;
			//$scope.markerLng = null;
	}

	$scope.markerNum = 1;
	$scope.addMarker = function () {
			$scope.markers.push({
				latitude: parseFloat($scope.markerLat),
				longitude: parseFloat($scope.markerLng),
				icon: 'img/mapicons/number_' + $scope.markerNum + '.png'
			});
			
			$scope.markerLat = null;
			$scope.markerLng = null;
		};

	$scope.getPos = function() {
		$window.navigator.geolocation.getCurrentPosition(function(position) {
			$scope.$apply(function() {
				$scope.position = position;
				$scope.center.lat = $scope.position.coords.latitude;
				$scope.center.lng = $scope.position.coords.longitude;
				$scope.addYou();
				geoService.getNearbyStops($scope.position)
				.then(function(data) {
					$scope.d = data;
					if ($scope.d.stop.length == 0) $('#geo-nostops').show();

					for (var i in $scope.d.stop) {
						$scope.markerLat = $scope.d.stop[i].latitude;
						$scope.markerLng = $scope.d.stop[i].longitude;
						$scope.addMarker();
						$scope.markerNum++;
					}
					$('#geo-loader').hide();
					$('#geo-retry').hide();

				});
			});
		}, function(error) {
			$('#geo-loader').hide();
			$('#geo-retry').show();
		});
	};

	$scope.calcDist = function (p, lat, lon) {
		var lat2 = lat; 
		var lon2 = lon; 
		var lat1 = p.coords.latitude; 
		var lon1 = p.coords.longitude; 

		var R = 6371; // km
		var x1 = lat2-lat1;
		var dLat = toRad(x1);  
		var x2 = lon2-lon1;
		var dLon = toRad(x2);  
		var a = Math.sin(dLat/2) * Math.sin(dLat/2) + 
		Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
		Math.sin(dLon/2) * Math.sin(dLon/2);  
		var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
		var d = R * c; 

		return (d * 1000 * 3.28084 / 5260).toFixed(2);
	}



});
function toRad(x) {
	return x * Math.PI / 180;
}


app.controller('AboutCtrl', function ($scope, Page) {
Page.setTitle('About');

});



String.prototype.toCapitalize = function() { 
	return this.toLowerCase().replace(/^.|\s\S/g, function(a) { return a.toUpperCase(); });
}

String.prototype.dezero = function() {
	if (this[0] === '0') return this.replace('0','');
	else return this.replace();
}