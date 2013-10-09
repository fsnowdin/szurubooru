function scrolled()
{
	var margin = 150;
	if ($(document).height() <= $(window).scrollTop() + $(window).height() + margin)
	{
		var pageNext = $(document).data('page-next');
		var pageDone = $(document).data('page-done');
		if (pageNext == null)
		{
			pageNext = $('.paginator .next:not(.inactive) a').attr('href');
		}
		if (pageNext != null && pageNext != pageDone)
		{
			$(document).data('page-done', pageNext);
			$.get(pageNext, [], function(response)
			{
				var dom = $(response);
				var nextPage = dom.find('.paginator .next:not(.inactive) a').attr('href');
				$(document).data('page-next', nextPage);
				$('.posts').append($(response).find('.posts').children().fadeIn('slow'));
				$('body').trigger('postsLoaded');
			});
		}
	}
}

$(function()
{
	$('.paginator').hide();
	$(window).scroll(scrolled);
	scrolled();
});
