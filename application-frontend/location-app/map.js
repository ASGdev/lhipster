var mymap = null;
var marker = null;

document.addEventListener("DOMContentLoaded", function(event) {
    mymap = L.map('mapid').setView([51.505, -0.09], 13);
	
	L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		maxZoom: 19,
		attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
	}).addTo(mymap);
	
	apply();

	
});

function add_gateway(lat, lon){
	marker = L.marker([lat, lon]).addTo(mymap);
	
	// update view
	var latLngs = [ marker.getLatLng() ];
	var markerBounds = L.latLngBounds(latLngs);
	mymap.fitBounds(markerBounds);
}

function add_cover(lat, lon, range_meters){
	L.circle([lat, lon], {
		color: 'red',
		fillColor: '#f03',
		fillOpacity: 0.5,
		radius: range_meters
	}).addTo(mymap);
}

function apply(){
	add_gateway(45.18777, 5.68834);
	
	var computed_dist = calculateDistance2(-114, 868.5);
	console.log(computed_dist);
	add_cover(45.18777, 5.68834, computed_dist);
}

function calculateDistance(rssi_db, freq_mhz){
	// using http://rvmiller.com/2013/05/part-1-wifi-based-trilateration-on-android/
	let exp = (27.55 - (20 * Math.log10(freq_mhz)) + Math.abs(rssi_db)) / 20.0;
	return Math.pow(10.0, exp);
}

function calculateDistance2(rssi_db, freq_mhz){
	let a = -45; // mode 1
	let n = 2; // mode 1
	let t = (a - rssi_db) / (10 * n);
	return Math.pow(10, t);
}