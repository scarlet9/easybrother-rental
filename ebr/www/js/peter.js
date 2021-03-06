(function($) {
	$(function() {
		$('.form-horizontal').on('submit', function() {
			if ($('#inputStudentNum').val() === "") {
				alert('Please enter username!!');
				return false;
			}

			
			$.post('http://bicycle.scarlet9.net/user/login',
			{
				'school_id' : $('#inputStudentNum').val()
			},
			function(response) {
				// Success!

				if (gBrowser.localstorage) {
					window.localStorage.setItem('school_id', $('#inputStudentNum').val());
					window.localStorage.setItem('logged', true);
				}
				location.href = 'index.html';
			}, 'json')
			.fail(function(jqxhr) {
				// Fail.
				alert(jqxhr.responseJSON.data);
			});
			
			return false;
		});

		if (gBrowser.localstorage) {
			var saved = window.localStorage.getItem('school_id');
			if (saved) {
				$('#inputStudentNum').val(saved);
				$('.form-horizontal').submit();
			}
		}
	});
})(jQuery);
