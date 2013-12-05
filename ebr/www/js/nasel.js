(function($) {
	window.getWeather = function(latitude, longitude, callback) {
		var getAddressFromLocation = function(lat, lng, callback) {
			$.get('http://maps.googleapis.com/maps/api/geocode/json?latlng=' + lat + ',' + lng + '&sensor=true&language=ko', function(response) {
				if (response.status === 'OK') {
					var address = response.results[0].formatted_address;
					callback(address.split(' ').slice(-4, -1).reverse());
				}
				callback([]);
			});
		};

		var getXYFromAddress = function(address, callback) {
			var mdl, leaf,
			url = 'http://www.kma.go.kr/DFSROOT/POINT/DATA/';
			if (address.length !== 3) callback({x : 59, y : 127});
			
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
								callback({
									x : parseInt(response[i].x, 10),
									y : parseInt(response[i].y, 10)
								});

								break;
							}
						}
					});
				});
			});
		};

		var getWeatherFromXY = function (coord, callback) {
			$.get('http://www.kma.go.kr/wid/queryDFS.jsp?gridx=' + coord.x + '&gridy=' + coord.y, function(response) {
				var data = response.wid.body.data;
				var time_str = response.wid.header.tm.toString().match(/^(\d{4})(\d{2})(\d{2})(\d{2})\d{2}$/);
				var time_start = new Date(time_str[1], time_str[2] - 1, time_str[3], time_str[4], 0, 0);
				var return_str = [];

				for (var i = 0; i < data.length; i++) {
					var c = new Date(time_start);
					c.setHours(current.getHours() + parseInt(data[i].hour, 10));
					c.setDate(current.getDate() + parseInt(data[i].day, 10));
					
					return_str.append({
						date : (c.getMonth + 1) + '월 ' + c.getDate() + '일 ' + c.getHour() + '시',
						status : data[i].wfKor,
						pop : data[i].pop
					});
				}

				return return_str;
			});
		};

		getAddressFromLocation(latitude, longitude, function(address) {
			getXYFromAddress(address, function(coord) {
				getWeatherFromXY(coord, function() {
					callback()
				});
			});
		});
	};
})(jQuery);