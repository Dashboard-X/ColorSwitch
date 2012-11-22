!function ($) {

	/* CSS TRANSITION SUPPORT (http://www.modernizr.com/)
	 * ======================================================= */
	$.support.transition = (function () {
		var transitionEnd = (function () {
			var el = document.createElement('bootstrap')
			, transEndEventNames = {
				'WebkitTransition': 'webkitTransitionEnd'
				, 'MozTransition': 'transitionend'
				, 'OTransition': 'oTransitionEnd otransitionend'
				, 'transition': 'transitionend'
            }
			, name;

			for (name in transEndEventNames) {
				if (el.style[name] !== undefined) {
					return transEndEventNames[name];
				}
			}
		}())

		return transitionEnd && {
			end: transitionEnd
		}
    })()
	
	var ColorSwitch = function (element, options) {
		this.$element = $(element);
		this.options = options;
		this.options.colors && this.parseColors();
		if (typeof this.options.property === 'string') this.options.property = [this.options.property];
		if (typeof this.options.index === 'number') this.to(this.options.index);
		this.options.pause === 'hover' && this.$element
		.on('mouseenter', $.proxy(this.pause, this))
		.on('mouseleave', $.proxy(this.cycle, this))
	}
	
	ColorSwitch.prototype = {

		constructor: ColorSwitch, 
		
		cycle: function(e) {
			if (!e) this.paused = false
			this.options.interval
			&& !this.paused
			&& (this.interval = setInterval($.proxy(this.next, this), this.options.interval))
			return this
		}, 
		pause: function(e) {
			if (!e) this.paused = true
			clearInterval(this.interval)
			this.interval = null
			return this
		}, 
		to: function(index) {	
			if (!this.options.colors.length && (this.index < 0 || this.index + 1 > this.options.colors.length)) return;
			var that = this;
			if (this.switching) {
				return this.$element.one('switchEnd', function() {
					that.to(index)
				})
			}
			this.index = index;
			this.swap();
		},
		next: function() {	 
			!this.options.colors.length && this.index++;
			if (this.index + 1 > this.options.colors.length) this.index = 0;
			this.swap();
		}, 
		prev: function() {	 
			!this.options.colors.length && this.index--;
			if (this.index < 0) this.index = this.options.colors.length - 1;
			this.swap();
		}, 
		swap: function() {			
			var that = this
			, color = this.getColor()
			, rgb = 'rgb(' + Math.floor(color[0]) + ', ' + Math.floor(color[1]) + ', ' + Math.floor(color[2]) + ')';
			for (var i = 0; i < this.options.property.length; i++) this.$element.css(this.options.property[i], rgb);					
			if ($.support.transition) {
				this.$element.one($.support.transition.end, function () {
					that.sliding = false;
				});
			} else {
				this.sliding = false;
			}
		},
		getColor: function() {
			if (this.options.colors && this.options.colors.length) {
				if (this.options.random) {
					var randomIndex = this.options.index;
					while (this.options.index == randomIndex) randomIndex = Math.floor(Math.random() * this.options.colors.length);
					this.options.index = randomIndex;
				}
				var color = this.options.colors[this.options.index];
				if (!this.options.random) this.options.index++;
				if (this.options.index >= this.options.colors.length) this.options.index = 0;
				return color;
			}
			return [Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255)];
		},
		parseColors: function() {
			var parsedColors = [];
			if (typeof this.options.colors === 'object' && this.options.colors.length) {
				for (var i = 0; i < this.options.colors.length; i++) {
					for (var x = 0; x < this.options.parsers.length; x++) {
						var parser = this.options.parsers[x]
						, result = parser(this.options.colors[i]);
						if (result) {
							parsedColors.push(result);
							continue;
						}									
					}
				}
			}
			this.options.colors = parsedColors;
		}
	}

	$.fn.colorswitch = function (option) {
		var $this = $(this)
        , data = $this.data('colorswitch')
        , options = $.extend({}, $.fn.colorswitch.defaults, typeof option === 'object' && option)
		if (!data) $this.data('colorswitch', (data = new ColorSwitch(this, options)))
		if (typeof option === 'number') data.to(option)
		else if (typeof option === 'string') data[option]()
		else if (options.interval) data.cycle()
	}
	
	function hex2rgb(hex) {
		return [parseInt(hex.substring(1, 3), 16), parseInt(hex.substring(3, 5), 16), parseInt(hex.substring(5, 7), 16)];
	}

	$.fn.colorswitch.defaults = {
		colors: [],
		property: 'background-color',
		interval: 3000,
		index: 0,
		pause: 'hover',
		random: false,
		parsers: [
			function (value) { 
				if (typeof value === 'string' && value.match('^[#][a-f|A-F|0-9]{6}$')) return hex2rgb(value);
				return false;
			},
			function (value) { 
				if (typeof value === 'string' && value.match('^[#][a-f|A-F|0-9]{3}$')) return hex2rgb(value + value.substring(1));
				return false;
			},
			function (value) { 
				if (typeof value === 'string' && value.match('^[a-f|A-F|0-9]{6}$')) return hex2rgb('#' + value);
				return false;
			},
			function (value) { 
				if (typeof value === 'string' && value.match('^[a-f|A-F|0-9]{3}$')) return hex2rgb('#' + value + value);
				return false;
			},
			function (value) { 
				if (typeof value === 'object' && value.length === 3) {
					for (var i = 0; i < 3; i++) {
						var integer = parseInt(value);
						if (isNaN(integer) || integer < 0 || integer > 255) return false;
					}
					return value;
				} 
				return false;
			}
		]
	}

	$.fn.colorswitch.Constructor = ColorSwitch

	$('.colorswitch').each(function() {
		var $this = $(this)
		if ($this.data('colorswitch')) return
		$this.colorswitch($this.data())
	})

}(window.jQuery);