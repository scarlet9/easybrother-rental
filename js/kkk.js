// kkk.js
var isMap = false;

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
		setButtons();
		initReserveView();
	});

	$( "#btn-back" ).click(function() {
		setButtons();
		initReserveView();
	});
	
	$( "#btn-lastRackHistory" ).click(function() {		
		initReserveView();
		// this function is in googlemap.js
		if(window.localStorage.getItem('lastRackHistory') > -1){
			showRackState(window.localStorage.getItem('lastRackHistory'));
		}
	});
	
	$( "#btn-nearestRack" ).click(function() {		
		initReserveView();
	});

	$( "#btn-reserve" ).click(function() {
		if (currentRid == -1) {			
			console.log("rid error");
			return false;
		}
		
		$.post('/bicycle/reserve',
		{
			'rid' : ''+currentRid
		},
		function(response) {
			alert(response);
			if (response.status === 0) {
				// Success!
				//console.log(response.data);
				//alert(JSON.stringify(response.data));
				window.localStorage.setItem('lastRackHistory', currentRid);

				//location.href = '/reservation';
				showRackState(currentRid);
				//var term = $('#inputStudentNum').val();

			}
			else {
				// Fail.
				alert(response.data);
			}
		}, 'json');
		
		return false;
	});


	if(window.localStorage.getItem('lastRackHistory') > -1){
		$( "#btn-lastRackHistory").removeClass("disabled");		
	} else {
		$( "#btn-lastRackHistory").addClass("disabled");
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
	$( "#btn-reserve").addClass("disabled");
	$( "#bar-free").width("0%");
	$( "#bar-rest").width("0%");
	$("#locationInfo").text("");
	currentRid = -1;
}

function clickResereBtn(){
	
}

