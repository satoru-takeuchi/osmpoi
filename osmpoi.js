var map;
var origin = [35.103, 138.8578];
var zoom = 16;
var popup;

var api_url = "http://api06.dev.openstreetmap.org/"
//var api_url = "http://api.openstreetmap.org/"

var current_marker = null;
var current_circle = null;

var poi_kinds = { "leisure":
	     {
		 "caption": "娯楽施設",
		 "kind":
		 [["sports_centre", "スポーツセンター"],
		  ["golf_course", "ゴルフコース"],
		  ["stadium", "スタジアム"],
		  ["track", "競技トラック"],
		  ["pitch", "運動場"],
		  ["water_park", "親水公園"],
		  ["marina", "マリーナ"],
		  ["fishing", "釣り"],
		  ["park", "公園"],
		  ["playground", "遊び場"],
		  ["garden", "庭園・植物園"],
		  ["ice_rink", "アイスリンク"],
		  ["miniature_golf", "ミニチュア（パット）ゴルフ"]]
	     },
	     "amenity" : 
	     {
		 "caption": "生活",
		 "kind":
		 [["restaurant", "レストラン"],
		  ["pub", "居酒屋"],
		  ["fast_food", "ファーストフード店"],
		  ["drinking_water", "飲料水"],
		  ["biergarten", "ビアガーデン"],
		  ["cafe", "喫茶店"],
		  ["school", "学校"],
		  ["college", "短大、専修・専門学校"],
		  ["library", "図書館"],
		  ["university", "大学"],
		  ["ferry_terminal", "フェリーターミナル"],
		  ["bicycle_parking", "駐輪場"],
		  ["bicycle_rental", "レンタルサイクル店"],
		  ["car_rental", "レンタカー店"],
		  ["bus_station", "バスターミナル"],
		  ["fuel", "ガソリンスタンド"],
		  ["parking", "駐車場"],
		  ["taxi", "タクシー乗り場"],
		  ["atm", "ATM"],
		  ["bank", "銀行"],
		  ["pharmacy", "薬局"],
		  ["hospital", "病院、診療所"],
		  ["veterinary", "動物病院"],
		  ["cinema", "映画館"],
		  ["fountain", "噴水"],
		  ["nightclub", "クラブ"],
		  ["studio", "TV、ラジオスタジオ"],
		  ["theatre", "劇場"],
		  ["courthouse", "裁判所"],
		  ["townhall", "市役所、町役場"],
		  ["fire_station", "消防署"],
		  ["police", "警察署"],
		  ["public_building", "公共施設、官公署"],
		  ["post_office", "郵便局"],
		  ["post_box", "ポスト"],
		  ["place_of_worship", "礼拝所"],
		  ["prison", "刑務所"],
		  ["crematorium", "火葬場"],
		  ["grave_yard", "墓所"],
		  ["bench", "ベンチ"],
		  ["telephone", "公衆電話"],
		  ["toilets", "公衆トイレ"],
		  ["vending_machine", "自動販売機"],
		  ["waste_disposal", "ごみ捨て場"]]
	     },
	     "shop" : 
	     {
		 "caption": "店舗",
		 "kind":
		 [["alcohol", "酒屋"],
		  ["bakery", "パン屋"],
		  ["beverages", "飲料店"],
		  ["bicycle", "自転車店"],
		  ["books", "本屋"],
		  ["butcher", "精肉店"],
		  ["car", "自動車販売店"],
		  ["chemist", "化粧品、衛生掃除薬品"],
		  ["clothes", "服屋"],
		  ["convenience", "コンビニエンスストア"],
		  ["department_store", "デパート"],
		  ["dry_cleaning", "クリーニング店"],
		  ["doityourself", "ＤＩＹショップ"],
		  ["electronics", "家電店"],
		  ["florist", "花屋"],
		  ["garden_centre", "園芸用品店"],
		  ["greengrocer", "八百屋"],
		  ["hardware", "金物屋"],
		  ["kiosk", "キオスク"],
		  ["laundry", "洗濯ランドリー"],
		  ["outdoor", "アウトドア用品店"],
		  ["stationery", "文房具店"],
		  ["supermarket", "スーパーマーケット"]]
	     },
	     "tourism" : 
	     {
		 "caption": "観光",
		 "kind":
		 [["hotel", "ホテル"],
		  ["hostel", "ユースホステル"],
		  ["chalet", "バンガロー"],
		  ["camp_site", "キャンプ場"],
		  ["caravan site", "オートキャンプ場"],
		  ["information", "旅行案内所"],
		  ["museum", "博物館、美術館など"],
		  ["viewpoint", "展望台"],
		  ["zoo", "動物園"]]
	     }
	   };

var pois = {};

function show_category_selector() {
    s = "";
    jQuery.each(
	poi_kinds,
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
	poi_kinds[$("#category_selector").val()].kind,
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
	"<input type='hidden' name='lon' value='" + e.latlng.lng + "' />" +
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
}

function set_current_pos() {
    map.locate({setView: true, maxZoom: 16, enableHighAccuracy: true});
}

function show_pois() {
    for (var k in pois) {
	map.removeLayer(pois[k].marker);
    };


    var b = map.getBounds();

    var req = new XMLHttpRequest();
    req.open("GET",
	     api_url + "/api/0.6/map?bbox=" +
	     b.getWest() + "," + b.getSouth() + "," +
	     b.getEast() + "," + b.getNorth(), false);
    req.send(null);

    pois = {}

    $(jQuery.parseXML(req.responseText)).find("osm").find("node").each(function() {
	var show = false;
	var s = $("<div></div>");
	var p = {}
	id = $(this).attr("id");
	p.lat = $(this).attr("lat");
	p.lon = $(this).attr("lon");
	p.version = $(this).attr("version");

	s.append("<label class='id'>" + id + "</label><br/>");
	$(this).find("tag").each(function(){
	    var k = $(this).attr("k");
	    var v =  $(this).attr("v");
	    if (k == "name" && v.length > 0) {
		show = true;
	    }
	    s.append(k + ": " + v + "<br/>");
	});

	if (!show)
	    return;

	del = $("<input type='button' value='削除' onclick='delete_poi(" +
		id +
		")'></input>");
	s.append(del);

	p.marker = L.marker([Number(p.lat), Number(p.lon)]);
	p.marker.bindPopup(s.html());
	p.marker.addTo(map);
	pois[id] = p;
    });
}

function delete_poi(id)
{
    p = pois[id]
    jQuery.ajax({
	url: "delete.cgi",
	data: "id=" + id + "&" +
	    "version=" + p.version + "&" +
	    "lat=" + p.lat + "&" +
	    "lon=" + p.lon,
	async: false,
	success: function () {
	    alert("ポインタを削除しました");
	    map.removeLayer(pois[id].marker);
	    delete pois[id]
	},
	error: function () {
	    alert("ポイントの削除に失敗しました");
	},
    });
}
