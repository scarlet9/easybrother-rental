// kkk.js
var nrTempEnd = false;
var neighborsTemp = [];
var racksTemp = [];
var isMap = false;
var wpid = -1;
var lastRackId = -2;
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
		
		resetDrop();
		initReserveView();
	});

	$( "#btn-back" ).click(function() {
		//setButtons();
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
		racksTemp = [];
		neighborsTemp = [];
		nrTempEnd = false;
		jQuery.get('http://bicycle.scarlet9.net/racks', function(response) {		    
		    for(var i = 0; i < response.data.length; i++){
		    	racksTemp.push(response.data[i].rid);      
		    	neighborsTemp.push(new google.maps.LatLng(response.data[i].latitude, response.data[i].longitude));
		    }   
		    nrTempEnd = true;
	  	});

	  	wpid = navigator.geolocation.watchPosition(geo_success, geo_error, geo_options);
	});

	$( "#btn-reserve" ).click(function() {
		reservationClick();
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
		$("#div-time").css("visibility", "hidden");
		$("#div-day").css("visibility", "hidden");
		$("#div-probar").css("visibility", "hidden");
		$("#btn-reserve").css("visibility", "hidden");

		$(".span6 .btn-racksearch-menu").css("display", "inline");
	} else {
		
		$("#btn-back").css("visibility","visible");
		$("#map-canvas").css("visibility","visible");
		$("#div-time").css("visibility", "visible");
		$("#div-day").css("visibility", "visible");
		$("#div-probar").css("visibility", "visible");
		$("#btn-reserve").css("visibility", "visible");
		// this function is in googlemap.js
		//resetDrop();
		$(".span6 .btn-racksearch-menu").css("display", "none");
		
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
	if(wpid > 0){
		navigator.geolocation.clearWatch(wpid);
		wpid = -1;
	}

	$( "#btn-reserve").addClass("disabled");
	$( "#bar-free").width("0%");
	$( "#bar-rest").width("0%");
	$("#locationInfo").text("");
	currentRid = -1;
	if (gBrowser.mobile) {
		setButtons();
	}
}

function clickResereBtn(){
	
}

function nearestNeighborhood(latit, longi){
	if(nrTempEnd === true){
		var currentLocation = new google.maps.LatLng(latit, longi);
	
		var minValue = calcDistance(currentLocation, neighborsTemp[0]);
		var minIndex = 0;

		for(var i = 1; i < neighborsTemp.length; i++) {    
			var result = calcDistance(currentLocation, neighborsTemp[i]);
			
			if(minValue > result){
				minValue = result;
				minIndex = i;
			}
		}

		return racksTemp[minIndex];	
	}

	return -1;
	
  
}

function calcDistance(p1, p2){
	//return (google.maps.geometry.spherical.computeDistanceBetween(p1, p2) / 1000).toFixed(2);
	return google.maps.geometry.spherical.computeDistanceBetween(p1, p2);
}


function geo_success(position) {
	
	var minRackId = nearestNeighborhood(position.coords.latitude, position.coords.longitude);
	if(minRackId != lastRackId){
		if(minRackId > -1){
			lastRackId = minRackId;
			showRackState(minRackId);
			oneRackOnMap(minRackId);
		}	
	}
	
	

}

function geo_error() {
	alert("위치 정보를 사용할 수 없습니다.");
}

var geo_options = {
	enableHighAccuracy: true, 
	maximumAge        : 30000, 
	timeout           : 27000
};

function geo_success_now(latit, longi) {	
	var nTemp = [];
	var rTemp = [];
	jQuery.get('http://bicycle.scarlet9.net/racks', function(response) {
	    for(var i = 0; i < response.data.length; i++){
	    	rTemp.push(response.data[i].rid);      
	    	nTemp.push(new google.maps.LatLng(response.data[i].latitude, response.data[i].longitude));
	    }   
	    
	    var currentLocation = new google.maps.LatLng(latit, longi);
	
		var minValue = calcDistance(currentLocation, nTemp[0]);
		var minIndex = 0;

		for(var i = 1; i < nTemp.length; i++) {    
			var result = calcDistance(currentLocation, nTemp[i]);
			
			if(minValue > result){
				minValue = result;
				minIndex = i;
			}
		}

		currentRid = rTemp[minIndex];
		reservationIm();

  	});


}

function geo_success_logs(latit, longi, state_string){
	var nTemp = [];
	var rTemp = [];
	jQuery.get('http://bicycle.scarlet9.net/racks', function(response) {
	    for(var i = 0; i < response.data.length; i++){
	    	rTemp.push(response.data[i].rid);      
	    	nTemp.push(new google.maps.LatLng(response.data[i].latitude, response.data[i].longitude));
	    }   
	    
	    var currentLocation = new google.maps.LatLng(latit, longi);
	
		var minValue = calcDistance(currentLocation, nTemp[0]);
		var minIndex = 0;

		for(var i = 1; i < nTemp.length; i++) {    
			var result = calcDistance(currentLocation, nTemp[i]);
			
			if(minValue > result){
				minValue = result;
				minIndex = i;
			}
		}

		
		$.post('http://bicycle.scarlet9.net/bicycle/return',
		{
			'rid' : ''+rTemp[minIndex]
		},
		function(response) {		
			// Success!
			
			//location.href = '/reservation';
			alert('반납에 성공하였습니다. 이용해 주셔서 감사합니다.');
			$('.log-state-2').find('td').last().text(state_string[3]);
			$('#modal-return-zone').remove();
			$('#return-alert').remove();
		}, 'json')
		.fail(function(jqxhr) {
			// Fail.
			alert(jqxhr.responseJSON.data);
		});

  	});
}

function reservationClick(){
	
	if (currentRid == -1) {			
		console.log("rid error");
		return false;
	} 
	
	$.post('http://bicycle.scarlet9.net/bicycle/reserve',
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

}

function reservationIm(){

	if (currentRid == -1) {			
		console.log("rid error");
		return false;
	} 
	
	$.post('http://bicycle.scarlet9.net/bicycle/reserve',
	{
		'rid' : ''+currentRid
	},
	function(response) {		
		// Success!				
		window.localStorage.setItem('lastRackHistory', currentRid);
		//location.href = '/reservation';
		$.post('http://bicycle.scarlet9.net/bicycle/get', function(response) {
			alert('대여에 성공하였습니다. 1시간 내로 거치대에 반납해주세요.');
		})
		.fail(function(jqxhr) {
			// Fail.
			alert(jqxhr.responseJSON.data);
		});
	}, 'json')
	.fail(function(jqxhr) {
			// Fail.
			alert(jqxhr.responseJSON.data);
	});
	
	return false;

}

function feverInit(){
	if(wpid > 0){
		navigator.geolocation.clearWatch(wpid);
		wpid = -1;
	}
	
	$("#map-canvas").css("visibility", "visible");
}
