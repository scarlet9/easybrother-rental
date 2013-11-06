// kkk.js
var isMap = false;
var wpid;
$(function(){

	

	$( "#day" ).click(function() {		
		setDay();
	});

	$( "#day-today" ).click(function() {		
		setToday();
	});	

	$( "#day-tomorrow" ).click(function() {		
		setTomorrow();
	});

	$( "#time" ).click(function() {		
		var temp = ($(this).text().substr(0,2)*1 +1)%24;
		$("#time").text($( "#time-"+temp ).text());
	});

	for(var i = 0; i < 24; i++){
		var temp = i;
		$( "#time-"+temp ).click(function() {		
			$( "#time" ).text($(this).text());
	});		
	}

	$( "#btn-findmap" ).click(function() {
		//setButtons();
		resetDrop();
		initReserveView();
	});

	$( "#btn-back" ).click(function() {
		setButtons();
		initReserveView();
	});
	
	$( "#btn-lastRackHistory" ).click(function() {		
		initReserveView();
		
		if(!(window.localStorage.getItem('lastRackHistory') == "" || 
			window.localStorage.getItem('lastRackHistory') == null)){
			// these functions are in googlemap.js
			showRackState(window.localStorage.getItem('lastRackHistory'));
			oneRackOnMap(window.localStorage.getItem('lastRackHistory'));
		}
	});
	
	$( "#btn-nearestRack" ).click(function() {		
		initReserveView();
		deleteMarkers();
		jQuery.get('/racks', function(response) {		    
		    for(var i = 0; i < response.data.length; i++){
		    	racks.push(response.data[i].rid);      
		    	neighborhoods.push(new google.maps.LatLng(response.data[i].latitude, response.data[i].longitude));
		    }   
		    
	  	});

	  	wpid = navigator.geolocation.watchPosition(geo_success, geo_error, geo_options);
	});

	$( "#btn-reserve" ).click(function() {
		if (currentRid == -1) {			
			console.log("rid error");
			return false;
		} else if( $( "#btn-reserve" ).hasClass( "disabled") ) {
			return false;
		}
		
		$.post('/bicycle/reserve',
		{
			'rid' : ''+currentRid
		},
		function(response) {		
			// Success!				
			window.localStorage.setItem('lastRackHistory', currentRid);
			//location.href = '/reservation';
			showRackState(currentRid);
		}, 'json')
		.fail(function(jqxhr) {
				// Fail.
				alert(jqxhr.responseJSON.data);
		});
		
		return false;
	});


	if(window.localStorage.getItem('lastRackHistory') == "" || 
		window.localStorage.getItem('lastRackHistory') == null ){		
		$( "#btn-lastRackHistory").addClass("disabled");
	} else {
		$( "#btn-lastRackHistory").removeClass("disabled");
	}

	
});

var dayByday = true;
var time = 0;

function setButtons(){
	if(isMap){
		
		$("#btn-back").css("visibility","hidden");
		$("#map-canvas").css("visibility","hidden");
		
		$(".span6 .btn-large").css("display", "inline");
	} else {
		
		$("#btn-back").css("visibility","visible");
		$("#map-canvas").css("visibility","visible");
		// this function is in googlemap.js
		resetDrop();
		$(".span6 .btn-large").css("display", "none");
		
	}
	
	isMap = !isMap;


}

function setDay(){
	if(dayByday){		
		$( "#day" ).text("Tomorrow");
	}else{
		$( "#day" ).text("Today");
	}

	dayByday = !dayByday;
}

function setToday(){
	$( "#day" ).text("Today");
	dayByday = true;
}

function setTomorrow(){
	$( "#day" ).text("Tomorrow");
	dayByday = false;	
}

function initReserveView(){
	navigator.geolocation.clearWatch(wpid);
	$( "#btn-reserve").addClass("disabled");
	$( "#bar-free").width("0%");
	$( "#bar-rest").width("0%");
	$("#locationInfo").text("");
	currentRid = -1;
}

function clickResereBtn(){
	
}

function nearestNeighborhood(latit, longi){
   
	var currentLocation = new google.maps.LatLng(latit, longi);
	
	var minValue = calcDistance(currentLocation, nighborhoods[0]);
	var minIndex = 0;

	for(var i = 1; i < neighborhoods.length; i++) {    
		var result = calcDistance(currentLocation, nighborhoods[i]);
		if(minValue > result){
			minValue = result;
			minIndex = i;
		}
	}

return minIndex;
  
}

function calcDistance(p1, p2){
	//return (google.maps.geometry.spherical.computeDistanceBetween(p1, p2) / 1000).toFixed(2);
	return google.maps.geometry.spherical.computeDistanceBetween(p1, p2);
}


function geo_success(position) {
	var minIndex = nearestNeighborhood(position.coords.latitude, position.coords.longitude);

	oneRackOnMap(minIndex);

}

function geo_error() {
	alert("위치 정보를 사용할 수 없습니다.");
}

var geo_options = {
	enableHighAccuracy: true, 
	maximumAge        : 30000, 
	timeout           : 27000
};