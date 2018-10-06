
var railmap = L.map('map').setView([41.356360, 2.103296], 13);

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.light',
    accessToken: 'pk.eyJ1Ijoia2l0dHVzIiwiYSI6ImNqbXdsMzlwMTM5MDEzcG54bXdrM281anoifQ.bm1LajQFRW9BGEe2iq8kYQ'
}).addTo(railmap);

/**
 * STOPS
 */
var stopIcon = L.icon({
    iconUrl: 'img/stop.png',
     iconSize:     [12, 12]
});


wagons = []
routes = {}

loadRouteData('data/stops/routes.json')

function loadRouteData(filePath) {
  loadJSON(filePath, function(file) {
    for (route in file) {
      console.log("Parsing route :" + route);
    }
    routes = file
    drawElements();
  });
}

/*
TRAINRAILS
*/

function drawElements(){
    polylines = {}
    decorators = {}

    for (route in routes){
        var stopsList = routes[route]['stops'];
        var coords = []

        for (stop of stopsList){
            latlong = [stop["stop_lat"], stop["stop_lon"]];
            coords.push(latlong);

            L.marker(latlong, {icon: stopIcon}).addTo(railmap);

        }

        polylines[route] = L.polyline(coords,{color: 'black'}).addTo(railmap);
        decorators[route] = L.polylineDecorator(polylines[route], {
        patterns: [
                {offset: 10, endOffset: 10, repeat: 10,
                    symbol: L.Symbol.arrowHead({pixelSize: 6, headAngle: 160, pathOptions: {color: 'black', fillOpacity: 1, weight: 0}})}
        ],
        }).addTo(railmap);
    }
}

function changeColor(route, color){
    polylines[route].setStyle({
        color: color
    });
    decorators[route].setPatterns([
            {offset: 10, endOffset: 10, repeat: 10,
                symbol: L.Symbol.arrowHead({pixelSize: 6, headAngle: 160, pathOptions: {color: color, fillOpacity: 1, weight: 0}})}
    ]);
}

function anglePoints(p1, p2){
    proj1 = railmap.project(p1);
    proj2 = railmap.project(p2);

    return - Math.atan2(proj2.y-proj1.y, proj2.x-proj1.x) * 180 / Math.PI;
}

/*
TRAINS
*/



function loadJSON(filePath, success, error) {
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function()
	{
		if (xhr.readyState === XMLHttpRequest.DONE) {
			if (xhr.status === 200) {
				if (success)
					success(JSON.parse(xhr.responseText));
		} else {
			if (error)
				error(xhr);
			}
		}
	};
	xhr.open("GET", filePath, true);
	xhr.send();
}


/*
Return dynamic information
*/


var seconds_from_midnight = 8 * 60 * 60;
function  getTime() {
  return seconds_from_midnight
}


function hour_to_seconds(hour) {
  var hours = hour[0]*10+ hour[1]
  var minutes = hour[3]*10+ hour[4]
  var seconds = hour[6]*10+ hour[7]
  return seconds + 60 * (minutes + hours * 60)
}

function addTime(time_to_add) {
  var next_time = seconds_from_midnight + time_to_add
  for (route of routes)
  {
    var freq = 0
    for (var time in route.freq) {
      if (hour_to_seconds(time) < seconds_from_midnight){
        freq = route.freq[time]
      }
    }
    var freq = route.freq
    for(var now=seconds_from_midnight; now<=next_time; ++now)
    {
      if (now%freq == 0 )
      {
        wagons.push({
          "route": route,
          "spawned_time" : now,
          "start": 0
        })
      }
    }
  }
}



function getRoutes(){
  return routes
}


function getWagons() {
  for (var wagon of wagons){
    var routeKey = wagon.route
    for (var stop of routes[routeKey].stops){
      wagon.start = ""
      wagon.end = ""
      if((seconds_from_midnight - wagon.spawned_time) < hour_to_seconds(stop.departure_time))
      {
        wagon.start = stop
      }
      if(wagon.end == "" && (seconds_from_midnight - wagon.spawned_time) > hour_to_seconds(stop.arrival_time) )
      {
        wagon.end = stop
        wagon.time_to_arrive = stop.arrival_time - seconds_from_midnight
        wagon.time_to_arrive = stop.arrival_time - wagon.start.departure_time
      }
    }
    if (wagon.end == ""){
      delete wagon
    }
  }
  return wagons
}
