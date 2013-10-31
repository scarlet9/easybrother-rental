(function($) {
	$(function() {
		$('.form-horizontal').on('submit', function() {
			if ($('#inputStudentNum').val() === "") {
				alert('Please enter username!!');
				return false;
			}
			
			$.post('/user/login',
			{
				'school_id' : $('#inputStudentNum').val()
			},
			function(response) {
				if (response.status === 0) {
					// Success!
					//console.log(response.data);
					//alert(JSON.stringify(response.data));
					location.href = "index.html";
					//var term = $('#inputStudentNum').val();
				}
				else {
					// Fail.
					alert(response.data);
				}
			}, 'json');
			
			return false;
		});
	});
})(jQuery);
