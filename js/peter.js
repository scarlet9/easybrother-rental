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
				// Success!
				location.href = '/';
			}, 'json')
			.fail(function(jqxhr) {
				// Fail.
				alert(jqxhr.responseJSON.data);
			});
			
			return false;
		});
	});
})(jQuery);
