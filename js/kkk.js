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

	});

	$( "#btn-back" ).click(function() {
		setButtons();		

	});
	
});

var dayByday = true;
var time = 0;

function setButtons(){
	if(isMap){
		
		$("#btn-back").css("visibility","hidden");
		$("#map-canvas").css("visibility","hidden");
		// this function is in googlemap.js
		resetDrop();
		$(".span6 .btn-large").css("display", "inline");
	} else {
		
		$("#btn-back").css("visibility","visible");
		$("#map-canvas").css("visibility","visible");
		
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
