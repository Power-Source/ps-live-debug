/**!
 * wp-color-picker-alpha (Modern wp.i18n version)
 *
 * Overwrite Automattic Iris for enabled Alpha Channel in wpColorPicker
 * Updated to use wp.i18n instead of deprecated wpColorPickerL10n
 *
 * Version: 2.1.3-modern
 * Based on: https://github.com/kallookoo/wp-color-picker-alpha
 * Licensed under the GPLv2 license.
 */
(function($) {
	// Bail if wpColorPicker doesn't exist or already has alpha
	if (!$.wp.wpColorPicker.prototype._hasAlpha) {
		
		var __ = wp.i18n.__;
		
		// Base64 encoded 1x1 transparent PNG for alpha background
		var alphaBackground = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAAHnlligAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAHJJREFUeNpi+P///4EDBxiAGMgCCCAGFB5AADGCRBgYDh48CCRZIJS9vT2QBAggFBkmBiSAogxFBiCAoHogAKIKAlBUYTELAiAmEtABEECk20G6BOmuIl0CIMBQ/IEMkO0myiSSraaaBhZcbkUOs0HuBwDplz5uFJ3Z4gAAAABJRU5ErkJggg==';
		
		var pickerHolder = '<div class="wp-picker-holder" />';
		var pickerContainer = '<div class="wp-picker-container" />';
		var pickerButton = '<input type="button" class="button button-small" />';
		
		// Check WP version for legacy vs modern markup
		var legacyMode = (typeof wpColorPickerL10n !== 'undefined' && typeof wpColorPickerL10n.current !== 'undefined');
		var colorResult;
		
		if (legacyMode) {
			colorResult = '<a tabindex="0" class="wp-color-result" />';
		} else {
			colorResult = '<button type="button" class="button wp-color-result" aria-expanded="false"><span class="wp-color-result-text"></span></button>';
			var pickerLabel = '<label></label>';
			var screenReaderText = '<span class="screen-reader-text"></span>';
		}
		
		// Override Color toString to handle alpha
		Color.fn.toString = function() {
			if (this._alpha < 1) {
				return this.toCSS('rgba', this._alpha).replace(/\s+/g, '');
			}
			var hex = parseInt(this._color, 10).toString(16);
			if (this.error) {
				return '';
			}
			if (hex.length < 6) {
				hex = ('00000' + hex).substr(-6);
			}
			return '#' + hex;
		};
		
		// Extend wpColorPicker widget
		$.widget('wp.wpColorPicker', $.wp.wpColorPicker, {
			_hasAlpha: true,
			
			_create: function() {
				if (!$.support.iris) {
					return;
				}
				
				var self = this;
				var el = self.element;
				
				$.extend(self.options, el.data());
				
				if (self.options.type === 'hue') {
					return self._createHueOnly();
				}
				
				self.close = $.proxy(self.close, self);
				self.initialValue = el.val();
				
				el.addClass('wp-color-picker');
				
				if (legacyMode) {
					el.hide().wrap(pickerContainer);
					self.wrap = el.parent();
					self.toggler = $(colorResult)
						.insertBefore(el)
						.css({ backgroundColor: self.initialValue })
						.attr('title', __('Wähle Farbe', 'ub'))
						.attr('data-current', __('Aktuelle Farbe', 'ub'));
					self.pickerContainer = $(pickerHolder).insertAfter(el);
					self.button = $(pickerButton).addClass('hidden');
				} else {
					if (!el.parent('label').length) {
						el.wrap(pickerLabel);
						self.wrappingLabelText = $(screenReaderText)
							.insertBefore(el)
							.text(__('Farbwert', 'ub'));
					}
					
					self.wrappingLabel = el.parent();
					self.wrappingLabel.wrap(pickerContainer);
					self.wrap = self.wrappingLabel.parent();
					self.toggler = $(colorResult)
						.insertBefore(self.wrappingLabel)
						.css({ backgroundColor: self.initialValue });
					self.toggler.find('.wp-color-result-text').text(__('Wähle Farbe', 'ub'));
					self.pickerContainer = $(pickerHolder).insertAfter(self.wrappingLabel);
					self.button = $(pickerButton);
				}
				
				if (self.options.defaultColor) {
					self.button.addClass('wp-picker-default').val(__('Standard', 'ub'));
					if (!legacyMode) {
						self.button.attr('aria-label', __('Wähle Standardfarbe', 'ub'));
					}
				} else {
					self.button.addClass('wp-picker-clear').val(__('Leeren', 'ub'));
					if (!legacyMode) {
						self.button.attr('aria-label', __('Leere Farbe', 'ub'));
					}
				}
				
				if (legacyMode) {
					el.wrap('<span class="wp-picker-input-wrap" />').after(self.button);
				} else {
					self.wrappingLabel.wrap('<span class="wp-picker-input-wrap hidden" />').after(self.button);
					self.inputWrapper = el.closest('.wp-picker-input-wrap');
				}
				
				el.iris({
					target: self.pickerContainer,
					hide: self.options.hide,
					width: self.options.width,
					mode: self.options.mode,
					palettes: self.options.palettes,
					change: function(event, ui) {
						if (self.options.alpha) {
							self.toggler.css({ 'background-image': 'url(' + alphaBackground + ')' });
							
							if (legacyMode) {
								self.toggler.html('<span class="color-alpha" />');
							} else {
								self.toggler.css({ position: 'relative' });
								if (self.toggler.find('span.color-alpha').length === 0) {
									self.toggler.append('<span class="color-alpha" />');
								}
							}
							
							self.toggler.find('span.color-alpha').css({
								width: '30px',
								height: '24px',
								position: 'absolute',
								top: 0,
								left: 0,
								'border-top-left-radius': '2px',
								'border-bottom-left-radius': '2px',
								background: ui.color.toString()
							});
						} else {
							self.toggler.css({ backgroundColor: ui.color.toString() });
						}
						
						if (typeof self.options.change === 'function') {
							self.options.change.call(this, event, ui);
						}
					}
				});
				
				el.val(self.initialValue);
				self._addListeners();
				
				if (!self.options.hide) {
					self.toggler.click();
				}
			},
			
			_addListeners: function() {
				var self = this;
				
				self.wrap.on('click.wpcolorpicker', function(event) {
					event.stopPropagation();
				});
				
				self.toggler.on('click', function() {
					if (self.toggler.hasClass('wp-picker-open')) {
						self.close();
					} else {
						self.open();
					}
				});
				
				self.element.on('change', function(event) {
					if ($(this).val() === '' || self.element.hasClass('iris-error')) {
						if (self.options.alpha) {
							if (legacyMode) {
								self.toggler.removeAttr('style');
							}
							self.toggler.find('span.color-alpha').css('backgroundColor', '');
						} else {
							self.toggler.css('backgroundColor', '');
						}
						
						if ('function' === typeof self.options.clear) {
							self.options.clear.call(this, event);
						}
					}
				});
				
				self.button.on('click', function(event) {
					if ($(this).hasClass('wp-picker-clear')) {
						self.element.val('');
						
						if (self.options.alpha) {
							if (legacyMode) {
								self.toggler.removeAttr('style');
							}
							self.toggler.find('span.color-alpha').css('backgroundColor', '');
						} else {
							self.toggler.css('backgroundColor', '');
						}
						
						if ('function' === typeof self.options.clear) {
							self.options.clear.call(this, event);
						}
						
						self.element.trigger('change');
					} else if ($(this).hasClass('wp-picker-default')) {
						self.element.val(self.options.defaultColor).change();
					}
				});
			}
		});
		
		// Extend Iris widget for alpha channel support
		$.widget('a8c.iris', $.a8c.iris, {
			_create: function() {
				this._super();
				
				this.options.alpha = this.element.data('alpha') || false;
				
				if (!this.element.is(':input')) {
					this.options.alpha = false;
				}
				
				if (typeof this.options.alpha !== 'undefined' && this.options.alpha) {
					var self = this;
					var el = self.element;
					var stripAlpha = $('<div class="iris-strip iris-slider iris-alpha-slider"><div class="iris-slider-offset iris-slider-offset-alpha"></div></div>')
						.appendTo(self.picker.find('.iris-picker-inner'));
					
					var controls = {
						aContainer: stripAlpha,
						aSlider: stripAlpha.find('.iris-slider-offset-alpha')
					};
					
					if (typeof el.data('custom-width') !== 'undefined') {
						self.options.customWidth = parseInt(el.data('custom-width')) || 0;
					} else {
						self.options.customWidth = 100;
					}
					
					self.options.defaultWidth = el.width();
					
					if (self._color._alpha < 1 || self._color.toString().indexOf('rgb') !== -1) {
						el.width(parseInt(self.options.defaultWidth + self.options.customWidth));
					}
					
					$.each(controls, function(key, value) {
						self.controls[key] = value;
					});
					
					self.controls.square.css({ 'margin-right': '0' });
					
					var emptyWidth = self.picker.width() - self.controls.square.width() - 20;
					var stripsMargin = emptyWidth / 6;
					var stripsWidth = emptyWidth / 2 - stripsMargin;
					
					$.each(['aContainer', 'strip'], function(key, val) {
						self.controls[val].width(stripsWidth).css({ 'margin-left': stripsMargin + 'px' });
					});
					
					self._initControls();
					self._change();
				}
			},
			
			_initControls: function() {
				this._super();
				
				if (this.options.alpha) {
					var self = this;
					
					self.controls.aSlider.slider({
						orientation: 'vertical',
						min: 0,
						max: 100,
						step: 1,
						value: parseInt(self._color._alpha * 100),
						slide: function(event, ui) {
							self._color._alpha = parseFloat(ui.value / 100);
							self._change.apply(self, arguments);
						}
					});
				}
			},
			
			_change: function() {
				this._super();
				
				var self = this;
				var el = self.element;
				
				if (this.options.alpha) {
					var controls = self.controls;
					var alpha = parseInt(self._color._alpha * 100);
					var color = self._color.toRgb();
					var gradient = [
						'rgb(' + color.r + ',' + color.g + ',' + color.b + ') 0%',
						'rgba(' + color.r + ',' + color.g + ',' + color.b + ', 0) 100%'
					];
					var defaultWidth = self.options.defaultWidth;
					var customWidth = self.options.customWidth;
					var target = self.picker.closest('.wp-picker-container').find('.wp-color-result');
					
					controls.aContainer.css({
						background: 'linear-gradient(to bottom, ' + gradient.join(', ') + '), url(' + alphaBackground + ')'
					});
					
					if (target.hasClass('wp-picker-open')) {
						controls.aSlider.slider('value', alpha);
						
						if (self._color._alpha < 1) {
							controls.strip.attr(
								'style',
								controls.strip.attr('style').replace(
									/rgba\(([0-9]+,)(\s+)?([0-9]+,)(\s+)?([0-9]+)(,(\s+)?[0-9\.]+)\)/g,
									'rgb($1$3$5)'
								)
							);
							el.width(parseInt(defaultWidth + customWidth));
						} else {
							el.width(defaultWidth);
						}
					}
				}
				
				if (el.data('reset-alpha') || false) {
					self.picker.find('.iris-palette-container').on('click.palette', '.iris-palette', function() {
						self._color._alpha = 1;
						self.active = 'external';
						self._change();
					});
				}
				
				el.trigger('change');
			},
			
			_addInputListeners: function(input) {
				var self = this;
				var changeCallback = function(event) {
					var color = new Color(input.val());
					var val = input.val();
					
					input.removeClass('iris-error');
					
					if (color.error) {
						if (val !== '') {
							input.addClass('iris-error');
						}
					} else {
						if (color.toString() !== self._color.toString()) {
							if (event.type === 'keyup' && val.match(/^[0-9a-fA-F]{3}$/)) {
								return;
							}
							self._setOption('color', color.toString());
						}
					}
				};
				
				input.on('change', changeCallback).on('keyup', self._debounce(changeCallback, 100));
				
				if (self.options.hide) {
					input.on('focus', function() {
						self.show();
					});
				}
			}
		});
	}
})(jQuery);

// Auto-initialize color pickers with .color-picker class
jQuery(document).ready(function($) {
	$('.color-picker').wpColorPicker();
});
