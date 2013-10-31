(function($){
	$(function(){
		$('#logout-btn').click(function(){
			$.post('/user/logout', function(response) {
				location.href = '/';
			});
		});
	});
})(jQuery);