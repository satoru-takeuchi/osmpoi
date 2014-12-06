var map;
var origin = [35.103, 138.8578];
var zoom = 16;
var popup;

var api_url = "http://api06.dev.openstreetmap.org/"
//var api_url = "http://api.openstreetmap.org/"

var markers = new Array;
var current_marker = null;
var current_circle = null;

var category_selector_text = "<select id='category_selector' name='category' onchange='on_change_category()'>" +
    "<option value='leisure' selected>娯楽施設</option>" +
    "<option value='amenity'>生活</option>" +
    "</select></br>"

var pois = { "leisure":
	     "<select id='kind' name='kind'>" +
	     "<option value='stadium'>スタジアム</option>" +
	     "<option value='pitch'>運動場</option>" +
	     "<option value='park'>公園</option>" +
	     "<option value='garden'>庭園・植物園</option>" +
	     "</select><br/>"
	     ,
	     "amenity" : 
	     "<select id='kind' name='kind'>" +
	     "<option value='restaurant'>レストラン</option>" +
	     "<option value='fast_food'>ファストフード店</option>" +
	     "<option value='cafe'>喫茶店</option>" +
	     "<option value='school'>学校</option>" +
	     "<option value='library'>図書館</option>" +
	     "<option value='bank'>銀行</option>" +
	     "<option value='parking'>駐車場</option>" +
	     "<option value='hospital'>病院</option>" +
	     "<option value='pharmacy'>薬局</option>" +
	     "<option value='cinema'>映画館</option>" +
	     "<option value='townhall'>市役所、町役場</option>" +
	     "<option value='fire_station'>消防署</option>" +
	     "<option value='police'>警察署</option>" +
	     "<option value='post_office'>郵便局</option>" +
	     "</select><br/>"
	   };

function on_change_category() {
    $("#kind_selector_pos").html(pois[$("#category_selector").val()] + "<br/>");
}

function on_map_click(e) {
    s = "<form action='submit.cgi' method='post'>" +
	"名前: <input type='text' name='name' /><br/>" +
	"分類: " + category_selector_text +
	"種類: " + "<div id='kind_selector_pos'></div>" +
	"<input type='hidden' name='lat' value='" + e.latlng.lat + "' />" +
	"<input type='hidden' name='lng' value='" + e.latlng.lng + "' />" +
	"<input type='submit' value='追加' />" +
	"</form>";

    popup.setLatLng(e.latlng)
	.setContent(s)
	.openOn(map);
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
    show_nodes();
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

function show_nodes() {
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
