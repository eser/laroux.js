(function(laroux) {
	// "use strict";

	// ui
	laroux.ui = {
		floatContainer: null,

		createFloatContainer: function() {
			if(!laroux.ui.floatContainer) {
				laroux.ui.floatContainer = laroux.dom.createElement('DIV', { id: 'floatDiv' }, '');
				document.body.insertBefore(laroux.ui.floatContainer, document.body.firstChild);
			}
		},

		createBox: function(id, xclass, message) {
			return laroux.dom.createElement('DIV', { id: id, class: xclass },
				message
			);
		},

		msgbox: function(timeout, message) {
			var id = laroux.helpers.getUniqueId();
			laroux.ui.floatContainer.appendChild(laroux.ui.createBox(id, 'msgbox', message));
			var obj = $('#' + id);
			$(obj).fadeIn('slow');
			laroux.timers.set(timeout, function(x) { $(x).fadeOut('slow'); }, obj);
		},
		
		autocomplete: function(obj, settings) {
			if(typeof $.ui.autocomplete !== 'undefined') {
				$.widget('custom.catcomplete', $.ui.autocomplete, {
					_renderMenu: function(ul, items) {
						var self = this,
						currentCategory = '';
						
						$.each(items, function(index, item) {
							if(typeof self.options.categoryfieldname !== 'undefined' && item[self.options.categoryfieldname] != currentCategory) {
								ul.append('<li class="ui-autocomplete-category">' + item[self.options.categoryfieldname] + '</li>');
								currentCategory = item[self.options.categoryfieldname];
							}
							
							var text = '<a><span class="label">' + item[self.options.labelfieldname] + '</span>';
							if(typeof self.options.descriptionfieldname !== 'undefined') {
								text += '<span class="desc">' + item[self.options.descriptionfieldname] + '</span></a>';
							}

							ul.append($('<li></li>').data('item.autocomplete', item).append(text));
							// self._renderItem(ul, item);
						});
					},
					dropdown: function() {
						this.element.focus();
						this.search('', null);
					}
				});
			}
			
			settings.select = function(event, ui) {
				if(typeof settings.hiddenfield !== 'undefined') {
					settings.hiddenfield.val(ui.item[settings.hiddenfieldname]);
				}
				
				if(typeof settings.onselect !== 'undefined') {
					settings.onselect(event, ui);
				}
			};
			
			obj.click(function() {
				var catcomplete = obj.data('catcomplete');
				catcomplete.search((catcomplete.options.alllist === true) ? '' : null, null);
			});

			obj.addClass('catcomplete');
			obj.catcomplete(settings);

			if(typeof settings.hiddenfield !== 'undefined') {
				for(x in settings.source) {
					if(settings.source[x][settings.hiddenfieldname] == settings.hiddenfield.val()) {
						obj.val(settings.source[x].label);
						break;
					}
				}
			}
		},
		
		datepicker: function(obj, settings) {
			settings.changeMonth = true;
			settings.changeYear = true;
			if(typeof settings.dateFormat == 'undefined') {
				settings.dateFormat = 'dd/mm/yy';
			}
			
			obj.datepicker(settings);
		}
	};

	laroux.ready(laroux.ui.createFloatContainer);

	laroux.popupFunc = function(message) {
		laroux.ui.msgbox(5, message);
	};

})(window.laroux);