/*

jQuery Speedometer v1.0.3
by Jacob King
http://www.jacob-king.com/

Tested on IE7 and Firefox 3.6.3 with jQuery 1.4.2
***Requires jquery.jqcanvas-modified.js and excanvas-modified.js***



Usage: 
	$([selector]).speedometer([options object]);

Options:
	percentage: (float/int, default: 0) 
		Value to display on speedometer and digital readout. Can also be specified as the selector's innerHTML.
	scale: (float/int, default 100)
		The value considered to be 100% on the speedometer.
	limit: (float/int, default true)
		Specifies that the speedometer will "break" if the value is out of bounds.
	minimum: (float/int, default 0)
		The lowest value the needle can go without the glass cracking.
	maximum: (float/int, default 100)
		The highest value the needle can go without the glass cracking.
	animate: (boolean, default: true)
		Specifies that the speedometer needle will animate from current value to intended value.	
	suffix: (string, default ' %')
		A unit/string to display after the digital readout's value. Set to '' for none.
	
	thisCss: Default settings object for speedometer. Modifying this is not supported.
	
	digitalCss: Default settings object for digital readout. Modifying this is not supported.
	
	*/

	var startTime=-1;
	var nowTime=-1;
	var movemove=0;
	var usedCalorie=0;

	function onDeviceReady() {
		navigator.geolocation.getCurrentPosition(onSuccess, onError);
	}

    // onSuccess Geolocation
    //
    function onSuccess(position) {

    	//<!--var lat = position.coords.speed;-->
    	var lat = position.coords.latitude;
    	var lng = position.coords.longitude;
    	var acc = position.coords.accuracy;
    	var spd = position.coords.speed * 3.6;
    	$("#lat").text (lat);
    	$("#lng").text (lng);
    	$("#acc").text (acc);
    	$("#spd").text (spd);
    }

var geo_options = {
	enableHighAccuracy: false, 
	maximumAge        : 30000, 
	timeout           : 27000
};
        // onError Callback receives a PositionError object
        //
    function onError_(error) {
          	alert('code: '    + error.code    + '\n' +
        		  'message: ' + error.message + '\n');
     }

function onSuccess2(acceleration) {
	alert('fuck fuck');
        var X = acceleration.X;
    	var Y = acceleration.Y;
    	var Z = acceleration.Z;
    	var tiemStamp = acceleration.tiemStamp;
    	$("#accX").text (X);
    	$("#accY").text (Y);
    	$("#accZ").text (Z);
    	$("#accStemp").text (tiemStamp);
    	alert('fuck');
    }

    function onError2() {
        alert('onError!');
    }

function getcurrPosition(){
	
	navigator.geolocation.getCurrentPosition(onSuccess,onError_);

}
function getcurrAccel(){
alert('die??');
	navigator.accelerometer.getCurrentAcceleration(onSuccess2, onError2);
}


( function( $ ){
	$.fn.speedometer = function( options ){
		/* A tad bit speedier, plus avoids possible confusion with other $(this) references. */
		
		var $this = $( this );
		
		/* handle multiple selectors */
		if ( $this.length > 1 ) {
			$this.each( function(){
				$( this ).speedometer( options );
				
			});
			return $this;
		}	



		var def = {
			/* If not specified, look in selector's innerHTML before defaulting to zero. */
			percentage : $.trim( $this.html() ) || 0,
			scale: 100,
			limit: true,
			minimum: 0,
			maximum: 100,
			suffix: ' km/h',
			suffix2: ' kcal',
			animate:true,
			thisCss: {
				position: 'relative', /* Very important to align needle with gague. */
				width: '210px',
				height: '180px',
				padding: '0px',
				border: '0px',
				fontFamily: 'Arial',
				fontWeight: '900',
				backgroundImage : "url('img/background.jpg')"

		
			},
			digitalCss: {
				backgroundColor:'black',
				borderColor:'#555555 #999999 #999999 #555555',
				borderStyle:'solid',
				borderWidth:'2px',
				color:'white',
				fontSize:'16px',
				height:'20px',
				left:'10px',
				padding:'1px',
				position:'absolute',
				textAlign:'center',
				top:'165px',
				width:'110px',
				zIndex:'10',
				lineHeight:'20px',
				overflow:'hidden'
			},
			digitalCss2: {
				backgroundColor:'black',
				borderColor:'#555555 #999999 #999999 #555555',
				borderStyle:'solid',
				borderWidth:'2px',
				color:'white',
				fontSize:'16px',
				height:'20px',
				left:'150px',
				padding:'1px',
				position:'absolute',
				textAlign:'center',
				top:'165px',
				width:'110px',
				zIndex:'10',
				lineHeight:'20px',
				overflow:'hidden'
			}
		}
		

		
		$this.html( '' );
		
		$this.css( def.thisCss );
		
		$.extend( def, options );
		
		/* out of range */
		if ( def.limit && ( def.percentage > def.maximum || def.percentage < def.minimum ) ) {
			/* the glass cracks */
			$this.css( 'backgroundImage' , 'url("img/background-broken.jpg")' );
		} else {

		
			/* call modified jqcanvas file to generate needle line */
			$this.jqcanvas ( function ( canvas, width, height ) {
		
				var ctx = canvas.getContext ( "2d" ),
				lingrad, thisWidth;
	
				ctx.lineWidth = 2;
				ctx.strokeStyle = "rgb(255,0,0)";
				
				/* point of origin for drawing AND canvas rotation (lines up with middle of the black circle on the image) */
				ctx.translate( 105,105 );	
							
				ctx.save(); //remember linewidth, strokestyle, and translate
				
				function animate(){		
		
					ctx.restore(); //reset ctx.rotate to properly draw clearRect
					ctx.save();	//remember this default state again
		
					ctx.clearRect( -105, -105, 300, 300 ); //erase the canvas
		
					
					
		
		
					/* rotate based on percentage. */
					ctx.rotate( i * Math.PI / def.scale );
		
		
		
					/* draw the needle */
					ctx.beginPath();
					ctx.moveTo( -80,0 );
					ctx.lineTo( 10,0 );
					ctx.stroke();
					
					/* internally remember current needle value */
					$this.data('currentPercentage',i);
					
					if ( i != def.percentage ) {
					
						//properly handle fractions
						i += Math.abs( def.percentage - i ) < 1 ? def.percentage - i : def.increment;
		
						setTimeout(function(){
							animate()
						},20);
					}
				}				
				
				/* Are we animating or just displaying the percentage? */
				if (def.animate) {
					var i = parseInt( $this.data('currentPercentage') ) || 0;
					def.increment = ( i < def.percentage ) ? 1 : -1;
				} else {
					var i = ( def.percentage );
				}
				
				
				animate();
				
				
				
			
			}, { verifySize: false, customClassName: '' } );


		
		}
		
		/* digital percentage displayed in middle of image */

		//var nowSpeed = position.coords.speed;

		var showSpeed = parseInt(def.percentage);

		/* Speed */
		var digitalGauge = $( '<div></div>' );
		$this.append( digitalGauge );
		digitalGauge.css( def.digitalCss );
		digitalGauge.text( "속도: " + showSpeed + def.suffix );

		/* Calorie */
		
		var now = new Date();

		if(startTime == -1)
		{
			startTime = now.getTime();
		}
		nowTime = now.getTime();
		movemove = movemove + (def.percentage / 3600) * (nowTime - startTime) / 1000;
		var kcalpermin = 0;

		if(def.percentage >5 && def.percentage <= 13)
		{
			kcalpermin = 0.0650;
		}
		else if(def.percentage > 13 && def.percentage <= 16)
		{
			kcalpermin = 0.0783;
		}
		else if(def.percentage > 16 && def.percentage <= 19)
		{
			kcalpermin = 0.0939;	
		}
		else if(def.percentage > 19 && def.percentage <= 22)
		{
			kcalpermin = 0.1130;
		}
		else if(def.percentage > 22 && def.percentage <= 24)
		{
			kcalpermin = 0.1240;
		}
		else if(def.percentage > 24 && def.percentage <= 26)
		{
			kcalpermin = 0.1360;
		}
		else if(def.percentage > 26 && def.percentage <= 27)
		{
			kcalpermin = 0.1490;
		}
		else if(def.percentage > 27 && def.percentage <= 29)
		{
			kcalpermin = 0.1630;
		}
		else if(def.percentage > 29 && def.percentage <= 31)
		{
			kcalpermin = 0.1790;
		}
		else if(def.percentage > 31 && def.percentage <= 32)
		{
			kcalpermin = 0.1960;
		}
		else if(def.percentage > 32 && def.percentage <= 34)
		{
			kcalpermin = 0.2150;
		}
		else if(def.percentage > 34 && def.percentage <= 37)
		{
			kcalpermin = 0.2590;
		}
		else if(def.percentage > 37 && def.percentage <= 40)
		{
			kcalpermin = 0.3110;
		}
		else if(def.percentage > 40)
		{
			kcalpermin = 0.3110; //hm.....
		}

		usedCalorie = usedCalorie + kcalpermin * (80) * (nowTime - startTime) / (1000 * 60);

		var nowCal = parseInt(usedCalorie);

		var digitalGauge2 = $( '<div></div>' );
		$this.append( digitalGauge2 );
		digitalGauge2.css( def.digitalCss2 );
		digitalGauge2.text( "칼로리: " + nowCal + def.suffix2 );

		getcurrPosition();
		getcurrAccel();

		
		return $this;

	}

	

})( jQuery )