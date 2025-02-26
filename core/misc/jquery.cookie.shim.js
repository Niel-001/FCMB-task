(function($, Drupal, cookies) {
    var isFunction = function isFunction(obj) {
        return Object.prototype.toString.call(obj) === '[object Function]';
    };
    var parseCookieValue = function parseCookieValue(value, parseJson) {
        if (value.indexOf('"') === 0) {
            value = value.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
        }
        try {
            value = decodeURIComponent(value.replace(/\+/g, ' '));
            return parseJson ? JSON.parse(value) : value;
        } catch (e) {}
    };
    var reader = function reader(cookieValue, cookieName, converter, readUnsanitized, parseJson) {
        var value = readUnsanitized ? cookieValue : parseCookieValue(cookieValue, parseJson);
        if (converter !== undefined && isFunction(converter)) {
            return converter(value, cookieName);
        }
        return value;
    };
    $.cookie = function(key) {
        var value = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
        var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;
        key = key && !$.cookie.raw ? encodeURIComponent(key) : key;
        if (value !== undefined && !isFunction(value)) {
            var attributes = Object.assign({}, $.cookie.defaults, options);
            if (typeof attributes.expires === 'string' && attributes.expires !== '') {
                attributes.expires = new Date(attributes.expires);
            }
            var cookieSetter = cookies.withConverter({
                write: function write(cookieValue) {
                    return encodeURIComponent(cookieValue);
                }
            });
            value = $.cookie.json && !$.cookie.raw ? JSON.stringify(value) : String(value);
            return cookieSetter.set(key, value, attributes);
        }
        var userProvidedConverter = value;
        var cookiesShim = cookies.withConverter({
            read: function read(cookieValue, cookieName) {
                return reader(cookieValue, cookieName, userProvidedConverter, $.cookie.raw, $.cookie.json);
            }
        });
        if (key !== undefined) {
            return cookiesShim.get(key);
        }
        var results = cookiesShim.get();
        Object.keys(results).forEach(function(resultKey) {
            if (results[resultKey] === undefined) {
                delete results[resultKey];
            }
        });
        return results;
    };
    $.cookie.defaults = Object.assign({
        path: ''
    }, cookies.defaults);
    $.cookie.json = false;
    $.cookie.raw = false;
    $.removeCookie = function(key, options) {
        cookies.remove(key, Object.assign({}, $.cookie.defaults, options));
        return !cookies.get(key);
    };
})(jQuery, Drupal, window.Cookies);