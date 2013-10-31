var map;

var markers = [];
var iterator = 0;

var mapCenter = new google.maps.LatLng(37.38519648783452, 126.66671991348267);

var neighborhoods = [
  new google.maps.LatLng(37.38245144310285, 126.66660189628601), //기숙사 앞
  new google.maps.LatLng(37.381377267809434, 126.6685438156128),  //송도 셔틀
  new google.maps.LatLng(37.38756635245252, 126.66251420974731),  //송도 지하철역
  new google.maps.LatLng(37.3841735015448, 126.66866183280945) // 약대 귀양지
];

  
function initialize() {

  if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
          //alert('it works');
      }, function(error) {
          //alert('Error occurred. Error code: ' + error.code);         
      },{timeout:50000});
  }else{
      alert('no geolocation support');
  }
    
  var mapOptions = {
    zoom: 16,
    center: mapCenter,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  map = new google.maps.Map(document.getElementById('map-canvas'),
      mapOptions);

  google.maps.event.addListener(map, 'click', function(e) {
    placeMarker(e.latLng, map);
  });
  
  drop();

  // table setting
  
  $("#map-canvas").css("visibility", "hidden");
  /*
  $("#tr0 td:nth-child(3) button").click(function(){    
    setTrDisable(0);
  });
  $("#tr1 td:nth-child(3) button").click(function(){    
    setTrDisable(1);
  });
  $("#tr2 td:nth-child(3) button").click(function(){    
    setTrDisable(2);
  });
  $("#tr3 td:nth-child(3) button").click(function(){    
    setTrDisable(3);
  });
  */
  
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

function nearestNeighborhood(){
    
  var maxIndex = 0;
  var maxValue = 0;
  

  for(var i = 0; i < neighborhoods.length; i++) {    
    var result = calcDistance(mapCenter, nighborhoods[i]);
    if(maxValue < result){
      maxValue = result;
      maxIndex = i;
    }
  }
  
  return neighborhoods[i];
  
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
/*
function setReservationTable(id){
  switch(id){
    case 0:
      setTrAvailable(0);
      setTrDisable(1);
      setTrAvailable(2);
      setTrDisable(3);

    break;
    case 1:
      setTrDisable(0);
      setTrDisable(1);
      setTrDisable(2);
      setTrDisable(3);
    break;
    case 2:
      setTrAvailable(0);
      setTrAvailable(1);
      setTrAvailable(2);  
      setTrAvailable(3);
    break;
    case 3:
      setTrDisable(0);
      setTrAvailable(1);
      setTrDisable(2);
      setTrAvailable(3);
      
    break;
  }
}

function setTrDisable(trId){
  $("#tr" + trId).removeClass("success").addClass("error");
  $("#tr" + trId + " td:nth-child(2)").text("Disable");
  $("#tr" + trId + " td:nth-child(3) button").css("visibility","hidden");  

}

function setTrAvailable(trId){
  $("#tr" + trId).removeClass("error").addClass("success");
  $("#tr" + trId + " td:nth-child(2)").text("Avalable");
  $("#tr" + trId + " td:nth-child(3) button").css("visibility","visible");
}
*/
function calcDistance(p1, p2){
  //return (google.maps.geometry.spherical.computeDistanceBetween(p1, p2) / 1000).toFixed(2);
  return google.maps.geometry.spherical.computeDistanceBetween(p1, p2);
}