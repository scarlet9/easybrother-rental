(function($) {
	$.post(
	{
		'school_id' : $('#inputEmail').val()
	},
	function(response) {
		if (response.status === 0) {
			// Success!
			
		}
		else {
			// Fail.
			alert(response.status);
		}
	}, 'json');
})(jQuery);
