var map;

var markers = [];
var racks = [];
var iterator = 0;

var mapCenter = new google.maps.LatLng(37.38519648783452, 126.66671991348267);


var currentRid = -1;

var neighborhoods = [];

var destination;


function initialize() {
  
     
  var mapOptions = {
    zoom: 16,
    center: mapCenter,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  map = new google.maps.Map(document.getElementById('map-canvas'),
      mapOptions);
  /*
  google.maps.event.addListener(map, 'click', function(e) {
    placeMarker(e.latLng, map);
  });
  */
  

  // table setting
  
  //$("#map-canvas").css("visibility", "hidden");
  $("#btn-back").css("visibility", "hidden");
  
 
  
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



function nearStationDrop() {
  var realCount = 0;
  for (var i = 0; i < neighborhoods.length; i++) {    
    if(calcDistance(mapCenter, neighborhoods[i]) > 10){
      continue;
    }else{
      setTimeout(function() {
        addMarker();
      }, realCount++ * 200);
      
    }
  }
}

function drop() {
  
  for (var i = 0; i < neighborhoods.length; i++) {    

    setTimeout(function() {
      addMarker();
    }, i * 200);
    
    
  }
}

function addMarker() {  
  var id = iterator;
  var marker = new google.maps.Marker({
    position: neighborhoods[iterator],
    map: map,
    draggable: false,
    animation: google.maps.Animation.DROP
  });
  google.maps.event.addListener(marker, 'click', function(e) {
    toggleBounce(id);
    showRackState(racks[id]);
  });
  markers.push(marker);
  
  iterator++;
}


function toggleBounce(id) {
  
  for(var i = 0; i < markers.length; i++){
    if(id == i){
      markers[i].setAnimation(google.maps.Animation.BOUNCE);
    }
    else{
      markers[i].setAnimation(null); 
    }

  }
  markers[id].setAnimation(google.maps.Animation.BOUNCE);

  
}

function showRackState(id){
  

   jQuery.get('http://bicycle.scarlet9.net/racks/'+id, function(response) {    
    //response.data
    var free = response.data.free_count/response.data.total_count;
    var rest = 1 - free;

    $("#bar-free").width(100*free+"%");
    $("#bar-rest").width(100*rest+"%");

    if(response.data.free_count > 0){
      $( "#btn-reserve").removeClass("disabled");
    } else {
      $( "#btn-reserve").addClass("disabled");
    }

    $("#locationInfo").text(response.data.name);
    currentRid = id;
  });
}



// Sets the map on all markers in the array.
function setAllMap(map) {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
  }
}

// Removes the markers from the map, but keeps them in the array.
function clearMarkers() {
  setAllMap(null);
}

// Shows any markers currently in the array.
function showMarkers() {
  setAllMap(map);
}

// Deletes all markers in the array by removing references to them.
function deleteMarkers() {
  clearMarkers();
  markers = [];
  racks = [];
  neighborhoods = [];
  // 이 변수 때문에 고생할 일이 많아질거 같다
  // 반드시 이거 관련해서 수정해야 하는데 시간이 ㅠㅠ 
  iterator = 0;

}



function resetDrop(){
  deleteMarkers();
  jQuery.get('http://bicycle.scarlet9.net/racks', function(response) {
    map.setCenter(mapCenter);
    for(var i = 0; i < response.data.length; i++){
      racks.push(response.data[i].rid);      
      neighborhoods.push(new google.maps.LatLng(response.data[i].latitude, response.data[i].longitude));

    }   
    drop();  
  });  
  
}



function oneRackOnMap(id){
  deleteMarkers();
  jQuery.get('http://bicycle.scarlet9.net/racks/'+id, function(response) {    
    racks.push(response.data.rid);
    neighborhoods.push(new google.maps.LatLng(response.data.latitude, response.data.longitude));
    map.setCenter(neighborhoods[0]);
    drop();
  });
}

function destinationDrop(){
 deleteMarkers();
  jQuery.get('http://bicycle.scarlet9.net/racks', function(response) {
    map.setCenter(mapCenter);
    for(var i = 0; i < response.data.length; i++){
      racks.push(response.data[i].rid);      
      neighborhoods.push(new google.maps.LatLng(response.data[i].latitude, response.data[i].longitude));

    }   
    for (var i = 0; i < neighborhoods.length; i++) {    

    setTimeout(function() {
      addDestination();
    }, i * 200);
    
    
  }
  });  
   
}

function addDestination() {  
  var id = iterator;
  var marker = new google.maps.Marker({
    position: neighborhoods[iterator],
    map: map,
    draggable: false,
    animation: google.maps.Animation.DROP
  });
  google.maps.event.addListener(marker, 'click', function(e) {
    $("#remain").css("visibility", "visible");
  
    $("#map-canvas").css("visibility", "hidden");
    destination = neighborhoods[id];
    wpid = navigator.geolocation.watchPosition(dest_success, geo_error, geo_options);
  });
  markers.push(marker);
  
  iterator++;
}

function  dest_success(position){
  var current = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
  var result = calcDistance(destination, current);
  $("#remain").text((result/1000).toFixed(2)+"km");
}

