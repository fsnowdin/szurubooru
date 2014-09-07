var App = App || {};

App.Util = (function(jQuery, promise) {

	var templateCache = {};
	var lastContentPresenterName;
	var lastContentPresenter;

	function parseComplexRouteArgs(args) {
		var result = {};
		args = (args || '').split(/;/);
		for (var i = 0; i < args.length; i ++) {
			var arg = args[i];
			if (!arg)
				continue;
			kv = arg.split(/=/);
			result[kv[0]] = kv[1];
		}
		return result;
	}

	function compileComplexRouteArgs(baseUri, args) {
		var result = baseUri + '/';
		_.each(args, function(v, k) {
			if (typeof(v) == 'undefined')
				return;
			result += k + '=' + v + ';'
		});
		result = result.slice(0, -1);
		return result;
	}

	function initPresenter(presenterName, args) {
		var presenter = App.DI.get(presenterName);
		presenter.init.call(presenter, args);
	}

	function initContentPresenter(presenterName, args) {
		if (lastContentPresenterName != presenterName) {
			var presenter = App.DI.get(presenterName);
			var initResult = presenter.init.call(presenter, args);
			lastContentPresenterName = presenterName;
			lastContentPresenter = presenter;
		} else {
			lastContentPresenter.reinit.call(presenter, args);
		}
	}

	function promiseTemplate(templateName) {
		return promiseTemplateFromCache(templateName)
			|| promiseTemplateFromDOM(templateName)
			|| promiseTemplateWithAJAX(templateName);
	}

	function promiseTemplateFromCache(templateName) {
		if (templateName in templateCache) {
			return promise.make(function(resolve, reject) {
				resolve(templateCache[templateName]);
			});
		}
	}

	function promiseTemplateFromDOM(templateName) {
		var $template = jQuery('#' + templateName + '-template');
		if ($template.length) {
			return promise.make(function(resolve, reject) {
				resolve($template.html());
			});
		}
		return null;
	}

	function promiseTemplateWithAJAX(templateName) {
		return promise.make(function(resolve, reject) {
			var templatesDir = '/templates';
			var templateUrl = templatesDir + '/' + templateName + '.tpl';
			var templateString;

			$.ajax({
				url: templateUrl,
				method: 'GET',
				success: function(data, textStatus, xhr) {
					resolve(data);
				},
				error: function(xhr, textStatus, errorThrown) {
					console.log(Error('Error while loading template ' + templateName + ': ' + errorThrown));
					reject();
				},
			});
		});
	}

	function formatRelativeTime(timeString) {
		if (!timeString)
			return 'never';

		var time = Date.parse(timeString);
		var now = Date.now();
		var difference = Math.abs(now - time);
		var future = now < time;

		var text = (function(difference) {
			var mul = 1000;
			var prevMul;

			mul *= 60;
			if (difference < mul)
				return 'a few seconds';
			if (difference < mul * 2)
				return 'a minute';

			prevMul = mul; mul *= 60;
			if (difference < mul)
				return Math.round(difference / prevMul) + ' minutes';
			if (difference < mul * 2)
				return 'an hour';

			prevMul = mul; mul *= 24;
			if (difference < mul)
				return Math.round(difference / prevMul) + ' hours';
			if (difference < mul * 2)
				return 'a day';

			prevMul = mul; mul *= 30.42;
			if (difference < mul)
				return Math.round(difference / prevMul) + ' days';
			if (difference < mul * 2)
				return 'a month';

			prevMul = mul; mul *= 12;
			if (difference < mul)
				return Math.round(difference / prevMul) + ' months';
			if (difference < mul * 2)
				return 'a year';

			return Math.round(difference / mul) + ' years';
		})(difference);

		if (text == 'a day')
			return future ? 'tomorrow' : 'yesterday';
		return future ? 'in ' + text : text + ' ago';
	}

	return {
		promiseTemplate: promiseTemplate,
		initPresenter : initPresenter,
		initContentPresenter: initContentPresenter,
		parseComplexRouteArgs: parseComplexRouteArgs,
		compileComplexRouteArgs: compileComplexRouteArgs,
		formatRelativeTime: formatRelativeTime,
	};
});

App.DI.registerSingleton('util', App.Util);
