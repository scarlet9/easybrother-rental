(function($) {
	window.getWeather = function(latitude, longitude, callback) {

		var getAddressFromLocation = function(lat, lng, cb) {
			$.get('http://maps.googleapis.com/maps/api/geocode/json?latlng=' + lat + ',' + lng + '&sensor=true&language=ko', function(response) {
				if (response.status === 'OK') {
					var address = response.results[0].formatted_address;
					cb(address.split(' ').slice(1, 4));
				}
				else cb([]);
			});
		};

		var getXYFromAddress = function(address, cb) {
			var mdl, leaf,
			url = 'http://www.kma.go.kr/DFSROOT/POINT/DATA/';
			
			if (address.length < 3) {
				cb({x : 59, y : 127});
				return;
			}
			
			$.get(url + 'top.json.txt', function(response) {
				for (var i = 0; i < response.length; i++) {
					if (response[i].value == address[0]) {
						mdl = parseInt(response[i].code, 10);

						break;
					}
				}

				$.get(url + 'mdl.' + mdl + '.json.txt', function(response) {
					for (var i = 0; i < response.length; i++) {
						if (response[i].value == address[1]) {
							leaf = parseInt(response[i].code, 10);

							break;
						}
					}

					$.get(url + 'leaf.' + leaf + '.json.txt', function(response) {
						for (var i = 0; i < response.length; i++) {
							if (response[i].value == address[2]) {
								cb({
									x : parseInt(response[i].x, 10),
									y : parseInt(response[i].y, 10)
								});

								break;
							}
						}
					}, 'json');
				}, 'json');
			}, 'json');
		};

		var getWeatherFromXY = function (coord, cb) {
			$.get('http://www.kma.go.kr/wid/queryDFS.jsp?gridx=' + coord.x + '&gridy=' + coord.y, function(response) {

				var $response = $(response);
				var $data = $response.find('data');
				var time_str = $response.find('tm').text().match(/^(\d{4})(\d{2})(\d{2})(\d{2})\d{2}$/);
				var time_start = new Date(time_str[1], time_str[2] - 1, time_str[3], time_str[4], 0, 0);
				var return_str = [];

				$data.each(function() {
					var $this = $(this);
					var c = new Date(time_start);
					c.setHours(parseInt($this.find('hour').text(), 10));
					c.setDate(c.getDate() + parseInt($this.find('day').text(), 10));
					
					return_str.push({
						date : (c.getMonth() + 1) + '월 ' + c.getDate() + '일 ' + c.getHours() + '시',
						status : $this.find('wfKor').text(),
						pop : $this.find('pop').text()
					});
				});

				cb(return_str);
			}, 'xml');
		};

		getAddressFromLocation(latitude, longitude, function(address) {
			$('#nasel-zone').html('<div>' + address.join(' ') + '<div>');
			getXYFromAddress(address, function(coord) {
				getWeatherFromXY(coord, function(forecast) {
					callback(forecast);
				});
			});
		});
	};

	$(function() {
		wpid = navigator.geolocation.getCurrentPosition(function(position) {
			getWeather(position.coords.latitude, position.coords.longitude, function(forecast) {
				window.weather = forecast;

				var index = 0, $nasel = $('#nasel-zone');
				setInterval(function() {
					var $old = $nasel.children();
					$old.slideUp(1000, function() { $(this).remove(); });
					var $new = $('<div style="display:none"></div>').text(
						forecast[index].date + ': ' + forecast[index].status + '(강수확률 ' + forecast[index].pop + '%)'
					);

					$new.appendTo($nasel).slideDown(1000);

					index = ((index + 1) % forecast.length);
				}, 4000);
			});
		}, 
		function() {
			alert('GPS 정보를 받지 못해 날씨 정보를 가져올 수 없습니다.');
		}, 
		{
			enableHighAccuracy : true, 
			maximumAge : 30000, 
			timeout : 27000
		});
		
	});
})(jQuery);