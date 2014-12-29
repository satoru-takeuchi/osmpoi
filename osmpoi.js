var map;
var origin = [35.103, 138.8578];
var zoom = 16;
var popup;

var api_url = "http://api06.dev.openstreetmap.org/"
//var api_url = "http://api.openstreetmap.org/"

var markers = new Array;
var current_marker = null;
var current_circle = null;

var pois = { "leisure":
	     {
		 "caption": "娯楽施設",
		 "kind":
		 [["sports_centre", "スポーツセンター"],
		  ['stadium', "スタジアム"],
		  ['pitch', "運動場"],
		  ['park', "公園"],
		  ['gaerden', "庭園・植物園"]]
	     },
	     "amenity" : 
	     {
		 "caption": "生活",
		 "kind":
		 [['restaurant', "レストラン"],
		  ['pub', "居酒屋"],
		  ['fast_food', "ファストフード店"],
		  ['drinking_water', "飲料水"],
		  ['cafe', "喫茶店"],
		  ['school', "学校"],
		  ['library', "図書館"],
		  ['bank', "銀行"],
		  ['parking', "駐車場"],
		  ['hospital', "病院"],
		  ['pharmacy', "薬局"],
		  ['cinema', "映画館"],
		  ['townhall', "市役所、町役場"],
		  ['fire_station', "消防署"],
		  ['police', "警察署"],
		  ['post_office', "郵便局"]]
	     }
	   };

function show_category_selector() {
    s = "";
    jQuery.each(
	pois,
	function (k,v) {
	    s += "<option value='" + k + "'>" +
		v.caption +
		"</option>";
	});
    $("#category_selector").html(s);
}

function on_change_category() {
    s = "";
    jQuery.each(
	pois[$("#category_selector").val()].kind,
	function (k,v) {
	    s += "<option value='" + v[0] + "' " + (k == 0 ? "selected" : "") + ">" +
		v[1] +
		"</option>"
	});
    $("#kind_selector_pos").html(s);
}

function on_map_click(e) {
    s = "<form action='submit.cgi' method='post'>" +
	"名前: <input type='text' name='name' /><br/>" +
	"分類: <select id='category_selector' name='category' onchange='on_change_category()'></select><br/>" +
	"種類: " + "<select id='kind_selector_pos' name='kind'></select><br/>" +
	"<input type='hidden' name='lat' value='" + e.latlng.lat + "' />" +
	"<input type='hidden' name='lng' value='" + e.latlng.lng + "' />" +
	"<input type='submit' value='追加' />" +
	"</form>";

    popup.setLatLng(e.latlng)
	.setContent(s)
	.openOn(map);
    show_category_selector();
    on_change_category();
}

function on_location_found (e) {
    var radius = e.accuracy / 2;
    if (current_marker)
	map.removeLayer(current_marker);
    current_marker = L.marker(e.latlng).addTo(map);
    current_marker.bindPopup("あなたの現在地はここから " + radius + "メートル以内です")
	.openPopup();
    if (current_circle)
	map.removeLayer(current_circle);
    current_circle = L.circle(e.latlng, radius);
    current_circle.addTo(map);
    show_pois();
}

function on_location_error(e) {
    alert(e.message);
}

function show_map() {
    map = L.map("map")
    set_current_pos();
    map.on("click", on_map_click);
    map.on('locationfound', on_location_found);
    map.on("locationerror", on_location_error);

    L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
	attribution: "\
&copy; <a href='http://openstreetmap.org'>OpenStreetMap</a> contributors, \
<a href='http://creativecommons.org/licenses/by-sa/2.0/'>CC-BY-SA</a>"
    }).addTo(map);
    popup = L.popup();
    nodes = new Array();
}

function set_current_pos() {
    map.locate({setView: true, maxZoom: 16, enableHighAccuracy: true});
}

function show_pois() {
    markers.forEach(function(e) {
	map.removeLayer(e);
    })

    var b = map.getBounds();

    var req = new XMLHttpRequest();
    req.open("GET",
	     api_url + "/api/0.6/map?bbox=" +
	     b.getWest() + "," + b.getSouth() + "," +
	     b.getEast() + "," + b.getNorth(), false);
    req.send(null);

    $($.parseXML(req.responseText)).find("osm").find("node").each(function(){
	var s = "";
	show = false;
	var lat = $(this).attr("lat");
	var lon = $(this).attr("lon");
	$(this).find("tag").each(function(){
	    var k = $(this).attr("k");
	    var v =  $(this).attr("v");
	    if (k == "name" && v.length > 0) {
		show = true;
	    }
	    s += k + ": " + v + "<br/>";
	});
	if (!show)
	    return;
	var m = L.marker([Number(lat), Number(lon)]);
	markers.push(m);
	m.bindPopup(s);
	m.addTo(map);
    });
}
