import Deferred from './laroux.deferred.js';
import events from './laroux.events.js';
import helpers from './laroux.helpers.js';

export default (function () {
    'use strict';

    // ajax - partially taken from 'jquery in parts' project
    //        can be found at: https://github.com/mythz/jquip/
    let ajax = {
        corsDefault: false,

        xmlHttpRequestObject: null,
        xDomainRequestObject: null,
        xhr: function (crossDomain) {
            if (ajax.xmlHttpRequestObject === null) {
                ajax.xmlHttpRequestObject = new XMLHttpRequest();
            }

            if (crossDomain && !('withCredentials' in ajax.xmlHttpRequestObject) && global.XDomainRequest !== undefined) {
                if (ajax.xDomainRequestObject === null) {
                    ajax.xDomainRequestObject = new XDomainRequest();
                }

                return ajax.xDomainRequestObject;
            }

            return ajax.xmlHttpRequestObject;
        },

        xhrResp: function (xhr, options) {
            let response;

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

            return {
                response: response
            };
        },

        makeRequest: function (options) {
            let deferred = new Deferred(),
                cors = options.cors || ajax.corsDefault,
                xhr = ajax.xhr(cors),
                url = options.url,
                timer = null,
                n = 0;

            if (options.timeout !== undefined) {
                timer = setTimeout(
                    function () {
                        xhr.abort();
                        deferred.reject('timeout', options.url);
                    },
                    options.timeout
                );
            }

            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    if (timer !== null) {
                        clearTimeout(timer);
                    }

                    if (xhr.status < 300) {
                        let res = null,
                            isSuccess = true;

                        try {
                            res = ajax.xhrResp(xhr, options);
                        } catch (err) {
                            deferred.reject(err, xhr);
                            events.invoke('ajaxError', { exception: err, xhr: xhr });
                            isSuccess = false;
                        }

                        if (isSuccess && res !== null) {
                            deferred.resolve(res.response, xhr);
                            events.invoke('ajaxSuccess', { res: res, xhr: xhr });
                        }
                    } else {
                        deferred.reject(xhr);
                        events.invoke('ajaxError', xhr);
                    }

                    events.invoke('ajaxComplete', { xhr: xhr });
                } else if (options.progress !== undefined) {
                    /*jslint plusplus: true */
                    options.progress(++n);
                }
            };

            if (options.getdata !== undefined && options.getdata !== null) {
                if (options.getdata.constructor === Object) {
                    let queryString = helpers.buildQueryString(options.getdata);
                    if (queryString.length > 0) {
                        url += ((url.indexOf('?') < 0) ? '?' : '&') + queryString;
                    }
                } else {
                    url += ((url.indexOf('?') < 0) ? '?' : '&') + options.getdata;
                }
            }

            if (options.jsonp !== undefined) {
                url += ((url.indexOf('?') < 0) ? '?' : '&') + 'jsonp=' + options.jsonp;
            }

            if (xhr.constructor === XMLHttpRequest) {
                xhr.open(options.type, url, true);
            } else {
                xhr.open(options.type, url);
            }

            if (options.xhrFields !== undefined) {
                for (let i in options.xhrFields) {
                    if (!options.xhrFields.hasOwnProperty(i)) {
                        continue;
                    }

                    xhr[i] = options.xhrFields[i];
                }
            }

            let headers = options.headers || {};

            if (!cors) {
                headers['X-Requested-With'] = 'XMLHttpRequest';
            }

            for (let j in headers) {
                if (!headers.hasOwnProperty(j)) {
                    continue;
                }

                xhr.setRequestHeader(j, headers[j]);
            }

            if (options.postdata === undefined || options.postdata === null) {
                xhr.send(null);
                return deferred;
            }

            switch (options.postdatatype) {
                case 'json':
                    xhr.send(JSON.stringify(options.postdata));
                    break;
                case 'form':
                    xhr.send(helpers.buildFormData(options.postdata));
                    break;
                default:
                    xhr.send(options.postdata);
                    break;
            }

            return deferred;
        },

        get: function (path, values, cors) {
            return ajax.makeRequest({
                type: 'GET',
                url: path,
                datatype: 'html',
                getdata: values,
                cors: cors || ajax.corsDefault
            });
        },

        getJson: function (path, values, cors) {
            return ajax.makeRequest({
                type: 'GET',
                url: path,
                datatype: 'json',
                getdata: values,
                cors: cors || ajax.corsDefault
            });
        },

        getJsonP: function (path, values, method, cors) {
            return ajax.makeRequest({
                type: 'GET',
                url: path,
                datatype: 'script',
                getdata: values,
                jsonp: method,
                cors: cors || ajax.corsDefault
            });
        },

        getScript: function (path, values, cors) {
            return ajax.makeRequest({
                type: 'GET',
                url: path,
                datatype: 'script',
                getdata: values,
                cors: cors || ajax.corsDefault
            });
        },

        post: function (path, values, cors) {
            return ajax.makeRequest({
                type: 'POST',
                url: path,
                datatype: 'json',
                postdata: values,
                postdatatype: 'form',
                cors: cors || ajax.corsDefault
            });
        },

        postJson: function (path, values, cors) {
            return ajax.makeRequest({
                type: 'POST',
                url: path,
                datatype: 'json',
                postdata: values,
                postdatatype: 'json',
                headers: {
                    'Content-Type': 'application/json; charset=UTF-8'
                },
                cors: cors || ajax.corsDefault
            });
        }
    };

    return ajax;

})();
