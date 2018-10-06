
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

function addTime(time_to_add) {
  var next_time = seconds_from_midnight + time_to_add
  for (route of routes)
  {

  }
}



function getRoutes(){
  return routes
}


function getWagons() {
  return
    [{
      "start": "1.41.1",
      "end":  "1.41.1",
      "route": "route1",
      "time_to_arrive": 5,
      "total_time": 10
    }
    ]
}
