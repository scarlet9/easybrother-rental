var map;

var markers = [];
var iterator = 0;

var neighborhoods = [
  new google.maps.LatLng(37.38245144310285, 126.66660189628601), //기숙사 앞
  new google.maps.LatLng(37.381377267809434, 126.6685438156128),  //송도 셔틀
  new google.maps.LatLng(37.38756635245252, 126.66251420974731),  //송도 지하철역
  new google.maps.LatLng(37.3841735015448, 126.66866183280945) // 약대 귀양지
];


function initialize() {
  var mapOptions = {
    zoom: 16,
    center: new google.maps.LatLng(37.38519648783452, 126.66671991348267),
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  map = new google.maps.Map(document.getElementById('map-canvas'),
      mapOptions);

  /*google.maps.event.addListener(map, 'click', function(e) {
    placeMarker(e.latLng, map);
  });
  */
  drop();
}



google.maps.event.addDomListener(window, 'load', initialize);

function placeMarker(position, map) {
  var marker = new google.maps.Marker({
    position: position,
    map: map
  });
  console.log(position);
  map.panTo(position);
}

function drop() {
  for (var i = 0; i < neighborhoods.length; i++) {
    setTimeout(function() {
      addMarker();
    }, i * 200);
  }
}

function addMarker() {
  var marker = new google.maps.Marker({
    position: neighborhoods[iterator],
    map: map,
    draggable: false,
    animation: google.maps.Animation.DROP
  });
  google.maps.event.addListener(marker, 'click', function(e) {
    toggleBounce(marker);
  });
  markers.push(marker);
  
  iterator++;
}

function toggleBounce(marker) {

  if (marker.getAnimation() != null) {
    marker.setAnimation(null);
  } else {
    marker.setAnimation(google.maps.Animation.BOUNCE);
  }
}