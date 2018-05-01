/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/javascript-data-store/src/jsds.js":
/*!********************************************************!*\
  !*** ./node_modules/javascript-data-store/src/jsds.js ***!
  \********************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("/*\n * Copyright (c) 2010 Matthew A. Taylor\n *\n * Permission is hereby granted, free of charge, to any person obtaining a copy\n * of this software and associated documentation files (the \"Software\"), to deal\n * in the Software without restriction, including without limitation the rights\n * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell\n * copies of the Software, and to permit persons to whom the Software is\n * furnished to do so, subject to the following conditions:\n *\n * The above copyright notice and this permission notice shall be included in\n * all copies or substantial portions of the Software.\n *\n * THE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\n * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\n * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\n * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\n * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\n * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN\n * THE SOFTWARE.\n */\n\nvar REGEX_DOT_G = /\\./g,\n    BSLASH_DOT = '\\.',\n    REGEX_STAR_G = /\\*/g,\n    ID_LENGTH = 16,\n\n// static export\nJSDS,\n\n// private props\nrandoms = [],\n\n// private functions\nstoreIt,\n    update,\n    mergeArraysIntoSet,\n    arrayContains,\n    arrayRemoveItem,\n    fire,\n    listenerApplies,\n    removeListener,\n    getCompleteKey,\n    pullOutKeys,\n    toRegex,\n    valueMatchesKeyString,\n    clone,\n    getValue,\n    getRandomId,\n    generateRandomId;\n\n/*************************/\n/* The JSDataStore Class */\n/*************************/\n\nfunction JSDataStore(id) {\n    // data stores\n    this._s = {};\n    // event listeners\n    this._l = {};\n    this.id = id;\n}\n\nJSDataStore.prototype = {\n\n    /**\n     * Stores data\n     *\n     * key {String}: the key to be used to store the data. The same key can be used to retrieve\n     *               the data\n     * val {Object}: Any value to be stored in the store\n     * opts {Object} (optional): options to be used when storing data:\n     *                          'update': if true, values already existing within objects and\n     *                                    arrays will not be clobbered\n     * returns {Object}: The last value stored within specified key or undefined\n     *\n     * (fires 'store' event)\n     */\n    set: function (key, val, opts /*optional*/) {\n        var result;\n        opts = opts || { update: false };\n        fire.call(this, 'set', {\n            key: key,\n            value: val,\n            id: this.id,\n            when: 'before',\n            args: Array.prototype.slice.call(arguments, 0, arguments.length)\n        });\n        result = storeIt(this._s, key, opts, val);\n        fire.call(this, 'set', {\n            key: key,\n            value: val,\n            id: this.id,\n            when: 'after',\n            result: this.get(key, { quiet: true })\n        });\n        return result;\n    },\n\n    /**\n     * Gets data back out of store\n     *\n     * key {String}: the key of the data you want back\n     * returns {Object}: the data or undefined if key doesn't exist\n     *\n     * (fires 'get' event)\n     */\n    get: function (key) {\n        var s = this._s,\n            keys,\n            i = 0,\n            j = 0,\n            opts,\n            result,\n            splitKeys,\n            args = Array.prototype.slice.call(arguments, 0, arguments.length);\n\n        opts = args[args.length - 1];\n        if (typeof opts === 'string') {\n            opts = {};\n        } else {\n            args.pop();\n        }\n\n        if (!opts.quiet) {\n            fire.call(this, 'get', {\n                key: key,\n                when: 'before',\n                args: args\n            });\n        }\n\n        if (args.length === 1 && key.indexOf(BSLASH_DOT) < 0) {\n            result = s[key];\n        } else {\n            if (args.length > 1) {\n                keys = [];\n                for (i = 0; i < args.length; i++) {\n                    if (args[i].indexOf(BSLASH_DOT) > -1) {\n                        splitKeys = args[i].split(BSLASH_DOT);\n                        for (j = 0; j < splitKeys.length; j++) {\n                            keys.push(splitKeys[j]);\n                        }\n                    } else {\n                        keys.push(args[i]);\n                    }\n                }\n            } else if (key.indexOf(BSLASH_DOT) > -1) {\n                keys = key.split(BSLASH_DOT);\n            }\n\n            result = getValue(s, keys);\n        }\n\n        if (!opts.quiet) {\n            fire.call(this, 'get', {\n                key: key,\n                value: result,\n                when: 'after',\n                result: result\n            });\n        }\n        return result;\n    },\n\n    /**\n     * Adds a listener to this store. The listener will be executed when an event of\n     * the specified type is emitted and all the conditions defined in the parameters\n     * are met.\n     *\n     * type {String}: the type of event to listen for ('store', 'get', 'clear', etc.)\n     * options {object}: an object that contains one or more of the following configurations:\n     *                  'callback': the function to be executed\n     *                  'scope': the scope object for the callback execution\n     *                  'key': the storage key to listen for. If specified only stores into this key will\n     *                          cause callback to be executed\n     *                  'when': 'before' or 'after' (default is 'after')\n     */\n    on: function (type, opts) {\n        var me = this,\n            cbid = getRandomId(),\n            key = opts.key,\n            fn = opts.callback,\n            scope = opts.scope || this,\n            when = opts.when || 'after';\n        if (!this._l[type]) {\n            this._l[type] = [];\n        }\n        this._l[type].push({ id: cbid, callback: fn, scope: scope, key: key, when: when });\n        return {\n            id: cbid,\n            remove: function () {\n                removeListener(me._l[type], cbid);\n            }\n        };\n    },\n\n    before: function (type, key, cb, scpe) {\n        var callback = cb,\n            scope = scpe;\n        // key is optional\n        if (typeof key === 'function') {\n            callback = key;\n            scope = cb;\n            key = undefined;\n        }\n        return this.on(type, {\n            callback: callback,\n            key: key,\n            when: 'before',\n            scope: scope\n        });\n    },\n\n    after: function (type, key, cb, scpe) {\n        var callback = cb,\n            scope = scpe;\n        // key is optional\n        if (typeof key === 'function') {\n            callback = key;\n            scope = cb;\n            key = undefined;\n        }\n        return this.on(type, {\n            callback: callback,\n            key: key,\n            when: 'after',\n            scope: scope\n        });\n    },\n\n    /**\n     * Removes all data from store\n     *\n     * (fires 'clear' event)\n     */\n    clear: function () {\n        this._s = {};\n        fire.call(this, 'clear');\n    },\n\n    /**\n     * Removes all internal references to this data store. Note that to entirely release\n     * store object for garbage collection, you must also set any local references to the\n     * store to null!\n     *\n     * (fires 'remove' and 'clear' events)\n     */\n    remove: function () {\n        var ltype, optsArray, opts, i;\n        this.clear();\n        delete JSDS._stores[this.id];\n        arrayRemoveItem(randoms, this.id);\n        fire.call(this, 'remove');\n    }\n};\n\n/*************************/\n/* Global JSDS namespace */\n/*************************/\n\nJSDS = {\n\n    _stores: {},\n\n    /**\n     * Create a new data store object. If no id is specified, a random id will be\n     * generated.\n     *\n     * id {String} (optional): to identify this store for events and later retrieval\n     */\n    create: function (id) {\n\n        id = id || getRandomId();\n\n        if (this._stores[id]) {\n            throw new Error('Cannot overwrite existing data store \"' + id + '\"!');\n        }\n\n        this._stores[id] = new JSDataStore(id);\n\n        return this._stores[id];\n    },\n\n    /**\n     * Retrieves an existing data store object by id\n     *\n     * id {String}: the id of the store to retrieve\n     * returns {JSDataStore} the data store\n     */\n    get: function (id) {\n        return this._stores[id];\n    },\n\n    /**\n     * Removes all data stores objects. Specifically, each JSDataStore object's remove()\n     * method is called, and all local references to each are deleted.\n     */\n    clear: function () {\n        var storeId;\n        for (storeId in this._stores) {\n            if (this._stores.hasOwnProperty(storeId)) {\n                this._stores[storeId].remove();\n                delete this._stores[storeId];\n            }\n        }\n        this._stores = {};\n    },\n\n    /**\n     * Returns a count of the existing data stores in memory\n     */\n    count: function () {\n        var cnt = 0,\n            p;\n        for (p in this._stores) {\n            if (this._stores.hasOwnProperty(p)) {\n                cnt++;\n            }\n        }\n        return cnt;\n    },\n\n    /**\n     * Returns a list of ids [String] for all data store obects in memory\n     */\n    ids: function () {\n        var id,\n            ids = [];\n        for (id in this._stores) {\n            if (this._stores.hasOwnProperty(id)) {\n                ids.push(id);\n            }\n        }\n        return ids;\n    }\n};\n\n/*****************/\n/* PRIVATE STUFF */\n/*****************/\n\n// recursive store function\nstoreIt = function (store, key, opts, val, oldVal /*optional*/) {\n    var result, keys, oldKey;\n    if (key.indexOf(BSLASH_DOT) >= 0) {\n        keys = key.split('.');\n        oldVal = store[keys[0]] ? clone(store[keys[0]]) : undefined;\n        oldKey = keys.shift();\n        if (store[oldKey] === undefined) {\n            store[oldKey] = {};\n        }\n        return storeIt(store[oldKey], keys.join('.'), opts, val, oldVal);\n    }\n    result = oldVal ? oldVal[key] : store[key];\n    // if this is an update, and there is an old value to update\n    if (opts.update) {\n        update(store, val, key);\n    }\n    // if not an update, just overwrite the old value\n    else {\n            store[key] = val;\n        }\n    return result;\n};\n\n// recursive update function used to overwrite values within the store without\n// clobbering properties of objects\nupdate = function (store, val, key) {\n    var vprop;\n    if (typeof val !== 'object' || val instanceof Array) {\n        if (store[key] && val instanceof Array) {\n            mergeArraysIntoSet(store[key], val);\n        } else {\n            store[key] = val;\n        }\n    } else {\n        for (vprop in val) {\n            if (val.hasOwnProperty(vprop)) {\n                if (!store[key]) {\n                    store[key] = {};\n                }\n                if (store[key].hasOwnProperty(vprop)) {\n                    update(store[key], val[vprop], vprop);\n                } else {\n                    store[key][vprop] = val[vprop];\n                }\n            }\n        }\n    }\n};\n\n// merge two arrays without duplicate values\nmergeArraysIntoSet = function (lhs, rhs) {\n    var i = 0;\n    for (; i < rhs.length; i++) {\n        if (!arrayContains(lhs, rhs[i])) {\n            lhs.push(rhs[i]);\n        }\n    }\n};\n\n// internal utility function\narrayContains = function (arr, val, comparator /* optional */) {\n    var i = 0;\n    comparator = comparator || function (lhs, rhs) {\n        return lhs === rhs;\n    };\n    for (; i < arr.length; i++) {\n        if (comparator(arr[i], val)) {\n            return true;\n        }\n    }\n    return false;\n};\n\narrayRemoveItem = function (arr, item) {\n    var i, needle;\n    for (i = 0; i < arr.length; i++) {\n        if (arr[i] === item) {\n            needle = i;\n            break;\n        }\n    }\n    if (needle) {\n        arr.splice(needle, 1);\n    }\n};\n\n// fire an event of 'type' with included arguments to be passed to listeners functions\n// WARNING: this function must be invoked as fire.call(scope, type, args) because it uses 'this'.\n// The reason is so this function is not publicly exposed on JSDS instances\nfire = function (type, fireOptions) {\n    var i,\n        opts,\n        scope,\n        listeners,\n        pulledKeys,\n        listeners = this._l[type] || [];\n\n    fireOptions = fireOptions || {};\n\n    if (listeners.length) {\n        for (i = 0; i < listeners.length; i++) {\n            opts = listeners[i];\n            if (listenerApplies.call(this, opts, fireOptions)) {\n                scope = opts.scope || this;\n                if (opts.key && fireOptions) {\n                    if (opts.key.indexOf('*') >= 0) {\n                        pulledKeys = pullOutKeys(fireOptions.value);\n                        fireOptions.value = {};\n                        fireOptions.value.key = fireOptions.key + pulledKeys;\n                        fireOptions.value.value = getValue(this._s, fireOptions.value.key.split('.'));\n                    } else {\n                        fireOptions.value = getValue(this._s, opts.key.split('.'));\n                    }\n                }\n                if (fireOptions.args) {\n                    opts.callback.apply(scope, fireOptions.args);\n                } else if (fireOptions.result) {\n                    opts.callback.call(scope, fireOptions.result);\n                } else {\n                    opts.callback.call(scope, fireOptions.result);\n                }\n            }\n        }\n    }\n};\n\n// WARNING: this function must be invoked as listenerApplies.call(scope, listener, crit) because it uses 'this'.\n// The reason is so this function is not publicly exposed on JSDS instances\nlistenerApplies = function (listener, crit) {\n    var result = false,\n        last,\n        sub,\n        k,\n        replacedKey,\n        breakout = false;\n    if (listener.when && crit.when) {\n        if (listener.when !== crit.when) {\n            return false;\n        }\n    }\n    if (!listener.key || !crit) {\n        return true;\n    }\n    if (!crit.key || crit.key.match(toRegex(listener.key))) {\n        return true;\n    }\n    last = crit.key.length;\n    while (!breakout) {\n        sub = crit.key.substr(0, last);\n        last = sub.lastIndexOf(BSLASH_DOT);\n        if (last < 0) {\n            k = sub;\n            breakout = true;\n        } else {\n            k = sub.substr(0, last);\n        }\n        if (listener.key.indexOf('*') === 0) {\n            return valueMatchesKeyString(crit.value, listener.key.replace(/\\*/, crit.key).substr(crit.key.length + 1));\n        } else if (listener.key.indexOf('*') > 0) {\n            replacedKey = getCompleteKey(crit);\n            return toRegex(replacedKey).match(listener.key);\n        }\n        return valueMatchesKeyString(crit.value, listener.key.substr(crit.key.length + 1));\n    }\n    return result;\n};\n\nremoveListener = function (listeners, id) {\n    var i, l, needle;\n    for (i = 0; i < listeners.length; i++) {\n        l = listeners[i];\n        if (l.id && l.id === id) {\n            needle = i;\n            break;\n        }\n    }\n    if (typeof needle !== 'undefined') {\n        listeners.splice(needle, 1);\n    }\n};\n\ngetCompleteKey = function (o) {\n    var val = o.value,\n        key = o.key;\n    return key + pullOutKeys(val);\n};\n\npullOutKeys = function (v) {\n    var p,\n        res = '';\n    for (p in v) {\n        if (v.hasOwnProperty(p)) {\n            res += '.' + p;\n            if (typeof v[p] === 'object' && !(v[p] instanceof Array)) {\n                res += pullOutKeys(v[p]);\n            }\n        }\n    }\n    return res;\n};\n\ntoRegex = function (s) {\n    return s.replace(REGEX_DOT_G, '\\\\.').replace(REGEX_STAR_G, '\\.*');\n};\n\nvalueMatchesKeyString = function (val, key) {\n    var p,\n        i = 0,\n        keys = key.split('.');\n    for (p in val) {\n        if (val.hasOwnProperty(p)) {\n            if (keys[i] === '*' || p === keys[i]) {\n                if (typeof val[p] === 'object' && !(val[p] instanceof Array)) {\n                    return valueMatchesKeyString(val[p], keys.slice(i + 1).join('.'));\n                } else {\n                    return true;\n                }\n            }\n        }\n        i++;\n    }\n    return false;\n};\n\n// used to copy branches within the store. Object and array friendly\nclone = function (val) {\n    var newObj, i, prop;\n    if (val instanceof Array) {\n        newObj = [];\n        for (i = 0; i < val.length; i++) {\n            newObj[i] = clone(val[i]);\n        }\n    } else if (typeof val === 'object') {\n        newObj = {};\n        for (prop in val) {\n            if (val.hasOwnProperty(prop)) {\n                newObj[prop] = clone(val[prop]);\n            }\n        }\n    } else {\n        return val;\n    }\n    return newObj;\n};\n\n// returns a value from a store given an array of keys that is meant to describe depth\n// within the storage tree\ngetValue = function (store, keys) {\n    var key = keys.shift(),\n        endKey,\n        arrResult,\n        p,\n        keysClone;\n    if (key === '*') {\n        arrResult = [];\n        for (p in store) {\n            if (store.hasOwnProperty(p)) {\n                keysClone = clone(keys);\n                arrResult.push(getValue(store[p], keysClone));\n            }\n        }\n        return arrResult;\n    }\n    if (keys[0] && store[key] && (store[key][keys[0]] || keys[0] === '*')) {\n        return getValue(store[key], keys);\n    } else {\n        if (keys.length) {\n            endKey = keys[0];\n        } else {\n            endKey = key;\n        }\n        return store[endKey];\n    }\n};\n\ngenerateRandomId = function (length) {\n    var text = \"\",\n        i,\n        possible = \"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz\";\n    for (i = 0; i < length; i++) {\n        text += possible.charAt(Math.floor(Math.random() * possible.length));\n    }\n    return text;\n};\n\ngetRandomId = function () {\n    var id = generateRandomId(ID_LENGTH);\n    // no duplicate ids allowed\n    while (arrayContains(randoms, id)) {\n        id = generateRandomId(ID_LENGTH);\n    }\n    randoms.push(id);\n    return id;\n};\n\nmodule.exports = JSDS;\n\n//# sourceURL=webpack:///./node_modules/javascript-data-store/src/jsds.js?");

/***/ }),

/***/ "./src/blogs/how-do-grid-cells-work/firingFields.js":
/*!**********************************************************!*\
  !*** ./src/blogs/how-do-grid-cells-work/firingFields.js ***!
  \**********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("let utils = __webpack_require__(/*! ../../widgets/utils */ \"./src/widgets/utils.js\");\nlet html = __webpack_require__(/*! ./firingFields.tmpl.html */ \"./src/blogs/how-do-grid-cells-work/firingFields.tmpl.html\");\nlet JSDS = __webpack_require__(/*! JSDS */ \"./node_modules/javascript-data-store/src/jsds.js\");\nlet FiringPatch = __webpack_require__(/*! ./firingPatch */ \"./src/blogs/how-do-grid-cells-work/firingPatch.js\");\n\n//\n// colors for... [[ background, agent, big circle, small circle ]]\n//\nlet colors = [[\"rgba(0, 0, 0, 1.0)\", \"rgba(255, 255, 255, 1.0)\", \"rgba(255,   0,   0, 0.1)\", \"rgba(255, 0, 0, 1.0)\"], [\"rgba(0, 0, 0, 1.0)\", \"rgba(255, 255, 255, 1.0)\", \"rgba(55, 255, 255, 0.1)\", \"rgba(55, 255, 255, 1.0)\"], [\"rgba(255, 255, 255, 1.0)\", \"rgba(0, 0, 0, 1.0)\", \"rgba(55, 0, 255, 0.1)\", \"rgba(55, 0, 255, 1.0)\"], [\"rgba(255, 255, 255, 1.0)\", \"rgba(0, 0, 0, 1.0)\", \"rgba(255, 0, 0, 0.01)\", \"rgba(255, 0, 0, 1.0)\"]];\n\nlet jsds = JSDS.create('grid-cell-firing-fields');\n\nlet mod = function (a, b) {\n    return (a % b + b) % b;\n};\n\nif (!Number.prototype.mod) {\n    Number.prototype.mod = function (b) {\n        return (this % b + b) % b;\n    };\n}\n\nlet bind = function (that, f) {\n    return function () {\n        return f.apply(that, arguments);\n    };\n};\n\nif (!Array.prototype.last) {\n    Array.prototype.last = function () {\n        return this[this.length - 1];\n    };\n}\n\nlet extractMousePosition = function (e) {\n    let posx = 0;\n    let posy = 0;\n    if (!e) e = window.event;\n    if (e.pageX || e.pageY) {\n        posx = e.pageX;\n        posy = e.pageY;\n    } else if (e.clientX || e.clientY) {\n        posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;\n        posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;\n    }\n    return [posx, posy];\n};\n\nlet Stage = function (canvasElement) {\n    let canvas = canvasElement;\n    let ctx = canvas.getContext('2d');\n\n    this.size = function () {\n        return [canvas.width, canvas.height];\n    };\n\n    this.pixel = function (position, color) {\n        ctx.fillStyle = color;\n        ctx.fillRect(position[0], position[1], 2, 2);\n    };\n\n    this.rect = function (position, size, color) {\n        ctx.fillStyle = color;\n        ctx.fillRect(position[0], position[1], size[0], size[1]);\n    };\n\n    this.circle = function (position, radius, color) {\n        ctx.fillStyle = color;\n        hidden_ctx.beginPath();\n        hidden_ctx.arc(position[0], position[1], radius, 0, 2 * Math.PI);\n        hidden_ctx.fill();\n    };\n\n    this.clear = function () {\n        ctx.clearRect(0, 0, canvas.width, canvas.height);\n    };\n\n    this.imshow = function (imagedata) {\n        ctx.putImageData(imageata, 0, 0);\n    };\n};\n\nlet makeObservable = function (obj) {\n    let callbacks = {};\n\n    obj.on = function (type, f) {\n        (callbacks[type] = callbacks[type] || []).push(f);\n        return obj;\n    };\n\n    obj.fire = function (type, data) {\n        let args = [].slice.call(arguments, 1);\n        (callbacks[type] || []).map(function (f) {\n            f.apply(obj, args || null);\n        });\n\n        (callbacks[\"any\"] || []).map(function (f) {\n            f.apply(obj, [type].concat(args));\n        });\n        return obj;\n    };\n\n    obj.fireMany = function (events) {\n        let that = this;\n        events.map(function (args) {\n            that.fire.apply(that, args);\n        });\n    };\n\n    obj.onAny = function (f) {\n        (callbacks[\"any\"] = callbacks[\"any\"] || []).push(f);\n        return obj;\n    };\n\n    return obj;\n};\n\nlet beep = function () {\n    let context = new AudioContext();\n    let o = new OscillatorNode(context);\n    let g = context.createGain();\n    o.connect(g);\n    g.connect(context.destination);\n    o.connect(g);\n    g.connect(context.destination);\n    o.start(0);\n    g.gain.linearRampToValueAtTime(0, context.currentTime);\n\n    return function () {\n        g.gain.linearRampToValueAtTime(1, context.currentTime);\n        g.gain.exponentialRampToValueAtTime(0.00001, context.currentTime + 0.04);\n        g.gain.linearRampToValueAtTime(0, context.currentTime + 0.4);\n    };\n}();\n\nlet create_firing_field = function (B, v, num_fields, r) {\n    let [w, h] = num_fields;\n    let firing_field = [];\n\n    w = parseInt(w / 2);\n    h = parseInt(h / 2);\n    for (let x = -w; x < w; x++) {\n        for (let y = -h; y < h; y++) {\n            cx = x * B[0][0] + y * B[0][1] + v[0];\n            cy = x * B[1][0] + y * B[1][1] + v[1];\n            patch = new FiringPatch({\n                \"id\": [x, y],\n                \"center\": [cx, cy],\n                \"radius\": r });\n            firing_field.push(patch);\n        }\n    }\n    return firing_field;\n};\n\n// Standard Normal variate using Box-Muller transform.\nlet randn_bm = function () {\n    let u = 0,\n        v = 0;\n    while (u === 0) u = Math.random(); //Converting [0,1) to (0,1)\n    while (v === 0) v = Math.random();\n    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);\n};\n\nlet random_torus_walk = function (d, w, h, speed) {\n    let X = [];\n    let V = [];\n\n    let x = [0.5 * w, 0.5 * h];\n\n    X.push(x.slice());\n    let v = [0.0, 0.0];\n    let theta = 0.0;\n\n    for (let t = 0; t < d; t++) {\n        theta += randn_bm() / 4;\n        v[0] = speed * Math.cos(theta);\n        v[1] = speed * Math.sin(theta);\n        x[0] += v[0];\n        x[1] += v[1];\n        x[0] = mod(x[0], w);\n        x[1] = mod(x[1], h);\n        X.push(x.slice());\n        V.push(v.slice());\n    }\n\n    return [X, V];\n};\n\nfunction redraw($el, data, currentLocation) {\n\n    let keys = Object.keys(data);\n\n    function treatCircle(points, key, radius, color) {\n        points.attr('cx', d => d.x).attr('cy', d => d.y).attr('r', radius).attr('fill', color);\n    }\n\n    for (let key of keys) {\n        let $dotGroup = $el.select('g#group-' + key + ' g.dots');\n        let $fuzzGroup = $el.select('g#group-' + key + ' g.fuzz');\n\n        // Update\n        let $dots = $dotGroup.selectAll('circle').data(data[key]);\n        treatCircle($dots, key, 1, colors[key][3]);\n        let $fuzz = $fuzzGroup.selectAll('circle').data(data[key]);\n        treatCircle($fuzz, key, 10, colors[key][2]);\n\n        // Enter\n        let $newDots = $dots.enter().append('circle');\n        treatCircle($newDots, key, 1, colors[key][3]);\n        let $newFuzz = $fuzz.enter().append('circle');\n        treatCircle($newFuzz, key, 10, colors[key][2]);\n        // Exit\n        $dots.exit().remove();\n        $fuzz.exit().remove();\n    }\n\n    $el.select('#current-location').attr('cx', currentLocation.x).attr('cy', currentLocation.y).attr('r', 10).attr('stroke', 'red').attr('stroke-width', '2px').attr('fill', 'none');\n}\n\nfunction prepSvg($svg, keys) {\n    $svg.attr('width', 300).attr('height', 300);\n\n    let $gcGroups = $svg.selectAll('g.grid-cell').data(keys).enter().append('g').attr('id', key => 'group-' + key).attr('class', 'grid-cell');\n\n    $gcGroups.append('g').attr('class', 'dots');\n    $gcGroups.append('g').attr('class', 'fuzz');\n}\n\nfunction goSvg(elId) {\n    let $svg = d3.select('#' + elId + ' svg');\n\n    prepSvg($svg, [\"0\", \"1\", \"2\"]);\n\n    jsds.after('set', 'spikes', () => {\n        redraw($svg, jsds.get('spikes'), jsds.get('currentLocation'));\n    });\n}\n\nmodule.exports = elId => {\n\n    utils.loadHtml(html.default, elId, () => {\n\n        let mouseOver = false;\n\n        let $speedSlider = $('#speed');\n\n        let w = 300;\n        let h = 300;\n\n        let zeros = function (dimensions) {\n            let array = [];\n\n            for (let i = 0; i < dimensions[0]; ++i) {\n                array.push(dimensions.length == 1 ? 0 : zeros(dimensions.slice(1)));\n            }\n\n            return array;\n        };\n\n        let t = 0;\n        let grid_cells = [];\n\n        let d = 1000000;\n        let [X, V] = random_torus_walk(d, w, h, 2.0);\n        let speed = parseInt($speedSlider.val());\n\n        let mx = X[t][0];\n        let my = X[t][1];\n\n        let theta = 1.43;\n        let c = 110;\n        grid_cells.push(create_firing_field([[c * Math.cos(theta), c * Math.cos(theta + Math.PI / 3.0)], [c * Math.sin(theta), c * Math.sin(theta + Math.PI / 3.0)]], [0, 0], [20, 20], 60));\n\n        theta = 0.43;\n        c = 115;\n        grid_cells.push(create_firing_field([[c * Math.cos(theta), c * Math.cos(theta + Math.PI / 3.0)], [c * Math.sin(theta), c * Math.sin(theta + Math.PI / 3.0)]], [10, 0], [20, 20], 70));\n\n        grid_cells.push(create_firing_field([[100, 0], [0, 100]], [150, 150], [20, 20], 100));\n\n        jsds.set('gridCells', grid_cells);\n\n        function updateLocation(x, y) {\n            let loc = { x: x, y: y };\n            jsds.set('currentLocation', loc);\n\n            for (var gcId = 0; gcId < grid_cells.length; gcId++) {\n                let gc_id = gcId.toString();\n                let gcStore = jsds.get('spikes.' + gc_id) || [];\n                for (let f of grid_cells[gcId]) {\n                    if (f.spike([x, y])) {\n                        gcStore.push(loc);\n                        // beep()\n                    }\n                }\n                if (gcStore.length) {\n                    let key = 'spikes.' + gc_id.toString();\n                    jsds.set(key, gcStore);\n                }\n            }\n\n            t += 1;\n        }\n\n        function startTimer(speed) {\n            // If speed is larger than .5 second, we'll assume they just want to stop.\n            if (speed >= 500) speed = 99999999;\n            return setInterval(() => {\n                mx = X[t % d][0];\n                my = X[t % d][1];\n                updateLocation(mx, my);\n            }, speed);\n        }\n\n        goSvg(elId);\n\n        $speedSlider.on('input', () => {\n            clearInterval(timerHandle);\n            let speed = parseInt($speedSlider.val());\n            console.log(speed);\n            timerHandle = startTimer(speed);\n        });\n\n        let timerHandle = startTimer(speed);\n    });\n};\n\n//# sourceURL=webpack:///./src/blogs/how-do-grid-cells-work/firingFields.js?");

/***/ }),

/***/ "./src/blogs/how-do-grid-cells-work/firingFields.tmpl.html":
/*!*****************************************************************!*\
  !*** ./src/blogs/how-do-grid-cells-work/firingFields.tmpl.html ***!
  \*****************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony default export */ __webpack_exports__[\"default\"] = (`<svg style=\"stroke-width: 0px; background-color: grey;\">\n    <circle id=\"current-location\"></circle>\n</svg>\n\n<div>\n    slow <input type=\"range\" id=\"speed\" style=\"direction:rtl\" min=\"1\" max=\"500\" step=\"1\" value=\"100\"> fast\n</div>\n`);\n\n//# sourceURL=webpack:///./src/blogs/how-do-grid-cells-work/firingFields.tmpl.html?");

/***/ }),

/***/ "./src/blogs/how-do-grid-cells-work/firingPatch.js":
/*!*********************************************************!*\
  !*** ./src/blogs/how-do-grid-cells-work/firingPatch.js ***!
  \*********************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("let dist = function (a, b) {\n    return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2);\n};\n\nclass FiringPatch {\n\n    constructor(params) {\n        this.id = params.id;\n        this.center = params.center;\n        this.radius = params.radius;\n    }\n\n    prob(p) {\n        let c = this.center;\n        let r = this.radius;\n        let d = dist(p, c);\n\n        if (d < r) return Math.exp(-(d ^ 2) / 10.);else return 0;\n    }\n\n    spike(p) {\n        return Math.random() < this.prob(p);\n    }\n\n    getId() {\n        return this.id.toString();\n    }\n}\n\nmodule.exports = FiringPatch;\n\n//# sourceURL=webpack:///./src/blogs/how-do-grid-cells-work/firingPatch.js?");

/***/ }),

/***/ "./src/blogs/how-do-grid-cells-work/index.js":
/*!***************************************************!*\
  !*** ./src/blogs/how-do-grid-cells-work/index.js ***!
  \***************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("window.BHTMS = {\n    gridCellFiringFields: __webpack_require__(/*! ./firingFields */ \"./src/blogs/how-do-grid-cells-work/firingFields.js\")\n};\n\n//# sourceURL=webpack:///./src/blogs/how-do-grid-cells-work/index.js?");

/***/ }),

/***/ "./src/widgets/utils.js":
/*!******************************!*\
  !*** ./src/widgets/utils.js ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("// Loads given html into an element, calls the cb one time when loaded.\nfunction loadHtml(html, elementId, cb) {\n    let $el = $('#' + elementId);\n    $el.one('DOMNodeInserted', () => {\n        cb();\n    });\n    $el.html(html);\n}\n\nfunction getRandomInt(max) {\n    return Math.floor(Math.random() * Math.floor(max));\n}\n\nfunction precisionRound(number, precision) {\n    let factor = Math.pow(10, precision);\n    return Math.round(number * factor) / factor;\n}\n\nfunction getRandomArbitrary(min, max) {\n    return Math.random() * (max - min) + min;\n}\n\nmodule.exports = {\n    loadHtml: loadHtml,\n    getRandomInt: getRandomInt,\n    getRandomArbitrary: getRandomArbitrary,\n    precisionRound: precisionRound\n};\n\n//# sourceURL=webpack:///./src/widgets/utils.js?");

/***/ }),

/***/ 0:
/*!**********************************************************************************************************************************************************************!*\
  !*** multi ./src/blogs/how-do-grid-cells-work/index.js ./src/blogs/how-do-grid-cells-work/firingFields.js ./src/blogs/how-do-grid-cells-work/firingFields.tmpl.html ***!
  \**********************************************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("__webpack_require__(/*! ./src/blogs/how-do-grid-cells-work/index.js */\"./src/blogs/how-do-grid-cells-work/index.js\");\n__webpack_require__(/*! ./src/blogs/how-do-grid-cells-work/firingFields.js */\"./src/blogs/how-do-grid-cells-work/firingFields.js\");\nmodule.exports = __webpack_require__(/*! ./src/blogs/how-do-grid-cells-work/firingFields.tmpl.html */\"./src/blogs/how-do-grid-cells-work/firingFields.tmpl.html\");\n\n\n//# sourceURL=webpack:///multi_./src/blogs/how-do-grid-cells-work/index.js_./src/blogs/how-do-grid-cells-work/firingFields.js_./src/blogs/how-do-grid-cells-work/firingFields.tmpl.html?");

/***/ })

/******/ });