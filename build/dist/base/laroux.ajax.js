/**
 * laroux.js - A jquery substitute for modern browsers (base bundle)
 *
 * @version v2.0.0
 * @link https://larukedi.github.io/laroux.js
 * @license Apache-2.0
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _larouxDeferredJs = require('./laroux.deferred.js');

var _larouxDeferredJs2 = _interopRequireDefault(_larouxDeferredJs);

var _larouxEventsJs = require('./laroux.events.js');

var _larouxEventsJs2 = _interopRequireDefault(_larouxEventsJs);

var _larouxHelpersJs = require('./laroux.helpers.js');

var _larouxHelpersJs2 = _interopRequireDefault(_larouxHelpersJs);

exports['default'] = (function () {
    'use strict';

    // ajax - partially taken from 'jquery in parts' project
    //        can be found at: https://github.com/mythz/jquip/
    var ajax = {
        corsDefault: false,

        wrappers: {
            registry: {
                'laroux.js': function larouxJs(data) {
                    if (!data.isSuccess) {
                        console.log('Error: ' + data.errorMessage);
                        return;
                    }

                    var obj;

                    if (data.format === 'json') {
                        obj = JSON.parse(data.object);
                    } else if (data.format === 'script') {
                        /*jshint evil:true */
                        /*jslint evil:true */
                        obj = eval(data.object);
                    } else {
                        // if (data.format === 'xml') {
                        obj = data.object;
                    }

                    return obj;
                }
            },

            set: function set(name, fnc) {
                ajax.wrappers.registry[name] = fnc;
            }
        },

        xDomainObject: false,
        xmlHttpRequestObject: null,
        xDomainRequestObject: null,
        xhr: function xhr(crossDomain) {
            if (ajax.xmlHttpRequestObject === null) {
                ajax.xmlHttpRequestObject = new XMLHttpRequest();
            }

            if (crossDomain) {
                if (!('withCredentials' in ajax.xmlHttpRequestObject) && typeof XDomainRequest !== 'undefined') {
                    ajax.xDomainObject = true;

                    if (ajax.xDomainRequestObject === null) {
                        ajax.xDomainRequestObject = new XDomainRequest();
                    }

                    return ajax.xDomainRequestObject;
                }
            } else {
                ajax.xDomainObject = false;
            }

            return ajax.xmlHttpRequestObject;
        },

        xhrResp: function xhrResp(xhr, options) {
            var wrapperFunction = xhr.getResponseHeader('X-Response-Wrapper-Function'),
                response;

            if (options.datatype === undefined) {
                response = xhr.responseText;
            } else if (options.datatype === 'json') {
                response = JSON.parse(xhr.responseText);
            } else if (options.datatype === 'script') {
                /*jshint evil:true */
                /*jslint evil:true */
                response = eval(xhr.responseText);
            } else if (options.datatype === 'xml') {
                response = xhr.responseXML;
            } else {
                response = xhr.responseText;
            }

            if (wrapperFunction && wrapperFunction in ajax.wrappers.registry) {
                response = ajax.wrappers.registry[wrapperFunction](response);
            }

            return {
                response: response,
                wrapperFunc: wrapperFunction
            };
        },

        makeRequest: function makeRequest(options) {
            var deferred = new _larouxDeferredJs2['default'](),
                cors = options.cors || ajax.corsDefault,
                xhr = ajax.xhr(cors),
                url = options.url,
                timer = null,
                n = 0;

            if (options.timeout !== undefined) {
                timer = setTimeout(function () {
                    xhr.abort();
                    deferred.invoke('timeout', options.url);
                    deferred.invoke('complete');
                }, options.timeout);
            }

            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    if (timer !== null) {
                        clearTimeout(timer);
                    }

                    if (xhr.status < 300) {
                        var res = null,
                            isSuccess = true;

                        try {
                            res = ajax.xhrResp(xhr, options);
                        } catch (e) {
                            deferred.invoke('fail', e, xhr);
                            _larouxEventsJs2['default'].invoke('ajaxError', [xhr, xhr.status, xhr.statusText, options]);
                            isSuccess = false;
                        }

                        if (isSuccess && res !== null) {
                            deferred.invoke('done', res.response, res.wrapperFunc);
                            _larouxEventsJs2['default'].invoke('ajaxSuccess', [xhr, res.response, res.wrapperFunc, options]);
                        }
                    } else {
                        deferred.invoke('fail', e, xhr);
                        _larouxEventsJs2['default'].invoke('ajaxError', [xhr, xhr.status, xhr.statusText, options]);
                    }

                    deferred.invoke('complete');
                    _larouxEventsJs2['default'].invoke('ajaxComplete', [xhr, xhr.statusText, options]);
                } else if (options.progress !== undefined) {
                    /*jslint plusplus: true */
                    options.progress(++n);
                }
            };

            if (options.getdata !== undefined && options.getdata !== null) {
                if (options.getdata.constructor === Object) {
                    var queryString = _larouxHelpersJs2['default'].buildQueryString(options.getdata);
                    if (queryString.length > 0) {
                        url += (url.indexOf('?') < 0 ? '?' : '&') + queryString;
                    }
                } else {
                    url += (url.indexOf('?') < 0 ? '?' : '&') + options.getdata;
                }
            }

            if (options.jsonp !== undefined) {
                url += (url.indexOf('?') < 0 ? '?' : '&') + 'jsonp=' + options.jsonp;
            }

            if (!ajax.xDomainObject) {
                xhr.open(options.type, url, true);
            } else {
                xhr.open(options.type, url);
            }

            try {
                if (options.xhrFields !== undefined) {
                    for (var i in options.xhrFields) {
                        if (!options.xhrFields.hasOwnProperty(i)) {
                            continue;
                        }

                        xhr[i] = options.xhrFields[i];
                    }
                }

                var headers = options.headers || {};

                if (!cors) {
                    headers['X-Requested-With'] = 'XMLHttpRequest';

                    if (options.wrapper) {
                        headers['X-Wrapper-Function'] = 'laroux.js';
                    }
                }

                for (var j in headers) {
                    if (!headers.hasOwnProperty(j)) {
                        continue;
                    }

                    xhr.setRequestHeader(j, headers[j]);
                }
            } catch (e) {
                console.log(e);
            }

            if (options.postdata === undefined || options.postdata === null) {
                xhr.send(null);
                return;
            }

            switch (options.postdatatype) {
                case 'json':
                    xhr.send(JSON.stringify(options.postdata));
                    break;
                case 'form':
                    xhr.send(_larouxHelpersJs2['default'].buildFormData(options.postdata));
                    break;
                default:
                    xhr.send(options.postdata);
                    break;
            }

            return deferred;
        },

        get: function get(path, values, cors) {
            return ajax.makeRequest({
                type: 'GET',
                url: path,
                datatype: 'html',
                getdata: values,
                wrapper: true,
                cors: cors || ajax.corsDefault
            });
        },

        getJson: function getJson(path, values, cors) {
            return ajax.makeRequest({
                type: 'GET',
                url: path,
                datatype: 'json',
                getdata: values,
                wrapper: true,
                cors: cors || ajax.corsDefault
            });
        },

        getJsonP: function getJsonP(path, values, method, cors) {
            return ajax.makeRequest({
                type: 'GET',
                url: path,
                datatype: 'script',
                getdata: values,
                jsonp: method,
                wrapper: false,
                cors: cors || ajax.corsDefault
            });
        },

        getScript: function getScript(path, values, cors) {
            return ajax.makeRequest({
                type: 'GET',
                url: path,
                datatype: 'script',
                getdata: values,
                wrapper: false,
                cors: cors || ajax.corsDefault
            });
        },

        post: function post(path, values, cors) {
            return ajax.makeRequest({
                type: 'POST',
                url: path,
                datatype: 'json',
                postdata: values,
                postdatatype: 'form',
                wrapper: true,
                cors: cors || ajax.corsDefault
            });
        },

        postJson: function postJson(path, values, cors) {
            return ajax.makeRequest({
                type: 'POST',
                url: path,
                datatype: 'json',
                postdata: values,
                postdatatype: 'json',
                headers: {
                    'Content-Type': 'application/json; charset=UTF-8'
                },
                wrapper: true,
                cors: cors || ajax.corsDefault
            });
        }
    };

    return ajax;
})();

module.exports = exports['default'];