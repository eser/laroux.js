window.laroux = window.$l = (function() {
	// "use strict";

	// core
	var laroux = {
		baseLocation: '',
		selectedMaster: '',
		popupFunc: alert,
		readyPassed: false,

		contentBegin: function(masterName, locationUrl) {
			laroux.baseLocation = locationUrl;
			laroux.selectedMaster = masterName;

			laroux.dom.loadAsyncElements();
			laroux.events.invoke('contentBegin');
		},

		contentEnd: function() {
			laroux.events.invoke('contentEnd');
			laroux.readyPassed = true;

			window.setInterval(laroux.timers.ontick, 500);
		},

		begin: function(fnc) {
			laroux.events.add('contentBegin', fnc);
		},

		ready: function(fnc) {
			if(!laroux.readyPassed) {
				laroux.events.add('contentEnd', fnc);
				return;
			}

			fnc();
		},

		extend: function(obj) {
			for(name in obj) {
				laroux[name] = obj[name];
			}
		}
	};

	// events
	laroux.events = {
		delegates: [],

		add: function(event, fnc) {
			laroux.events.delegates.push({ event: event, fnc: fnc });
		},

		invoke: function(event, args) {
			for(key in laroux.events.delegates) {
				if(laroux.events.delegates[key].event != event) {
					continue;
				}

				laroux.events.delegates[key].fnc(args);
			}
		},
	};

	// timers
	laroux.timers = {
		delegates: [],

		set: function(timeout, fnc, obj) {
			laroux.timers.delegates.push({
				timeout: timeout,
				fnc: fnc,
				obj: obj
			});
		},

		ontick: function() {
			var removeKeys = [];
			for(key in laroux.timers.delegates) {
				var keyObj = laroux.timers.delegates[key];

				if(keyObj.timeout == null) {
					keyObj.fnc(keyObj.obj);
				}
				else {
					keyObj.timeout -= 0.5;

					if(keyObj.timeout < 0) {
						keyObj.fnc(keyObj.obj);
						removeKeys.unshift(key);
					}
				}
			}

			for(key in removeKeys) {
				laroux.timers.delegates.splice(removeKeys[key], 1);
			}
		}
	};

	// triggers
	laroux.triggers = {
		delegates: [],
		list: [],

		set: function(condition, fnc, obj) {
			for(key in condition) {
				if(laroux.triggers.list.indexOf(condition[key]) == -1) {
					laroux.triggers.list.push(condition[key]);
				}
			}

			laroux.triggers.delegates.push({
				condition: condition,
				fnc: fnc,
				obj: obj
			});
		},

		ontrigger: function(triggerName, eventArgs) {
			var eventIdx = laroux.triggers.list.indexOf(triggerName);
			if(eventIdx != -1) {
				laroux.triggers.list.splice(eventIdx, 1);
			}

			var removeKeys = [];
			for(key in laroux.triggers.delegates) {
				var count = 0;
				var keyObj = laroux.triggers.delegates[key];

				for(conditionKey in keyObj.condition) {
					var conditionObj = keyObj.condition[conditionKey];

					if(laroux.triggers.list.indexOf(conditionObj) != -1) {
						count++;
						// break;
					}
				}

				if(count == 0) {
					keyObj.fnc(keyObj.obj, eventArgs);
					removeKeys.unshift(key);
				}
			}

			for(key in removeKeys) {
				laroux.triggers.delegates.splice(removeKeys[key], 1);
			}

			console.log('trigger name: ' + triggerName);
		}
	};

	// dom
	laroux.dom = {
		select: function(selector, parent) {
			if(typeof parent == 'undefined') {
				return document.querySelectorAll(selector);
			}

			return parent.querySelectorAll(selector);
			// return document.querySelectorAll.apply(document, arguments);
		},

		selectSingle: function(selector, parent) {
			if(typeof parent == 'undefined') {
				return document.querySelector(selector);
			}

			return parent.querySelector(selector);
			// return document.querySelector.apply(document, arguments);
		},

		eventHistory: { },
		setEvent: function(element, eventname, fnc) {
			var fncWrapper = function(e) {
				if(fnc(e, element) === false) {
					if(e.preventDefault) {
						e.preventDefault();
					}
					else if(window.event) {
						window.event.returnValue = false;
					}
				}
			};

			if(typeof laroux.dom.eventHistory[element] == 'undefined') {
				laroux.dom.eventHistory[element] = { };
			}
			if(typeof laroux.dom.eventHistory[element][eventname] != 'undefined') {
				if(element.removeEventListener) {
					element.removeEventListener(eventname, laroux.dom.eventHistory[element][eventname], false);
				}
				else if(element.detachEvent) {
					element.detachEvent('on' + eventname, laroux.dom.eventHistory[element][eventname]);
				}
			}
			laroux.dom.eventHistory[element][eventname] = fncWrapper;

			if(element.addEventListener) {
				element.addEventListener(eventname, fncWrapper, false);
			}
			else if(element.attachEvent) {
				element.attachEvent('on' + eventname, fncWrapper);
			}
		},

		unsetEvent: function(element, eventname) {
			if(typeof laroux.dom.eventHistory[element] == 'undefined') {
				return;
			}
			if(typeof laroux.dom.eventHistory[element][eventname] != 'undefined') {
				if(element.removeEventListener) {
					element.removeEventListener(eventname, laroux.dom.eventHistory[element][eventname], false);
				}
				else if(element.detachEvent) {
					element.detachEvent('on' + eventname, laroux.dom.eventHistory[element][eventname]);
				}
			}
			delete laroux.dom.eventHistory[element][eventname];
		},

		createElement: function(element, attributes, children) {
			var elem = document.createElement(element);

			if(typeof(attributes) == 'object') {
				for(key in attributes) {
					elem.setAttribute(key, attributes[key]);
				}
			}

			if(children !== null) {
				if(typeof children == 'string') {
					elem.innerHTML = children;
				}
				else if(typeof children == 'object') {
					for(i = 0; i < children.length; i++) {
						elem.appendChild(children[i]);
					}
				}
			}

			return elem;
		},

		loadImage: function() {
			for(i = 0; i < arguments.length; i++) {
				laroux.dom.createElement('IMG', { src: arguments[i] }, null);
			}
		},

		loadAsyncElements: function() {
			var asyncScripts = laroux.dom.select('data[class=\'laroux-async\']');
			for(var i = 0; i < asyncScripts.length; ++i) {
				var type = asyncScripts[i].getAttribute('data-type');

				switch(type) {
				case 'js':
					laroux.dom.loadAsyncScript(
						asyncScripts[i].getAttribute('value'),
						asyncScripts[i].getAttribute('data-trigger')
					);
					break;
				case 'css':
					laroux.dom.loadAsyncStyle(
						asyncScripts[i].getAttribute('value'),
						asyncScripts[i].getAttribute('data-trigger')
					);
					break;
				}
			}
		},

		loadAsyncScript: function(path, triggerName, async) {
			var elem = document.createElement('script');
			elem.type = 'text/javascript';
			elem.async = (typeof async != 'undefined') ? async : true;
			elem.src = path;

			var loaded = false;
			elem.onload = elem.onreadystatechange = function() {
				if((elem.readyState && elem.readyState !== 'complete' && elem.readyState !== 'loaded') || loaded) {
					return false;
				}

				elem.onload = elem.onreadystatechange = null;
				loaded = true;
				if(typeof triggerName != 'undefined' && triggerName != null) {
					if(typeof triggerName == 'function') {
						triggerName();
					}
					else {
						laroux.triggers.ontrigger(triggerName);
					}
				}
			};

			var head = document.getElementsByTagName('head')[0];
			head.appendChild(elem);
		},

		loadAsyncStyle: function(path, triggerName, async) {
			var elem = document.createElement('link');
			elem.type = 'text/css';
			elem.async = (typeof async != 'undefined') ? async : true;
			elem.href = path;
			elem.rel = 'stylesheet';
			
			var loaded = false;
			elem.onload = elem.onreadystatechange = function() {
				if((elem.readyState && elem.readyState !== 'complete' && elem.readyState !== 'loaded') || loaded) {
					return false;
				}
				
				elem.onload = elem.onreadystatechange = null;
				loaded = true;
				if(typeof triggerName != 'undefined' && triggerName != null) {
					if(typeof triggerName == 'function') {
						triggerName();
					}
					else {
						laroux.triggers.ontrigger(triggerName);
					}
				}
			};
			
			var head = document.getElementsByTagName('head')[0];
			head.appendChild(elem);
		},
		
		clear: function(element) {
			while(element.hasChildNodes()) {
				element.removeChild(element.firstChild);
			}
		},

		replace: function(element, content) {
			laroux.dom.clear(element);
			element.insertAdjacentHTML('afterbegin', content);
		},

		prepend: function(element, content) {
			element.insertAdjacentHTML('afterbegin', content);
		},
		
		append: function(element, content) {
			element.insertAdjacentHTML('beforeend', content);
		},

		remove: function(element) {
			if(element.parentElement != null) {
				element.parentElement.removeChild(element);
			}
		},
		
		cloneAppend: 0,
		cloneInsertAfter: 1,
		cloneInsertBefore: 2,

		clone: function(element, type, container, target) {
			var newElement = element.cloneNode(true);

			if(typeof container == 'undefined') {
				container = element.parentNode;
			}
			if(typeof target == 'undefined') {
				target = element;
			}

			if(typeof type == 'undefined' || type == laroux.dom.cloneAppend) {
				container.appendChild(newElement);
			}
			else if(type == laroux.dom.cloneInsertAfter) {
				container.insertBefore(newElement, target.nextSibling);
			}
			else { // type == laroux.dom.cloneInsertBefore
				container.insertBefore(newElement, target);
			}

			return newElement;
		},

		applyTemplate: function(element, model) {
			var domElements = Array.prototype.slice.call(element.querySelectorAll('*[data-repeat], *[data-bindings]'));
			domElements.push(element);

			for(var i = domElements.length - 1; i >= 0; i--) {
				var currentElement = domElements[i];
				var dataBindings = currentElement.getAttribute('data-bindings');
				var dataRepeat = currentElement.getAttribute('data-repeat');

				if(dataRepeat != null) {
					var repeatEval = eval('(' + dataRepeat + ')');
					var lastElement = null;
					var container = (typeof repeatEval['container'] != 'undefined') ? laroux.dom.selectSingle(repeatEval['container']) : currentElement.parentNode;

					if(typeof repeatEval['clearFirst'] != 'undefined' && repeatEval['clearFirst'] == true) {
						container.innerHTML = '';
					}

					for(key in repeatEval['items']) {
						var item = repeatEval['items'][key];
						var operations = (dataBindings != null) ? eval('(' + dataBindings + ')') : {};

						var newElement = laroux.dom.clone(currentElement, (lastElement == null) ? laroux.dom.cloneAppend : laroux.dom.cloneInsertAfter, container, lastElement);
						lastElement = newElement;

						laroux.dom.applyOperations(newElement, operations);
						newElement.removeAttribute('id');
						newElement.removeAttribute('data-repeat');
						if(dataBindings != null) {
							newElement.removeAttribute('data-bindings');
						}
					}
				}
				else {
					var operations = (dataBindings != null) ? eval('(' + dataBindings + ')') : {};
					laroux.dom.applyOperations(currentElement, operations);
					// newElement.removeAttribute('id');
					currentElement.removeAttribute('data-bindings');
				}
			}
		},

		applyOperations: function(element, operations) {
			for(operation in operations) {
				for(binding in operations[operation]) {
					var value = operations[operation][binding];
					
					switch(operation) {
					case 'setprop':
						if(binding.substring(0, 1) == '_') {
							element.setAttribute(binding.substring(1), value);
							continue;
						}

						if(binding == 'content') {
							element.innerHTML = value;
							continue;
						}
						break;
					case 'addprop':
						if(binding.substring(0, 1) == '_') {
							element.setAttribute(binding.substring(1), element.getAttribute(binding.substring(1)) + value);
							continue;
						}

						if(binding == 'content') {
							element.innerHTML += value;
							continue;
						}
						break;
					case 'removeprop':
						if(value.substring(0, 1) == '_') {
							element.removeAttribute(value.substring(1));
							continue;
						}
						
						if(value == 'content') {
							element.innerHTML = '';
							continue;
						}
						break;
					case 'addclass':
						laroux.css.addClass(element, value);
						continue;
						break;
					case 'removeclass':
						laroux.css.removeClass(element, value);
						break;
					case 'addstyle':
						laroux.css.setProperty(element, binding, value);
						continue;
						break;
					case 'removestyle':
						laroux.css.setProperty(element, value, 'inherit !important');
						break;
					case 'repeat':
						break;
					default:
						console.log(operation);
					}
				}
			}
		},

		cloneTemplate: function(element, model, type, container, target) {
			var newElement = laroux.dom.clone(element, type, container, target);
			laroux.dom.applyTemplate(newElement, model);

			return newElement;
		},

		applyDefaultTexts: function() {
			var focusFunc = function() {
				if(this.value == this.getAttribute('data-defaulttext')) {
					this.value = '';
				}
				// this.style['content'] = 'none';
			};
			
			var blurFunc = function() {
				if(this.value == '') {
					this.value = this.getAttribute('data-defaulttext');
					// this.style['content'] = 'attr(\'data-defaulttext\')';
				}
			};
			
			var domElements = document.body.querySelectorAll('*[data-defaulttext]');
			for(var i = domElements.length - 1; i >= 0; i--) {
				if(domElements[i].value == '') {
					domElements[i].value = domElements[i].getAttribute('data-defaulttext');
					// domElements[i].style['content'] = 'attr(\'data-defaulttext\')';
				}

				domElements[i].addEventListener('focus', focusFunc, false);
				domElements[i].addEventListener('blur', blurFunc, false);
			}
		}
	};

	// css
	laroux.css = {
		hasClass: function(element, className) {
			return element.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'));
		},

		addClass: function(element, className) {
			if(laroux.css.hasClass(element, className)) {
				return;
			}

			element.className += ' ' + className;
		},

		removeClass: function(element, className) {
			if(!laroux.css.hasClass(element, className)) {
				return;
			}

			element.className = element.className.replace(new RegExp('(\\s|^)' + className + '(\\s|$)'), ' ');
		},

		toggleClass: function(element, className) {
			if(!laroux.css.hasClass(element, className)) {
				element.className += ' ' + className;
				return;
			}

			element.className = element.className.replace(new RegExp('(\\s|^)' + className + '(\\s|$)'), ' ');
		},

		getProperty: function(element, styleName) {
			var style = window.getComputedStyle(element);

			return style.getPropertyValue(styleName);
		},

		setProperty: function(element, styleName, value) {
			var flag = false;
			var newStyleName = '';

			for(i = 0; i < styleName.length; i++) {
				if(styleName.charAt(i) == '-') {
					flag = true;
					continue;
				}

				newStyleName += (!flag) ? styleName.charAt(i) : styleName.charAt(i).toUpperCase();
				flag = false;
			}

			element.style[newStyleName] = value;
		}
	};

	// helpers
	laroux.helpers = {
		uniqueId: 0,

		getUniqueId: function() {
			return 'uid-' + (++laroux.helpers.uniqueId);
		},

		buildQueryString: function(values) {
			var uri = '';

			for(name in values) {
				if(typeof values[name] != 'function') {
					uri += '&' + escape(name) + '=' + escape(values[name]);
				}
			}

			return uri.substr(1);
		}
	};

	// cookies
	laroux.cookies = {
		get: function(name) {
			re = new RegExp(name + '=[^;]+', 'i');
			if(!document.cookie.match(re)) {
				return null;
			}

			return document.cookie.match(re)[0].split('=')[1];
		},

		set: function(name, value) {
			document.cookie = name + '=' + value + '; path=/';
		}
	};

	// forms
	laroux.forms = {
		ajaxForm: function(formobj, fnc, fncBegin) {
			laroux.dom.setEvent(formobj, 'submit', function() {
				if(typeof fncBegin != 'undefined') {
					fncBegin();
				}

				laroux.ajax.post(
					formobj.getAttribute('action'),
					laroux.forms.serialize(formobj),
					fnc
				);

				return false;
			});
		},

		isFormField: function(element) {
			if(element.tagName == 'SELECT') {
				return true;
			}

			if(element.tagName == 'INPUT') {
				var type = element.getAttribute('type').toUpperCase();

				if(type == 'FILE' || type == 'CHECKBOX' || type == 'RADIO' || type == 'TEXT' || type == 'PASSWORD' || type == 'HIDDEN') {
					return true;
				}

				return false;
			}

			if(element.tagName == 'TEXTAREA') {
				return true;
			}

			return false;
		},

		getFormFieldValue: function(element) {
			if(element.disabled == true) {
				return null;
			}

			if(element.tagName == 'SELECT') {
				return element.options[element.selectedIndex].value;
			}

			if(element.tagName == 'INPUT') {
				var type = element.getAttribute('type').toUpperCase();

				if(type == 'FILE') {
					return element.files[0];
				}

				if(type == 'CHECKBOX' || type == 'RADIO') {
					if(element.checked) {
						return element.value;
					}

					return null;
				}

				if(type == 'TEXT' || type == 'PASSWORD' || type == 'HIDDEN') {
					return element.value;
				}

				return null;
			}

			if(element.tagName == 'TEXTAREA') {
				return element.value;
			}

			return null;
		},

		setFormFieldValue: function(element, value) {
			if(element.disabled == true) {
				return;
			}

			if(element.tagName == 'SELECT') {
				for(option in element.options) {
					if(element.options[option].value == value) {
						element.selectedIndex = option;
						return;
					}
				}

				return;
			}

			if(element.tagName == 'INPUT') {
				var type = element.getAttribute('type').toUpperCase();

				if(type == 'FILE') {
					element.files[0] = value;
					return;
				}

				if(type == 'CHECKBOX' || type == 'RADIO') {
					if(value === true || value == element.value) {
						element.checked = true;
					}

					return;
				}

				if(type == 'TEXT' || type == 'PASSWORD' || type == 'HIDDEN') {
					element.value = value;
					return;
				}

				return;
			}

			if(element.tagName == 'TEXTAREA') {
				element.value = value;
				return;
			}
		},

		upload: function(formobj, url, successFnc) {
			$.ajax({
				url: url,
				data: laroux.forms.serializeFormData(formobj),
				cache: false,
				contentType: false,
				processData: false,
				type: 'POST',
				success: successFnc
			});
		},

		toggleFormEditing: function(formobj, value) {
			var selection = formobj.querySelectorAll('*[name]');

			for(selected = 0; selected < selection.length; selected++) {
				if(!laroux.forms.isFormField(selection[selected])) {
					continue;
				}

				if(!value) {
					selection[selected].setAttribute('disabled', 'disabled');
					continue;
				}

				selection[selected].removeAttribute('disabled');
			}
		},

		serializeFormData: function(formobj) {
			var formdata = new FormData();
			var selection = formobj.querySelectorAll('*[name]');

			for(selected = 0; selected < selection.length; selected++) {
				var value = laroux.forms.getFormFieldValue(selection[selected]);

				if(value != null) {
					formdata.append(selection[selected].getAttribute('name'), value);
				}
			}

			return formdata;
		},

		serialize: function(formobj) {
			var values = {};
			var selection = formobj.querySelectorAll('*[name]');

			for(selected = 0; selected < selection.length; selected++) {
				var value = laroux.forms.getFormFieldValue(selection[selected]);

				if(value != null) {
					values[selection[selected].getAttribute('name')] = value;
				}
			}

			return values;
		},

		deserialize: function(formobj, data) {
			var selection = formobj.querySelectorAll('*[name]');

			for(selected = 0; selected < selection.length; selected++) {
				laroux.forms.setFormFieldValue(selection[selected], data[selection[selected].getAttribute('name')]);
			}
		}
	};

	// storage
	laroux.storage = {
		data: [], // default with noframe

		install: function() {
			if(parent && parent.frames['hidden']) {
				if(parent.frames['hidden'].storage == undefined) {
					parent.frames['hidden'].storage = [];
				}

				laroux.storage.data = parent.frames['hidden'].storage;
			}
		},

		flush: function() {
			laroux.storage.data = [];
		},

		exists: function(key) {
			return (laroux.storage.data[key] != undefined);
		},

		set: function(key, value) {
			laroux.storage.data[key] = value;
		},

		get: function(key, value) {
			return laroux.storage.data[key];
		}
	};

	// ajax
	laroux.ajax = {
		_xhrf: null,
		xhrs: [
			function() { return new XMLHttpRequest(); },
			function() { return new ActiveXObject('Microsoft.XMLHTTP'); },
			function() { return new ActiveXObject('MSXML2.XMLHTTP.3.0'); },
			function() { return new ActiveXObject('MSXML2.XMLHTTP'); }
        ],

		_xhr: function() {
			if(laroux.ajax._xhrf != null) {
				return laroux.ajax._xhrf();
			}

			for(var i = 0, l = laroux.ajax.xhrs.length; i < l; i++) {
				try {
					var f = laroux.ajax.xhrs[i], req = f();
					if(req != null) {
						laroux.ajax._xhrf = f;
						return req;
					}
				}
				catch(e) {
				}
			}

			return function() { };
		},

		_xhrResp: function(xhr, dataType) {
			dataType = (dataType || xhr.getResponseHeader('Content-Type').split(';')[0]).toLowerCase();

			if(dataType.indexOf('json') >= 0){
				var j = false;

				if(window.JSON) {
					j = window.JSON['parse'](xhr.responseText);
				}
				else {
					j = eval(xhr.responseText);
				}

				return j;
			}

			if(dataType.indexOf('script') >= 0) {
				return eval(xhr.responseText);
			}

			if(dataType.indexOf('xml') >= 0) {
				return xhr.responseXML;
			}

			return xhr.responseText;
		},

		//! confusion between forms.formData and this
		formData: function(o) {
			var kvps = [], regEx = /%20/g;
			for(var k in o) {
				if(typeof o[k] != 'undefined') {
					kvps.push(encodeURIComponent(k).replace(regEx, '+') + '=' + encodeURIComponent(o[k].toString()).replace(regEx, '+'));
				}
			}

			return kvps.join('&');
		},

		makeRequest: function(url, o) {
			var xhr = laroux.ajax._xhr(), timer, n = 0;
			if(typeof url === 'object') {
				o = url;
			}
			else {
				o['url'] = url;
			}

			if(o.timeout) {
				timer = setTimeout(
					function() {
						xhr.abort();
						if(o.timeoutFn) {
							o.timeoutFn(o.url);
						}
					},
					o.timeout
				);
			}

			xhr.onreadystatechange = function() {
				if(xhr.readyState == 4) {
					if(timer) {
						clearTimeout(timer);
					}

					if(xhr.status < 300) {
						var res, decode = true, dt = o.dataType || '';
						try {
							res = laroux.ajax._xhrResp(xhr, dt, o);
						}
						catch(e) {
							decode = false;
							if(o.error) {
								o.error(xhr, xhr.status, xhr.statusText);
							}

							laroux.events.invoke('ajaxError', [xhr, xhr.statusText, o]);
						}

						if(o['success'] && decode && (dt.indexOf('json') >= 0 || !!res)) {
							o['success'](res);
						}

						laroux.events.invoke('ajaxSuccess', [xhr, res, o]);
					}
					else {
						if(o.error) {
							o.error(xhr, xhr.status, xhr.statusText);
						}

						laroux.events.invoke('ajaxError', [xhr, xhr.statusText, o]);
					}

					if(o['complete']) {
						o['complete'](xhr, xhr.statusText);
					}

					laroux.events.invoke('ajaxComplete', [xhr, o]);
				}
				else if(o['progress']) {
					o['progress'](++n);
				}
			};

			var url = o['url'], data = null;
			var isPost = o['type'] == 'POST' || o['type'] == 'PUT';
			if(o['data'] && o['processData'] && typeof o['data'] == 'object') {
				data = laroux.ajax.formData(o['data']);
			}

			if(!isPost && data) {
				url += ((url.indexOf('?') < 0) ? '?' : '&') + data;
				data = null;
			}

			xhr.open(o['type'], url);

			try {
				for(var i in o.headers) {
					xhr.setRequestHeader(i, o.headers[i]);
				}
			}
			catch(_) {
				console.log(_)
			}

			if(isPost) {
				if(o['contentType'].indexOf('json') >= 0) {
					data = o['data'];
				}

				xhr.setRequestHeader('Content-Type', o['contentType']);
			}

			xhr.send(data);
		},

		get: function(path, values, fnc) {
			laroux.ajax.makeRequest({
				type: 'GET',
				url: path,
				data: values,
				datatype: 'json',
				contentType: 'application/json; charset=UTF-8',
				userAgent: 'XMLHttpRequest',
				lang: 'en',
				processData: true,
				headers: { 'X-Requested-With': 'XMLHttpRequest' },
				success: function(data) {
					if(!data.isSuccess) {
						laroux.popupFunc('Error: ' + data.errorMessage);
						return;
					}

					if(fnc != null) {
						fnc(data.object);
					}
				}
			});
		},

		post: function(path, values, fnc) {
			laroux.ajax.makeRequest({
				type: 'POST',
				url: path,
				data: values,
				datatype: 'json',
				contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
				userAgent: 'XMLHttpRequest',
				lang: 'en',
				processData: true,
				headers: { 'X-Requested-With': 'XMLHttpRequest' },
				success: function(data) {
					if(!data.isSuccess) {
						laroux.popupFunc('Error: ' + data.errorMessage);
						return;
					}

					if(fnc != null) {
						fnc(data.object);
					}
				},
				error: function(data) {
					console.log(data);
				}
			});
		},

		//! confusion between loadScript and getScript
		getScript: function(path, fnc) {
			laroux.ajax.makeRequest({
				type: 'GET',
				url: path,
				data: undefined,
				datatype: 'script',
				contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
				userAgent: 'XMLHttpRequest',
				lang: 'en',
				processData: true,
				headers: { 'X-Requested-With': 'XMLHttpRequest' },
				success: fnc
			});
		}
	};
	
	// stack
	laroux.stack = function() {
		this.entries = {};

		this.add = function(id, entry) {
			this.entries[id] = entry;
		};

		this.addRange = function(entryArray) {
			for(entry in entryArray) {
				this.entries[entry] = entryArray[entry];
			}
		};

		this.clear = function() {
			this.entries = {};
		};

		this.length = function() {
			return Object.keys(this.entries).length;
		}
	};

	// initialization
	laroux.ready(laroux.dom.applyDefaultTexts);

	return laroux;
})();