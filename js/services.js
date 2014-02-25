app.factory('Page', function() {
   var title = 'Realtime bus arrival estimates | Madbus';
   return {
     title: function() { return title; },
     setTitle: function(newTitle) { title = newTitle }
   };
});

var sms_url = 'http://api.smsmybus.com/v1/';
var sms_key = 'aber8932';

var arrDataTmp;
app.factory('arrivalsService', function ($http, $routeParams, $q) {
	return {
		getArrivals: function() {
			var deferred = $q.defer();
			$http.jsonp(sms_url + 'getarrivals', {
				params: {
					'key':sms_key,
					'stopID':$routeParams.stopID,
					callback: 'getarrivalsCallback'
				}}).success(function(data) {
					deferred.resolve(arrDataTmp);
				}).error(function(data){
					deferred.resolve(arrDataTmp);
				});
				return deferred.promise;
			}
		}
	});
function getarrivalsCallback(data) {
	arrDataTmp = data;
}


var stopDataTmp;
app.factory('stopsByRouteService', function ($http, $routeParams, $q) {
	return {
		getStopsByRoute: function() {
			var deferred = $q.defer();
			var path;
			if ($routeParams.routeID.length == 1) path = 'php/json/0';
			else path = 'php/json/';
			$http.get(path + $routeParams.routeID + '.json')
			.success(function(data) {
					deferred.resolve(data.stops);
				})
			.error(function(data){
					deferred.resolve(data.stops);
				});
				return deferred.promise;
			}
		}
	});


var routeDataTmp;
app.factory('routesService', function ($http, $q, $rootScope) {
	return {
		getRoutes: function(n) {
			var deferred = $q.defer();
			var query = '';
			if (n == 0) {
				query = "SELECT * FROM " +
				'1Ng-Qt5AzM9BXP_PqgO7APw1wTjWuBaj86BWxFRQ';
			}
			else {
				query = "SELECT 'route_color', 'route_text_color', 'route_desc' FROM " +
				'1Ng-Qt5AzM9BXP_PqgO7APw1wTjWuBaj86BWxFRQ' +
				" WHERE 'route_short_name' = '" + n + "'";
			}
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
    				$rootScope.$apply(function() {
    					//console.log(data.rows[0]);
    					deferred.resolve(data.rows);
    				});
    			}
    		});

			return deferred.promise;
		}
	}
});


var geoDataTmp;
app.factory('geoService', function ($http, $q) {
	
	return {
		getNearbyStops: function(p) {
			var deferred = $q.defer();
			$http.jsonp(sms_url + 'getnearbystops', {
				params: {
					'key':sms_key,
					'lat':p.coords.latitude,
					'lon':p.coords.longitude,
					'radius':'400',
					callback: 'getnearbystopsCallback'
				}}).success(function(data) {
					deferred.resolve(geoDataTmp);
				}).error(function(data){
					deferred.resolve(geoDataTmp);
					
				});
				return deferred.promise;
			}
		}
	});
function getnearbystopsCallback(data) {
	geoDataTmp = data;
}

app.factory('fusionService', function ($q, $rootScope) {
	
	return {
		searchAllStops: function(que) {
			var deferred = $q.defer();

			var query = "SELECT 'Stop Code', 'Stop Name', 'Direction'  FROM " +
			'17XL2E7Z6qJ1dCBPIEsokpZVs8l3kKXY8lCJ6P4c' + " WHERE 'Stop Name' CONTAINS IGNORING CASE " + "'"+que+"'";
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
    				console.log(data.rows[0][1]);
    				$rootScope.$apply(deferred.resolve(data));
    			}
    		});
    		return deferred.promise;
    	}
    }
});

String.prototype.toStopFormat = function() {
	return this
	.toCapitalize()
	.replace('West Wash', 'W Washington')
	.replace('Rr', 'RR')
	.replace('M L K', 'MLK')
	.replace('Ccb', 'City-County Bldg')
	.replace('Univ ', 'University ')
	.replace('Mc ', 'Mc')
	.replace('Va Hosp', 'VA Hospital')
	.replace('Ctr', 'Center')
	.replace('Heather Cr', 'Heather Crest')
	.replace('U Bay', 'University Bay')
	.replace('Uw', 'UW')
	.replace('Research Pk', 'Research Park')
	.replace('East Wash', 'E Washington')
	.replace('Sw Commuter', 'SW Commuter Path')
	.replace('E Wash ', 'E Washington ')
	.replace('E Towne Rng', 'East Towne Ring')
	.replace('W Towne Rng', 'West Towne Ring')
	.replace(' Ft', ' Frontage')
	.replace('Mac ', 'Mac')
	.replace('Madison Coll', 'Madison College')
	.replace('Wps', 'WPS')
	.replace('P&r', 'Park & Ride')
	.replace('Cottage Gr', 'Cottage Grove')
	.replace(' Hs', ' HS')
	.replace('`', '\'')
	.replace('Afscme', 'Associated Bank')
	.replace('J Q Hammons', 'John Q Hammons')
	.replace('City Center W', 'City Center W Bldg')
	.replace('Twn', 'Town')
	.replace(' Hts', ' Heights')
	.replace(' Rg', ' Ridge')
	.replace(' Rdg', ' Ridge')
	.replace(' Vly', ' Valley')
	.replace(' Vy', ' Valley')
	.replace('Hq', 'HQ')
	.replace(' Gdns', ' Gardens')
	.replace(' Plz', ' Plaza')
	.replace('Air Frt', 'Air Freight')
	.replace('Econ Lot', 'Economy Lot')
	.replace(' Vw', ' View')
	.replace(' Pk', ' Park')
	.replace('Herzing Univ', 'Herzing University')
	.replace(' Wd', ' Wood')
	.replace(' Lf', ' Leaf')
	.replace('Hi Crossing', 'High Crossing')
	.replace('Datcp', 'DATCP')
	.replace('Sparkle Stn', 'Sparkle Stone Crescent')
	.replace(' Hlw', ' Hollow')
	.replace(' Rk', ' Rock')
	.replace('K James', 'King James')
	.replace(' Lts', ' Lights')
	.replace('Maple Gr', 'Maple Grove')
	.replace('Grnd', 'Grand')
	.replace('Sqr', 'Square')
	.replace(' Cuna', ' CUNA')
	.replace('Crestwood Es', 'Crestwood Elementary')
	.replace('Tfr Pt', 'TP')
	.replace('South Rdg', 'Southridge')
	.replace('South Ridge', 'Southridge')
	.replace(' Ck', ' Creek')
	.replace(' Etc', ' ETC')
	.replace(' Pt', ' Point')
	.replace('Am F', 'American F');
}

String.prototype.toDestFormat = function() {
	return this
	.replace(' TP', ' Transfer Point')
	.replace('Cap','Capitol')
	.replace('Sqr','Square')
	.replace('Hrbr','Harbor')
	.replace('Sp Harbor', 'Spring Harbor')
	.replace('Sprng Hb', 'Spring Harbor')
	.replace('Arbor Hl', 'Arbor Hills')
	.replace('E Towne', 'East Towne')
	.replace('W Towne', 'West Towne')
	.replace('Bartln', 'Bartillon')
	.replace('Pr Twn', 'Prarie Town Center')
	.replace('Mc Kee', 'McKee')
	.replace('Eagle Ht', 'Eagle Heights')
	.replace('West Wash', 'West Washington')
	.replace('Inger St', 'Ingersoll')
	.replace('Ingrsoll', 'Ingersoll')
	.replace('Shk-Atwd', 'Schenk-Atwood')
	.replace('Uw', 'UW')
	.replace('UW Hosp', 'UW Hospital')
	.replace('Univ Av', 'University Ave')
	.replace('Alld', 'Allied')
	.replace('Min Pt', 'Mineral Point')
	.replace('Hi Pt', 'High Point')
	.replace('Mdltn', 'Middleton')
	.replace('Wex Rdg', 'Wexford Ridge')
	.replace('Wexfd Rg', 'Wexford Ridge')
	.replace('Dt Mill', 'Dutch Mill')
	.replace('Dutch Ml', 'Dutch Mill')
	.replace('R Hill', 'Richmond Hill')
	.replace('Schl ', 'School ')
	.replace('Shrm Fly', 'Sherman Flyer')
	.replace('Hlnd Av', 'Highland Ave')
	.replace('Ch Grdn', 'Chalet Gardens')
	.replace('Mckee', 'McKee')
	.replace('Grntree', 'Greentree')
	.replace('Jun Rdg', 'Junction Ridge')
	.replace('Junct Rg', 'Junction Ridge')
	.replace('Fitchbrg', 'Fitchburg')
	.replace('Matc', 'MATC')
	.replace('Am Cntr', 'The American Center')
	.replace('City Vw', 'City View')
	.replace('Sheb Av', 'Sheboygan Ave')
	.replace('Sheboygn', 'Sheboygan Ave')
	.replace('Pflm', 'Pflaum')
	.replace('W Wash', 'W Washington')
	.replace('Wash Av', 'Washington')
	.replace('J No', 'John No')
	.replace('Schroedr', 'Schroeder')
	.replace('Muir Fld', 'Muir Field')
	.replace('Chart St', 'Charter')
	.replace('U Campus', 'Campus')
	.replace('Westfld', 'Westfield')
	.replace('Old Univ', 'Old University')
	.replace('Washngtn', 'Washington')
	.replace('Sth Rdg', 'Southridge')
	.replace('South Rdg', 'Southridge')
	.replace('South Rg', 'Southridge')
	.replace('Union Cs', 'Union Corners')
	.replace('Grndview', 'Grandview')
	.replace('Northbrk', 'Northbrook');
}