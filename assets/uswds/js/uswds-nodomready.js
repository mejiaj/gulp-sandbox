(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

/*
 * classList.js: Cross-browser full element.classList implementation.
 * 2014-07-23
 *
 * By Eli Grey, http://eligrey.com
 * Public Domain.
 * NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
 */

/*global self, document, DOMException */

/*! @source http://purl.eligrey.com/github/classList.js/blob/master/classList.js*/

/* Copied from MDN:
 * https://developer.mozilla.org/en-US/docs/Web/API/Element/classList
 */
if ("document" in window.self) {
  // Full polyfill for browsers with no classList support
  // Including IE < Edge missing SVGElement.classList
  if (!("classList" in document.createElement("_")) || document.createElementNS && !("classList" in document.createElementNS("http://www.w3.org/2000/svg", "g"))) {
    (function (view) {
      "use strict";

      if (!('Element' in view)) return;

      var classListProp = "classList",
          protoProp = "prototype",
          elemCtrProto = view.Element[protoProp],
          objCtr = Object,
          strTrim = String[protoProp].trim || function () {
        return this.replace(/^\s+|\s+$/g, "");
      },
          arrIndexOf = Array[protoProp].indexOf || function (item) {
        var i = 0,
            len = this.length;

        for (; i < len; i++) {
          if (i in this && this[i] === item) {
            return i;
          }
        }

        return -1;
      } // Vendors: please allow content code to instantiate DOMExceptions
      ,
          DOMEx = function (type, message) {
        this.name = type;
        this.code = DOMException[type];
        this.message = message;
      },
          checkTokenAndGetIndex = function (classList, token) {
        if (token === "") {
          throw new DOMEx("SYNTAX_ERR", "An invalid or illegal string was specified");
        }

        if (/\s/.test(token)) {
          throw new DOMEx("INVALID_CHARACTER_ERR", "String contains an invalid character");
        }

        return arrIndexOf.call(classList, token);
      },
          ClassList = function (elem) {
        var trimmedClasses = strTrim.call(elem.getAttribute("class") || ""),
            classes = trimmedClasses ? trimmedClasses.split(/\s+/) : [],
            i = 0,
            len = classes.length;

        for (; i < len; i++) {
          this.push(classes[i]);
        }

        this._updateClassName = function () {
          elem.setAttribute("class", this.toString());
        };
      },
          classListProto = ClassList[protoProp] = [],
          classListGetter = function () {
        return new ClassList(this);
      }; // Most DOMException implementations don't allow calling DOMException's toString()
      // on non-DOMExceptions. Error's toString() is sufficient here.


      DOMEx[protoProp] = Error[protoProp];

      classListProto.item = function (i) {
        return this[i] || null;
      };

      classListProto.contains = function (token) {
        token += "";
        return checkTokenAndGetIndex(this, token) !== -1;
      };

      classListProto.add = function () {
        var tokens = arguments,
            i = 0,
            l = tokens.length,
            token,
            updated = false;

        do {
          token = tokens[i] + "";

          if (checkTokenAndGetIndex(this, token) === -1) {
            this.push(token);
            updated = true;
          }
        } while (++i < l);

        if (updated) {
          this._updateClassName();
        }
      };

      classListProto.remove = function () {
        var tokens = arguments,
            i = 0,
            l = tokens.length,
            token,
            updated = false,
            index;

        do {
          token = tokens[i] + "";
          index = checkTokenAndGetIndex(this, token);

          while (index !== -1) {
            this.splice(index, 1);
            updated = true;
            index = checkTokenAndGetIndex(this, token);
          }
        } while (++i < l);

        if (updated) {
          this._updateClassName();
        }
      };

      classListProto.toggle = function (token, force) {
        token += "";
        var result = this.contains(token),
            method = result ? force !== true && "remove" : force !== false && "add";

        if (method) {
          this[method](token);
        }

        if (force === true || force === false) {
          return force;
        } else {
          return !result;
        }
      };

      classListProto.toString = function () {
        return this.join(" ");
      };

      if (objCtr.defineProperty) {
        var classListPropDesc = {
          get: classListGetter,
          enumerable: true,
          configurable: true
        };

        try {
          objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
        } catch (ex) {
          // IE 8 doesn't support enumerable:true
          if (ex.number === -0x7FF5EC54) {
            classListPropDesc.enumerable = false;
            objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
          }
        }
      } else if (objCtr[protoProp].__defineGetter__) {
        elemCtrProto.__defineGetter__(classListProp, classListGetter);
      }
    })(window.self);
  } else {
    // There is full or partial native classList support, so just check if we need
    // to normalize the add/remove and toggle APIs.
    (function () {
      "use strict";

      var testElement = document.createElement("_");
      testElement.classList.add("c1", "c2"); // Polyfill for IE 10/11 and Firefox <26, where classList.add and
      // classList.remove exist but support only one argument at a time.

      if (!testElement.classList.contains("c2")) {
        var createMethod = function (method) {
          var original = DOMTokenList.prototype[method];

          DOMTokenList.prototype[method] = function (token) {
            var i,
                len = arguments.length;

            for (i = 0; i < len; i++) {
              token = arguments[i];
              original.call(this, token);
            }
          };
        };

        createMethod('add');
        createMethod('remove');
      }

      testElement.classList.toggle("c3", false); // Polyfill for IE 10 and Firefox <24, where classList.toggle does not
      // support the second argument.

      if (testElement.classList.contains("c3")) {
        var _toggle = DOMTokenList.prototype.toggle;

        DOMTokenList.prototype.toggle = function (token, force) {
          if (1 in arguments && !this.contains(token) === !force) {
            return force;
          } else {
            return _toggle.call(this, token);
          }
        };
      }

      testElement = null;
    })();
  }
}

},{}],2:[function(require,module,exports){
"use strict";

// element-closest | CC0-1.0 | github.com/jonathantneal/closest
(function (ElementProto) {
  if (typeof ElementProto.matches !== 'function') {
    ElementProto.matches = ElementProto.msMatchesSelector || ElementProto.mozMatchesSelector || ElementProto.webkitMatchesSelector || function matches(selector) {
      var element = this;
      var elements = (element.document || element.ownerDocument).querySelectorAll(selector);
      var index = 0;

      while (elements[index] && elements[index] !== element) {
        ++index;
      }

      return Boolean(elements[index]);
    };
  }

  if (typeof ElementProto.closest !== 'function') {
    ElementProto.closest = function closest(selector) {
      var element = this;

      while (element && element.nodeType === 1) {
        if (element.matches(selector)) {
          return element;
        }

        element = element.parentNode;
      }

      return null;
    };
  }
})(window.Element.prototype);

},{}],3:[function(require,module,exports){
"use strict";

/* global define, KeyboardEvent, module */
(function () {
  var keyboardeventKeyPolyfill = {
    polyfill: polyfill,
    keys: {
      3: 'Cancel',
      6: 'Help',
      8: 'Backspace',
      9: 'Tab',
      12: 'Clear',
      13: 'Enter',
      16: 'Shift',
      17: 'Control',
      18: 'Alt',
      19: 'Pause',
      20: 'CapsLock',
      27: 'Escape',
      28: 'Convert',
      29: 'NonConvert',
      30: 'Accept',
      31: 'ModeChange',
      32: ' ',
      33: 'PageUp',
      34: 'PageDown',
      35: 'End',
      36: 'Home',
      37: 'ArrowLeft',
      38: 'ArrowUp',
      39: 'ArrowRight',
      40: 'ArrowDown',
      41: 'Select',
      42: 'Print',
      43: 'Execute',
      44: 'PrintScreen',
      45: 'Insert',
      46: 'Delete',
      48: ['0', ')'],
      49: ['1', '!'],
      50: ['2', '@'],
      51: ['3', '#'],
      52: ['4', '$'],
      53: ['5', '%'],
      54: ['6', '^'],
      55: ['7', '&'],
      56: ['8', '*'],
      57: ['9', '('],
      91: 'OS',
      93: 'ContextMenu',
      144: 'NumLock',
      145: 'ScrollLock',
      181: 'VolumeMute',
      182: 'VolumeDown',
      183: 'VolumeUp',
      186: [';', ':'],
      187: ['=', '+'],
      188: [',', '<'],
      189: ['-', '_'],
      190: ['.', '>'],
      191: ['/', '?'],
      192: ['`', '~'],
      219: ['[', '{'],
      220: ['\\', '|'],
      221: [']', '}'],
      222: ["'", '"'],
      224: 'Meta',
      225: 'AltGraph',
      246: 'Attn',
      247: 'CrSel',
      248: 'ExSel',
      249: 'EraseEof',
      250: 'Play',
      251: 'ZoomOut'
    }
  }; // Function keys (F1-24).

  var i;

  for (i = 1; i < 25; i++) {
    keyboardeventKeyPolyfill.keys[111 + i] = 'F' + i;
  } // Printable ASCII characters.


  var letter = '';

  for (i = 65; i < 91; i++) {
    letter = String.fromCharCode(i);
    keyboardeventKeyPolyfill.keys[i] = [letter.toLowerCase(), letter.toUpperCase()];
  }

  function polyfill() {
    if (!('KeyboardEvent' in window) || 'key' in KeyboardEvent.prototype) {
      return false;
    } // Polyfill `key` on `KeyboardEvent`.


    var proto = {
      get: function (x) {
        var key = keyboardeventKeyPolyfill.keys[this.which || this.keyCode];

        if (Array.isArray(key)) {
          key = key[+this.shiftKey];
        }

        return key;
      }
    };
    Object.defineProperty(KeyboardEvent.prototype, 'key', proto);
    return proto;
  }

  if (typeof define === 'function' && define.amd) {
    define('keyboardevent-key-polyfill', keyboardeventKeyPolyfill);
  } else if (typeof exports !== 'undefined' && typeof module !== 'undefined') {
    module.exports = keyboardeventKeyPolyfill;
  } else if (window) {
    window.keyboardeventKeyPolyfill = keyboardeventKeyPolyfill;
  }
})();

},{}],4:[function(require,module,exports){
/*
object-assign
(c) Sindre Sorhus
@license MIT
*/
'use strict';
/* eslint-disable no-unused-vars */

var getOwnPropertySymbols = Object.getOwnPropertySymbols;
var hasOwnProperty = Object.prototype.hasOwnProperty;
var propIsEnumerable = Object.prototype.propertyIsEnumerable;

function toObject(val) {
  if (val === null || val === undefined) {
    throw new TypeError('Object.assign cannot be called with null or undefined');
  }

  return Object(val);
}

function shouldUseNative() {
  try {
    if (!Object.assign) {
      return false;
    } // Detect buggy property enumeration order in older V8 versions.
    // https://bugs.chromium.org/p/v8/issues/detail?id=4118


    var test1 = new String('abc'); // eslint-disable-line no-new-wrappers

    test1[5] = 'de';

    if (Object.getOwnPropertyNames(test1)[0] === '5') {
      return false;
    } // https://bugs.chromium.org/p/v8/issues/detail?id=3056


    var test2 = {};

    for (var i = 0; i < 10; i++) {
      test2['_' + String.fromCharCode(i)] = i;
    }

    var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
      return test2[n];
    });

    if (order2.join('') !== '0123456789') {
      return false;
    } // https://bugs.chromium.org/p/v8/issues/detail?id=3056


    var test3 = {};
    'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
      test3[letter] = letter;
    });

    if (Object.keys(Object.assign({}, test3)).join('') !== 'abcdefghijklmnopqrst') {
      return false;
    }

    return true;
  } catch (err) {
    // We don't expect any of the above to throw, but better to be safe.
    return false;
  }
}

module.exports = shouldUseNative() ? Object.assign : function (target, source) {
  var from;
  var to = toObject(target);
  var symbols;

  for (var s = 1; s < arguments.length; s++) {
    from = Object(arguments[s]);

    for (var key in from) {
      if (hasOwnProperty.call(from, key)) {
        to[key] = from[key];
      }
    }

    if (getOwnPropertySymbols) {
      symbols = getOwnPropertySymbols(from);

      for (var i = 0; i < symbols.length; i++) {
        if (propIsEnumerable.call(from, symbols[i])) {
          to[symbols[i]] = from[symbols[i]];
        }
      }
    }
  }

  return to;
};

},{}],5:[function(require,module,exports){
"use strict";

const assign = require('object-assign');

const delegate = require('../delegate');

const delegateAll = require('../delegateAll');

const DELEGATE_PATTERN = /^(.+):delegate\((.+)\)$/;
const SPACE = ' ';

const getListeners = function (type, handler) {
  var match = type.match(DELEGATE_PATTERN);
  var selector;

  if (match) {
    type = match[1];
    selector = match[2];
  }

  var options;

  if (typeof handler === 'object') {
    options = {
      capture: popKey(handler, 'capture'),
      passive: popKey(handler, 'passive')
    };
  }

  var listener = {
    selector: selector,
    delegate: typeof handler === 'object' ? delegateAll(handler) : selector ? delegate(selector, handler) : handler,
    options: options
  };

  if (type.indexOf(SPACE) > -1) {
    return type.split(SPACE).map(function (_type) {
      return assign({
        type: _type
      }, listener);
    });
  } else {
    listener.type = type;
    return [listener];
  }
};

var popKey = function (obj, key) {
  var value = obj[key];
  delete obj[key];
  return value;
};

module.exports = function behavior(events, props) {
  const listeners = Object.keys(events).reduce(function (memo, type) {
    var listeners = getListeners(type, events[type]);
    return memo.concat(listeners);
  }, []);
  return assign({
    add: function addBehavior(element) {
      listeners.forEach(function (listener) {
        element.addEventListener(listener.type, listener.delegate, listener.options);
      });
    },
    remove: function removeBehavior(element) {
      listeners.forEach(function (listener) {
        element.removeEventListener(listener.type, listener.delegate, listener.options);
      });
    }
  }, props);
};

},{"../delegate":7,"../delegateAll":8,"object-assign":4}],6:[function(require,module,exports){
"use strict";

module.exports = function compose(functions) {
  return function (e) {
    return functions.some(function (fn) {
      return fn.call(this, e) === false;
    }, this);
  };
};

},{}],7:[function(require,module,exports){
"use strict";

// polyfill Element.prototype.closest
require('element-closest');

module.exports = function delegate(selector, fn) {
  return function delegation(event) {
    var target = event.target.closest(selector);

    if (target) {
      return fn.call(target, event);
    }
  };
};

},{"element-closest":2}],8:[function(require,module,exports){
"use strict";

const delegate = require('../delegate');

const compose = require('../compose');

const SPLAT = '*';

module.exports = function delegateAll(selectors) {
  const keys = Object.keys(selectors); // XXX optimization: if there is only one handler and it applies to
  // all elements (the "*" CSS selector), then just return that
  // handler

  if (keys.length === 1 && keys[0] === SPLAT) {
    return selectors[SPLAT];
  }

  const delegates = keys.reduce(function (memo, selector) {
    memo.push(delegate(selector, selectors[selector]));
    return memo;
  }, []);
  return compose(delegates);
};

},{"../compose":6,"../delegate":7}],9:[function(require,module,exports){
"use strict";

module.exports = function ignore(element, fn) {
  return function ignorance(e) {
    if (element !== e.target && !element.contains(e.target)) {
      return fn.call(this, e);
    }
  };
};

},{}],10:[function(require,module,exports){
"use strict";

module.exports = {
  behavior: require('./behavior'),
  delegate: require('./delegate'),
  delegateAll: require('./delegateAll'),
  ignore: require('./ignore'),
  keymap: require('./keymap')
};

},{"./behavior":5,"./delegate":7,"./delegateAll":8,"./ignore":9,"./keymap":11}],11:[function(require,module,exports){
"use strict";

require('keyboardevent-key-polyfill'); // these are the only relevant modifiers supported on all platforms,
// according to MDN:
// <https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/getModifierState>


const MODIFIERS = {
  'Alt': 'altKey',
  'Control': 'ctrlKey',
  'Ctrl': 'ctrlKey',
  'Shift': 'shiftKey'
};
const MODIFIER_SEPARATOR = '+';

const getEventKey = function (event, hasModifiers) {
  var key = event.key;

  if (hasModifiers) {
    for (var modifier in MODIFIERS) {
      if (event[MODIFIERS[modifier]] === true) {
        key = [modifier, key].join(MODIFIER_SEPARATOR);
      }
    }
  }

  return key;
};

module.exports = function keymap(keys) {
  const hasModifiers = Object.keys(keys).some(function (key) {
    return key.indexOf(MODIFIER_SEPARATOR) > -1;
  });
  return function (event) {
    var key = getEventKey(event, hasModifiers);
    return [key, key.toLowerCase()].reduce(function (result, _key) {
      if (_key in keys) {
        result = keys[key].call(this, event);
      }

      return result;
    }, undefined);
  };
};

module.exports.MODIFIERS = MODIFIERS;

},{"keyboardevent-key-polyfill":3}],12:[function(require,module,exports){
"use strict";

module.exports = function once(listener, options) {
  var wrapped = function wrappedOnce(e) {
    e.currentTarget.removeEventListener(e.type, wrapped, options);
    return listener.call(this, e);
  };

  return wrapped;
};

},{}],13:[function(require,module,exports){
'use strict';

var RE_TRIM = /(^\s+)|(\s+$)/g;
var RE_SPLIT = /\s+/;
var trim = String.prototype.trim ? function (str) {
  return str.trim();
} : function (str) {
  return str.replace(RE_TRIM, '');
};

var queryById = function (id) {
  return this.querySelector('[id="' + id.replace(/"/g, '\\"') + '"]');
};

module.exports = function resolveIds(ids, doc) {
  if (typeof ids !== 'string') {
    throw new Error('Expected a string but got ' + typeof ids);
  }

  if (!doc) {
    doc = window.document;
  }

  var getElementById = doc.getElementById ? doc.getElementById.bind(doc) : queryById.bind(doc);
  ids = trim(ids).split(RE_SPLIT); // XXX we can short-circuit here because trimming and splitting a
  // string of just whitespace produces an array containing a single,
  // empty string

  if (ids.length === 1 && ids[0] === '') {
    return [];
  }

  return ids.map(function (id) {
    var el = getElementById(id);

    if (!el) {
      throw new Error('no element with id: "' + id + '"');
    }

    return el;
  });
};

},{}],14:[function(require,module,exports){
"use strict";

const behavior = require("../../uswds-core/src/js/utils/behavior");

const toggleFormInput = require("../../uswds-core/src/js/utils/toggle-form-input");

const {
  CLICK
} = require("../../uswds-core/src/js/events");

const {
  prefix: PREFIX
} = require("../../uswds-core/src/js/config");

const LINK = `.${PREFIX}-show-password`;

function toggle(event) {
  event.preventDefault();
  toggleFormInput(this);
}

module.exports = behavior({
  [CLICK]: {
    [LINK]: toggle
  }
});

},{"../../uswds-core/src/js/config":32,"../../uswds-core/src/js/events":33,"../../uswds-core/src/js/utils/behavior":42,"../../uswds-core/src/js/utils/toggle-form-input":51}],15:[function(require,module,exports){
"use strict";

const select = require("../../uswds-core/src/js/utils/select");

const behavior = require("../../uswds-core/src/js/utils/behavior");

const toggle = require("../../uswds-core/src/js/utils/toggle");

const isElementInViewport = require("../../uswds-core/src/js/utils/is-in-viewport");

const {
  CLICK
} = require("../../uswds-core/src/js/events");

const {
  prefix: PREFIX
} = require("../../uswds-core/src/js/config");

const ACCORDION = `.${PREFIX}-accordion, .${PREFIX}-accordion--bordered`;
const BUTTON = `.${PREFIX}-accordion__button[aria-controls]`;
const EXPANDED = "aria-expanded";
const MULTISELECTABLE = "data-allow-multiple";
/**
 * Get an Array of button elements belonging directly to the given
 * accordion element.
 * @param {HTMLElement} accordion
 * @return {array<HTMLButtonElement>}
 */

const getAccordionButtons = accordion => {
  const buttons = select(BUTTON, accordion);
  return buttons.filter(button => button.closest(ACCORDION) === accordion);
};
/**
 * Toggle a button's "pressed" state, optionally providing a target
 * state.
 *
 * @param {HTMLButtonElement} button
 * @param {boolean?} expanded If no state is provided, the current
 * state will be toggled (from false to true, and vice-versa).
 * @return {boolean} the resulting state
 */


const toggleButton = (button, expanded) => {
  const accordion = button.closest(ACCORDION);
  let safeExpanded = expanded;

  if (!accordion) {
    throw new Error(`${BUTTON} is missing outer ${ACCORDION}`);
  }

  safeExpanded = toggle(button, expanded); // XXX multiselectable is opt-in, to preserve legacy behavior

  const multiselectable = accordion.hasAttribute(MULTISELECTABLE);

  if (safeExpanded && !multiselectable) {
    getAccordionButtons(accordion).forEach(other => {
      if (other !== button) {
        toggle(other, false);
      }
    });
  }
};
/**
 * @param {HTMLButtonElement} button
 * @return {boolean} true
 */


const showButton = button => toggleButton(button, true);
/**
 * @param {HTMLButtonElement} button
 * @return {boolean} false
 */


const hideButton = button => toggleButton(button, false);

const accordion = behavior({
  [CLICK]: {
    [BUTTON](event) {
      toggleButton(this);

      if (this.getAttribute(EXPANDED) === "true") {
        // We were just expanded, but if another accordion was also just
        // collapsed, we may no longer be in the viewport. This ensures
        // that we are still visible, so the user isn't confused.
        if (!isElementInViewport(this)) this.scrollIntoView();
      }
    }

  }
}, {
  init(root) {
    select(BUTTON, root).forEach(button => {
      const expanded = button.getAttribute(EXPANDED) === "true";
      toggleButton(button, expanded);
    });
  },

  ACCORDION,
  BUTTON,
  show: showButton,
  hide: hideButton,
  toggle: toggleButton,
  getButtons: getAccordionButtons
});
module.exports = accordion;

},{"../../uswds-core/src/js/config":32,"../../uswds-core/src/js/events":33,"../../uswds-core/src/js/utils/behavior":42,"../../uswds-core/src/js/utils/is-in-viewport":44,"../../uswds-core/src/js/utils/select":49,"../../uswds-core/src/js/utils/toggle":52}],16:[function(require,module,exports){
"use strict";

const behavior = require("../../uswds-core/src/js/utils/behavior");

const {
  CLICK
} = require("../../uswds-core/src/js/events");

const {
  prefix: PREFIX
} = require("../../uswds-core/src/js/config");

const HEADER = `.${PREFIX}-banner__header`;
const EXPANDED_CLASS = `${PREFIX}-banner__header--expanded`;

const toggleBanner = function toggleEl(event) {
  event.preventDefault();
  this.closest(HEADER).classList.toggle(EXPANDED_CLASS);
};

module.exports = behavior({
  [CLICK]: {
    [`${HEADER} [aria-controls]`]: toggleBanner
  }
});

},{"../../uswds-core/src/js/config":32,"../../uswds-core/src/js/events":33,"../../uswds-core/src/js/utils/behavior":42}],17:[function(require,module,exports){
"use strict";

const select = require("../../uswds-core/src/js/utils/select");

const behavior = require("../../uswds-core/src/js/utils/behavior");

const {
  prefix: PREFIX
} = require("../../uswds-core/src/js/config");

const CHARACTER_COUNT = `.${PREFIX}-character-count`;
const INPUT = `.${PREFIX}-character-count__field`;
const MESSAGE = `.${PREFIX}-character-count__message`;
const VALIDATION_MESSAGE = "The content is too long.";
const MESSAGE_INVALID_CLASS = `${PREFIX}-character-count__message--invalid`;
/**
 * The elements within the character count.
 * @typedef {Object} CharacterCountElements
 * @property {HTMLDivElement} characterCountEl
 * @property {HTMLSpanElement} messageEl
 */

/**
 * Returns the root and message element
 * for an character count input
 *
 * @param {HTMLInputElement|HTMLTextAreaElement} inputEl The character count input element
 * @returns {CharacterCountElements} elements The root and message element.
 */

const getCharacterCountElements = inputEl => {
  const characterCountEl = inputEl.closest(CHARACTER_COUNT);

  if (!characterCountEl) {
    throw new Error(`${INPUT} is missing outer ${CHARACTER_COUNT}`);
  }

  const messageEl = characterCountEl.querySelector(MESSAGE);

  if (!messageEl) {
    throw new Error(`${CHARACTER_COUNT} is missing inner ${MESSAGE}`);
  }

  return {
    characterCountEl,
    messageEl
  };
};
/**
 * Update the character count component
 *
 * @param {HTMLInputElement|HTMLTextAreaElement} inputEl The character count input element
 */


const updateCountMessage = inputEl => {
  const {
    characterCountEl,
    messageEl
  } = getCharacterCountElements(inputEl);
  const maxlength = parseInt(characterCountEl.getAttribute("data-maxlength"), 10);
  if (!maxlength) return;
  let newMessage = "";
  const currentLength = inputEl.value.length;
  const isOverLimit = currentLength && currentLength > maxlength;

  if (currentLength === 0) {
    newMessage = `${maxlength} characters allowed`;
  } else {
    const difference = Math.abs(maxlength - currentLength);
    const characters = `character${difference === 1 ? "" : "s"}`;
    const guidance = isOverLimit ? "over limit" : "left";
    newMessage = `${difference} ${characters} ${guidance}`;
  }

  messageEl.classList.toggle(MESSAGE_INVALID_CLASS, isOverLimit);
  messageEl.textContent = newMessage;

  if (isOverLimit && !inputEl.validationMessage) {
    inputEl.setCustomValidity(VALIDATION_MESSAGE);
  }

  if (!isOverLimit && inputEl.validationMessage === VALIDATION_MESSAGE) {
    inputEl.setCustomValidity("");
  }
};
/**
 * Setup the character count component
 *
 * @param {HTMLInputElement|HTMLTextAreaElement} inputEl The character count input element
 */


const setupAttributes = inputEl => {
  const {
    characterCountEl
  } = getCharacterCountElements(inputEl);
  const maxlength = inputEl.getAttribute("maxlength");
  if (!maxlength) return;
  inputEl.removeAttribute("maxlength");
  characterCountEl.setAttribute("data-maxlength", maxlength);
};

const characterCount = behavior({
  input: {
    [INPUT]() {
      updateCountMessage(this);
    }

  }
}, {
  init(root) {
    select(INPUT, root).forEach(input => {
      setupAttributes(input);
      updateCountMessage(input);
    });
  },

  MESSAGE_INVALID_CLASS,
  VALIDATION_MESSAGE
});
module.exports = characterCount;

},{"../../uswds-core/src/js/config":32,"../../uswds-core/src/js/utils/behavior":42,"../../uswds-core/src/js/utils/select":49}],18:[function(require,module,exports){
"use strict";

const keymap = require("receptor/keymap");

const selectOrMatches = require("../../uswds-core/src/js/utils/select-or-matches");

const behavior = require("../../uswds-core/src/js/utils/behavior");

const Sanitizer = require("../../uswds-core/src/js/utils/sanitizer");

const {
  prefix: PREFIX
} = require("../../uswds-core/src/js/config");

const {
  CLICK
} = require("../../uswds-core/src/js/events");

const COMBO_BOX_CLASS = `${PREFIX}-combo-box`;
const COMBO_BOX_PRISTINE_CLASS = `${COMBO_BOX_CLASS}--pristine`;
const SELECT_CLASS = `${COMBO_BOX_CLASS}__select`;
const INPUT_CLASS = `${COMBO_BOX_CLASS}__input`;
const CLEAR_INPUT_BUTTON_CLASS = `${COMBO_BOX_CLASS}__clear-input`;
const CLEAR_INPUT_BUTTON_WRAPPER_CLASS = `${CLEAR_INPUT_BUTTON_CLASS}__wrapper`;
const INPUT_BUTTON_SEPARATOR_CLASS = `${COMBO_BOX_CLASS}__input-button-separator`;
const TOGGLE_LIST_BUTTON_CLASS = `${COMBO_BOX_CLASS}__toggle-list`;
const TOGGLE_LIST_BUTTON_WRAPPER_CLASS = `${TOGGLE_LIST_BUTTON_CLASS}__wrapper`;
const LIST_CLASS = `${COMBO_BOX_CLASS}__list`;
const LIST_OPTION_CLASS = `${COMBO_BOX_CLASS}__list-option`;
const LIST_OPTION_FOCUSED_CLASS = `${LIST_OPTION_CLASS}--focused`;
const LIST_OPTION_SELECTED_CLASS = `${LIST_OPTION_CLASS}--selected`;
const STATUS_CLASS = `${COMBO_BOX_CLASS}__status`;
const COMBO_BOX = `.${COMBO_BOX_CLASS}`;
const SELECT = `.${SELECT_CLASS}`;
const INPUT = `.${INPUT_CLASS}`;
const CLEAR_INPUT_BUTTON = `.${CLEAR_INPUT_BUTTON_CLASS}`;
const TOGGLE_LIST_BUTTON = `.${TOGGLE_LIST_BUTTON_CLASS}`;
const LIST = `.${LIST_CLASS}`;
const LIST_OPTION = `.${LIST_OPTION_CLASS}`;
const LIST_OPTION_FOCUSED = `.${LIST_OPTION_FOCUSED_CLASS}`;
const LIST_OPTION_SELECTED = `.${LIST_OPTION_SELECTED_CLASS}`;
const STATUS = `.${STATUS_CLASS}`;
const DEFAULT_FILTER = ".*{{query}}.*";

const noop = () => {};
/**
 * set the value of the element and dispatch a change event
 *
 * @param {HTMLInputElement|HTMLSelectElement} el The element to update
 * @param {string} value The new value of the element
 */


const changeElementValue = function (el) {
  let value = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";
  const elementToChange = el;
  elementToChange.value = value;
  const event = new CustomEvent("change", {
    bubbles: true,
    cancelable: true,
    detail: {
      value
    }
  });
  elementToChange.dispatchEvent(event);
};
/**
 * The elements within the combo box.
 * @typedef {Object} ComboBoxContext
 * @property {HTMLElement} comboBoxEl
 * @property {HTMLSelectElement} selectEl
 * @property {HTMLInputElement} inputEl
 * @property {HTMLUListElement} listEl
 * @property {HTMLDivElement} statusEl
 * @property {HTMLLIElement} focusedOptionEl
 * @property {HTMLLIElement} selectedOptionEl
 * @property {HTMLButtonElement} toggleListBtnEl
 * @property {HTMLButtonElement} clearInputBtnEl
 * @property {boolean} isPristine
 * @property {boolean} disableFiltering
 */

/**
 * Get an object of elements belonging directly to the given
 * combo box component.
 *
 * @param {HTMLElement} el the element within the combo box
 * @returns {ComboBoxContext} elements
 */


const getComboBoxContext = el => {
  const comboBoxEl = el.closest(COMBO_BOX);

  if (!comboBoxEl) {
    throw new Error(`Element is missing outer ${COMBO_BOX}`);
  }

  const selectEl = comboBoxEl.querySelector(SELECT);
  const inputEl = comboBoxEl.querySelector(INPUT);
  const listEl = comboBoxEl.querySelector(LIST);
  const statusEl = comboBoxEl.querySelector(STATUS);
  const focusedOptionEl = comboBoxEl.querySelector(LIST_OPTION_FOCUSED);
  const selectedOptionEl = comboBoxEl.querySelector(LIST_OPTION_SELECTED);
  const toggleListBtnEl = comboBoxEl.querySelector(TOGGLE_LIST_BUTTON);
  const clearInputBtnEl = comboBoxEl.querySelector(CLEAR_INPUT_BUTTON);
  const isPristine = comboBoxEl.classList.contains(COMBO_BOX_PRISTINE_CLASS);
  const disableFiltering = comboBoxEl.dataset.disableFiltering === "true";
  return {
    comboBoxEl,
    selectEl,
    inputEl,
    listEl,
    statusEl,
    focusedOptionEl,
    selectedOptionEl,
    toggleListBtnEl,
    clearInputBtnEl,
    isPristine,
    disableFiltering
  };
};
/**
 * Disable the combo-box component
 *
 * @param {HTMLInputElement} el An element within the combo box component
 */


const disable = el => {
  const {
    inputEl,
    toggleListBtnEl,
    clearInputBtnEl
  } = getComboBoxContext(el);
  clearInputBtnEl.hidden = true;
  clearInputBtnEl.disabled = true;
  toggleListBtnEl.disabled = true;
  inputEl.disabled = true;
};
/**
 * Enable the combo-box component
 *
 * @param {HTMLInputElement} el An element within the combo box component
 */


const enable = el => {
  const {
    inputEl,
    toggleListBtnEl,
    clearInputBtnEl
  } = getComboBoxContext(el);
  clearInputBtnEl.hidden = false;
  clearInputBtnEl.disabled = false;
  toggleListBtnEl.disabled = false;
  inputEl.disabled = false;
};
/**
 * Enhance a select element into a combo box component.
 *
 * @param {HTMLElement} _comboBoxEl The initial element of the combo box component
 */


const enhanceComboBox = _comboBoxEl => {
  const comboBoxEl = _comboBoxEl.closest(COMBO_BOX);

  if (comboBoxEl.dataset.enhanced) return;
  const selectEl = comboBoxEl.querySelector("select");

  if (!selectEl) {
    throw new Error(`${COMBO_BOX} is missing inner select`);
  }

  const selectId = selectEl.id;
  const selectLabel = document.querySelector(`label[for="${selectId}"]`);
  const listId = `${selectId}--list`;
  const listIdLabel = `${selectId}-label`;
  const assistiveHintID = `${selectId}--assistiveHint`;
  const additionalAttributes = [];
  const {
    defaultValue
  } = comboBoxEl.dataset;
  const {
    placeholder
  } = comboBoxEl.dataset;
  let selectedOption;

  if (placeholder) {
    additionalAttributes.push({
      placeholder
    });
  }

  if (defaultValue) {
    for (let i = 0, len = selectEl.options.length; i < len; i += 1) {
      const optionEl = selectEl.options[i];

      if (optionEl.value === defaultValue) {
        selectedOption = optionEl;
        break;
      }
    }
  }
  /**
   * Throw error if combobox is missing a label or label is missing
   * `for` attribute. Otherwise, set the ID to match the <ul> aria-labelledby
   */


  if (!selectLabel || !selectLabel.matches(`label[for="${selectId}"]`)) {
    throw new Error(`${COMBO_BOX} for ${selectId} is either missing a label or a "for" attribute`);
  } else {
    selectLabel.setAttribute("id", listIdLabel);
  }

  selectLabel.setAttribute("id", listIdLabel);
  selectEl.setAttribute("aria-hidden", "true");
  selectEl.setAttribute("tabindex", "-1");
  selectEl.classList.add("usa-sr-only", SELECT_CLASS);
  selectEl.id = "";
  selectEl.value = "";
  ["required", "aria-label", "aria-labelledby"].forEach(name => {
    if (selectEl.hasAttribute(name)) {
      const value = selectEl.getAttribute(name);
      additionalAttributes.push({
        [name]: value
      });
      selectEl.removeAttribute(name);
    }
  }); // sanitize doesn't like functions in template literals

  const input = document.createElement("input");
  input.setAttribute("id", selectId);
  input.setAttribute("aria-owns", listId);
  input.setAttribute("aria-controls", listId);
  input.setAttribute("aria-autocomplete", "list");
  input.setAttribute("aria-describedby", assistiveHintID);
  input.setAttribute("aria-expanded", "false");
  input.setAttribute("autocapitalize", "off");
  input.setAttribute("autocomplete", "off");
  input.setAttribute("class", INPUT_CLASS);
  input.setAttribute("type", "text");
  input.setAttribute("role", "combobox");
  additionalAttributes.forEach(attr => Object.keys(attr).forEach(key => {
    const value = Sanitizer.escapeHTML`${attr[key]}`;
    input.setAttribute(key, value);
  }));
  comboBoxEl.insertAdjacentElement("beforeend", input);
  comboBoxEl.insertAdjacentHTML("beforeend", Sanitizer.escapeHTML`
    <span class="${CLEAR_INPUT_BUTTON_WRAPPER_CLASS}" tabindex="-1">
        <button type="button" class="${CLEAR_INPUT_BUTTON_CLASS}" aria-label="Clear the select contents">&nbsp;</button>
      </span>
      <span class="${INPUT_BUTTON_SEPARATOR_CLASS}">&nbsp;</span>
      <span class="${TOGGLE_LIST_BUTTON_WRAPPER_CLASS}" tabindex="-1">
        <button type="button" tabindex="-1" class="${TOGGLE_LIST_BUTTON_CLASS}" aria-label="Toggle the dropdown list">&nbsp;</button>
      </span>
      <ul
        tabindex="-1"
        id="${listId}"
        class="${LIST_CLASS}"
        role="listbox"
        aria-labelledby="${listIdLabel}"
        hidden>
      </ul>
      <div class="${STATUS_CLASS} usa-sr-only" role="status"></div>
      <span id="${assistiveHintID}" class="usa-sr-only">
        When autocomplete results are available use up and down arrows to review and enter to select.
        Touch device users, explore by touch or with swipe gestures.
      </span>`);

  if (selectedOption) {
    const {
      inputEl
    } = getComboBoxContext(comboBoxEl);
    changeElementValue(selectEl, selectedOption.value);
    changeElementValue(inputEl, selectedOption.text);
    comboBoxEl.classList.add(COMBO_BOX_PRISTINE_CLASS);
  }

  if (selectEl.disabled) {
    disable(comboBoxEl);
    selectEl.disabled = false;
  }

  comboBoxEl.dataset.enhanced = "true";
};
/**
 * Manage the focused element within the list options when
 * navigating via keyboard.
 *
 * @param {HTMLElement} el An anchor element within the combo box component
 * @param {HTMLElement} nextEl An element within the combo box component
 * @param {Object} options options
 * @param {boolean} options.skipFocus skip focus of highlighted item
 * @param {boolean} options.preventScroll should skip procedure to scroll to element
 */


const highlightOption = function (el, nextEl) {
  let {
    skipFocus,
    preventScroll
  } = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  const {
    inputEl,
    listEl,
    focusedOptionEl
  } = getComboBoxContext(el);

  if (focusedOptionEl) {
    focusedOptionEl.classList.remove(LIST_OPTION_FOCUSED_CLASS);
    focusedOptionEl.setAttribute("tabIndex", "-1");
  }

  if (nextEl) {
    inputEl.setAttribute("aria-activedescendant", nextEl.id);
    nextEl.setAttribute("tabIndex", "0");
    nextEl.classList.add(LIST_OPTION_FOCUSED_CLASS);

    if (!preventScroll) {
      const optionBottom = nextEl.offsetTop + nextEl.offsetHeight;
      const currentBottom = listEl.scrollTop + listEl.offsetHeight;

      if (optionBottom > currentBottom) {
        listEl.scrollTop = optionBottom - listEl.offsetHeight;
      }

      if (nextEl.offsetTop < listEl.scrollTop) {
        listEl.scrollTop = nextEl.offsetTop;
      }
    }

    if (!skipFocus) {
      nextEl.focus({
        preventScroll
      });
    }
  } else {
    inputEl.setAttribute("aria-activedescendant", "");
    inputEl.focus();
  }
};
/**
 * Generate a dynamic regular expression based off of a replaceable and possibly filtered value.
 *
 * @param {string} el An element within the combo box component
 * @param {string} query The value to use in the regular expression
 * @param {object} extras An object of regular expressions to replace and filter the query
 */


const generateDynamicRegExp = function (filter) {
  let query = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";
  let extras = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  const escapeRegExp = text => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");

  let find = filter.replace(/{{(.*?)}}/g, (m, $1) => {
    const key = $1.trim();
    const queryFilter = extras[key];

    if (key !== "query" && queryFilter) {
      const matcher = new RegExp(queryFilter, "i");
      const matches = query.match(matcher);

      if (matches) {
        return escapeRegExp(matches[1]);
      }

      return "";
    }

    return escapeRegExp(query);
  });
  find = `^(?:${find})$`;
  return new RegExp(find, "i");
};
/**
 * Display the option list of a combo box component.
 *
 * @param {HTMLElement} el An element within the combo box component
 */


const displayList = el => {
  const {
    comboBoxEl,
    selectEl,
    inputEl,
    listEl,
    statusEl,
    isPristine,
    disableFiltering
  } = getComboBoxContext(el);
  let selectedItemId;
  let firstFoundId;
  const listOptionBaseId = `${listEl.id}--option-`;
  const inputValue = (inputEl.value || "").toLowerCase();
  const filter = comboBoxEl.dataset.filter || DEFAULT_FILTER;
  const regex = generateDynamicRegExp(filter, inputValue, comboBoxEl.dataset);
  const options = [];

  for (let i = 0, len = selectEl.options.length; i < len; i += 1) {
    const optionEl = selectEl.options[i];
    const optionId = `${listOptionBaseId}${options.length}`;

    if (optionEl.value && (disableFiltering || isPristine || !inputValue || regex.test(optionEl.text))) {
      if (selectEl.value && optionEl.value === selectEl.value) {
        selectedItemId = optionId;
      }

      if (disableFiltering && !firstFoundId && regex.test(optionEl.text)) {
        firstFoundId = optionId;
      }

      options.push(optionEl);
    }
  }

  const numOptions = options.length;
  const optionHtml = options.map((option, index) => {
    const optionId = `${listOptionBaseId}${index}`;
    const classes = [LIST_OPTION_CLASS];
    let tabindex = "-1";
    let ariaSelected = "false";

    if (optionId === selectedItemId) {
      classes.push(LIST_OPTION_SELECTED_CLASS, LIST_OPTION_FOCUSED_CLASS);
      tabindex = "0";
      ariaSelected = "true";
    }

    if (!selectedItemId && index === 0) {
      classes.push(LIST_OPTION_FOCUSED_CLASS);
      tabindex = "0";
    }

    const li = document.createElement("li");
    li.setAttribute("aria-setsize", options.length);
    li.setAttribute("aria-posinset", index + 1);
    li.setAttribute("aria-selected", ariaSelected);
    li.setAttribute("id", optionId);
    li.setAttribute("class", classes.join(" "));
    li.setAttribute("tabindex", tabindex);
    li.setAttribute("role", "option");
    li.setAttribute("data-value", option.value);
    li.textContent = option.text;
    return li;
  });
  const noResults = document.createElement("li");
  noResults.setAttribute("class", `${LIST_OPTION_CLASS}--no-results`);
  noResults.textContent = "No results found";
  listEl.hidden = false;

  if (numOptions) {
    listEl.innerHTML = "";
    optionHtml.forEach(item => listEl.insertAdjacentElement("beforeend", item));
  } else {
    listEl.innerHTML = "";
    listEl.insertAdjacentElement("beforeend", noResults);
  }

  inputEl.setAttribute("aria-expanded", "true");
  statusEl.textContent = numOptions ? `${numOptions} result${numOptions > 1 ? "s" : ""} available.` : "No results.";
  let itemToFocus;

  if (isPristine && selectedItemId) {
    itemToFocus = listEl.querySelector(`#${selectedItemId}`);
  } else if (disableFiltering && firstFoundId) {
    itemToFocus = listEl.querySelector(`#${firstFoundId}`);
  }

  if (itemToFocus) {
    highlightOption(listEl, itemToFocus, {
      skipFocus: true
    });
  }
};
/**
 * Hide the option list of a combo box component.
 *
 * @param {HTMLElement} el An element within the combo box component
 */


const hideList = el => {
  const {
    inputEl,
    listEl,
    statusEl,
    focusedOptionEl
  } = getComboBoxContext(el);
  statusEl.innerHTML = "";
  inputEl.setAttribute("aria-expanded", "false");
  inputEl.setAttribute("aria-activedescendant", "");

  if (focusedOptionEl) {
    focusedOptionEl.classList.remove(LIST_OPTION_FOCUSED_CLASS);
  }

  listEl.scrollTop = 0;
  listEl.hidden = true;
};
/**
 * Select an option list of the combo box component.
 *
 * @param {HTMLElement} listOptionEl The list option being selected
 */


const selectItem = listOptionEl => {
  const {
    comboBoxEl,
    selectEl,
    inputEl
  } = getComboBoxContext(listOptionEl);
  changeElementValue(selectEl, listOptionEl.dataset.value);
  changeElementValue(inputEl, listOptionEl.textContent);
  comboBoxEl.classList.add(COMBO_BOX_PRISTINE_CLASS);
  hideList(comboBoxEl);
  inputEl.focus();
};
/**
 * Clear the input of the combo box
 *
 * @param {HTMLButtonElement} clearButtonEl The clear input button
 */


const clearInput = clearButtonEl => {
  const {
    comboBoxEl,
    listEl,
    selectEl,
    inputEl
  } = getComboBoxContext(clearButtonEl);
  const listShown = !listEl.hidden;
  if (selectEl.value) changeElementValue(selectEl);
  if (inputEl.value) changeElementValue(inputEl);
  comboBoxEl.classList.remove(COMBO_BOX_PRISTINE_CLASS);
  if (listShown) displayList(comboBoxEl);
  inputEl.focus();
};
/**
 * Reset the select based off of currently set select value
 *
 * @param {HTMLElement} el An element within the combo box component
 */


const resetSelection = el => {
  const {
    comboBoxEl,
    selectEl,
    inputEl
  } = getComboBoxContext(el);
  const selectValue = selectEl.value;
  const inputValue = (inputEl.value || "").toLowerCase();

  if (selectValue) {
    for (let i = 0, len = selectEl.options.length; i < len; i += 1) {
      const optionEl = selectEl.options[i];

      if (optionEl.value === selectValue) {
        if (inputValue !== optionEl.text) {
          changeElementValue(inputEl, optionEl.text);
        }

        comboBoxEl.classList.add(COMBO_BOX_PRISTINE_CLASS);
        return;
      }
    }
  }

  if (inputValue) {
    changeElementValue(inputEl);
  }
};
/**
 * Select an option list of the combo box component based off of
 * having a current focused list option or
 * having test that completely matches a list option.
 * Otherwise it clears the input and select.
 *
 * @param {HTMLElement} el An element within the combo box component
 */


const completeSelection = el => {
  const {
    comboBoxEl,
    selectEl,
    inputEl,
    statusEl
  } = getComboBoxContext(el);
  statusEl.textContent = "";
  const inputValue = (inputEl.value || "").toLowerCase();

  if (inputValue) {
    for (let i = 0, len = selectEl.options.length; i < len; i += 1) {
      const optionEl = selectEl.options[i];

      if (optionEl.text.toLowerCase() === inputValue) {
        changeElementValue(selectEl, optionEl.value);
        changeElementValue(inputEl, optionEl.text);
        comboBoxEl.classList.add(COMBO_BOX_PRISTINE_CLASS);
        return;
      }
    }
  }

  resetSelection(comboBoxEl);
};
/**
 * Handle the escape event within the combo box component.
 *
 * @param {KeyboardEvent} event An event within the combo box component
 */


const handleEscape = event => {
  const {
    comboBoxEl,
    inputEl
  } = getComboBoxContext(event.target);
  hideList(comboBoxEl);
  resetSelection(comboBoxEl);
  inputEl.focus();
};
/**
 * Handle the down event within the combo box component.
 *
 * @param {KeyboardEvent} event An event within the combo box component
 */


const handleDownFromInput = event => {
  const {
    comboBoxEl,
    listEl
  } = getComboBoxContext(event.target);

  if (listEl.hidden) {
    displayList(comboBoxEl);
  }

  const nextOptionEl = listEl.querySelector(LIST_OPTION_FOCUSED) || listEl.querySelector(LIST_OPTION);

  if (nextOptionEl) {
    highlightOption(comboBoxEl, nextOptionEl);
  }

  event.preventDefault();
};
/**
 * Handle the enter event from an input element within the combo box component.
 *
 * @param {KeyboardEvent} event An event within the combo box component
 */


const handleEnterFromInput = event => {
  const {
    comboBoxEl,
    listEl
  } = getComboBoxContext(event.target);
  const listShown = !listEl.hidden;
  completeSelection(comboBoxEl);

  if (listShown) {
    hideList(comboBoxEl);
  }

  event.preventDefault();
};
/**
 * Handle the down event within the combo box component.
 *
 * @param {KeyboardEvent} event An event within the combo box component
 */


const handleDownFromListOption = event => {
  const focusedOptionEl = event.target;
  const nextOptionEl = focusedOptionEl.nextSibling;

  if (nextOptionEl) {
    highlightOption(focusedOptionEl, nextOptionEl);
  }

  event.preventDefault();
};
/**
 * Handle the tab event from an list option element within the combo box component.
 *
 * @param {KeyboardEvent} event An event within the combo box component
 */


const handleTabFromListOption = event => {
  selectItem(event.target);
  event.preventDefault();
};
/**
 * Handle the enter event from list option within the combo box component.
 *
 * @param {KeyboardEvent} event An event within the combo box component
 */


const handleEnterFromListOption = event => {
  selectItem(event.target);
  event.preventDefault();
};
/**
 * Handle the up event from list option within the combo box component.
 *
 * @param {KeyboardEvent} event An event within the combo box component
 */


const handleUpFromListOption = event => {
  const {
    comboBoxEl,
    listEl,
    focusedOptionEl
  } = getComboBoxContext(event.target);
  const nextOptionEl = focusedOptionEl && focusedOptionEl.previousSibling;
  const listShown = !listEl.hidden;
  highlightOption(comboBoxEl, nextOptionEl);

  if (listShown) {
    event.preventDefault();
  }

  if (!nextOptionEl) {
    hideList(comboBoxEl);
  }
};
/**
 * Select list option on the mouseover event.
 *
 * @param {MouseEvent} event The mouseover event
 * @param {HTMLLIElement} listOptionEl An element within the combo box component
 */


const handleMouseover = listOptionEl => {
  const isCurrentlyFocused = listOptionEl.classList.contains(LIST_OPTION_FOCUSED_CLASS);
  if (isCurrentlyFocused) return;
  highlightOption(listOptionEl, listOptionEl, {
    preventScroll: true
  });
};
/**
 * Toggle the list when the button is clicked
 *
 * @param {HTMLElement} el An element within the combo box component
 */


const toggleList = el => {
  const {
    comboBoxEl,
    listEl,
    inputEl
  } = getComboBoxContext(el);

  if (listEl.hidden) {
    displayList(comboBoxEl);
  } else {
    hideList(comboBoxEl);
  }

  inputEl.focus();
};
/**
 * Handle click from input
 *
 * @param {HTMLInputElement} el An element within the combo box component
 */


const handleClickFromInput = el => {
  const {
    comboBoxEl,
    listEl
  } = getComboBoxContext(el);

  if (listEl.hidden) {
    displayList(comboBoxEl);
  }
};

const comboBox = behavior({
  [CLICK]: {
    [INPUT]() {
      if (this.disabled) return;
      handleClickFromInput(this);
    },

    [TOGGLE_LIST_BUTTON]() {
      if (this.disabled) return;
      toggleList(this);
    },

    [LIST_OPTION]() {
      if (this.disabled) return;
      selectItem(this);
    },

    [CLEAR_INPUT_BUTTON]() {
      if (this.disabled) return;
      clearInput(this);
    }

  },
  focusout: {
    [COMBO_BOX](event) {
      if (!this.contains(event.relatedTarget)) {
        resetSelection(this);
        hideList(this);
      }
    }

  },
  keydown: {
    [COMBO_BOX]: keymap({
      Escape: handleEscape
    }),
    [INPUT]: keymap({
      Enter: handleEnterFromInput,
      ArrowDown: handleDownFromInput,
      Down: handleDownFromInput
    }),
    [LIST_OPTION]: keymap({
      ArrowUp: handleUpFromListOption,
      Up: handleUpFromListOption,
      ArrowDown: handleDownFromListOption,
      Down: handleDownFromListOption,
      Enter: handleEnterFromListOption,
      Tab: handleTabFromListOption,
      "Shift+Tab": noop
    })
  },
  input: {
    [INPUT]() {
      const comboBoxEl = this.closest(COMBO_BOX);
      comboBoxEl.classList.remove(COMBO_BOX_PRISTINE_CLASS);
      displayList(this);
    }

  },
  mouseover: {
    [LIST_OPTION]() {
      handleMouseover(this);
    }

  }
}, {
  init(root) {
    selectOrMatches(COMBO_BOX, root).forEach(comboBoxEl => {
      enhanceComboBox(comboBoxEl);
    });
  },

  getComboBoxContext,
  enhanceComboBox,
  generateDynamicRegExp,
  disable,
  enable,
  displayList,
  hideList,
  COMBO_BOX_CLASS
});
module.exports = comboBox;

},{"../../uswds-core/src/js/config":32,"../../uswds-core/src/js/events":33,"../../uswds-core/src/js/utils/behavior":42,"../../uswds-core/src/js/utils/sanitizer":46,"../../uswds-core/src/js/utils/select-or-matches":48,"receptor/keymap":11}],19:[function(require,module,exports){
"use strict";

const keymap = require("receptor/keymap");

const behavior = require("../../uswds-core/src/js/utils/behavior");

const select = require("../../uswds-core/src/js/utils/select");

const selectOrMatches = require("../../uswds-core/src/js/utils/select-or-matches");

const {
  prefix: PREFIX
} = require("../../uswds-core/src/js/config");

const {
  CLICK
} = require("../../uswds-core/src/js/events");

const activeElement = require("../../uswds-core/src/js/utils/active-element");

const isIosDevice = require("../../uswds-core/src/js/utils/is-ios-device");

const Sanitizer = require("../../uswds-core/src/js/utils/sanitizer");

const DATE_PICKER_CLASS = `${PREFIX}-date-picker`;
const DATE_PICKER_WRAPPER_CLASS = `${DATE_PICKER_CLASS}__wrapper`;
const DATE_PICKER_INITIALIZED_CLASS = `${DATE_PICKER_CLASS}--initialized`;
const DATE_PICKER_ACTIVE_CLASS = `${DATE_PICKER_CLASS}--active`;
const DATE_PICKER_INTERNAL_INPUT_CLASS = `${DATE_PICKER_CLASS}__internal-input`;
const DATE_PICKER_EXTERNAL_INPUT_CLASS = `${DATE_PICKER_CLASS}__external-input`;
const DATE_PICKER_BUTTON_CLASS = `${DATE_PICKER_CLASS}__button`;
const DATE_PICKER_CALENDAR_CLASS = `${DATE_PICKER_CLASS}__calendar`;
const DATE_PICKER_STATUS_CLASS = `${DATE_PICKER_CLASS}__status`;
const CALENDAR_DATE_CLASS = `${DATE_PICKER_CALENDAR_CLASS}__date`;
const CALENDAR_DATE_FOCUSED_CLASS = `${CALENDAR_DATE_CLASS}--focused`;
const CALENDAR_DATE_SELECTED_CLASS = `${CALENDAR_DATE_CLASS}--selected`;
const CALENDAR_DATE_PREVIOUS_MONTH_CLASS = `${CALENDAR_DATE_CLASS}--previous-month`;
const CALENDAR_DATE_CURRENT_MONTH_CLASS = `${CALENDAR_DATE_CLASS}--current-month`;
const CALENDAR_DATE_NEXT_MONTH_CLASS = `${CALENDAR_DATE_CLASS}--next-month`;
const CALENDAR_DATE_RANGE_DATE_CLASS = `${CALENDAR_DATE_CLASS}--range-date`;
const CALENDAR_DATE_TODAY_CLASS = `${CALENDAR_DATE_CLASS}--today`;
const CALENDAR_DATE_RANGE_DATE_START_CLASS = `${CALENDAR_DATE_CLASS}--range-date-start`;
const CALENDAR_DATE_RANGE_DATE_END_CLASS = `${CALENDAR_DATE_CLASS}--range-date-end`;
const CALENDAR_DATE_WITHIN_RANGE_CLASS = `${CALENDAR_DATE_CLASS}--within-range`;
const CALENDAR_PREVIOUS_YEAR_CLASS = `${DATE_PICKER_CALENDAR_CLASS}__previous-year`;
const CALENDAR_PREVIOUS_MONTH_CLASS = `${DATE_PICKER_CALENDAR_CLASS}__previous-month`;
const CALENDAR_NEXT_YEAR_CLASS = `${DATE_PICKER_CALENDAR_CLASS}__next-year`;
const CALENDAR_NEXT_MONTH_CLASS = `${DATE_PICKER_CALENDAR_CLASS}__next-month`;
const CALENDAR_MONTH_SELECTION_CLASS = `${DATE_PICKER_CALENDAR_CLASS}__month-selection`;
const CALENDAR_YEAR_SELECTION_CLASS = `${DATE_PICKER_CALENDAR_CLASS}__year-selection`;
const CALENDAR_MONTH_CLASS = `${DATE_PICKER_CALENDAR_CLASS}__month`;
const CALENDAR_MONTH_FOCUSED_CLASS = `${CALENDAR_MONTH_CLASS}--focused`;
const CALENDAR_MONTH_SELECTED_CLASS = `${CALENDAR_MONTH_CLASS}--selected`;
const CALENDAR_YEAR_CLASS = `${DATE_PICKER_CALENDAR_CLASS}__year`;
const CALENDAR_YEAR_FOCUSED_CLASS = `${CALENDAR_YEAR_CLASS}--focused`;
const CALENDAR_YEAR_SELECTED_CLASS = `${CALENDAR_YEAR_CLASS}--selected`;
const CALENDAR_PREVIOUS_YEAR_CHUNK_CLASS = `${DATE_PICKER_CALENDAR_CLASS}__previous-year-chunk`;
const CALENDAR_NEXT_YEAR_CHUNK_CLASS = `${DATE_PICKER_CALENDAR_CLASS}__next-year-chunk`;
const CALENDAR_DATE_PICKER_CLASS = `${DATE_PICKER_CALENDAR_CLASS}__date-picker`;
const CALENDAR_MONTH_PICKER_CLASS = `${DATE_PICKER_CALENDAR_CLASS}__month-picker`;
const CALENDAR_YEAR_PICKER_CLASS = `${DATE_PICKER_CALENDAR_CLASS}__year-picker`;
const CALENDAR_TABLE_CLASS = `${DATE_PICKER_CALENDAR_CLASS}__table`;
const CALENDAR_ROW_CLASS = `${DATE_PICKER_CALENDAR_CLASS}__row`;
const CALENDAR_CELL_CLASS = `${DATE_PICKER_CALENDAR_CLASS}__cell`;
const CALENDAR_CELL_CENTER_ITEMS_CLASS = `${CALENDAR_CELL_CLASS}--center-items`;
const CALENDAR_MONTH_LABEL_CLASS = `${DATE_PICKER_CALENDAR_CLASS}__month-label`;
const CALENDAR_DAY_OF_WEEK_CLASS = `${DATE_PICKER_CALENDAR_CLASS}__day-of-week`;
const DATE_PICKER = `.${DATE_PICKER_CLASS}`;
const DATE_PICKER_BUTTON = `.${DATE_PICKER_BUTTON_CLASS}`;
const DATE_PICKER_INTERNAL_INPUT = `.${DATE_PICKER_INTERNAL_INPUT_CLASS}`;
const DATE_PICKER_EXTERNAL_INPUT = `.${DATE_PICKER_EXTERNAL_INPUT_CLASS}`;
const DATE_PICKER_CALENDAR = `.${DATE_PICKER_CALENDAR_CLASS}`;
const DATE_PICKER_STATUS = `.${DATE_PICKER_STATUS_CLASS}`;
const CALENDAR_DATE = `.${CALENDAR_DATE_CLASS}`;
const CALENDAR_DATE_FOCUSED = `.${CALENDAR_DATE_FOCUSED_CLASS}`;
const CALENDAR_DATE_CURRENT_MONTH = `.${CALENDAR_DATE_CURRENT_MONTH_CLASS}`;
const CALENDAR_PREVIOUS_YEAR = `.${CALENDAR_PREVIOUS_YEAR_CLASS}`;
const CALENDAR_PREVIOUS_MONTH = `.${CALENDAR_PREVIOUS_MONTH_CLASS}`;
const CALENDAR_NEXT_YEAR = `.${CALENDAR_NEXT_YEAR_CLASS}`;
const CALENDAR_NEXT_MONTH = `.${CALENDAR_NEXT_MONTH_CLASS}`;
const CALENDAR_YEAR_SELECTION = `.${CALENDAR_YEAR_SELECTION_CLASS}`;
const CALENDAR_MONTH_SELECTION = `.${CALENDAR_MONTH_SELECTION_CLASS}`;
const CALENDAR_MONTH = `.${CALENDAR_MONTH_CLASS}`;
const CALENDAR_YEAR = `.${CALENDAR_YEAR_CLASS}`;
const CALENDAR_PREVIOUS_YEAR_CHUNK = `.${CALENDAR_PREVIOUS_YEAR_CHUNK_CLASS}`;
const CALENDAR_NEXT_YEAR_CHUNK = `.${CALENDAR_NEXT_YEAR_CHUNK_CLASS}`;
const CALENDAR_DATE_PICKER = `.${CALENDAR_DATE_PICKER_CLASS}`;
const CALENDAR_MONTH_PICKER = `.${CALENDAR_MONTH_PICKER_CLASS}`;
const CALENDAR_YEAR_PICKER = `.${CALENDAR_YEAR_PICKER_CLASS}`;
const CALENDAR_MONTH_FOCUSED = `.${CALENDAR_MONTH_FOCUSED_CLASS}`;
const CALENDAR_YEAR_FOCUSED = `.${CALENDAR_YEAR_FOCUSED_CLASS}`;
const VALIDATION_MESSAGE = "Please enter a valid date";
const MONTH_LABELS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAY_OF_WEEK_LABELS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const ENTER_KEYCODE = 13;
const YEAR_CHUNK = 12;
const DEFAULT_MIN_DATE = "0000-01-01";
const DEFAULT_EXTERNAL_DATE_FORMAT = "MM/DD/YYYY";
const INTERNAL_DATE_FORMAT = "YYYY-MM-DD";
const NOT_DISABLED_SELECTOR = ":not([disabled])";

const processFocusableSelectors = function () {
  for (var _len = arguments.length, selectors = new Array(_len), _key = 0; _key < _len; _key++) {
    selectors[_key] = arguments[_key];
  }

  return selectors.map(query => query + NOT_DISABLED_SELECTOR).join(", ");
};

const DATE_PICKER_FOCUSABLE = processFocusableSelectors(CALENDAR_PREVIOUS_YEAR, CALENDAR_PREVIOUS_MONTH, CALENDAR_YEAR_SELECTION, CALENDAR_MONTH_SELECTION, CALENDAR_NEXT_YEAR, CALENDAR_NEXT_MONTH, CALENDAR_DATE_FOCUSED);
const MONTH_PICKER_FOCUSABLE = processFocusableSelectors(CALENDAR_MONTH_FOCUSED);
const YEAR_PICKER_FOCUSABLE = processFocusableSelectors(CALENDAR_PREVIOUS_YEAR_CHUNK, CALENDAR_NEXT_YEAR_CHUNK, CALENDAR_YEAR_FOCUSED); // #region Date Manipulation Functions

/**
 * Keep date within month. Month would only be over by 1 to 3 days
 *
 * @param {Date} dateToCheck the date object to check
 * @param {number} month the correct month
 * @returns {Date} the date, corrected if needed
 */

const keepDateWithinMonth = (dateToCheck, month) => {
  if (month !== dateToCheck.getMonth()) {
    dateToCheck.setDate(0);
  }

  return dateToCheck;
};
/**
 * Set date from month day year
 *
 * @param {number} year the year to set
 * @param {number} month the month to set (zero-indexed)
 * @param {number} date the date to set
 * @returns {Date} the set date
 */


const setDate = (year, month, date) => {
  const newDate = new Date(0);
  newDate.setFullYear(year, month, date);
  return newDate;
};
/**
 * todays date
 *
 * @returns {Date} todays date
 */


const today = () => {
  const newDate = new Date();
  const day = newDate.getDate();
  const month = newDate.getMonth();
  const year = newDate.getFullYear();
  return setDate(year, month, day);
};
/**
 * Set date to first day of the month
 *
 * @param {number} date the date to adjust
 * @returns {Date} the adjusted date
 */


const startOfMonth = date => {
  const newDate = new Date(0);
  newDate.setFullYear(date.getFullYear(), date.getMonth(), 1);
  return newDate;
};
/**
 * Set date to last day of the month
 *
 * @param {number} date the date to adjust
 * @returns {Date} the adjusted date
 */


const lastDayOfMonth = date => {
  const newDate = new Date(0);
  newDate.setFullYear(date.getFullYear(), date.getMonth() + 1, 0);
  return newDate;
};
/**
 * Add days to date
 *
 * @param {Date} _date the date to adjust
 * @param {number} numDays the difference in days
 * @returns {Date} the adjusted date
 */


const addDays = (_date, numDays) => {
  const newDate = new Date(_date.getTime());
  newDate.setDate(newDate.getDate() + numDays);
  return newDate;
};
/**
 * Subtract days from date
 *
 * @param {Date} _date the date to adjust
 * @param {number} numDays the difference in days
 * @returns {Date} the adjusted date
 */


const subDays = (_date, numDays) => addDays(_date, -numDays);
/**
 * Add weeks to date
 *
 * @param {Date} _date the date to adjust
 * @param {number} numWeeks the difference in weeks
 * @returns {Date} the adjusted date
 */


const addWeeks = (_date, numWeeks) => addDays(_date, numWeeks * 7);
/**
 * Subtract weeks from date
 *
 * @param {Date} _date the date to adjust
 * @param {number} numWeeks the difference in weeks
 * @returns {Date} the adjusted date
 */


const subWeeks = (_date, numWeeks) => addWeeks(_date, -numWeeks);
/**
 * Set date to the start of the week (Sunday)
 *
 * @param {Date} _date the date to adjust
 * @returns {Date} the adjusted date
 */


const startOfWeek = _date => {
  const dayOfWeek = _date.getDay();

  return subDays(_date, dayOfWeek);
};
/**
 * Set date to the end of the week (Saturday)
 *
 * @param {Date} _date the date to adjust
 * @param {number} numWeeks the difference in weeks
 * @returns {Date} the adjusted date
 */


const endOfWeek = _date => {
  const dayOfWeek = _date.getDay();

  return addDays(_date, 6 - dayOfWeek);
};
/**
 * Add months to date and keep date within month
 *
 * @param {Date} _date the date to adjust
 * @param {number} numMonths the difference in months
 * @returns {Date} the adjusted date
 */


const addMonths = (_date, numMonths) => {
  const newDate = new Date(_date.getTime());
  const dateMonth = (newDate.getMonth() + 12 + numMonths) % 12;
  newDate.setMonth(newDate.getMonth() + numMonths);
  keepDateWithinMonth(newDate, dateMonth);
  return newDate;
};
/**
 * Subtract months from date
 *
 * @param {Date} _date the date to adjust
 * @param {number} numMonths the difference in months
 * @returns {Date} the adjusted date
 */


const subMonths = (_date, numMonths) => addMonths(_date, -numMonths);
/**
 * Add years to date and keep date within month
 *
 * @param {Date} _date the date to adjust
 * @param {number} numYears the difference in years
 * @returns {Date} the adjusted date
 */


const addYears = (_date, numYears) => addMonths(_date, numYears * 12);
/**
 * Subtract years from date
 *
 * @param {Date} _date the date to adjust
 * @param {number} numYears the difference in years
 * @returns {Date} the adjusted date
 */


const subYears = (_date, numYears) => addYears(_date, -numYears);
/**
 * Set months of date
 *
 * @param {Date} _date the date to adjust
 * @param {number} month zero-indexed month to set
 * @returns {Date} the adjusted date
 */


const setMonth = (_date, month) => {
  const newDate = new Date(_date.getTime());
  newDate.setMonth(month);
  keepDateWithinMonth(newDate, month);
  return newDate;
};
/**
 * Set year of date
 *
 * @param {Date} _date the date to adjust
 * @param {number} year the year to set
 * @returns {Date} the adjusted date
 */


const setYear = (_date, year) => {
  const newDate = new Date(_date.getTime());
  const month = newDate.getMonth();
  newDate.setFullYear(year);
  keepDateWithinMonth(newDate, month);
  return newDate;
};
/**
 * Return the earliest date
 *
 * @param {Date} dateA date to compare
 * @param {Date} dateB date to compare
 * @returns {Date} the earliest date
 */


const min = (dateA, dateB) => {
  let newDate = dateA;

  if (dateB < dateA) {
    newDate = dateB;
  }

  return new Date(newDate.getTime());
};
/**
 * Return the latest date
 *
 * @param {Date} dateA date to compare
 * @param {Date} dateB date to compare
 * @returns {Date} the latest date
 */


const max = (dateA, dateB) => {
  let newDate = dateA;

  if (dateB > dateA) {
    newDate = dateB;
  }

  return new Date(newDate.getTime());
};
/**
 * Check if dates are the in the same year
 *
 * @param {Date} dateA date to compare
 * @param {Date} dateB date to compare
 * @returns {boolean} are dates in the same year
 */


const isSameYear = (dateA, dateB) => dateA && dateB && dateA.getFullYear() === dateB.getFullYear();
/**
 * Check if dates are the in the same month
 *
 * @param {Date} dateA date to compare
 * @param {Date} dateB date to compare
 * @returns {boolean} are dates in the same month
 */


const isSameMonth = (dateA, dateB) => isSameYear(dateA, dateB) && dateA.getMonth() === dateB.getMonth();
/**
 * Check if dates are the same date
 *
 * @param {Date} dateA the date to compare
 * @param {Date} dateA the date to compare
 * @returns {boolean} are dates the same date
 */


const isSameDay = (dateA, dateB) => isSameMonth(dateA, dateB) && dateA.getDate() === dateB.getDate();
/**
 * return a new date within minimum and maximum date
 *
 * @param {Date} date date to check
 * @param {Date} minDate minimum date to allow
 * @param {Date} maxDate maximum date to allow
 * @returns {Date} the date between min and max
 */


const keepDateBetweenMinAndMax = (date, minDate, maxDate) => {
  let newDate = date;

  if (date < minDate) {
    newDate = minDate;
  } else if (maxDate && date > maxDate) {
    newDate = maxDate;
  }

  return new Date(newDate.getTime());
};
/**
 * Check if dates is valid.
 *
 * @param {Date} date date to check
 * @param {Date} minDate minimum date to allow
 * @param {Date} maxDate maximum date to allow
 * @return {boolean} is there a day within the month within min and max dates
 */


const isDateWithinMinAndMax = (date, minDate, maxDate) => date >= minDate && (!maxDate || date <= maxDate);
/**
 * Check if dates month is invalid.
 *
 * @param {Date} date date to check
 * @param {Date} minDate minimum date to allow
 * @param {Date} maxDate maximum date to allow
 * @return {boolean} is the month outside min or max dates
 */


const isDatesMonthOutsideMinOrMax = (date, minDate, maxDate) => lastDayOfMonth(date) < minDate || maxDate && startOfMonth(date) > maxDate;
/**
 * Check if dates year is invalid.
 *
 * @param {Date} date date to check
 * @param {Date} minDate minimum date to allow
 * @param {Date} maxDate maximum date to allow
 * @return {boolean} is the month outside min or max dates
 */


const isDatesYearOutsideMinOrMax = (date, minDate, maxDate) => lastDayOfMonth(setMonth(date, 11)) < minDate || maxDate && startOfMonth(setMonth(date, 0)) > maxDate;
/**
 * Parse a date with format M-D-YY
 *
 * @param {string} dateString the date string to parse
 * @param {string} dateFormat the format of the date string
 * @param {boolean} adjustDate should the date be adjusted
 * @returns {Date} the parsed date
 */


const parseDateString = function (dateString) {
  let dateFormat = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : INTERNAL_DATE_FORMAT;
  let adjustDate = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  let date;
  let month;
  let day;
  let year;
  let parsed;

  if (dateString) {
    let monthStr;
    let dayStr;
    let yearStr;

    if (dateFormat === DEFAULT_EXTERNAL_DATE_FORMAT) {
      [monthStr, dayStr, yearStr] = dateString.split("/");
    } else {
      [yearStr, monthStr, dayStr] = dateString.split("-");
    }

    if (yearStr) {
      parsed = parseInt(yearStr, 10);

      if (!Number.isNaN(parsed)) {
        year = parsed;

        if (adjustDate) {
          year = Math.max(0, year);

          if (yearStr.length < 3) {
            const currentYear = today().getFullYear();
            const currentYearStub = currentYear - currentYear % 10 ** yearStr.length;
            year = currentYearStub + parsed;
          }
        }
      }
    }

    if (monthStr) {
      parsed = parseInt(monthStr, 10);

      if (!Number.isNaN(parsed)) {
        month = parsed;

        if (adjustDate) {
          month = Math.max(1, month);
          month = Math.min(12, month);
        }
      }
    }

    if (month && dayStr && year != null) {
      parsed = parseInt(dayStr, 10);

      if (!Number.isNaN(parsed)) {
        day = parsed;

        if (adjustDate) {
          const lastDayOfTheMonth = setDate(year, month, 0).getDate();
          day = Math.max(1, day);
          day = Math.min(lastDayOfTheMonth, day);
        }
      }
    }

    if (month && day && year != null) {
      date = setDate(year, month - 1, day);
    }
  }

  return date;
};
/**
 * Format a date to format MM-DD-YYYY
 *
 * @param {Date} date the date to format
 * @param {string} dateFormat the format of the date string
 * @returns {string} the formatted date string
 */


const formatDate = function (date) {
  let dateFormat = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : INTERNAL_DATE_FORMAT;

  const padZeros = (value, length) => `0000${value}`.slice(-length);

  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = date.getFullYear();

  if (dateFormat === DEFAULT_EXTERNAL_DATE_FORMAT) {
    return [padZeros(month, 2), padZeros(day, 2), padZeros(year, 4)].join("/");
  }

  return [padZeros(year, 4), padZeros(month, 2), padZeros(day, 2)].join("-");
}; // #endregion Date Manipulation Functions

/**
 * Create a grid string from an array of html strings
 *
 * @param {string[]} htmlArray the array of html items
 * @param {number} rowSize the length of a row
 * @returns {string} the grid string
 */


const listToGridHtml = (htmlArray, rowSize) => {
  const grid = [];
  let row = [];
  let i = 0;

  while (i < htmlArray.length) {
    row = [];
    const tr = document.createElement("tr");

    while (i < htmlArray.length && row.length < rowSize) {
      const td = document.createElement("td");
      td.insertAdjacentElement("beforeend", htmlArray[i]);
      row.push(td);
      i += 1;
    }

    row.forEach(element => {
      tr.insertAdjacentElement("beforeend", element);
    });
    grid.push(tr);
  }

  return grid;
};

const createTableBody = grid => {
  const tableBody = document.createElement("tbody");
  grid.forEach(element => {
    tableBody.insertAdjacentElement("beforeend", element);
  });
  return tableBody;
};
/**
 * set the value of the element and dispatch a change event
 *
 * @param {HTMLInputElement} el The element to update
 * @param {string} value The new value of the element
 */


const changeElementValue = function (el) {
  let value = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";
  const elementToChange = el;
  elementToChange.value = value;
  const event = new CustomEvent("change", {
    bubbles: true,
    cancelable: true,
    detail: {
      value
    }
  });
  elementToChange.dispatchEvent(event);
};
/**
 * The properties and elements within the date picker.
 * @typedef {Object} DatePickerContext
 * @property {HTMLDivElement} calendarEl
 * @property {HTMLElement} datePickerEl
 * @property {HTMLInputElement} internalInputEl
 * @property {HTMLInputElement} externalInputEl
 * @property {HTMLDivElement} statusEl
 * @property {HTMLDivElement} firstYearChunkEl
 * @property {Date} calendarDate
 * @property {Date} minDate
 * @property {Date} maxDate
 * @property {Date} selectedDate
 * @property {Date} rangeDate
 * @property {Date} defaultDate
 */

/**
 * Get an object of the properties and elements belonging directly to the given
 * date picker component.
 *
 * @param {HTMLElement} el the element within the date picker
 * @returns {DatePickerContext} elements
 */


const getDatePickerContext = el => {
  const datePickerEl = el.closest(DATE_PICKER);

  if (!datePickerEl) {
    throw new Error(`Element is missing outer ${DATE_PICKER}`);
  }

  const internalInputEl = datePickerEl.querySelector(DATE_PICKER_INTERNAL_INPUT);
  const externalInputEl = datePickerEl.querySelector(DATE_PICKER_EXTERNAL_INPUT);
  const calendarEl = datePickerEl.querySelector(DATE_PICKER_CALENDAR);
  const toggleBtnEl = datePickerEl.querySelector(DATE_PICKER_BUTTON);
  const statusEl = datePickerEl.querySelector(DATE_PICKER_STATUS);
  const firstYearChunkEl = datePickerEl.querySelector(CALENDAR_YEAR);
  const inputDate = parseDateString(externalInputEl.value, DEFAULT_EXTERNAL_DATE_FORMAT, true);
  const selectedDate = parseDateString(internalInputEl.value);
  const calendarDate = parseDateString(calendarEl.dataset.value);
  const minDate = parseDateString(datePickerEl.dataset.minDate);
  const maxDate = parseDateString(datePickerEl.dataset.maxDate);
  const rangeDate = parseDateString(datePickerEl.dataset.rangeDate);
  const defaultDate = parseDateString(datePickerEl.dataset.defaultDate);

  if (minDate && maxDate && minDate > maxDate) {
    throw new Error("Minimum date cannot be after maximum date");
  }

  return {
    calendarDate,
    minDate,
    toggleBtnEl,
    selectedDate,
    maxDate,
    firstYearChunkEl,
    datePickerEl,
    inputDate,
    internalInputEl,
    externalInputEl,
    calendarEl,
    rangeDate,
    defaultDate,
    statusEl
  };
};
/**
 * Disable the date picker component
 *
 * @param {HTMLElement} el An element within the date picker component
 */


const disable = el => {
  const {
    externalInputEl,
    toggleBtnEl
  } = getDatePickerContext(el);
  toggleBtnEl.disabled = true;
  externalInputEl.disabled = true;
};
/**
 * Enable the date picker component
 *
 * @param {HTMLElement} el An element within the date picker component
 */


const enable = el => {
  const {
    externalInputEl,
    toggleBtnEl
  } = getDatePickerContext(el);
  toggleBtnEl.disabled = false;
  externalInputEl.disabled = false;
}; // #region Validation

/**
 * Validate the value in the input as a valid date of format M/D/YYYY
 *
 * @param {HTMLElement} el An element within the date picker component
 */


const isDateInputInvalid = el => {
  const {
    externalInputEl,
    minDate,
    maxDate
  } = getDatePickerContext(el);
  const dateString = externalInputEl.value;
  let isInvalid = false;

  if (dateString) {
    isInvalid = true;
    const dateStringParts = dateString.split("/");
    const [month, day, year] = dateStringParts.map(str => {
      let value;
      const parsed = parseInt(str, 10);
      if (!Number.isNaN(parsed)) value = parsed;
      return value;
    });

    if (month && day && year != null) {
      const checkDate = setDate(year, month - 1, day);

      if (checkDate.getMonth() === month - 1 && checkDate.getDate() === day && checkDate.getFullYear() === year && dateStringParts[2].length === 4 && isDateWithinMinAndMax(checkDate, minDate, maxDate)) {
        isInvalid = false;
      }
    }
  }

  return isInvalid;
};
/**
 * Validate the value in the input as a valid date of format M/D/YYYY
 *
 * @param {HTMLElement} el An element within the date picker component
 */


const validateDateInput = el => {
  const {
    externalInputEl
  } = getDatePickerContext(el);
  const isInvalid = isDateInputInvalid(externalInputEl);

  if (isInvalid && !externalInputEl.validationMessage) {
    externalInputEl.setCustomValidity(VALIDATION_MESSAGE);
  }

  if (!isInvalid && externalInputEl.validationMessage === VALIDATION_MESSAGE) {
    externalInputEl.setCustomValidity("");
  }
}; // #endregion Validation

/**
 * Enable the date picker component
 *
 * @param {HTMLElement} el An element within the date picker component
 */


const reconcileInputValues = el => {
  const {
    internalInputEl,
    inputDate
  } = getDatePickerContext(el);
  let newValue = "";

  if (inputDate && !isDateInputInvalid(el)) {
    newValue = formatDate(inputDate);
  }

  if (internalInputEl.value !== newValue) {
    changeElementValue(internalInputEl, newValue);
  }
};
/**
 * Select the value of the date picker inputs.
 *
 * @param {HTMLButtonElement} el An element within the date picker component
 * @param {string} dateString The date string to update in YYYY-MM-DD format
 */


const setCalendarValue = (el, dateString) => {
  const parsedDate = parseDateString(dateString);

  if (parsedDate) {
    const formattedDate = formatDate(parsedDate, DEFAULT_EXTERNAL_DATE_FORMAT);
    const {
      datePickerEl,
      internalInputEl,
      externalInputEl
    } = getDatePickerContext(el);
    changeElementValue(internalInputEl, dateString);
    changeElementValue(externalInputEl, formattedDate);
    validateDateInput(datePickerEl);
  }
};
/**
 * Enhance an input with the date picker elements
 *
 * @param {HTMLElement} el The initial wrapping element of the date picker component
 */


const enhanceDatePicker = el => {
  const datePickerEl = el.closest(DATE_PICKER);
  const {
    defaultValue
  } = datePickerEl.dataset;
  const internalInputEl = datePickerEl.querySelector(`input`);

  if (!internalInputEl) {
    throw new Error(`${DATE_PICKER} is missing inner input`);
  }

  if (internalInputEl.value) {
    internalInputEl.value = "";
  }

  const minDate = parseDateString(datePickerEl.dataset.minDate || internalInputEl.getAttribute("min"));
  datePickerEl.dataset.minDate = minDate ? formatDate(minDate) : DEFAULT_MIN_DATE;
  const maxDate = parseDateString(datePickerEl.dataset.maxDate || internalInputEl.getAttribute("max"));

  if (maxDate) {
    datePickerEl.dataset.maxDate = formatDate(maxDate);
  }

  const calendarWrapper = document.createElement("div");
  calendarWrapper.classList.add(DATE_PICKER_WRAPPER_CLASS);
  const externalInputEl = internalInputEl.cloneNode();
  externalInputEl.classList.add(DATE_PICKER_EXTERNAL_INPUT_CLASS);
  externalInputEl.type = "text";
  calendarWrapper.appendChild(externalInputEl);
  calendarWrapper.insertAdjacentHTML("beforeend", Sanitizer.escapeHTML`
    <button type="button" class="${DATE_PICKER_BUTTON_CLASS}" aria-haspopup="true" aria-label="Toggle calendar"></button>
    <div class="${DATE_PICKER_CALENDAR_CLASS}" role="dialog" aria-modal="true" hidden></div>
    <div class="usa-sr-only ${DATE_PICKER_STATUS_CLASS}" role="status" aria-live="polite"></div>`);
  internalInputEl.setAttribute("aria-hidden", "true");
  internalInputEl.setAttribute("tabindex", "-1");
  internalInputEl.style.display = "none";
  internalInputEl.classList.add(DATE_PICKER_INTERNAL_INPUT_CLASS);
  internalInputEl.removeAttribute("id");
  internalInputEl.removeAttribute("name");
  internalInputEl.required = false;
  datePickerEl.appendChild(calendarWrapper);
  datePickerEl.classList.add(DATE_PICKER_INITIALIZED_CLASS);

  if (defaultValue) {
    setCalendarValue(datePickerEl, defaultValue);
  }

  if (internalInputEl.disabled) {
    disable(datePickerEl);
    internalInputEl.disabled = false;
  }
}; // #region Calendar - Date Selection View

/**
 * render the calendar.
 *
 * @param {HTMLElement} el An element within the date picker component
 * @param {Date} _dateToDisplay a date to render on the calendar
 * @returns {HTMLElement} a reference to the new calendar element
 */


const renderCalendar = (el, _dateToDisplay) => {
  const {
    datePickerEl,
    calendarEl,
    statusEl,
    selectedDate,
    maxDate,
    minDate,
    rangeDate
  } = getDatePickerContext(el);
  const todaysDate = today();
  let dateToDisplay = _dateToDisplay || todaysDate;
  const calendarWasHidden = calendarEl.hidden;
  const focusedDate = addDays(dateToDisplay, 0);
  const focusedMonth = dateToDisplay.getMonth();
  const focusedYear = dateToDisplay.getFullYear();
  const prevMonth = subMonths(dateToDisplay, 1);
  const nextMonth = addMonths(dateToDisplay, 1);
  const currentFormattedDate = formatDate(dateToDisplay);
  const firstOfMonth = startOfMonth(dateToDisplay);
  const prevButtonsDisabled = isSameMonth(dateToDisplay, minDate);
  const nextButtonsDisabled = isSameMonth(dateToDisplay, maxDate);
  const rangeConclusionDate = selectedDate || dateToDisplay;
  const rangeStartDate = rangeDate && min(rangeConclusionDate, rangeDate);
  const rangeEndDate = rangeDate && max(rangeConclusionDate, rangeDate);
  const withinRangeStartDate = rangeDate && addDays(rangeStartDate, 1);
  const withinRangeEndDate = rangeDate && subDays(rangeEndDate, 1);
  const monthLabel = MONTH_LABELS[focusedMonth];

  const generateDateHtml = dateToRender => {
    const classes = [CALENDAR_DATE_CLASS];
    const day = dateToRender.getDate();
    const month = dateToRender.getMonth();
    const year = dateToRender.getFullYear();
    const dayOfWeek = dateToRender.getDay();
    const formattedDate = formatDate(dateToRender);
    let tabindex = "-1";
    const isDisabled = !isDateWithinMinAndMax(dateToRender, minDate, maxDate);
    const isSelected = isSameDay(dateToRender, selectedDate);

    if (isSameMonth(dateToRender, prevMonth)) {
      classes.push(CALENDAR_DATE_PREVIOUS_MONTH_CLASS);
    }

    if (isSameMonth(dateToRender, focusedDate)) {
      classes.push(CALENDAR_DATE_CURRENT_MONTH_CLASS);
    }

    if (isSameMonth(dateToRender, nextMonth)) {
      classes.push(CALENDAR_DATE_NEXT_MONTH_CLASS);
    }

    if (isSelected) {
      classes.push(CALENDAR_DATE_SELECTED_CLASS);
    }

    if (isSameDay(dateToRender, todaysDate)) {
      classes.push(CALENDAR_DATE_TODAY_CLASS);
    }

    if (rangeDate) {
      if (isSameDay(dateToRender, rangeDate)) {
        classes.push(CALENDAR_DATE_RANGE_DATE_CLASS);
      }

      if (isSameDay(dateToRender, rangeStartDate)) {
        classes.push(CALENDAR_DATE_RANGE_DATE_START_CLASS);
      }

      if (isSameDay(dateToRender, rangeEndDate)) {
        classes.push(CALENDAR_DATE_RANGE_DATE_END_CLASS);
      }

      if (isDateWithinMinAndMax(dateToRender, withinRangeStartDate, withinRangeEndDate)) {
        classes.push(CALENDAR_DATE_WITHIN_RANGE_CLASS);
      }
    }

    if (isSameDay(dateToRender, focusedDate)) {
      tabindex = "0";
      classes.push(CALENDAR_DATE_FOCUSED_CLASS);
    }

    const monthStr = MONTH_LABELS[month];
    const dayStr = DAY_OF_WEEK_LABELS[dayOfWeek];
    const btn = document.createElement("button");
    btn.setAttribute("type", "button");
    btn.setAttribute("tabindex", tabindex);
    btn.setAttribute("class", classes.join(" "));
    btn.setAttribute("data-day", day);
    btn.setAttribute("data-month", month + 1);
    btn.setAttribute("data-year", year);
    btn.setAttribute("data-value", formattedDate);
    btn.setAttribute("aria-label", Sanitizer.escapeHTML`${day} ${monthStr} ${year} ${dayStr}`);
    btn.setAttribute("aria-selected", isSelected ? "true" : "false");

    if (isDisabled === true) {
      btn.disabled = true;
    }

    btn.textContent = day;
    return btn;
  }; // set date to first rendered day


  dateToDisplay = startOfWeek(firstOfMonth);
  const days = [];

  while (days.length < 28 || dateToDisplay.getMonth() === focusedMonth || days.length % 7 !== 0) {
    days.push(generateDateHtml(dateToDisplay));
    dateToDisplay = addDays(dateToDisplay, 1);
  }

  const datesGrid = listToGridHtml(days, 7);
  const newCalendar = calendarEl.cloneNode();
  newCalendar.dataset.value = currentFormattedDate;
  newCalendar.style.top = `${datePickerEl.offsetHeight}px`;
  newCalendar.hidden = false;
  newCalendar.innerHTML = Sanitizer.escapeHTML`
    <div tabindex="-1" class="${CALENDAR_DATE_PICKER_CLASS}">
      <div class="${CALENDAR_ROW_CLASS}">
        <div class="${CALENDAR_CELL_CLASS} ${CALENDAR_CELL_CENTER_ITEMS_CLASS}">
          <button
            type="button"
            class="${CALENDAR_PREVIOUS_YEAR_CLASS}"
            aria-label="Navigate back one year"
            ${prevButtonsDisabled ? `disabled="disabled"` : ""}
          ></button>
        </div>
        <div class="${CALENDAR_CELL_CLASS} ${CALENDAR_CELL_CENTER_ITEMS_CLASS}">
          <button
            type="button"
            class="${CALENDAR_PREVIOUS_MONTH_CLASS}"
            aria-label="Navigate back one month"
            ${prevButtonsDisabled ? `disabled="disabled"` : ""}
          ></button>
        </div>
        <div class="${CALENDAR_CELL_CLASS} ${CALENDAR_MONTH_LABEL_CLASS}">
          <button
            type="button"
            class="${CALENDAR_MONTH_SELECTION_CLASS}" aria-label="${monthLabel}. Click to select month"
          >${monthLabel}</button>
          <button
            type="button"
            class="${CALENDAR_YEAR_SELECTION_CLASS}" aria-label="${focusedYear}. Click to select year"
          >${focusedYear}</button>
        </div>
        <div class="${CALENDAR_CELL_CLASS} ${CALENDAR_CELL_CENTER_ITEMS_CLASS}">
          <button
            type="button"
            class="${CALENDAR_NEXT_MONTH_CLASS}"
            aria-label="Navigate forward one month"
            ${nextButtonsDisabled ? `disabled="disabled"` : ""}
          ></button>
        </div>
        <div class="${CALENDAR_CELL_CLASS} ${CALENDAR_CELL_CENTER_ITEMS_CLASS}">
          <button
            type="button"
            class="${CALENDAR_NEXT_YEAR_CLASS}"
            aria-label="Navigate forward one year"
            ${nextButtonsDisabled ? `disabled="disabled"` : ""}
          ></button>
        </div>
      </div>
    </div>
    `;
  const table = document.createElement("table");
  table.setAttribute("class", CALENDAR_TABLE_CLASS);
  table.setAttribute("role", "presentation");
  const tableHead = document.createElement("thead");
  table.insertAdjacentElement("beforeend", tableHead);
  const tableHeadRow = document.createElement("tr");
  tableHead.insertAdjacentElement("beforeend", tableHeadRow);
  const daysOfWeek = {
    Sunday: "S",
    Monday: "M",
    Tuesday: "T",
    Wednesday: "W",
    Thursday: "Th",
    Friday: "Fr",
    Saturday: "S"
  };
  Object.keys(daysOfWeek).forEach(key => {
    const th = document.createElement("th");
    th.setAttribute("class", CALENDAR_DAY_OF_WEEK_CLASS);
    th.setAttribute("scope", "presentation");
    th.setAttribute("aria-label", key);
    th.textContent = daysOfWeek[key];
    tableHeadRow.insertAdjacentElement("beforeend", th);
  });
  const tableBody = createTableBody(datesGrid);
  table.insertAdjacentElement("beforeend", tableBody); // Container for Years, Months, and Days

  const datePickerCalendarContainer = newCalendar.querySelector(CALENDAR_DATE_PICKER);
  datePickerCalendarContainer.insertAdjacentElement("beforeend", table);
  calendarEl.parentNode.replaceChild(newCalendar, calendarEl);
  datePickerEl.classList.add(DATE_PICKER_ACTIVE_CLASS);
  const statuses = [];

  if (isSameDay(selectedDate, focusedDate)) {
    statuses.push("Selected date");
  }

  if (calendarWasHidden) {
    statuses.push("You can navigate by day using left and right arrows", "Weeks by using up and down arrows", "Months by using page up and page down keys", "Years by using shift plus page up and shift plus page down", "Home and end keys navigate to the beginning and end of a week");
    statusEl.textContent = "";
  } else {
    statuses.push(`${monthLabel} ${focusedYear}`);
  }

  statusEl.textContent = statuses.join(". ");
  return newCalendar;
};
/**
 * Navigate back one year and display the calendar.
 *
 * @param {HTMLButtonElement} _buttonEl An element within the date picker component
 */


const displayPreviousYear = _buttonEl => {
  if (_buttonEl.disabled) return;
  const {
    calendarEl,
    calendarDate,
    minDate,
    maxDate
  } = getDatePickerContext(_buttonEl);
  let date = subYears(calendarDate, 1);
  date = keepDateBetweenMinAndMax(date, minDate, maxDate);
  const newCalendar = renderCalendar(calendarEl, date);
  let nextToFocus = newCalendar.querySelector(CALENDAR_PREVIOUS_YEAR);

  if (nextToFocus.disabled) {
    nextToFocus = newCalendar.querySelector(CALENDAR_DATE_PICKER);
  }

  nextToFocus.focus();
};
/**
 * Navigate back one month and display the calendar.
 *
 * @param {HTMLButtonElement} _buttonEl An element within the date picker component
 */


const displayPreviousMonth = _buttonEl => {
  if (_buttonEl.disabled) return;
  const {
    calendarEl,
    calendarDate,
    minDate,
    maxDate
  } = getDatePickerContext(_buttonEl);
  let date = subMonths(calendarDate, 1);
  date = keepDateBetweenMinAndMax(date, minDate, maxDate);
  const newCalendar = renderCalendar(calendarEl, date);
  let nextToFocus = newCalendar.querySelector(CALENDAR_PREVIOUS_MONTH);

  if (nextToFocus.disabled) {
    nextToFocus = newCalendar.querySelector(CALENDAR_DATE_PICKER);
  }

  nextToFocus.focus();
};
/**
 * Navigate forward one month and display the calendar.
 *
 * @param {HTMLButtonElement} _buttonEl An element within the date picker component
 */


const displayNextMonth = _buttonEl => {
  if (_buttonEl.disabled) return;
  const {
    calendarEl,
    calendarDate,
    minDate,
    maxDate
  } = getDatePickerContext(_buttonEl);
  let date = addMonths(calendarDate, 1);
  date = keepDateBetweenMinAndMax(date, minDate, maxDate);
  const newCalendar = renderCalendar(calendarEl, date);
  let nextToFocus = newCalendar.querySelector(CALENDAR_NEXT_MONTH);

  if (nextToFocus.disabled) {
    nextToFocus = newCalendar.querySelector(CALENDAR_DATE_PICKER);
  }

  nextToFocus.focus();
};
/**
 * Navigate forward one year and display the calendar.
 *
 * @param {HTMLButtonElement} _buttonEl An element within the date picker component
 */


const displayNextYear = _buttonEl => {
  if (_buttonEl.disabled) return;
  const {
    calendarEl,
    calendarDate,
    minDate,
    maxDate
  } = getDatePickerContext(_buttonEl);
  let date = addYears(calendarDate, 1);
  date = keepDateBetweenMinAndMax(date, minDate, maxDate);
  const newCalendar = renderCalendar(calendarEl, date);
  let nextToFocus = newCalendar.querySelector(CALENDAR_NEXT_YEAR);

  if (nextToFocus.disabled) {
    nextToFocus = newCalendar.querySelector(CALENDAR_DATE_PICKER);
  }

  nextToFocus.focus();
};
/**
 * Hide the calendar of a date picker component.
 *
 * @param {HTMLElement} el An element within the date picker component
 */


const hideCalendar = el => {
  const {
    datePickerEl,
    calendarEl,
    statusEl
  } = getDatePickerContext(el);
  datePickerEl.classList.remove(DATE_PICKER_ACTIVE_CLASS);
  calendarEl.hidden = true;
  statusEl.textContent = "";
};
/**
 * Select a date within the date picker component.
 *
 * @param {HTMLButtonElement} calendarDateEl A date element within the date picker component
 */


const selectDate = calendarDateEl => {
  if (calendarDateEl.disabled) return;
  const {
    datePickerEl,
    externalInputEl
  } = getDatePickerContext(calendarDateEl);
  setCalendarValue(calendarDateEl, calendarDateEl.dataset.value);
  hideCalendar(datePickerEl);
  externalInputEl.focus();
};
/**
 * Toggle the calendar.
 *
 * @param {HTMLButtonElement} el An element within the date picker component
 */


const toggleCalendar = el => {
  if (el.disabled) return;
  const {
    calendarEl,
    inputDate,
    minDate,
    maxDate,
    defaultDate
  } = getDatePickerContext(el);

  if (calendarEl.hidden) {
    const dateToDisplay = keepDateBetweenMinAndMax(inputDate || defaultDate || today(), minDate, maxDate);
    const newCalendar = renderCalendar(calendarEl, dateToDisplay);
    newCalendar.querySelector(CALENDAR_DATE_FOCUSED).focus();
  } else {
    hideCalendar(el);
  }
};
/**
 * Update the calendar when visible.
 *
 * @param {HTMLElement} el an element within the date picker
 */


const updateCalendarIfVisible = el => {
  const {
    calendarEl,
    inputDate,
    minDate,
    maxDate
  } = getDatePickerContext(el);
  const calendarShown = !calendarEl.hidden;

  if (calendarShown && inputDate) {
    const dateToDisplay = keepDateBetweenMinAndMax(inputDate, minDate, maxDate);
    renderCalendar(calendarEl, dateToDisplay);
  }
}; // #endregion Calendar - Date Selection View
// #region Calendar - Month Selection View

/**
 * Display the month selection screen in the date picker.
 *
 * @param {HTMLButtonElement} el An element within the date picker component
 * @returns {HTMLElement} a reference to the new calendar element
 */


const displayMonthSelection = (el, monthToDisplay) => {
  const {
    calendarEl,
    statusEl,
    calendarDate,
    minDate,
    maxDate
  } = getDatePickerContext(el);
  const selectedMonth = calendarDate.getMonth();
  const focusedMonth = monthToDisplay == null ? selectedMonth : monthToDisplay;
  const months = MONTH_LABELS.map((month, index) => {
    const monthToCheck = setMonth(calendarDate, index);
    const isDisabled = isDatesMonthOutsideMinOrMax(monthToCheck, minDate, maxDate);
    let tabindex = "-1";
    const classes = [CALENDAR_MONTH_CLASS];
    const isSelected = index === selectedMonth;

    if (index === focusedMonth) {
      tabindex = "0";
      classes.push(CALENDAR_MONTH_FOCUSED_CLASS);
    }

    if (isSelected) {
      classes.push(CALENDAR_MONTH_SELECTED_CLASS);
    }

    const btn = document.createElement("button");
    btn.setAttribute("type", "button");
    btn.setAttribute("tabindex", tabindex);
    btn.setAttribute("class", classes.join(" "));
    btn.setAttribute("data-value", index);
    btn.setAttribute("data-label", month);
    btn.setAttribute("aria-selected", isSelected ? "true" : "false");

    if (isDisabled === true) {
      btn.disabled = true;
    }

    btn.textContent = month;
    return btn;
  });
  const monthsHtml = document.createElement("div");
  monthsHtml.setAttribute("tabindex", "-1");
  monthsHtml.setAttribute("class", CALENDAR_MONTH_PICKER_CLASS);
  const table = document.createElement("table");
  table.setAttribute("class", CALENDAR_TABLE_CLASS);
  table.setAttribute("role", "presentation");
  const monthsGrid = listToGridHtml(months, 3);
  const tableBody = createTableBody(monthsGrid);
  table.insertAdjacentElement("beforeend", tableBody);
  monthsHtml.insertAdjacentElement("beforeend", table);
  const newCalendar = calendarEl.cloneNode();
  newCalendar.insertAdjacentElement("beforeend", monthsHtml);
  calendarEl.parentNode.replaceChild(newCalendar, calendarEl);
  statusEl.textContent = "Select a month.";
  return newCalendar;
};
/**
 * Select a month in the date picker component.
 *
 * @param {HTMLButtonElement} monthEl An month element within the date picker component
 */


const selectMonth = monthEl => {
  if (monthEl.disabled) return;
  const {
    calendarEl,
    calendarDate,
    minDate,
    maxDate
  } = getDatePickerContext(monthEl);
  const selectedMonth = parseInt(monthEl.dataset.value, 10);
  let date = setMonth(calendarDate, selectedMonth);
  date = keepDateBetweenMinAndMax(date, minDate, maxDate);
  const newCalendar = renderCalendar(calendarEl, date);
  newCalendar.querySelector(CALENDAR_DATE_FOCUSED).focus();
}; // #endregion Calendar - Month Selection View
// #region Calendar - Year Selection View

/**
 * Display the year selection screen in the date picker.
 *
 * @param {HTMLButtonElement} el An element within the date picker component
 * @param {number} yearToDisplay year to display in year selection
 * @returns {HTMLElement} a reference to the new calendar element
 */


const displayYearSelection = (el, yearToDisplay) => {
  const {
    calendarEl,
    statusEl,
    calendarDate,
    minDate,
    maxDate
  } = getDatePickerContext(el);
  const selectedYear = calendarDate.getFullYear();
  const focusedYear = yearToDisplay == null ? selectedYear : yearToDisplay;
  let yearToChunk = focusedYear;
  yearToChunk -= yearToChunk % YEAR_CHUNK;
  yearToChunk = Math.max(0, yearToChunk);
  const prevYearChunkDisabled = isDatesYearOutsideMinOrMax(setYear(calendarDate, yearToChunk - 1), minDate, maxDate);
  const nextYearChunkDisabled = isDatesYearOutsideMinOrMax(setYear(calendarDate, yearToChunk + YEAR_CHUNK), minDate, maxDate);
  const years = [];
  let yearIndex = yearToChunk;

  while (years.length < YEAR_CHUNK) {
    const isDisabled = isDatesYearOutsideMinOrMax(setYear(calendarDate, yearIndex), minDate, maxDate);
    let tabindex = "-1";
    const classes = [CALENDAR_YEAR_CLASS];
    const isSelected = yearIndex === selectedYear;

    if (yearIndex === focusedYear) {
      tabindex = "0";
      classes.push(CALENDAR_YEAR_FOCUSED_CLASS);
    }

    if (isSelected) {
      classes.push(CALENDAR_YEAR_SELECTED_CLASS);
    }

    const btn = document.createElement("button");
    btn.setAttribute("type", "button");
    btn.setAttribute("tabindex", tabindex);
    btn.setAttribute("class", classes.join(" "));
    btn.setAttribute("data-value", yearIndex);
    btn.setAttribute("aria-selected", isSelected ? "true" : "false");

    if (isDisabled === true) {
      btn.disabled = true;
    }

    btn.textContent = yearIndex;
    years.push(btn);
    yearIndex += 1;
  }

  const newCalendar = calendarEl.cloneNode(); // create the years calendar wrapper

  const yearsCalendarWrapper = document.createElement("div");
  yearsCalendarWrapper.setAttribute("tabindex", "-1");
  yearsCalendarWrapper.setAttribute("class", CALENDAR_YEAR_PICKER_CLASS); // create table parent

  const yearsTableParent = document.createElement("table");
  yearsTableParent.setAttribute("role", "presentation");
  yearsTableParent.setAttribute("class", CALENDAR_TABLE_CLASS); // create table body and table row

  const yearsHTMLTableBody = document.createElement("tbody");
  const yearsHTMLTableBodyRow = document.createElement("tr"); // create previous button

  const previousYearsBtn = document.createElement("button");
  previousYearsBtn.setAttribute("type", "button");
  previousYearsBtn.setAttribute("class", CALENDAR_PREVIOUS_YEAR_CHUNK_CLASS);
  previousYearsBtn.setAttribute("aria-label", `Navigate back ${YEAR_CHUNK} years`);

  if (prevYearChunkDisabled === true) {
    previousYearsBtn.disabled = true;
  }

  previousYearsBtn.innerHTML = Sanitizer.escapeHTML`&nbsp`; // create next button

  const nextYearsBtn = document.createElement("button");
  nextYearsBtn.setAttribute("type", "button");
  nextYearsBtn.setAttribute("class", CALENDAR_NEXT_YEAR_CHUNK_CLASS);
  nextYearsBtn.setAttribute("aria-label", `Navigate forward ${YEAR_CHUNK} years`);

  if (nextYearChunkDisabled === true) {
    nextYearsBtn.disabled = true;
  }

  nextYearsBtn.innerHTML = Sanitizer.escapeHTML`&nbsp`; // create the actual years table

  const yearsTable = document.createElement("table");
  yearsTable.setAttribute("class", CALENDAR_TABLE_CLASS);
  yearsTable.setAttribute("role", "presentation"); // create the years child table

  const yearsGrid = listToGridHtml(years, 3);
  const yearsTableBody = createTableBody(yearsGrid); // append the grid to the years child table

  yearsTable.insertAdjacentElement("beforeend", yearsTableBody); // create the prev button td and append the prev button

  const yearsHTMLTableBodyDetailPrev = document.createElement("td");
  yearsHTMLTableBodyDetailPrev.insertAdjacentElement("beforeend", previousYearsBtn); // create the years td and append the years child table

  const yearsHTMLTableBodyYearsDetail = document.createElement("td");
  yearsHTMLTableBodyYearsDetail.setAttribute("colspan", "3");
  yearsHTMLTableBodyYearsDetail.insertAdjacentElement("beforeend", yearsTable); // create the next button td and append the next button

  const yearsHTMLTableBodyDetailNext = document.createElement("td");
  yearsHTMLTableBodyDetailNext.insertAdjacentElement("beforeend", nextYearsBtn); // append the three td to the years child table row

  yearsHTMLTableBodyRow.insertAdjacentElement("beforeend", yearsHTMLTableBodyDetailPrev);
  yearsHTMLTableBodyRow.insertAdjacentElement("beforeend", yearsHTMLTableBodyYearsDetail);
  yearsHTMLTableBodyRow.insertAdjacentElement("beforeend", yearsHTMLTableBodyDetailNext); // append the table row to the years child table body

  yearsHTMLTableBody.insertAdjacentElement("beforeend", yearsHTMLTableBodyRow); // append the years table body to the years parent table

  yearsTableParent.insertAdjacentElement("beforeend", yearsHTMLTableBody); // append the parent table to the calendar wrapper

  yearsCalendarWrapper.insertAdjacentElement("beforeend", yearsTableParent); // append the years calender to the new calendar

  newCalendar.insertAdjacentElement("beforeend", yearsCalendarWrapper); // replace calendar

  calendarEl.parentNode.replaceChild(newCalendar, calendarEl);
  statusEl.textContent = Sanitizer.escapeHTML`Showing years ${yearToChunk} to ${yearToChunk + YEAR_CHUNK - 1}. Select a year.`;
  return newCalendar;
};
/**
 * Navigate back by years and display the year selection screen.
 *
 * @param {HTMLButtonElement} el An element within the date picker component
 */


const displayPreviousYearChunk = el => {
  if (el.disabled) return;
  const {
    calendarEl,
    calendarDate,
    minDate,
    maxDate
  } = getDatePickerContext(el);
  const yearEl = calendarEl.querySelector(CALENDAR_YEAR_FOCUSED);
  const selectedYear = parseInt(yearEl.textContent, 10);
  let adjustedYear = selectedYear - YEAR_CHUNK;
  adjustedYear = Math.max(0, adjustedYear);
  const date = setYear(calendarDate, adjustedYear);
  const cappedDate = keepDateBetweenMinAndMax(date, minDate, maxDate);
  const newCalendar = displayYearSelection(calendarEl, cappedDate.getFullYear());
  let nextToFocus = newCalendar.querySelector(CALENDAR_PREVIOUS_YEAR_CHUNK);

  if (nextToFocus.disabled) {
    nextToFocus = newCalendar.querySelector(CALENDAR_YEAR_PICKER);
  }

  nextToFocus.focus();
};
/**
 * Navigate forward by years and display the year selection screen.
 *
 * @param {HTMLButtonElement} el An element within the date picker component
 */


const displayNextYearChunk = el => {
  if (el.disabled) return;
  const {
    calendarEl,
    calendarDate,
    minDate,
    maxDate
  } = getDatePickerContext(el);
  const yearEl = calendarEl.querySelector(CALENDAR_YEAR_FOCUSED);
  const selectedYear = parseInt(yearEl.textContent, 10);
  let adjustedYear = selectedYear + YEAR_CHUNK;
  adjustedYear = Math.max(0, adjustedYear);
  const date = setYear(calendarDate, adjustedYear);
  const cappedDate = keepDateBetweenMinAndMax(date, minDate, maxDate);
  const newCalendar = displayYearSelection(calendarEl, cappedDate.getFullYear());
  let nextToFocus = newCalendar.querySelector(CALENDAR_NEXT_YEAR_CHUNK);

  if (nextToFocus.disabled) {
    nextToFocus = newCalendar.querySelector(CALENDAR_YEAR_PICKER);
  }

  nextToFocus.focus();
};
/**
 * Select a year in the date picker component.
 *
 * @param {HTMLButtonElement} yearEl A year element within the date picker component
 */


const selectYear = yearEl => {
  if (yearEl.disabled) return;
  const {
    calendarEl,
    calendarDate,
    minDate,
    maxDate
  } = getDatePickerContext(yearEl);
  const selectedYear = parseInt(yearEl.innerHTML, 10);
  let date = setYear(calendarDate, selectedYear);
  date = keepDateBetweenMinAndMax(date, minDate, maxDate);
  const newCalendar = renderCalendar(calendarEl, date);
  newCalendar.querySelector(CALENDAR_DATE_FOCUSED).focus();
}; // #endregion Calendar - Year Selection View
// #region Calendar Event Handling

/**
 * Hide the calendar.
 *
 * @param {KeyboardEvent} event the keydown event
 */


const handleEscapeFromCalendar = event => {
  const {
    datePickerEl,
    externalInputEl
  } = getDatePickerContext(event.target);
  hideCalendar(datePickerEl);
  externalInputEl.focus();
  event.preventDefault();
}; // #endregion Calendar Event Handling
// #region Calendar Date Event Handling

/**
 * Adjust the date and display the calendar if needed.
 *
 * @param {function} adjustDateFn function that returns the adjusted date
 */


const adjustCalendar = adjustDateFn => event => {
  const {
    calendarEl,
    calendarDate,
    minDate,
    maxDate
  } = getDatePickerContext(event.target);
  const date = adjustDateFn(calendarDate);
  const cappedDate = keepDateBetweenMinAndMax(date, minDate, maxDate);

  if (!isSameDay(calendarDate, cappedDate)) {
    const newCalendar = renderCalendar(calendarEl, cappedDate);
    newCalendar.querySelector(CALENDAR_DATE_FOCUSED).focus();
  }

  event.preventDefault();
};
/**
 * Navigate back one week and display the calendar.
 *
 * @param {KeyboardEvent} event the keydown event
 */


const handleUpFromDate = adjustCalendar(date => subWeeks(date, 1));
/**
 * Navigate forward one week and display the calendar.
 *
 * @param {KeyboardEvent} event the keydown event
 */

const handleDownFromDate = adjustCalendar(date => addWeeks(date, 1));
/**
 * Navigate back one day and display the calendar.
 *
 * @param {KeyboardEvent} event the keydown event
 */

const handleLeftFromDate = adjustCalendar(date => subDays(date, 1));
/**
 * Navigate forward one day and display the calendar.
 *
 * @param {KeyboardEvent} event the keydown event
 */

const handleRightFromDate = adjustCalendar(date => addDays(date, 1));
/**
 * Navigate to the start of the week and display the calendar.
 *
 * @param {KeyboardEvent} event the keydown event
 */

const handleHomeFromDate = adjustCalendar(date => startOfWeek(date));
/**
 * Navigate to the end of the week and display the calendar.
 *
 * @param {KeyboardEvent} event the keydown event
 */

const handleEndFromDate = adjustCalendar(date => endOfWeek(date));
/**
 * Navigate forward one month and display the calendar.
 *
 * @param {KeyboardEvent} event the keydown event
 */

const handlePageDownFromDate = adjustCalendar(date => addMonths(date, 1));
/**
 * Navigate back one month and display the calendar.
 *
 * @param {KeyboardEvent} event the keydown event
 */

const handlePageUpFromDate = adjustCalendar(date => subMonths(date, 1));
/**
 * Navigate forward one year and display the calendar.
 *
 * @param {KeyboardEvent} event the keydown event
 */

const handleShiftPageDownFromDate = adjustCalendar(date => addYears(date, 1));
/**
 * Navigate back one year and display the calendar.
 *
 * @param {KeyboardEvent} event the keydown event
 */

const handleShiftPageUpFromDate = adjustCalendar(date => subYears(date, 1));
/**
 * display the calendar for the mouseover date.
 *
 * @param {MouseEvent} event The mouseover event
 * @param {HTMLButtonElement} dateEl A date element within the date picker component
 */

const handleMouseoverFromDate = dateEl => {
  if (dateEl.disabled) return;
  const calendarEl = dateEl.closest(DATE_PICKER_CALENDAR);
  const currentCalendarDate = calendarEl.dataset.value;
  const hoverDate = dateEl.dataset.value;
  if (hoverDate === currentCalendarDate) return;
  const dateToDisplay = parseDateString(hoverDate);
  const newCalendar = renderCalendar(calendarEl, dateToDisplay);
  newCalendar.querySelector(CALENDAR_DATE_FOCUSED).focus();
}; // #endregion Calendar Date Event Handling
// #region Calendar Month Event Handling

/**
 * Adjust the month and display the month selection screen if needed.
 *
 * @param {function} adjustMonthFn function that returns the adjusted month
 */


const adjustMonthSelectionScreen = adjustMonthFn => event => {
  const monthEl = event.target;
  const selectedMonth = parseInt(monthEl.dataset.value, 10);
  const {
    calendarEl,
    calendarDate,
    minDate,
    maxDate
  } = getDatePickerContext(monthEl);
  const currentDate = setMonth(calendarDate, selectedMonth);
  let adjustedMonth = adjustMonthFn(selectedMonth);
  adjustedMonth = Math.max(0, Math.min(11, adjustedMonth));
  const date = setMonth(calendarDate, adjustedMonth);
  const cappedDate = keepDateBetweenMinAndMax(date, minDate, maxDate);

  if (!isSameMonth(currentDate, cappedDate)) {
    const newCalendar = displayMonthSelection(calendarEl, cappedDate.getMonth());
    newCalendar.querySelector(CALENDAR_MONTH_FOCUSED).focus();
  }

  event.preventDefault();
};
/**
 * Navigate back three months and display the month selection screen.
 *
 * @param {KeyboardEvent} event the keydown event
 */


const handleUpFromMonth = adjustMonthSelectionScreen(month => month - 3);
/**
 * Navigate forward three months and display the month selection screen.
 *
 * @param {KeyboardEvent} event the keydown event
 */

const handleDownFromMonth = adjustMonthSelectionScreen(month => month + 3);
/**
 * Navigate back one month and display the month selection screen.
 *
 * @param {KeyboardEvent} event the keydown event
 */

const handleLeftFromMonth = adjustMonthSelectionScreen(month => month - 1);
/**
 * Navigate forward one month and display the month selection screen.
 *
 * @param {KeyboardEvent} event the keydown event
 */

const handleRightFromMonth = adjustMonthSelectionScreen(month => month + 1);
/**
 * Navigate to the start of the row of months and display the month selection screen.
 *
 * @param {KeyboardEvent} event the keydown event
 */

const handleHomeFromMonth = adjustMonthSelectionScreen(month => month - month % 3);
/**
 * Navigate to the end of the row of months and display the month selection screen.
 *
 * @param {KeyboardEvent} event the keydown event
 */

const handleEndFromMonth = adjustMonthSelectionScreen(month => month + 2 - month % 3);
/**
 * Navigate to the last month (December) and display the month selection screen.
 *
 * @param {KeyboardEvent} event the keydown event
 */

const handlePageDownFromMonth = adjustMonthSelectionScreen(() => 11);
/**
 * Navigate to the first month (January) and display the month selection screen.
 *
 * @param {KeyboardEvent} event the keydown event
 */

const handlePageUpFromMonth = adjustMonthSelectionScreen(() => 0);
/**
 * update the focus on a month when the mouse moves.
 *
 * @param {MouseEvent} event The mouseover event
 * @param {HTMLButtonElement} monthEl A month element within the date picker component
 */

const handleMouseoverFromMonth = monthEl => {
  if (monthEl.disabled) return;
  if (monthEl.classList.contains(CALENDAR_MONTH_FOCUSED_CLASS)) return;
  const focusMonth = parseInt(monthEl.dataset.value, 10);
  const newCalendar = displayMonthSelection(monthEl, focusMonth);
  newCalendar.querySelector(CALENDAR_MONTH_FOCUSED).focus();
}; // #endregion Calendar Month Event Handling
// #region Calendar Year Event Handling

/**
 * Adjust the year and display the year selection screen if needed.
 *
 * @param {function} adjustYearFn function that returns the adjusted year
 */


const adjustYearSelectionScreen = adjustYearFn => event => {
  const yearEl = event.target;
  const selectedYear = parseInt(yearEl.dataset.value, 10);
  const {
    calendarEl,
    calendarDate,
    minDate,
    maxDate
  } = getDatePickerContext(yearEl);
  const currentDate = setYear(calendarDate, selectedYear);
  let adjustedYear = adjustYearFn(selectedYear);
  adjustedYear = Math.max(0, adjustedYear);
  const date = setYear(calendarDate, adjustedYear);
  const cappedDate = keepDateBetweenMinAndMax(date, minDate, maxDate);

  if (!isSameYear(currentDate, cappedDate)) {
    const newCalendar = displayYearSelection(calendarEl, cappedDate.getFullYear());
    newCalendar.querySelector(CALENDAR_YEAR_FOCUSED).focus();
  }

  event.preventDefault();
};
/**
 * Navigate back three years and display the year selection screen.
 *
 * @param {KeyboardEvent} event the keydown event
 */


const handleUpFromYear = adjustYearSelectionScreen(year => year - 3);
/**
 * Navigate forward three years and display the year selection screen.
 *
 * @param {KeyboardEvent} event the keydown event
 */

const handleDownFromYear = adjustYearSelectionScreen(year => year + 3);
/**
 * Navigate back one year and display the year selection screen.
 *
 * @param {KeyboardEvent} event the keydown event
 */

const handleLeftFromYear = adjustYearSelectionScreen(year => year - 1);
/**
 * Navigate forward one year and display the year selection screen.
 *
 * @param {KeyboardEvent} event the keydown event
 */

const handleRightFromYear = adjustYearSelectionScreen(year => year + 1);
/**
 * Navigate to the start of the row of years and display the year selection screen.
 *
 * @param {KeyboardEvent} event the keydown event
 */

const handleHomeFromYear = adjustYearSelectionScreen(year => year - year % 3);
/**
 * Navigate to the end of the row of years and display the year selection screen.
 *
 * @param {KeyboardEvent} event the keydown event
 */

const handleEndFromYear = adjustYearSelectionScreen(year => year + 2 - year % 3);
/**
 * Navigate to back 12 years and display the year selection screen.
 *
 * @param {KeyboardEvent} event the keydown event
 */

const handlePageUpFromYear = adjustYearSelectionScreen(year => year - YEAR_CHUNK);
/**
 * Navigate forward 12 years and display the year selection screen.
 *
 * @param {KeyboardEvent} event the keydown event
 */

const handlePageDownFromYear = adjustYearSelectionScreen(year => year + YEAR_CHUNK);
/**
 * update the focus on a year when the mouse moves.
 *
 * @param {MouseEvent} event The mouseover event
 * @param {HTMLButtonElement} dateEl A year element within the date picker component
 */

const handleMouseoverFromYear = yearEl => {
  if (yearEl.disabled) return;
  if (yearEl.classList.contains(CALENDAR_YEAR_FOCUSED_CLASS)) return;
  const focusYear = parseInt(yearEl.dataset.value, 10);
  const newCalendar = displayYearSelection(yearEl, focusYear);
  newCalendar.querySelector(CALENDAR_YEAR_FOCUSED).focus();
}; // #endregion Calendar Year Event Handling
// #region Focus Handling Event Handling


const tabHandler = focusable => {
  const getFocusableContext = el => {
    const {
      calendarEl
    } = getDatePickerContext(el);
    const focusableElements = select(focusable, calendarEl);
    const firstTabIndex = 0;
    const lastTabIndex = focusableElements.length - 1;
    const firstTabStop = focusableElements[firstTabIndex];
    const lastTabStop = focusableElements[lastTabIndex];
    const focusIndex = focusableElements.indexOf(activeElement());
    const isLastTab = focusIndex === lastTabIndex;
    const isFirstTab = focusIndex === firstTabIndex;
    const isNotFound = focusIndex === -1;
    return {
      focusableElements,
      isNotFound,
      firstTabStop,
      isFirstTab,
      lastTabStop,
      isLastTab
    };
  };

  return {
    tabAhead(event) {
      const {
        firstTabStop,
        isLastTab,
        isNotFound
      } = getFocusableContext(event.target);

      if (isLastTab || isNotFound) {
        event.preventDefault();
        firstTabStop.focus();
      }
    },

    tabBack(event) {
      const {
        lastTabStop,
        isFirstTab,
        isNotFound
      } = getFocusableContext(event.target);

      if (isFirstTab || isNotFound) {
        event.preventDefault();
        lastTabStop.focus();
      }
    }

  };
};

const datePickerTabEventHandler = tabHandler(DATE_PICKER_FOCUSABLE);
const monthPickerTabEventHandler = tabHandler(MONTH_PICKER_FOCUSABLE);
const yearPickerTabEventHandler = tabHandler(YEAR_PICKER_FOCUSABLE); // #endregion Focus Handling Event Handling
// #region Date Picker Event Delegation Registration / Component

const datePickerEvents = {
  [CLICK]: {
    [DATE_PICKER_BUTTON]() {
      toggleCalendar(this);
    },

    [CALENDAR_DATE]() {
      selectDate(this);
    },

    [CALENDAR_MONTH]() {
      selectMonth(this);
    },

    [CALENDAR_YEAR]() {
      selectYear(this);
    },

    [CALENDAR_PREVIOUS_MONTH]() {
      displayPreviousMonth(this);
    },

    [CALENDAR_NEXT_MONTH]() {
      displayNextMonth(this);
    },

    [CALENDAR_PREVIOUS_YEAR]() {
      displayPreviousYear(this);
    },

    [CALENDAR_NEXT_YEAR]() {
      displayNextYear(this);
    },

    [CALENDAR_PREVIOUS_YEAR_CHUNK]() {
      displayPreviousYearChunk(this);
    },

    [CALENDAR_NEXT_YEAR_CHUNK]() {
      displayNextYearChunk(this);
    },

    [CALENDAR_MONTH_SELECTION]() {
      const newCalendar = displayMonthSelection(this);
      newCalendar.querySelector(CALENDAR_MONTH_FOCUSED).focus();
    },

    [CALENDAR_YEAR_SELECTION]() {
      const newCalendar = displayYearSelection(this);
      newCalendar.querySelector(CALENDAR_YEAR_FOCUSED).focus();
    }

  },
  keyup: {
    [DATE_PICKER_CALENDAR](event) {
      const keydown = this.dataset.keydownKeyCode;

      if (`${event.keyCode}` !== keydown) {
        event.preventDefault();
      }
    }

  },
  keydown: {
    [DATE_PICKER_EXTERNAL_INPUT](event) {
      if (event.keyCode === ENTER_KEYCODE) {
        validateDateInput(this);
      }
    },

    [CALENDAR_DATE]: keymap({
      Up: handleUpFromDate,
      ArrowUp: handleUpFromDate,
      Down: handleDownFromDate,
      ArrowDown: handleDownFromDate,
      Left: handleLeftFromDate,
      ArrowLeft: handleLeftFromDate,
      Right: handleRightFromDate,
      ArrowRight: handleRightFromDate,
      Home: handleHomeFromDate,
      End: handleEndFromDate,
      PageDown: handlePageDownFromDate,
      PageUp: handlePageUpFromDate,
      "Shift+PageDown": handleShiftPageDownFromDate,
      "Shift+PageUp": handleShiftPageUpFromDate,
      Tab: datePickerTabEventHandler.tabAhead
    }),
    [CALENDAR_DATE_PICKER]: keymap({
      Tab: datePickerTabEventHandler.tabAhead,
      "Shift+Tab": datePickerTabEventHandler.tabBack
    }),
    [CALENDAR_MONTH]: keymap({
      Up: handleUpFromMonth,
      ArrowUp: handleUpFromMonth,
      Down: handleDownFromMonth,
      ArrowDown: handleDownFromMonth,
      Left: handleLeftFromMonth,
      ArrowLeft: handleLeftFromMonth,
      Right: handleRightFromMonth,
      ArrowRight: handleRightFromMonth,
      Home: handleHomeFromMonth,
      End: handleEndFromMonth,
      PageDown: handlePageDownFromMonth,
      PageUp: handlePageUpFromMonth
    }),
    [CALENDAR_MONTH_PICKER]: keymap({
      Tab: monthPickerTabEventHandler.tabAhead,
      "Shift+Tab": monthPickerTabEventHandler.tabBack
    }),
    [CALENDAR_YEAR]: keymap({
      Up: handleUpFromYear,
      ArrowUp: handleUpFromYear,
      Down: handleDownFromYear,
      ArrowDown: handleDownFromYear,
      Left: handleLeftFromYear,
      ArrowLeft: handleLeftFromYear,
      Right: handleRightFromYear,
      ArrowRight: handleRightFromYear,
      Home: handleHomeFromYear,
      End: handleEndFromYear,
      PageDown: handlePageDownFromYear,
      PageUp: handlePageUpFromYear
    }),
    [CALENDAR_YEAR_PICKER]: keymap({
      Tab: yearPickerTabEventHandler.tabAhead,
      "Shift+Tab": yearPickerTabEventHandler.tabBack
    }),

    [DATE_PICKER_CALENDAR](event) {
      this.dataset.keydownKeyCode = event.keyCode;
    },

    [DATE_PICKER](event) {
      const keyMap = keymap({
        Escape: handleEscapeFromCalendar
      });
      keyMap(event);
    }

  },
  focusout: {
    [DATE_PICKER_EXTERNAL_INPUT]() {
      validateDateInput(this);
    },

    [DATE_PICKER](event) {
      if (!this.contains(event.relatedTarget)) {
        hideCalendar(this);
      }
    }

  },
  input: {
    [DATE_PICKER_EXTERNAL_INPUT]() {
      reconcileInputValues(this);
      updateCalendarIfVisible(this);
    }

  }
};

if (!isIosDevice()) {
  datePickerEvents.mouseover = {
    [CALENDAR_DATE_CURRENT_MONTH]() {
      handleMouseoverFromDate(this);
    },

    [CALENDAR_MONTH]() {
      handleMouseoverFromMonth(this);
    },

    [CALENDAR_YEAR]() {
      handleMouseoverFromYear(this);
    }

  };
}

const datePicker = behavior(datePickerEvents, {
  init(root) {
    selectOrMatches(DATE_PICKER, root).forEach(datePickerEl => {
      enhanceDatePicker(datePickerEl);
    });
  },

  getDatePickerContext,
  disable,
  enable,
  isDateInputInvalid,
  setCalendarValue,
  validateDateInput,
  renderCalendar,
  updateCalendarIfVisible
}); // #endregion Date Picker Event Delegation Registration / Component

module.exports = datePicker;

},{"../../uswds-core/src/js/config":32,"../../uswds-core/src/js/events":33,"../../uswds-core/src/js/utils/active-element":41,"../../uswds-core/src/js/utils/behavior":42,"../../uswds-core/src/js/utils/is-ios-device":45,"../../uswds-core/src/js/utils/sanitizer":46,"../../uswds-core/src/js/utils/select":49,"../../uswds-core/src/js/utils/select-or-matches":48,"receptor/keymap":11}],20:[function(require,module,exports){
"use strict";

const behavior = require("../../uswds-core/src/js/utils/behavior");

const select = require("../../uswds-core/src/js/utils/select");

const selectOrMatches = require("../../uswds-core/src/js/utils/select-or-matches");

const {
  prefix: PREFIX
} = require("../../uswds-core/src/js/config");

const {
  getDatePickerContext,
  isDateInputInvalid,
  updateCalendarIfVisible
} = require("../../usa-date-picker/src/index");

const DATE_PICKER_CLASS = `${PREFIX}-date-picker`;
const DATE_RANGE_PICKER_CLASS = `${PREFIX}-date-range-picker`;
const DATE_RANGE_PICKER_RANGE_START_CLASS = `${DATE_RANGE_PICKER_CLASS}__range-start`;
const DATE_RANGE_PICKER_RANGE_END_CLASS = `${DATE_RANGE_PICKER_CLASS}__range-end`;
const DATE_PICKER = `.${DATE_PICKER_CLASS}`;
const DATE_RANGE_PICKER = `.${DATE_RANGE_PICKER_CLASS}`;
const DATE_RANGE_PICKER_RANGE_START = `.${DATE_RANGE_PICKER_RANGE_START_CLASS}`;
const DATE_RANGE_PICKER_RANGE_END = `.${DATE_RANGE_PICKER_RANGE_END_CLASS}`;
const DEFAULT_MIN_DATE = "0000-01-01";
/**
 * The properties and elements within the date range picker.
 * @typedef {Object} DateRangePickerContext
 * @property {HTMLElement} dateRangePickerEl
 * @property {HTMLElement} rangeStartEl
 * @property {HTMLElement} rangeEndEl
 */

/**
 * Get an object of the properties and elements belonging directly to the given
 * date picker component.
 *
 * @param {HTMLElement} el the element within the date picker
 * @returns {DateRangePickerContext} elements
 */

const getDateRangePickerContext = el => {
  const dateRangePickerEl = el.closest(DATE_RANGE_PICKER);

  if (!dateRangePickerEl) {
    throw new Error(`Element is missing outer ${DATE_RANGE_PICKER}`);
  }

  const rangeStartEl = dateRangePickerEl.querySelector(DATE_RANGE_PICKER_RANGE_START);
  const rangeEndEl = dateRangePickerEl.querySelector(DATE_RANGE_PICKER_RANGE_END);
  return {
    dateRangePickerEl,
    rangeStartEl,
    rangeEndEl
  };
};
/**
 * handle update from range start date picker
 *
 * @param {HTMLElement} el an element within the date range picker
 */


const handleRangeStartUpdate = el => {
  const {
    dateRangePickerEl,
    rangeStartEl,
    rangeEndEl
  } = getDateRangePickerContext(el);
  const {
    internalInputEl
  } = getDatePickerContext(rangeStartEl);
  const updatedDate = internalInputEl.value;

  if (updatedDate && !isDateInputInvalid(internalInputEl)) {
    rangeEndEl.dataset.minDate = updatedDate;
    rangeEndEl.dataset.rangeDate = updatedDate;
    rangeEndEl.dataset.defaultDate = updatedDate;
  } else {
    rangeEndEl.dataset.minDate = dateRangePickerEl.dataset.minDate || "";
    rangeEndEl.dataset.rangeDate = "";
    rangeEndEl.dataset.defaultDate = "";
  }

  updateCalendarIfVisible(rangeEndEl);
};
/**
 * handle update from range start date picker
 *
 * @param {HTMLElement} el an element within the date range picker
 */


const handleRangeEndUpdate = el => {
  const {
    dateRangePickerEl,
    rangeStartEl,
    rangeEndEl
  } = getDateRangePickerContext(el);
  const {
    internalInputEl
  } = getDatePickerContext(rangeEndEl);
  const updatedDate = internalInputEl.value;

  if (updatedDate && !isDateInputInvalid(internalInputEl)) {
    rangeStartEl.dataset.maxDate = updatedDate;
    rangeStartEl.dataset.rangeDate = updatedDate;
    rangeStartEl.dataset.defaultDate = updatedDate;
  } else {
    rangeStartEl.dataset.maxDate = dateRangePickerEl.dataset.maxDate || "";
    rangeStartEl.dataset.rangeDate = "";
    rangeStartEl.dataset.defaultDate = "";
  }

  updateCalendarIfVisible(rangeStartEl);
};
/**
 * Enhance an input with the date picker elements
 *
 * @param {HTMLElement} el The initial wrapping element of the date range picker component
 */


const enhanceDateRangePicker = el => {
  const dateRangePickerEl = el.closest(DATE_RANGE_PICKER);
  const [rangeStart, rangeEnd] = select(DATE_PICKER, dateRangePickerEl);

  if (!rangeStart) {
    throw new Error(`${DATE_RANGE_PICKER} is missing inner two '${DATE_PICKER}' elements`);
  }

  if (!rangeEnd) {
    throw new Error(`${DATE_RANGE_PICKER} is missing second '${DATE_PICKER}' element`);
  }

  rangeStart.classList.add(DATE_RANGE_PICKER_RANGE_START_CLASS);
  rangeEnd.classList.add(DATE_RANGE_PICKER_RANGE_END_CLASS);

  if (!dateRangePickerEl.dataset.minDate) {
    dateRangePickerEl.dataset.minDate = DEFAULT_MIN_DATE;
  }

  const {
    minDate
  } = dateRangePickerEl.dataset;
  rangeStart.dataset.minDate = minDate;
  rangeEnd.dataset.minDate = minDate;
  const {
    maxDate
  } = dateRangePickerEl.dataset;

  if (maxDate) {
    rangeStart.dataset.maxDate = maxDate;
    rangeEnd.dataset.maxDate = maxDate;
  }

  handleRangeStartUpdate(dateRangePickerEl);
  handleRangeEndUpdate(dateRangePickerEl);
};

const dateRangePicker = behavior({
  "input change": {
    [DATE_RANGE_PICKER_RANGE_START]() {
      handleRangeStartUpdate(this);
    },

    [DATE_RANGE_PICKER_RANGE_END]() {
      handleRangeEndUpdate(this);
    }

  }
}, {
  init(root) {
    selectOrMatches(DATE_RANGE_PICKER, root).forEach(dateRangePickerEl => {
      enhanceDateRangePicker(dateRangePickerEl);
    });
  }

});
module.exports = dateRangePicker;

},{"../../usa-date-picker/src/index":19,"../../uswds-core/src/js/config":32,"../../uswds-core/src/js/utils/behavior":42,"../../uswds-core/src/js/utils/select":49,"../../uswds-core/src/js/utils/select-or-matches":48}],21:[function(require,module,exports){
"use strict";

const selectOrMatches = require("../../uswds-core/src/js/utils/select-or-matches");

const behavior = require("../../uswds-core/src/js/utils/behavior");

const Sanitizer = require("../../uswds-core/src/js/utils/sanitizer");

const {
  prefix: PREFIX
} = require("../../uswds-core/src/js/config");

const DROPZONE_CLASS = `${PREFIX}-file-input`;
const DROPZONE = `.${DROPZONE_CLASS}`;
const INPUT_CLASS = `${PREFIX}-file-input__input`;
const TARGET_CLASS = `${PREFIX}-file-input__target`;
const INPUT = `.${INPUT_CLASS}`;
const BOX_CLASS = `${PREFIX}-file-input__box`;
const INSTRUCTIONS_CLASS = `${PREFIX}-file-input__instructions`;
const PREVIEW_CLASS = `${PREFIX}-file-input__preview`;
const PREVIEW_HEADING_CLASS = `${PREFIX}-file-input__preview-heading`;
const DISABLED_CLASS = `${PREFIX}-file-input--disabled`;
const CHOOSE_CLASS = `${PREFIX}-file-input__choose`;
const ACCEPTED_FILE_MESSAGE_CLASS = `${PREFIX}-file-input__accepted-files-message`;
const DRAG_TEXT_CLASS = `${PREFIX}-file-input__drag-text`;
const DRAG_CLASS = `${PREFIX}-file-input--drag`;
const LOADING_CLASS = "is-loading";
const HIDDEN_CLASS = "display-none";
const INVALID_FILE_CLASS = "has-invalid-file";
const GENERIC_PREVIEW_CLASS_NAME = `${PREFIX}-file-input__preview-image`;
const GENERIC_PREVIEW_CLASS = `${GENERIC_PREVIEW_CLASS_NAME}--generic`;
const PDF_PREVIEW_CLASS = `${GENERIC_PREVIEW_CLASS_NAME}--pdf`;
const WORD_PREVIEW_CLASS = `${GENERIC_PREVIEW_CLASS_NAME}--word`;
const VIDEO_PREVIEW_CLASS = `${GENERIC_PREVIEW_CLASS_NAME}--video`;
const EXCEL_PREVIEW_CLASS = `${GENERIC_PREVIEW_CLASS_NAME}--excel`;
const SPACER_GIF = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
let TYPE_IS_VALID = Boolean(true); // logic gate for change listener

/**
 * The properties and elements within the file input.
 * @typedef {Object} FileInputContext
 * @property {HTMLDivElement} dropZoneEl
 * @property {HTMLInputElement} inputEl
 */

/**
 * Get an object of the properties and elements belonging directly to the given
 * file input component.
 *
 * @param {HTMLElement} el the element within the file input
 * @returns {FileInputContext} elements
 */

const getFileInputContext = el => {
  const dropZoneEl = el.closest(DROPZONE);

  if (!dropZoneEl) {
    throw new Error(`Element is missing outer ${DROPZONE}`);
  }

  const inputEl = dropZoneEl.querySelector(INPUT);
  return {
    dropZoneEl,
    inputEl
  };
};
/**
 * Disable the file input component
 *
 * @param {HTMLElement} el An element within the file input component
 */


const disable = el => {
  const {
    dropZoneEl,
    inputEl
  } = getFileInputContext(el);
  inputEl.disabled = true;
  dropZoneEl.classList.add(DISABLED_CLASS);
  dropZoneEl.setAttribute("aria-disabled", "true");
};
/**
 * Enable the file input component
 *
 * @param {HTMLElement} el An element within the file input component
 */


const enable = el => {
  const {
    dropZoneEl,
    inputEl
  } = getFileInputContext(el);
  inputEl.disabled = false;
  dropZoneEl.classList.remove(DISABLED_CLASS);
  dropZoneEl.removeAttribute("aria-disabled");
};
/**
 *
 * @param {String} s special characters
 * @returns {String} replaces specified values
 */


const replaceName = s => {
  const c = s.charCodeAt(0);
  if (c === 32) return "-";
  if (c >= 65 && c <= 90) return `img_${s.toLowerCase()}`;
  return `__${("000", c.toString(16)).slice(-4)}`;
};
/**
 * Creates an ID name for each file that strips all invalid characters.
 * @param {String} name - name of the file added to file input (searchvalue)
 * @returns {String} same characters as the name with invalid chars removed (newvalue)
 */


const makeSafeForID = name => name.replace(/[^a-z0-9]/g, replaceName); // Takes a generated safe ID and creates a unique ID.


const createUniqueID = name => `${name}-${Math.floor(Date.now().toString() / 1000)}`;
/**
 * Builds full file input component
 * @param {HTMLElement} fileInputEl - original file input on page
 * @returns {HTMLElement|HTMLElement} - Instructions, target area div
 */


const buildFileInput = fileInputEl => {
  const acceptsMultiple = fileInputEl.hasAttribute("multiple");
  const fileInputParent = document.createElement("div");
  const dropTarget = document.createElement("div");
  const box = document.createElement("div");
  const instructions = document.createElement("div");
  const disabled = fileInputEl.hasAttribute("disabled");
  let defaultAriaLabel; // Adds class names and other attributes

  fileInputEl.classList.remove(DROPZONE_CLASS);
  fileInputEl.classList.add(INPUT_CLASS);
  fileInputParent.classList.add(DROPZONE_CLASS);
  box.classList.add(BOX_CLASS);
  instructions.classList.add(INSTRUCTIONS_CLASS);
  instructions.setAttribute("aria-hidden", "true");
  dropTarget.classList.add(TARGET_CLASS); // Encourage screenreader to read out aria changes immediately following upload status change

  fileInputEl.setAttribute("aria-live", "polite"); // Adds child elements to the DOM

  fileInputEl.parentNode.insertBefore(dropTarget, fileInputEl);
  fileInputEl.parentNode.insertBefore(fileInputParent, dropTarget);
  dropTarget.appendChild(fileInputEl);
  fileInputParent.appendChild(dropTarget);
  fileInputEl.parentNode.insertBefore(instructions, fileInputEl);
  fileInputEl.parentNode.insertBefore(box, fileInputEl); // Disabled styling

  if (disabled) {
    disable(fileInputEl);
  } // Sets instruction test and aria-label based on whether or not multiple files are accepted


  if (acceptsMultiple) {
    defaultAriaLabel = "No files selected";
    instructions.innerHTML = Sanitizer.escapeHTML`<span class="${DRAG_TEXT_CLASS}">Drag files here or </span><span class="${CHOOSE_CLASS}">choose from folder</span>`;
    fileInputEl.setAttribute("aria-label", defaultAriaLabel);
    fileInputEl.setAttribute("data-default-aria-label", defaultAriaLabel);
  } else {
    defaultAriaLabel = "No file selected";
    instructions.innerHTML = Sanitizer.escapeHTML`<span class="${DRAG_TEXT_CLASS}">Drag file here or </span><span class="${CHOOSE_CLASS}">choose from folder</span>`;
    fileInputEl.setAttribute("aria-label", defaultAriaLabel);
    fileInputEl.setAttribute("data-default-aria-label", defaultAriaLabel);
  } // IE11 and Edge do not support drop files on file inputs, so we've removed text that indicates that


  if (/rv:11.0/i.test(navigator.userAgent) || /Edge\/\d./i.test(navigator.userAgent)) {
    fileInputParent.querySelector(`.${DRAG_TEXT_CLASS}`).outerHTML = "";
  }

  return {
    instructions,
    dropTarget
  };
};
/**
 * Removes image previews, we want to start with a clean list every time files are added to the file input
 * @param {HTMLElement} dropTarget - target area div that encases the input
 * @param {HTMLElement} instructions - text to inform users to drag or select files
 */


const removeOldPreviews = (dropTarget, instructions, inputAriaLabel) => {
  const filePreviews = dropTarget.querySelectorAll(`.${PREVIEW_CLASS}`);
  const fileInputElement = dropTarget.querySelector(INPUT);
  const currentPreviewHeading = dropTarget.querySelector(`.${PREVIEW_HEADING_CLASS}`);
  const currentErrorMessage = dropTarget.querySelector(`.${ACCEPTED_FILE_MESSAGE_CLASS}`);
  /**
   * finds the parent of the passed node and removes the child
   * @param {HTMLElement} node
   */

  const removeImages = node => {
    node.parentNode.removeChild(node);
  }; // Remove the heading above the previews


  if (currentPreviewHeading) {
    currentPreviewHeading.outerHTML = "";
  } // Remove existing error messages


  if (currentErrorMessage) {
    currentErrorMessage.outerHTML = "";
    dropTarget.classList.remove(INVALID_FILE_CLASS);
  } // Get rid of existing previews if they exist, show instructions


  if (filePreviews !== null) {
    if (instructions) {
      instructions.classList.remove(HIDDEN_CLASS);
    }

    fileInputElement.setAttribute("aria-label", inputAriaLabel);
    Array.prototype.forEach.call(filePreviews, removeImages);
  }
};
/**
 * When new files are applied to file input, this function generates previews
 * and removes old ones.
 * @param {event} e
 * @param {HTMLElement} fileInputEl - file input element
 * @param {HTMLElement} instructions - text to inform users to drag or select files
 * @param {HTMLElement} dropTarget - target area div that encases the input
 */


const handleChange = (e, fileInputEl, instructions, dropTarget) => {
  const fileNames = e.target.files;
  const filePreviewsHeading = document.createElement("div");
  const inputAriaLabel = fileInputEl.dataset.defaultAriaLabel;
  const fileStore = []; // First, get rid of existing previews

  removeOldPreviews(dropTarget, instructions, inputAriaLabel); // Then, iterate through files list and:
  // 1. Add selected file list names to aria-label
  // 2. Create previews

  for (let i = 0; i < fileNames.length; i += 1) {
    const reader = new FileReader();
    const fileName = fileNames[i].name; // Push updated file names into the store array

    fileStore.push(fileName); // read out the store array via aria-label, wording options vary based on file count

    if (i === 0) {
      fileInputEl.setAttribute("aria-label", `You have selected the file: ${fileName}`);
    } else if (i >= 1) {
      fileInputEl.setAttribute("aria-label", `You have selected ${fileNames.length} files: ${fileStore.join(", ")}`);
    } // Starts with a loading image while preview is created


    reader.onloadstart = function createLoadingImage() {
      const imageId = createUniqueID(makeSafeForID(fileName));
      instructions.insertAdjacentHTML("afterend", Sanitizer.escapeHTML`<div class="${PREVIEW_CLASS}" aria-hidden="true">
          <img id="${imageId}" src="${SPACER_GIF}" alt="" class="${GENERIC_PREVIEW_CLASS_NAME} ${LOADING_CLASS}"/>${fileName}
        <div>`);
    }; // Not all files will be able to generate previews. In case this happens, we provide several types "generic previews" based on the file extension.


    reader.onloadend = function createFilePreview() {
      const imageId = createUniqueID(makeSafeForID(fileName));
      const previewImage = document.getElementById(imageId);

      if (fileName.indexOf(".pdf") > 0) {
        previewImage.setAttribute("onerror", `this.onerror=null;this.src="${SPACER_GIF}"; this.classList.add("${PDF_PREVIEW_CLASS}")`);
      } else if (fileName.indexOf(".doc") > 0 || fileName.indexOf(".pages") > 0) {
        previewImage.setAttribute("onerror", `this.onerror=null;this.src="${SPACER_GIF}"; this.classList.add("${WORD_PREVIEW_CLASS}")`);
      } else if (fileName.indexOf(".xls") > 0 || fileName.indexOf(".numbers") > 0) {
        previewImage.setAttribute("onerror", `this.onerror=null;this.src="${SPACER_GIF}"; this.classList.add("${EXCEL_PREVIEW_CLASS}")`);
      } else if (fileName.indexOf(".mov") > 0 || fileName.indexOf(".mp4") > 0) {
        previewImage.setAttribute("onerror", `this.onerror=null;this.src="${SPACER_GIF}"; this.classList.add("${VIDEO_PREVIEW_CLASS}")`);
      } else {
        previewImage.setAttribute("onerror", `this.onerror=null;this.src="${SPACER_GIF}"; this.classList.add("${GENERIC_PREVIEW_CLASS}")`);
      } // Removes loader and displays preview


      previewImage.classList.remove(LOADING_CLASS);
      previewImage.src = reader.result;
    };

    if (fileNames[i]) {
      reader.readAsDataURL(fileNames[i]);
    } // Adds heading above file previews, pluralizes if there are multiple


    if (i === 0) {
      dropTarget.insertBefore(filePreviewsHeading, instructions);
      filePreviewsHeading.innerHTML = `Selected file <span class="usa-file-input__choose">Change file</span>`;
    } else if (i >= 1) {
      dropTarget.insertBefore(filePreviewsHeading, instructions);
      filePreviewsHeading.innerHTML = Sanitizer.escapeHTML`${i + 1} files selected <span class="usa-file-input__choose">Change files</span>`;
    } // Hides null state content and sets preview heading class


    if (filePreviewsHeading) {
      instructions.classList.add(HIDDEN_CLASS);
      filePreviewsHeading.classList.add(PREVIEW_HEADING_CLASS);
    }
  }
};
/**
 * When using an Accept attribute, invalid files will be hidden from
 * file browser, but they can still be dragged to the input. This
 * function prevents them from being dragged and removes error states
 * when correct files are added.
 * @param {event} e
 * @param {HTMLElement} fileInputEl - file input element
 * @param {HTMLElement} instructions - text to inform users to drag or select files
 * @param {HTMLElement} dropTarget - target area div that encases the input
 */


const preventInvalidFiles = (e, fileInputEl, instructions, dropTarget) => {
  const acceptedFilesAttr = fileInputEl.getAttribute("accept");
  dropTarget.classList.remove(INVALID_FILE_CLASS);
  /**
   * We can probably move away from this once IE11 support stops, and replace
   * with a simple es `.includes`
   * check if element is in array
   * check if 1 or more alphabets are in string
   * if element is present return the position value and -1 otherwise
   * @param {Object} file
   * @param {String} value
   * @returns {Boolean}
   */

  const isIncluded = (file, value) => {
    let returnValue = false;
    const pos = file.indexOf(value);

    if (pos >= 0) {
      returnValue = true;
    }

    return returnValue;
  }; // Runs if only specific files are accepted


  if (acceptedFilesAttr) {
    const acceptedFiles = acceptedFilesAttr.split(",");
    const errorMessage = document.createElement("div"); // If multiple files are dragged, this iterates through them and look for any files that are not accepted.

    let allFilesAllowed = true;
    const scannedFiles = e.target.files || e.dataTransfer.files;

    for (let i = 0; i < scannedFiles.length; i += 1) {
      const file = scannedFiles[i];

      if (allFilesAllowed) {
        for (let j = 0; j < acceptedFiles.length; j += 1) {
          const fileType = acceptedFiles[j];
          allFilesAllowed = file.name.indexOf(fileType) > 0 || isIncluded(file.type, fileType.replace(/\*/g, ""));

          if (allFilesAllowed) {
            TYPE_IS_VALID = true;
            break;
          }
        }
      } else break;
    } // If dragged files are not accepted, this removes them from the value of the input and creates and error state


    if (!allFilesAllowed) {
      removeOldPreviews(dropTarget, instructions);
      fileInputEl.value = ""; // eslint-disable-line no-param-reassign

      dropTarget.insertBefore(errorMessage, fileInputEl);
      errorMessage.textContent = fileInputEl.dataset.errormessage || `This is not a valid file type.`;
      errorMessage.classList.add(ACCEPTED_FILE_MESSAGE_CLASS);
      dropTarget.classList.add(INVALID_FILE_CLASS);
      TYPE_IS_VALID = false;
      e.preventDefault();
      e.stopPropagation();
    }
  }
};
/**
 * 1. passes through gate for preventing invalid files
 * 2. handles updates if file is valid
 * @param {event} event
 * @param {HTMLElement} element
 * @param {HTMLElement} instructionsEl
 * @param {HTMLElement} target
 */


const handleUpload = (event, element, instructionsEl, dropTargetEl) => {
  preventInvalidFiles(event, element, instructionsEl, dropTargetEl);

  if (TYPE_IS_VALID === true) {
    handleChange(event, element, instructionsEl, dropTargetEl);
  }
};

const fileInput = behavior({}, {
  init(root) {
    selectOrMatches(DROPZONE, root).forEach(fileInputEl => {
      const {
        instructions,
        dropTarget
      } = buildFileInput(fileInputEl);
      dropTarget.addEventListener("dragover", function handleDragOver() {
        this.classList.add(DRAG_CLASS);
      }, false);
      dropTarget.addEventListener("dragleave", function handleDragLeave() {
        this.classList.remove(DRAG_CLASS);
      }, false);
      dropTarget.addEventListener("drop", function handleDrop() {
        this.classList.remove(DRAG_CLASS);
      }, false);
      fileInputEl.addEventListener("change", e => handleUpload(e, fileInputEl, instructions, dropTarget), false);
    });
  },

  teardown(root) {
    selectOrMatches(INPUT, root).forEach(fileInputEl => {
      const fileInputTopElement = fileInputEl.parentElement.parentElement;
      fileInputTopElement.parentElement.replaceChild(fileInputEl, fileInputTopElement); // eslint-disable-next-line no-param-reassign

      fileInputEl.className = DROPZONE_CLASS;
    });
  },

  getFileInputContext,
  disable,
  enable
});
module.exports = fileInput;

},{"../../uswds-core/src/js/config":32,"../../uswds-core/src/js/utils/behavior":42,"../../uswds-core/src/js/utils/sanitizer":46,"../../uswds-core/src/js/utils/select-or-matches":48}],22:[function(require,module,exports){
"use strict";

const behavior = require("../../uswds-core/src/js/utils/behavior");

const {
  CLICK
} = require("../../uswds-core/src/js/events");

const {
  prefix: PREFIX
} = require("../../uswds-core/src/js/config");

const SCOPE = `.${PREFIX}-footer--big`;
const NAV = `${SCOPE} nav`;
const BUTTON = `${NAV} .${PREFIX}-footer__primary-link`;
const HIDE_MAX_WIDTH = 480;
/**
 * Expands selected footer menu panel, while collapsing others
 */

function showPanel() {
  if (window.innerWidth < HIDE_MAX_WIDTH) {
    const isOpen = this.getAttribute("aria-expanded") === "true";
    const thisFooter = this.closest(SCOPE); // Close all other menus

    thisFooter.querySelectorAll(BUTTON).forEach(button => {
      button.setAttribute("aria-expanded", false);
    });
    this.setAttribute("aria-expanded", !isOpen);
  }
}
/**
 * Swaps the <h4> element for a <button> element (and vice-versa) and sets id
 * of menu list
 *
 * @param {Boolean} isMobile - If the footer is in mobile configuration
 */


function toggleHtmlTag(isMobile) {
  const bigFooter = document.querySelector(SCOPE);

  if (!bigFooter) {
    return;
  }

  const primaryLinks = bigFooter.querySelectorAll(BUTTON);
  const newElementType = isMobile ? "button" : "h4";
  primaryLinks.forEach(currentElement => {
    const currentElementClasses = currentElement.getAttribute("class"); // Create the new element

    const newElement = document.createElement(newElementType);
    newElement.setAttribute("class", currentElementClasses);
    newElement.classList.toggle(`${PREFIX}-footer__primary-link--button`, isMobile);
    newElement.textContent = currentElement.textContent;

    if (isMobile) {
      const menuId = `${PREFIX}-footer-menu-list-${Math.floor(Math.random() * 100000)}`;
      newElement.setAttribute("aria-controls", menuId);
      newElement.setAttribute("aria-expanded", "false");
      currentElement.nextElementSibling.setAttribute("id", menuId);
      newElement.setAttribute("type", "button");
    } // Insert the new element and delete the old


    currentElement.after(newElement);
    currentElement.remove();
  });
}

const resize = event => {
  toggleHtmlTag(event.matches);
};

module.exports = behavior({
  [CLICK]: {
    [BUTTON]: showPanel
  }
}, {
  // export for use elsewhere
  HIDE_MAX_WIDTH,

  init() {
    toggleHtmlTag(window.innerWidth < HIDE_MAX_WIDTH);
    this.mediaQueryList = window.matchMedia(`(max-width: ${HIDE_MAX_WIDTH - 0.1}px)`);
    this.mediaQueryList.addListener(resize);
  },

  teardown() {
    this.mediaQueryList.removeListener(resize);
  }

});

},{"../../uswds-core/src/js/config":32,"../../uswds-core/src/js/events":33,"../../uswds-core/src/js/utils/behavior":42}],23:[function(require,module,exports){
"use strict";

const keymap = require("receptor/keymap");

const behavior = require("../../uswds-core/src/js/utils/behavior");

const select = require("../../uswds-core/src/js/utils/select");

const toggle = require("../../uswds-core/src/js/utils/toggle");

const FocusTrap = require("../../uswds-core/src/js/utils/focus-trap");

const accordion = require("../../usa-accordion/src/index");

const ScrollBarWidth = require("../../uswds-core/src/js/utils/scrollbar-width");

const {
  CLICK
} = require("../../uswds-core/src/js/events");

const {
  prefix: PREFIX
} = require("../../uswds-core/src/js/config");

const BODY = "body";
const HEADER = `.${PREFIX}-header`;
const NAV = `.${PREFIX}-nav`;
const NAV_CONTAINER = `.${PREFIX}-nav-container`;
const NAV_PRIMARY = `.${PREFIX}-nav__primary`;
const NAV_PRIMARY_ITEM = `.${PREFIX}-nav__primary-item`;
const NAV_CONTROL = `button.${PREFIX}-nav__link`;
const NAV_LINKS = `${NAV} a`;
const NON_NAV_HIDDEN_ATTRIBUTE = `data-nav-hidden`;
const OPENERS = `.${PREFIX}-menu-btn`;
const CLOSE_BUTTON = `.${PREFIX}-nav__close`;
const OVERLAY = `.${PREFIX}-overlay`;
const CLOSERS = `${CLOSE_BUTTON}, .${PREFIX}-overlay`;
const TOGGLES = [NAV, OVERLAY].join(", ");
const NON_NAV_ELEMENTS = `body *:not(${HEADER}, ${NAV_CONTAINER}, ${NAV}, ${NAV} *):not([aria-hidden])`;
const NON_NAV_HIDDEN = `[${NON_NAV_HIDDEN_ATTRIBUTE}]`;
const ACTIVE_CLASS = "usa-js-mobile-nav--active";
const VISIBLE_CLASS = "is-visible";
let navigation;
let navActive;
let nonNavElements;

const isActive = () => document.body.classList.contains(ACTIVE_CLASS);

const SCROLLBAR_WIDTH = ScrollBarWidth();
const INITIAL_PADDING = window.getComputedStyle(document.body).getPropertyValue("padding-right");
const TEMPORARY_PADDING = `${parseInt(INITIAL_PADDING.replace(/px/, ""), 10) + parseInt(SCROLLBAR_WIDTH.replace(/px/, ""), 10)}px`;

const hideNonNavItems = () => {
  const headerParent = document.querySelector(`${HEADER}`).parentNode;
  nonNavElements = document.querySelectorAll(NON_NAV_ELEMENTS);
  nonNavElements.forEach(nonNavElement => {
    if (nonNavElement !== headerParent) {
      nonNavElement.setAttribute("aria-hidden", true);
      nonNavElement.setAttribute(NON_NAV_HIDDEN_ATTRIBUTE, "");
    }
  });
};

const showNonNavItems = () => {
  nonNavElements = document.querySelectorAll(NON_NAV_HIDDEN);

  if (!nonNavElements) {
    return;
  } // Remove aria-hidden from non-header elements


  nonNavElements.forEach(nonNavElement => {
    nonNavElement.removeAttribute("aria-hidden");
    nonNavElement.removeAttribute(NON_NAV_HIDDEN_ATTRIBUTE);
  });
}; // Toggle all non-header elements #3527.


const toggleNonNavItems = active => {
  if (active) {
    hideNonNavItems();
  } else {
    showNonNavItems();
  }
};

const toggleNav = active => {
  const {
    body
  } = document;
  const safeActive = typeof active === "boolean" ? active : !isActive();
  body.classList.toggle(ACTIVE_CLASS, safeActive);
  select(TOGGLES).forEach(el => el.classList.toggle(VISIBLE_CLASS, safeActive));
  navigation.focusTrap.update(safeActive);
  const closeButton = body.querySelector(CLOSE_BUTTON);
  const menuButton = document.querySelector(OPENERS);
  body.style.paddingRight = body.style.paddingRight === TEMPORARY_PADDING ? INITIAL_PADDING : TEMPORARY_PADDING;
  toggleNonNavItems(safeActive);

  if (safeActive && closeButton) {
    // The mobile nav was just activated. Focus on the close button, which is
    // just before all the nav elements in the tab order.
    closeButton.focus();
  } else if (!safeActive && document.activeElement === closeButton && menuButton) {
    // The mobile nav was just deactivated, and focus was on the close
    // button, which is no longer visible. We don't want the focus to
    // disappear into the void, so focus on the menu button if it's
    // visible (this may have been what the user was just focused on,
    // if they triggered the mobile nav by mistake).
    menuButton.focus();
  }

  return safeActive;
};

const resize = () => {
  const closer = document.body.querySelector(CLOSE_BUTTON);

  if (isActive() && closer && closer.getBoundingClientRect().width === 0) {
    // When the mobile nav is active, and the close box isn't visible,
    // we know the user's viewport has been resized to be larger.
    // Let's make the page state consistent by deactivating the mobile nav.
    navigation.toggleNav.call(closer, false);
  }
};

const onMenuClose = () => navigation.toggleNav.call(navigation, false);

const hideActiveNavDropdown = () => {
  if (!navActive) {
    return;
  }

  toggle(navActive, false);
  navActive = null;
};

const focusNavButton = event => {
  const parentNavItem = event.target.closest(NAV_PRIMARY_ITEM); // Only shift focus if within dropdown

  if (!event.target.matches(NAV_CONTROL)) {
    parentNavItem.querySelector(NAV_CONTROL).focus();
  }
};

const handleEscape = event => {
  hideActiveNavDropdown();
  focusNavButton(event);
};

navigation = behavior({
  [CLICK]: {
    [NAV_CONTROL]() {
      // If another nav is open, close it
      if (navActive !== this) {
        hideActiveNavDropdown();
      } // store a reference to the last clicked nav link element, so we
      // can hide the dropdown if another element on the page is clicked


      if (!navActive) {
        navActive = this;
        toggle(navActive, true);
      } // Do this so the event handler on the body doesn't fire


      return false;
    },

    [BODY]: hideActiveNavDropdown,
    [OPENERS]: toggleNav,
    [CLOSERS]: toggleNav,

    [NAV_LINKS]() {
      // A navigation link has been clicked! We want to collapse any
      // hierarchical navigation UI it's a part of, so that the user
      // can focus on whatever they've just selected.
      // Some navigation links are inside accordions; when they're
      // clicked, we want to collapse those accordions.
      const acc = this.closest(accordion.ACCORDION);

      if (acc) {
        accordion.getButtons(acc).forEach(btn => accordion.hide(btn));
      } // If the mobile navigation menu is active, we want to hide it.


      if (isActive()) {
        navigation.toggleNav.call(navigation, false);
      }
    }

  },
  keydown: {
    [NAV_PRIMARY]: keymap({
      Escape: handleEscape
    })
  },
  focusout: {
    [NAV_PRIMARY](event) {
      const nav = event.target.closest(NAV_PRIMARY);

      if (!nav.contains(event.relatedTarget)) {
        hideActiveNavDropdown();
      }
    }

  }
}, {
  init(root) {
    const trapContainer = root.matches(NAV) ? root : root.querySelector(NAV);

    if (trapContainer) {
      navigation.focusTrap = FocusTrap(trapContainer, {
        Escape: onMenuClose
      });
    }

    resize();
    window.addEventListener("resize", resize, false);
  },

  teardown() {
    window.removeEventListener("resize", resize, false);
    navActive = false;
  },

  focusTrap: null,
  toggleNav
});
module.exports = navigation;

},{"../../usa-accordion/src/index":15,"../../uswds-core/src/js/config":32,"../../uswds-core/src/js/events":33,"../../uswds-core/src/js/utils/behavior":42,"../../uswds-core/src/js/utils/focus-trap":43,"../../uswds-core/src/js/utils/scrollbar-width":47,"../../uswds-core/src/js/utils/select":49,"../../uswds-core/src/js/utils/toggle":52,"receptor/keymap":11}],24:[function(require,module,exports){
"use strict";

const behavior = require("../../uswds-core/src/js/utils/behavior");

const select = require("../../uswds-core/src/js/utils/select");

const {
  prefix: PREFIX
} = require("../../uswds-core/src/js/config");

const {
  CLICK
} = require("../../uswds-core/src/js/events");

const CONTAINER = `.${PREFIX}-input-group`;
const INPUT = `${CONTAINER} .${PREFIX}-input`;
const DECORATION = `${CONTAINER} .${PREFIX}-input-prefix, ${CONTAINER} .${PREFIX}-input-suffix`;
const FOCUS_CLASS = "is-focused";

function setFocus(el) {
  el.closest(CONTAINER).querySelector(`.${PREFIX}-input`).focus();
}

function handleFocus() {
  this.closest(CONTAINER).classList.add(FOCUS_CLASS);
}

function handleBlur() {
  this.closest(CONTAINER).classList.remove(FOCUS_CLASS);
}

const inputPrefixSuffix = behavior({
  [CLICK]: {
    [DECORATION]() {
      setFocus(this);
    }

  }
}, {
  init(root) {
    select(INPUT, root).forEach(inputEl => {
      inputEl.addEventListener("focus", handleFocus, false);
      inputEl.addEventListener("blur", handleBlur, false);
    });
  }

});
module.exports = inputPrefixSuffix;

},{"../../uswds-core/src/js/config":32,"../../uswds-core/src/js/events":33,"../../uswds-core/src/js/utils/behavior":42,"../../uswds-core/src/js/utils/select":49}],25:[function(require,module,exports){
"use strict";

const selectOrMatches = require("../../uswds-core/src/js/utils/select-or-matches");

const FocusTrap = require("../../uswds-core/src/js/utils/focus-trap");

const ScrollBarWidth = require("../../uswds-core/src/js/utils/scrollbar-width");

const {
  prefix: PREFIX
} = require("../../uswds-core/src/js/config");

const MODAL_CLASSNAME = `${PREFIX}-modal`;
const OVERLAY_CLASSNAME = `${MODAL_CLASSNAME}-overlay`;
const WRAPPER_CLASSNAME = `${MODAL_CLASSNAME}-wrapper`;
const OPENER_ATTRIBUTE = "data-open-modal";
const CLOSER_ATTRIBUTE = "data-close-modal";
const FORCE_ACTION_ATTRIBUTE = "data-force-action";
const NON_MODAL_HIDDEN_ATTRIBUTE = `data-modal-hidden`;
const MODAL = `.${MODAL_CLASSNAME}`;
const INITIAL_FOCUS = `.${WRAPPER_CLASSNAME} *[data-focus]`;
const CLOSE_BUTTON = `${WRAPPER_CLASSNAME} *[${CLOSER_ATTRIBUTE}]`;
const OPENERS = `*[${OPENER_ATTRIBUTE}][aria-controls]`;
const CLOSERS = `${CLOSE_BUTTON}, .${OVERLAY_CLASSNAME}:not([${FORCE_ACTION_ATTRIBUTE}])`;
const NON_MODALS = `body > *:not(.${WRAPPER_CLASSNAME}):not([aria-hidden])`;
const NON_MODALS_HIDDEN = `[${NON_MODAL_HIDDEN_ATTRIBUTE}]`;
const ACTIVE_CLASS = "usa-js-modal--active";
const PREVENT_CLICK_CLASS = "usa-js-no-click";
const VISIBLE_CLASS = "is-visible";
const HIDDEN_CLASS = "is-hidden";
let modal;

const isActive = () => document.body.classList.contains(ACTIVE_CLASS);

const SCROLLBAR_WIDTH = ScrollBarWidth();
const INITIAL_PADDING = window.getComputedStyle(document.body).getPropertyValue("padding-right");
const TEMPORARY_PADDING = `${parseInt(INITIAL_PADDING.replace(/px/, ""), 10) + parseInt(SCROLLBAR_WIDTH.replace(/px/, ""), 10)}px`;
/**
 *  Is bound to escape key, closes modal when
 */

const onMenuClose = () => {
  modal.toggleModal.call(modal, false);
};
/**
 *  Toggle the visibility of a modal window
 *
 * @param {KeyboardEvent} event the keydown event
 * @returns {boolean} safeActive if mobile is open
 */


function toggleModal(event) {
  let originalOpener;
  let clickedElement = event.target;
  const {
    body
  } = document;
  const safeActive = !isActive();
  const modalId = clickedElement ? clickedElement.getAttribute("aria-controls") : document.querySelector(".usa-modal-wrapper.is-visible");
  const targetModal = safeActive ? document.getElementById(modalId) : document.querySelector(".usa-modal-wrapper.is-visible"); // if there is no modal we return early

  if (!targetModal) {
    return false;
  }

  const openFocusEl = targetModal.querySelector(INITIAL_FOCUS) ? targetModal.querySelector(INITIAL_FOCUS) : targetModal.querySelector(".usa-modal");
  const returnFocus = document.getElementById(targetModal.getAttribute("data-opener"));
  const menuButton = body.querySelector(OPENERS);
  const forceUserAction = targetModal.getAttribute(FORCE_ACTION_ATTRIBUTE); // Sets the clicked element to the close button
  // so esc key always closes modal

  if (event.type === "keydown" && targetModal !== null) {
    clickedElement = targetModal.querySelector(CLOSE_BUTTON);
  } // When we're not hitting the escape key…


  if (clickedElement) {
    // Make sure we click the opener
    // If it doesn't have an ID, make one
    // Store id as data attribute on modal
    if (clickedElement.hasAttribute(OPENER_ATTRIBUTE)) {
      if (this.getAttribute("id") === null) {
        originalOpener = `modal-${Math.floor(Math.random() * 900000) + 100000}`;
        this.setAttribute("id", originalOpener);
      } else {
        originalOpener = this.getAttribute("id");
      }

      targetModal.setAttribute("data-opener", originalOpener);
    } // This basically stops the propagation if the element
    // is inside the modal and not a close button or
    // element inside a close button


    if (clickedElement.closest(`.${MODAL_CLASSNAME}`)) {
      if (clickedElement.hasAttribute(CLOSER_ATTRIBUTE) || clickedElement.closest(`[${CLOSER_ATTRIBUTE}]`)) {// do nothing. move on.
      } else {
        event.stopPropagation();
        return false;
      }
    }
  }

  body.classList.toggle(ACTIVE_CLASS, safeActive);
  targetModal.classList.toggle(VISIBLE_CLASS, safeActive);
  targetModal.classList.toggle(HIDDEN_CLASS, !safeActive); // If user is forced to take an action, adding
  // a class to the body that prevents clicking underneath
  // overlay

  if (forceUserAction) {
    body.classList.toggle(PREVENT_CLICK_CLASS, safeActive);
  } // Account for content shifting from body overflow: hidden
  // We only check paddingRight in case apps are adding other properties
  // to the body element


  body.style.paddingRight = body.style.paddingRight === TEMPORARY_PADDING ? INITIAL_PADDING : TEMPORARY_PADDING; // Handle the focus actions

  if (safeActive && openFocusEl) {
    // The modal window is opened. Focus is set to close button.
    // Binds escape key if we're not forcing
    // the user to take an action
    if (forceUserAction) {
      modal.focusTrap = FocusTrap(targetModal);
    } else {
      modal.focusTrap = FocusTrap(targetModal, {
        Escape: onMenuClose
      });
    } // Handles focus setting and interactions


    modal.focusTrap.update(safeActive);
    openFocusEl.focus(); // Hides everything that is not the modal from screen readers

    document.querySelectorAll(NON_MODALS).forEach(nonModal => {
      nonModal.setAttribute("aria-hidden", "true");
      nonModal.setAttribute(NON_MODAL_HIDDEN_ATTRIBUTE, "");
    });
  } else if (!safeActive && menuButton && returnFocus) {
    // The modal window is closed.
    // Non-modals now accesible to screen reader
    document.querySelectorAll(NON_MODALS_HIDDEN).forEach(nonModal => {
      nonModal.removeAttribute("aria-hidden");
      nonModal.removeAttribute(NON_MODAL_HIDDEN_ATTRIBUTE);
    }); // Focus is returned to the opener

    returnFocus.focus();
    modal.focusTrap.update(safeActive);
  }

  return safeActive;
}
/**
 *  Builds modal window from base HTML
 *
 * @param {HTMLElement} baseComponent the modal html in the DOM
 */


const setUpModal = baseComponent => {
  const modalContent = baseComponent;
  const modalWrapper = document.createElement("div");
  const overlayDiv = document.createElement("div");
  const modalID = baseComponent.getAttribute("id");
  const ariaLabelledBy = baseComponent.getAttribute("aria-labelledby");
  const ariaDescribedBy = baseComponent.getAttribute("aria-describedby");
  const forceUserAction = baseComponent.hasAttribute(FORCE_ACTION_ATTRIBUTE) ? baseComponent.hasAttribute(FORCE_ACTION_ATTRIBUTE) : false; // Create placeholder where modal is for cleanup

  const originalLocationPlaceHolder = document.createElement("div");
  originalLocationPlaceHolder.setAttribute(`data-placeholder-for`, modalID);
  originalLocationPlaceHolder.style.display = "none";
  originalLocationPlaceHolder.setAttribute('aria-hidden', 'true');

  for (let attributeIndex = 0; attributeIndex < modalContent.attributes.length; attributeIndex += 1) {
    const attribute = modalContent.attributes[attributeIndex];
    originalLocationPlaceHolder.setAttribute(`data-original-${attribute.name}`, attribute.value);
  }

  modalContent.after(originalLocationPlaceHolder); // Rebuild the modal element

  modalContent.parentNode.insertBefore(modalWrapper, modalContent);
  modalWrapper.appendChild(modalContent);
  modalContent.parentNode.insertBefore(overlayDiv, modalContent);
  overlayDiv.appendChild(modalContent); // Add classes and attributes

  modalWrapper.classList.add(HIDDEN_CLASS);
  modalWrapper.classList.add(WRAPPER_CLASSNAME);
  overlayDiv.classList.add(OVERLAY_CLASSNAME); // Set attributes

  modalWrapper.setAttribute("role", "dialog");
  modalWrapper.setAttribute("id", modalID);

  if (ariaLabelledBy) {
    modalWrapper.setAttribute("aria-labelledby", ariaLabelledBy);
  }

  if (ariaDescribedBy) {
    modalWrapper.setAttribute("aria-describedby", ariaDescribedBy);
  }

  if (forceUserAction) {
    modalWrapper.setAttribute(FORCE_ACTION_ATTRIBUTE, "true");
  } // Update the base element HTML


  baseComponent.removeAttribute("id");
  baseComponent.removeAttribute("aria-labelledby");
  baseComponent.removeAttribute("aria-describedby");
  baseComponent.setAttribute("tabindex", "-1"); // Add aria-controls

  const modalClosers = modalWrapper.querySelectorAll(CLOSERS);
  modalClosers.forEach(el => {
    el.setAttribute("aria-controls", modalID);
  }); // Move all modals to the end of the DOM. Doing this allows us to
  // more easily find the elements to hide from screen readers
  // when the modal is open.

  document.body.appendChild(modalWrapper);
};

const cleanUpModal = baseComponent => {
  const modalContent = baseComponent;
  const modalWrapper = modalContent.parentElement.parentElement;
  const modalID = modalWrapper.getAttribute("id");
  const originalLocationPlaceHolder = document.querySelector(`[data-placeholder-for="${modalID}"]`);

  if (originalLocationPlaceHolder) {
    for (let attributeIndex = 0; attributeIndex < originalLocationPlaceHolder.attributes.length; attributeIndex += 1) {
      const attribute = originalLocationPlaceHolder.attributes[attributeIndex];

      if (attribute.name.startsWith('data-original-')) {
        // data-original- is 14 long
        modalContent.setAttribute(attribute.name.substr(14), attribute.value);
      }
    }

    originalLocationPlaceHolder.after(modalContent);
    originalLocationPlaceHolder.parentElement.removeChild(originalLocationPlaceHolder);
  }

  modalWrapper.parentElement.removeChild(modalWrapper);
};

modal = {
  init(root) {
    selectOrMatches(MODAL, root).forEach(modalWindow => {
      const modalId = modalWindow.id;
      setUpModal(modalWindow); // this will query all openers and closers including the overlay

      document.querySelectorAll(`[aria-controls="${modalId}"]`).forEach(item => {
        // Turn anchor links into buttons because of
        // VoiceOver on Safari
        if (item.nodeName === "A") {
          item.setAttribute("role", "button");
          item.addEventListener("click", e => e.preventDefault());
        } // Can uncomment when aria-haspopup="dialog" is supported
        // https://a11ysupport.io/tech/aria/aria-haspopup_attribute
        // Most screen readers support aria-haspopup, but might announce
        // as opening a menu if "dialog" is not supported.
        // item.setAttribute("aria-haspopup", "dialog");


        item.addEventListener("click", toggleModal);
      });
    });
  },

  teardown(root) {
    selectOrMatches(MODAL, root).forEach(modalWindow => {
      cleanUpModal(modalWindow);
      const modalId = modalWindow.id;
      document.querySelectorAll(`[aria-controls="${modalId}"]`).forEach(item => item.removeEventListener("click", toggleModal));
    });
  },

  focusTrap: null,
  toggleModal,

  on(root) {
    this.init(root);
  },

  off(root) {
    this.teardown(root);
  }

};
module.exports = modal;

},{"../../uswds-core/src/js/config":32,"../../uswds-core/src/js/utils/focus-trap":43,"../../uswds-core/src/js/utils/scrollbar-width":47,"../../uswds-core/src/js/utils/select-or-matches":48}],26:[function(require,module,exports){
"use strict";

const ignore = require("receptor/ignore");

const behavior = require("../../uswds-core/src/js/utils/behavior");

const select = require("../../uswds-core/src/js/utils/select");

const {
  CLICK
} = require("../../uswds-core/src/js/events");

const BUTTON = ".js-search-button";
const FORM = ".js-search-form";
const INPUT = "[type=search]";
const CONTEXT = "header"; // XXX

let lastButton;

const getForm = button => {
  const context = button.closest(CONTEXT);
  return context ? context.querySelector(FORM) : document.querySelector(FORM);
};

const toggleSearch = (button, active) => {
  const form = getForm(button);

  if (!form) {
    throw new Error(`No ${FORM} found for search toggle in ${CONTEXT}!`);
  }
  /* eslint-disable no-param-reassign */


  button.hidden = active;
  form.hidden = !active;
  /* eslint-enable */

  if (!active) {
    return;
  }

  const input = form.querySelector(INPUT);

  if (input) {
    input.focus();
  } // when the user clicks _outside_ of the form w/ignore(): hide the
  // search, then remove the listener


  const listener = ignore(form, () => {
    if (lastButton) {
      hideSearch.call(lastButton); // eslint-disable-line no-use-before-define
    }

    document.body.removeEventListener(CLICK, listener);
  }); // Normally we would just run this code without a timeout, but
  // IE11 and Edge will actually call the listener *immediately* because
  // they are currently handling this exact type of event, so we'll
  // make sure the browser is done handling the current click event,
  // if any, before we attach the listener.

  setTimeout(() => {
    document.body.addEventListener(CLICK, listener);
  }, 0);
};

function showSearch() {
  toggleSearch(this, true);
  lastButton = this;
}

function hideSearch() {
  toggleSearch(this, false);
  lastButton = undefined;
}

const search = behavior({
  [CLICK]: {
    [BUTTON]: showSearch
  }
}, {
  init(target) {
    select(BUTTON, target).forEach(button => {
      toggleSearch(button, false);
    });
  },

  teardown() {
    // forget the last button clicked
    lastButton = undefined;
  }

});
module.exports = search;

},{"../../uswds-core/src/js/events":33,"../../uswds-core/src/js/utils/behavior":42,"../../uswds-core/src/js/utils/select":49,"receptor/ignore":9}],27:[function(require,module,exports){
"use strict";

const once = require("receptor/once");

const behavior = require("../../uswds-core/src/js/utils/behavior");

const {
  CLICK
} = require("../../uswds-core/src/js/events");

const {
  prefix: PREFIX
} = require("../../uswds-core/src/js/config");

const LINK = `.${PREFIX}-skipnav[href^="#"], .${PREFIX}-footer__return-to-top [href^="#"]`;
const MAINCONTENT = "main-content";

function setTabindex() {
  // NB: we know because of the selector we're delegating to below that the
  // href already begins with '#'
  const id = encodeURI(this.getAttribute("href"));
  const target = document.getElementById(id === "#" ? MAINCONTENT : id.slice(1));

  if (target) {
    target.style.outline = "0";
    target.setAttribute("tabindex", 0);
    target.focus();
    target.addEventListener("blur", once(() => {
      target.setAttribute("tabindex", -1);
    }));
  } else {// throw an error?
  }
}

module.exports = behavior({
  [CLICK]: {
    [LINK]: setTabindex
  }
});

},{"../../uswds-core/src/js/config":32,"../../uswds-core/src/js/events":33,"../../uswds-core/src/js/utils/behavior":42,"receptor/once":12}],28:[function(require,module,exports){
"use strict";

const select = require("../../uswds-core/src/js/utils/select");

const behavior = require("../../uswds-core/src/js/utils/behavior");

const {
  CLICK
} = require("../../uswds-core/src/js/events");

const {
  prefix: PREFIX
} = require("../../uswds-core/src/js/config");

const Sanitizer = require("../../uswds-core/src/js/utils/sanitizer");

const TABLE = `.${PREFIX}-table`;
const SORTED = "aria-sort";
const ASCENDING = "ascending";
const DESCENDING = "descending";
const SORT_OVERRIDE = "data-sort-value";
const SORT_BUTTON_CLASS = `${PREFIX}-table__header__button`;
const SORT_BUTTON = `.${SORT_BUTTON_CLASS}`;
const SORTABLE_HEADER = `th[data-sortable]`;
const ANNOUNCEMENT_REGION = `.${PREFIX}-table__announcement-region[aria-live="polite"]`;
/** Gets the data-sort-value attribute value, if provided — otherwise, gets
 * the innerText or textContent — of the child element (HTMLTableCellElement)
 * at the specified index of the given table row
 *
 * @param {number} index
 * @param {array<HTMLTableRowElement>} tr
 * @return {boolean}
 */

const getCellValue = (tr, index) => tr.children[index].getAttribute(SORT_OVERRIDE) || tr.children[index].innerText || tr.children[index].textContent;
/**
 * Compares the values of two row array items at the given index, then sorts by the given direction
 * @param {number} index
 * @param {string} direction
 * @return {boolean}
 */


const compareFunction = (index, isAscending) => (thisRow, nextRow) => {
  // get values to compare from data attribute or cell content
  const value1 = getCellValue(isAscending ? thisRow : nextRow, index);
  const value2 = getCellValue(isAscending ? nextRow : thisRow, index); // if neither value is empty, and if both values are already numbers, compare numerically

  if (value1 && value2 && !Number.isNaN(Number(value1)) && !Number.isNaN(Number(value2))) {
    return value1 - value2;
  } // Otherwise, compare alphabetically based on current user locale


  return value1.toString().localeCompare(value2, navigator.language, {
    numeric: true,
    ignorePunctuation: true
  });
};
/**
 * Get an Array of column headers elements belonging directly to the given
 * table element.
 * @param {HTMLTableElement} table
 * @return {array<HTMLTableHeaderCellElement>}
 */


const getColumnHeaders = table => {
  const headers = select(SORTABLE_HEADER, table);
  return headers.filter(header => header.closest(TABLE) === table);
};
/**
 * Update the button label within the given header element, resetting it
 * to the default state (ready to sort ascending) if it's no longer sorted
 * @param {HTMLTableHeaderCellElement} header
 */


const updateSortLabel = header => {
  const headerName = header.innerText;
  const sortedAscending = header.getAttribute(SORTED) === ASCENDING;
  const isSorted = header.getAttribute(SORTED) === ASCENDING || header.getAttribute(SORTED) === DESCENDING || false;
  const headerLabel = `${headerName}', sortable column, currently ${isSorted ? `${sortedAscending ? `sorted ${ASCENDING}` : `sorted ${DESCENDING}`}` : "unsorted"}`;
  const headerButtonLabel = `Click to sort by ${headerName} in ${sortedAscending ? DESCENDING : ASCENDING} order.`;
  header.setAttribute("aria-label", headerLabel);
  header.querySelector(SORT_BUTTON).setAttribute("title", headerButtonLabel);
};
/**
 * Remove the aria-sort attribute on the given header element, and reset the label and button icon
 * @param {HTMLTableHeaderCellElement} header
 */


const unsetSort = header => {
  header.removeAttribute(SORTED);
  updateSortLabel(header);
};
/**
 * Sort rows either ascending or descending, based on a given header's aria-sort attribute
 * @param {HTMLTableHeaderCellElement} header
 * @param {boolean} isAscending
 * @return {boolean} true
 */


const sortRows = (header, isAscending) => {
  header.setAttribute(SORTED, isAscending === true ? DESCENDING : ASCENDING);
  updateSortLabel(header);
  const tbody = header.closest(TABLE).querySelector("tbody"); // We can use Array.from() and Array.sort() instead once we drop IE11 support, likely in the summer of 2021
  //
  // Array.from(tbody.querySelectorAll('tr').sort(
  //   compareFunction(
  //     Array.from(header.parentNode.children).indexOf(header),
  //     !isAscending)
  //   )
  // .forEach(tr => tbody.appendChild(tr) );
  // [].slice.call() turns array-like sets into true arrays so that we can sort them

  const allRows = [].slice.call(tbody.querySelectorAll("tr"));
  const allHeaders = [].slice.call(header.parentNode.children);
  const thisHeaderIndex = allHeaders.indexOf(header);
  allRows.sort(compareFunction(thisHeaderIndex, !isAscending)).forEach(tr => {
    [].slice.call(tr.children).forEach(td => td.removeAttribute("data-sort-active"));
    tr.children[thisHeaderIndex].setAttribute("data-sort-active", true);
    tbody.appendChild(tr);
  });
  return true;
};
/**
 * Update the live region immediately following the table whenever sort changes.
 * @param {HTMLTableElement} table
 * @param {HTMLTableHeaderCellElement} sortedHeader
 */


const updateLiveRegion = (table, sortedHeader) => {
  const caption = table.querySelector("caption").innerText;
  const sortedAscending = sortedHeader.getAttribute(SORTED) === ASCENDING;
  const headerLabel = sortedHeader.innerText;
  const liveRegion = table.nextElementSibling;

  if (liveRegion && liveRegion.matches(ANNOUNCEMENT_REGION)) {
    const sortAnnouncement = `The table named "${caption}" is now sorted by ${headerLabel} in ${sortedAscending ? ASCENDING : DESCENDING} order.`;
    liveRegion.innerText = sortAnnouncement;
  } else {
    throw new Error(`Table containing a sortable column header is not followed by an aria-live region.`);
  }
};
/**
 * Toggle a header's sort state, optionally providing a target
 * state.
 *
 * @param {HTMLTableHeaderCellElement} header
 * @param {boolean?} isAscending If no state is provided, the current
 * state will be toggled (from false to true, and vice-versa).
 */


const toggleSort = (header, isAscending) => {
  const table = header.closest(TABLE);
  let safeAscending = isAscending;

  if (typeof safeAscending !== "boolean") {
    safeAscending = header.getAttribute(SORTED) === ASCENDING;
  }

  if (!table) {
    throw new Error(`${SORTABLE_HEADER} is missing outer ${TABLE}`);
  }

  safeAscending = sortRows(header, isAscending);

  if (safeAscending) {
    getColumnHeaders(table).forEach(otherHeader => {
      if (otherHeader !== header) {
        unsetSort(otherHeader);
      }
    });
    updateLiveRegion(table, header);
  }
};
/**
 ** Inserts a button with icon inside a sortable header
 * @param {HTMLTableHeaderCellElement} header
 */


const createHeaderButton = header => {
  const buttonEl = document.createElement("button");
  buttonEl.setAttribute("tabindex", "0");
  buttonEl.classList.add(SORT_BUTTON_CLASS); // ICON_SOURCE

  buttonEl.innerHTML = Sanitizer.escapeHTML`
  <svg class="${PREFIX}-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <g class="descending" fill="transparent">
      <path d="M17 17L15.59 15.59L12.9999 18.17V2H10.9999V18.17L8.41 15.58L7 17L11.9999 22L17 17Z" />
    </g>
    <g class="ascending" fill="transparent">
      <path transform="rotate(180, 12, 12)" d="M17 17L15.59 15.59L12.9999 18.17V2H10.9999V18.17L8.41 15.58L7 17L11.9999 22L17 17Z" />
    </g>
    <g class="unsorted" fill="transparent">
      <polygon points="15.17 15 13 17.17 13 6.83 15.17 9 16.58 7.59 12 3 7.41 7.59 8.83 9 11 6.83 11 17.17 8.83 15 7.42 16.41 12 21 16.59 16.41 15.17 15"/>
    </g>
  </svg>
  `;
  header.appendChild(buttonEl);
  updateSortLabel(header);
};

const table = behavior({
  [CLICK]: {
    [SORT_BUTTON](event) {
      event.preventDefault();
      toggleSort(event.target.closest(SORTABLE_HEADER), event.target.closest(SORTABLE_HEADER).getAttribute(SORTED) === ASCENDING);
    }

  }
}, {
  init(root) {
    const sortableHeaders = select(SORTABLE_HEADER, root);
    sortableHeaders.forEach(header => createHeaderButton(header));
    const firstSorted = sortableHeaders.filter(header => header.getAttribute(SORTED) === ASCENDING || header.getAttribute(SORTED) === DESCENDING)[0];

    if (typeof firstSorted === "undefined") {
      // no sortable headers found
      return;
    }

    const sortDir = firstSorted.getAttribute(SORTED);

    if (sortDir === ASCENDING) {
      toggleSort(firstSorted, true);
    } else if (sortDir === DESCENDING) {
      toggleSort(firstSorted, false);
    }
  },

  TABLE,
  SORTABLE_HEADER,
  SORT_BUTTON
});
module.exports = table;

},{"../../uswds-core/src/js/config":32,"../../uswds-core/src/js/events":33,"../../uswds-core/src/js/utils/behavior":42,"../../uswds-core/src/js/utils/sanitizer":46,"../../uswds-core/src/js/utils/select":49}],29:[function(require,module,exports){
"use strict";

const behavior = require("../../uswds-core/src/js/utils/behavior");

const selectOrMatches = require("../../uswds-core/src/js/utils/select-or-matches");

const {
  prefix: PREFIX
} = require("../../uswds-core/src/js/config");

const {
  COMBO_BOX_CLASS,
  enhanceComboBox
} = require("../../usa-combo-box/src/index");

const TIME_PICKER_CLASS = `${PREFIX}-time-picker`;
const TIME_PICKER = `.${TIME_PICKER_CLASS}`;
const MAX_TIME = 60 * 24 - 1;
const MIN_TIME = 0;
const DEFAULT_STEP = 30;
const MIN_STEP = 1;
const FILTER_DATASET = {
  filter: "0?{{ hourQueryFilter }}:{{minuteQueryFilter}}.*{{ apQueryFilter }}m?",
  apQueryFilter: "([ap])",
  hourQueryFilter: "([1-9][0-2]?)",
  minuteQueryFilter: "[\\d]+:([0-9]{0,2})"
};
/**
 * Parse a string of hh:mm into minutes
 *
 * @param {string} timeStr the time string to parse
 * @returns {number} the number of minutes
 */

const parseTimeString = timeStr => {
  let minutes;

  if (timeStr) {
    const [hours, mins] = timeStr.split(":").map(str => {
      let value;
      const parsed = parseInt(str, 10);
      if (!Number.isNaN(parsed)) value = parsed;
      return value;
    });

    if (hours != null && mins != null) {
      minutes = hours * 60 + mins;
    }
  }

  return minutes;
};
/**
 * Enhance an input with the date picker elements
 *
 * @param {HTMLElement} el The initial wrapping element of the date picker component
 */


const transformTimePicker = el => {
  const timePickerEl = el.closest(TIME_PICKER);
  const initialInputEl = timePickerEl.querySelector(`input`);

  if (!initialInputEl) {
    throw new Error(`${TIME_PICKER} is missing inner input`);
  }

  const selectEl = document.createElement("select");
  ["id", "name", "required", "aria-label", "aria-labelledby"].forEach(name => {
    if (initialInputEl.hasAttribute(name)) {
      const value = initialInputEl.getAttribute(name);
      selectEl.setAttribute(name, value);
      initialInputEl.removeAttribute(name);
    }
  });

  const padZeros = (value, length) => `0000${value}`.slice(-length);

  const getTimeContext = minutes => {
    const minute = minutes % 60;
    const hour24 = Math.floor(minutes / 60);
    const hour12 = hour24 % 12 || 12;
    const ampm = hour24 < 12 ? "am" : "pm";
    return {
      minute,
      hour24,
      hour12,
      ampm
    };
  };

  const minTime = Math.max(MIN_TIME, parseTimeString(timePickerEl.dataset.minTime) || MIN_TIME);
  const maxTime = Math.min(MAX_TIME, parseTimeString(timePickerEl.dataset.maxTime) || MAX_TIME);
  const step = Math.floor(Math.max(MIN_STEP, timePickerEl.dataset.step || DEFAULT_STEP));
  let defaultValue;

  for (let time = minTime; time <= maxTime; time += step) {
    const {
      minute,
      hour24,
      hour12,
      ampm
    } = getTimeContext(time);
    const option = document.createElement("option");
    option.value = `${padZeros(hour24, 2)}:${padZeros(minute, 2)}`;
    option.text = `${hour12}:${padZeros(minute, 2)}${ampm}`;

    if (option.text === initialInputEl.value) {
      defaultValue = option.value;
    }

    selectEl.appendChild(option);
  }

  timePickerEl.classList.add(COMBO_BOX_CLASS); // combo box properties

  Object.keys(FILTER_DATASET).forEach(key => {
    timePickerEl.dataset[key] = FILTER_DATASET[key];
  });
  timePickerEl.dataset.disableFiltering = "true";
  timePickerEl.dataset.defaultValue = defaultValue;
  timePickerEl.appendChild(selectEl);
  initialInputEl.style.display = "none";
};

const timePicker = behavior({}, {
  init(root) {
    selectOrMatches(TIME_PICKER, root).forEach(timePickerEl => {
      transformTimePicker(timePickerEl);
      enhanceComboBox(timePickerEl);
    });
  },

  FILTER_DATASET
});
module.exports = timePicker;

},{"../../usa-combo-box/src/index":18,"../../uswds-core/src/js/config":32,"../../uswds-core/src/js/utils/behavior":42,"../../uswds-core/src/js/utils/select-or-matches":48}],30:[function(require,module,exports){
"use strict";

// Tooltips
const selectOrMatches = require("../../uswds-core/src/js/utils/select-or-matches");

const behavior = require("../../uswds-core/src/js/utils/behavior");

const {
  prefix: PREFIX
} = require("../../uswds-core/src/js/config");

const isElementInViewport = require("../../uswds-core/src/js/utils/is-in-viewport");

const TOOLTIP = `.${PREFIX}-tooltip`;
const TOOLTIP_TRIGGER = `.${PREFIX}-tooltip__trigger`;
const TOOLTIP_TRIGGER_CLASS = `${PREFIX}-tooltip__trigger`;
const TOOLTIP_CLASS = `${PREFIX}-tooltip`;
const TOOLTIP_BODY_CLASS = `${PREFIX}-tooltip__body`;
const SET_CLASS = "is-set";
const VISIBLE_CLASS = "is-visible";
const TRIANGLE_SIZE = 5;
const ADJUST_WIDTH_CLASS = `${PREFIX}-tooltip__body--wrap`;
/**
 *
 * @param {DOMElement} trigger - The tooltip trigger
 * @returns {object} Elements for initialized tooltip; includes trigger, wrapper, and body
 */

const getTooltipElements = trigger => {
  const wrapper = trigger.parentNode;
  const body = wrapper.querySelector(`.${TOOLTIP_BODY_CLASS}`);
  return {
    trigger,
    wrapper,
    body
  };
};
/**
 * Shows the tooltip
 * @param {HTMLElement} tooltipTrigger - the element that initializes the tooltip
 */


const showToolTip = (tooltipBody, tooltipTrigger, position) => {
  tooltipBody.setAttribute("aria-hidden", "false"); // This sets up the tooltip body. The opacity is 0, but
  // we can begin running the calculations below.

  tooltipBody.classList.add(SET_CLASS);
  /**
   * Position the tooltip body when the trigger is hovered
   * Removes old positioning classnames and reapplies. This allows
   * positioning to change in case the user resizes browser or DOM manipulation
   * causes tooltip to get clipped from viewport
   *
   * @param {string} setPos - can be "top", "bottom", "right", "left"
   */

  const setPositionClass = setPos => {
    tooltipBody.classList.remove(`${TOOLTIP_BODY_CLASS}--top`);
    tooltipBody.classList.remove(`${TOOLTIP_BODY_CLASS}--bottom`);
    tooltipBody.classList.remove(`${TOOLTIP_BODY_CLASS}--right`);
    tooltipBody.classList.remove(`${TOOLTIP_BODY_CLASS}--left`);
    tooltipBody.classList.add(`${TOOLTIP_BODY_CLASS}--${setPos}`);
  };
  /**
   * Removes old positioning styles. This allows
   * re-positioning to change without inheriting other
   * dynamic styles
   *
   * @param {HTMLElement} e - this is the tooltip body
   */


  const resetPositionStyles = e => {
    // we don't override anything in the stylesheet when finding alt positions
    e.style.top = null;
    e.style.bottom = null;
    e.style.right = null;
    e.style.left = null;
    e.style.margin = null;
  };
  /**
   * get margin offset calculations
   *
   * @param {HTMLElement} target - this is the tooltip body
   * @param {String} propertyValue - this is the tooltip body
   */


  const offsetMargin = (target, propertyValue) => parseInt(window.getComputedStyle(target).getPropertyValue(propertyValue), 10); // offsetLeft = the left position, and margin of the element, the left
  // padding, scrollbar and border of the offsetParent element
  // offsetWidth = The offsetWidth property returns the viewable width of an
  // element in pixels, including padding, border and scrollbar, but not
  // the margin.

  /**
   * Calculate margin offset
   * tooltip trigger margin(position) offset + tooltipBody offsetWidth
   * @param {String} marginPosition
   * @param {Number} tooltipBodyOffset
   * @param {HTMLElement} trigger
   */


  const calculateMarginOffset = (marginPosition, tooltipBodyOffset, trigger) => {
    const offset = offsetMargin(trigger, `margin-${marginPosition}`) > 0 ? tooltipBodyOffset - offsetMargin(trigger, `margin-${marginPosition}`) : tooltipBodyOffset;
    return offset;
  };
  /**
   * Positions tooltip at the top
   * @param {HTMLElement} e - this is the tooltip body
   */


  const positionTop = e => {
    resetPositionStyles(e); // ensures we start from the same point
    // get details on the elements object with

    const topMargin = calculateMarginOffset("top", e.offsetHeight, tooltipTrigger);
    const leftMargin = calculateMarginOffset("left", e.offsetWidth, tooltipTrigger);
    setPositionClass("top");
    e.style.left = `50%`; // center the element

    e.style.top = `-${TRIANGLE_SIZE}px`; // consider the pseudo element
    // apply our margins based on the offset

    e.style.margin = `-${topMargin}px 0 0 -${leftMargin / 2}px`;
  };
  /**
   * Positions tooltip at the bottom
   * @param {HTMLElement} e - this is the tooltip body
   */


  const positionBottom = e => {
    resetPositionStyles(e);
    const leftMargin = calculateMarginOffset("left", e.offsetWidth, tooltipTrigger);
    setPositionClass("bottom");
    e.style.left = `50%`;
    e.style.margin = `${TRIANGLE_SIZE}px 0 0 -${leftMargin / 2}px`;
  };
  /**
   * Positions tooltip at the right
   * @param {HTMLElement} e - this is the tooltip body
   */


  const positionRight = e => {
    resetPositionStyles(e);
    const topMargin = calculateMarginOffset("top", e.offsetHeight, tooltipTrigger);
    setPositionClass("right");
    e.style.top = `50%`;
    e.style.left = `${tooltipTrigger.offsetLeft + tooltipTrigger.offsetWidth + TRIANGLE_SIZE}px`;
    e.style.margin = `-${topMargin / 2}px 0 0 0`;
  };
  /**
   * Positions tooltip at the right
   * @param {HTMLElement} e - this is the tooltip body
   */


  const positionLeft = e => {
    resetPositionStyles(e);
    const topMargin = calculateMarginOffset("top", e.offsetHeight, tooltipTrigger); // we have to check for some utility margins

    const leftMargin = calculateMarginOffset("left", tooltipTrigger.offsetLeft > e.offsetWidth ? tooltipTrigger.offsetLeft - e.offsetWidth : e.offsetWidth, tooltipTrigger);
    setPositionClass("left");
    e.style.top = `50%`;
    e.style.left = `-${TRIANGLE_SIZE}px`;
    e.style.margin = `-${topMargin / 2}px 0 0 ${tooltipTrigger.offsetLeft > e.offsetWidth ? leftMargin : -leftMargin}px`; // adjust the margin
  };
  /**
   * We try to set the position based on the
   * original intention, but make adjustments
   * if the element is clipped out of the viewport
   * we constrain the width only as a last resort
   * @param {HTMLElement} element(alias tooltipBody)
   * @param {Number} attempt (--flag)
   */


  const maxAttempts = 2;

  function findBestPosition(element) {
    let attempt = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
    // create array of optional positions
    const positions = [positionTop, positionBottom, positionRight, positionLeft];
    let hasVisiblePosition = false; // we take a recursive approach

    function tryPositions(i) {
      if (i < positions.length) {
        const pos = positions[i];
        pos(element);

        if (!isElementInViewport(element)) {
          // eslint-disable-next-line no-param-reassign
          tryPositions(i += 1);
        } else {
          hasVisiblePosition = true;
        }
      }
    }

    tryPositions(0); // if we can't find a position we compress it and try again

    if (!hasVisiblePosition) {
      element.classList.add(ADJUST_WIDTH_CLASS);

      if (attempt <= maxAttempts) {
        // eslint-disable-next-line no-param-reassign
        findBestPosition(element, attempt += 1);
      }
    }
  }

  switch (position) {
    case "top":
      positionTop(tooltipBody);

      if (!isElementInViewport(tooltipBody)) {
        findBestPosition(tooltipBody);
      }

      break;

    case "bottom":
      positionBottom(tooltipBody);

      if (!isElementInViewport(tooltipBody)) {
        findBestPosition(tooltipBody);
      }

      break;

    case "right":
      positionRight(tooltipBody);

      if (!isElementInViewport(tooltipBody)) {
        findBestPosition(tooltipBody);
      }

      break;

    case "left":
      positionLeft(tooltipBody);

      if (!isElementInViewport(tooltipBody)) {
        findBestPosition(tooltipBody);
      }

      break;

    default:
      // skip default case
      break;
  }
  /**
   * Actually show the tooltip. The VISIBLE_CLASS
   * will change the opacity to 1
   */


  setTimeout(() => {
    tooltipBody.classList.add(VISIBLE_CLASS);
  }, 20);
};
/**
 * Removes all the properties to show and position the tooltip,
 * and resets the tooltip position to the original intention
 * in case the window is resized or the element is moved through
 * DOM manipulation.
 * @param {HTMLElement} tooltipBody - The body of the tooltip
 */


const hideToolTip = tooltipBody => {
  tooltipBody.classList.remove(VISIBLE_CLASS);
  tooltipBody.classList.remove(SET_CLASS);
  tooltipBody.classList.remove(ADJUST_WIDTH_CLASS);
  tooltipBody.setAttribute("aria-hidden", "true");
};
/**
 * Setup the tooltip component
 * @param {HTMLElement} tooltipTrigger The element that creates the tooltip
 */


const setUpAttributes = tooltipTrigger => {
  const tooltipID = `tooltip-${Math.floor(Math.random() * 900000) + 100000}`;
  const tooltipContent = tooltipTrigger.getAttribute("title");
  const wrapper = document.createElement("span");
  const tooltipBody = document.createElement("span");
  const position = tooltipTrigger.getAttribute("data-position") ? tooltipTrigger.getAttribute("data-position") : "top";
  const additionalClasses = tooltipTrigger.getAttribute("data-classes"); // Set up tooltip attributes

  tooltipTrigger.setAttribute("aria-describedby", tooltipID);
  tooltipTrigger.setAttribute("tabindex", "0");
  tooltipTrigger.removeAttribute("title");
  tooltipTrigger.classList.remove(TOOLTIP_CLASS);
  tooltipTrigger.classList.add(TOOLTIP_TRIGGER_CLASS); // insert wrapper before el in the DOM tree

  tooltipTrigger.parentNode.insertBefore(wrapper, tooltipTrigger); // set up the wrapper

  wrapper.appendChild(tooltipTrigger);
  wrapper.classList.add(TOOLTIP_CLASS);
  wrapper.appendChild(tooltipBody); // Apply additional class names to wrapper element

  if (additionalClasses) {
    const classesArray = additionalClasses.split(" ");
    classesArray.forEach(classname => wrapper.classList.add(classname));
  } // set up the tooltip body


  tooltipBody.classList.add(TOOLTIP_BODY_CLASS);
  tooltipBody.setAttribute("id", tooltipID);
  tooltipBody.setAttribute("role", "tooltip");
  tooltipBody.setAttribute("aria-hidden", "true"); // place the text in the tooltip

  tooltipBody.textContent = tooltipContent;
  return {
    tooltipBody,
    position,
    tooltipContent,
    wrapper
  };
}; // Setup our function to run on various events


const tooltip = behavior({
  "mouseover focusin": {
    [TOOLTIP](e) {
      const trigger = e.target;
      const elementType = trigger.nodeName; // Initialize tooltip if it hasn't already

      if (elementType === "BUTTON" && trigger.hasAttribute("title")) {
        setUpAttributes(trigger);
      }
    },

    [TOOLTIP_TRIGGER](e) {
      const {
        trigger,
        body
      } = getTooltipElements(e.target);
      showToolTip(body, trigger, trigger.dataset.position);
    }

  },
  "mouseout focusout": {
    [TOOLTIP_TRIGGER](e) {
      const {
        body
      } = getTooltipElements(e.target);
      hideToolTip(body);
    }

  }
}, {
  init(root) {
    selectOrMatches(TOOLTIP, root).forEach(tooltipTrigger => {
      setUpAttributes(tooltipTrigger);
    });
  },

  setup: setUpAttributes,
  getTooltipElements,
  show: showToolTip,
  hide: hideToolTip
});
module.exports = tooltip;

},{"../../uswds-core/src/js/config":32,"../../uswds-core/src/js/utils/behavior":42,"../../uswds-core/src/js/utils/is-in-viewport":44,"../../uswds-core/src/js/utils/select-or-matches":48}],31:[function(require,module,exports){
"use strict";

const behavior = require("../../uswds-core/src/js/utils/behavior");

const validate = require("../../uswds-core/src/js/utils/validate-input");

function change() {
  validate(this);
}

const validator = behavior({
  "keyup change": {
    "input[data-validation-element]": change
  }
});
module.exports = validator;

},{"../../uswds-core/src/js/utils/behavior":42,"../../uswds-core/src/js/utils/validate-input":53}],32:[function(require,module,exports){
"use strict";

module.exports = {
  prefix: "usa"
};

},{}],33:[function(require,module,exports){
"use strict";

module.exports = {
  // This used to be conditionally dependent on whether the
  // browser supported touch events; if it did, `CLICK` was set to
  // `touchstart`.  However, this had downsides:
  //
  // * It pre-empted mobile browsers' default behavior of detecting
  //   whether a touch turned into a scroll, thereby preventing
  //   users from using some of our components as scroll surfaces.
  //
  // * Some devices, such as the Microsoft Surface Pro, support *both*
  //   touch and clicks. This meant the conditional effectively dropped
  //   support for the user's mouse, frustrating users who preferred
  //   it on those systems.
  CLICK: "click"
};

},{}],34:[function(require,module,exports){
"use strict";

const accordion = require("../../../usa-accordion/src/index");

const banner = require("../../../usa-banner/src/index");

const characterCount = require("../../../usa-character-count/src/index");

const comboBox = require("../../../usa-combo-box/src/index");

const datePicker = require("../../../usa-date-picker/src/index");

const dateRangePicker = require("../../../usa-date-range-picker/src/index");

const fileInput = require("../../../usa-file-input/src/index");

const footer = require("../../../usa-footer/src/index");

const inputPrefixSuffix = require("../../../usa-input-prefix-suffix/src/index");

const modal = require("../../../usa-modal/src/index");

const password = require("../../../_usa-password/src/index");

const search = require("../../../usa-search/src/index");

const navigation = require("../../../usa-header/src/index");

const skipnav = require("../../../usa-skipnav/src/index");

const table = require("../../../usa-table/src/index");

const timePicker = require("../../../usa-time-picker/src/index");

const tooltip = require("../../../usa-tooltip/src/index");

const validator = require("../../../usa-validation/src/index");

module.exports = {
  accordion,
  banner,
  characterCount,
  comboBox,
  datePicker,
  dateRangePicker,
  fileInput,
  footer,
  inputPrefixSuffix,
  modal,
  navigation,
  password,
  search,
  skipnav,
  table,
  timePicker,
  tooltip,
  validator
};

},{"../../../_usa-password/src/index":14,"../../../usa-accordion/src/index":15,"../../../usa-banner/src/index":16,"../../../usa-character-count/src/index":17,"../../../usa-combo-box/src/index":18,"../../../usa-date-picker/src/index":19,"../../../usa-date-range-picker/src/index":20,"../../../usa-file-input/src/index":21,"../../../usa-footer/src/index":22,"../../../usa-header/src/index":23,"../../../usa-input-prefix-suffix/src/index":24,"../../../usa-modal/src/index":25,"../../../usa-search/src/index":26,"../../../usa-skipnav/src/index":27,"../../../usa-table/src/index":28,"../../../usa-time-picker/src/index":29,"../../../usa-tooltip/src/index":30,"../../../usa-validation/src/index":31}],35:[function(require,module,exports){
"use strict";

/* eslint-disable consistent-return */

/* eslint-disable func-names */
(function () {
  if (typeof window.CustomEvent === "function") return false;

  function CustomEvent(event, _params) {
    const params = _params || {
      bubbles: false,
      cancelable: false,
      detail: null
    };
    const evt = document.createEvent("CustomEvent");
    evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
    return evt;
  }

  window.CustomEvent = CustomEvent;
})();

},{}],36:[function(require,module,exports){
"use strict";

const elproto = window.HTMLElement.prototype;
const HIDDEN = "hidden";

if (!(HIDDEN in elproto)) {
  Object.defineProperty(elproto, HIDDEN, {
    get() {
      return this.hasAttribute(HIDDEN);
    },

    set(value) {
      if (value) {
        this.setAttribute(HIDDEN, "");
      } else {
        this.removeAttribute(HIDDEN);
      }
    }

  });
}

},{}],37:[function(require,module,exports){
"use strict";

// polyfills HTMLElement.prototype.classList and DOMTokenList
require("classlist-polyfill"); // polyfills HTMLElement.prototype.hidden


require("./element-hidden"); // polyfills Number.isNaN()


require("./number-is-nan"); // polyfills CustomEvent


require("./custom-event"); // polyfills svg4everybody


require("./svg4everybody");

},{"./custom-event":35,"./element-hidden":36,"./number-is-nan":38,"./svg4everybody":39,"classlist-polyfill":1}],38:[function(require,module,exports){
"use strict";

Number.isNaN = Number.isNaN || function isNaN(input) {
  // eslint-disable-next-line no-self-compare
  return typeof input === "number" && input !== input;
};

},{}],39:[function(require,module,exports){
"use strict";

/* eslint-disable */
!function (factory) {
  module.exports = factory();
}(function () {
  /*! svg4everybody v2.1.9 | github.com/jonathantneal/svg4everybody */
  function embed(parent, svg, target, use) {
    // if the target exists
    if (target) {
      // create a document fragment to hold the contents of the target
      var fragment = document.createDocumentFragment(),
          viewBox = !svg.hasAttribute("viewBox") && target.getAttribute("viewBox"); // conditionally set the viewBox on the svg

      viewBox && svg.setAttribute("viewBox", viewBox); // copy the contents of the clone into the fragment

      for ( // clone the target
      var clone = document.importNode ? document.importNode(target, !0) : target.cloneNode(!0), g = document.createElementNS(svg.namespaceURI || "http://www.w3.org/2000/svg", "g"); clone.childNodes.length;) {
        g.appendChild(clone.firstChild);
      }

      if (use) {
        for (var i = 0; use.attributes.length > i; i++) {
          var attr = use.attributes[i];
          "xlink:href" !== attr.name && "href" !== attr.name && g.setAttribute(attr.name, attr.value);
        }
      }

      fragment.appendChild(g), // append the fragment into the svg
      parent.appendChild(fragment);
    }
  }

  function loadreadystatechange(xhr, use) {
    // listen to changes in the request
    xhr.onreadystatechange = function () {
      // if the request is ready
      if (4 === xhr.readyState) {
        // get the cached html document
        var cachedDocument = xhr._cachedDocument; // ensure the cached html document based on the xhr response

        cachedDocument || (cachedDocument = xhr._cachedDocument = document.implementation.createHTMLDocument(""), cachedDocument.body.innerHTML = xhr.responseText, // ensure domains are the same, otherwise we'll have issues appending the
        // element in IE 11
        cachedDocument.domain !== document.domain && (cachedDocument.domain = document.domain), xhr._cachedTarget = {}), // clear the xhr embeds list and embed each item
        xhr._embeds.splice(0).map(function (item) {
          // get the cached target
          var target = xhr._cachedTarget[item.id]; // ensure the cached target

          target || (target = xhr._cachedTarget[item.id] = cachedDocument.getElementById(item.id)), // embed the target into the svg
          embed(item.parent, item.svg, target, use);
        });
      }
    }, // test the ready state change immediately
    xhr.onreadystatechange();
  }

  function svg4everybody(rawopts) {
    function oninterval() {
      // if all <use>s in the array are being bypassed, don't proceed.
      if (numberOfSvgUseElementsToBypass && uses.length - numberOfSvgUseElementsToBypass <= 0) {
        return void requestAnimationFrame(oninterval, 67);
      } // if there are <use>s to process, proceed.
      // reset the bypass counter, since the counter will be incremented for every bypassed element,
      // even ones that were counted before.


      numberOfSvgUseElementsToBypass = 0; // while the index exists in the live <use> collection

      for ( // get the cached <use> index
      var index = 0; index < uses.length;) {
        // get the current <use>
        var use = uses[index],
            parent = use.parentNode,
            svg = getSVGAncestor(parent),
            src = use.getAttribute("xlink:href") || use.getAttribute("href");

        if (!src && opts.attributeName && (src = use.getAttribute(opts.attributeName)), svg && src) {
          if (polyfill) {
            if (!opts.validate || opts.validate(src, svg, use)) {
              // remove the <use> element
              parent.removeChild(use); // parse the src and get the url and id

              var srcSplit = src.split("#"),
                  url = srcSplit.shift(),
                  id = srcSplit.join("#"); // if the link is external

              if (url.length) {
                // get the cached xhr request
                var xhr = requests[url]; // ensure the xhr request exists

                xhr || (xhr = requests[url] = new XMLHttpRequest(), xhr.open("GET", url), xhr.send(), xhr._embeds = []), // add the svg and id as an item to the xhr embeds list
                xhr._embeds.push({
                  parent: parent,
                  svg: svg,
                  id: id
                }), // prepare the xhr ready state change event
                loadreadystatechange(xhr, use);
              } else {
                // embed the local id into the svg
                embed(parent, svg, document.getElementById(id), use);
              }
            } else {
              // increase the index when the previous value was not "valid"
              ++index, ++numberOfSvgUseElementsToBypass;
            }
          }
        } else {
          // increase the index when the previous value was not "valid"
          ++index;
        }
      } // continue the interval


      requestAnimationFrame(oninterval, 67);
    }

    var polyfill,
        opts = Object(rawopts),
        newerIEUA = /\bTrident\/[567]\b|\bMSIE (?:9|10)\.0\b/,
        webkitUA = /\bAppleWebKit\/(\d+)\b/,
        olderEdgeUA = /\bEdge\/12\.(\d+)\b/,
        edgeUA = /\bEdge\/.(\d+)\b/,
        inIframe = window.top !== window.self;
    polyfill = "polyfill" in opts ? opts.polyfill : newerIEUA.test(navigator.userAgent) || (navigator.userAgent.match(olderEdgeUA) || [])[1] < 10547 || (navigator.userAgent.match(webkitUA) || [])[1] < 537 || edgeUA.test(navigator.userAgent) && inIframe; // create xhr requests object

    var requests = {},
        requestAnimationFrame = window.requestAnimationFrame || setTimeout,
        uses = document.getElementsByTagName("use"),
        numberOfSvgUseElementsToBypass = 0; // conditionally start the interval if the polyfill is active

    polyfill && oninterval();
  }

  function getSVGAncestor(node) {
    for (var svg = node; "svg" !== svg.nodeName.toLowerCase() && (svg = svg.parentNode);) {}

    return svg;
  }

  return svg4everybody;
});

},{}],40:[function(require,module,exports){
"use strict";

window.uswdsPresent = true; // GLOBAL variable to indicate that the uswds.js has loaded in the DOM.

/**
 * The 'polyfills' define key ECMAScript 5 methods that may be missing from
 * older browsers, so must be loaded first.
 */

require("./polyfills");

const uswds = require("./config");

const components = require("./index");

const svg4everybody = require("./polyfills/svg4everybody");

uswds.components = components;

const initComponents = () => {
  const target = document.body;
  Object.keys(components).forEach(key => {
    const behavior = components[key];
    behavior.on(target);
  });
  svg4everybody();
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initComponents, {
    once: true
  });
} else {
  initComponents();
}

exports.default = uswds;
exports.initComponents = initComponents;

},{"./config":32,"./index":34,"./polyfills":37,"./polyfills/svg4everybody":39}],41:[function(require,module,exports){
"use strict";

module.exports = function () {
  let htmlDocument = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : document;
  return htmlDocument.activeElement;
};

},{}],42:[function(require,module,exports){
"use strict";

const assign = require("object-assign");

const Behavior = require("receptor/behavior");
/**
 * @name sequence
 * @param {...Function} seq an array of functions
 * @return { closure } callHooks
 */
// We use a named function here because we want it to inherit its lexical scope
// from the behavior props object, not from the module


const sequence = function () {
  for (var _len = arguments.length, seq = new Array(_len), _key = 0; _key < _len; _key++) {
    seq[_key] = arguments[_key];
  }

  return function callHooks() {
    let target = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : document.body;
    seq.forEach(method => {
      if (typeof this[method] === "function") {
        this[method].call(this, target);
      }
    });
  };
};
/**
 * @name behavior
 * @param {object} events
 * @param {object?} props
 * @return {receptor.behavior}
 */


module.exports = (events, props) => Behavior(events, assign({
  on: sequence("init", "add"),
  off: sequence("teardown", "remove")
}, props));

},{"object-assign":4,"receptor/behavior":5}],43:[function(require,module,exports){
"use strict";

const assign = require("object-assign");

const {
  keymap
} = require("receptor");

const behavior = require("./behavior");

const select = require("./select");

const activeElement = require("./active-element");

const FOCUSABLE = 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable]';

const tabHandler = context => {
  const focusableElements = select(FOCUSABLE, context);
  const firstTabStop = focusableElements[0];
  const lastTabStop = focusableElements[focusableElements.length - 1]; // Special rules for when the user is tabbing forward from the last focusable element,
  // or when tabbing backwards from the first focusable element

  function tabAhead(event) {
    if (activeElement() === lastTabStop) {
      event.preventDefault();
      firstTabStop.focus();
    }
  }

  function tabBack(event) {
    if (activeElement() === firstTabStop) {
      event.preventDefault();
      lastTabStop.focus();
    } // This checks if you want to set the initial focus to a container
    // instead of an element within, and the user tabs back.
    // Then we set the focus to the first
    else if (!focusableElements.includes(activeElement())) {
      event.preventDefault();
      firstTabStop.focus();
    }
  }

  return {
    firstTabStop,
    lastTabStop,
    tabAhead,
    tabBack
  };
};

module.exports = function (context) {
  let additionalKeyBindings = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  const tabEventHandler = tabHandler(context);
  const bindings = additionalKeyBindings;
  const {
    Esc,
    Escape
  } = bindings;
  if (Escape && !Esc) bindings.Esc = Escape; //  TODO: In the future, loop over additional keybindings and pass an array
  // of functions, if necessary, to the map keys. Then people implementing
  // the focus trap could pass callbacks to fire when tabbing

  const keyMappings = keymap(assign({
    Tab: tabEventHandler.tabAhead,
    "Shift+Tab": tabEventHandler.tabBack
  }, additionalKeyBindings));
  const focusTrap = behavior({
    keydown: keyMappings
  }, {
    init() {
      // TODO: is this desireable behavior? Should the trap always do this by default or should
      // the component getting decorated handle this?
      if (tabEventHandler.firstTabStop) {
        tabEventHandler.firstTabStop.focus();
      }
    },

    update(isActive) {
      if (isActive) {
        this.on();
      } else {
        this.off();
      }
    }

  });
  return focusTrap;
};

},{"./active-element":41,"./behavior":42,"./select":49,"object-assign":4,"receptor":10}],44:[function(require,module,exports){
"use strict";

// https://stackoverflow.com/a/7557433
function isElementInViewport(el) {
  let win = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : window;
  let docEl = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : document.documentElement;
  const rect = el.getBoundingClientRect();
  return rect.top >= 0 && rect.left >= 0 && rect.bottom <= (win.innerHeight || docEl.clientHeight) && rect.right <= (win.innerWidth || docEl.clientWidth);
}

module.exports = isElementInViewport;

},{}],45:[function(require,module,exports){
"use strict";

// iOS detection from: http://stackoverflow.com/a/9039885/177710
function isIosDevice() {
  return typeof navigator !== "undefined" && (navigator.userAgent.match(/(iPod|iPhone|iPad)/g) || navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1) && !window.MSStream;
}

module.exports = isIosDevice;

},{}],46:[function(require,module,exports){
"use strict";

/* eslint-disable */

/* globals define, module */

/**
 * A simple library to help you escape HTML using template strings.
 *
 * It's the counterpart to our eslint "no-unsafe-innerhtml" plugin that helps us
 * avoid unsafe coding practices.
 * A full write-up of the Hows and Whys are documented
 * for developers at
 *  https://developer.mozilla.org/en-US/Firefox_OS/Security/Security_Automation
 * with additional background information and design docs at
 *  https://wiki.mozilla.org/User:Fbraun/Gaia/SafeinnerHTMLRoadmap
 *
 */
!function (factory) {
  module.exports = factory();
}(function () {
  'use strict';

  var Sanitizer = {
    _entity: /[&<>"'/]/g,
    _entities: {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      '\'': '&apos;',
      '/': '&#x2F;'
    },
    getEntity: function (s) {
      return Sanitizer._entities[s];
    },

    /**
     * Escapes HTML for all values in a tagged template string.
     */
    escapeHTML: function (strings) {
      var result = '';

      for (var i = 0; i < strings.length; i++) {
        result += strings[i];

        if (i + 1 < arguments.length) {
          var value = arguments[i + 1] || '';
          result += String(value).replace(Sanitizer._entity, Sanitizer.getEntity);
        }
      }

      return result;
    },

    /**
     * Escapes HTML and returns a wrapped object to be used during DOM insertion
     */
    createSafeHTML: function (strings) {
      var _len = arguments.length;
      var values = new Array(_len > 1 ? _len - 1 : 0);

      for (var _key = 1; _key < _len; _key++) {
        values[_key - 1] = arguments[_key];
      }

      var escaped = Sanitizer.escapeHTML.apply(Sanitizer, [strings].concat(values));
      return {
        __html: escaped,
        toString: function () {
          return '[object WrappedHTMLObject]';
        },
        info: 'This is a wrapped HTML object. See https://developer.mozilla.or' + 'g/en-US/Firefox_OS/Security/Security_Automation for more.'
      };
    },

    /**
     * Unwrap safe HTML created by createSafeHTML or a custom replacement that
     * underwent security review.
     */
    unwrapSafeHTML: function () {
      var _len = arguments.length;
      var htmlObjects = new Array(_len);

      for (var _key = 0; _key < _len; _key++) {
        htmlObjects[_key] = arguments[_key];
      }

      var markupList = htmlObjects.map(function (obj) {
        return obj.__html;
      });
      return markupList.join('');
    }
  };
  return Sanitizer;
});

},{}],47:[function(require,module,exports){
"use strict";

module.exports = function getScrollbarWidth() {
  // Creating invisible container
  const outer = document.createElement('div');
  outer.style.visibility = 'hidden';
  outer.style.overflow = 'scroll'; // forcing scrollbar to appear

  outer.style.msOverflowStyle = 'scrollbar'; // needed for WinJS apps

  document.body.appendChild(outer); // Creating inner element and placing it in the container

  const inner = document.createElement('div');
  outer.appendChild(inner); // Calculating difference between container's full width and the child width

  const scrollbarWidth = `${outer.offsetWidth - inner.offsetWidth}px`; // Removing temporary elements from the DOM

  outer.parentNode.removeChild(outer);
  return scrollbarWidth;
};

},{}],48:[function(require,module,exports){
"use strict";

const select = require("./select");
/**
 * @name isElement
 * @desc returns whether or not the given argument is a DOM element.
 * @param {any} value
 * @return {boolean}
 */


const isElement = value => value && typeof value === "object" && value.nodeType === 1;
/**
 * @name selectOrMatches
 * @desc selects elements from the DOM by class selector or ID selector.
 * @param {string} selector - The selector to traverse the DOM with.
 * @param {Document|HTMLElement?} context - The context to traverse the DOM
 *   in. If not provided, it defaults to the document.
 * @return {HTMLElement[]} - An array of DOM nodes or an empty array.
 */


module.exports = (selector, context) => {
  const selection = select(selector, context);

  if (typeof selector !== "string") {
    return selection;
  }

  if (isElement(context) && context.matches(selector)) {
    selection.push(context);
  }

  return selection;
};

},{"./select":49}],49:[function(require,module,exports){
"use strict";

/**
 * @name isElement
 * @desc returns whether or not the given argument is a DOM element.
 * @param {any} value
 * @return {boolean}
 */
const isElement = value => value && typeof value === "object" && value.nodeType === 1;
/**
 * @name select
 * @desc selects elements from the DOM by class selector or ID selector.
 * @param {string} selector - The selector to traverse the DOM with.
 * @param {Document|HTMLElement?} context - The context to traverse the DOM
 *   in. If not provided, it defaults to the document.
 * @return {HTMLElement[]} - An array of DOM nodes or an empty array.
 */


module.exports = (selector, context) => {
  if (typeof selector !== "string") {
    return [];
  }

  if (!context || !isElement(context)) {
    context = window.document; // eslint-disable-line no-param-reassign
  }

  const selection = context.querySelectorAll(selector);
  return Array.prototype.slice.call(selection);
};

},{}],50:[function(require,module,exports){
"use strict";

/**
 * Flips given INPUT elements between masked (hiding the field value) and unmasked
 * @param {Array.HTMLElement} fields - An array of INPUT elements
 * @param {Boolean} mask - Whether the mask should be applied, hiding the field value
 */
module.exports = (field, mask) => {
  field.setAttribute("autocapitalize", "off");
  field.setAttribute("autocorrect", "off");
  field.setAttribute("type", mask ? "password" : "text");
};

},{}],51:[function(require,module,exports){
"use strict";

const resolveIdRefs = require("resolve-id-refs");

const toggleFieldMask = require("./toggle-field-mask");

const CONTROLS = "aria-controls";
const PRESSED = "aria-pressed";
const SHOW_ATTR = "data-show-text";
const HIDE_ATTR = "data-hide-text";
/**
 * Replace the word "Show" (or "show") with "Hide" (or "hide") in a string.
 * @param {string} showText
 * @return {strong} hideText
 */

const getHideText = showText => showText.replace(/\bShow\b/i, show => `${show[0] === "S" ? "H" : "h"}ide`);
/**
 * Component that decorates an HTML element with the ability to toggle the
 * masked state of an input field (like a password) when clicked.
 * The ids of the fields to be masked will be pulled directly from the button's
 * `aria-controls` attribute.
 *
 * @param  {HTMLElement} el    Parent element containing the fields to be masked
 * @return {boolean}
 */


module.exports = el => {
  // this is the *target* state:
  // * if the element has the attr and it's !== "true", pressed is true
  // * otherwise, pressed is false
  const pressed = el.hasAttribute(PRESSED) && el.getAttribute(PRESSED) !== "true";
  const fields = resolveIdRefs(el.getAttribute(CONTROLS));
  fields.forEach(field => toggleFieldMask(field, pressed));

  if (!el.hasAttribute(SHOW_ATTR)) {
    el.setAttribute(SHOW_ATTR, el.textContent);
  }

  const showText = el.getAttribute(SHOW_ATTR);
  const hideText = el.getAttribute(HIDE_ATTR) || getHideText(showText);
  el.textContent = pressed ? showText : hideText; // eslint-disable-line no-param-reassign

  el.setAttribute(PRESSED, pressed);
  return pressed;
};

},{"./toggle-field-mask":50,"resolve-id-refs":13}],52:[function(require,module,exports){
"use strict";

const EXPANDED = "aria-expanded";
const CONTROLS = "aria-controls";
const HIDDEN = "hidden";

module.exports = (button, expanded) => {
  let safeExpanded = expanded;

  if (typeof safeExpanded !== "boolean") {
    safeExpanded = button.getAttribute(EXPANDED) === "false";
  }

  button.setAttribute(EXPANDED, safeExpanded);
  const id = button.getAttribute(CONTROLS);
  const controls = document.getElementById(id);

  if (!controls) {
    throw new Error(`No toggle target found with id: "${id}"`);
  }

  if (safeExpanded) {
    controls.removeAttribute(HIDDEN);
  } else {
    controls.setAttribute(HIDDEN, "");
  }

  return safeExpanded;
};

},{}],53:[function(require,module,exports){
"use strict";

const {
  prefix: PREFIX
} = require("../config");

const CHECKED = "aria-checked";
const CHECKED_CLASS = `${PREFIX}-checklist__item--checked`;

module.exports = function validate(el) {
  const id = el.dataset.validationElement;
  const checkList = id.charAt(0) === "#" ? document.querySelector(id) : document.getElementById(id);

  if (!checkList) {
    throw new Error(`No validation element found with id: "${id}"`);
  }

  Object.entries(el.dataset).forEach(_ref => {
    let [key, value] = _ref;

    if (key.startsWith("validate")) {
      const validatorName = key.substr("validate".length).toLowerCase();
      const validatorPattern = new RegExp(value);
      const validatorSelector = `[data-validator="${validatorName}"]`;
      const validatorCheckbox = checkList.querySelector(validatorSelector);

      if (!validatorCheckbox) {
        throw new Error(`No validator checkbox found for: "${validatorName}"`);
      }

      const checked = validatorPattern.test(el.value);
      validatorCheckbox.classList.toggle(CHECKED_CLASS, checked);
      validatorCheckbox.setAttribute(CHECKED, checked);
    }
  });
};

},{"../config":32}]},{},[40])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvY2xhc3NsaXN0LXBvbHlmaWxsL3NyYy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9lbGVtZW50LWNsb3Nlc3QvZWxlbWVudC1jbG9zZXN0LmpzIiwibm9kZV9tb2R1bGVzL2tleWJvYXJkZXZlbnQta2V5LXBvbHlmaWxsL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL29iamVjdC1hc3NpZ24vaW5kZXguanMiLCJub2RlX21vZHVsZXMvcmVjZXB0b3IvYmVoYXZpb3IvaW5kZXguanMiLCJub2RlX21vZHVsZXMvcmVjZXB0b3IvY29tcG9zZS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9yZWNlcHRvci9kZWxlZ2F0ZS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9yZWNlcHRvci9kZWxlZ2F0ZUFsbC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9yZWNlcHRvci9pZ25vcmUvaW5kZXguanMiLCJub2RlX21vZHVsZXMvcmVjZXB0b3IvaW5kZXguanMiLCJub2RlX21vZHVsZXMvcmVjZXB0b3Iva2V5bWFwL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3JlY2VwdG9yL29uY2UvaW5kZXguanMiLCJub2RlX21vZHVsZXMvcmVzb2x2ZS1pZC1yZWZzL2luZGV4LmpzIiwicGFja2FnZXMvX3VzYS1wYXNzd29yZC9zcmMvaW5kZXguanMiLCJwYWNrYWdlcy91c2EtYWNjb3JkaW9uL3NyYy9pbmRleC5qcyIsInBhY2thZ2VzL3VzYS1iYW5uZXIvc3JjL2luZGV4LmpzIiwicGFja2FnZXMvdXNhLWNoYXJhY3Rlci1jb3VudC9zcmMvaW5kZXguanMiLCJwYWNrYWdlcy91c2EtY29tYm8tYm94L3NyYy9pbmRleC5qcyIsInBhY2thZ2VzL3VzYS1kYXRlLXBpY2tlci9zcmMvaW5kZXguanMiLCJwYWNrYWdlcy91c2EtZGF0ZS1yYW5nZS1waWNrZXIvc3JjL2luZGV4LmpzIiwicGFja2FnZXMvdXNhLWZpbGUtaW5wdXQvc3JjL2luZGV4LmpzIiwicGFja2FnZXMvdXNhLWZvb3Rlci9zcmMvaW5kZXguanMiLCJwYWNrYWdlcy91c2EtaGVhZGVyL3NyYy9pbmRleC5qcyIsInBhY2thZ2VzL3VzYS1pbnB1dC1wcmVmaXgtc3VmZml4L3NyYy9pbmRleC5qcyIsInBhY2thZ2VzL3VzYS1tb2RhbC9zcmMvaW5kZXguanMiLCJwYWNrYWdlcy91c2Etc2VhcmNoL3NyYy9pbmRleC5qcyIsInBhY2thZ2VzL3VzYS1za2lwbmF2L3NyYy9pbmRleC5qcyIsInBhY2thZ2VzL3VzYS10YWJsZS9zcmMvaW5kZXguanMiLCJwYWNrYWdlcy91c2EtdGltZS1waWNrZXIvc3JjL2luZGV4LmpzIiwicGFja2FnZXMvdXNhLXRvb2x0aXAvc3JjL2luZGV4LmpzIiwicGFja2FnZXMvdXNhLXZhbGlkYXRpb24vc3JjL2luZGV4LmpzIiwicGFja2FnZXMvdXN3ZHMtY29yZS9zcmMvanMvY29uZmlnLmpzIiwicGFja2FnZXMvdXN3ZHMtY29yZS9zcmMvanMvZXZlbnRzLmpzIiwicGFja2FnZXMvdXN3ZHMtY29yZS9zcmMvanMvaW5kZXguanMiLCJwYWNrYWdlcy91c3dkcy1jb3JlL3NyYy9qcy9wb2x5ZmlsbHMvY3VzdG9tLWV2ZW50LmpzIiwicGFja2FnZXMvdXN3ZHMtY29yZS9zcmMvanMvcG9seWZpbGxzL2VsZW1lbnQtaGlkZGVuLmpzIiwicGFja2FnZXMvdXN3ZHMtY29yZS9zcmMvanMvcG9seWZpbGxzL2luZGV4LmpzIiwicGFja2FnZXMvdXN3ZHMtY29yZS9zcmMvanMvcG9seWZpbGxzL251bWJlci1pcy1uYW4uanMiLCJwYWNrYWdlcy91c3dkcy1jb3JlL3NyYy9qcy9wb2x5ZmlsbHMvc3ZnNGV2ZXJ5Ym9keS5qcyIsInBhY2thZ2VzL3Vzd2RzLWNvcmUvc3JjL2pzL3N0YXJ0LmpzIiwicGFja2FnZXMvdXN3ZHMtY29yZS9zcmMvanMvdXRpbHMvYWN0aXZlLWVsZW1lbnQuanMiLCJwYWNrYWdlcy91c3dkcy1jb3JlL3NyYy9qcy91dGlscy9iZWhhdmlvci5qcyIsInBhY2thZ2VzL3Vzd2RzLWNvcmUvc3JjL2pzL3V0aWxzL2ZvY3VzLXRyYXAuanMiLCJwYWNrYWdlcy91c3dkcy1jb3JlL3NyYy9qcy91dGlscy9pcy1pbi12aWV3cG9ydC5qcyIsInBhY2thZ2VzL3Vzd2RzLWNvcmUvc3JjL2pzL3V0aWxzL2lzLWlvcy1kZXZpY2UuanMiLCJwYWNrYWdlcy91c3dkcy1jb3JlL3NyYy9qcy91dGlscy9zYW5pdGl6ZXIuanMiLCJwYWNrYWdlcy91c3dkcy1jb3JlL3NyYy9qcy91dGlscy9zY3JvbGxiYXItd2lkdGguanMiLCJwYWNrYWdlcy91c3dkcy1jb3JlL3NyYy9qcy91dGlscy9zZWxlY3Qtb3ItbWF0Y2hlcy5qcyIsInBhY2thZ2VzL3Vzd2RzLWNvcmUvc3JjL2pzL3V0aWxzL3NlbGVjdC5qcyIsInBhY2thZ2VzL3Vzd2RzLWNvcmUvc3JjL2pzL3V0aWxzL3RvZ2dsZS1maWVsZC1tYXNrLmpzIiwicGFja2FnZXMvdXN3ZHMtY29yZS9zcmMvanMvdXRpbHMvdG9nZ2xlLWZvcm0taW5wdXQuanMiLCJwYWNrYWdlcy91c3dkcy1jb3JlL3NyYy9qcy91dGlscy90b2dnbGUuanMiLCJwYWNrYWdlcy91c3dkcy1jb3JlL3NyYy9qcy91dGlscy92YWxpZGF0ZS1pbnB1dC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFFQSxJQUFJLGNBQWMsTUFBTSxDQUFDLElBQXpCLEVBQStCO0VBRTdCO0VBQ0E7RUFDQSxJQUFJLEVBQUUsZUFBZSxRQUFRLENBQUMsYUFBVCxDQUF1QixHQUF2QixDQUFqQixLQUNDLFFBQVEsQ0FBQyxlQUFULElBQTRCLEVBQUUsZUFBZSxRQUFRLENBQUMsZUFBVCxDQUF5Qiw0QkFBekIsRUFBc0QsR0FBdEQsQ0FBakIsQ0FEakMsRUFDK0c7SUFFOUcsV0FBVSxJ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LGFBQWEsR0FBRyxHQUFHLENBQUMsTUFBSixDQUFXLFdBQVcsTUFBdEIsRUFBOEIsV0FBOUIsRUFBdEI7TUFDQSxNQUFNLGdCQUFnQixHQUFHLElBQUksTUFBSixDQUFXLEtBQVgsQ0FBekI7TUFDQSxNQUFNLGlCQUFpQixHQUFJLG9CQUFtQixhQUFjLElBQTVEO01BQ0EsTUFBTSxpQkFBaUIsR0FBRyxTQUFTLENBQUMsYUFBVixDQUF3QixpQkFBeEIsQ0FBMUI7O01BRUEsSUFBSSxDQUFDLGlCQUFMLEVBQXdCO1FBQ3RCLE1BQU0sSUFBSSxLQUFKLENBQVcscUNBQW9DLGFBQWMsR0FBN0QsQ0FBTjtNQUNEOztNQUVELE1BQU0sT0FBTyxHQUFHLGdCQUFnQixDQUFDLElBQWpCLENBQXNCLEVBQUUsQ0FBQyxLQUF6QixDQUFoQjtNQUNBLGlCQUFpQixDQUFDLFNBQWxCLENBQTRCLE1BQTVCLENBQW1DLGFBQW5DLEVBQWtELE9BQWxEO01BQ0EsaUJBQWlCLENBQUMsWUFBbEIsQ0FBK0IsT0FBL0IsRUFBd0MsT0FBeEM7SUFDRDtFQUNGLENBZkQ7QUFnQkQsQ0EzQkQiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIvKlxuICogY2xhc3NMaXN0LmpzOiBDcm9zcy1icm93c2VyIGZ1bGwgZWxlbWVudC5jbGFzc0xpc3QgaW1wbGVtZW50YXRpb24uXG4gKiAyMDE0LTA3LTIzXG4gKlxuICogQnkgRWxpIEdyZXksIGh0dHA6Ly9lbGlncmV5LmNvbVxuICogUHVibGljIERvbWFpbi5cbiAqIE5PIFdBUlJBTlRZIEVYUFJFU1NFRCBPUiBJTVBMSUVELiBVU0UgQVQgWU9VUiBPV04gUklTSy5cbiAqL1xuXG4vKmdsb2JhbCBzZWxmLCBkb2N1bWVudCwgRE9NRXhjZXB0aW9uICovXG5cbi8qISBAc291cmNlIGh0dHA6Ly9wdXJsLmVsaWdyZXkuY29tL2dpdGh1Yi9jbGFzc0xpc3QuanMvYmxvYi9tYXN0ZXIvY2xhc3NMaXN0LmpzKi9cblxuLyogQ29waWVkIGZyb20gTUROOlxuICogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL0VsZW1lbnQvY2xhc3NMaXN0XG4gKi9cblxuaWYgKFwiZG9jdW1lbnRcIiBpbiB3aW5kb3cuc2VsZikge1xuXG4gIC8vIEZ1bGwgcG9seWZpbGwgZm9yIGJyb3dzZXJzIHdpdGggbm8gY2xhc3NMaXN0IHN1cHBvcnRcbiAgLy8gSW5jbHVkaW5nIElFIDwgRWRnZSBtaXNzaW5nIFNWR0VsZW1lbnQuY2xhc3NMaXN0XG4gIGlmICghKFwiY2xhc3NMaXN0XCIgaW4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcIl9cIikpXG4gICAgfHwgZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TICYmICEoXCJjbGFzc0xpc3RcIiBpbiBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiLFwiZ1wiKSkpIHtcblxuICAoZnVuY3Rpb24gKHZpZXcpIHtcblxuICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgaWYgKCEoJ0VsZW1lbnQnIGluIHZpZXcpKSByZXR1cm47XG5cbiAgICB2YXJcbiAgICAgICAgY2xhc3NMaXN0UHJvcCA9IFwiY2xhc3NMaXN0XCJcbiAgICAgICwgcHJvdG9Qcm9wID0gXCJwcm90b3R5cGVcIlxuICAgICAgLCBlbGVtQ3RyUHJvdG8gPSB2aWV3LkVsZW1lbnRbcHJvdG9Qcm9wXVxuICAgICAgLCBvYmpDdHIgPSBPYmplY3RcbiAgICAgICwgc3RyVHJpbSA9IFN0cmluZ1twcm90b1Byb3BdLnRyaW0gfHwgZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCBcIlwiKTtcbiAgICAgIH1cbiAgICAgICwgYXJySW5kZXhPZiA9IEFycmF5W3Byb3RvUHJvcF0uaW5kZXhPZiB8fCBmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICB2YXJcbiAgICAgICAgICAgIGkgPSAwXG4gICAgICAgICAgLCBsZW4gPSB0aGlzLmxlbmd0aFxuICAgICAgICA7XG4gICAgICAgIGZvciAoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICBpZiAoaSBpbiB0aGlzICYmIHRoaXNbaV0gPT09IGl0ZW0pIHtcbiAgICAgICAgICAgIHJldHVybiBpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gLTE7XG4gICAgICB9XG4gICAgICAvLyBWZW5kb3JzOiBwbGVhc2UgYWxsb3cgY29udGVudCBjb2RlIHRvIGluc3RhbnRpYXRlIERPTUV4Y2VwdGlvbnNcbiAgICAgICwgRE9NRXggPSBmdW5jdGlvbiAodHlwZSwgbWVzc2FnZSkge1xuICAgICAgICB0aGlzLm5hbWUgPSB0eXBlO1xuICAgICAgICB0aGlzLmNvZGUgPSBET01FeGNlcHRpb25bdHlwZV07XG4gICAgICAgIHRoaXMubWVzc2FnZSA9IG1lc3NhZ2U7XG4gICAgICB9XG4gICAgICAsIGNoZWNrVG9rZW5BbmRHZXRJbmRleCA9IGZ1bmN0aW9uIChjbGFzc0xpc3QsIHRva2VuKSB7XG4gICAgICAgIGlmICh0b2tlbiA9PT0gXCJcIikge1xuICAgICAgICAgIHRocm93IG5ldyBET01FeChcbiAgICAgICAgICAgICAgXCJTWU5UQVhfRVJSXCJcbiAgICAgICAgICAgICwgXCJBbiBpbnZhbGlkIG9yIGlsbGVnYWwgc3RyaW5nIHdhcyBzcGVjaWZpZWRcIlxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKC9cXHMvLnRlc3QodG9rZW4pKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IERPTUV4KFxuICAgICAgICAgICAgICBcIklOVkFMSURfQ0hBUkFDVEVSX0VSUlwiXG4gICAgICAgICAgICAsIFwiU3RyaW5nIGNvbnRhaW5zIGFuIGludmFsaWQgY2hhcmFjdGVyXCJcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBhcnJJbmRleE9mLmNhbGwoY2xhc3NMaXN0LCB0b2tlbik7XG4gICAgICB9XG4gICAgICAsIENsYXNzTGlzdCA9IGZ1bmN0aW9uIChlbGVtKSB7XG4gICAgICAgIHZhclxuICAgICAgICAgICAgdHJpbW1lZENsYXNzZXMgPSBzdHJUcmltLmNhbGwoZWxlbS5nZXRBdHRyaWJ1dGUoXCJjbGFzc1wiKSB8fCBcIlwiKVxuICAgICAgICAgICwgY2xhc3NlcyA9IHRyaW1tZWRDbGFzc2VzID8gdHJpbW1lZENsYXNzZXMuc3BsaXQoL1xccysvKSA6IFtdXG4gICAgICAgICAgLCBpID0gMFxuICAgICAgICAgICwgbGVuID0gY2xhc3Nlcy5sZW5ndGhcbiAgICAgICAgO1xuICAgICAgICBmb3IgKDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgdGhpcy5wdXNoKGNsYXNzZXNbaV0pO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX3VwZGF0ZUNsYXNzTmFtZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBlbGVtLnNldEF0dHJpYnV0ZShcImNsYXNzXCIsIHRoaXMudG9TdHJpbmcoKSk7XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICAsIGNsYXNzTGlzdFByb3RvID0gQ2xhc3NMaXN0W3Byb3RvUHJvcF0gPSBbXVxuICAgICAgLCBjbGFzc0xpc3RHZXR0ZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBuZXcgQ2xhc3NMaXN0KHRoaXMpO1xuICAgICAgfVxuICAgIDtcbiAgICAvLyBNb3N0IERPTUV4Y2VwdGlvbiBpbXBsZW1lbnRhdGlvbnMgZG9uJ3QgYWxsb3cgY2FsbGluZyBET01FeGNlcHRpb24ncyB0b1N0cmluZygpXG4gICAgLy8gb24gbm9uLURPTUV4Y2VwdGlvbnMuIEVycm9yJ3MgdG9TdHJpbmcoKSBpcyBzdWZmaWNpZW50IGhlcmUuXG4gICAgRE9NRXhbcHJvdG9Qcm9wXSA9IEVycm9yW3Byb3RvUHJvcF07XG4gICAgY2xhc3NMaXN0UHJvdG8uaXRlbSA9IGZ1bmN0aW9uIChpKSB7XG4gICAgICByZXR1cm4gdGhpc1tpXSB8fCBudWxsO1xuICAgIH07XG4gICAgY2xhc3NMaXN0UHJvdG8uY29udGFpbnMgPSBmdW5jdGlvbiAodG9rZW4pIHtcbiAgICAgIHRva2VuICs9IFwiXCI7XG4gICAgICByZXR1cm4gY2hlY2tUb2tlbkFuZEdldEluZGV4KHRoaXMsIHRva2VuKSAhPT0gLTE7XG4gICAgfTtcbiAgICBjbGFzc0xpc3RQcm90by5hZGQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXJcbiAgICAgICAgICB0b2tlbnMgPSBhcmd1bWVudHNcbiAgICAgICAgLCBpID0gMFxuICAgICAgICAsIGwgPSB0b2tlbnMubGVuZ3RoXG4gICAgICAgICwgdG9rZW5cbiAgICAgICAgLCB1cGRhdGVkID0gZmFsc2VcbiAgICAgIDtcbiAgICAgIGRvIHtcbiAgICAgICAgdG9rZW4gPSB0b2tlbnNbaV0gKyBcIlwiO1xuICAgICAgICBpZiAoY2hlY2tUb2tlbkFuZEdldEluZGV4KHRoaXMsIHRva2VuKSA9PT0gLTEpIHtcbiAgICAgICAgICB0aGlzLnB1c2godG9rZW4pO1xuICAgICAgICAgIHVwZGF0ZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB3aGlsZSAoKytpIDwgbCk7XG5cbiAgICAgIGlmICh1cGRhdGVkKSB7XG4gICAgICAgIHRoaXMuX3VwZGF0ZUNsYXNzTmFtZSgpO1xuICAgICAgfVxuICAgIH07XG4gICAgY2xhc3NMaXN0UHJvdG8ucmVtb3ZlID0gZnVuY3Rpb24gKCkge1xuICAgICAgdmFyXG4gICAgICAgICAgdG9rZW5zID0gYXJndW1lbnRzXG4gICAgICAgICwgaSA9IDBcbiAgICAgICAgLCBsID0gdG9rZW5zLmxlbmd0aFxuICAgICAgICAsIHRva2VuXG4gICAgICAgICwgdXBkYXRlZCA9IGZhbHNlXG4gICAgICAgICwgaW5kZXhcbiAgICAgIDtcbiAgICAgIGRvIHtcbiAgICAgICAgdG9rZW4gPSB0b2tlbnNbaV0gKyBcIlwiO1xuICAgICAgICBpbmRleCA9IGNoZWNrVG9rZW5BbmRHZXRJbmRleCh0aGlzLCB0b2tlbik7XG4gICAgICAgIHdoaWxlIChpbmRleCAhPT0gLTEpIHtcbiAgICAgICAgICB0aGlzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgICAgdXBkYXRlZCA9IHRydWU7XG4gICAgICAgICAgaW5kZXggPSBjaGVja1Rva2VuQW5kR2V0SW5kZXgodGhpcywgdG9rZW4pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB3aGlsZSAoKytpIDwgbCk7XG5cbiAgICAgIGlmICh1cGRhdGVkKSB7XG4gICAgICAgIHRoaXMuX3VwZGF0ZUNsYXNzTmFtZSgpO1xuICAgICAgfVxuICAgIH07XG4gICAgY2xhc3NMaXN0UHJvdG8udG9nZ2xlID0gZnVuY3Rpb24gKHRva2VuLCBmb3JjZSkge1xuICAgICAgdG9rZW4gKz0gXCJcIjtcblxuICAgICAgdmFyXG4gICAgICAgICAgcmVzdWx0ID0gdGhpcy5jb250YWlucyh0b2tlbilcbiAgICAgICAgLCBtZXRob2QgPSByZXN1bHQgP1xuICAgICAgICAgIGZvcmNlICE9PSB0cnVlICYmIFwicmVtb3ZlXCJcbiAgICAgICAgOlxuICAgICAgICAgIGZvcmNlICE9PSBmYWxzZSAmJiBcImFkZFwiXG4gICAgICA7XG5cbiAgICAgIGlmIChtZXRob2QpIHtcbiAgICAgICAgdGhpc1ttZXRob2RdKHRva2VuKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGZvcmNlID09PSB0cnVlIHx8IGZvcmNlID09PSBmYWxzZSkge1xuICAgICAgICByZXR1cm4gZm9yY2U7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gIXJlc3VsdDtcbiAgICAgIH1cbiAgICB9O1xuICAgIGNsYXNzTGlzdFByb3RvLnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHRoaXMuam9pbihcIiBcIik7XG4gICAgfTtcblxuICAgIGlmIChvYmpDdHIuZGVmaW5lUHJvcGVydHkpIHtcbiAgICAgIHZhciBjbGFzc0xpc3RQcm9wRGVzYyA9IHtcbiAgICAgICAgICBnZXQ6IGNsYXNzTGlzdEdldHRlclxuICAgICAgICAsIGVudW1lcmFibGU6IHRydWVcbiAgICAgICAgLCBjb25maWd1cmFibGU6IHRydWVcbiAgICAgIH07XG4gICAgICB0cnkge1xuICAgICAgICBvYmpDdHIuZGVmaW5lUHJvcGVydHkoZWxlbUN0clByb3RvLCBjbGFzc0xpc3RQcm9wLCBjbGFzc0xpc3RQcm9wRGVzYyk7XG4gICAgICB9IGNhdGNoIChleCkgeyAvLyBJRSA4IGRvZXNuJ3Qgc3VwcG9ydCBlbnVtZXJhYmxlOnRydWVcbiAgICAgICAgaWYgKGV4Lm51bWJlciA9PT0gLTB4N0ZGNUVDNTQpIHtcbiAgICAgICAgICBjbGFzc0xpc3RQcm9wRGVzYy5lbnVtZXJhYmxlID0gZmFsc2U7XG4gICAgICAgICAgb2JqQ3RyLmRlZmluZVByb3BlcnR5KGVsZW1DdHJQcm90bywgY2xhc3NMaXN0UHJvcCwgY2xhc3NMaXN0UHJvcERlc2MpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChvYmpDdHJbcHJvdG9Qcm9wXS5fX2RlZmluZUdldHRlcl9fKSB7XG4gICAgICBlbGVtQ3RyUHJvdG8uX19kZWZpbmVHZXR0ZXJfXyhjbGFzc0xpc3RQcm9wLCBjbGFzc0xpc3RHZXR0ZXIpO1xuICAgIH1cblxuICAgIH0od2luZG93LnNlbGYpKTtcblxuICAgIH0gZWxzZSB7XG4gICAgLy8gVGhlcmUgaXMgZnVsbCBvciBwYXJ0aWFsIG5hdGl2ZSBjbGFzc0xpc3Qgc3VwcG9ydCwgc28ganVzdCBjaGVjayBpZiB3ZSBuZWVkXG4gICAgLy8gdG8gbm9ybWFsaXplIHRoZSBhZGQvcmVtb3ZlIGFuZCB0b2dnbGUgQVBJcy5cblxuICAgIChmdW5jdGlvbiAoKSB7XG4gICAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgICAgdmFyIHRlc3RFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcIl9cIik7XG5cbiAgICAgIHRlc3RFbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJjMVwiLCBcImMyXCIpO1xuXG4gICAgICAvLyBQb2x5ZmlsbCBmb3IgSUUgMTAvMTEgYW5kIEZpcmVmb3ggPDI2LCB3aGVyZSBjbGFzc0xpc3QuYWRkIGFuZFxuICAgICAgLy8gY2xhc3NMaXN0LnJlbW92ZSBleGlzdCBidXQgc3VwcG9ydCBvbmx5IG9uZSBhcmd1bWVudCBhdCBhIHRpbWUuXG4gICAgICBpZiAoIXRlc3RFbGVtZW50LmNsYXNzTGlzdC5jb250YWlucyhcImMyXCIpKSB7XG4gICAgICAgIHZhciBjcmVhdGVNZXRob2QgPSBmdW5jdGlvbihtZXRob2QpIHtcbiAgICAgICAgICB2YXIgb3JpZ2luYWwgPSBET01Ub2tlbkxpc3QucHJvdG90eXBlW21ldGhvZF07XG5cbiAgICAgICAgICBET01Ub2tlbkxpc3QucHJvdG90eXBlW21ldGhvZF0gPSBmdW5jdGlvbih0b2tlbikge1xuICAgICAgICAgICAgdmFyIGksIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGg7XG5cbiAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgICAgICB0b2tlbiA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgICAgICAgb3JpZ2luYWwuY2FsbCh0aGlzLCB0b2tlbik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfTtcbiAgICAgICAgfTtcbiAgICAgICAgY3JlYXRlTWV0aG9kKCdhZGQnKTtcbiAgICAgICAgY3JlYXRlTWV0aG9kKCdyZW1vdmUnKTtcbiAgICAgIH1cblxuICAgICAgdGVzdEVsZW1lbnQuY2xhc3NMaXN0LnRvZ2dsZShcImMzXCIsIGZhbHNlKTtcblxuICAgICAgLy8gUG9seWZpbGwgZm9yIElFIDEwIGFuZCBGaXJlZm94IDwyNCwgd2hlcmUgY2xhc3NMaXN0LnRvZ2dsZSBkb2VzIG5vdFxuICAgICAgLy8gc3VwcG9ydCB0aGUgc2Vjb25kIGFyZ3VtZW50LlxuICAgICAgaWYgKHRlc3RFbGVtZW50LmNsYXNzTGlzdC5jb250YWlucyhcImMzXCIpKSB7XG4gICAgICAgIHZhciBfdG9nZ2xlID0gRE9NVG9rZW5MaXN0LnByb3RvdHlwZS50b2dnbGU7XG5cbiAgICAgICAgRE9NVG9rZW5MaXN0LnByb3RvdHlwZS50b2dnbGUgPSBmdW5jdGlvbih0b2tlbiwgZm9yY2UpIHtcbiAgICAgICAgICBpZiAoMSBpbiBhcmd1bWVudHMgJiYgIXRoaXMuY29udGFpbnModG9rZW4pID09PSAhZm9yY2UpIHtcbiAgICAgICAgICAgIHJldHVybiBmb3JjZTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIF90b2dnbGUuY2FsbCh0aGlzLCB0b2tlbik7XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICB9XG5cbiAgICAgIHRlc3RFbGVtZW50ID0gbnVsbDtcbiAgICB9KCkpO1xuICB9XG59XG4iLCIvLyBlbGVtZW50LWNsb3Nlc3QgfCBDQzAtMS4wIHwgZ2l0aHViLmNvbS9qb25hdGhhbnRuZWFsL2Nsb3Nlc3RcblxuKGZ1bmN0aW9uIChFbGVtZW50UHJvdG8pIHtcblx0aWYgKHR5cGVvZiBFbGVtZW50UHJvdG8ubWF0Y2hlcyAhPT0gJ2Z1bmN0aW9uJykge1xuXHRcdEVsZW1lbnRQcm90by5tYXRjaGVzID0gRWxlbWVudFByb3RvLm1zTWF0Y2hlc1NlbGVjdG9yIHx8IEVsZW1lbnRQcm90by5tb3pNYXRjaGVzU2VsZWN0b3IgfHwgRWxlbWVudFByb3RvLndlYmtpdE1hdGNoZXNTZWxlY3RvciB8fCBmdW5jdGlvbiBtYXRjaGVzKHNlbGVjdG9yKSB7XG5cdFx0XHR2YXIgZWxlbWVudCA9IHRoaXM7XG5cdFx0XHR2YXIgZWxlbWVudHMgPSAoZWxlbWVudC5kb2N1bWVudCB8fCBlbGVtZW50Lm93bmVyRG9jdW1lbnQpLnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpO1xuXHRcdFx0dmFyIGluZGV4ID0gMDtcblxuXHRcdFx0d2hpbGUgKGVsZW1lbnRzW2luZGV4XSAmJiBlbGVtZW50c1tpbmRleF0gIT09IGVsZW1lbnQpIHtcblx0XHRcdFx0KytpbmRleDtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIEJvb2xlYW4oZWxlbWVudHNbaW5kZXhdKTtcblx0XHR9O1xuXHR9XG5cblx0aWYgKHR5cGVvZiBFbGVtZW50UHJvdG8uY2xvc2VzdCAhPT0gJ2Z1bmN0aW9uJykge1xuXHRcdEVsZW1lbnRQcm90by5jbG9zZXN0ID0gZnVuY3Rpb24gY2xvc2VzdChzZWxlY3Rvcikge1xuXHRcdFx0dmFyIGVsZW1lbnQgPSB0aGlzO1xuXG5cdFx0XHR3aGlsZSAoZWxlbWVudCAmJiBlbGVtZW50Lm5vZGVUeXBlID09PSAxKSB7XG5cdFx0XHRcdGlmIChlbGVtZW50Lm1hdGNoZXMoc2VsZWN0b3IpKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGVsZW1lbnQ7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRlbGVtZW50ID0gZWxlbWVudC5wYXJlbnROb2RlO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9O1xuXHR9XG59KSh3aW5kb3cuRWxlbWVudC5wcm90b3R5cGUpO1xuIiwiLyogZ2xvYmFsIGRlZmluZSwgS2V5Ym9hcmRFdmVudCwgbW9kdWxlICovXG5cbihmdW5jdGlvbiAoKSB7XG5cbiAgdmFyIGtleWJvYXJkZXZlbnRLZXlQb2x5ZmlsbCA9IHtcbiAgICBwb2x5ZmlsbDogcG9seWZpbGwsXG4gICAga2V5czoge1xuICAgICAgMzogJ0NhbmNlbCcsXG4gICAgICA2OiAnSGVscCcsXG4gICAgICA4OiAnQmFja3NwYWNlJyxcbiAgICAgIDk6ICdUYWInLFxuICAgICAgMTI6ICdDbGVhcicsXG4gICAgICAxMzogJ0VudGVyJyxcbiAgICAgIDE2OiAnU2hpZnQnLFxuICAgICAgMTc6ICdDb250cm9sJyxcbiAgICAgIDE4OiAnQWx0JyxcbiAgICAgIDE5OiAnUGF1c2UnLFxuICAgICAgMjA6ICdDYXBzTG9jaycsXG4gICAgICAyNzogJ0VzY2FwZScsXG4gICAgICAyODogJ0NvbnZlcnQnLFxuICAgICAgMjk6ICdOb25Db252ZXJ0JyxcbiAgICAgIDMwOiAnQWNjZXB0JyxcbiAgICAgIDMxOiAnTW9kZUNoYW5nZScsXG4gICAgICAzMjogJyAnLFxuICAgICAgMzM6ICdQYWdlVXAnLFxuICAgICAgMzQ6ICdQYWdlRG93bicsXG4gICAgICAzNTogJ0VuZCcsXG4gICAgICAzNjogJ0hvbWUnLFxuICAgICAgMzc6ICdBcnJvd0xlZnQnLFxuICAgICAgMzg6ICdBcnJvd1VwJyxcbiAgICAgIDM5OiAnQXJyb3dSaWdodCcsXG4gICAgICA0MDogJ0Fycm93RG93bicsXG4gICAgICA0MTogJ1NlbGVjdCcsXG4gICAgICA0MjogJ1ByaW50JyxcbiAgICAgIDQzOiAnRXhlY3V0ZScsXG4gICAgICA0NDogJ1ByaW50U2NyZWVuJyxcbiAgICAgIDQ1OiAnSW5zZXJ0JyxcbiAgICAgIDQ2OiAnRGVsZXRlJyxcbiAgICAgIDQ4OiBbJzAnLCAnKSddLFxuICAgICAgNDk6IFsnMScsICchJ10sXG4gICAgICA1MDogWycyJywgJ0AnXSxcbiAgICAgIDUxOiBbJzMnLCAnIyddLFxuICAgICAgNTI6IFsnNCcsICckJ10sXG4gICAgICA1MzogWyc1JywgJyUnXSxcbiAgICAgIDU0OiBbJzYnLCAnXiddLFxuICAgICAgNTU6IFsnNycsICcmJ10sXG4gICAgICA1NjogWyc4JywgJyonXSxcbiAgICAgIDU3OiBbJzknLCAnKCddLFxuICAgICAgOTE6ICdPUycsXG4gICAgICA5MzogJ0NvbnRleHRNZW51JyxcbiAgICAgIDE0NDogJ051bUxvY2snLFxuICAgICAgMTQ1OiAnU2Nyb2xsTG9jaycsXG4gICAgICAxODE6ICdWb2x1bWVNdXRlJyxcbiAgICAgIDE4MjogJ1ZvbHVtZURvd24nLFxuICAgICAgMTgzOiAnVm9sdW1lVXAnLFxuICAgICAgMTg2OiBbJzsnLCAnOiddLFxuICAgICAgMTg3OiBbJz0nLCAnKyddLFxuICAgICAgMTg4OiBbJywnLCAnPCddLFxuICAgICAgMTg5OiBbJy0nLCAnXyddLFxuICAgICAgMTkwOiBbJy4nLCAnPiddLFxuICAgICAgMTkxOiBbJy8nLCAnPyddLFxuICAgICAgMTkyOiBbJ2AnLCAnfiddLFxuICAgICAgMjE5OiBbJ1snLCAneyddLFxuICAgICAgMjIwOiBbJ1xcXFwnLCAnfCddLFxuICAgICAgMjIxOiBbJ10nLCAnfSddLFxuICAgICAgMjIyOiBbXCInXCIsICdcIiddLFxuICAgICAgMjI0OiAnTWV0YScsXG4gICAgICAyMjU6ICdBbHRHcmFwaCcsXG4gICAgICAyNDY6ICdBdHRuJyxcbiAgICAgIDI0NzogJ0NyU2VsJyxcbiAgICAgIDI0ODogJ0V4U2VsJyxcbiAgICAgIDI0OTogJ0VyYXNlRW9mJyxcbiAgICAgIDI1MDogJ1BsYXknLFxuICAgICAgMjUxOiAnWm9vbU91dCdcbiAgICB9XG4gIH07XG5cbiAgLy8gRnVuY3Rpb24ga2V5cyAoRjEtMjQpLlxuICB2YXIgaTtcbiAgZm9yIChpID0gMTsgaSA8IDI1OyBpKyspIHtcbiAgICBrZXlib2FyZGV2ZW50S2V5UG9seWZpbGwua2V5c1sxMTEgKyBpXSA9ICdGJyArIGk7XG4gIH1cblxuICAvLyBQcmludGFibGUgQVNDSUkgY2hhcmFjdGVycy5cbiAgdmFyIGxldHRlciA9ICcnO1xuICBmb3IgKGkgPSA2NTsgaSA8IDkxOyBpKyspIHtcbiAgICBsZXR0ZXIgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGkpO1xuICAgIGtleWJvYXJkZXZlbnRLZXlQb2x5ZmlsbC5rZXlzW2ldID0gW2xldHRlci50b0xvd2VyQ2FzZSgpLCBsZXR0ZXIudG9VcHBlckNhc2UoKV07XG4gIH1cblxuICBmdW5jdGlvbiBwb2x5ZmlsbCAoKSB7XG4gICAgaWYgKCEoJ0tleWJvYXJkRXZlbnQnIGluIHdpbmRvdykgfHxcbiAgICAgICAgJ2tleScgaW4gS2V5Ym9hcmRFdmVudC5wcm90b3R5cGUpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyBQb2x5ZmlsbCBga2V5YCBvbiBgS2V5Ym9hcmRFdmVudGAuXG4gICAgdmFyIHByb3RvID0ge1xuICAgICAgZ2V0OiBmdW5jdGlvbiAoeCkge1xuICAgICAgICB2YXIga2V5ID0ga2V5Ym9hcmRldmVudEtleVBvbHlmaWxsLmtleXNbdGhpcy53aGljaCB8fCB0aGlzLmtleUNvZGVdO1xuXG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KGtleSkpIHtcbiAgICAgICAgICBrZXkgPSBrZXlbK3RoaXMuc2hpZnRLZXldO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGtleTtcbiAgICAgIH1cbiAgICB9O1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShLZXlib2FyZEV2ZW50LnByb3RvdHlwZSwgJ2tleScsIHByb3RvKTtcbiAgICByZXR1cm4gcHJvdG87XG4gIH1cblxuICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgZGVmaW5lKCdrZXlib2FyZGV2ZW50LWtleS1wb2x5ZmlsbCcsIGtleWJvYXJkZXZlbnRLZXlQb2x5ZmlsbCk7XG4gIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBrZXlib2FyZGV2ZW50S2V5UG9seWZpbGw7XG4gIH0gZWxzZSBpZiAod2luZG93KSB7XG4gICAgd2luZG93LmtleWJvYXJkZXZlbnRLZXlQb2x5ZmlsbCA9IGtleWJvYXJkZXZlbnRLZXlQb2x5ZmlsbDtcbiAgfVxuXG59KSgpO1xuIiwiLypcbm9iamVjdC1hc3NpZ25cbihjKSBTaW5kcmUgU29yaHVzXG5AbGljZW5zZSBNSVRcbiovXG5cbid1c2Ugc3RyaWN0Jztcbi8qIGVzbGludC1kaXNhYmxlIG5vLXVudXNlZC12YXJzICovXG52YXIgZ2V0T3duUHJvcGVydHlTeW1ib2xzID0gT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scztcbnZhciBoYXNPd25Qcm9wZXJ0eSA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG52YXIgcHJvcElzRW51bWVyYWJsZSA9IE9iamVjdC5wcm90b3R5cGUucHJvcGVydHlJc0VudW1lcmFibGU7XG5cbmZ1bmN0aW9uIHRvT2JqZWN0KHZhbCkge1xuXHRpZiAodmFsID09PSBudWxsIHx8IHZhbCA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0dGhyb3cgbmV3IFR5cGVFcnJvcignT2JqZWN0LmFzc2lnbiBjYW5ub3QgYmUgY2FsbGVkIHdpdGggbnVsbCBvciB1bmRlZmluZWQnKTtcblx0fVxuXG5cdHJldHVybiBPYmplY3QodmFsKTtcbn1cblxuZnVuY3Rpb24gc2hvdWxkVXNlTmF0aXZlKCkge1xuXHR0cnkge1xuXHRcdGlmICghT2JqZWN0LmFzc2lnbikge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblxuXHRcdC8vIERldGVjdCBidWdneSBwcm9wZXJ0eSBlbnVtZXJhdGlvbiBvcmRlciBpbiBvbGRlciBWOCB2ZXJzaW9ucy5cblxuXHRcdC8vIGh0dHBzOi8vYnVncy5jaHJvbWl1bS5vcmcvcC92OC9pc3N1ZXMvZGV0YWlsP2lkPTQxMThcblx0XHR2YXIgdGVzdDEgPSBuZXcgU3RyaW5nKCdhYmMnKTsgIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tbmV3LXdyYXBwZXJzXG5cdFx0dGVzdDFbNV0gPSAnZGUnO1xuXHRcdGlmIChPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyh0ZXN0MSlbMF0gPT09ICc1Jykge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblxuXHRcdC8vIGh0dHBzOi8vYnVncy5jaHJvbWl1bS5vcmcvcC92OC9pc3N1ZXMvZGV0YWlsP2lkPTMwNTZcblx0XHR2YXIgdGVzdDIgPSB7fTtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IDEwOyBpKyspIHtcblx0XHRcdHRlc3QyWydfJyArIFN0cmluZy5mcm9tQ2hhckNvZGUoaSldID0gaTtcblx0XHR9XG5cdFx0dmFyIG9yZGVyMiA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHRlc3QyKS5tYXAoZnVuY3Rpb24gKG4pIHtcblx0XHRcdHJldHVybiB0ZXN0MltuXTtcblx0XHR9KTtcblx0XHRpZiAob3JkZXIyLmpvaW4oJycpICE9PSAnMDEyMzQ1Njc4OScpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cblx0XHQvLyBodHRwczovL2J1Z3MuY2hyb21pdW0ub3JnL3AvdjgvaXNzdWVzL2RldGFpbD9pZD0zMDU2XG5cdFx0dmFyIHRlc3QzID0ge307XG5cdFx0J2FiY2RlZmdoaWprbG1ub3BxcnN0Jy5zcGxpdCgnJykuZm9yRWFjaChmdW5jdGlvbiAobGV0dGVyKSB7XG5cdFx0XHR0ZXN0M1tsZXR0ZXJdID0gbGV0dGVyO1xuXHRcdH0pO1xuXHRcdGlmIChPYmplY3Qua2V5cyhPYmplY3QuYXNzaWduKHt9LCB0ZXN0MykpLmpvaW4oJycpICE9PVxuXHRcdFx0XHQnYWJjZGVmZ2hpamtsbW5vcHFyc3QnKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRydWU7XG5cdH0gY2F0Y2ggKGVycikge1xuXHRcdC8vIFdlIGRvbid0IGV4cGVjdCBhbnkgb2YgdGhlIGFib3ZlIHRvIHRocm93LCBidXQgYmV0dGVyIHRvIGJlIHNhZmUuXG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gc2hvdWxkVXNlTmF0aXZlKCkgPyBPYmplY3QuYXNzaWduIDogZnVuY3Rpb24gKHRhcmdldCwgc291cmNlKSB7XG5cdHZhciBmcm9tO1xuXHR2YXIgdG8gPSB0b09iamVjdCh0YXJnZXQpO1xuXHR2YXIgc3ltYm9scztcblxuXHRmb3IgKHZhciBzID0gMTsgcyA8IGFyZ3VtZW50cy5sZW5ndGg7IHMrKykge1xuXHRcdGZyb20gPSBPYmplY3QoYXJndW1lbnRzW3NdKTtcblxuXHRcdGZvciAodmFyIGtleSBpbiBmcm9tKSB7XG5cdFx0XHRpZiAoaGFzT3duUHJvcGVydHkuY2FsbChmcm9tLCBrZXkpKSB7XG5cdFx0XHRcdHRvW2tleV0gPSBmcm9tW2tleV07XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYgKGdldE93blByb3BlcnR5U3ltYm9scykge1xuXHRcdFx0c3ltYm9scyA9IGdldE93blByb3BlcnR5U3ltYm9scyhmcm9tKTtcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgc3ltYm9scy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRpZiAocHJvcElzRW51bWVyYWJsZS5jYWxsKGZyb20sIHN5bWJvbHNbaV0pKSB7XG5cdFx0XHRcdFx0dG9bc3ltYm9sc1tpXV0gPSBmcm9tW3N5bWJvbHNbaV1dO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIHRvO1xufTtcbiIsImNvbnN0IGFzc2lnbiA9IHJlcXVpcmUoJ29iamVjdC1hc3NpZ24nKTtcbmNvbnN0IGRlbGVnYXRlID0gcmVxdWlyZSgnLi4vZGVsZWdhdGUnKTtcbmNvbnN0IGRlbGVnYXRlQWxsID0gcmVxdWlyZSgnLi4vZGVsZWdhdGVBbGwnKTtcblxuY29uc3QgREVMRUdBVEVfUEFUVEVSTiA9IC9eKC4rKTpkZWxlZ2F0ZVxcKCguKylcXCkkLztcbmNvbnN0IFNQQUNFID0gJyAnO1xuXG5jb25zdCBnZXRMaXN0ZW5lcnMgPSBmdW5jdGlvbih0eXBlLCBoYW5kbGVyKSB7XG4gIHZhciBtYXRjaCA9IHR5cGUubWF0Y2goREVMRUdBVEVfUEFUVEVSTik7XG4gIHZhciBzZWxlY3RvcjtcbiAgaWYgKG1hdGNoKSB7XG4gICAgdHlwZSA9IG1hdGNoWzFdO1xuICAgIHNlbGVjdG9yID0gbWF0Y2hbMl07XG4gIH1cblxuICB2YXIgb3B0aW9ucztcbiAgaWYgKHR5cGVvZiBoYW5kbGVyID09PSAnb2JqZWN0Jykge1xuICAgIG9wdGlvbnMgPSB7XG4gICAgICBjYXB0dXJlOiBwb3BLZXkoaGFuZGxlciwgJ2NhcHR1cmUnKSxcbiAgICAgIHBhc3NpdmU6IHBvcEtleShoYW5kbGVyLCAncGFzc2l2ZScpXG4gICAgfTtcbiAgfVxuXG4gIHZhciBsaXN0ZW5lciA9IHtcbiAgICBzZWxlY3Rvcjogc2VsZWN0b3IsXG4gICAgZGVsZWdhdGU6ICh0eXBlb2YgaGFuZGxlciA9PT0gJ29iamVjdCcpXG4gICAgICA/IGRlbGVnYXRlQWxsKGhhbmRsZXIpXG4gICAgICA6IHNlbGVjdG9yXG4gICAgICAgID8gZGVsZWdhdGUoc2VsZWN0b3IsIGhhbmRsZXIpXG4gICAgICAgIDogaGFuZGxlcixcbiAgICBvcHRpb25zOiBvcHRpb25zXG4gIH07XG5cbiAgaWYgKHR5cGUuaW5kZXhPZihTUEFDRSkgPiAtMSkge1xuICAgIHJldHVybiB0eXBlLnNwbGl0KFNQQUNFKS5tYXAoZnVuY3Rpb24oX3R5cGUpIHtcbiAgICAgIHJldHVybiBhc3NpZ24oe3R5cGU6IF90eXBlfSwgbGlzdGVuZXIpO1xuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIGxpc3RlbmVyLnR5cGUgPSB0eXBlO1xuICAgIHJldHVybiBbbGlzdGVuZXJdO1xuICB9XG59O1xuXG52YXIgcG9wS2V5ID0gZnVuY3Rpb24ob2JqLCBrZXkpIHtcbiAgdmFyIHZhbHVlID0gb2JqW2tleV07XG4gIGRlbGV0ZSBvYmpba2V5XTtcbiAgcmV0dXJuIHZhbHVlO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBiZWhhdmlvcihldmVudHMsIHByb3BzKSB7XG4gIGNvbnN0IGxpc3RlbmVycyA9IE9iamVjdC5rZXlzKGV2ZW50cylcbiAgICAucmVkdWNlKGZ1bmN0aW9uKG1lbW8sIHR5cGUpIHtcbiAgICAgIHZhciBsaXN0ZW5lcnMgPSBnZXRMaXN0ZW5lcnModHlwZSwgZXZlbnRzW3R5cGVdKTtcbiAgICAgIHJldHVybiBtZW1vLmNvbmNhdChsaXN0ZW5lcnMpO1xuICAgIH0sIFtdKTtcblxuICByZXR1cm4gYXNzaWduKHtcbiAgICBhZGQ6IGZ1bmN0aW9uIGFkZEJlaGF2aW9yKGVsZW1lbnQpIHtcbiAgICAgIGxpc3RlbmVycy5mb3JFYWNoKGZ1bmN0aW9uKGxpc3RlbmVyKSB7XG4gICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgICBsaXN0ZW5lci50eXBlLFxuICAgICAgICAgIGxpc3RlbmVyLmRlbGVnYXRlLFxuICAgICAgICAgIGxpc3RlbmVyLm9wdGlvbnNcbiAgICAgICAgKTtcbiAgICAgIH0pO1xuICAgIH0sXG4gICAgcmVtb3ZlOiBmdW5jdGlvbiByZW1vdmVCZWhhdmlvcihlbGVtZW50KSB7XG4gICAgICBsaXN0ZW5lcnMuZm9yRWFjaChmdW5jdGlvbihsaXN0ZW5lcikge1xuICAgICAgICBlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXG4gICAgICAgICAgbGlzdGVuZXIudHlwZSxcbiAgICAgICAgICBsaXN0ZW5lci5kZWxlZ2F0ZSxcbiAgICAgICAgICBsaXN0ZW5lci5vcHRpb25zXG4gICAgICAgICk7XG4gICAgICB9KTtcbiAgICB9XG4gIH0sIHByb3BzKTtcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGNvbXBvc2UoZnVuY3Rpb25zKSB7XG4gIHJldHVybiBmdW5jdGlvbihlKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9ucy5zb21lKGZ1bmN0aW9uKGZuKSB7XG4gICAgICByZXR1cm4gZm4uY2FsbCh0aGlzLCBlKSA9PT0gZmFsc2U7XG4gICAgfSwgdGhpcyk7XG4gIH07XG59O1xuIiwiLy8gcG9seWZpbGwgRWxlbWVudC5wcm90b3R5cGUuY2xvc2VzdFxucmVxdWlyZSgnZWxlbWVudC1jbG9zZXN0Jyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZGVsZWdhdGUoc2VsZWN0b3IsIGZuKSB7XG4gIHJldHVybiBmdW5jdGlvbiBkZWxlZ2F0aW9uKGV2ZW50KSB7XG4gICAgdmFyIHRhcmdldCA9IGV2ZW50LnRhcmdldC5jbG9zZXN0KHNlbGVjdG9yKTtcbiAgICBpZiAodGFyZ2V0KSB7XG4gICAgICByZXR1cm4gZm4uY2FsbCh0YXJnZXQsIGV2ZW50KTtcbiAgICB9XG4gIH1cbn07XG4iLCJjb25zdCBkZWxlZ2F0ZSA9IHJlcXVpcmUoJy4uL2RlbGVnYXRlJyk7XG5jb25zdCBjb21wb3NlID0gcmVxdWlyZSgnLi4vY29tcG9zZScpO1xuXG5jb25zdCBTUExBVCA9ICcqJztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBkZWxlZ2F0ZUFsbChzZWxlY3RvcnMpIHtcbiAgY29uc3Qga2V5cyA9IE9iamVjdC5rZXlzKHNlbGVjdG9ycylcblxuICAvLyBYWFggb3B0aW1pemF0aW9uOiBpZiB0aGVyZSBpcyBvbmx5IG9uZSBoYW5kbGVyIGFuZCBpdCBhcHBsaWVzIHRvXG4gIC8vIGFsbCBlbGVtZW50cyAodGhlIFwiKlwiIENTUyBzZWxlY3RvciksIHRoZW4ganVzdCByZXR1cm4gdGhhdFxuICAvLyBoYW5kbGVyXG4gIGlmIChrZXlzLmxlbmd0aCA9PT0gMSAmJiBrZXlzWzBdID09PSBTUExBVCkge1xuICAgIHJldHVybiBzZWxlY3RvcnNbU1BMQVRdO1xuICB9XG5cbiAgY29uc3QgZGVsZWdhdGVzID0ga2V5cy5yZWR1Y2UoZnVuY3Rpb24obWVtbywgc2VsZWN0b3IpIHtcbiAgICBtZW1vLnB1c2goZGVsZWdhdGUoc2VsZWN0b3IsIHNlbGVjdG9yc1tzZWxlY3Rvcl0pKTtcbiAgICByZXR1cm4gbWVtbztcbiAgfSwgW10pO1xuICByZXR1cm4gY29tcG9zZShkZWxlZ2F0ZXMpO1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaWdub3JlKGVsZW1lbnQsIGZuKSB7XG4gIHJldHVybiBmdW5jdGlvbiBpZ25vcmFuY2UoZSkge1xuICAgIGlmIChlbGVtZW50ICE9PSBlLnRhcmdldCAmJiAhZWxlbWVudC5jb250YWlucyhlLnRhcmdldCkpIHtcbiAgICAgIHJldHVybiBmbi5jYWxsKHRoaXMsIGUpO1xuICAgIH1cbiAgfTtcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgYmVoYXZpb3I6ICAgICByZXF1aXJlKCcuL2JlaGF2aW9yJyksXG4gIGRlbGVnYXRlOiAgICAgcmVxdWlyZSgnLi9kZWxlZ2F0ZScpLFxuICBkZWxlZ2F0ZUFsbDogIHJlcXVpcmUoJy4vZGVsZWdhdGVBbGwnKSxcbiAgaWdub3JlOiAgICAgICByZXF1aXJlKCcuL2lnbm9yZScpLFxuICBrZXltYXA6ICAgICAgIHJlcXVpcmUoJy4va2V5bWFwJyksXG59O1xuIiwicmVxdWlyZSgna2V5Ym9hcmRldmVudC1rZXktcG9seWZpbGwnKTtcblxuLy8gdGhlc2UgYXJlIHRoZSBvbmx5IHJlbGV2YW50IG1vZGlmaWVycyBzdXBwb3J0ZWQgb24gYWxsIHBsYXRmb3Jtcyxcbi8vIGFjY29yZGluZyB0byBNRE46XG4vLyA8aHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL0tleWJvYXJkRXZlbnQvZ2V0TW9kaWZpZXJTdGF0ZT5cbmNvbnN0IE1PRElGSUVSUyA9IHtcbiAgJ0FsdCc6ICAgICAgJ2FsdEtleScsXG4gICdDb250cm9sJzogICdjdHJsS2V5JyxcbiAgJ0N0cmwnOiAgICAgJ2N0cmxLZXknLFxuICAnU2hpZnQnOiAgICAnc2hpZnRLZXknXG59O1xuXG5jb25zdCBNT0RJRklFUl9TRVBBUkFUT1IgPSAnKyc7XG5cbmNvbnN0IGdldEV2ZW50S2V5ID0gZnVuY3Rpb24oZXZlbnQsIGhhc01vZGlmaWVycykge1xuICB2YXIga2V5ID0gZXZlbnQua2V5O1xuICBpZiAoaGFzTW9kaWZpZXJzKSB7XG4gICAgZm9yICh2YXIgbW9kaWZpZXIgaW4gTU9ESUZJRVJTKSB7XG4gICAgICBpZiAoZXZlbnRbTU9ESUZJRVJTW21vZGlmaWVyXV0gPT09IHRydWUpIHtcbiAgICAgICAga2V5ID0gW21vZGlmaWVyLCBrZXldLmpvaW4oTU9ESUZJRVJfU0VQQVJBVE9SKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIGtleTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ga2V5bWFwKGtleXMpIHtcbiAgY29uc3QgaGFzTW9kaWZpZXJzID0gT2JqZWN0LmtleXMoa2V5cykuc29tZShmdW5jdGlvbihrZXkpIHtcbiAgICByZXR1cm4ga2V5LmluZGV4T2YoTU9ESUZJRVJfU0VQQVJBVE9SKSA+IC0xO1xuICB9KTtcbiAgcmV0dXJuIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgdmFyIGtleSA9IGdldEV2ZW50S2V5KGV2ZW50LCBoYXNNb2RpZmllcnMpO1xuICAgIHJldHVybiBba2V5LCBrZXkudG9Mb3dlckNhc2UoKV1cbiAgICAgIC5yZWR1Y2UoZnVuY3Rpb24ocmVzdWx0LCBfa2V5KSB7XG4gICAgICAgIGlmIChfa2V5IGluIGtleXMpIHtcbiAgICAgICAgICByZXN1bHQgPSBrZXlzW2tleV0uY2FsbCh0aGlzLCBldmVudCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgIH0sIHVuZGVmaW5lZCk7XG4gIH07XG59O1xuXG5tb2R1bGUuZXhwb3J0cy5NT0RJRklFUlMgPSBNT0RJRklFUlM7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIG9uY2UobGlzdGVuZXIsIG9wdGlvbnMpIHtcbiAgdmFyIHdyYXBwZWQgPSBmdW5jdGlvbiB3cmFwcGVkT25jZShlKSB7XG4gICAgZS5jdXJyZW50VGFyZ2V0LnJlbW92ZUV2ZW50TGlzdGVuZXIoZS50eXBlLCB3cmFwcGVkLCBvcHRpb25zKTtcbiAgICByZXR1cm4gbGlzdGVuZXIuY2FsbCh0aGlzLCBlKTtcbiAgfTtcbiAgcmV0dXJuIHdyYXBwZWQ7XG59O1xuXG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBSRV9UUklNID0gLyheXFxzKyl8KFxccyskKS9nO1xudmFyIFJFX1NQTElUID0gL1xccysvO1xuXG52YXIgdHJpbSA9IFN0cmluZy5wcm90b3R5cGUudHJpbVxuICA/IGZ1bmN0aW9uKHN0cikgeyByZXR1cm4gc3RyLnRyaW0oKTsgfVxuICA6IGZ1bmN0aW9uKHN0cikgeyByZXR1cm4gc3RyLnJlcGxhY2UoUkVfVFJJTSwgJycpOyB9O1xuXG52YXIgcXVlcnlCeUlkID0gZnVuY3Rpb24oaWQpIHtcbiAgcmV0dXJuIHRoaXMucXVlcnlTZWxlY3RvcignW2lkPVwiJyArIGlkLnJlcGxhY2UoL1wiL2csICdcXFxcXCInKSArICdcIl0nKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gcmVzb2x2ZUlkcyhpZHMsIGRvYykge1xuICBpZiAodHlwZW9mIGlkcyAhPT0gJ3N0cmluZycpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0V4cGVjdGVkIGEgc3RyaW5nIGJ1dCBnb3QgJyArICh0eXBlb2YgaWRzKSk7XG4gIH1cblxuICBpZiAoIWRvYykge1xuICAgIGRvYyA9IHdpbmRvdy5kb2N1bWVudDtcbiAgfVxuXG4gIHZhciBnZXRFbGVtZW50QnlJZCA9IGRvYy5nZXRFbGVtZW50QnlJZFxuICAgID8gZG9jLmdldEVsZW1lbnRCeUlkLmJpbmQoZG9jKVxuICAgIDogcXVlcnlCeUlkLmJpbmQoZG9jKTtcblxuICBpZHMgPSB0cmltKGlkcykuc3BsaXQoUkVfU1BMSVQpO1xuXG4gIC8vIFhYWCB3ZSBjYW4gc2hvcnQtY2lyY3VpdCBoZXJlIGJlY2F1c2UgdHJpbW1pbmcgYW5kIHNwbGl0dGluZyBhXG4gIC8vIHN0cmluZyBvZiBqdXN0IHdoaXRlc3BhY2UgcHJvZHVjZXMgYW4gYXJyYXkgY29udGFpbmluZyBhIHNpbmdsZSxcbiAgLy8gZW1wdHkgc3RyaW5nXG4gIGlmIChpZHMubGVuZ3RoID09PSAxICYmIGlkc1swXSA9PT0gJycpIHtcbiAgICByZXR1cm4gW107XG4gIH1cblxuICByZXR1cm4gaWRzXG4gICAgLm1hcChmdW5jdGlvbihpZCkge1xuICAgICAgdmFyIGVsID0gZ2V0RWxlbWVudEJ5SWQoaWQpO1xuICAgICAgaWYgKCFlbCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ25vIGVsZW1lbnQgd2l0aCBpZDogXCInICsgaWQgKyAnXCInKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBlbDtcbiAgICB9KTtcbn07XG4iLCJjb25zdCBiZWhhdmlvciA9IHJlcXVpcmUoXCIuLi8uLi91c3dkcy1jb3JlL3NyYy9qcy91dGlscy9iZWhhdmlvclwiKTtcbmNvbnN0IHRvZ2dsZUZvcm1JbnB1dCA9IHJlcXVpcmUoXCIuLi8uLi91c3dkcy1jb3JlL3NyYy9qcy91dGlscy90b2dnbGUtZm9ybS1pbnB1dFwiKTtcblxuY29uc3QgeyBDTElDSyB9ID0gcmVxdWlyZShcIi4uLy4uL3Vzd2RzLWNvcmUvc3JjL2pzL2V2ZW50c1wiKTtcbmNvbnN0IHsgcHJlZml4OiBQUkVGSVggfSA9IHJlcXVpcmUoXCIuLi8uLi91c3dkcy1jb3JlL3NyYy9qcy9jb25maWdcIik7XG5cbmNvbnN0IExJTksgPSBgLiR7UFJFRklYfS1zaG93LXBhc3N3b3JkYDtcblxuZnVuY3Rpb24gdG9nZ2xlKGV2ZW50KSB7XG4gIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gIHRvZ2dsZUZvcm1JbnB1dCh0aGlzKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiZWhhdmlvcih7XG4gIFtDTElDS106IHtcbiAgICBbTElOS106IHRvZ2dsZSxcbiAgfSxcbn0pO1xuIiwiY29uc3Qgc2VsZWN0ID0gcmVxdWlyZShcIi4uLy4uL3Vzd2RzLWNvcmUvc3JjL2pzL3V0aWxzL3NlbGVjdFwiKTtcbmNvbnN0IGJlaGF2aW9yID0gcmVxdWlyZShcIi4uLy4uL3Vzd2RzLWNvcmUvc3JjL2pzL3V0aWxzL2JlaGF2aW9yXCIpO1xuY29uc3QgdG9nZ2xlID0gcmVxdWlyZShcIi4uLy4uL3Vzd2RzLWNvcmUvc3JjL2pzL3V0aWxzL3RvZ2dsZVwiKTtcbmNvbnN0IGlzRWxlbWVudEluVmlld3BvcnQgPSByZXF1aXJlKFwiLi4vLi4vdXN3ZHMtY29yZS9zcmMvanMvdXRpbHMvaXMtaW4tdmlld3BvcnRcIik7XG5jb25zdCB7IENMSUNLIH0gPSByZXF1aXJlKFwiLi4vLi4vdXN3ZHMtY29yZS9zcmMvanMvZXZlbnRzXCIpO1xuY29uc3QgeyBwcmVmaXg6IFBSRUZJWCB9ID0gcmVxdWlyZShcIi4uLy4uL3Vzd2RzLWNvcmUvc3JjL2pzL2NvbmZpZ1wiKTtcblxuY29uc3QgQUNDT1JESU9OID0gYC4ke1BSRUZJWH0tYWNjb3JkaW9uLCAuJHtQUkVGSVh9LWFjY29yZGlvbi0tYm9yZGVyZWRgO1xuY29uc3QgQlVUVE9OID0gYC4ke1BSRUZJWH0tYWNjb3JkaW9uX19idXR0b25bYXJpYS1jb250cm9sc11gO1xuY29uc3QgRVhQQU5ERUQgPSBcImFyaWEtZXhwYW5kZWRcIjtcbmNvbnN0IE1VTFRJU0VMRUNUQUJMRSA9IFwiZGF0YS1hbGxvdy1tdWx0aXBsZVwiO1xuXG4vKipcbiAqIEdldCBhbiBBcnJheSBvZiBidXR0b24gZWxlbWVudHMgYmVsb25naW5nIGRpcmVjdGx5IHRvIHRoZSBnaXZlblxuICogYWNjb3JkaW9uIGVsZW1lbnQuXG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBhY2NvcmRpb25cbiAqIEByZXR1cm4ge2FycmF5PEhUTUxCdXR0b25FbGVtZW50Pn1cbiAqL1xuY29uc3QgZ2V0QWNjb3JkaW9uQnV0dG9ucyA9IChhY2NvcmRpb24pID0+IHtcbiAgY29uc3QgYnV0dG9ucyA9IHNlbGVjdChCVVRUT04sIGFjY29yZGlvbik7XG5cbiAgcmV0dXJuIGJ1dHRvbnMuZmlsdGVyKChidXR0b24pID0+IGJ1dHRvbi5jbG9zZXN0KEFDQ09SRElPTikgPT09IGFjY29yZGlvbik7XG59O1xuXG4vKipcbiAqIFRvZ2dsZSBhIGJ1dHRvbidzIFwicHJlc3NlZFwiIHN0YXRlLCBvcHRpb25hbGx5IHByb3ZpZGluZyBhIHRhcmdldFxuICogc3RhdGUuXG4gKlxuICogQHBhcmFtIHtIVE1MQnV0dG9uRWxlbWVudH0gYnV0dG9uXG4gKiBAcGFyYW0ge2Jvb2xlYW4/fSBleHBhbmRlZCBJZiBubyBzdGF0ZSBpcyBwcm92aWRlZCwgdGhlIGN1cnJlbnRcbiAqIHN0YXRlIHdpbGwgYmUgdG9nZ2xlZCAoZnJvbSBmYWxzZSB0byB0cnVlLCBhbmQgdmljZS12ZXJzYSkuXG4gKiBAcmV0dXJuIHtib29sZWFufSB0aGUgcmVzdWx0aW5nIHN0YXRlXG4gKi9cbmNvbnN0IHRvZ2dsZUJ1dHRvbiA9IChidXR0b24sIGV4cGFuZGVkKSA9PiB7XG4gIGNvbnN0IGFjY29yZGlvbiA9IGJ1dHRvbi5jbG9zZXN0KEFDQ09SRElPTik7XG4gIGxldCBzYWZlRXhwYW5kZWQgPSBleHBhbmRlZDtcblxuICBpZiAoIWFjY29yZGlvbikge1xuICAgIHRocm93IG5ldyBFcnJvcihgJHtCVVRUT059IGlzIG1pc3Npbmcgb3V0ZXIgJHtBQ0NPUkRJT059YCk7XG4gIH1cblxuICBzYWZlRXhwYW5kZWQgPSB0b2dnbGUoYnV0dG9uLCBleHBhbmRlZCk7XG5cbiAgLy8gWFhYIG11bHRpc2VsZWN0YWJsZSBpcyBvcHQtaW4sIHRvIHByZXNlcnZlIGxlZ2FjeSBiZWhhdmlvclxuICBjb25zdCBtdWx0aXNlbGVjdGFibGUgPSBhY2NvcmRpb24uaGFzQXR0cmlidXRlKE1VTFRJU0VMRUNUQUJMRSk7XG5cbiAgaWYgKHNhZmVFeHBhbmRlZCAmJiAhbXVsdGlzZWxlY3RhYmxlKSB7XG4gICAgZ2V0QWNjb3JkaW9uQnV0dG9ucyhhY2NvcmRpb24pLmZvckVhY2goKG90aGVyKSA9PiB7XG4gICAgICBpZiAob3RoZXIgIT09IGJ1dHRvbikge1xuICAgICAgICB0b2dnbGUob3RoZXIsIGZhbHNlKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufTtcblxuLyoqXG4gKiBAcGFyYW0ge0hUTUxCdXR0b25FbGVtZW50fSBidXR0b25cbiAqIEByZXR1cm4ge2Jvb2xlYW59IHRydWVcbiAqL1xuY29uc3Qgc2hvd0J1dHRvbiA9IChidXR0b24pID0+IHRvZ2dsZUJ1dHRvbihidXR0b24sIHRydWUpO1xuXG4vKipcbiAqIEBwYXJhbSB7SFRNTEJ1dHRvbkVsZW1lbnR9IGJ1dHRvblxuICogQHJldHVybiB7Ym9vbGVhbn0gZmFsc2VcbiAqL1xuY29uc3QgaGlkZUJ1dHRvbiA9IChidXR0b24pID0+IHRvZ2dsZUJ1dHRvbihidXR0b24sIGZhbHNlKTtcblxuY29uc3QgYWNjb3JkaW9uID0gYmVoYXZpb3IoXG4gIHtcbiAgICBbQ0xJQ0tdOiB7XG4gICAgICBbQlVUVE9OXShldmVudCkge1xuICAgICAgICB0b2dnbGVCdXR0b24odGhpcyk7XG5cbiAgICAgICAgaWYgKHRoaXMuZ2V0QXR0cmlidXRlKEVYUEFOREVEKSA9PT0gXCJ0cnVlXCIpIHtcbiAgICAgICAgICAvLyBXZSB3ZXJlIGp1c3QgZXhwYW5kZWQsIGJ1dCBpZiBhbm90aGVyIGFjY29yZGlvbiB3YXMgYWxzbyBqdXN0XG4gICAgICAgICAgLy8gY29sbGFwc2VkLCB3ZSBtYXkgbm8gbG9uZ2VyIGJlIGluIHRoZSB2aWV3cG9ydC4gVGhpcyBlbnN1cmVzXG4gICAgICAgICAgLy8gdGhhdCB3ZSBhcmUgc3RpbGwgdmlzaWJsZSwgc28gdGhlIHVzZXIgaXNuJ3QgY29uZnVzZWQuXG4gICAgICAgICAgaWYgKCFpc0VsZW1lbnRJblZpZXdwb3J0KHRoaXMpKSB0aGlzLnNjcm9sbEludG9WaWV3KCk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbiAge1xuICAgIGluaXQocm9vdCkge1xuICAgICAgc2VsZWN0KEJVVFRPTiwgcm9vdCkuZm9yRWFjaCgoYnV0dG9uKSA9PiB7XG4gICAgICAgIGNvbnN0IGV4cGFuZGVkID0gYnV0dG9uLmdldEF0dHJpYnV0ZShFWFBBTkRFRCkgPT09IFwidHJ1ZVwiO1xuICAgICAgICB0b2dnbGVCdXR0b24oYnV0dG9uLCBleHBhbmRlZCk7XG4gICAgICB9KTtcbiAgICB9LFxuICAgIEFDQ09SRElPTixcbiAgICBCVVRUT04sXG4gICAgc2hvdzogc2hvd0J1dHRvbixcbiAgICBoaWRlOiBoaWRlQnV0dG9uLFxuICAgIHRvZ2dsZTogdG9nZ2xlQnV0dG9uLFxuICAgIGdldEJ1dHRvbnM6IGdldEFjY29yZGlvbkJ1dHRvbnMsXG4gIH1cbik7XG5cbm1vZHVsZS5leHBvcnRzID0gYWNjb3JkaW9uO1xuIiwiY29uc3QgYmVoYXZpb3IgPSByZXF1aXJlKFwiLi4vLi4vdXN3ZHMtY29yZS9zcmMvanMvdXRpbHMvYmVoYXZpb3JcIik7XG5jb25zdCB7IENMSUNLIH0gPSByZXF1aXJlKFwiLi4vLi4vdXN3ZHMtY29yZS9zcmMvanMvZXZlbnRzXCIpO1xuY29uc3QgeyBwcmVmaXg6IFBSRUZJWCB9ID0gcmVxdWlyZShcIi4uLy4uL3Vzd2RzLWNvcmUvc3JjL2pzL2NvbmZpZ1wiKTtcblxuY29uc3QgSEVBREVSID0gYC4ke1BSRUZJWH0tYmFubmVyX19oZWFkZXJgO1xuY29uc3QgRVhQQU5ERURfQ0xBU1MgPSBgJHtQUkVGSVh9LWJhbm5lcl9faGVhZGVyLS1leHBhbmRlZGA7XG5cbmNvbnN0IHRvZ2dsZUJhbm5lciA9IGZ1bmN0aW9uIHRvZ2dsZUVsKGV2ZW50KSB7XG4gIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gIHRoaXMuY2xvc2VzdChIRUFERVIpLmNsYXNzTGlzdC50b2dnbGUoRVhQQU5ERURfQ0xBU1MpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBiZWhhdmlvcih7XG4gIFtDTElDS106IHtcbiAgICBbYCR7SEVBREVSfSBbYXJpYS1jb250cm9sc11gXTogdG9nZ2xlQmFubmVyLFxuICB9LFxufSk7XG4iLCJjb25zdCBzZWxlY3QgPSByZXF1aXJlKFwiLi4vLi4vdXN3ZHMtY29yZS9zcmMvanMvdXRpbHMvc2VsZWN0XCIpO1xuY29uc3QgYmVoYXZpb3IgPSByZXF1aXJlKFwiLi4vLi4vdXN3ZHMtY29yZS9zcmMvanMvdXRpbHMvYmVoYXZpb3JcIik7XG5jb25zdCB7IHByZWZpeDogUFJFRklYIH0gPSByZXF1aXJlKFwiLi4vLi4vdXN3ZHMtY29yZS9zcmMvanMvY29uZmlnXCIpO1xuXG5jb25zdCBDSEFSQUNURVJfQ09VTlQgPSBgLiR7UFJFRklYfS1jaGFyYWN0ZXItY291bnRgO1xuY29uc3QgSU5QVVQgPSBgLiR7UFJFRklYfS1jaGFyYWN0ZXItY291bnRfX2ZpZWxkYDtcbmNvbnN0IE1FU1NBR0UgPSBgLiR7UFJFRklYfS1jaGFyYWN0ZXItY291bnRfX21lc3NhZ2VgO1xuY29uc3QgVkFMSURBVElPTl9NRVNTQUdFID0gXCJUaGUgY29udGVudCBpcyB0b28gbG9uZy5cIjtcbmNvbnN0IE1FU1NBR0VfSU5WQUxJRF9DTEFTUyA9IGAke1BSRUZJWH0tY2hhcmFjdGVyLWNvdW50X19tZXNzYWdlLS1pbnZhbGlkYDtcblxuLyoqXG4gKiBUaGUgZWxlbWVudHMgd2l0aGluIHRoZSBjaGFyYWN0ZXIgY291bnQuXG4gKiBAdHlwZWRlZiB7T2JqZWN0fSBDaGFyYWN0ZXJDb3VudEVsZW1lbnRzXG4gKiBAcHJvcGVydHkge0hUTUxEaXZFbGVtZW50fSBjaGFyYWN0ZXJDb3VudEVsXG4gKiBAcHJvcGVydHkge0hUTUxTcGFuRWxlbWVudH0gbWVzc2FnZUVsXG4gKi9cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSByb290IGFuZCBtZXNzYWdlIGVsZW1lbnRcbiAqIGZvciBhbiBjaGFyYWN0ZXIgY291bnQgaW5wdXRcbiAqXG4gKiBAcGFyYW0ge0hUTUxJbnB1dEVsZW1lbnR8SFRNTFRleHRBcmVhRWxlbWVudH0gaW5wdXRFbCBUaGUgY2hhcmFjdGVyIGNvdW50IGlucHV0IGVsZW1lbnRcbiAqIEByZXR1cm5zIHtDaGFyYWN0ZXJDb3VudEVsZW1lbnRzfSBlbGVtZW50cyBUaGUgcm9vdCBhbmQgbWVzc2FnZSBlbGVtZW50LlxuICovXG5jb25zdCBnZXRDaGFyYWN0ZXJDb3VudEVsZW1lbnRzID0gKGlucHV0RWwpID0+IHtcbiAgY29uc3QgY2hhcmFjdGVyQ291bnRFbCA9IGlucHV0RWwuY2xvc2VzdChDSEFSQUNURVJfQ09VTlQpO1xuXG4gIGlmICghY2hhcmFjdGVyQ291bnRFbCkge1xuICAgIHRocm93IG5ldyBFcnJvcihgJHtJTlBVVH0gaXMgbWlzc2luZyBvdXRlciAke0NIQVJBQ1RFUl9DT1VOVH1gKTtcbiAgfVxuXG4gIGNvbnN0IG1lc3NhZ2VFbCA9IGNoYXJhY3RlckNvdW50RWwucXVlcnlTZWxlY3RvcihNRVNTQUdFKTtcblxuICBpZiAoIW1lc3NhZ2VFbCkge1xuICAgIHRocm93IG5ldyBFcnJvcihgJHtDSEFSQUNURVJfQ09VTlR9IGlzIG1pc3NpbmcgaW5uZXIgJHtNRVNTQUdFfWApO1xuICB9XG5cbiAgcmV0dXJuIHsgY2hhcmFjdGVyQ291bnRFbCwgbWVzc2FnZUVsIH07XG59O1xuXG4vKipcbiAqIFVwZGF0ZSB0aGUgY2hhcmFjdGVyIGNvdW50IGNvbXBvbmVudFxuICpcbiAqIEBwYXJhbSB7SFRNTElucHV0RWxlbWVudHxIVE1MVGV4dEFyZWFFbGVtZW50fSBpbnB1dEVsIFRoZSBjaGFyYWN0ZXIgY291bnQgaW5wdXQgZWxlbWVudFxuICovXG5jb25zdCB1cGRhdGVDb3VudE1lc3NhZ2UgPSAoaW5wdXRFbCkgPT4ge1xuICBjb25zdCB7IGNoYXJhY3RlckNvdW50RWwsIG1lc3NhZ2VFbCB9ID0gZ2V0Q2hhcmFjdGVyQ291bnRFbGVtZW50cyhpbnB1dEVsKTtcblxuICBjb25zdCBtYXhsZW5ndGggPSBwYXJzZUludChcbiAgICBjaGFyYWN0ZXJDb3VudEVsLmdldEF0dHJpYnV0ZShcImRhdGEtbWF4bGVuZ3RoXCIpLFxuICAgIDEwXG4gICk7XG5cbiAgaWYgKCFtYXhsZW5ndGgpIHJldHVybjtcblxuICBsZXQgbmV3TWVzc2FnZSA9IFwiXCI7XG4gIGNvbnN0IGN1cnJlbnRMZW5ndGggPSBpbnB1dEVsLnZhbHVlLmxlbmd0aDtcbiAgY29uc3QgaXNPdmVyTGltaXQgPSBjdXJyZW50TGVuZ3RoICYmIGN1cnJlbnRMZW5ndGggPiBtYXhsZW5ndGg7XG5cbiAgaWYgKGN1cnJlbnRMZW5ndGggPT09IDApIHtcbiAgICBuZXdNZXNzYWdlID0gYCR7bWF4bGVuZ3RofSBjaGFyYWN0ZXJzIGFsbG93ZWRgO1xuICB9IGVsc2Uge1xuICAgIGNvbnN0IGRpZmZlcmVuY2UgPSBNYXRoLmFicyhtYXhsZW5ndGggLSBjdXJyZW50TGVuZ3RoKTtcbiAgICBjb25zdCBjaGFyYWN0ZXJzID0gYGNoYXJhY3RlciR7ZGlmZmVyZW5jZSA9PT0gMSA/IFwiXCIgOiBcInNcIn1gO1xuICAgIGNvbnN0IGd1aWRhbmNlID0gaXNPdmVyTGltaXQgPyBcIm92ZXIgbGltaXRcIiA6IFwibGVmdFwiO1xuXG4gICAgbmV3TWVzc2FnZSA9IGAke2RpZmZlcmVuY2V9ICR7Y2hhcmFjdGVyc30gJHtndWlkYW5jZX1gO1xuICB9XG5cbiAgbWVzc2FnZUVsLmNsYXNzTGlzdC50b2dnbGUoTUVTU0FHRV9JTlZBTElEX0NMQVNTLCBpc092ZXJMaW1pdCk7XG4gIG1lc3NhZ2VFbC50ZXh0Q29udGVudCA9IG5ld01lc3NhZ2U7XG5cbiAgaWYgKGlzT3ZlckxpbWl0ICYmICFpbnB1dEVsLnZhbGlkYXRpb25NZXNzYWdlKSB7XG4gICAgaW5wdXRFbC5zZXRDdXN0b21WYWxpZGl0eShWQUxJREFUSU9OX01FU1NBR0UpO1xuICB9XG5cbiAgaWYgKCFpc092ZXJMaW1pdCAmJiBpbnB1dEVsLnZhbGlkYXRpb25NZXNzYWdlID09PSBWQUxJREFUSU9OX01FU1NBR0UpIHtcbiAgICBpbnB1dEVsLnNldEN1c3RvbVZhbGlkaXR5KFwiXCIpO1xuICB9XG59O1xuXG4vKipcbiAqIFNldHVwIHRoZSBjaGFyYWN0ZXIgY291bnQgY29tcG9uZW50XG4gKlxuICogQHBhcmFtIHtIVE1MSW5wdXRFbGVtZW50fEhUTUxUZXh0QXJlYUVsZW1lbnR9IGlucHV0RWwgVGhlIGNoYXJhY3RlciBjb3VudCBpbnB1dCBlbGVtZW50XG4gKi9cbmNvbnN0IHNldHVwQXR0cmlidXRlcyA9IChpbnB1dEVsKSA9PiB7XG4gIGNvbnN0IHsgY2hhcmFjdGVyQ291bnRFbCB9ID0gZ2V0Q2hhcmFjdGVyQ291bnRFbGVtZW50cyhpbnB1dEVsKTtcblxuICBjb25zdCBtYXhsZW5ndGggPSBpbnB1dEVsLmdldEF0dHJpYnV0ZShcIm1heGxlbmd0aFwiKTtcblxuICBpZiAoIW1heGxlbmd0aCkgcmV0dXJuO1xuXG4gIGlucHV0RWwucmVtb3ZlQXR0cmlidXRlKFwibWF4bGVuZ3RoXCIpO1xuICBjaGFyYWN0ZXJDb3VudEVsLnNldEF0dHJpYnV0ZShcImRhdGEtbWF4bGVuZ3RoXCIsIG1heGxlbmd0aCk7XG59O1xuXG5jb25zdCBjaGFyYWN0ZXJDb3VudCA9IGJlaGF2aW9yKFxuICB7XG4gICAgaW5wdXQ6IHtcbiAgICAgIFtJTlBVVF0oKSB7XG4gICAgICAgIHVwZGF0ZUNvdW50TWVzc2FnZSh0aGlzKTtcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbiAge1xuICAgIGluaXQocm9vdCkge1xuICAgICAgc2VsZWN0KElOUFVULCByb290KS5mb3JFYWNoKChpbnB1dCkgPT4ge1xuICAgICAgICBzZXR1cEF0dHJpYnV0ZXMoaW5wdXQpO1xuICAgICAgICB1cGRhdGVDb3VudE1lc3NhZ2UoaW5wdXQpO1xuICAgICAgfSk7XG4gICAgfSxcbiAgICBNRVNTQUdFX0lOVkFMSURfQ0xBU1MsXG4gICAgVkFMSURBVElPTl9NRVNTQUdFLFxuICB9XG4pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNoYXJhY3RlckNvdW50O1xuIiwiY29uc3Qga2V5bWFwID0gcmVxdWlyZShcInJlY2VwdG9yL2tleW1hcFwiKTtcbmNvbnN0IHNlbGVjdE9yTWF0Y2hlcyA9IHJlcXVpcmUoXCIuLi8uLi91c3dkcy1jb3JlL3NyYy9qcy91dGlscy9zZWxlY3Qtb3ItbWF0Y2hlc1wiKTtcbmNvbnN0IGJlaGF2aW9yID0gcmVxdWlyZShcIi4uLy4uL3Vzd2RzLWNvcmUvc3JjL2pzL3V0aWxzL2JlaGF2aW9yXCIpO1xuY29uc3QgU2FuaXRpemVyID0gcmVxdWlyZShcIi4uLy4uL3Vzd2RzLWNvcmUvc3JjL2pzL3V0aWxzL3Nhbml0aXplclwiKTtcbmNvbnN0IHsgcHJlZml4OiBQUkVGSVggfSA9IHJlcXVpcmUoXCIuLi8uLi91c3dkcy1jb3JlL3NyYy9qcy9jb25maWdcIik7XG5jb25zdCB7IENMSUNLIH0gPSByZXF1aXJlKFwiLi4vLi4vdXN3ZHMtY29yZS9zcmMvanMvZXZlbnRzXCIpO1xuXG5jb25zdCBDT01CT19CT1hfQ0xBU1MgPSBgJHtQUkVGSVh9LWNvbWJvLWJveGA7XG5jb25zdCBDT01CT19CT1hfUFJJU1RJTkVfQ0xBU1MgPSBgJHtDT01CT19CT1hfQ0xBU1N9LS1wcmlzdGluZWA7XG5jb25zdCBTRUxFQ1RfQ0xBU1MgPSBgJHtDT01CT19CT1hfQ0xBU1N9X19zZWxlY3RgO1xuY29uc3QgSU5QVVRfQ0xBU1MgPSBgJHtDT01CT19CT1hfQ0xBU1N9X19pbnB1dGA7XG5jb25zdCBDTEVBUl9JTlBVVF9CVVRUT05fQ0xBU1MgPSBgJHtDT01CT19CT1hfQ0xBU1N9X19jbGVhci1pbnB1dGA7XG5jb25zdCBDTEVBUl9JTlBVVF9CVVRUT05fV1JBUFBFUl9DTEFTUyA9IGAke0NMRUFSX0lOUFVUX0JVVFRPTl9DTEFTU31fX3dyYXBwZXJgO1xuY29uc3QgSU5QVVRfQlVUVE9OX1NFUEFSQVRPUl9DTEFTUyA9IGAke0NPTUJPX0JPWF9DTEFTU31fX2lucHV0LWJ1dHRvbi1zZXBhcmF0b3JgO1xuY29uc3QgVE9HR0xFX0xJU1RfQlVUVE9OX0NMQVNTID0gYCR7Q09NQk9fQk9YX0NMQVNTfV9fdG9nZ2xlLWxpc3RgO1xuY29uc3QgVE9HR0xFX0xJU1RfQlVUVE9OX1dSQVBQRVJfQ0xBU1MgPSBgJHtUT0dHTEVfTElTVF9CVVRUT05fQ0xBU1N9X193cmFwcGVyYDtcbmNvbnN0IExJU1RfQ0xBU1MgPSBgJHtDT01CT19CT1hfQ0xBU1N9X19saXN0YDtcbmNvbnN0IExJU1RfT1BUSU9OX0NMQVNTID0gYCR7Q09NQk9fQk9YX0NMQVNTfV9fbGlzdC1vcHRpb25gO1xuY29uc3QgTElTVF9PUFRJT05fRk9DVVNFRF9DTEFTUyA9IGAke0xJU1RfT1BUSU9OX0NMQVNTfS0tZm9jdXNlZGA7XG5jb25zdCBMSVNUX09QVElPTl9TRUxFQ1RFRF9DTEFTUyA9IGAke0xJU1RfT1BUSU9OX0NMQVNTfS0tc2VsZWN0ZWRgO1xuY29uc3QgU1RBVFVTX0NMQVNTID0gYCR7Q09NQk9fQk9YX0NMQVNTfV9fc3RhdHVzYDtcblxuY29uc3QgQ09NQk9fQk9YID0gYC4ke0NPTUJPX0JPWF9DTEFTU31gO1xuY29uc3QgU0VMRUNUID0gYC4ke1NFTEVDVF9DTEFTU31gO1xuY29uc3QgSU5QVVQgPSBgLiR7SU5QVVRfQ0xBU1N9YDtcbmNvbnN0IENMRUFSX0lOUFVUX0JVVFRPTiA9IGAuJHtDTEVBUl9JTlBVVF9CVVRUT05fQ0xBU1N9YDtcbmNvbnN0IFRPR0dMRV9MSVNUX0JVVFRPTiA9IGAuJHtUT0dHTEVfTElTVF9CVVRUT05fQ0xBU1N9YDtcbmNvbnN0IExJU1QgPSBgLiR7TElTVF9DTEFTU31gO1xuY29uc3QgTElTVF9PUFRJT04gPSBgLiR7TElTVF9PUFRJT05fQ0xBU1N9YDtcbmNvbnN0IExJU1RfT1BUSU9OX0ZPQ1VTRUQgPSBgLiR7TElTVF9PUFRJT05fRk9DVVNFRF9DTEFTU31gO1xuY29uc3QgTElTVF9PUFRJT05fU0VMRUNURUQgPSBgLiR7TElTVF9PUFRJT05fU0VMRUNURURfQ0xBU1N9YDtcbmNvbnN0IFNUQVRVUyA9IGAuJHtTVEFUVVNfQ0xBU1N9YDtcblxuY29uc3QgREVGQVVMVF9GSUxURVIgPSBcIi4qe3txdWVyeX19LipcIjtcblxuY29uc3Qgbm9vcCA9ICgpID0+IHt9O1xuXG4vKipcbiAqIHNldCB0aGUgdmFsdWUgb2YgdGhlIGVsZW1lbnQgYW5kIGRpc3BhdGNoIGEgY2hhbmdlIGV2ZW50XG4gKlxuICogQHBhcmFtIHtIVE1MSW5wdXRFbGVtZW50fEhUTUxTZWxlY3RFbGVtZW50fSBlbCBUaGUgZWxlbWVudCB0byB1cGRhdGVcbiAqIEBwYXJhbSB7c3RyaW5nfSB2YWx1ZSBUaGUgbmV3IHZhbHVlIG9mIHRoZSBlbGVtZW50XG4gKi9cbmNvbnN0IGNoYW5nZUVsZW1lbnRWYWx1ZSA9IChlbCwgdmFsdWUgPSBcIlwiKSA9PiB7XG4gIGNvbnN0IGVsZW1lbnRUb0NoYW5nZSA9IGVsO1xuICBlbGVtZW50VG9DaGFuZ2UudmFsdWUgPSB2YWx1ZTtcblxuICBjb25zdCBldmVudCA9IG5ldyBDdXN0b21FdmVudChcImNoYW5nZVwiLCB7XG4gICAgYnViYmxlczogdHJ1ZSxcbiAgICBjYW5jZWxhYmxlOiB0cnVlLFxuICAgIGRldGFpbDogeyB2YWx1ZSB9LFxuICB9KTtcbiAgZWxlbWVudFRvQ2hhbmdlLmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xufTtcblxuLyoqXG4gKiBUaGUgZWxlbWVudHMgd2l0aGluIHRoZSBjb21ibyBib3guXG4gKiBAdHlwZWRlZiB7T2JqZWN0fSBDb21ib0JveENvbnRleHRcbiAqIEBwcm9wZXJ0eSB7SFRNTEVsZW1lbnR9IGNvbWJvQm94RWxcbiAqIEBwcm9wZXJ0eSB7SFRNTFNlbGVjdEVsZW1lbnR9IHNlbGVjdEVsXG4gKiBAcHJvcGVydHkge0hUTUxJbnB1dEVsZW1lbnR9IGlucHV0RWxcbiAqIEBwcm9wZXJ0eSB7SFRNTFVMaXN0RWxlbWVudH0gbGlzdEVsXG4gKiBAcHJvcGVydHkge0hUTUxEaXZFbGVtZW50fSBzdGF0dXNFbFxuICogQHByb3BlcnR5IHtIVE1MTElFbGVtZW50fSBmb2N1c2VkT3B0aW9uRWxcbiAqIEBwcm9wZXJ0eSB7SFRNTExJRWxlbWVudH0gc2VsZWN0ZWRPcHRpb25FbFxuICogQHByb3BlcnR5IHtIVE1MQnV0dG9uRWxlbWVudH0gdG9nZ2xlTGlzdEJ0bkVsXG4gKiBAcHJvcGVydHkge0hUTUxCdXR0b25FbGVtZW50fSBjbGVhcklucHV0QnRuRWxcbiAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gaXNQcmlzdGluZVxuICogQHByb3BlcnR5IHtib29sZWFufSBkaXNhYmxlRmlsdGVyaW5nXG4gKi9cblxuLyoqXG4gKiBHZXQgYW4gb2JqZWN0IG9mIGVsZW1lbnRzIGJlbG9uZ2luZyBkaXJlY3RseSB0byB0aGUgZ2l2ZW5cbiAqIGNvbWJvIGJveCBjb21wb25lbnQuXG4gKlxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWwgdGhlIGVsZW1lbnQgd2l0aGluIHRoZSBjb21ibyBib3hcbiAqIEByZXR1cm5zIHtDb21ib0JveENvbnRleHR9IGVsZW1lbnRzXG4gKi9cbmNvbnN0IGdldENvbWJvQm94Q29udGV4dCA9IChlbCkgPT4ge1xuICBjb25zdCBjb21ib0JveEVsID0gZWwuY2xvc2VzdChDT01CT19CT1gpO1xuXG4gIGlmICghY29tYm9Cb3hFbCkge1xuICAgIHRocm93IG5ldyBFcnJvcihgRWxlbWVudCBpcyBtaXNzaW5nIG91dGVyICR7Q09NQk9fQk9YfWApO1xuICB9XG5cbiAgY29uc3Qgc2VsZWN0RWwgPSBjb21ib0JveEVsLnF1ZXJ5U2VsZWN0b3IoU0VMRUNUKTtcbiAgY29uc3QgaW5wdXRFbCA9IGNvbWJvQm94RWwucXVlcnlTZWxlY3RvcihJTlBVVCk7XG4gIGNvbnN0IGxpc3RFbCA9IGNvbWJvQm94RWwucXVlcnlTZWxlY3RvcihMSVNUKTtcbiAgY29uc3Qgc3RhdHVzRWwgPSBjb21ib0JveEVsLnF1ZXJ5U2VsZWN0b3IoU1RBVFVTKTtcbiAgY29uc3QgZm9jdXNlZE9wdGlvbkVsID0gY29tYm9Cb3hFbC5xdWVyeVNlbGVjdG9yKExJU1RfT1BUSU9OX0ZPQ1VTRUQpO1xuICBjb25zdCBzZWxlY3RlZE9wdGlvbkVsID0gY29tYm9Cb3hFbC5xdWVyeVNlbGVjdG9yKExJU1RfT1BUSU9OX1NFTEVDVEVEKTtcbiAgY29uc3QgdG9nZ2xlTGlzdEJ0bkVsID0gY29tYm9Cb3hFbC5xdWVyeVNlbGVjdG9yKFRPR0dMRV9MSVNUX0JVVFRPTik7XG4gIGNvbnN0IGNsZWFySW5wdXRCdG5FbCA9IGNvbWJvQm94RWwucXVlcnlTZWxlY3RvcihDTEVBUl9JTlBVVF9CVVRUT04pO1xuXG4gIGNvbnN0IGlzUHJpc3RpbmUgPSBjb21ib0JveEVsLmNsYXNzTGlzdC5jb250YWlucyhDT01CT19CT1hfUFJJU1RJTkVfQ0xBU1MpO1xuICBjb25zdCBkaXNhYmxlRmlsdGVyaW5nID0gY29tYm9Cb3hFbC5kYXRhc2V0LmRpc2FibGVGaWx0ZXJpbmcgPT09IFwidHJ1ZVwiO1xuXG4gIHJldHVybiB7XG4gICAgY29tYm9Cb3hFbCxcbiAgICBzZWxlY3RFbCxcbiAgICBpbnB1dEVsLFxuICAgIGxpc3RFbCxcbiAgICBzdGF0dXNFbCxcbiAgICBmb2N1c2VkT3B0aW9uRWwsXG4gICAgc2VsZWN0ZWRPcHRpb25FbCxcbiAgICB0b2dnbGVMaXN0QnRuRWwsXG4gICAgY2xlYXJJbnB1dEJ0bkVsLFxuICAgIGlzUHJpc3RpbmUsXG4gICAgZGlzYWJsZUZpbHRlcmluZyxcbiAgfTtcbn07XG5cbi8qKlxuICogRGlzYWJsZSB0aGUgY29tYm8tYm94IGNvbXBvbmVudFxuICpcbiAqIEBwYXJhbSB7SFRNTElucHV0RWxlbWVudH0gZWwgQW4gZWxlbWVudCB3aXRoaW4gdGhlIGNvbWJvIGJveCBjb21wb25lbnRcbiAqL1xuY29uc3QgZGlzYWJsZSA9IChlbCkgPT4ge1xuICBjb25zdCB7IGlucHV0RWwsIHRvZ2dsZUxpc3RCdG5FbCwgY2xlYXJJbnB1dEJ0bkVsIH0gPSBnZXRDb21ib0JveENvbnRleHQoZWwpO1xuXG4gIGNsZWFySW5wdXRCdG5FbC5oaWRkZW4gPSB0cnVlO1xuICBjbGVhcklucHV0QnRuRWwuZGlzYWJsZWQgPSB0cnVlO1xuICB0b2dnbGVMaXN0QnRuRWwuZGlzYWJsZWQgPSB0cnVlO1xuICBpbnB1dEVsLmRpc2FibGVkID0gdHJ1ZTtcbn07XG5cbi8qKlxuICogRW5hYmxlIHRoZSBjb21iby1ib3ggY29tcG9uZW50XG4gKlxuICogQHBhcmFtIHtIVE1MSW5wdXRFbGVtZW50fSBlbCBBbiBlbGVtZW50IHdpdGhpbiB0aGUgY29tYm8gYm94IGNvbXBvbmVudFxuICovXG5jb25zdCBlbmFibGUgPSAoZWwpID0+IHtcbiAgY29uc3QgeyBpbnB1dEVsLCB0b2dnbGVMaXN0QnRuRWwsIGNsZWFySW5wdXRCdG5FbCB9ID0gZ2V0Q29tYm9Cb3hDb250ZXh0KGVsKTtcblxuICBjbGVhcklucHV0QnRuRWwuaGlkZGVuID0gZmFsc2U7XG4gIGNsZWFySW5wdXRCdG5FbC5kaXNhYmxlZCA9IGZhbHNlO1xuICB0b2dnbGVMaXN0QnRuRWwuZGlzYWJsZWQgPSBmYWxzZTtcbiAgaW5wdXRFbC5kaXNhYmxlZCA9IGZhbHNlO1xufTtcblxuLyoqXG4gKiBFbmhhbmNlIGEgc2VsZWN0IGVsZW1lbnQgaW50byBhIGNvbWJvIGJveCBjb21wb25lbnQuXG4gKlxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gX2NvbWJvQm94RWwgVGhlIGluaXRpYWwgZWxlbWVudCBvZiB0aGUgY29tYm8gYm94IGNvbXBvbmVudFxuICovXG5jb25zdCBlbmhhbmNlQ29tYm9Cb3ggPSAoX2NvbWJvQm94RWwpID0+IHtcbiAgY29uc3QgY29tYm9Cb3hFbCA9IF9jb21ib0JveEVsLmNsb3Nlc3QoQ09NQk9fQk9YKTtcblxuICBpZiAoY29tYm9Cb3hFbC5kYXRhc2V0LmVuaGFuY2VkKSByZXR1cm47XG5cbiAgY29uc3Qgc2VsZWN0RWwgPSBjb21ib0JveEVsLnF1ZXJ5U2VsZWN0b3IoXCJzZWxlY3RcIik7XG5cbiAgaWYgKCFzZWxlY3RFbCkge1xuICAgIHRocm93IG5ldyBFcnJvcihgJHtDT01CT19CT1h9IGlzIG1pc3NpbmcgaW5uZXIgc2VsZWN0YCk7XG4gIH1cblxuICBjb25zdCBzZWxlY3RJZCA9IHNlbGVjdEVsLmlkO1xuICBjb25zdCBzZWxlY3RMYWJlbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYGxhYmVsW2Zvcj1cIiR7c2VsZWN0SWR9XCJdYCk7XG4gIGNvbnN0IGxpc3RJZCA9IGAke3NlbGVjdElkfS0tbGlzdGA7XG4gIGNvbnN0IGxpc3RJZExhYmVsID0gYCR7c2VsZWN0SWR9LWxhYmVsYDtcbiAgY29uc3QgYXNzaXN0aXZlSGludElEID0gYCR7c2VsZWN0SWR9LS1hc3Npc3RpdmVIaW50YDtcbiAgY29uc3QgYWRkaXRpb25hbEF0dHJpYnV0ZXMgPSBbXTtcbiAgY29uc3QgeyBkZWZhdWx0VmFsdWUgfSA9IGNvbWJvQm94RWwuZGF0YXNldDtcbiAgY29uc3QgeyBwbGFjZWhvbGRlciB9ID0gY29tYm9Cb3hFbC5kYXRhc2V0O1xuICBsZXQgc2VsZWN0ZWRPcHRpb247XG5cbiAgaWYgKHBsYWNlaG9sZGVyKSB7XG4gICAgYWRkaXRpb25hbEF0dHJpYnV0ZXMucHVzaCh7IHBsYWNlaG9sZGVyIH0pO1xuICB9XG5cbiAgaWYgKGRlZmF1bHRWYWx1ZSkge1xuICAgIGZvciAobGV0IGkgPSAwLCBsZW4gPSBzZWxlY3RFbC5vcHRpb25zLmxlbmd0aDsgaSA8IGxlbjsgaSArPSAxKSB7XG4gICAgICBjb25zdCBvcHRpb25FbCA9IHNlbGVjdEVsLm9wdGlvbnNbaV07XG5cbiAgICAgIGlmIChvcHRpb25FbC52YWx1ZSA9PT0gZGVmYXVsdFZhbHVlKSB7XG4gICAgICAgIHNlbGVjdGVkT3B0aW9uID0gb3B0aW9uRWw7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUaHJvdyBlcnJvciBpZiBjb21ib2JveCBpcyBtaXNzaW5nIGEgbGFiZWwgb3IgbGFiZWwgaXMgbWlzc2luZ1xuICAgKiBgZm9yYCBhdHRyaWJ1dGUuIE90aGVyd2lzZSwgc2V0IHRoZSBJRCB0byBtYXRjaCB0aGUgPHVsPiBhcmlhLWxhYmVsbGVkYnlcbiAgICovXG4gIGlmICghc2VsZWN0TGFiZWwgfHwgIXNlbGVjdExhYmVsLm1hdGNoZXMoYGxhYmVsW2Zvcj1cIiR7c2VsZWN0SWR9XCJdYCkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICBgJHtDT01CT19CT1h9IGZvciAke3NlbGVjdElkfSBpcyBlaXRoZXIgbWlzc2luZyBhIGxhYmVsIG9yIGEgXCJmb3JcIiBhdHRyaWJ1dGVgXG4gICAgKTtcbiAgfSBlbHNlIHtcbiAgICBzZWxlY3RMYWJlbC5zZXRBdHRyaWJ1dGUoXCJpZFwiLCBsaXN0SWRMYWJlbCk7XG4gIH1cblxuICBzZWxlY3RMYWJlbC5zZXRBdHRyaWJ1dGUoXCJpZFwiLCBsaXN0SWRMYWJlbCk7XG4gIHNlbGVjdEVsLnNldEF0dHJpYnV0ZShcImFyaWEtaGlkZGVuXCIsIFwidHJ1ZVwiKTtcbiAgc2VsZWN0RWwuc2V0QXR0cmlidXRlKFwidGFiaW5kZXhcIiwgXCItMVwiKTtcbiAgc2VsZWN0RWwuY2xhc3NMaXN0LmFkZChcInVzYS1zci1vbmx5XCIsIFNFTEVDVF9DTEFTUyk7XG4gIHNlbGVjdEVsLmlkID0gXCJcIjtcbiAgc2VsZWN0RWwudmFsdWUgPSBcIlwiO1xuXG4gIFtcInJlcXVpcmVkXCIsIFwiYXJpYS1sYWJlbFwiLCBcImFyaWEtbGFiZWxsZWRieVwiXS5mb3JFYWNoKChuYW1lKSA9PiB7XG4gICAgaWYgKHNlbGVjdEVsLmhhc0F0dHJpYnV0ZShuYW1lKSkge1xuICAgICAgY29uc3QgdmFsdWUgPSBzZWxlY3RFbC5nZXRBdHRyaWJ1dGUobmFtZSk7XG4gICAgICBhZGRpdGlvbmFsQXR0cmlidXRlcy5wdXNoKHsgW25hbWVdOiB2YWx1ZSB9KTtcbiAgICAgIHNlbGVjdEVsLnJlbW92ZUF0dHJpYnV0ZShuYW1lKTtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIHNhbml0aXplIGRvZXNuJ3QgbGlrZSBmdW5jdGlvbnMgaW4gdGVtcGxhdGUgbGl0ZXJhbHNcbiAgY29uc3QgaW5wdXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIik7XG4gIGlucHV0LnNldEF0dHJpYnV0ZShcImlkXCIsIHNlbGVjdElkKTtcbiAgaW5wdXQuc2V0QXR0cmlidXRlKFwiYXJpYS1vd25zXCIsIGxpc3RJZCk7XG4gIGlucHV0LnNldEF0dHJpYnV0ZShcImFyaWEtY29udHJvbHNcIiwgbGlzdElkKTtcbiAgaW5wdXQuc2V0QXR0cmlidXRlKFwiYXJpYS1hdXRvY29tcGxldGVcIiwgXCJsaXN0XCIpO1xuICBpbnB1dC5zZXRBdHRyaWJ1dGUoXCJhcmlhLWRlc2NyaWJlZGJ5XCIsIGFzc2lzdGl2ZUhpbnRJRCk7XG4gIGlucHV0LnNldEF0dHJpYnV0ZShcImFyaWEtZXhwYW5kZWRcIiwgXCJmYWxzZVwiKTtcbiAgaW5wdXQuc2V0QXR0cmlidXRlKFwiYXV0b2NhcGl0YWxpemVcIiwgXCJvZmZcIik7XG4gIGlucHV0LnNldEF0dHJpYnV0ZShcImF1dG9jb21wbGV0ZVwiLCBcIm9mZlwiKTtcbiAgaW5wdXQuc2V0QXR0cmlidXRlKFwiY2xhc3NcIiwgSU5QVVRfQ0xBU1MpO1xuICBpbnB1dC5zZXRBdHRyaWJ1dGUoXCJ0eXBlXCIsIFwidGV4dFwiKTtcbiAgaW5wdXQuc2V0QXR0cmlidXRlKFwicm9sZVwiLCBcImNvbWJvYm94XCIpO1xuICBhZGRpdGlvbmFsQXR0cmlidXRlcy5mb3JFYWNoKChhdHRyKSA9PlxuICAgIE9iamVjdC5rZXlzKGF0dHIpLmZvckVhY2goKGtleSkgPT4ge1xuICAgICAgY29uc3QgdmFsdWUgPSBTYW5pdGl6ZXIuZXNjYXBlSFRNTGAke2F0dHJba2V5XX1gO1xuICAgICAgaW5wdXQuc2V0QXR0cmlidXRlKGtleSwgdmFsdWUpO1xuICAgIH0pXG4gICk7XG5cbiAgY29tYm9Cb3hFbC5pbnNlcnRBZGphY2VudEVsZW1lbnQoXCJiZWZvcmVlbmRcIiwgaW5wdXQpO1xuXG4gIGNvbWJvQm94RWwuaW5zZXJ0QWRqYWNlbnRIVE1MKFxuICAgIFwiYmVmb3JlZW5kXCIsXG4gICAgU2FuaXRpemVyLmVzY2FwZUhUTUxgXG4gICAgPHNwYW4gY2xhc3M9XCIke0NMRUFSX0lOUFVUX0JVVFRPTl9XUkFQUEVSX0NMQVNTfVwiIHRhYmluZGV4PVwiLTFcIj5cbiAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCIke0NMRUFSX0lOUFVUX0JVVFRPTl9DTEFTU31cIiBhcmlhLWxhYmVsPVwiQ2xlYXIgdGhlIHNlbGVjdCBjb250ZW50c1wiPiZuYnNwOzwvYnV0dG9uPlxuICAgICAgPC9zcGFuPlxuICAgICAgPHNwYW4gY2xhc3M9XCIke0lOUFVUX0JVVFRPTl9TRVBBUkFUT1JfQ0xBU1N9XCI+Jm5ic3A7PC9zcGFuPlxuICAgICAgPHNwYW4gY2xhc3M9XCIke1RPR0dMRV9MSVNUX0JVVFRPTl9XUkFQUEVSX0NMQVNTfVwiIHRhYmluZGV4PVwiLTFcIj5cbiAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgdGFiaW5kZXg9XCItMVwiIGNsYXNzPVwiJHtUT0dHTEVfTElTVF9CVVRUT05fQ0xBU1N9XCIgYXJpYS1sYWJlbD1cIlRvZ2dsZSB0aGUgZHJvcGRvd24gbGlzdFwiPiZuYnNwOzwvYnV0dG9uPlxuICAgICAgPC9zcGFuPlxuICAgICAgPHVsXG4gICAgICAgIHRhYmluZGV4PVwiLTFcIlxuICAgICAgICBpZD1cIiR7bGlzdElkfVwiXG4gICAgICAgIGNsYXNzPVwiJHtMSVNUX0NMQVNTfVwiXG4gICAgICAgIHJvbGU9XCJsaXN0Ym94XCJcbiAgICAgICAgYXJpYS1sYWJlbGxlZGJ5PVwiJHtsaXN0SWRMYWJlbH1cIlxuICAgICAgICBoaWRkZW4+XG4gICAgICA8L3VsPlxuICAgICAgPGRpdiBjbGFzcz1cIiR7U1RBVFVTX0NMQVNTfSB1c2Etc3Itb25seVwiIHJvbGU9XCJzdGF0dXNcIj48L2Rpdj5cbiAgICAgIDxzcGFuIGlkPVwiJHthc3Npc3RpdmVIaW50SUR9XCIgY2xhc3M9XCJ1c2Etc3Itb25seVwiPlxuICAgICAgICBXaGVuIGF1dG9jb21wbGV0ZSByZXN1bHRzIGFyZSBhdmFpbGFibGUgdXNlIHVwIGFuZCBkb3duIGFycm93cyB0byByZXZpZXcgYW5kIGVudGVyIHRvIHNlbGVjdC5cbiAgICAgICAgVG91Y2ggZGV2aWNlIHVzZXJzLCBleHBsb3JlIGJ5IHRvdWNoIG9yIHdpdGggc3dpcGUgZ2VzdHVyZXMuXG4gICAgICA8L3NwYW4+YFxuICApO1xuXG4gIGlmIChzZWxlY3RlZE9wdGlvbikge1xuICAgIGNvbnN0IHsgaW5wdXRFbCB9ID0gZ2V0Q29tYm9Cb3hDb250ZXh0KGNvbWJvQm94RWwpO1xuICAgIGNoYW5nZUVsZW1lbnRWYWx1ZShzZWxlY3RFbCwgc2VsZWN0ZWRPcHRpb24udmFsdWUpO1xuICAgIGNoYW5nZUVsZW1lbnRWYWx1ZShpbnB1dEVsLCBzZWxlY3RlZE9wdGlvbi50ZXh0KTtcbiAgICBjb21ib0JveEVsLmNsYXNzTGlzdC5hZGQoQ09NQk9fQk9YX1BSSVNUSU5FX0NMQVNTKTtcbiAgfVxuXG4gIGlmIChzZWxlY3RFbC5kaXNhYmxlZCkge1xuICAgIGRpc2FibGUoY29tYm9Cb3hFbCk7XG4gICAgc2VsZWN0RWwuZGlzYWJsZWQgPSBmYWxzZTtcbiAgfVxuXG4gIGNvbWJvQm94RWwuZGF0YXNldC5lbmhhbmNlZCA9IFwidHJ1ZVwiO1xufTtcblxuLyoqXG4gKiBNYW5hZ2UgdGhlIGZvY3VzZWQgZWxlbWVudCB3aXRoaW4gdGhlIGxpc3Qgb3B0aW9ucyB3aGVuXG4gKiBuYXZpZ2F0aW5nIHZpYSBrZXlib2FyZC5cbiAqXG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbCBBbiBhbmNob3IgZWxlbWVudCB3aXRoaW4gdGhlIGNvbWJvIGJveCBjb21wb25lbnRcbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IG5leHRFbCBBbiBlbGVtZW50IHdpdGhpbiB0aGUgY29tYm8gYm94IGNvbXBvbmVudFxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgb3B0aW9uc1xuICogQHBhcmFtIHtib29sZWFufSBvcHRpb25zLnNraXBGb2N1cyBza2lwIGZvY3VzIG9mIGhpZ2hsaWdodGVkIGl0ZW1cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gb3B0aW9ucy5wcmV2ZW50U2Nyb2xsIHNob3VsZCBza2lwIHByb2NlZHVyZSB0byBzY3JvbGwgdG8gZWxlbWVudFxuICovXG5jb25zdCBoaWdobGlnaHRPcHRpb24gPSAoZWwsIG5leHRFbCwgeyBza2lwRm9jdXMsIHByZXZlbnRTY3JvbGwgfSA9IHt9KSA9PiB7XG4gIGNvbnN0IHsgaW5wdXRFbCwgbGlzdEVsLCBmb2N1c2VkT3B0aW9uRWwgfSA9IGdldENvbWJvQm94Q29udGV4dChlbCk7XG5cbiAgaWYgKGZvY3VzZWRPcHRpb25FbCkge1xuICAgIGZvY3VzZWRPcHRpb25FbC5jbGFzc0xpc3QucmVtb3ZlKExJU1RfT1BUSU9OX0ZPQ1VTRURfQ0xBU1MpO1xuICAgIGZvY3VzZWRPcHRpb25FbC5zZXRBdHRyaWJ1dGUoXCJ0YWJJbmRleFwiLCBcIi0xXCIpO1xuICB9XG5cbiAgaWYgKG5leHRFbCkge1xuICAgIGlucHV0RWwuc2V0QXR0cmlidXRlKFwiYXJpYS1hY3RpdmVkZXNjZW5kYW50XCIsIG5leHRFbC5pZCk7XG4gICAgbmV4dEVsLnNldEF0dHJpYnV0ZShcInRhYkluZGV4XCIsIFwiMFwiKTtcbiAgICBuZXh0RWwuY2xhc3NMaXN0LmFkZChMSVNUX09QVElPTl9GT0NVU0VEX0NMQVNTKTtcblxuICAgIGlmICghcHJldmVudFNjcm9sbCkge1xuICAgICAgY29uc3Qgb3B0aW9uQm90dG9tID0gbmV4dEVsLm9mZnNldFRvcCArIG5leHRFbC5vZmZzZXRIZWlnaHQ7XG4gICAgICBjb25zdCBjdXJyZW50Qm90dG9tID0gbGlzdEVsLnNjcm9sbFRvcCArIGxpc3RFbC5vZmZzZXRIZWlnaHQ7XG5cbiAgICAgIGlmIChvcHRpb25Cb3R0b20gPiBjdXJyZW50Qm90dG9tKSB7XG4gICAgICAgIGxpc3RFbC5zY3JvbGxUb3AgPSBvcHRpb25Cb3R0b20gLSBsaXN0RWwub2Zmc2V0SGVpZ2h0O1xuICAgICAgfVxuXG4gICAgICBpZiAobmV4dEVsLm9mZnNldFRvcCA8IGxpc3RFbC5zY3JvbGxUb3ApIHtcbiAgICAgICAgbGlzdEVsLnNjcm9sbFRvcCA9IG5leHRFbC5vZmZzZXRUb3A7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCFza2lwRm9jdXMpIHtcbiAgICAgIG5leHRFbC5mb2N1cyh7IHByZXZlbnRTY3JvbGwgfSk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGlucHV0RWwuc2V0QXR0cmlidXRlKFwiYXJpYS1hY3RpdmVkZXNjZW5kYW50XCIsIFwiXCIpO1xuICAgIGlucHV0RWwuZm9jdXMoKTtcbiAgfVxufTtcblxuLyoqXG4gKiBHZW5lcmF0ZSBhIGR5bmFtaWMgcmVndWxhciBleHByZXNzaW9uIGJhc2VkIG9mZiBvZiBhIHJlcGxhY2VhYmxlIGFuZCBwb3NzaWJseSBmaWx0ZXJlZCB2YWx1ZS5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gZWwgQW4gZWxlbWVudCB3aXRoaW4gdGhlIGNvbWJvIGJveCBjb21wb25lbnRcbiAqIEBwYXJhbSB7c3RyaW5nfSBxdWVyeSBUaGUgdmFsdWUgdG8gdXNlIGluIHRoZSByZWd1bGFyIGV4cHJlc3Npb25cbiAqIEBwYXJhbSB7b2JqZWN0fSBleHRyYXMgQW4gb2JqZWN0IG9mIHJlZ3VsYXIgZXhwcmVzc2lvbnMgdG8gcmVwbGFjZSBhbmQgZmlsdGVyIHRoZSBxdWVyeVxuICovXG5jb25zdCBnZW5lcmF0ZUR5bmFtaWNSZWdFeHAgPSAoZmlsdGVyLCBxdWVyeSA9IFwiXCIsIGV4dHJhcyA9IHt9KSA9PiB7XG4gIGNvbnN0IGVzY2FwZVJlZ0V4cCA9ICh0ZXh0KSA9PlxuICAgIHRleHQucmVwbGFjZSgvWy1bXFxde30oKSorPy4sXFxcXF4kfCNcXHNdL2csIFwiXFxcXCQmXCIpO1xuXG4gIGxldCBmaW5kID0gZmlsdGVyLnJlcGxhY2UoL3t7KC4qPyl9fS9nLCAobSwgJDEpID0+IHtcbiAgICBjb25zdCBrZXkgPSAkMS50cmltKCk7XG4gICAgY29uc3QgcXVlcnlGaWx0ZXIgPSBleHRyYXNba2V5XTtcbiAgICBpZiAoa2V5ICE9PSBcInF1ZXJ5XCIgJiYgcXVlcnlGaWx0ZXIpIHtcbiAgICAgIGNvbnN0IG1hdGNoZXIgPSBuZXcgUmVnRXhwKHF1ZXJ5RmlsdGVyLCBcImlcIik7XG4gICAgICBjb25zdCBtYXRjaGVzID0gcXVlcnkubWF0Y2gobWF0Y2hlcik7XG5cbiAgICAgIGlmIChtYXRjaGVzKSB7XG4gICAgICAgIHJldHVybiBlc2NhcGVSZWdFeHAobWF0Y2hlc1sxXSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBcIlwiO1xuICAgIH1cbiAgICByZXR1cm4gZXNjYXBlUmVnRXhwKHF1ZXJ5KTtcbiAgfSk7XG5cbiAgZmluZCA9IGBeKD86JHtmaW5kfSkkYDtcblxuICByZXR1cm4gbmV3IFJlZ0V4cChmaW5kLCBcImlcIik7XG59O1xuXG4vKipcbiAqIERpc3BsYXkgdGhlIG9wdGlvbiBsaXN0IG9mIGEgY29tYm8gYm94IGNvbXBvbmVudC5cbiAqXG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbCBBbiBlbGVtZW50IHdpdGhpbiB0aGUgY29tYm8gYm94IGNvbXBvbmVudFxuICovXG5jb25zdCBkaXNwbGF5TGlzdCA9IChlbCkgPT4ge1xuICBjb25zdCB7XG4gICAgY29tYm9Cb3hFbCxcbiAgICBzZWxlY3RFbCxcbiAgICBpbnB1dEVsLFxuICAgIGxpc3RFbCxcbiAgICBzdGF0dXNFbCxcbiAgICBpc1ByaXN0aW5lLFxuICAgIGRpc2FibGVGaWx0ZXJpbmcsXG4gIH0gPSBnZXRDb21ib0JveENvbnRleHQoZWwpO1xuICBsZXQgc2VsZWN0ZWRJdGVtSWQ7XG4gIGxldCBmaXJzdEZvdW5kSWQ7XG5cbiAgY29uc3QgbGlzdE9wdGlvbkJhc2VJZCA9IGAke2xpc3RFbC5pZH0tLW9wdGlvbi1gO1xuXG4gIGNvbnN0IGlucHV0VmFsdWUgPSAoaW5wdXRFbC52YWx1ZSB8fCBcIlwiKS50b0xvd2VyQ2FzZSgpO1xuICBjb25zdCBmaWx0ZXIgPSBjb21ib0JveEVsLmRhdGFzZXQuZmlsdGVyIHx8IERFRkFVTFRfRklMVEVSO1xuICBjb25zdCByZWdleCA9IGdlbmVyYXRlRHluYW1pY1JlZ0V4cChmaWx0ZXIsIGlucHV0VmFsdWUsIGNvbWJvQm94RWwuZGF0YXNldCk7XG5cbiAgY29uc3Qgb3B0aW9ucyA9IFtdO1xuICBmb3IgKGxldCBpID0gMCwgbGVuID0gc2VsZWN0RWwub3B0aW9ucy5sZW5ndGg7IGkgPCBsZW47IGkgKz0gMSkge1xuICAgIGNvbnN0IG9wdGlvbkVsID0gc2VsZWN0RWwub3B0aW9uc1tpXTtcbiAgICBjb25zdCBvcHRpb25JZCA9IGAke2xpc3RPcHRpb25CYXNlSWR9JHtvcHRpb25zLmxlbmd0aH1gO1xuXG4gICAgaWYgKFxuICAgICAgb3B0aW9uRWwudmFsdWUgJiZcbiAgICAgIChkaXNhYmxlRmlsdGVyaW5nIHx8XG4gICAgICAgIGlzUHJpc3RpbmUgfHxcbiAgICAgICAgIWlucHV0VmFsdWUgfHxcbiAgICAgICAgcmVnZXgudGVzdChvcHRpb25FbC50ZXh0KSlcbiAgICApIHtcbiAgICAgIGlmIChzZWxlY3RFbC52YWx1ZSAmJiBvcHRpb25FbC52YWx1ZSA9PT0gc2VsZWN0RWwudmFsdWUpIHtcbiAgICAgICAgc2VsZWN0ZWRJdGVtSWQgPSBvcHRpb25JZDtcbiAgICAgIH1cblxuICAgICAgaWYgKGRpc2FibGVGaWx0ZXJpbmcgJiYgIWZpcnN0Rm91bmRJZCAmJiByZWdleC50ZXN0KG9wdGlvbkVsLnRleHQpKSB7XG4gICAgICAgIGZpcnN0Rm91bmRJZCA9IG9wdGlvbklkO1xuICAgICAgfVxuICAgICAgb3B0aW9ucy5wdXNoKG9wdGlvbkVsKTtcbiAgICB9XG4gIH1cblxuICBjb25zdCBudW1PcHRpb25zID0gb3B0aW9ucy5sZW5ndGg7XG4gIGNvbnN0IG9wdGlvbkh0bWwgPSBvcHRpb25zLm1hcCgob3B0aW9uLCBpbmRleCkgPT4ge1xuICAgIGNvbnN0IG9wdGlvbklkID0gYCR7bGlzdE9wdGlvbkJhc2VJZH0ke2luZGV4fWA7XG4gICAgY29uc3QgY2xhc3NlcyA9IFtMSVNUX09QVElPTl9DTEFTU107XG4gICAgbGV0IHRhYmluZGV4ID0gXCItMVwiO1xuICAgIGxldCBhcmlhU2VsZWN0ZWQgPSBcImZhbHNlXCI7XG5cbiAgICBpZiAob3B0aW9uSWQgPT09IHNlbGVjdGVkSXRlbUlkKSB7XG4gICAgICBjbGFzc2VzLnB1c2goTElTVF9PUFRJT05fU0VMRUNURURfQ0xBU1MsIExJU1RfT1BUSU9OX0ZPQ1VTRURfQ0xBU1MpO1xuICAgICAgdGFiaW5kZXggPSBcIjBcIjtcbiAgICAgIGFyaWFTZWxlY3RlZCA9IFwidHJ1ZVwiO1xuICAgIH1cblxuICAgIGlmICghc2VsZWN0ZWRJdGVtSWQgJiYgaW5kZXggPT09IDApIHtcbiAgICAgIGNsYXNzZXMucHVzaChMSVNUX09QVElPTl9GT0NVU0VEX0NMQVNTKTtcbiAgICAgIHRhYmluZGV4ID0gXCIwXCI7XG4gICAgfVxuXG4gICAgY29uc3QgbGkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwibGlcIik7XG5cbiAgICBsaS5zZXRBdHRyaWJ1dGUoXCJhcmlhLXNldHNpemVcIiwgb3B0aW9ucy5sZW5ndGgpO1xuICAgIGxpLnNldEF0dHJpYnV0ZShcImFyaWEtcG9zaW5zZXRcIiwgaW5kZXggKyAxKTtcbiAgICBsaS5zZXRBdHRyaWJ1dGUoXCJhcmlhLXNlbGVjdGVkXCIsIGFyaWFTZWxlY3RlZCk7XG4gICAgbGkuc2V0QXR0cmlidXRlKFwiaWRcIiwgb3B0aW9uSWQpO1xuICAgIGxpLnNldEF0dHJpYnV0ZShcImNsYXNzXCIsIGNsYXNzZXMuam9pbihcIiBcIikpO1xuICAgIGxpLnNldEF0dHJpYnV0ZShcInRhYmluZGV4XCIsIHRhYmluZGV4KTtcbiAgICBsaS5zZXRBdHRyaWJ1dGUoXCJyb2xlXCIsIFwib3B0aW9uXCIpO1xuICAgIGxpLnNldEF0dHJpYnV0ZShcImRhdGEtdmFsdWVcIiwgb3B0aW9uLnZhbHVlKTtcbiAgICBsaS50ZXh0Q29udGVudCA9IG9wdGlvbi50ZXh0O1xuXG4gICAgcmV0dXJuIGxpO1xuICB9KTtcblxuICBjb25zdCBub1Jlc3VsdHMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwibGlcIik7XG4gIG5vUmVzdWx0cy5zZXRBdHRyaWJ1dGUoXCJjbGFzc1wiLCBgJHtMSVNUX09QVElPTl9DTEFTU30tLW5vLXJlc3VsdHNgKTtcbiAgbm9SZXN1bHRzLnRleHRDb250ZW50ID0gXCJObyByZXN1bHRzIGZvdW5kXCI7XG5cbiAgbGlzdEVsLmhpZGRlbiA9IGZhbHNlO1xuXG4gIGlmIChudW1PcHRpb25zKSB7XG4gICAgbGlzdEVsLmlubmVySFRNTCA9IFwiXCI7XG4gICAgb3B0aW9uSHRtbC5mb3JFYWNoKChpdGVtKSA9PlxuICAgICAgbGlzdEVsLmluc2VydEFkamFjZW50RWxlbWVudChcImJlZm9yZWVuZFwiLCBpdGVtKVxuICAgICk7XG4gIH0gZWxzZSB7XG4gICAgbGlzdEVsLmlubmVySFRNTCA9IFwiXCI7XG4gICAgbGlzdEVsLmluc2VydEFkamFjZW50RWxlbWVudChcImJlZm9yZWVuZFwiLCBub1Jlc3VsdHMpO1xuICB9XG5cbiAgaW5wdXRFbC5zZXRBdHRyaWJ1dGUoXCJhcmlhLWV4cGFuZGVkXCIsIFwidHJ1ZVwiKTtcblxuICBzdGF0dXNFbC50ZXh0Q29udGVudCA9IG51bU9wdGlvbnNcbiAgICA/IGAke251bU9wdGlvbnN9IHJlc3VsdCR7bnVtT3B0aW9ucyA+IDEgPyBcInNcIiA6IFwiXCJ9IGF2YWlsYWJsZS5gXG4gICAgOiBcIk5vIHJlc3VsdHMuXCI7XG5cbiAgbGV0IGl0ZW1Ub0ZvY3VzO1xuXG4gIGlmIChpc1ByaXN0aW5lICYmIHNlbGVjdGVkSXRlbUlkKSB7XG4gICAgaXRlbVRvRm9jdXMgPSBsaXN0RWwucXVlcnlTZWxlY3RvcihgIyR7c2VsZWN0ZWRJdGVtSWR9YCk7XG4gIH0gZWxzZSBpZiAoZGlzYWJsZUZpbHRlcmluZyAmJiBmaXJzdEZvdW5kSWQpIHtcbiAgICBpdGVtVG9Gb2N1cyA9IGxpc3RFbC5xdWVyeVNlbGVjdG9yKGAjJHtmaXJzdEZvdW5kSWR9YCk7XG4gIH1cblxuICBpZiAoaXRlbVRvRm9jdXMpIHtcbiAgICBoaWdobGlnaHRPcHRpb24obGlzdEVsLCBpdGVtVG9Gb2N1cywge1xuICAgICAgc2tpcEZvY3VzOiB0cnVlLFxuICAgIH0pO1xuICB9XG59O1xuXG4vKipcbiAqIEhpZGUgdGhlIG9wdGlvbiBsaXN0IG9mIGEgY29tYm8gYm94IGNvbXBvbmVudC5cbiAqXG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbCBBbiBlbGVtZW50IHdpdGhpbiB0aGUgY29tYm8gYm94IGNvbXBvbmVudFxuICovXG5jb25zdCBoaWRlTGlzdCA9IChlbCkgPT4ge1xuICBjb25zdCB7IGlucHV0RWwsIGxpc3RFbCwgc3RhdHVzRWwsIGZvY3VzZWRPcHRpb25FbCB9ID0gZ2V0Q29tYm9Cb3hDb250ZXh0KGVsKTtcblxuICBzdGF0dXNFbC5pbm5lckhUTUwgPSBcIlwiO1xuXG4gIGlucHV0RWwuc2V0QXR0cmlidXRlKFwiYXJpYS1leHBhbmRlZFwiLCBcImZhbHNlXCIpO1xuICBpbnB1dEVsLnNldEF0dHJpYnV0ZShcImFyaWEtYWN0aXZlZGVzY2VuZGFudFwiLCBcIlwiKTtcblxuICBpZiAoZm9jdXNlZE9wdGlvbkVsKSB7XG4gICAgZm9jdXNlZE9wdGlvbkVsLmNsYXNzTGlzdC5yZW1vdmUoTElTVF9PUFRJT05fRk9DVVNFRF9DTEFTUyk7XG4gIH1cblxuICBsaXN0RWwuc2Nyb2xsVG9wID0gMDtcbiAgbGlzdEVsLmhpZGRlbiA9IHRydWU7XG59O1xuXG4vKipcbiAqIFNlbGVjdCBhbiBvcHRpb24gbGlzdCBvZiB0aGUgY29tYm8gYm94IGNvbXBvbmVudC5cbiAqXG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBsaXN0T3B0aW9uRWwgVGhlIGxpc3Qgb3B0aW9uIGJlaW5nIHNlbGVjdGVkXG4gKi9cbmNvbnN0IHNlbGVjdEl0ZW0gPSAobGlzdE9wdGlvbkVsKSA9PiB7XG4gIGNvbnN0IHsgY29tYm9Cb3hFbCwgc2VsZWN0RWwsIGlucHV0RWwgfSA9IGdldENvbWJvQm94Q29udGV4dChsaXN0T3B0aW9uRWwpO1xuXG4gIGNoYW5nZUVsZW1lbnRWYWx1ZShzZWxlY3RFbCwgbGlzdE9wdGlvbkVsLmRhdGFzZXQudmFsdWUpO1xuICBjaGFuZ2VFbGVtZW50VmFsdWUoaW5wdXRFbCwgbGlzdE9wdGlvbkVsLnRleHRDb250ZW50KTtcbiAgY29tYm9Cb3hFbC5jbGFzc0xpc3QuYWRkKENPTUJPX0JPWF9QUklTVElORV9DTEFTUyk7XG4gIGhpZGVMaXN0KGNvbWJvQm94RWwpO1xuICBpbnB1dEVsLmZvY3VzKCk7XG59O1xuXG4vKipcbiAqIENsZWFyIHRoZSBpbnB1dCBvZiB0aGUgY29tYm8gYm94XG4gKlxuICogQHBhcmFtIHtIVE1MQnV0dG9uRWxlbWVudH0gY2xlYXJCdXR0b25FbCBUaGUgY2xlYXIgaW5wdXQgYnV0dG9uXG4gKi9cbmNvbnN0IGNsZWFySW5wdXQgPSAoY2xlYXJCdXR0b25FbCkgPT4ge1xuICBjb25zdCB7IGNvbWJvQm94RWwsIGxpc3RFbCwgc2VsZWN0RWwsIGlucHV0RWwgfSA9XG4gICAgZ2V0Q29tYm9Cb3hDb250ZXh0KGNsZWFyQnV0dG9uRWwpO1xuICBjb25zdCBsaXN0U2hvd24gPSAhbGlzdEVsLmhpZGRlbjtcblxuICBpZiAoc2VsZWN0RWwudmFsdWUpIGNoYW5nZUVsZW1lbnRWYWx1ZShzZWxlY3RFbCk7XG4gIGlmIChpbnB1dEVsLnZhbHVlKSBjaGFuZ2VFbGVtZW50VmFsdWUoaW5wdXRFbCk7XG4gIGNvbWJvQm94RWwuY2xhc3NMaXN0LnJlbW92ZShDT01CT19CT1hfUFJJU1RJTkVfQ0xBU1MpO1xuXG4gIGlmIChsaXN0U2hvd24pIGRpc3BsYXlMaXN0KGNvbWJvQm94RWwpO1xuICBpbnB1dEVsLmZvY3VzKCk7XG59O1xuXG4vKipcbiAqIFJlc2V0IHRoZSBzZWxlY3QgYmFzZWQgb2ZmIG9mIGN1cnJlbnRseSBzZXQgc2VsZWN0IHZhbHVlXG4gKlxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWwgQW4gZWxlbWVudCB3aXRoaW4gdGhlIGNvbWJvIGJveCBjb21wb25lbnRcbiAqL1xuY29uc3QgcmVzZXRTZWxlY3Rpb24gPSAoZWwpID0+IHtcbiAgY29uc3QgeyBjb21ib0JveEVsLCBzZWxlY3RFbCwgaW5wdXRFbCB9ID0gZ2V0Q29tYm9Cb3hDb250ZXh0KGVsKTtcblxuICBjb25zdCBzZWxlY3RWYWx1ZSA9IHNlbGVjdEVsLnZhbHVlO1xuICBjb25zdCBpbnB1dFZhbHVlID0gKGlucHV0RWwudmFsdWUgfHwgXCJcIikudG9Mb3dlckNhc2UoKTtcblxuICBpZiAoc2VsZWN0VmFsdWUpIHtcbiAgICBmb3IgKGxldCBpID0gMCwgbGVuID0gc2VsZWN0RWwub3B0aW9ucy5sZW5ndGg7IGkgPCBsZW47IGkgKz0gMSkge1xuICAgICAgY29uc3Qgb3B0aW9uRWwgPSBzZWxlY3RFbC5vcHRpb25zW2ldO1xuICAgICAgaWYgKG9wdGlvbkVsLnZhbHVlID09PSBzZWxlY3RWYWx1ZSkge1xuICAgICAgICBpZiAoaW5wdXRWYWx1ZSAhPT0gb3B0aW9uRWwudGV4dCkge1xuICAgICAgICAgIGNoYW5nZUVsZW1lbnRWYWx1ZShpbnB1dEVsLCBvcHRpb25FbC50ZXh0KTtcbiAgICAgICAgfVxuICAgICAgICBjb21ib0JveEVsLmNsYXNzTGlzdC5hZGQoQ09NQk9fQk9YX1BSSVNUSU5FX0NMQVNTKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGlmIChpbnB1dFZhbHVlKSB7XG4gICAgY2hhbmdlRWxlbWVudFZhbHVlKGlucHV0RWwpO1xuICB9XG59O1xuXG4vKipcbiAqIFNlbGVjdCBhbiBvcHRpb24gbGlzdCBvZiB0aGUgY29tYm8gYm94IGNvbXBvbmVudCBiYXNlZCBvZmYgb2ZcbiAqIGhhdmluZyBhIGN1cnJlbnQgZm9jdXNlZCBsaXN0IG9wdGlvbiBvclxuICogaGF2aW5nIHRlc3QgdGhhdCBjb21wbGV0ZWx5IG1hdGNoZXMgYSBsaXN0IG9wdGlvbi5cbiAqIE90aGVyd2lzZSBpdCBjbGVhcnMgdGhlIGlucHV0IGFuZCBzZWxlY3QuXG4gKlxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWwgQW4gZWxlbWVudCB3aXRoaW4gdGhlIGNvbWJvIGJveCBjb21wb25lbnRcbiAqL1xuY29uc3QgY29tcGxldGVTZWxlY3Rpb24gPSAoZWwpID0+IHtcbiAgY29uc3QgeyBjb21ib0JveEVsLCBzZWxlY3RFbCwgaW5wdXRFbCwgc3RhdHVzRWwgfSA9IGdldENvbWJvQm94Q29udGV4dChlbCk7XG5cbiAgc3RhdHVzRWwudGV4dENvbnRlbnQgPSBcIlwiO1xuXG4gIGNvbnN0IGlucHV0VmFsdWUgPSAoaW5wdXRFbC52YWx1ZSB8fCBcIlwiKS50b0xvd2VyQ2FzZSgpO1xuXG4gIGlmIChpbnB1dFZhbHVlKSB7XG4gICAgZm9yIChsZXQgaSA9IDAsIGxlbiA9IHNlbGVjdEVsLm9wdGlvbnMubGVuZ3RoOyBpIDwgbGVuOyBpICs9IDEpIHtcbiAgICAgIGNvbnN0IG9wdGlvbkVsID0gc2VsZWN0RWwub3B0aW9uc1tpXTtcbiAgICAgIGlmIChvcHRpb25FbC50ZXh0LnRvTG93ZXJDYXNlKCkgPT09IGlucHV0VmFsdWUpIHtcbiAgICAgICAgY2hhbmdlRWxlbWVudFZhbHVlKHNlbGVjdEVsLCBvcHRpb25FbC52YWx1ZSk7XG4gICAgICAgIGNoYW5nZUVsZW1lbnRWYWx1ZShpbnB1dEVsLCBvcHRpb25FbC50ZXh0KTtcbiAgICAgICAgY29tYm9Cb3hFbC5jbGFzc0xpc3QuYWRkKENPTUJPX0JPWF9QUklTVElORV9DTEFTUyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXNldFNlbGVjdGlvbihjb21ib0JveEVsKTtcbn07XG5cbi8qKlxuICogSGFuZGxlIHRoZSBlc2NhcGUgZXZlbnQgd2l0aGluIHRoZSBjb21ibyBib3ggY29tcG9uZW50LlxuICpcbiAqIEBwYXJhbSB7S2V5Ym9hcmRFdmVudH0gZXZlbnQgQW4gZXZlbnQgd2l0aGluIHRoZSBjb21ibyBib3ggY29tcG9uZW50XG4gKi9cbmNvbnN0IGhhbmRsZUVzY2FwZSA9IChldmVudCkgPT4ge1xuICBjb25zdCB7IGNvbWJvQm94RWwsIGlucHV0RWwgfSA9IGdldENvbWJvQm94Q29udGV4dChldmVudC50YXJnZXQpO1xuXG4gIGhpZGVMaXN0KGNvbWJvQm94RWwpO1xuICByZXNldFNlbGVjdGlvbihjb21ib0JveEVsKTtcbiAgaW5wdXRFbC5mb2N1cygpO1xufTtcblxuLyoqXG4gKiBIYW5kbGUgdGhlIGRvd24gZXZlbnQgd2l0aGluIHRoZSBjb21ibyBib3ggY29tcG9uZW50LlxuICpcbiAqIEBwYXJhbSB7S2V5Ym9hcmRFdmVudH0gZXZlbnQgQW4gZXZlbnQgd2l0aGluIHRoZSBjb21ibyBib3ggY29tcG9uZW50XG4gKi9cbmNvbnN0IGhhbmRsZURvd25Gcm9tSW5wdXQgPSAoZXZlbnQpID0+IHtcbiAgY29uc3QgeyBjb21ib0JveEVsLCBsaXN0RWwgfSA9IGdldENvbWJvQm94Q29udGV4dChldmVudC50YXJnZXQpO1xuXG4gIGlmIChsaXN0RWwuaGlkZGVuKSB7XG4gICAgZGlzcGxheUxpc3QoY29tYm9Cb3hFbCk7XG4gIH1cblxuICBjb25zdCBuZXh0T3B0aW9uRWwgPVxuICAgIGxpc3RFbC5xdWVyeVNlbGVjdG9yKExJU1RfT1BUSU9OX0ZPQ1VTRUQpIHx8XG4gICAgbGlzdEVsLnF1ZXJ5U2VsZWN0b3IoTElTVF9PUFRJT04pO1xuXG4gIGlmIChuZXh0T3B0aW9uRWwpIHtcbiAgICBoaWdobGlnaHRPcHRpb24oY29tYm9Cb3hFbCwgbmV4dE9wdGlvbkVsKTtcbiAgfVxuXG4gIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG59O1xuXG4vKipcbiAqIEhhbmRsZSB0aGUgZW50ZXIgZXZlbnQgZnJvbSBhbiBpbnB1dCBlbGVtZW50IHdpdGhpbiB0aGUgY29tYm8gYm94IGNvbXBvbmVudC5cbiAqXG4gKiBAcGFyYW0ge0tleWJvYXJkRXZlbnR9IGV2ZW50IEFuIGV2ZW50IHdpdGhpbiB0aGUgY29tYm8gYm94IGNvbXBvbmVudFxuICovXG5jb25zdCBoYW5kbGVFbnRlckZyb21JbnB1dCA9IChldmVudCkgPT4ge1xuICBjb25zdCB7IGNvbWJvQm94RWwsIGxpc3RFbCB9ID0gZ2V0Q29tYm9Cb3hDb250ZXh0KGV2ZW50LnRhcmdldCk7XG4gIGNvbnN0IGxpc3RTaG93biA9ICFsaXN0RWwuaGlkZGVuO1xuXG4gIGNvbXBsZXRlU2VsZWN0aW9uKGNvbWJvQm94RWwpO1xuXG4gIGlmIChsaXN0U2hvd24pIHtcbiAgICBoaWRlTGlzdChjb21ib0JveEVsKTtcbiAgfVxuXG4gIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG59O1xuXG4vKipcbiAqIEhhbmRsZSB0aGUgZG93biBldmVudCB3aXRoaW4gdGhlIGNvbWJvIGJveCBjb21wb25lbnQuXG4gKlxuICogQHBhcmFtIHtLZXlib2FyZEV2ZW50fSBldmVudCBBbiBldmVudCB3aXRoaW4gdGhlIGNvbWJvIGJveCBjb21wb25lbnRcbiAqL1xuY29uc3QgaGFuZGxlRG93bkZyb21MaXN0T3B0aW9uID0gKGV2ZW50KSA9PiB7XG4gIGNvbnN0IGZvY3VzZWRPcHRpb25FbCA9IGV2ZW50LnRhcmdldDtcbiAgY29uc3QgbmV4dE9wdGlvbkVsID0gZm9jdXNlZE9wdGlvbkVsLm5leHRTaWJsaW5nO1xuXG4gIGlmIChuZXh0T3B0aW9uRWwpIHtcbiAgICBoaWdobGlnaHRPcHRpb24oZm9jdXNlZE9wdGlvbkVsLCBuZXh0T3B0aW9uRWwpO1xuICB9XG5cbiAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbn07XG5cbi8qKlxuICogSGFuZGxlIHRoZSB0YWIgZXZlbnQgZnJvbSBhbiBsaXN0IG9wdGlvbiBlbGVtZW50IHdpdGhpbiB0aGUgY29tYm8gYm94IGNvbXBvbmVudC5cbiAqXG4gKiBAcGFyYW0ge0tleWJvYXJkRXZlbnR9IGV2ZW50IEFuIGV2ZW50IHdpdGhpbiB0aGUgY29tYm8gYm94IGNvbXBvbmVudFxuICovXG5jb25zdCBoYW5kbGVUYWJGcm9tTGlzdE9wdGlvbiA9IChldmVudCkgPT4ge1xuICBzZWxlY3RJdGVtKGV2ZW50LnRhcmdldCk7XG4gIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG59O1xuXG4vKipcbiAqIEhhbmRsZSB0aGUgZW50ZXIgZXZlbnQgZnJvbSBsaXN0IG9wdGlvbiB3aXRoaW4gdGhlIGNvbWJvIGJveCBjb21wb25lbnQuXG4gKlxuICogQHBhcmFtIHtLZXlib2FyZEV2ZW50fSBldmVudCBBbiBldmVudCB3aXRoaW4gdGhlIGNvbWJvIGJveCBjb21wb25lbnRcbiAqL1xuY29uc3QgaGFuZGxlRW50ZXJGcm9tTGlzdE9wdGlvbiA9IChldmVudCkgPT4ge1xuICBzZWxlY3RJdGVtKGV2ZW50LnRhcmdldCk7XG4gIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG59O1xuXG4vKipcbiAqIEhhbmRsZSB0aGUgdXAgZXZlbnQgZnJvbSBsaXN0IG9wdGlvbiB3aXRoaW4gdGhlIGNvbWJvIGJveCBjb21wb25lbnQuXG4gKlxuICogQHBhcmFtIHtLZXlib2FyZEV2ZW50fSBldmVudCBBbiBldmVudCB3aXRoaW4gdGhlIGNvbWJvIGJveCBjb21wb25lbnRcbiAqL1xuY29uc3QgaGFuZGxlVXBGcm9tTGlzdE9wdGlvbiA9IChldmVudCkgPT4ge1xuICBjb25zdCB7IGNvbWJvQm94RWwsIGxpc3RFbCwgZm9jdXNlZE9wdGlvbkVsIH0gPSBnZXRDb21ib0JveENvbnRleHQoXG4gICAgZXZlbnQudGFyZ2V0XG4gICk7XG4gIGNvbnN0IG5leHRPcHRpb25FbCA9IGZvY3VzZWRPcHRpb25FbCAmJiBmb2N1c2VkT3B0aW9uRWwucHJldmlvdXNTaWJsaW5nO1xuICBjb25zdCBsaXN0U2hvd24gPSAhbGlzdEVsLmhpZGRlbjtcblxuICBoaWdobGlnaHRPcHRpb24oY29tYm9Cb3hFbCwgbmV4dE9wdGlvbkVsKTtcblxuICBpZiAobGlzdFNob3duKSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgfVxuXG4gIGlmICghbmV4dE9wdGlvbkVsKSB7XG4gICAgaGlkZUxpc3QoY29tYm9Cb3hFbCk7XG4gIH1cbn07XG5cbi8qKlxuICogU2VsZWN0IGxpc3Qgb3B0aW9uIG9uIHRoZSBtb3VzZW92ZXIgZXZlbnQuXG4gKlxuICogQHBhcmFtIHtNb3VzZUV2ZW50fSBldmVudCBUaGUgbW91c2VvdmVyIGV2ZW50XG4gKiBAcGFyYW0ge0hUTUxMSUVsZW1lbnR9IGxpc3RPcHRpb25FbCBBbiBlbGVtZW50IHdpdGhpbiB0aGUgY29tYm8gYm94IGNvbXBvbmVudFxuICovXG5jb25zdCBoYW5kbGVNb3VzZW92ZXIgPSAobGlzdE9wdGlvbkVsKSA9PiB7XG4gIGNvbnN0IGlzQ3VycmVudGx5Rm9jdXNlZCA9IGxpc3RPcHRpb25FbC5jbGFzc0xpc3QuY29udGFpbnMoXG4gICAgTElTVF9PUFRJT05fRk9DVVNFRF9DTEFTU1xuICApO1xuXG4gIGlmIChpc0N1cnJlbnRseUZvY3VzZWQpIHJldHVybjtcblxuICBoaWdobGlnaHRPcHRpb24obGlzdE9wdGlvbkVsLCBsaXN0T3B0aW9uRWwsIHtcbiAgICBwcmV2ZW50U2Nyb2xsOiB0cnVlLFxuICB9KTtcbn07XG5cbi8qKlxuICogVG9nZ2xlIHRoZSBsaXN0IHdoZW4gdGhlIGJ1dHRvbiBpcyBjbGlja2VkXG4gKlxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWwgQW4gZWxlbWVudCB3aXRoaW4gdGhlIGNvbWJvIGJveCBjb21wb25lbnRcbiAqL1xuY29uc3QgdG9nZ2xlTGlzdCA9IChlbCkgPT4ge1xuICBjb25zdCB7IGNvbWJvQm94RWwsIGxpc3RFbCwgaW5wdXRFbCB9ID0gZ2V0Q29tYm9Cb3hDb250ZXh0KGVsKTtcblxuICBpZiAobGlzdEVsLmhpZGRlbikge1xuICAgIGRpc3BsYXlMaXN0KGNvbWJvQm94RWwpO1xuICB9IGVsc2Uge1xuICAgIGhpZGVMaXN0KGNvbWJvQm94RWwpO1xuICB9XG5cbiAgaW5wdXRFbC5mb2N1cygpO1xufTtcblxuLyoqXG4gKiBIYW5kbGUgY2xpY2sgZnJvbSBpbnB1dFxuICpcbiAqIEBwYXJhbSB7SFRNTElucHV0RWxlbWVudH0gZWwgQW4gZWxlbWVudCB3aXRoaW4gdGhlIGNvbWJvIGJveCBjb21wb25lbnRcbiAqL1xuY29uc3QgaGFuZGxlQ2xpY2tGcm9tSW5wdXQgPSAoZWwpID0+IHtcbiAgY29uc3QgeyBjb21ib0JveEVsLCBsaXN0RWwgfSA9IGdldENvbWJvQm94Q29udGV4dChlbCk7XG5cbiAgaWYgKGxpc3RFbC5oaWRkZW4pIHtcbiAgICBkaXNwbGF5TGlzdChjb21ib0JveEVsKTtcbiAgfVxufTtcblxuY29uc3QgY29tYm9Cb3ggPSBiZWhhdmlvcihcbiAge1xuICAgIFtDTElDS106IHtcbiAgICAgIFtJTlBVVF0oKSB7XG4gICAgICAgIGlmICh0aGlzLmRpc2FibGVkKSByZXR1cm47XG4gICAgICAgIGhhbmRsZUNsaWNrRnJvbUlucHV0KHRoaXMpO1xuICAgICAgfSxcbiAgICAgIFtUT0dHTEVfTElTVF9CVVRUT05dKCkge1xuICAgICAgICBpZiAodGhpcy5kaXNhYmxlZCkgcmV0dXJuO1xuICAgICAgICB0b2dnbGVMaXN0KHRoaXMpO1xuICAgICAgfSxcbiAgICAgIFtMSVNUX09QVElPTl0oKSB7XG4gICAgICAgIGlmICh0aGlzLmRpc2FibGVkKSByZXR1cm47XG4gICAgICAgIHNlbGVjdEl0ZW0odGhpcyk7XG4gICAgICB9LFxuICAgICAgW0NMRUFSX0lOUFVUX0JVVFRPTl0oKSB7XG4gICAgICAgIGlmICh0aGlzLmRpc2FibGVkKSByZXR1cm47XG4gICAgICAgIGNsZWFySW5wdXQodGhpcyk7XG4gICAgICB9LFxuICAgIH0sXG4gICAgZm9jdXNvdXQ6IHtcbiAgICAgIFtDT01CT19CT1hdKGV2ZW50KSB7XG4gICAgICAgIGlmICghdGhpcy5jb250YWlucyhldmVudC5yZWxhdGVkVGFyZ2V0KSkge1xuICAgICAgICAgIHJlc2V0U2VsZWN0aW9uKHRoaXMpO1xuICAgICAgICAgIGhpZGVMaXN0KHRoaXMpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgIH0sXG4gICAga2V5ZG93bjoge1xuICAgICAgW0NPTUJPX0JPWF06IGtleW1hcCh7XG4gICAgICAgIEVzY2FwZTogaGFuZGxlRXNjYXBlLFxuICAgICAgfSksXG4gICAgICBbSU5QVVRdOiBrZXltYXAoe1xuICAgICAgICBFbnRlcjogaGFuZGxlRW50ZXJGcm9tSW5wdXQsXG4gICAgICAgIEFycm93RG93bjogaGFuZGxlRG93bkZyb21JbnB1dCxcbiAgICAgICAgRG93bjogaGFuZGxlRG93bkZyb21JbnB1dCxcbiAgICAgIH0pLFxuICAgICAgW0xJU1RfT1BUSU9OXToga2V5bWFwKHtcbiAgICAgICAgQXJyb3dVcDogaGFuZGxlVXBGcm9tTGlzdE9wdGlvbixcbiAgICAgICAgVXA6IGhhbmRsZVVwRnJvbUxpc3RPcHRpb24sXG4gICAgICAgIEFycm93RG93bjogaGFuZGxlRG93bkZyb21MaXN0T3B0aW9uLFxuICAgICAgICBEb3duOiBoYW5kbGVEb3duRnJvbUxpc3RPcHRpb24sXG4gICAgICAgIEVudGVyOiBoYW5kbGVFbnRlckZyb21MaXN0T3B0aW9uLFxuICAgICAgICBUYWI6IGhhbmRsZVRhYkZyb21MaXN0T3B0aW9uLFxuICAgICAgICBcIlNoaWZ0K1RhYlwiOiBub29wLFxuICAgICAgfSksXG4gICAgfSxcbiAgICBpbnB1dDoge1xuICAgICAgW0lOUFVUXSgpIHtcbiAgICAgICAgY29uc3QgY29tYm9Cb3hFbCA9IHRoaXMuY2xvc2VzdChDT01CT19CT1gpO1xuICAgICAgICBjb21ib0JveEVsLmNsYXNzTGlzdC5yZW1vdmUoQ09NQk9fQk9YX1BSSVNUSU5FX0NMQVNTKTtcbiAgICAgICAgZGlzcGxheUxpc3QodGhpcyk7XG4gICAgICB9LFxuICAgIH0sXG4gICAgbW91c2VvdmVyOiB7XG4gICAgICBbTElTVF9PUFRJT05dKCkge1xuICAgICAgICBoYW5kbGVNb3VzZW92ZXIodGhpcyk7XG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG4gIHtcbiAgICBpbml0KHJvb3QpIHtcbiAgICAgIHNlbGVjdE9yTWF0Y2hlcyhDT01CT19CT1gsIHJvb3QpLmZvckVhY2goKGNvbWJvQm94RWwpID0+IHtcbiAgICAgICAgZW5oYW5jZUNvbWJvQm94KGNvbWJvQm94RWwpO1xuICAgICAgfSk7XG4gICAgfSxcbiAgICBnZXRDb21ib0JveENvbnRleHQsXG4gICAgZW5oYW5jZUNvbWJvQm94LFxuICAgIGdlbmVyYXRlRHluYW1pY1JlZ0V4cCxcbiAgICBkaXNhYmxlLFxuICAgIGVuYWJsZSxcbiAgICBkaXNwbGF5TGlzdCxcbiAgICBoaWRlTGlzdCxcbiAgICBDT01CT19CT1hfQ0xBU1MsXG4gIH1cbik7XG5cbm1vZHVsZS5leHBvcnRzID0gY29tYm9Cb3g7XG4iLCJjb25zdCBrZXltYXAgPSByZXF1aXJlKFwicmVjZXB0b3Iva2V5bWFwXCIpO1xuY29uc3QgYmVoYXZpb3IgPSByZXF1aXJlKFwiLi4vLi4vdXN3ZHMtY29yZS9zcmMvanMvdXRpbHMvYmVoYXZpb3JcIik7XG5jb25zdCBzZWxlY3QgPSByZXF1aXJlKFwiLi4vLi4vdXN3ZHMtY29yZS9zcmMvanMvdXRpbHMvc2VsZWN0XCIpO1xuY29uc3Qgc2VsZWN0T3JNYXRjaGVzID0gcmVxdWlyZShcIi4uLy4uL3Vzd2RzLWNvcmUvc3JjL2pzL3V0aWxzL3NlbGVjdC1vci1tYXRjaGVzXCIpO1xuY29uc3QgeyBwcmVmaXg6IFBSRUZJWCB9ID0gcmVxdWlyZShcIi4uLy4uL3Vzd2RzLWNvcmUvc3JjL2pzL2NvbmZpZ1wiKTtcbmNvbnN0IHsgQ0xJQ0sgfSA9IHJlcXVpcmUoXCIuLi8uLi91c3dkcy1jb3JlL3NyYy9qcy9ldmVudHNcIik7XG5jb25zdCBhY3RpdmVFbGVtZW50ID0gcmVxdWlyZShcIi4uLy4uL3Vzd2RzLWNvcmUvc3JjL2pzL3V0aWxzL2FjdGl2ZS1lbGVtZW50XCIpO1xuY29uc3QgaXNJb3NEZXZpY2UgPSByZXF1aXJlKFwiLi4vLi4vdXN3ZHMtY29yZS9zcmMvanMvdXRpbHMvaXMtaW9zLWRldmljZVwiKTtcbmNvbnN0IFNhbml0aXplciA9IHJlcXVpcmUoXCIuLi8uLi91c3dkcy1jb3JlL3NyYy9qcy91dGlscy9zYW5pdGl6ZXJcIik7XG5cbmNvbnN0IERBVEVfUElDS0VSX0NMQVNTID0gYCR7UFJFRklYfS1kYXRlLXBpY2tlcmA7XG5jb25zdCBEQVRFX1BJQ0tFUl9XUkFQUEVSX0NMQVNTID0gYCR7REFURV9QSUNLRVJfQ0xBU1N9X193cmFwcGVyYDtcbmNvbnN0IERBVEVfUElDS0VSX0lOSVRJQUxJWkVEX0NMQVNTID0gYCR7REFURV9QSUNLRVJfQ0xBU1N9LS1pbml0aWFsaXplZGA7XG5jb25zdCBEQVRFX1BJQ0tFUl9BQ1RJVkVfQ0xBU1MgPSBgJHtEQVRFX1BJQ0tFUl9DTEFTU30tLWFjdGl2ZWA7XG5jb25zdCBEQVRFX1BJQ0tFUl9JTlRFUk5BTF9JTlBVVF9DTEFTUyA9IGAke0RBVEVfUElDS0VSX0NMQVNTfV9faW50ZXJuYWwtaW5wdXRgO1xuY29uc3QgREFURV9QSUNLRVJfRVhURVJOQUxfSU5QVVRfQ0xBU1MgPSBgJHtEQVRFX1BJQ0tFUl9DTEFTU31fX2V4dGVybmFsLWlucHV0YDtcbmNvbnN0IERBVEVfUElDS0VSX0JVVFRPTl9DTEFTUyA9IGAke0RBVEVfUElDS0VSX0NMQVNTfV9fYnV0dG9uYDtcbmNvbnN0IERBVEVfUElDS0VSX0NBTEVOREFSX0NMQVNTID0gYCR7REFURV9QSUNLRVJfQ0xBU1N9X19jYWxlbmRhcmA7XG5jb25zdCBEQVRFX1BJQ0tFUl9TVEFUVVNfQ0xBU1MgPSBgJHtEQVRFX1BJQ0tFUl9DTEFTU31fX3N0YXR1c2A7XG5jb25zdCBDQUxFTkRBUl9EQVRFX0NMQVNTID0gYCR7REFURV9QSUNLRVJfQ0FMRU5EQVJfQ0xBU1N9X19kYXRlYDtcblxuY29uc3QgQ0FMRU5EQVJfREFURV9GT0NVU0VEX0NMQVNTID0gYCR7Q0FMRU5EQVJfREFURV9DTEFTU30tLWZvY3VzZWRgO1xuY29uc3QgQ0FMRU5EQVJfREFURV9TRUxFQ1RFRF9DTEFTUyA9IGAke0NBTEVOREFSX0RBVEVfQ0xBU1N9LS1zZWxlY3RlZGA7XG5jb25zdCBDQUxFTkRBUl9EQVRFX1BSRVZJT1VTX01PTlRIX0NMQVNTID0gYCR7Q0FMRU5EQVJfREFURV9DTEFTU30tLXByZXZpb3VzLW1vbnRoYDtcbmNvbnN0IENBTEVOREFSX0RBVEVfQ1VSUkVOVF9NT05USF9DTEFTUyA9IGAke0NBTEVOREFSX0RBVEVfQ0xBU1N9LS1jdXJyZW50LW1vbnRoYDtcbmNvbnN0IENBTEVOREFSX0RBVEVfTkVYVF9NT05USF9DTEFTUyA9IGAke0NBTEVOREFSX0RBVEVfQ0xBU1N9LS1uZXh0LW1vbnRoYDtcbmNvbnN0IENBTEVOREFSX0RBVEVfUkFOR0VfREFURV9DTEFTUyA9IGAke0NBTEVOREFSX0RBVEVfQ0xBU1N9LS1yYW5nZS1kYXRlYDtcbmNvbnN0IENBTEVOREFSX0RBVEVfVE9EQVlfQ0xBU1MgPSBgJHtDQUxFTkRBUl9EQVRFX0NMQVNTfS0tdG9kYXlgO1xuY29uc3QgQ0FMRU5EQVJfREFURV9SQU5HRV9EQVRFX1NUQVJUX0NMQVNTID0gYCR7Q0FMRU5EQVJfREFURV9DTEFTU30tLXJhbmdlLWRhdGUtc3RhcnRgO1xuY29uc3QgQ0FMRU5EQVJfREFURV9SQU5HRV9EQVRFX0VORF9DTEFTUyA9IGAke0NBTEVOREFSX0RBVEVfQ0xBU1N9LS1yYW5nZS1kYXRlLWVuZGA7XG5jb25zdCBDQUxFTkRBUl9EQVRFX1dJVEhJTl9SQU5HRV9DTEFTUyA9IGAke0NBTEVOREFSX0RBVEVfQ0xBU1N9LS13aXRoaW4tcmFuZ2VgO1xuY29uc3QgQ0FMRU5EQVJfUFJFVklPVVNfWUVBUl9DTEFTUyA9IGAke0RBVEVfUElDS0VSX0NBTEVOREFSX0NMQVNTfV9fcHJldmlvdXMteWVhcmA7XG5jb25zdCBDQUxFTkRBUl9QUkVWSU9VU19NT05USF9DTEFTUyA9IGAke0RBVEVfUElDS0VSX0NBTEVOREFSX0NMQVNTfV9fcHJldmlvdXMtbW9udGhgO1xuY29uc3QgQ0FMRU5EQVJfTkVYVF9ZRUFSX0NMQVNTID0gYCR7REFURV9QSUNLRVJfQ0FMRU5EQVJfQ0xBU1N9X19uZXh0LXllYXJgO1xuY29uc3QgQ0FMRU5EQVJfTkVYVF9NT05USF9DTEFTUyA9IGAke0RBVEVfUElDS0VSX0NBTEVOREFSX0NMQVNTfV9fbmV4dC1tb250aGA7XG5jb25zdCBDQUxFTkRBUl9NT05USF9TRUxFQ1RJT05fQ0xBU1MgPSBgJHtEQVRFX1BJQ0tFUl9DQUxFTkRBUl9DTEFTU31fX21vbnRoLXNlbGVjdGlvbmA7XG5jb25zdCBDQUxFTkRBUl9ZRUFSX1NFTEVDVElPTl9DTEFTUyA9IGAke0RBVEVfUElDS0VSX0NBTEVOREFSX0NMQVNTfV9feWVhci1zZWxlY3Rpb25gO1xuY29uc3QgQ0FMRU5EQVJfTU9OVEhfQ0xBU1MgPSBgJHtEQVRFX1BJQ0tFUl9DQUxFTkRBUl9DTEFTU31fX21vbnRoYDtcbmNvbnN0IENBTEVOREFSX01PTlRIX0ZPQ1VTRURfQ0xBU1MgPSBgJHtDQUxFTkRBUl9NT05USF9DTEFTU30tLWZvY3VzZWRgO1xuY29uc3QgQ0FMRU5EQVJfTU9OVEhfU0VMRUNURURfQ0xBU1MgPSBgJHtDQUxFTkRBUl9NT05USF9DTEFTU30tLXNlbGVjdGVkYDtcbmNvbnN0IENBTEVOREFSX1lFQVJfQ0xBU1MgPSBgJHtEQVRFX1BJQ0tFUl9DQUxFTkRBUl9DTEFTU31fX3llYXJgO1xuY29uc3QgQ0FMRU5EQVJfWUVBUl9GT0NVU0VEX0NMQVNTID0gYCR7Q0FMRU5EQVJfWUVBUl9DTEFTU30tLWZvY3VzZWRgO1xuY29uc3QgQ0FMRU5EQVJfWUVBUl9TRUxFQ1RFRF9DTEFTUyA9IGAke0NBTEVOREFSX1lFQVJfQ0xBU1N9LS1zZWxlY3RlZGA7XG5jb25zdCBDQUxFTkRBUl9QUkVWSU9VU19ZRUFSX0NIVU5LX0NMQVNTID0gYCR7REFURV9QSUNLRVJfQ0FMRU5EQVJfQ0xBU1N9X19wcmV2aW91cy15ZWFyLWNodW5rYDtcbmNvbnN0IENBTEVOREFSX05FWFRfWUVBUl9DSFVOS19DTEFTUyA9IGAke0RBVEVfUElDS0VSX0NBTEVOREFSX0NMQVNTfV9fbmV4dC15ZWFyLWNodW5rYDtcbmNvbnN0IENBTEVOREFSX0RBVEVfUElDS0VSX0NMQVNTID0gYCR7REFURV9QSUNLRVJfQ0FMRU5EQVJfQ0xBU1N9X19kYXRlLXBpY2tlcmA7XG5jb25zdCBDQUxFTkRBUl9NT05USF9QSUNLRVJfQ0xBU1MgPSBgJHtEQVRFX1BJQ0tFUl9DQUxFTkRBUl9DTEFTU31fX21vbnRoLXBpY2tlcmA7XG5jb25zdCBDQUxFTkRBUl9ZRUFSX1BJQ0tFUl9DTEFTUyA9IGAke0RBVEVfUElDS0VSX0NBTEVOREFSX0NMQVNTfV9feWVhci1waWNrZXJgO1xuY29uc3QgQ0FMRU5EQVJfVEFCTEVfQ0xBU1MgPSBgJHtEQVRFX1BJQ0tFUl9DQUxFTkRBUl9DTEFTU31fX3RhYmxlYDtcbmNvbnN0IENBTEVOREFSX1JPV19DTEFTUyA9IGAke0RBVEVfUElDS0VSX0NBTEVOREFSX0NMQVNTfV9fcm93YDtcbmNvbnN0IENBTEVOREFSX0NFTExfQ0xBU1MgPSBgJHtEQVRFX1BJQ0tFUl9DQUxFTkRBUl9DTEFTU31fX2NlbGxgO1xuY29uc3QgQ0FMRU5EQVJfQ0VMTF9DRU5URVJfSVRFTVNfQ0xBU1MgPSBgJHtDQUxFTkRBUl9DRUxMX0NMQVNTfS0tY2VudGVyLWl0ZW1zYDtcbmNvbnN0IENBTEVOREFSX01PTlRIX0xBQkVMX0NMQVNTID0gYCR7REFURV9QSUNLRVJfQ0FMRU5EQVJfQ0xBU1N9X19tb250aC1sYWJlbGA7XG5jb25zdCBDQUxFTkRBUl9EQVlfT0ZfV0VFS19DTEFTUyA9IGAke0RBVEVfUElDS0VSX0NBTEVOREFSX0NMQVNTfV9fZGF5LW9mLXdlZWtgO1xuXG5jb25zdCBEQVRFX1BJQ0tFUiA9IGAuJHtEQVRFX1BJQ0tFUl9DTEFTU31gO1xuY29uc3QgREFURV9QSUNLRVJfQlVUVE9OID0gYC4ke0RBVEVfUElDS0VSX0JVVFRPTl9DTEFTU31gO1xuY29uc3QgREFURV9QSUNLRVJfSU5URVJOQUxfSU5QVVQgPSBgLiR7REFURV9QSUNLRVJfSU5URVJOQUxfSU5QVVRfQ0xBU1N9YDtcbmNvbnN0IERBVEVfUElDS0VSX0VYVEVSTkFMX0lOUFVUID0gYC4ke0RBVEVfUElDS0VSX0VYVEVSTkFMX0lOUFVUX0NMQVNTfWA7XG5jb25zdCBEQVRFX1BJQ0tFUl9DQUxFTkRBUiA9IGAuJHtEQVRFX1BJQ0tFUl9DQUxFTkRBUl9DTEFTU31gO1xuY29uc3QgREFURV9QSUNLRVJfU1RBVFVTID0gYC4ke0RBVEVfUElDS0VSX1NUQVRVU19DTEFTU31gO1xuY29uc3QgQ0FMRU5EQVJfREFURSA9IGAuJHtDQUxFTkRBUl9EQVRFX0NMQVNTfWA7XG5jb25zdCBDQUxFTkRBUl9EQVRFX0ZPQ1VTRUQgPSBgLiR7Q0FMRU5EQVJfREFURV9GT0NVU0VEX0NMQVNTfWA7XG5jb25zdCBDQUxFTkRBUl9EQVRFX0NVUlJFTlRfTU9OVEggPSBgLiR7Q0FMRU5EQVJfREFURV9DVVJSRU5UX01PTlRIX0NMQVNTfWA7XG5jb25zdCBDQUxFTkRBUl9QUkVWSU9VU19ZRUFSID0gYC4ke0NBTEVOREFSX1BSRVZJT1VTX1lFQVJfQ0xBU1N9YDtcbmNvbnN0IENBTEVOREFSX1BSRVZJT1VTX01PTlRIID0gYC4ke0NBTEVOREFSX1BSRVZJT1VTX01PTlRIX0NMQVNTfWA7XG5jb25zdCBDQUxFTkRBUl9ORVhUX1lFQVIgPSBgLiR7Q0FMRU5EQVJfTkVYVF9ZRUFSX0NMQVNTfWA7XG5jb25zdCBDQUxFTkRBUl9ORVhUX01PTlRIID0gYC4ke0NBTEVOREFSX05FWFRfTU9OVEhfQ0xBU1N9YDtcbmNvbnN0IENBTEVOREFSX1lFQVJfU0VMRUNUSU9OID0gYC4ke0NBTEVOREFSX1lFQVJfU0VMRUNUSU9OX0NMQVNTfWA7XG5jb25zdCBDQUxFTkRBUl9NT05USF9TRUxFQ1RJT04gPSBgLiR7Q0FMRU5EQVJfTU9OVEhfU0VMRUNUSU9OX0NMQVNTfWA7XG5jb25zdCBDQUxFTkRBUl9NT05USCA9IGAuJHtDQUxFTkRBUl9NT05USF9DTEFTU31gO1xuY29uc3QgQ0FMRU5EQVJfWUVBUiA9IGAuJHtDQUxFTkRBUl9ZRUFSX0NMQVNTfWA7XG5jb25zdCBDQUxFTkRBUl9QUkVWSU9VU19ZRUFSX0NIVU5LID0gYC4ke0NBTEVOREFSX1BSRVZJT1VTX1lFQVJfQ0hVTktfQ0xBU1N9YDtcbmNvbnN0IENBTEVOREFSX05FWFRfWUVBUl9DSFVOSyA9IGAuJHtDQUxFTkRBUl9ORVhUX1lFQVJfQ0hVTktfQ0xBU1N9YDtcbmNvbnN0IENBTEVOREFSX0RBVEVfUElDS0VSID0gYC4ke0NBTEVOREFSX0RBVEVfUElDS0VSX0NMQVNTfWA7XG5jb25zdCBDQUxFTkRBUl9NT05USF9QSUNLRVIgPSBgLiR7Q0FMRU5EQVJfTU9OVEhfUElDS0VSX0NMQVNTfWA7XG5jb25zdCBDQUxFTkRBUl9ZRUFSX1BJQ0tFUiA9IGAuJHtDQUxFTkRBUl9ZRUFSX1BJQ0tFUl9DTEFTU31gO1xuY29uc3QgQ0FMRU5EQVJfTU9OVEhfRk9DVVNFRCA9IGAuJHtDQUxFTkRBUl9NT05USF9GT0NVU0VEX0NMQVNTfWA7XG5jb25zdCBDQUxFTkRBUl9ZRUFSX0ZPQ1VTRUQgPSBgLiR7Q0FMRU5EQVJfWUVBUl9GT0NVU0VEX0NMQVNTfWA7XG5cbmNvbnN0IFZBTElEQVRJT05fTUVTU0FHRSA9IFwiUGxlYXNlIGVudGVyIGEgdmFsaWQgZGF0ZVwiO1xuXG5jb25zdCBNT05USF9MQUJFTFMgPSBbXG4gIFwiSmFudWFyeVwiLFxuICBcIkZlYnJ1YXJ5XCIsXG4gIFwiTWFyY2hcIixcbiAgXCJBcHJpbFwiLFxuICBcIk1heVwiLFxuICBcIkp1bmVcIixcbiAgXCJKdWx5XCIsXG4gIFwiQXVndXN0XCIsXG4gIFwiU2VwdGVtYmVyXCIsXG4gIFwiT2N0b2JlclwiLFxuICBcIk5vdmVtYmVyXCIsXG4gIFwiRGVjZW1iZXJcIixcbl07XG5cbmNvbnN0IERBWV9PRl9XRUVLX0xBQkVMUyA9IFtcbiAgXCJTdW5kYXlcIixcbiAgXCJNb25kYXlcIixcbiAgXCJUdWVzZGF5XCIsXG4gIFwiV2VkbmVzZGF5XCIsXG4gIFwiVGh1cnNkYXlcIixcbiAgXCJGcmlkYXlcIixcbiAgXCJTYXR1cmRheVwiLFxuXTtcblxuY29uc3QgRU5URVJfS0VZQ09ERSA9IDEzO1xuXG5jb25zdCBZRUFSX0NIVU5LID0gMTI7XG5cbmNvbnN0IERFRkFVTFRfTUlOX0RBVEUgPSBcIjAwMDAtMDEtMDFcIjtcbmNvbnN0IERFRkFVTFRfRVhURVJOQUxfREFURV9GT1JNQVQgPSBcIk1NL0REL1lZWVlcIjtcbmNvbnN0IElOVEVSTkFMX0RBVEVfRk9STUFUID0gXCJZWVlZLU1NLUREXCI7XG5cbmNvbnN0IE5PVF9ESVNBQkxFRF9TRUxFQ1RPUiA9IFwiOm5vdChbZGlzYWJsZWRdKVwiO1xuXG5jb25zdCBwcm9jZXNzRm9jdXNhYmxlU2VsZWN0b3JzID0gKC4uLnNlbGVjdG9ycykgPT5cbiAgc2VsZWN0b3JzLm1hcCgocXVlcnkpID0+IHF1ZXJ5ICsgTk9UX0RJU0FCTEVEX1NFTEVDVE9SKS5qb2luKFwiLCBcIik7XG5cbmNvbnN0IERBVEVfUElDS0VSX0ZPQ1VTQUJMRSA9IHByb2Nlc3NGb2N1c2FibGVTZWxlY3RvcnMoXG4gIENBTEVOREFSX1BSRVZJT1VTX1lFQVIsXG4gIENBTEVOREFSX1BSRVZJT1VTX01PTlRILFxuICBDQUxFTkRBUl9ZRUFSX1NFTEVDVElPTixcbiAgQ0FMRU5EQVJfTU9OVEhfU0VMRUNUSU9OLFxuICBDQUxFTkRBUl9ORVhUX1lFQVIsXG4gIENBTEVOREFSX05FWFRfTU9OVEgsXG4gIENBTEVOREFSX0RBVEVfRk9DVVNFRFxuKTtcblxuY29uc3QgTU9OVEhfUElDS0VSX0ZPQ1VTQUJMRSA9IHByb2Nlc3NGb2N1c2FibGVTZWxlY3RvcnMoXG4gIENBTEVOREFSX01PTlRIX0ZPQ1VTRURcbik7XG5cbmNvbnN0IFlFQVJfUElDS0VSX0ZPQ1VTQUJMRSA9IHByb2Nlc3NGb2N1c2FibGVTZWxlY3RvcnMoXG4gIENBTEVOREFSX1BSRVZJT1VTX1lFQVJfQ0hVTkssXG4gIENBTEVOREFSX05FWFRfWUVBUl9DSFVOSyxcbiAgQ0FMRU5EQVJfWUVBUl9GT0NVU0VEXG4pO1xuXG4vLyAjcmVnaW9uIERhdGUgTWFuaXB1bGF0aW9uIEZ1bmN0aW9uc1xuXG4vKipcbiAqIEtlZXAgZGF0ZSB3aXRoaW4gbW9udGguIE1vbnRoIHdvdWxkIG9ubHkgYmUgb3ZlciBieSAxIHRvIDMgZGF5c1xuICpcbiAqIEBwYXJhbSB7RGF0ZX0gZGF0ZVRvQ2hlY2sgdGhlIGRhdGUgb2JqZWN0IHRvIGNoZWNrXG4gKiBAcGFyYW0ge251bWJlcn0gbW9udGggdGhlIGNvcnJlY3QgbW9udGhcbiAqIEByZXR1cm5zIHtEYXRlfSB0aGUgZGF0ZSwgY29ycmVjdGVkIGlmIG5lZWRlZFxuICovXG5jb25zdCBrZWVwRGF0ZVdpdGhpbk1vbnRoID0gKGRhdGVUb0NoZWNrLCBtb250aCkgPT4ge1xuICBpZiAobW9udGggIT09IGRhdGVUb0NoZWNrLmdldE1vbnRoKCkpIHtcbiAgICBkYXRlVG9DaGVjay5zZXREYXRlKDApO1xuICB9XG5cbiAgcmV0dXJuIGRhdGVUb0NoZWNrO1xufTtcblxuLyoqXG4gKiBTZXQgZGF0ZSBmcm9tIG1vbnRoIGRheSB5ZWFyXG4gKlxuICogQHBhcmFtIHtudW1iZXJ9IHllYXIgdGhlIHllYXIgdG8gc2V0XG4gKiBAcGFyYW0ge251bWJlcn0gbW9udGggdGhlIG1vbnRoIHRvIHNldCAoemVyby1pbmRleGVkKVxuICogQHBhcmFtIHtudW1iZXJ9IGRhdGUgdGhlIGRhdGUgdG8gc2V0XG4gKiBAcmV0dXJucyB7RGF0ZX0gdGhlIHNldCBkYXRlXG4gKi9cbmNvbnN0IHNldERhdGUgPSAoeWVhciwgbW9udGgsIGRhdGUpID0+IHtcbiAgY29uc3QgbmV3RGF0ZSA9IG5ldyBEYXRlKDApO1xuICBuZXdEYXRlLnNldEZ1bGxZZWFyKHllYXIsIG1vbnRoLCBkYXRlKTtcbiAgcmV0dXJuIG5ld0RhdGU7XG59O1xuXG4vKipcbiAqIHRvZGF5cyBkYXRlXG4gKlxuICogQHJldHVybnMge0RhdGV9IHRvZGF5cyBkYXRlXG4gKi9cbmNvbnN0IHRvZGF5ID0gKCkgPT4ge1xuICBjb25zdCBuZXdEYXRlID0gbmV3IERhdGUoKTtcbiAgY29uc3QgZGF5ID0gbmV3RGF0ZS5nZXREYXRlKCk7XG4gIGNvbnN0IG1vbnRoID0gbmV3RGF0ZS5nZXRNb250aCgpO1xuICBjb25zdCB5ZWFyID0gbmV3RGF0ZS5nZXRGdWxsWWVhcigpO1xuICByZXR1cm4gc2V0RGF0ZSh5ZWFyLCBtb250aCwgZGF5KTtcbn07XG5cbi8qKlxuICogU2V0IGRhdGUgdG8gZmlyc3QgZGF5IG9mIHRoZSBtb250aFxuICpcbiAqIEBwYXJhbSB7bnVtYmVyfSBkYXRlIHRoZSBkYXRlIHRvIGFkanVzdFxuICogQHJldHVybnMge0RhdGV9IHRoZSBhZGp1c3RlZCBkYXRlXG4gKi9cbmNvbnN0IHN0YXJ0T2ZNb250aCA9IChkYXRlKSA9PiB7XG4gIGNvbnN0IG5ld0RhdGUgPSBuZXcgRGF0ZSgwKTtcbiAgbmV3RGF0ZS5zZXRGdWxsWWVhcihkYXRlLmdldEZ1bGxZZWFyKCksIGRhdGUuZ2V0TW9udGgoKSwgMSk7XG4gIHJldHVybiBuZXdEYXRlO1xufTtcblxuLyoqXG4gKiBTZXQgZGF0ZSB0byBsYXN0IGRheSBvZiB0aGUgbW9udGhcbiAqXG4gKiBAcGFyYW0ge251bWJlcn0gZGF0ZSB0aGUgZGF0ZSB0byBhZGp1c3RcbiAqIEByZXR1cm5zIHtEYXRlfSB0aGUgYWRqdXN0ZWQgZGF0ZVxuICovXG5jb25zdCBsYXN0RGF5T2ZNb250aCA9IChkYXRlKSA9PiB7XG4gIGNvbnN0IG5ld0RhdGUgPSBuZXcgRGF0ZSgwKTtcbiAgbmV3RGF0ZS5zZXRGdWxsWWVhcihkYXRlLmdldEZ1bGxZZWFyKCksIGRhdGUuZ2V0TW9udGgoKSArIDEsIDApO1xuICByZXR1cm4gbmV3RGF0ZTtcbn07XG5cbi8qKlxuICogQWRkIGRheXMgdG8gZGF0ZVxuICpcbiAqIEBwYXJhbSB7RGF0ZX0gX2RhdGUgdGhlIGRhdGUgdG8gYWRqdXN0XG4gKiBAcGFyYW0ge251bWJlcn0gbnVtRGF5cyB0aGUgZGlmZmVyZW5jZSBpbiBkYXlzXG4gKiBAcmV0dXJucyB7RGF0ZX0gdGhlIGFkanVzdGVkIGRhdGVcbiAqL1xuY29uc3QgYWRkRGF5cyA9IChfZGF0ZSwgbnVtRGF5cykgPT4ge1xuICBjb25zdCBuZXdEYXRlID0gbmV3IERhdGUoX2RhdGUuZ2V0VGltZSgpKTtcbiAgbmV3RGF0ZS5zZXREYXRlKG5ld0RhdGUuZ2V0RGF0ZSgpICsgbnVtRGF5cyk7XG4gIHJldHVybiBuZXdEYXRlO1xufTtcblxuLyoqXG4gKiBTdWJ0cmFjdCBkYXlzIGZyb20gZGF0ZVxuICpcbiAqIEBwYXJhbSB7RGF0ZX0gX2RhdGUgdGhlIGRhdGUgdG8gYWRqdXN0XG4gKiBAcGFyYW0ge251bWJlcn0gbnVtRGF5cyB0aGUgZGlmZmVyZW5jZSBpbiBkYXlzXG4gKiBAcmV0dXJucyB7RGF0ZX0gdGhlIGFkanVzdGVkIGRhdGVcbiAqL1xuY29uc3Qgc3ViRGF5cyA9IChfZGF0ZSwgbnVtRGF5cykgPT4gYWRkRGF5cyhfZGF0ZSwgLW51bURheXMpO1xuXG4vKipcbiAqIEFkZCB3ZWVrcyB0byBkYXRlXG4gKlxuICogQHBhcmFtIHtEYXRlfSBfZGF0ZSB0aGUgZGF0ZSB0byBhZGp1c3RcbiAqIEBwYXJhbSB7bnVtYmVyfSBudW1XZWVrcyB0aGUgZGlmZmVyZW5jZSBpbiB3ZWVrc1xuICogQHJldHVybnMge0RhdGV9IHRoZSBhZGp1c3RlZCBkYXRlXG4gKi9cbmNvbnN0IGFkZFdlZWtzID0gKF9kYXRlLCBudW1XZWVrcykgPT4gYWRkRGF5cyhfZGF0ZSwgbnVtV2Vla3MgKiA3KTtcblxuLyoqXG4gKiBTdWJ0cmFjdCB3ZWVrcyBmcm9tIGRhdGVcbiAqXG4gKiBAcGFyYW0ge0RhdGV9IF9kYXRlIHRoZSBkYXRlIHRvIGFkanVzdFxuICogQHBhcmFtIHtudW1iZXJ9IG51bVdlZWtzIHRoZSBkaWZmZXJlbmNlIGluIHdlZWtzXG4gKiBAcmV0dXJucyB7RGF0ZX0gdGhlIGFkanVzdGVkIGRhdGVcbiAqL1xuY29uc3Qgc3ViV2Vla3MgPSAoX2RhdGUsIG51bVdlZWtzKSA9PiBhZGRXZWVrcyhfZGF0ZSwgLW51bVdlZWtzKTtcblxuLyoqXG4gKiBTZXQgZGF0ZSB0byB0aGUgc3RhcnQgb2YgdGhlIHdlZWsgKFN1bmRheSlcbiAqXG4gKiBAcGFyYW0ge0RhdGV9IF9kYXRlIHRoZSBkYXRlIHRvIGFkanVzdFxuICogQHJldHVybnMge0RhdGV9IHRoZSBhZGp1c3RlZCBkYXRlXG4gKi9cbmNvbnN0IHN0YXJ0T2ZXZWVrID0gKF9kYXRlKSA9PiB7XG4gIGNvbnN0IGRheU9mV2VlayA9IF9kYXRlLmdldERheSgpO1xuICByZXR1cm4gc3ViRGF5cyhfZGF0ZSwgZGF5T2ZXZWVrKTtcbn07XG5cbi8qKlxuICogU2V0IGRhdGUgdG8gdGhlIGVuZCBvZiB0aGUgd2VlayAoU2F0dXJkYXkpXG4gKlxuICogQHBhcmFtIHtEYXRlfSBfZGF0ZSB0aGUgZGF0ZSB0byBhZGp1c3RcbiAqIEBwYXJhbSB7bnVtYmVyfSBudW1XZWVrcyB0aGUgZGlmZmVyZW5jZSBpbiB3ZWVrc1xuICogQHJldHVybnMge0RhdGV9IHRoZSBhZGp1c3RlZCBkYXRlXG4gKi9cbmNvbnN0IGVuZE9mV2VlayA9IChfZGF0ZSkgPT4ge1xuICBjb25zdCBkYXlPZldlZWsgPSBfZGF0ZS5nZXREYXkoKTtcbiAgcmV0dXJuIGFkZERheXMoX2RhdGUsIDYgLSBkYXlPZldlZWspO1xufTtcblxuLyoqXG4gKiBBZGQgbW9udGhzIHRvIGRhdGUgYW5kIGtlZXAgZGF0ZSB3aXRoaW4gbW9udGhcbiAqXG4gKiBAcGFyYW0ge0RhdGV9IF9kYXRlIHRoZSBkYXRlIHRvIGFkanVzdFxuICogQHBhcmFtIHtudW1iZXJ9IG51bU1vbnRocyB0aGUgZGlmZmVyZW5jZSBpbiBtb250aHNcbiAqIEByZXR1cm5zIHtEYXRlfSB0aGUgYWRqdXN0ZWQgZGF0ZVxuICovXG5jb25zdCBhZGRNb250aHMgPSAoX2RhdGUsIG51bU1vbnRocykgPT4ge1xuICBjb25zdCBuZXdEYXRlID0gbmV3IERhdGUoX2RhdGUuZ2V0VGltZSgpKTtcblxuICBjb25zdCBkYXRlTW9udGggPSAobmV3RGF0ZS5nZXRNb250aCgpICsgMTIgKyBudW1Nb250aHMpICUgMTI7XG4gIG5ld0RhdGUuc2V0TW9udGgobmV3RGF0ZS5nZXRNb250aCgpICsgbnVtTW9udGhzKTtcbiAga2VlcERhdGVXaXRoaW5Nb250aChuZXdEYXRlLCBkYXRlTW9udGgpO1xuXG4gIHJldHVybiBuZXdEYXRlO1xufTtcblxuLyoqXG4gKiBTdWJ0cmFjdCBtb250aHMgZnJvbSBkYXRlXG4gKlxuICogQHBhcmFtIHtEYXRlfSBfZGF0ZSB0aGUgZGF0ZSB0byBhZGp1c3RcbiAqIEBwYXJhbSB7bnVtYmVyfSBudW1Nb250aHMgdGhlIGRpZmZlcmVuY2UgaW4gbW9udGhzXG4gKiBAcmV0dXJucyB7RGF0ZX0gdGhlIGFkanVzdGVkIGRhdGVcbiAqL1xuY29uc3Qgc3ViTW9udGhzID0gKF9kYXRlLCBudW1Nb250aHMpID0+IGFkZE1vbnRocyhfZGF0ZSwgLW51bU1vbnRocyk7XG5cbi8qKlxuICogQWRkIHllYXJzIHRvIGRhdGUgYW5kIGtlZXAgZGF0ZSB3aXRoaW4gbW9udGhcbiAqXG4gKiBAcGFyYW0ge0RhdGV9IF9kYXRlIHRoZSBkYXRlIHRvIGFkanVzdFxuICogQHBhcmFtIHtudW1iZXJ9IG51bVllYXJzIHRoZSBkaWZmZXJlbmNlIGluIHllYXJzXG4gKiBAcmV0dXJucyB7RGF0ZX0gdGhlIGFkanVzdGVkIGRhdGVcbiAqL1xuY29uc3QgYWRkWWVhcnMgPSAoX2RhdGUsIG51bVllYXJzKSA9PiBhZGRNb250aHMoX2RhdGUsIG51bVllYXJzICogMTIpO1xuXG4vKipcbiAqIFN1YnRyYWN0IHllYXJzIGZyb20gZGF0ZVxuICpcbiAqIEBwYXJhbSB7RGF0ZX0gX2RhdGUgdGhlIGRhdGUgdG8gYWRqdXN0XG4gKiBAcGFyYW0ge251bWJlcn0gbnVtWWVhcnMgdGhlIGRpZmZlcmVuY2UgaW4geWVhcnNcbiAqIEByZXR1cm5zIHtEYXRlfSB0aGUgYWRqdXN0ZWQgZGF0ZVxuICovXG5jb25zdCBzdWJZZWFycyA9IChfZGF0ZSwgbnVtWWVhcnMpID0+IGFkZFllYXJzKF9kYXRlLCAtbnVtWWVhcnMpO1xuXG4vKipcbiAqIFNldCBtb250aHMgb2YgZGF0ZVxuICpcbiAqIEBwYXJhbSB7RGF0ZX0gX2RhdGUgdGhlIGRhdGUgdG8gYWRqdXN0XG4gKiBAcGFyYW0ge251bWJlcn0gbW9udGggemVyby1pbmRleGVkIG1vbnRoIHRvIHNldFxuICogQHJldHVybnMge0RhdGV9IHRoZSBhZGp1c3RlZCBkYXRlXG4gKi9cbmNvbnN0IHNldE1vbnRoID0gKF9kYXRlLCBtb250aCkgPT4ge1xuICBjb25zdCBuZXdEYXRlID0gbmV3IERhdGUoX2RhdGUuZ2V0VGltZSgpKTtcblxuICBuZXdEYXRlLnNldE1vbnRoKG1vbnRoKTtcbiAga2VlcERhdGVXaXRoaW5Nb250aChuZXdEYXRlLCBtb250aCk7XG5cbiAgcmV0dXJuIG5ld0RhdGU7XG59O1xuXG4vKipcbiAqIFNldCB5ZWFyIG9mIGRhdGVcbiAqXG4gKiBAcGFyYW0ge0RhdGV9IF9kYXRlIHRoZSBkYXRlIHRvIGFkanVzdFxuICogQHBhcmFtIHtudW1iZXJ9IHllYXIgdGhlIHllYXIgdG8gc2V0XG4gKiBAcmV0dXJucyB7RGF0ZX0gdGhlIGFkanVzdGVkIGRhdGVcbiAqL1xuY29uc3Qgc2V0WWVhciA9IChfZGF0ZSwgeWVhcikgPT4ge1xuICBjb25zdCBuZXdEYXRlID0gbmV3IERhdGUoX2RhdGUuZ2V0VGltZSgpKTtcblxuICBjb25zdCBtb250aCA9IG5ld0RhdGUuZ2V0TW9udGgoKTtcbiAgbmV3RGF0ZS5zZXRGdWxsWWVhcih5ZWFyKTtcbiAga2VlcERhdGVXaXRoaW5Nb250aChuZXdEYXRlLCBtb250aCk7XG5cbiAgcmV0dXJuIG5ld0RhdGU7XG59O1xuXG4vKipcbiAqIFJldHVybiB0aGUgZWFybGllc3QgZGF0ZVxuICpcbiAqIEBwYXJhbSB7RGF0ZX0gZGF0ZUEgZGF0ZSB0byBjb21wYXJlXG4gKiBAcGFyYW0ge0RhdGV9IGRhdGVCIGRhdGUgdG8gY29tcGFyZVxuICogQHJldHVybnMge0RhdGV9IHRoZSBlYXJsaWVzdCBkYXRlXG4gKi9cbmNvbnN0IG1pbiA9IChkYXRlQSwgZGF0ZUIpID0+IHtcbiAgbGV0IG5ld0RhdGUgPSBkYXRlQTtcblxuICBpZiAoZGF0ZUIgPCBkYXRlQSkge1xuICAgIG5ld0RhdGUgPSBkYXRlQjtcbiAgfVxuXG4gIHJldHVybiBuZXcgRGF0ZShuZXdEYXRlLmdldFRpbWUoKSk7XG59O1xuXG4vKipcbiAqIFJldHVybiB0aGUgbGF0ZXN0IGRhdGVcbiAqXG4gKiBAcGFyYW0ge0RhdGV9IGRhdGVBIGRhdGUgdG8gY29tcGFyZVxuICogQHBhcmFtIHtEYXRlfSBkYXRlQiBkYXRlIHRvIGNvbXBhcmVcbiAqIEByZXR1cm5zIHtEYXRlfSB0aGUgbGF0ZXN0IGRhdGVcbiAqL1xuY29uc3QgbWF4ID0gKGRhdGVBLCBkYXRlQikgPT4ge1xuICBsZXQgbmV3RGF0ZSA9IGRhdGVBO1xuXG4gIGlmIChkYXRlQiA+IGRhdGVBKSB7XG4gICAgbmV3RGF0ZSA9IGRhdGVCO1xuICB9XG5cbiAgcmV0dXJuIG5ldyBEYXRlKG5ld0RhdGUuZ2V0VGltZSgpKTtcbn07XG5cbi8qKlxuICogQ2hlY2sgaWYgZGF0ZXMgYXJlIHRoZSBpbiB0aGUgc2FtZSB5ZWFyXG4gKlxuICogQHBhcmFtIHtEYXRlfSBkYXRlQSBkYXRlIHRvIGNvbXBhcmVcbiAqIEBwYXJhbSB7RGF0ZX0gZGF0ZUIgZGF0ZSB0byBjb21wYXJlXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gYXJlIGRhdGVzIGluIHRoZSBzYW1lIHllYXJcbiAqL1xuY29uc3QgaXNTYW1lWWVhciA9IChkYXRlQSwgZGF0ZUIpID0+XG4gIGRhdGVBICYmIGRhdGVCICYmIGRhdGVBLmdldEZ1bGxZZWFyKCkgPT09IGRhdGVCLmdldEZ1bGxZZWFyKCk7XG5cbi8qKlxuICogQ2hlY2sgaWYgZGF0ZXMgYXJlIHRoZSBpbiB0aGUgc2FtZSBtb250aFxuICpcbiAqIEBwYXJhbSB7RGF0ZX0gZGF0ZUEgZGF0ZSB0byBjb21wYXJlXG4gKiBAcGFyYW0ge0RhdGV9IGRhdGVCIGRhdGUgdG8gY29tcGFyZVxuICogQHJldHVybnMge2Jvb2xlYW59IGFyZSBkYXRlcyBpbiB0aGUgc2FtZSBtb250aFxuICovXG5jb25zdCBpc1NhbWVNb250aCA9IChkYXRlQSwgZGF0ZUIpID0+XG4gIGlzU2FtZVllYXIoZGF0ZUEsIGRhdGVCKSAmJiBkYXRlQS5nZXRNb250aCgpID09PSBkYXRlQi5nZXRNb250aCgpO1xuXG4vKipcbiAqIENoZWNrIGlmIGRhdGVzIGFyZSB0aGUgc2FtZSBkYXRlXG4gKlxuICogQHBhcmFtIHtEYXRlfSBkYXRlQSB0aGUgZGF0ZSB0byBjb21wYXJlXG4gKiBAcGFyYW0ge0RhdGV9IGRhdGVBIHRoZSBkYXRlIHRvIGNvbXBhcmVcbiAqIEByZXR1cm5zIHtib29sZWFufSBhcmUgZGF0ZXMgdGhlIHNhbWUgZGF0ZVxuICovXG5jb25zdCBpc1NhbWVEYXkgPSAoZGF0ZUEsIGRhdGVCKSA9PlxuICBpc1NhbWVNb250aChkYXRlQSwgZGF0ZUIpICYmIGRhdGVBLmdldERhdGUoKSA9PT0gZGF0ZUIuZ2V0RGF0ZSgpO1xuXG4vKipcbiAqIHJldHVybiBhIG5ldyBkYXRlIHdpdGhpbiBtaW5pbXVtIGFuZCBtYXhpbXVtIGRhdGVcbiAqXG4gKiBAcGFyYW0ge0RhdGV9IGRhdGUgZGF0ZSB0byBjaGVja1xuICogQHBhcmFtIHtEYXRlfSBtaW5EYXRlIG1pbmltdW0gZGF0ZSB0byBhbGxvd1xuICogQHBhcmFtIHtEYXRlfSBtYXhEYXRlIG1heGltdW0gZGF0ZSB0byBhbGxvd1xuICogQHJldHVybnMge0RhdGV9IHRoZSBkYXRlIGJldHdlZW4gbWluIGFuZCBtYXhcbiAqL1xuY29uc3Qga2VlcERhdGVCZXR3ZWVuTWluQW5kTWF4ID0gKGRhdGUsIG1pbkRhdGUsIG1heERhdGUpID0+IHtcbiAgbGV0IG5ld0RhdGUgPSBkYXRlO1xuXG4gIGlmIChkYXRlIDwgbWluRGF0ZSkge1xuICAgIG5ld0RhdGUgPSBtaW5EYXRlO1xuICB9IGVsc2UgaWYgKG1heERhdGUgJiYgZGF0ZSA+IG1heERhdGUpIHtcbiAgICBuZXdEYXRlID0gbWF4RGF0ZTtcbiAgfVxuXG4gIHJldHVybiBuZXcgRGF0ZShuZXdEYXRlLmdldFRpbWUoKSk7XG59O1xuXG4vKipcbiAqIENoZWNrIGlmIGRhdGVzIGlzIHZhbGlkLlxuICpcbiAqIEBwYXJhbSB7RGF0ZX0gZGF0ZSBkYXRlIHRvIGNoZWNrXG4gKiBAcGFyYW0ge0RhdGV9IG1pbkRhdGUgbWluaW11bSBkYXRlIHRvIGFsbG93XG4gKiBAcGFyYW0ge0RhdGV9IG1heERhdGUgbWF4aW11bSBkYXRlIHRvIGFsbG93XG4gKiBAcmV0dXJuIHtib29sZWFufSBpcyB0aGVyZSBhIGRheSB3aXRoaW4gdGhlIG1vbnRoIHdpdGhpbiBtaW4gYW5kIG1heCBkYXRlc1xuICovXG5jb25zdCBpc0RhdGVXaXRoaW5NaW5BbmRNYXggPSAoZGF0ZSwgbWluRGF0ZSwgbWF4RGF0ZSkgPT5cbiAgZGF0ZSA+PSBtaW5EYXRlICYmICghbWF4RGF0ZSB8fCBkYXRlIDw9IG1heERhdGUpO1xuXG4vKipcbiAqIENoZWNrIGlmIGRhdGVzIG1vbnRoIGlzIGludmFsaWQuXG4gKlxuICogQHBhcmFtIHtEYXRlfSBkYXRlIGRhdGUgdG8gY2hlY2tcbiAqIEBwYXJhbSB7RGF0ZX0gbWluRGF0ZSBtaW5pbXVtIGRhdGUgdG8gYWxsb3dcbiAqIEBwYXJhbSB7RGF0ZX0gbWF4RGF0ZSBtYXhpbXVtIGRhdGUgdG8gYWxsb3dcbiAqIEByZXR1cm4ge2Jvb2xlYW59IGlzIHRoZSBtb250aCBvdXRzaWRlIG1pbiBvciBtYXggZGF0ZXNcbiAqL1xuY29uc3QgaXNEYXRlc01vbnRoT3V0c2lkZU1pbk9yTWF4ID0gKGRhdGUsIG1pbkRhdGUsIG1heERhdGUpID0+XG4gIGxhc3REYXlPZk1vbnRoKGRhdGUpIDwgbWluRGF0ZSB8fCAobWF4RGF0ZSAmJiBzdGFydE9mTW9udGgoZGF0ZSkgPiBtYXhEYXRlKTtcblxuLyoqXG4gKiBDaGVjayBpZiBkYXRlcyB5ZWFyIGlzIGludmFsaWQuXG4gKlxuICogQHBhcmFtIHtEYXRlfSBkYXRlIGRhdGUgdG8gY2hlY2tcbiAqIEBwYXJhbSB7RGF0ZX0gbWluRGF0ZSBtaW5pbXVtIGRhdGUgdG8gYWxsb3dcbiAqIEBwYXJhbSB7RGF0ZX0gbWF4RGF0ZSBtYXhpbXVtIGRhdGUgdG8gYWxsb3dcbiAqIEByZXR1cm4ge2Jvb2xlYW59IGlzIHRoZSBtb250aCBvdXRzaWRlIG1pbiBvciBtYXggZGF0ZXNcbiAqL1xuY29uc3QgaXNEYXRlc1llYXJPdXRzaWRlTWluT3JNYXggPSAoZGF0ZSwgbWluRGF0ZSwgbWF4RGF0ZSkgPT5cbiAgbGFzdERheU9mTW9udGgoc2V0TW9udGgoZGF0ZSwgMTEpKSA8IG1pbkRhdGUgfHxcbiAgKG1heERhdGUgJiYgc3RhcnRPZk1vbnRoKHNldE1vbnRoKGRhdGUsIDApKSA+IG1heERhdGUpO1xuXG4vKipcbiAqIFBhcnNlIGEgZGF0ZSB3aXRoIGZvcm1hdCBNLUQtWVlcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gZGF0ZVN0cmluZyB0aGUgZGF0ZSBzdHJpbmcgdG8gcGFyc2VcbiAqIEBwYXJhbSB7c3RyaW5nfSBkYXRlRm9ybWF0IHRoZSBmb3JtYXQgb2YgdGhlIGRhdGUgc3RyaW5nXG4gKiBAcGFyYW0ge2Jvb2xlYW59IGFkanVzdERhdGUgc2hvdWxkIHRoZSBkYXRlIGJlIGFkanVzdGVkXG4gKiBAcmV0dXJucyB7RGF0ZX0gdGhlIHBhcnNlZCBkYXRlXG4gKi9cbmNvbnN0IHBhcnNlRGF0ZVN0cmluZyA9IChcbiAgZGF0ZVN0cmluZyxcbiAgZGF0ZUZvcm1hdCA9IElOVEVSTkFMX0RBVEVfRk9STUFULFxuICBhZGp1c3REYXRlID0gZmFsc2VcbikgPT4ge1xuICBsZXQgZGF0ZTtcbiAgbGV0IG1vbnRoO1xuICBsZXQgZGF5O1xuICBsZXQgeWVhcjtcbiAgbGV0IHBhcnNlZDtcblxuICBpZiAoZGF0ZVN0cmluZykge1xuICAgIGxldCBtb250aFN0cjtcbiAgICBsZXQgZGF5U3RyO1xuICAgIGxldCB5ZWFyU3RyO1xuXG4gICAgaWYgKGRhdGVGb3JtYXQgPT09IERFRkFVTFRfRVhURVJOQUxfREFURV9GT1JNQVQpIHtcbiAgICAgIFttb250aFN0ciwgZGF5U3RyLCB5ZWFyU3RyXSA9IGRhdGVTdHJpbmcuc3BsaXQoXCIvXCIpO1xuICAgIH0gZWxzZSB7XG4gICAgICBbeWVhclN0ciwgbW9udGhTdHIsIGRheVN0cl0gPSBkYXRlU3RyaW5nLnNwbGl0KFwiLVwiKTtcbiAgICB9XG5cbiAgICBpZiAoeWVhclN0cikge1xuICAgICAgcGFyc2VkID0gcGFyc2VJbnQoeWVhclN0ciwgMTApO1xuICAgICAgaWYgKCFOdW1iZXIuaXNOYU4ocGFyc2VkKSkge1xuICAgICAgICB5ZWFyID0gcGFyc2VkO1xuICAgICAgICBpZiAoYWRqdXN0RGF0ZSkge1xuICAgICAgICAgIHllYXIgPSBNYXRoLm1heCgwLCB5ZWFyKTtcbiAgICAgICAgICBpZiAoeWVhclN0ci5sZW5ndGggPCAzKSB7XG4gICAgICAgICAgICBjb25zdCBjdXJyZW50WWVhciA9IHRvZGF5KCkuZ2V0RnVsbFllYXIoKTtcbiAgICAgICAgICAgIGNvbnN0IGN1cnJlbnRZZWFyU3R1YiA9XG4gICAgICAgICAgICAgIGN1cnJlbnRZZWFyIC0gKGN1cnJlbnRZZWFyICUgMTAgKiogeWVhclN0ci5sZW5ndGgpO1xuICAgICAgICAgICAgeWVhciA9IGN1cnJlbnRZZWFyU3R1YiArIHBhcnNlZDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAobW9udGhTdHIpIHtcbiAgICAgIHBhcnNlZCA9IHBhcnNlSW50KG1vbnRoU3RyLCAxMCk7XG4gICAgICBpZiAoIU51bWJlci5pc05hTihwYXJzZWQpKSB7XG4gICAgICAgIG1vbnRoID0gcGFyc2VkO1xuICAgICAgICBpZiAoYWRqdXN0RGF0ZSkge1xuICAgICAgICAgIG1vbnRoID0gTWF0aC5tYXgoMSwgbW9udGgpO1xuICAgICAgICAgIG1vbnRoID0gTWF0aC5taW4oMTIsIG1vbnRoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChtb250aCAmJiBkYXlTdHIgJiYgeWVhciAhPSBudWxsKSB7XG4gICAgICBwYXJzZWQgPSBwYXJzZUludChkYXlTdHIsIDEwKTtcbiAgICAgIGlmICghTnVtYmVyLmlzTmFOKHBhcnNlZCkpIHtcbiAgICAgICAgZGF5ID0gcGFyc2VkO1xuICAgICAgICBpZiAoYWRqdXN0RGF0ZSkge1xuICAgICAgICAgIGNvbnN0IGxhc3REYXlPZlRoZU1vbnRoID0gc2V0RGF0ZSh5ZWFyLCBtb250aCwgMCkuZ2V0RGF0ZSgpO1xuICAgICAgICAgIGRheSA9IE1hdGgubWF4KDEsIGRheSk7XG4gICAgICAgICAgZGF5ID0gTWF0aC5taW4obGFzdERheU9mVGhlTW9udGgsIGRheSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAobW9udGggJiYgZGF5ICYmIHllYXIgIT0gbnVsbCkge1xuICAgICAgZGF0ZSA9IHNldERhdGUoeWVhciwgbW9udGggLSAxLCBkYXkpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBkYXRlO1xufTtcblxuLyoqXG4gKiBGb3JtYXQgYSBkYXRlIHRvIGZvcm1hdCBNTS1ERC1ZWVlZXG4gKlxuICogQHBhcmFtIHtEYXRlfSBkYXRlIHRoZSBkYXRlIHRvIGZvcm1hdFxuICogQHBhcmFtIHtzdHJpbmd9IGRhdGVGb3JtYXQgdGhlIGZvcm1hdCBvZiB0aGUgZGF0ZSBzdHJpbmdcbiAqIEByZXR1cm5zIHtzdHJpbmd9IHRoZSBmb3JtYXR0ZWQgZGF0ZSBzdHJpbmdcbiAqL1xuY29uc3QgZm9ybWF0RGF0ZSA9IChkYXRlLCBkYXRlRm9ybWF0ID0gSU5URVJOQUxfREFURV9GT1JNQVQpID0+IHtcbiAgY29uc3QgcGFkWmVyb3MgPSAodmFsdWUsIGxlbmd0aCkgPT4gYDAwMDAke3ZhbHVlfWAuc2xpY2UoLWxlbmd0aCk7XG5cbiAgY29uc3QgbW9udGggPSBkYXRlLmdldE1vbnRoKCkgKyAxO1xuICBjb25zdCBkYXkgPSBkYXRlLmdldERhdGUoKTtcbiAgY29uc3QgeWVhciA9IGRhdGUuZ2V0RnVsbFllYXIoKTtcblxuICBpZiAoZGF0ZUZvcm1hdCA9PT0gREVGQVVMVF9FWFRFUk5BTF9EQVRFX0ZPUk1BVCkge1xuICAgIHJldHVybiBbcGFkWmVyb3MobW9udGgsIDIpLCBwYWRaZXJvcyhkYXksIDIpLCBwYWRaZXJvcyh5ZWFyLCA0KV0uam9pbihcIi9cIik7XG4gIH1cblxuICByZXR1cm4gW3BhZFplcm9zKHllYXIsIDQpLCBwYWRaZXJvcyhtb250aCwgMiksIHBhZFplcm9zKGRheSwgMildLmpvaW4oXCItXCIpO1xufTtcblxuLy8gI2VuZHJlZ2lvbiBEYXRlIE1hbmlwdWxhdGlvbiBGdW5jdGlvbnNcblxuLyoqXG4gKiBDcmVhdGUgYSBncmlkIHN0cmluZyBmcm9tIGFuIGFycmF5IG9mIGh0bWwgc3RyaW5nc1xuICpcbiAqIEBwYXJhbSB7c3RyaW5nW119IGh0bWxBcnJheSB0aGUgYXJyYXkgb2YgaHRtbCBpdGVtc1xuICogQHBhcmFtIHtudW1iZXJ9IHJvd1NpemUgdGhlIGxlbmd0aCBvZiBhIHJvd1xuICogQHJldHVybnMge3N0cmluZ30gdGhlIGdyaWQgc3RyaW5nXG4gKi9cbmNvbnN0IGxpc3RUb0dyaWRIdG1sID0gKGh0bWxBcnJheSwgcm93U2l6ZSkgPT4ge1xuICBjb25zdCBncmlkID0gW107XG4gIGxldCByb3cgPSBbXTtcblxuICBsZXQgaSA9IDA7XG4gIHdoaWxlIChpIDwgaHRtbEFycmF5Lmxlbmd0aCkge1xuICAgIHJvdyA9IFtdO1xuXG4gICAgY29uc3QgdHIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwidHJcIik7XG4gICAgd2hpbGUgKGkgPCBodG1sQXJyYXkubGVuZ3RoICYmIHJvdy5sZW5ndGggPCByb3dTaXplKSB7XG4gICAgICBjb25zdCB0ZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJ0ZFwiKTtcbiAgICAgIHRkLmluc2VydEFkamFjZW50RWxlbWVudChcImJlZm9yZWVuZFwiLCBodG1sQXJyYXlbaV0pO1xuICAgICAgcm93LnB1c2godGQpO1xuICAgICAgaSArPSAxO1xuICAgIH1cblxuICAgIHJvdy5mb3JFYWNoKChlbGVtZW50KSA9PiB7XG4gICAgICB0ci5pbnNlcnRBZGphY2VudEVsZW1lbnQoXCJiZWZvcmVlbmRcIiwgZWxlbWVudCk7XG4gICAgfSk7XG5cbiAgICBncmlkLnB1c2godHIpO1xuICB9XG5cbiAgcmV0dXJuIGdyaWQ7XG59O1xuXG5jb25zdCBjcmVhdGVUYWJsZUJvZHkgPSAoZ3JpZCkgPT4ge1xuICBjb25zdCB0YWJsZUJvZHkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwidGJvZHlcIik7XG4gIGdyaWQuZm9yRWFjaCgoZWxlbWVudCkgPT4ge1xuICAgIHRhYmxlQm9keS5pbnNlcnRBZGphY2VudEVsZW1lbnQoXCJiZWZvcmVlbmRcIiwgZWxlbWVudCk7XG4gIH0pO1xuXG4gIHJldHVybiB0YWJsZUJvZHk7XG59O1xuXG4vKipcbiAqIHNldCB0aGUgdmFsdWUgb2YgdGhlIGVsZW1lbnQgYW5kIGRpc3BhdGNoIGEgY2hhbmdlIGV2ZW50XG4gKlxuICogQHBhcmFtIHtIVE1MSW5wdXRFbGVtZW50fSBlbCBUaGUgZWxlbWVudCB0byB1cGRhdGVcbiAqIEBwYXJhbSB7c3RyaW5nfSB2YWx1ZSBUaGUgbmV3IHZhbHVlIG9mIHRoZSBlbGVtZW50XG4gKi9cbmNvbnN0IGNoYW5nZUVsZW1lbnRWYWx1ZSA9IChlbCwgdmFsdWUgPSBcIlwiKSA9PiB7XG4gIGNvbnN0IGVsZW1lbnRUb0NoYW5nZSA9IGVsO1xuICBlbGVtZW50VG9DaGFuZ2UudmFsdWUgPSB2YWx1ZTtcblxuICBjb25zdCBldmVudCA9IG5ldyBDdXN0b21FdmVudChcImNoYW5nZVwiLCB7XG4gICAgYnViYmxlczogdHJ1ZSxcbiAgICBjYW5jZWxhYmxlOiB0cnVlLFxuICAgIGRldGFpbDogeyB2YWx1ZSB9LFxuICB9KTtcbiAgZWxlbWVudFRvQ2hhbmdlLmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xufTtcblxuLyoqXG4gKiBUaGUgcHJvcGVydGllcyBhbmQgZWxlbWVudHMgd2l0aGluIHRoZSBkYXRlIHBpY2tlci5cbiAqIEB0eXBlZGVmIHtPYmplY3R9IERhdGVQaWNrZXJDb250ZXh0XG4gKiBAcHJvcGVydHkge0hUTUxEaXZFbGVtZW50fSBjYWxlbmRhckVsXG4gKiBAcHJvcGVydHkge0hUTUxFbGVtZW50fSBkYXRlUGlja2VyRWxcbiAqIEBwcm9wZXJ0eSB7SFRNTElucHV0RWxlbWVudH0gaW50ZXJuYWxJbnB1dEVsXG4gKiBAcHJvcGVydHkge0hUTUxJbnB1dEVsZW1lbnR9IGV4dGVybmFsSW5wdXRFbFxuICogQHByb3BlcnR5IHtIVE1MRGl2RWxlbWVudH0gc3RhdHVzRWxcbiAqIEBwcm9wZXJ0eSB7SFRNTERpdkVsZW1lbnR9IGZpcnN0WWVhckNodW5rRWxcbiAqIEBwcm9wZXJ0eSB7RGF0ZX0gY2FsZW5kYXJEYXRlXG4gKiBAcHJvcGVydHkge0RhdGV9IG1pbkRhdGVcbiAqIEBwcm9wZXJ0eSB7RGF0ZX0gbWF4RGF0ZVxuICogQHByb3BlcnR5IHtEYXRlfSBzZWxlY3RlZERhdGVcbiAqIEBwcm9wZXJ0eSB7RGF0ZX0gcmFuZ2VEYXRlXG4gKiBAcHJvcGVydHkge0RhdGV9IGRlZmF1bHREYXRlXG4gKi9cblxuLyoqXG4gKiBHZXQgYW4gb2JqZWN0IG9mIHRoZSBwcm9wZXJ0aWVzIGFuZCBlbGVtZW50cyBiZWxvbmdpbmcgZGlyZWN0bHkgdG8gdGhlIGdpdmVuXG4gKiBkYXRlIHBpY2tlciBjb21wb25lbnQuXG4gKlxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWwgdGhlIGVsZW1lbnQgd2l0aGluIHRoZSBkYXRlIHBpY2tlclxuICogQHJldHVybnMge0RhdGVQaWNrZXJDb250ZXh0fSBlbGVtZW50c1xuICovXG5jb25zdCBnZXREYXRlUGlja2VyQ29udGV4dCA9IChlbCkgPT4ge1xuICBjb25zdCBkYXRlUGlja2VyRWwgPSBlbC5jbG9zZXN0KERBVEVfUElDS0VSKTtcblxuICBpZiAoIWRhdGVQaWNrZXJFbCkge1xuICAgIHRocm93IG5ldyBFcnJvcihgRWxlbWVudCBpcyBtaXNzaW5nIG91dGVyICR7REFURV9QSUNLRVJ9YCk7XG4gIH1cblxuICBjb25zdCBpbnRlcm5hbElucHV0RWwgPSBkYXRlUGlja2VyRWwucXVlcnlTZWxlY3RvcihcbiAgICBEQVRFX1BJQ0tFUl9JTlRFUk5BTF9JTlBVVFxuICApO1xuICBjb25zdCBleHRlcm5hbElucHV0RWwgPSBkYXRlUGlja2VyRWwucXVlcnlTZWxlY3RvcihcbiAgICBEQVRFX1BJQ0tFUl9FWFRFUk5BTF9JTlBVVFxuICApO1xuICBjb25zdCBjYWxlbmRhckVsID0gZGF0ZVBpY2tlckVsLnF1ZXJ5U2VsZWN0b3IoREFURV9QSUNLRVJfQ0FMRU5EQVIpO1xuICBjb25zdCB0b2dnbGVCdG5FbCA9IGRhdGVQaWNrZXJFbC5xdWVyeVNlbGVjdG9yKERBVEVfUElDS0VSX0JVVFRPTik7XG4gIGNvbnN0IHN0YXR1c0VsID0gZGF0ZVBpY2tlckVsLnF1ZXJ5U2VsZWN0b3IoREFURV9QSUNLRVJfU1RBVFVTKTtcbiAgY29uc3QgZmlyc3RZZWFyQ2h1bmtFbCA9IGRhdGVQaWNrZXJFbC5xdWVyeVNlbGVjdG9yKENBTEVOREFSX1lFQVIpO1xuXG4gIGNvbnN0IGlucHV0RGF0ZSA9IHBhcnNlRGF0ZVN0cmluZyhcbiAgICBleHRlcm5hbElucHV0RWwudmFsdWUsXG4gICAgREVGQVVMVF9FWFRFUk5BTF9EQVRFX0ZPUk1BVCxcbiAgICB0cnVlXG4gICk7XG4gIGNvbnN0IHNlbGVjdGVkRGF0ZSA9IHBhcnNlRGF0ZVN0cmluZyhpbnRlcm5hbElucHV0RWwudmFsdWUpO1xuXG4gIGNvbnN0IGNhbGVuZGFyRGF0ZSA9IHBhcnNlRGF0ZVN0cmluZyhjYWxlbmRhckVsLmRhdGFzZXQudmFsdWUpO1xuICBjb25zdCBtaW5EYXRlID0gcGFyc2VEYXRlU3RyaW5nKGRhdGVQaWNrZXJFbC5kYXRhc2V0Lm1pbkRhdGUpO1xuICBjb25zdCBtYXhEYXRlID0gcGFyc2VEYXRlU3RyaW5nKGRhdGVQaWNrZXJFbC5kYXRhc2V0Lm1heERhdGUpO1xuICBjb25zdCByYW5nZURhdGUgPSBwYXJzZURhdGVTdHJpbmcoZGF0ZVBpY2tlckVsLmRhdGFzZXQucmFuZ2VEYXRlKTtcbiAgY29uc3QgZGVmYXVsdERhdGUgPSBwYXJzZURhdGVTdHJpbmcoZGF0ZVBpY2tlckVsLmRhdGFzZXQuZGVmYXVsdERhdGUpO1xuXG4gIGlmIChtaW5EYXRlICYmIG1heERhdGUgJiYgbWluRGF0ZSA+IG1heERhdGUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJNaW5pbXVtIGRhdGUgY2Fubm90IGJlIGFmdGVyIG1heGltdW0gZGF0ZVwiKTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgY2FsZW5kYXJEYXRlLFxuICAgIG1pbkRhdGUsXG4gICAgdG9nZ2xlQnRuRWwsXG4gICAgc2VsZWN0ZWREYXRlLFxuICAgIG1heERhdGUsXG4gICAgZmlyc3RZZWFyQ2h1bmtFbCxcbiAgICBkYXRlUGlja2VyRWwsXG4gICAgaW5wdXREYXRlLFxuICAgIGludGVybmFsSW5wdXRFbCxcbiAgICBleHRlcm5hbElucHV0RWwsXG4gICAgY2FsZW5kYXJFbCxcbiAgICByYW5nZURhdGUsXG4gICAgZGVmYXVsdERhdGUsXG4gICAgc3RhdHVzRWwsXG4gIH07XG59O1xuXG4vKipcbiAqIERpc2FibGUgdGhlIGRhdGUgcGlja2VyIGNvbXBvbmVudFxuICpcbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsIEFuIGVsZW1lbnQgd2l0aGluIHRoZSBkYXRlIHBpY2tlciBjb21wb25lbnRcbiAqL1xuY29uc3QgZGlzYWJsZSA9IChlbCkgPT4ge1xuICBjb25zdCB7IGV4dGVybmFsSW5wdXRFbCwgdG9nZ2xlQnRuRWwgfSA9IGdldERhdGVQaWNrZXJDb250ZXh0KGVsKTtcblxuICB0b2dnbGVCdG5FbC5kaXNhYmxlZCA9IHRydWU7XG4gIGV4dGVybmFsSW5wdXRFbC5kaXNhYmxlZCA9IHRydWU7XG59O1xuXG4vKipcbiAqIEVuYWJsZSB0aGUgZGF0ZSBwaWNrZXIgY29tcG9uZW50XG4gKlxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWwgQW4gZWxlbWVudCB3aXRoaW4gdGhlIGRhdGUgcGlja2VyIGNvbXBvbmVudFxuICovXG5jb25zdCBlbmFibGUgPSAoZWwpID0+IHtcbiAgY29uc3QgeyBleHRlcm5hbElucHV0RWwsIHRvZ2dsZUJ0bkVsIH0gPSBnZXREYXRlUGlja2VyQ29udGV4dChlbCk7XG5cbiAgdG9nZ2xlQnRuRWwuZGlzYWJsZWQgPSBmYWxzZTtcbiAgZXh0ZXJuYWxJbnB1dEVsLmRpc2FibGVkID0gZmFsc2U7XG59O1xuXG4vLyAjcmVnaW9uIFZhbGlkYXRpb25cblxuLyoqXG4gKiBWYWxpZGF0ZSB0aGUgdmFsdWUgaW4gdGhlIGlucHV0IGFzIGEgdmFsaWQgZGF0ZSBvZiBmb3JtYXQgTS9EL1lZWVlcbiAqXG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbCBBbiBlbGVtZW50IHdpdGhpbiB0aGUgZGF0ZSBwaWNrZXIgY29tcG9uZW50XG4gKi9cbmNvbnN0IGlzRGF0ZUlucHV0SW52YWxpZCA9IChlbCkgPT4ge1xuICBjb25zdCB7IGV4dGVybmFsSW5wdXRFbCwgbWluRGF0ZSwgbWF4RGF0ZSB9ID0gZ2V0RGF0ZVBpY2tlckNvbnRleHQoZWwpO1xuXG4gIGNvbnN0IGRhdGVTdHJpbmcgPSBleHRlcm5hbElucHV0RWwudmFsdWU7XG4gIGxldCBpc0ludmFsaWQgPSBmYWxzZTtcblxuICBpZiAoZGF0ZVN0cmluZykge1xuICAgIGlzSW52YWxpZCA9IHRydWU7XG5cbiAgICBjb25zdCBkYXRlU3RyaW5nUGFydHMgPSBkYXRlU3RyaW5nLnNwbGl0KFwiL1wiKTtcbiAgICBjb25zdCBbbW9udGgsIGRheSwgeWVhcl0gPSBkYXRlU3RyaW5nUGFydHMubWFwKChzdHIpID0+IHtcbiAgICAgIGxldCB2YWx1ZTtcbiAgICAgIGNvbnN0IHBhcnNlZCA9IHBhcnNlSW50KHN0ciwgMTApO1xuICAgICAgaWYgKCFOdW1iZXIuaXNOYU4ocGFyc2VkKSkgdmFsdWUgPSBwYXJzZWQ7XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfSk7XG5cbiAgICBpZiAobW9udGggJiYgZGF5ICYmIHllYXIgIT0gbnVsbCkge1xuICAgICAgY29uc3QgY2hlY2tEYXRlID0gc2V0RGF0ZSh5ZWFyLCBtb250aCAtIDEsIGRheSk7XG5cbiAgICAgIGlmIChcbiAgICAgICAgY2hlY2tEYXRlLmdldE1vbnRoKCkgPT09IG1vbnRoIC0gMSAmJlxuICAgICAgICBjaGVja0RhdGUuZ2V0RGF0ZSgpID09PSBkYXkgJiZcbiAgICAgICAgY2hlY2tEYXRlLmdldEZ1bGxZZWFyKCkgPT09IHllYXIgJiZcbiAgICAgICAgZGF0ZVN0cmluZ1BhcnRzWzJdLmxlbmd0aCA9PT0gNCAmJlxuICAgICAgICBpc0RhdGVXaXRoaW5NaW5BbmRNYXgoY2hlY2tEYXRlLCBtaW5EYXRlLCBtYXhEYXRlKVxuICAgICAgKSB7XG4gICAgICAgIGlzSW52YWxpZCA9IGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBpc0ludmFsaWQ7XG59O1xuXG4vKipcbiAqIFZhbGlkYXRlIHRoZSB2YWx1ZSBpbiB0aGUgaW5wdXQgYXMgYSB2YWxpZCBkYXRlIG9mIGZvcm1hdCBNL0QvWVlZWVxuICpcbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsIEFuIGVsZW1lbnQgd2l0aGluIHRoZSBkYXRlIHBpY2tlciBjb21wb25lbnRcbiAqL1xuY29uc3QgdmFsaWRhdGVEYXRlSW5wdXQgPSAoZWwpID0+IHtcbiAgY29uc3QgeyBleHRlcm5hbElucHV0RWwgfSA9IGdldERhdGVQaWNrZXJDb250ZXh0KGVsKTtcbiAgY29uc3QgaXNJbnZhbGlkID0gaXNEYXRlSW5wdXRJbnZhbGlkKGV4dGVybmFsSW5wdXRFbCk7XG5cbiAgaWYgKGlzSW52YWxpZCAmJiAhZXh0ZXJuYWxJbnB1dEVsLnZhbGlkYXRpb25NZXNzYWdlKSB7XG4gICAgZXh0ZXJuYWxJbnB1dEVsLnNldEN1c3RvbVZhbGlkaXR5KFZBTElEQVRJT05fTUVTU0FHRSk7XG4gIH1cblxuICBpZiAoIWlzSW52YWxpZCAmJiBleHRlcm5hbElucHV0RWwudmFsaWRhdGlvbk1lc3NhZ2UgPT09IFZBTElEQVRJT05fTUVTU0FHRSkge1xuICAgIGV4dGVybmFsSW5wdXRFbC5zZXRDdXN0b21WYWxpZGl0eShcIlwiKTtcbiAgfVxufTtcblxuLy8gI2VuZHJlZ2lvbiBWYWxpZGF0aW9uXG5cbi8qKlxuICogRW5hYmxlIHRoZSBkYXRlIHBpY2tlciBjb21wb25lbnRcbiAqXG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbCBBbiBlbGVtZW50IHdpdGhpbiB0aGUgZGF0ZSBwaWNrZXIgY29tcG9uZW50XG4gKi9cbmNvbnN0IHJlY29uY2lsZUlucHV0VmFsdWVzID0gKGVsKSA9PiB7XG4gIGNvbnN0IHsgaW50ZXJuYWxJbnB1dEVsLCBpbnB1dERhdGUgfSA9IGdldERhdGVQaWNrZXJDb250ZXh0KGVsKTtcbiAgbGV0IG5ld1ZhbHVlID0gXCJcIjtcblxuICBpZiAoaW5wdXREYXRlICYmICFpc0RhdGVJbnB1dEludmFsaWQoZWwpKSB7XG4gICAgbmV3VmFsdWUgPSBmb3JtYXREYXRlKGlucHV0RGF0ZSk7XG4gIH1cblxuICBpZiAoaW50ZXJuYWxJbnB1dEVsLnZhbHVlICE9PSBuZXdWYWx1ZSkge1xuICAgIGNoYW5nZUVsZW1lbnRWYWx1ZShpbnRlcm5hbElucHV0RWwsIG5ld1ZhbHVlKTtcbiAgfVxufTtcblxuLyoqXG4gKiBTZWxlY3QgdGhlIHZhbHVlIG9mIHRoZSBkYXRlIHBpY2tlciBpbnB1dHMuXG4gKlxuICogQHBhcmFtIHtIVE1MQnV0dG9uRWxlbWVudH0gZWwgQW4gZWxlbWVudCB3aXRoaW4gdGhlIGRhdGUgcGlja2VyIGNvbXBvbmVudFxuICogQHBhcmFtIHtzdHJpbmd9IGRhdGVTdHJpbmcgVGhlIGRhdGUgc3RyaW5nIHRvIHVwZGF0ZSBpbiBZWVlZLU1NLUREIGZvcm1hdFxuICovXG5jb25zdCBzZXRDYWxlbmRhclZhbHVlID0gKGVsLCBkYXRlU3RyaW5nKSA9PiB7XG4gIGNvbnN0IHBhcnNlZERhdGUgPSBwYXJzZURhdGVTdHJpbmcoZGF0ZVN0cmluZyk7XG5cbiAgaWYgKHBhcnNlZERhdGUpIHtcbiAgICBjb25zdCBmb3JtYXR0ZWREYXRlID0gZm9ybWF0RGF0ZShwYXJzZWREYXRlLCBERUZBVUxUX0VYVEVSTkFMX0RBVEVfRk9STUFUKTtcblxuICAgIGNvbnN0IHsgZGF0ZVBpY2tlckVsLCBpbnRlcm5hbElucHV0RWwsIGV4dGVybmFsSW5wdXRFbCB9ID1cbiAgICAgIGdldERhdGVQaWNrZXJDb250ZXh0KGVsKTtcblxuICAgIGNoYW5nZUVsZW1lbnRWYWx1ZShpbnRlcm5hbElucHV0RWwsIGRhdGVTdHJpbmcpO1xuICAgIGNoYW5nZUVsZW1lbnRWYWx1ZShleHRlcm5hbElucHV0RWwsIGZvcm1hdHRlZERhdGUpO1xuXG4gICAgdmFsaWRhdGVEYXRlSW5wdXQoZGF0ZVBpY2tlckVsKTtcbiAgfVxufTtcblxuLyoqXG4gKiBFbmhhbmNlIGFuIGlucHV0IHdpdGggdGhlIGRhdGUgcGlja2VyIGVsZW1lbnRzXG4gKlxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWwgVGhlIGluaXRpYWwgd3JhcHBpbmcgZWxlbWVudCBvZiB0aGUgZGF0ZSBwaWNrZXIgY29tcG9uZW50XG4gKi9cbmNvbnN0IGVuaGFuY2VEYXRlUGlja2VyID0gKGVsKSA9PiB7XG4gIGNvbnN0IGRhdGVQaWNrZXJFbCA9IGVsLmNsb3Nlc3QoREFURV9QSUNLRVIpO1xuICBjb25zdCB7IGRlZmF1bHRWYWx1ZSB9ID0gZGF0ZVBpY2tlckVsLmRhdGFzZXQ7XG5cbiAgY29uc3QgaW50ZXJuYWxJbnB1dEVsID0gZGF0ZVBpY2tlckVsLnF1ZXJ5U2VsZWN0b3IoYGlucHV0YCk7XG5cbiAgaWYgKCFpbnRlcm5hbElucHV0RWwpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYCR7REFURV9QSUNLRVJ9IGlzIG1pc3NpbmcgaW5uZXIgaW5wdXRgKTtcbiAgfVxuXG4gIGlmIChpbnRlcm5hbElucHV0RWwudmFsdWUpIHtcbiAgICBpbnRlcm5hbElucHV0RWwudmFsdWUgPSBcIlwiO1xuICB9XG5cbiAgY29uc3QgbWluRGF0ZSA9IHBhcnNlRGF0ZVN0cmluZyhcbiAgICBkYXRlUGlja2VyRWwuZGF0YXNldC5taW5EYXRlIHx8IGludGVybmFsSW5wdXRFbC5nZXRBdHRyaWJ1dGUoXCJtaW5cIilcbiAgKTtcbiAgZGF0ZVBpY2tlckVsLmRhdGFzZXQubWluRGF0ZSA9IG1pbkRhdGVcbiAgICA/IGZvcm1hdERhdGUobWluRGF0ZSlcbiAgICA6IERFRkFVTFRfTUlOX0RBVEU7XG5cbiAgY29uc3QgbWF4RGF0ZSA9IHBhcnNlRGF0ZVN0cmluZyhcbiAgICBkYXRlUGlja2VyRWwuZGF0YXNldC5tYXhEYXRlIHx8IGludGVybmFsSW5wdXRFbC5nZXRBdHRyaWJ1dGUoXCJtYXhcIilcbiAgKTtcbiAgaWYgKG1heERhdGUpIHtcbiAgICBkYXRlUGlja2VyRWwuZGF0YXNldC5tYXhEYXRlID0gZm9ybWF0RGF0ZShtYXhEYXRlKTtcbiAgfVxuXG4gIGNvbnN0IGNhbGVuZGFyV3JhcHBlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gIGNhbGVuZGFyV3JhcHBlci5jbGFzc0xpc3QuYWRkKERBVEVfUElDS0VSX1dSQVBQRVJfQ0xBU1MpO1xuXG4gIGNvbnN0IGV4dGVybmFsSW5wdXRFbCA9IGludGVybmFsSW5wdXRFbC5jbG9uZU5vZGUoKTtcbiAgZXh0ZXJuYWxJbnB1dEVsLmNsYXNzTGlzdC5hZGQoREFURV9QSUNLRVJfRVhURVJOQUxfSU5QVVRfQ0xBU1MpO1xuICBleHRlcm5hbElucHV0RWwudHlwZSA9IFwidGV4dFwiO1xuXG4gIGNhbGVuZGFyV3JhcHBlci5hcHBlbmRDaGlsZChleHRlcm5hbElucHV0RWwpO1xuICBjYWxlbmRhcldyYXBwZXIuaW5zZXJ0QWRqYWNlbnRIVE1MKFxuICAgIFwiYmVmb3JlZW5kXCIsXG4gICAgU2FuaXRpemVyLmVzY2FwZUhUTUxgXG4gICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCIke0RBVEVfUElDS0VSX0JVVFRPTl9DTEFTU31cIiBhcmlhLWhhc3BvcHVwPVwidHJ1ZVwiIGFyaWEtbGFiZWw9XCJUb2dnbGUgY2FsZW5kYXJcIj48L2J1dHRvbj5cbiAgICA8ZGl2IGNsYXNzPVwiJHtEQVRFX1BJQ0tFUl9DQUxFTkRBUl9DTEFTU31cIiByb2xlPVwiZGlhbG9nXCIgYXJpYS1tb2RhbD1cInRydWVcIiBoaWRkZW4+PC9kaXY+XG4gICAgPGRpdiBjbGFzcz1cInVzYS1zci1vbmx5ICR7REFURV9QSUNLRVJfU1RBVFVTX0NMQVNTfVwiIHJvbGU9XCJzdGF0dXNcIiBhcmlhLWxpdmU9XCJwb2xpdGVcIj48L2Rpdj5gXG4gICk7XG5cbiAgaW50ZXJuYWxJbnB1dEVsLnNldEF0dHJpYnV0ZShcImFyaWEtaGlkZGVuXCIsIFwidHJ1ZVwiKTtcbiAgaW50ZXJuYWxJbnB1dEVsLnNldEF0dHJpYnV0ZShcInRhYmluZGV4XCIsIFwiLTFcIik7XG4gIGludGVybmFsSW5wdXRFbC5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gIGludGVybmFsSW5wdXRFbC5jbGFzc0xpc3QuYWRkKERBVEVfUElDS0VSX0lOVEVSTkFMX0lOUFVUX0NMQVNTKTtcbiAgaW50ZXJuYWxJbnB1dEVsLnJlbW92ZUF0dHJpYnV0ZShcImlkXCIpO1xuICBpbnRlcm5hbElucHV0RWwucmVtb3ZlQXR0cmlidXRlKFwibmFtZVwiKTtcbiAgaW50ZXJuYWxJbnB1dEVsLnJlcXVpcmVkID0gZmFsc2U7XG5cbiAgZGF0ZVBpY2tlckVsLmFwcGVuZENoaWxkKGNhbGVuZGFyV3JhcHBlcik7XG4gIGRhdGVQaWNrZXJFbC5jbGFzc0xpc3QuYWRkKERBVEVfUElDS0VSX0lOSVRJQUxJWkVEX0NMQVNTKTtcblxuICBpZiAoZGVmYXVsdFZhbHVlKSB7XG4gICAgc2V0Q2FsZW5kYXJWYWx1ZShkYXRlUGlja2VyRWwsIGRlZmF1bHRWYWx1ZSk7XG4gIH1cblxuICBpZiAoaW50ZXJuYWxJbnB1dEVsLmRpc2FibGVkKSB7XG4gICAgZGlzYWJsZShkYXRlUGlja2VyRWwpO1xuICAgIGludGVybmFsSW5wdXRFbC5kaXNhYmxlZCA9IGZhbHNlO1xuICB9XG59O1xuXG4vLyAjcmVnaW9uIENhbGVuZGFyIC0gRGF0ZSBTZWxlY3Rpb24gVmlld1xuXG4vKipcbiAqIHJlbmRlciB0aGUgY2FsZW5kYXIuXG4gKlxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWwgQW4gZWxlbWVudCB3aXRoaW4gdGhlIGRhdGUgcGlja2VyIGNvbXBvbmVudFxuICogQHBhcmFtIHtEYXRlfSBfZGF0ZVRvRGlzcGxheSBhIGRhdGUgdG8gcmVuZGVyIG9uIHRoZSBjYWxlbmRhclxuICogQHJldHVybnMge0hUTUxFbGVtZW50fSBhIHJlZmVyZW5jZSB0byB0aGUgbmV3IGNhbGVuZGFyIGVsZW1lbnRcbiAqL1xuY29uc3QgcmVuZGVyQ2FsZW5kYXIgPSAoZWwsIF9kYXRlVG9EaXNwbGF5KSA9PiB7XG4gIGNvbnN0IHtcbiAgICBkYXRlUGlja2VyRWwsXG4gICAgY2FsZW5kYXJFbCxcbiAgICBzdGF0dXNFbCxcbiAgICBzZWxlY3RlZERhdGUsXG4gICAgbWF4RGF0ZSxcbiAgICBtaW5EYXRlLFxuICAgIHJhbmdlRGF0ZSxcbiAgfSA9IGdldERhdGVQaWNrZXJDb250ZXh0KGVsKTtcbiAgY29uc3QgdG9kYXlzRGF0ZSA9IHRvZGF5KCk7XG4gIGxldCBkYXRlVG9EaXNwbGF5ID0gX2RhdGVUb0Rpc3BsYXkgfHwgdG9kYXlzRGF0ZTtcblxuICBjb25zdCBjYWxlbmRhcldhc0hpZGRlbiA9IGNhbGVuZGFyRWwuaGlkZGVuO1xuXG4gIGNvbnN0IGZvY3VzZWREYXRlID0gYWRkRGF5cyhkYXRlVG9EaXNwbGF5LCAwKTtcbiAgY29uc3QgZm9jdXNlZE1vbnRoID0gZGF0ZVRvRGlzcGxheS5nZXRNb250aCgpO1xuICBjb25zdCBmb2N1c2VkWWVhciA9IGRhdGVUb0Rpc3BsYXkuZ2V0RnVsbFllYXIoKTtcblxuICBjb25zdCBwcmV2TW9udGggPSBzdWJNb250aHMoZGF0ZVRvRGlzcGxheSwgMSk7XG4gIGNvbnN0IG5leHRNb250aCA9IGFkZE1vbnRocyhkYXRlVG9EaXNwbGF5LCAxKTtcblxuICBjb25zdCBjdXJyZW50Rm9ybWF0dGVkRGF0ZSA9IGZvcm1hdERhdGUoZGF0ZVRvRGlzcGxheSk7XG5cbiAgY29uc3QgZmlyc3RPZk1vbnRoID0gc3RhcnRPZk1vbnRoKGRhdGVUb0Rpc3BsYXkpO1xuICBjb25zdCBwcmV2QnV0dG9uc0Rpc2FibGVkID0gaXNTYW1lTW9udGgoZGF0ZVRvRGlzcGxheSwgbWluRGF0ZSk7XG4gIGNvbnN0IG5leHRCdXR0b25zRGlzYWJsZWQgPSBpc1NhbWVNb250aChkYXRlVG9EaXNwbGF5LCBtYXhEYXRlKTtcblxuICBjb25zdCByYW5nZUNvbmNsdXNpb25EYXRlID0gc2VsZWN0ZWREYXRlIHx8IGRhdGVUb0Rpc3BsYXk7XG4gIGNvbnN0IHJhbmdlU3RhcnREYXRlID0gcmFuZ2VEYXRlICYmIG1pbihyYW5nZUNvbmNsdXNpb25EYXRlLCByYW5nZURhdGUpO1xuICBjb25zdCByYW5nZUVuZERhdGUgPSByYW5nZURhdGUgJiYgbWF4KHJhbmdlQ29uY2x1c2lvbkRhdGUsIHJhbmdlRGF0ZSk7XG5cbiAgY29uc3Qgd2l0aGluUmFuZ2VTdGFydERhdGUgPSByYW5nZURhdGUgJiYgYWRkRGF5cyhyYW5nZVN0YXJ0RGF0ZSwgMSk7XG4gIGNvbnN0IHdpdGhpblJhbmdlRW5kRGF0ZSA9IHJhbmdlRGF0ZSAmJiBzdWJEYXlzKHJhbmdlRW5kRGF0ZSwgMSk7XG5cbiAgY29uc3QgbW9udGhMYWJlbCA9IE1PTlRIX0xBQkVMU1tmb2N1c2VkTW9udGhdO1xuXG4gIGNvbnN0IGdlbmVyYXRlRGF0ZUh0bWwgPSAoZGF0ZVRvUmVuZGVyKSA9PiB7XG4gICAgY29uc3QgY2xhc3NlcyA9IFtDQUxFTkRBUl9EQVRFX0NMQVNTXTtcbiAgICBjb25zdCBkYXkgPSBkYXRlVG9SZW5kZXIuZ2V0RGF0ZSgpO1xuICAgIGNvbnN0IG1vbnRoID0gZGF0ZVRvUmVuZGVyLmdldE1vbnRoKCk7XG4gICAgY29uc3QgeWVhciA9IGRhdGVUb1JlbmRlci5nZXRGdWxsWWVhcigpO1xuICAgIGNvbnN0IGRheU9mV2VlayA9IGRhdGVUb1JlbmRlci5nZXREYXkoKTtcblxuICAgIGNvbnN0IGZvcm1hdHRlZERhdGUgPSBmb3JtYXREYXRlKGRhdGVUb1JlbmRlcik7XG5cbiAgICBsZXQgdGFiaW5kZXggPSBcIi0xXCI7XG5cbiAgICBjb25zdCBpc0Rpc2FibGVkID0gIWlzRGF0ZVdpdGhpbk1pbkFuZE1heChkYXRlVG9SZW5kZXIsIG1pbkRhdGUsIG1heERhdGUpO1xuICAgIGNvbnN0IGlzU2VsZWN0ZWQgPSBpc1NhbWVEYXkoZGF0ZVRvUmVuZGVyLCBzZWxlY3RlZERhdGUpO1xuXG4gICAgaWYgKGlzU2FtZU1vbnRoKGRhdGVUb1JlbmRlciwgcHJldk1vbnRoKSkge1xuICAgICAgY2xhc3Nlcy5wdXNoKENBTEVOREFSX0RBVEVfUFJFVklPVVNfTU9OVEhfQ0xBU1MpO1xuICAgIH1cblxuICAgIGlmIChpc1NhbWVNb250aChkYXRlVG9SZW5kZXIsIGZvY3VzZWREYXRlKSkge1xuICAgICAgY2xhc3Nlcy5wdXNoKENBTEVOREFSX0RBVEVfQ1VSUkVOVF9NT05USF9DTEFTUyk7XG4gICAgfVxuXG4gICAgaWYgKGlzU2FtZU1vbnRoKGRhdGVUb1JlbmRlciwgbmV4dE1vbnRoKSkge1xuICAgICAgY2xhc3Nlcy5wdXNoKENBTEVOREFSX0RBVEVfTkVYVF9NT05USF9DTEFTUyk7XG4gICAgfVxuXG4gICAgaWYgKGlzU2VsZWN0ZWQpIHtcbiAgICAgIGNsYXNzZXMucHVzaChDQUxFTkRBUl9EQVRFX1NFTEVDVEVEX0NMQVNTKTtcbiAgICB9XG5cbiAgICBpZiAoaXNTYW1lRGF5KGRhdGVUb1JlbmRlciwgdG9kYXlzRGF0ZSkpIHtcbiAgICAgIGNsYXNzZXMucHVzaChDQUxFTkRBUl9EQVRFX1RPREFZX0NMQVNTKTtcbiAgICB9XG5cbiAgICBpZiAocmFuZ2VEYXRlKSB7XG4gICAgICBpZiAoaXNTYW1lRGF5KGRhdGVUb1JlbmRlciwgcmFuZ2VEYXRlKSkge1xuICAgICAgICBjbGFzc2VzLnB1c2goQ0FMRU5EQVJfREFURV9SQU5HRV9EQVRFX0NMQVNTKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGlzU2FtZURheShkYXRlVG9SZW5kZXIsIHJhbmdlU3RhcnREYXRlKSkge1xuICAgICAgICBjbGFzc2VzLnB1c2goQ0FMRU5EQVJfREFURV9SQU5HRV9EQVRFX1NUQVJUX0NMQVNTKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGlzU2FtZURheShkYXRlVG9SZW5kZXIsIHJhbmdlRW5kRGF0ZSkpIHtcbiAgICAgICAgY2xhc3Nlcy5wdXNoKENBTEVOREFSX0RBVEVfUkFOR0VfREFURV9FTkRfQ0xBU1MpO1xuICAgICAgfVxuXG4gICAgICBpZiAoXG4gICAgICAgIGlzRGF0ZVdpdGhpbk1pbkFuZE1heChcbiAgICAgICAgICBkYXRlVG9SZW5kZXIsXG4gICAgICAgICAgd2l0aGluUmFuZ2VTdGFydERhdGUsXG4gICAgICAgICAgd2l0aGluUmFuZ2VFbmREYXRlXG4gICAgICAgIClcbiAgICAgICkge1xuICAgICAgICBjbGFzc2VzLnB1c2goQ0FMRU5EQVJfREFURV9XSVRISU5fUkFOR0VfQ0xBU1MpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChpc1NhbWVEYXkoZGF0ZVRvUmVuZGVyLCBmb2N1c2VkRGF0ZSkpIHtcbiAgICAgIHRhYmluZGV4ID0gXCIwXCI7XG4gICAgICBjbGFzc2VzLnB1c2goQ0FMRU5EQVJfREFURV9GT0NVU0VEX0NMQVNTKTtcbiAgICB9XG5cbiAgICBjb25zdCBtb250aFN0ciA9IE1PTlRIX0xBQkVMU1ttb250aF07XG4gICAgY29uc3QgZGF5U3RyID0gREFZX09GX1dFRUtfTEFCRUxTW2RheU9mV2Vla107XG5cbiAgICBjb25zdCBidG4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYnV0dG9uXCIpO1xuICAgIGJ0bi5zZXRBdHRyaWJ1dGUoXCJ0eXBlXCIsIFwiYnV0dG9uXCIpO1xuICAgIGJ0bi5zZXRBdHRyaWJ1dGUoXCJ0YWJpbmRleFwiLCB0YWJpbmRleCk7XG4gICAgYnRuLnNldEF0dHJpYnV0ZShcImNsYXNzXCIsIGNsYXNzZXMuam9pbihcIiBcIikpO1xuICAgIGJ0bi5zZXRBdHRyaWJ1dGUoXCJkYXRhLWRheVwiLCBkYXkpO1xuICAgIGJ0bi5zZXRBdHRyaWJ1dGUoXCJkYXRhLW1vbnRoXCIsIG1vbnRoICsgMSk7XG4gICAgYnRuLnNldEF0dHJpYnV0ZShcImRhdGEteWVhclwiLCB5ZWFyKTtcbiAgICBidG4uc2V0QXR0cmlidXRlKFwiZGF0YS12YWx1ZVwiLCBmb3JtYXR0ZWREYXRlKTtcbiAgICBidG4uc2V0QXR0cmlidXRlKFxuICAgICAgXCJhcmlhLWxhYmVsXCIsXG4gICAgICBTYW5pdGl6ZXIuZXNjYXBlSFRNTGAke2RheX0gJHttb250aFN0cn0gJHt5ZWFyfSAke2RheVN0cn1gXG4gICAgKTtcbiAgICBidG4uc2V0QXR0cmlidXRlKFwiYXJpYS1zZWxlY3RlZFwiLCBpc1NlbGVjdGVkID8gXCJ0cnVlXCIgOiBcImZhbHNlXCIpO1xuICAgIGlmIChpc0Rpc2FibGVkID09PSB0cnVlKSB7XG4gICAgICBidG4uZGlzYWJsZWQgPSB0cnVlO1xuICAgIH1cbiAgICBidG4udGV4dENvbnRlbnQgPSBkYXk7XG5cbiAgICByZXR1cm4gYnRuO1xuICB9O1xuXG4gIC8vIHNldCBkYXRlIHRvIGZpcnN0IHJlbmRlcmVkIGRheVxuICBkYXRlVG9EaXNwbGF5ID0gc3RhcnRPZldlZWsoZmlyc3RPZk1vbnRoKTtcblxuICBjb25zdCBkYXlzID0gW107XG5cbiAgd2hpbGUgKFxuICAgIGRheXMubGVuZ3RoIDwgMjggfHxcbiAgICBkYXRlVG9EaXNwbGF5LmdldE1vbnRoKCkgPT09IGZvY3VzZWRNb250aCB8fFxuICAgIGRheXMubGVuZ3RoICUgNyAhPT0gMFxuICApIHtcbiAgICBkYXlzLnB1c2goZ2VuZXJhdGVEYXRlSHRtbChkYXRlVG9EaXNwbGF5KSk7XG4gICAgZGF0ZVRvRGlzcGxheSA9IGFkZERheXMoZGF0ZVRvRGlzcGxheSwgMSk7XG4gIH1cblxuICBjb25zdCBkYXRlc0dyaWQgPSBsaXN0VG9HcmlkSHRtbChkYXlzLCA3KTtcblxuICBjb25zdCBuZXdDYWxlbmRhciA9IGNhbGVuZGFyRWwuY2xvbmVOb2RlKCk7XG4gIG5ld0NhbGVuZGFyLmRhdGFzZXQudmFsdWUgPSBjdXJyZW50Rm9ybWF0dGVkRGF0ZTtcbiAgbmV3Q2FsZW5kYXIuc3R5bGUudG9wID0gYCR7ZGF0ZVBpY2tlckVsLm9mZnNldEhlaWdodH1weGA7XG4gIG5ld0NhbGVuZGFyLmhpZGRlbiA9IGZhbHNlO1xuICBuZXdDYWxlbmRhci5pbm5lckhUTUwgPSBTYW5pdGl6ZXIuZXNjYXBlSFRNTGBcbiAgICA8ZGl2IHRhYmluZGV4PVwiLTFcIiBjbGFzcz1cIiR7Q0FMRU5EQVJfREFURV9QSUNLRVJfQ0xBU1N9XCI+XG4gICAgICA8ZGl2IGNsYXNzPVwiJHtDQUxFTkRBUl9ST1dfQ0xBU1N9XCI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCIke0NBTEVOREFSX0NFTExfQ0xBU1N9ICR7Q0FMRU5EQVJfQ0VMTF9DRU5URVJfSVRFTVNfQ0xBU1N9XCI+XG4gICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICBjbGFzcz1cIiR7Q0FMRU5EQVJfUFJFVklPVVNfWUVBUl9DTEFTU31cIlxuICAgICAgICAgICAgYXJpYS1sYWJlbD1cIk5hdmlnYXRlIGJhY2sgb25lIHllYXJcIlxuICAgICAgICAgICAgJHtwcmV2QnV0dG9uc0Rpc2FibGVkID8gYGRpc2FibGVkPVwiZGlzYWJsZWRcImAgOiBcIlwifVxuICAgICAgICAgID48L2J1dHRvbj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCIke0NBTEVOREFSX0NFTExfQ0xBU1N9ICR7Q0FMRU5EQVJfQ0VMTF9DRU5URVJfSVRFTVNfQ0xBU1N9XCI+XG4gICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICBjbGFzcz1cIiR7Q0FMRU5EQVJfUFJFVklPVVNfTU9OVEhfQ0xBU1N9XCJcbiAgICAgICAgICAgIGFyaWEtbGFiZWw9XCJOYXZpZ2F0ZSBiYWNrIG9uZSBtb250aFwiXG4gICAgICAgICAgICAke3ByZXZCdXR0b25zRGlzYWJsZWQgPyBgZGlzYWJsZWQ9XCJkaXNhYmxlZFwiYCA6IFwiXCJ9XG4gICAgICAgICAgPjwvYnV0dG9uPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cIiR7Q0FMRU5EQVJfQ0VMTF9DTEFTU30gJHtDQUxFTkRBUl9NT05USF9MQUJFTF9DTEFTU31cIj5cbiAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgIGNsYXNzPVwiJHtDQUxFTkRBUl9NT05USF9TRUxFQ1RJT05fQ0xBU1N9XCIgYXJpYS1sYWJlbD1cIiR7bW9udGhMYWJlbH0uIENsaWNrIHRvIHNlbGVjdCBtb250aFwiXG4gICAgICAgICAgPiR7bW9udGhMYWJlbH08L2J1dHRvbj5cbiAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgIGNsYXNzPVwiJHtDQUxFTkRBUl9ZRUFSX1NFTEVDVElPTl9DTEFTU31cIiBhcmlhLWxhYmVsPVwiJHtmb2N1c2VkWWVhcn0uIENsaWNrIHRvIHNlbGVjdCB5ZWFyXCJcbiAgICAgICAgICA+JHtmb2N1c2VkWWVhcn08L2J1dHRvbj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCIke0NBTEVOREFSX0NFTExfQ0xBU1N9ICR7Q0FMRU5EQVJfQ0VMTF9DRU5URVJfSVRFTVNfQ0xBU1N9XCI+XG4gICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICBjbGFzcz1cIiR7Q0FMRU5EQVJfTkVYVF9NT05USF9DTEFTU31cIlxuICAgICAgICAgICAgYXJpYS1sYWJlbD1cIk5hdmlnYXRlIGZvcndhcmQgb25lIG1vbnRoXCJcbiAgICAgICAgICAgICR7bmV4dEJ1dHRvbnNEaXNhYmxlZCA/IGBkaXNhYmxlZD1cImRpc2FibGVkXCJgIDogXCJcIn1cbiAgICAgICAgICA+PC9idXR0b24+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwiJHtDQUxFTkRBUl9DRUxMX0NMQVNTfSAke0NBTEVOREFSX0NFTExfQ0VOVEVSX0lURU1TX0NMQVNTfVwiPlxuICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgY2xhc3M9XCIke0NBTEVOREFSX05FWFRfWUVBUl9DTEFTU31cIlxuICAgICAgICAgICAgYXJpYS1sYWJlbD1cIk5hdmlnYXRlIGZvcndhcmQgb25lIHllYXJcIlxuICAgICAgICAgICAgJHtuZXh0QnV0dG9uc0Rpc2FibGVkID8gYGRpc2FibGVkPVwiZGlzYWJsZWRcImAgOiBcIlwifVxuICAgICAgICAgID48L2J1dHRvbj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgICBgO1xuXG4gIGNvbnN0IHRhYmxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInRhYmxlXCIpO1xuICB0YWJsZS5zZXRBdHRyaWJ1dGUoXCJjbGFzc1wiLCBDQUxFTkRBUl9UQUJMRV9DTEFTUyk7XG4gIHRhYmxlLnNldEF0dHJpYnV0ZShcInJvbGVcIiwgXCJwcmVzZW50YXRpb25cIik7XG5cbiAgY29uc3QgdGFibGVIZWFkID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInRoZWFkXCIpO1xuICB0YWJsZS5pbnNlcnRBZGphY2VudEVsZW1lbnQoXCJiZWZvcmVlbmRcIiwgdGFibGVIZWFkKTtcbiAgY29uc3QgdGFibGVIZWFkUm93ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInRyXCIpO1xuICB0YWJsZUhlYWQuaW5zZXJ0QWRqYWNlbnRFbGVtZW50KFwiYmVmb3JlZW5kXCIsIHRhYmxlSGVhZFJvdyk7XG5cbiAgY29uc3QgZGF5c09mV2VlayA9IHtcbiAgICBTdW5kYXk6IFwiU1wiLFxuICAgIE1vbmRheTogXCJNXCIsXG4gICAgVHVlc2RheTogXCJUXCIsXG4gICAgV2VkbmVzZGF5OiBcIldcIixcbiAgICBUaHVyc2RheTogXCJUaFwiLFxuICAgIEZyaWRheTogXCJGclwiLFxuICAgIFNhdHVyZGF5OiBcIlNcIixcbiAgfTtcblxuICBPYmplY3Qua2V5cyhkYXlzT2ZXZWVrKS5mb3JFYWNoKChrZXkpID0+IHtcbiAgICBjb25zdCB0aCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJ0aFwiKTtcbiAgICB0aC5zZXRBdHRyaWJ1dGUoXCJjbGFzc1wiLCBDQUxFTkRBUl9EQVlfT0ZfV0VFS19DTEFTUyk7XG4gICAgdGguc2V0QXR0cmlidXRlKFwic2NvcGVcIiwgXCJwcmVzZW50YXRpb25cIik7XG4gICAgdGguc2V0QXR0cmlidXRlKFwiYXJpYS1sYWJlbFwiLCBrZXkpO1xuICAgIHRoLnRleHRDb250ZW50ID0gZGF5c09mV2Vla1trZXldO1xuICAgIHRhYmxlSGVhZFJvdy5pbnNlcnRBZGphY2VudEVsZW1lbnQoXCJiZWZvcmVlbmRcIiwgdGgpO1xuICB9KTtcblxuICBjb25zdCB0YWJsZUJvZHkgPSBjcmVhdGVUYWJsZUJvZHkoZGF0ZXNHcmlkKTtcbiAgdGFibGUuaW5zZXJ0QWRqYWNlbnRFbGVtZW50KFwiYmVmb3JlZW5kXCIsIHRhYmxlQm9keSk7XG5cbiAgLy8gQ29udGFpbmVyIGZvciBZZWFycywgTW9udGhzLCBhbmQgRGF5c1xuICBjb25zdCBkYXRlUGlja2VyQ2FsZW5kYXJDb250YWluZXIgPVxuICAgIG5ld0NhbGVuZGFyLnF1ZXJ5U2VsZWN0b3IoQ0FMRU5EQVJfREFURV9QSUNLRVIpO1xuXG4gIGRhdGVQaWNrZXJDYWxlbmRhckNvbnRhaW5lci5pbnNlcnRBZGphY2VudEVsZW1lbnQoXCJiZWZvcmVlbmRcIiwgdGFibGUpO1xuXG4gIGNhbGVuZGFyRWwucGFyZW50Tm9kZS5yZXBsYWNlQ2hpbGQobmV3Q2FsZW5kYXIsIGNhbGVuZGFyRWwpO1xuXG4gIGRhdGVQaWNrZXJFbC5jbGFzc0xpc3QuYWRkKERBVEVfUElDS0VSX0FDVElWRV9DTEFTUyk7XG5cbiAgY29uc3Qgc3RhdHVzZXMgPSBbXTtcblxuICBpZiAoaXNTYW1lRGF5KHNlbGVjdGVkRGF0ZSwgZm9jdXNlZERhdGUpKSB7XG4gICAgc3RhdHVzZXMucHVzaChcIlNlbGVjdGVkIGRhdGVcIik7XG4gIH1cblxuICBpZiAoY2FsZW5kYXJXYXNIaWRkZW4pIHtcbiAgICBzdGF0dXNlcy5wdXNoKFxuICAgICAgXCJZb3UgY2FuIG5hdmlnYXRlIGJ5IGRheSB1c2luZyBsZWZ0IGFuZCByaWdodCBhcnJvd3NcIixcbiAgICAgIFwiV2Vla3MgYnkgdXNpbmcgdXAgYW5kIGRvd24gYXJyb3dzXCIsXG4gICAgICBcIk1vbnRocyBieSB1c2luZyBwYWdlIHVwIGFuZCBwYWdlIGRvd24ga2V5c1wiLFxuICAgICAgXCJZZWFycyBieSB1c2luZyBzaGlmdCBwbHVzIHBhZ2UgdXAgYW5kIHNoaWZ0IHBsdXMgcGFnZSBkb3duXCIsXG4gICAgICBcIkhvbWUgYW5kIGVuZCBrZXlzIG5hdmlnYXRlIHRvIHRoZSBiZWdpbm5pbmcgYW5kIGVuZCBvZiBhIHdlZWtcIlxuICAgICk7XG4gICAgc3RhdHVzRWwudGV4dENvbnRlbnQgPSBcIlwiO1xuICB9IGVsc2Uge1xuICAgIHN0YXR1c2VzLnB1c2goYCR7bW9udGhMYWJlbH0gJHtmb2N1c2VkWWVhcn1gKTtcbiAgfVxuICBzdGF0dXNFbC50ZXh0Q29udGVudCA9IHN0YXR1c2VzLmpvaW4oXCIuIFwiKTtcblxuICByZXR1cm4gbmV3Q2FsZW5kYXI7XG59O1xuXG4vKipcbiAqIE5hdmlnYXRlIGJhY2sgb25lIHllYXIgYW5kIGRpc3BsYXkgdGhlIGNhbGVuZGFyLlxuICpcbiAqIEBwYXJhbSB7SFRNTEJ1dHRvbkVsZW1lbnR9IF9idXR0b25FbCBBbiBlbGVtZW50IHdpdGhpbiB0aGUgZGF0ZSBwaWNrZXIgY29tcG9uZW50XG4gKi9cbmNvbnN0IGRpc3BsYXlQcmV2aW91c1llYXIgPSAoX2J1dHRvbkVsKSA9PiB7XG4gIGlmIChfYnV0dG9uRWwuZGlzYWJsZWQpIHJldHVybjtcbiAgY29uc3QgeyBjYWxlbmRhckVsLCBjYWxlbmRhckRhdGUsIG1pbkRhdGUsIG1heERhdGUgfSA9XG4gICAgZ2V0RGF0ZVBpY2tlckNvbnRleHQoX2J1dHRvbkVsKTtcbiAgbGV0IGRhdGUgPSBzdWJZZWFycyhjYWxlbmRhckRhdGUsIDEpO1xuICBkYXRlID0ga2VlcERhdGVCZXR3ZWVuTWluQW5kTWF4KGRhdGUsIG1pbkRhdGUsIG1heERhdGUpO1xuICBjb25zdCBuZXdDYWxlbmRhciA9IHJlbmRlckNhbGVuZGFyKGNhbGVuZGFyRWwsIGRhdGUpO1xuXG4gIGxldCBuZXh0VG9Gb2N1cyA9IG5ld0NhbGVuZGFyLnF1ZXJ5U2VsZWN0b3IoQ0FMRU5EQVJfUFJFVklPVVNfWUVBUik7XG4gIGlmIChuZXh0VG9Gb2N1cy5kaXNhYmxlZCkge1xuICAgIG5leHRUb0ZvY3VzID0gbmV3Q2FsZW5kYXIucXVlcnlTZWxlY3RvcihDQUxFTkRBUl9EQVRFX1BJQ0tFUik7XG4gIH1cbiAgbmV4dFRvRm9jdXMuZm9jdXMoKTtcbn07XG5cbi8qKlxuICogTmF2aWdhdGUgYmFjayBvbmUgbW9udGggYW5kIGRpc3BsYXkgdGhlIGNhbGVuZGFyLlxuICpcbiAqIEBwYXJhbSB7SFRNTEJ1dHRvbkVsZW1lbnR9IF9idXR0b25FbCBBbiBlbGVtZW50IHdpdGhpbiB0aGUgZGF0ZSBwaWNrZXIgY29tcG9uZW50XG4gKi9cbmNvbnN0IGRpc3BsYXlQcmV2aW91c01vbnRoID0gKF9idXR0b25FbCkgPT4ge1xuICBpZiAoX2J1dHRvbkVsLmRpc2FibGVkKSByZXR1cm47XG4gIGNvbnN0IHsgY2FsZW5kYXJFbCwgY2FsZW5kYXJEYXRlLCBtaW5EYXRlLCBtYXhEYXRlIH0gPVxuICAgIGdldERhdGVQaWNrZXJDb250ZXh0KF9idXR0b25FbCk7XG4gIGxldCBkYXRlID0gc3ViTW9udGhzKGNhbGVuZGFyRGF0ZSwgMSk7XG4gIGRhdGUgPSBrZWVwRGF0ZUJldHdlZW5NaW5BbmRNYXgoZGF0ZSwgbWluRGF0ZSwgbWF4RGF0ZSk7XG4gIGNvbnN0IG5ld0NhbGVuZGFyID0gcmVuZGVyQ2FsZW5kYXIoY2FsZW5kYXJFbCwgZGF0ZSk7XG5cbiAgbGV0IG5leHRUb0ZvY3VzID0gbmV3Q2FsZW5kYXIucXVlcnlTZWxlY3RvcihDQUxFTkRBUl9QUkVWSU9VU19NT05USCk7XG4gIGlmIChuZXh0VG9Gb2N1cy5kaXNhYmxlZCkge1xuICAgIG5leHRUb0ZvY3VzID0gbmV3Q2FsZW5kYXIucXVlcnlTZWxlY3RvcihDQUxFTkRBUl9EQVRFX1BJQ0tFUik7XG4gIH1cbiAgbmV4dFRvRm9jdXMuZm9jdXMoKTtcbn07XG5cbi8qKlxuICogTmF2aWdhdGUgZm9yd2FyZCBvbmUgbW9udGggYW5kIGRpc3BsYXkgdGhlIGNhbGVuZGFyLlxuICpcbiAqIEBwYXJhbSB7SFRNTEJ1dHRvbkVsZW1lbnR9IF9idXR0b25FbCBBbiBlbGVtZW50IHdpdGhpbiB0aGUgZGF0ZSBwaWNrZXIgY29tcG9uZW50XG4gKi9cbmNvbnN0IGRpc3BsYXlOZXh0TW9udGggPSAoX2J1dHRvbkVsKSA9PiB7XG4gIGlmIChfYnV0dG9uRWwuZGlzYWJsZWQpIHJldHVybjtcbiAgY29uc3QgeyBjYWxlbmRhckVsLCBjYWxlbmRhckRhdGUsIG1pbkRhdGUsIG1heERhdGUgfSA9XG4gICAgZ2V0RGF0ZVBpY2tlckNvbnRleHQoX2J1dHRvbkVsKTtcbiAgbGV0IGRhdGUgPSBhZGRNb250aHMoY2FsZW5kYXJEYXRlLCAxKTtcbiAgZGF0ZSA9IGtlZXBEYXRlQmV0d2Vlbk1pbkFuZE1heChkYXRlLCBtaW5EYXRlLCBtYXhEYXRlKTtcbiAgY29uc3QgbmV3Q2FsZW5kYXIgPSByZW5kZXJDYWxlbmRhcihjYWxlbmRhckVsLCBkYXRlKTtcblxuICBsZXQgbmV4dFRvRm9jdXMgPSBuZXdDYWxlbmRhci5xdWVyeVNlbGVjdG9yKENBTEVOREFSX05FWFRfTU9OVEgpO1xuICBpZiAobmV4dFRvRm9jdXMuZGlzYWJsZWQpIHtcbiAgICBuZXh0VG9Gb2N1cyA9IG5ld0NhbGVuZGFyLnF1ZXJ5U2VsZWN0b3IoQ0FMRU5EQVJfREFURV9QSUNLRVIpO1xuICB9XG4gIG5leHRUb0ZvY3VzLmZvY3VzKCk7XG59O1xuXG4vKipcbiAqIE5hdmlnYXRlIGZvcndhcmQgb25lIHllYXIgYW5kIGRpc3BsYXkgdGhlIGNhbGVuZGFyLlxuICpcbiAqIEBwYXJhbSB7SFRNTEJ1dHRvbkVsZW1lbnR9IF9idXR0b25FbCBBbiBlbGVtZW50IHdpdGhpbiB0aGUgZGF0ZSBwaWNrZXIgY29tcG9uZW50XG4gKi9cbmNvbnN0IGRpc3BsYXlOZXh0WWVhciA9IChfYnV0dG9uRWwpID0+IHtcbiAgaWYgKF9idXR0b25FbC5kaXNhYmxlZCkgcmV0dXJuO1xuICBjb25zdCB7IGNhbGVuZGFyRWwsIGNhbGVuZGFyRGF0ZSwgbWluRGF0ZSwgbWF4RGF0ZSB9ID1cbiAgICBnZXREYXRlUGlja2VyQ29udGV4dChfYnV0dG9uRWwpO1xuICBsZXQgZGF0ZSA9IGFkZFllYXJzKGNhbGVuZGFyRGF0ZSwgMSk7XG4gIGRhdGUgPSBrZWVwRGF0ZUJldHdlZW5NaW5BbmRNYXgoZGF0ZSwgbWluRGF0ZSwgbWF4RGF0ZSk7XG4gIGNvbnN0IG5ld0NhbGVuZGFyID0gcmVuZGVyQ2FsZW5kYXIoY2FsZW5kYXJFbCwgZGF0ZSk7XG5cbiAgbGV0IG5leHRUb0ZvY3VzID0gbmV3Q2FsZW5kYXIucXVlcnlTZWxlY3RvcihDQUxFTkRBUl9ORVhUX1lFQVIpO1xuICBpZiAobmV4dFRvRm9jdXMuZGlzYWJsZWQpIHtcbiAgICBuZXh0VG9Gb2N1cyA9IG5ld0NhbGVuZGFyLnF1ZXJ5U2VsZWN0b3IoQ0FMRU5EQVJfREFURV9QSUNLRVIpO1xuICB9XG4gIG5leHRUb0ZvY3VzLmZvY3VzKCk7XG59O1xuXG4vKipcbiAqIEhpZGUgdGhlIGNhbGVuZGFyIG9mIGEgZGF0ZSBwaWNrZXIgY29tcG9uZW50LlxuICpcbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsIEFuIGVsZW1lbnQgd2l0aGluIHRoZSBkYXRlIHBpY2tlciBjb21wb25lbnRcbiAqL1xuY29uc3QgaGlkZUNhbGVuZGFyID0gKGVsKSA9PiB7XG4gIGNvbnN0IHsgZGF0ZVBpY2tlckVsLCBjYWxlbmRhckVsLCBzdGF0dXNFbCB9ID0gZ2V0RGF0ZVBpY2tlckNvbnRleHQoZWwpO1xuXG4gIGRhdGVQaWNrZXJFbC5jbGFzc0xpc3QucmVtb3ZlKERBVEVfUElDS0VSX0FDVElWRV9DTEFTUyk7XG4gIGNhbGVuZGFyRWwuaGlkZGVuID0gdHJ1ZTtcbiAgc3RhdHVzRWwudGV4dENvbnRlbnQgPSBcIlwiO1xufTtcblxuLyoqXG4gKiBTZWxlY3QgYSBkYXRlIHdpdGhpbiB0aGUgZGF0ZSBwaWNrZXIgY29tcG9uZW50LlxuICpcbiAqIEBwYXJhbSB7SFRNTEJ1dHRvbkVsZW1lbnR9IGNhbGVuZGFyRGF0ZUVsIEEgZGF0ZSBlbGVtZW50IHdpdGhpbiB0aGUgZGF0ZSBwaWNrZXIgY29tcG9uZW50XG4gKi9cbmNvbnN0IHNlbGVjdERhdGUgPSAoY2FsZW5kYXJEYXRlRWwpID0+IHtcbiAgaWYgKGNhbGVuZGFyRGF0ZUVsLmRpc2FibGVkKSByZXR1cm47XG5cbiAgY29uc3QgeyBkYXRlUGlja2VyRWwsIGV4dGVybmFsSW5wdXRFbCB9ID1cbiAgICBnZXREYXRlUGlja2VyQ29udGV4dChjYWxlbmRhckRhdGVFbCk7XG5cbiAgc2V0Q2FsZW5kYXJWYWx1ZShjYWxlbmRhckRhdGVFbCwgY2FsZW5kYXJEYXRlRWwuZGF0YXNldC52YWx1ZSk7XG4gIGhpZGVDYWxlbmRhcihkYXRlUGlja2VyRWwpO1xuXG4gIGV4dGVybmFsSW5wdXRFbC5mb2N1cygpO1xufTtcblxuLyoqXG4gKiBUb2dnbGUgdGhlIGNhbGVuZGFyLlxuICpcbiAqIEBwYXJhbSB7SFRNTEJ1dHRvbkVsZW1lbnR9IGVsIEFuIGVsZW1lbnQgd2l0aGluIHRoZSBkYXRlIHBpY2tlciBjb21wb25lbnRcbiAqL1xuY29uc3QgdG9nZ2xlQ2FsZW5kYXIgPSAoZWwpID0+IHtcbiAgaWYgKGVsLmRpc2FibGVkKSByZXR1cm47XG4gIGNvbnN0IHsgY2FsZW5kYXJFbCwgaW5wdXREYXRlLCBtaW5EYXRlLCBtYXhEYXRlLCBkZWZhdWx0RGF0ZSB9ID1cbiAgICBnZXREYXRlUGlja2VyQ29udGV4dChlbCk7XG5cbiAgaWYgKGNhbGVuZGFyRWwuaGlkZGVuKSB7XG4gICAgY29uc3QgZGF0ZVRvRGlzcGxheSA9IGtlZXBEYXRlQmV0d2Vlbk1pbkFuZE1heChcbiAgICAgIGlucHV0RGF0ZSB8fCBkZWZhdWx0RGF0ZSB8fCB0b2RheSgpLFxuICAgICAgbWluRGF0ZSxcbiAgICAgIG1heERhdGVcbiAgICApO1xuICAgIGNvbnN0IG5ld0NhbGVuZGFyID0gcmVuZGVyQ2FsZW5kYXIoY2FsZW5kYXJFbCwgZGF0ZVRvRGlzcGxheSk7XG4gICAgbmV3Q2FsZW5kYXIucXVlcnlTZWxlY3RvcihDQUxFTkRBUl9EQVRFX0ZPQ1VTRUQpLmZvY3VzKCk7XG4gIH0gZWxzZSB7XG4gICAgaGlkZUNhbGVuZGFyKGVsKTtcbiAgfVxufTtcblxuLyoqXG4gKiBVcGRhdGUgdGhlIGNhbGVuZGFyIHdoZW4gdmlzaWJsZS5cbiAqXG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbCBhbiBlbGVtZW50IHdpdGhpbiB0aGUgZGF0ZSBwaWNrZXJcbiAqL1xuY29uc3QgdXBkYXRlQ2FsZW5kYXJJZlZpc2libGUgPSAoZWwpID0+IHtcbiAgY29uc3QgeyBjYWxlbmRhckVsLCBpbnB1dERhdGUsIG1pbkRhdGUsIG1heERhdGUgfSA9IGdldERhdGVQaWNrZXJDb250ZXh0KGVsKTtcbiAgY29uc3QgY2FsZW5kYXJTaG93biA9ICFjYWxlbmRhckVsLmhpZGRlbjtcblxuICBpZiAoY2FsZW5kYXJTaG93biAmJiBpbnB1dERhdGUpIHtcbiAgICBjb25zdCBkYXRlVG9EaXNwbGF5ID0ga2VlcERhdGVCZXR3ZWVuTWluQW5kTWF4KGlucHV0RGF0ZSwgbWluRGF0ZSwgbWF4RGF0ZSk7XG4gICAgcmVuZGVyQ2FsZW5kYXIoY2FsZW5kYXJFbCwgZGF0ZVRvRGlzcGxheSk7XG4gIH1cbn07XG5cbi8vICNlbmRyZWdpb24gQ2FsZW5kYXIgLSBEYXRlIFNlbGVjdGlvbiBWaWV3XG5cbi8vICNyZWdpb24gQ2FsZW5kYXIgLSBNb250aCBTZWxlY3Rpb24gVmlld1xuLyoqXG4gKiBEaXNwbGF5IHRoZSBtb250aCBzZWxlY3Rpb24gc2NyZWVuIGluIHRoZSBkYXRlIHBpY2tlci5cbiAqXG4gKiBAcGFyYW0ge0hUTUxCdXR0b25FbGVtZW50fSBlbCBBbiBlbGVtZW50IHdpdGhpbiB0aGUgZGF0ZSBwaWNrZXIgY29tcG9uZW50XG4gKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9IGEgcmVmZXJlbmNlIHRvIHRoZSBuZXcgY2FsZW5kYXIgZWxlbWVudFxuICovXG5jb25zdCBkaXNwbGF5TW9udGhTZWxlY3Rpb24gPSAoZWwsIG1vbnRoVG9EaXNwbGF5KSA9PiB7XG4gIGNvbnN0IHsgY2FsZW5kYXJFbCwgc3RhdHVzRWwsIGNhbGVuZGFyRGF0ZSwgbWluRGF0ZSwgbWF4RGF0ZSB9ID1cbiAgICBnZXREYXRlUGlja2VyQ29udGV4dChlbCk7XG5cbiAgY29uc3Qgc2VsZWN0ZWRNb250aCA9IGNhbGVuZGFyRGF0ZS5nZXRNb250aCgpO1xuICBjb25zdCBmb2N1c2VkTW9udGggPSBtb250aFRvRGlzcGxheSA9PSBudWxsID8gc2VsZWN0ZWRNb250aCA6IG1vbnRoVG9EaXNwbGF5O1xuXG4gIGNvbnN0IG1vbnRocyA9IE1PTlRIX0xBQkVMUy5tYXAoKG1vbnRoLCBpbmRleCkgPT4ge1xuICAgIGNvbnN0IG1vbnRoVG9DaGVjayA9IHNldE1vbnRoKGNhbGVuZGFyRGF0ZSwgaW5kZXgpO1xuXG4gICAgY29uc3QgaXNEaXNhYmxlZCA9IGlzRGF0ZXNNb250aE91dHNpZGVNaW5Pck1heChcbiAgICAgIG1vbnRoVG9DaGVjayxcbiAgICAgIG1pbkRhdGUsXG4gICAgICBtYXhEYXRlXG4gICAgKTtcblxuICAgIGxldCB0YWJpbmRleCA9IFwiLTFcIjtcblxuICAgIGNvbnN0IGNsYXNzZXMgPSBbQ0FMRU5EQVJfTU9OVEhfQ0xBU1NdO1xuICAgIGNvbnN0IGlzU2VsZWN0ZWQgPSBpbmRleCA9PT0gc2VsZWN0ZWRNb250aDtcblxuICAgIGlmIChpbmRleCA9PT0gZm9jdXNlZE1vbnRoKSB7XG4gICAgICB0YWJpbmRleCA9IFwiMFwiO1xuICAgICAgY2xhc3Nlcy5wdXNoKENBTEVOREFSX01PTlRIX0ZPQ1VTRURfQ0xBU1MpO1xuICAgIH1cblxuICAgIGlmIChpc1NlbGVjdGVkKSB7XG4gICAgICBjbGFzc2VzLnB1c2goQ0FMRU5EQVJfTU9OVEhfU0VMRUNURURfQ0xBU1MpO1xuICAgIH1cblxuICAgIGNvbnN0IGJ0biA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJidXR0b25cIik7XG4gICAgYnRuLnNldEF0dHJpYnV0ZShcInR5cGVcIiwgXCJidXR0b25cIik7XG4gICAgYnRuLnNldEF0dHJpYnV0ZShcInRhYmluZGV4XCIsIHRhYmluZGV4KTtcbiAgICBidG4uc2V0QXR0cmlidXRlKFwiY2xhc3NcIiwgY2xhc3Nlcy5qb2luKFwiIFwiKSk7XG4gICAgYnRuLnNldEF0dHJpYnV0ZShcImRhdGEtdmFsdWVcIiwgaW5kZXgpO1xuICAgIGJ0bi5zZXRBdHRyaWJ1dGUoXCJkYXRhLWxhYmVsXCIsIG1vbnRoKTtcbiAgICBidG4uc2V0QXR0cmlidXRlKFwiYXJpYS1zZWxlY3RlZFwiLCBpc1NlbGVjdGVkID8gXCJ0cnVlXCIgOiBcImZhbHNlXCIpO1xuICAgIGlmIChpc0Rpc2FibGVkID09PSB0cnVlKSB7XG4gICAgICBidG4uZGlzYWJsZWQgPSB0cnVlO1xuICAgIH1cbiAgICBidG4udGV4dENvbnRlbnQgPSBtb250aDtcblxuICAgIHJldHVybiBidG47XG4gIH0pO1xuXG4gIGNvbnN0IG1vbnRoc0h0bWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICBtb250aHNIdG1sLnNldEF0dHJpYnV0ZShcInRhYmluZGV4XCIsIFwiLTFcIik7XG4gIG1vbnRoc0h0bWwuc2V0QXR0cmlidXRlKFwiY2xhc3NcIiwgQ0FMRU5EQVJfTU9OVEhfUElDS0VSX0NMQVNTKTtcblxuICBjb25zdCB0YWJsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJ0YWJsZVwiKTtcbiAgdGFibGUuc2V0QXR0cmlidXRlKFwiY2xhc3NcIiwgQ0FMRU5EQVJfVEFCTEVfQ0xBU1MpO1xuICB0YWJsZS5zZXRBdHRyaWJ1dGUoXCJyb2xlXCIsIFwicHJlc2VudGF0aW9uXCIpO1xuXG4gIGNvbnN0IG1vbnRoc0dyaWQgPSBsaXN0VG9HcmlkSHRtbChtb250aHMsIDMpO1xuICBjb25zdCB0YWJsZUJvZHkgPSBjcmVhdGVUYWJsZUJvZHkobW9udGhzR3JpZCk7XG4gIHRhYmxlLmluc2VydEFkamFjZW50RWxlbWVudChcImJlZm9yZWVuZFwiLCB0YWJsZUJvZHkpO1xuICBtb250aHNIdG1sLmluc2VydEFkamFjZW50RWxlbWVudChcImJlZm9yZWVuZFwiLCB0YWJsZSk7XG5cbiAgY29uc3QgbmV3Q2FsZW5kYXIgPSBjYWxlbmRhckVsLmNsb25lTm9kZSgpO1xuICBuZXdDYWxlbmRhci5pbnNlcnRBZGphY2VudEVsZW1lbnQoXCJiZWZvcmVlbmRcIiwgbW9udGhzSHRtbCk7XG4gIGNhbGVuZGFyRWwucGFyZW50Tm9kZS5yZXBsYWNlQ2hpbGQobmV3Q2FsZW5kYXIsIGNhbGVuZGFyRWwpO1xuXG4gIHN0YXR1c0VsLnRleHRDb250ZW50ID0gXCJTZWxlY3QgYSBtb250aC5cIjtcblxuICByZXR1cm4gbmV3Q2FsZW5kYXI7XG59O1xuXG4vKipcbiAqIFNlbGVjdCBhIG1vbnRoIGluIHRoZSBkYXRlIHBpY2tlciBjb21wb25lbnQuXG4gKlxuICogQHBhcmFtIHtIVE1MQnV0dG9uRWxlbWVudH0gbW9udGhFbCBBbiBtb250aCBlbGVtZW50IHdpdGhpbiB0aGUgZGF0ZSBwaWNrZXIgY29tcG9uZW50XG4gKi9cbmNvbnN0IHNlbGVjdE1vbnRoID0gKG1vbnRoRWwpID0+IHtcbiAgaWYgKG1vbnRoRWwuZGlzYWJsZWQpIHJldHVybjtcbiAgY29uc3QgeyBjYWxlbmRhckVsLCBjYWxlbmRhckRhdGUsIG1pbkRhdGUsIG1heERhdGUgfSA9XG4gICAgZ2V0RGF0ZVBpY2tlckNvbnRleHQobW9udGhFbCk7XG4gIGNvbnN0IHNlbGVjdGVkTW9udGggPSBwYXJzZUludChtb250aEVsLmRhdGFzZXQudmFsdWUsIDEwKTtcbiAgbGV0IGRhdGUgPSBzZXRNb250aChjYWxlbmRhckRhdGUsIHNlbGVjdGVkTW9udGgpO1xuICBkYXRlID0ga2VlcERhdGVCZXR3ZWVuTWluQW5kTWF4KGRhdGUsIG1pbkRhdGUsIG1heERhdGUpO1xuICBjb25zdCBuZXdDYWxlbmRhciA9IHJlbmRlckNhbGVuZGFyKGNhbGVuZGFyRWwsIGRhdGUpO1xuICBuZXdDYWxlbmRhci5xdWVyeVNlbGVjdG9yKENBTEVOREFSX0RBVEVfRk9DVVNFRCkuZm9jdXMoKTtcbn07XG5cbi8vICNlbmRyZWdpb24gQ2FsZW5kYXIgLSBNb250aCBTZWxlY3Rpb24gVmlld1xuXG4vLyAjcmVnaW9uIENhbGVuZGFyIC0gWWVhciBTZWxlY3Rpb24gVmlld1xuXG4vKipcbiAqIERpc3BsYXkgdGhlIHllYXIgc2VsZWN0aW9uIHNjcmVlbiBpbiB0aGUgZGF0ZSBwaWNrZXIuXG4gKlxuICogQHBhcmFtIHtIVE1MQnV0dG9uRWxlbWVudH0gZWwgQW4gZWxlbWVudCB3aXRoaW4gdGhlIGRhdGUgcGlja2VyIGNvbXBvbmVudFxuICogQHBhcmFtIHtudW1iZXJ9IHllYXJUb0Rpc3BsYXkgeWVhciB0byBkaXNwbGF5IGluIHllYXIgc2VsZWN0aW9uXG4gKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9IGEgcmVmZXJlbmNlIHRvIHRoZSBuZXcgY2FsZW5kYXIgZWxlbWVudFxuICovXG5jb25zdCBkaXNwbGF5WWVhclNlbGVjdGlvbiA9IChlbCwgeWVhclRvRGlzcGxheSkgPT4ge1xuICBjb25zdCB7IGNhbGVuZGFyRWwsIHN0YXR1c0VsLCBjYWxlbmRhckRhdGUsIG1pbkRhdGUsIG1heERhdGUgfSA9XG4gICAgZ2V0RGF0ZVBpY2tlckNvbnRleHQoZWwpO1xuXG4gIGNvbnN0IHNlbGVjdGVkWWVhciA9IGNhbGVuZGFyRGF0ZS5nZXRGdWxsWWVhcigpO1xuICBjb25zdCBmb2N1c2VkWWVhciA9IHllYXJUb0Rpc3BsYXkgPT0gbnVsbCA/IHNlbGVjdGVkWWVhciA6IHllYXJUb0Rpc3BsYXk7XG5cbiAgbGV0IHllYXJUb0NodW5rID0gZm9jdXNlZFllYXI7XG4gIHllYXJUb0NodW5rIC09IHllYXJUb0NodW5rICUgWUVBUl9DSFVOSztcbiAgeWVhclRvQ2h1bmsgPSBNYXRoLm1heCgwLCB5ZWFyVG9DaHVuayk7XG5cbiAgY29uc3QgcHJldlllYXJDaHVua0Rpc2FibGVkID0gaXNEYXRlc1llYXJPdXRzaWRlTWluT3JNYXgoXG4gICAgc2V0WWVhcihjYWxlbmRhckRhdGUsIHllYXJUb0NodW5rIC0gMSksXG4gICAgbWluRGF0ZSxcbiAgICBtYXhEYXRlXG4gICk7XG5cbiAgY29uc3QgbmV4dFllYXJDaHVua0Rpc2FibGVkID0gaXNEYXRlc1llYXJPdXRzaWRlTWluT3JNYXgoXG4gICAgc2V0WWVhcihjYWxlbmRhckRhdGUsIHllYXJUb0NodW5rICsgWUVBUl9DSFVOSyksXG4gICAgbWluRGF0ZSxcbiAgICBtYXhEYXRlXG4gICk7XG5cbiAgY29uc3QgeWVhcnMgPSBbXTtcbiAgbGV0IHllYXJJbmRleCA9IHllYXJUb0NodW5rO1xuICB3aGlsZSAoeWVhcnMubGVuZ3RoIDwgWUVBUl9DSFVOSykge1xuICAgIGNvbnN0IGlzRGlzYWJsZWQgPSBpc0RhdGVzWWVhck91dHNpZGVNaW5Pck1heChcbiAgICAgIHNldFllYXIoY2FsZW5kYXJEYXRlLCB5ZWFySW5kZXgpLFxuICAgICAgbWluRGF0ZSxcbiAgICAgIG1heERhdGVcbiAgICApO1xuXG4gICAgbGV0IHRhYmluZGV4ID0gXCItMVwiO1xuXG4gICAgY29uc3QgY2xhc3NlcyA9IFtDQUxFTkRBUl9ZRUFSX0NMQVNTXTtcbiAgICBjb25zdCBpc1NlbGVjdGVkID0geWVhckluZGV4ID09PSBzZWxlY3RlZFllYXI7XG5cbiAgICBpZiAoeWVhckluZGV4ID09PSBmb2N1c2VkWWVhcikge1xuICAgICAgdGFiaW5kZXggPSBcIjBcIjtcbiAgICAgIGNsYXNzZXMucHVzaChDQUxFTkRBUl9ZRUFSX0ZPQ1VTRURfQ0xBU1MpO1xuICAgIH1cblxuICAgIGlmIChpc1NlbGVjdGVkKSB7XG4gICAgICBjbGFzc2VzLnB1c2goQ0FMRU5EQVJfWUVBUl9TRUxFQ1RFRF9DTEFTUyk7XG4gICAgfVxuXG4gICAgY29uc3QgYnRuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImJ1dHRvblwiKTtcbiAgICBidG4uc2V0QXR0cmlidXRlKFwidHlwZVwiLCBcImJ1dHRvblwiKTtcbiAgICBidG4uc2V0QXR0cmlidXRlKFwidGFiaW5kZXhcIiwgdGFiaW5kZXgpO1xuICAgIGJ0bi5zZXRBdHRyaWJ1dGUoXCJjbGFzc1wiLCBjbGFzc2VzLmpvaW4oXCIgXCIpKTtcbiAgICBidG4uc2V0QXR0cmlidXRlKFwiZGF0YS12YWx1ZVwiLCB5ZWFySW5kZXgpO1xuICAgIGJ0bi5zZXRBdHRyaWJ1dGUoXCJhcmlhLXNlbGVjdGVkXCIsIGlzU2VsZWN0ZWQgPyBcInRydWVcIiA6IFwiZmFsc2VcIik7XG4gICAgaWYgKGlzRGlzYWJsZWQgPT09IHRydWUpIHtcbiAgICAgIGJ0bi5kaXNhYmxlZCA9IHRydWU7XG4gICAgfVxuICAgIGJ0bi50ZXh0Q29udGVudCA9IHllYXJJbmRleDtcblxuICAgIHllYXJzLnB1c2goYnRuKTtcbiAgICB5ZWFySW5kZXggKz0gMTtcbiAgfVxuXG4gIGNvbnN0IG5ld0NhbGVuZGFyID0gY2FsZW5kYXJFbC5jbG9uZU5vZGUoKTtcblxuICAvLyBjcmVhdGUgdGhlIHllYXJzIGNhbGVuZGFyIHdyYXBwZXJcbiAgY29uc3QgeWVhcnNDYWxlbmRhcldyYXBwZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICB5ZWFyc0NhbGVuZGFyV3JhcHBlci5zZXRBdHRyaWJ1dGUoXCJ0YWJpbmRleFwiLCBcIi0xXCIpO1xuICB5ZWFyc0NhbGVuZGFyV3JhcHBlci5zZXRBdHRyaWJ1dGUoXCJjbGFzc1wiLCBDQUxFTkRBUl9ZRUFSX1BJQ0tFUl9DTEFTUyk7XG5cbiAgLy8gY3JlYXRlIHRhYmxlIHBhcmVudFxuICBjb25zdCB5ZWFyc1RhYmxlUGFyZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInRhYmxlXCIpO1xuICB5ZWFyc1RhYmxlUGFyZW50LnNldEF0dHJpYnV0ZShcInJvbGVcIiwgXCJwcmVzZW50YXRpb25cIik7XG4gIHllYXJzVGFibGVQYXJlbnQuc2V0QXR0cmlidXRlKFwiY2xhc3NcIiwgQ0FMRU5EQVJfVEFCTEVfQ0xBU1MpO1xuXG4gIC8vIGNyZWF0ZSB0YWJsZSBib2R5IGFuZCB0YWJsZSByb3dcbiAgY29uc3QgeWVhcnNIVE1MVGFibGVCb2R5ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInRib2R5XCIpO1xuICBjb25zdCB5ZWFyc0hUTUxUYWJsZUJvZHlSb3cgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwidHJcIik7XG5cbiAgLy8gY3JlYXRlIHByZXZpb3VzIGJ1dHRvblxuICBjb25zdCBwcmV2aW91c1llYXJzQnRuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImJ1dHRvblwiKTtcbiAgcHJldmlvdXNZZWFyc0J0bi5zZXRBdHRyaWJ1dGUoXCJ0eXBlXCIsIFwiYnV0dG9uXCIpO1xuICBwcmV2aW91c1llYXJzQnRuLnNldEF0dHJpYnV0ZShcImNsYXNzXCIsIENBTEVOREFSX1BSRVZJT1VTX1lFQVJfQ0hVTktfQ0xBU1MpO1xuICBwcmV2aW91c1llYXJzQnRuLnNldEF0dHJpYnV0ZShcbiAgICBcImFyaWEtbGFiZWxcIixcbiAgICBgTmF2aWdhdGUgYmFjayAke1lFQVJfQ0hVTkt9IHllYXJzYFxuICApO1xuICBpZiAocHJldlllYXJDaHVua0Rpc2FibGVkID09PSB0cnVlKSB7XG4gICAgcHJldmlvdXNZZWFyc0J0bi5kaXNhYmxlZCA9IHRydWU7XG4gIH1cbiAgcHJldmlvdXNZZWFyc0J0bi5pbm5lckhUTUwgPSBTYW5pdGl6ZXIuZXNjYXBlSFRNTGAmbmJzcGA7XG5cbiAgLy8gY3JlYXRlIG5leHQgYnV0dG9uXG4gIGNvbnN0IG5leHRZZWFyc0J0biA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJidXR0b25cIik7XG4gIG5leHRZZWFyc0J0bi5zZXRBdHRyaWJ1dGUoXCJ0eXBlXCIsIFwiYnV0dG9uXCIpO1xuICBuZXh0WWVhcnNCdG4uc2V0QXR0cmlidXRlKFwiY2xhc3NcIiwgQ0FMRU5EQVJfTkVYVF9ZRUFSX0NIVU5LX0NMQVNTKTtcbiAgbmV4dFllYXJzQnRuLnNldEF0dHJpYnV0ZShcbiAgICBcImFyaWEtbGFiZWxcIixcbiAgICBgTmF2aWdhdGUgZm9yd2FyZCAke1lFQVJfQ0hVTkt9IHllYXJzYFxuICApO1xuICBpZiAobmV4dFllYXJDaHVua0Rpc2FibGVkID09PSB0cnVlKSB7XG4gICAgbmV4dFllYXJzQnRuLmRpc2FibGVkID0gdHJ1ZTtcbiAgfVxuICBuZXh0WWVhcnNCdG4uaW5uZXJIVE1MID0gU2FuaXRpemVyLmVzY2FwZUhUTUxgJm5ic3BgO1xuXG4gIC8vIGNyZWF0ZSB0aGUgYWN0dWFsIHllYXJzIHRhYmxlXG4gIGNvbnN0IHllYXJzVGFibGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwidGFibGVcIik7XG4gIHllYXJzVGFibGUuc2V0QXR0cmlidXRlKFwiY2xhc3NcIiwgQ0FMRU5EQVJfVEFCTEVfQ0xBU1MpO1xuICB5ZWFyc1RhYmxlLnNldEF0dHJpYnV0ZShcInJvbGVcIiwgXCJwcmVzZW50YXRpb25cIik7XG5cbiAgLy8gY3JlYXRlIHRoZSB5ZWFycyBjaGlsZCB0YWJsZVxuICBjb25zdCB5ZWFyc0dyaWQgPSBsaXN0VG9HcmlkSHRtbCh5ZWFycywgMyk7XG4gIGNvbnN0IHllYXJzVGFibGVCb2R5ID0gY3JlYXRlVGFibGVCb2R5KHllYXJzR3JpZCk7XG5cbiAgLy8gYXBwZW5kIHRoZSBncmlkIHRvIHRoZSB5ZWFycyBjaGlsZCB0YWJsZVxuICB5ZWFyc1RhYmxlLmluc2VydEFkamFjZW50RWxlbWVudChcImJlZm9yZWVuZFwiLCB5ZWFyc1RhYmxlQm9keSk7XG5cbiAgLy8gY3JlYXRlIHRoZSBwcmV2IGJ1dHRvbiB0ZCBhbmQgYXBwZW5kIHRoZSBwcmV2IGJ1dHRvblxuICBjb25zdCB5ZWFyc0hUTUxUYWJsZUJvZHlEZXRhaWxQcmV2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInRkXCIpO1xuICB5ZWFyc0hUTUxUYWJsZUJvZHlEZXRhaWxQcmV2Lmluc2VydEFkamFjZW50RWxlbWVudChcbiAgICBcImJlZm9yZWVuZFwiLFxuICAgIHByZXZpb3VzWWVhcnNCdG5cbiAgKTtcblxuICAvLyBjcmVhdGUgdGhlIHllYXJzIHRkIGFuZCBhcHBlbmQgdGhlIHllYXJzIGNoaWxkIHRhYmxlXG4gIGNvbnN0IHllYXJzSFRNTFRhYmxlQm9keVllYXJzRGV0YWlsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInRkXCIpO1xuICB5ZWFyc0hUTUxUYWJsZUJvZHlZZWFyc0RldGFpbC5zZXRBdHRyaWJ1dGUoXCJjb2xzcGFuXCIsIFwiM1wiKTtcbiAgeWVhcnNIVE1MVGFibGVCb2R5WWVhcnNEZXRhaWwuaW5zZXJ0QWRqYWNlbnRFbGVtZW50KFwiYmVmb3JlZW5kXCIsIHllYXJzVGFibGUpO1xuXG4gIC8vIGNyZWF0ZSB0aGUgbmV4dCBidXR0b24gdGQgYW5kIGFwcGVuZCB0aGUgbmV4dCBidXR0b25cbiAgY29uc3QgeWVhcnNIVE1MVGFibGVCb2R5RGV0YWlsTmV4dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJ0ZFwiKTtcbiAgeWVhcnNIVE1MVGFibGVCb2R5RGV0YWlsTmV4dC5pbnNlcnRBZGphY2VudEVsZW1lbnQoXCJiZWZvcmVlbmRcIiwgbmV4dFllYXJzQnRuKTtcblxuICAvLyBhcHBlbmQgdGhlIHRocmVlIHRkIHRvIHRoZSB5ZWFycyBjaGlsZCB0YWJsZSByb3dcbiAgeWVhcnNIVE1MVGFibGVCb2R5Um93Lmluc2VydEFkamFjZW50RWxlbWVudChcbiAgICBcImJlZm9yZWVuZFwiLFxuICAgIHllYXJzSFRNTFRhYmxlQm9keURldGFpbFByZXZcbiAgKTtcbiAgeWVhcnNIVE1MVGFibGVCb2R5Um93Lmluc2VydEFkamFjZW50RWxlbWVudChcbiAgICBcImJlZm9yZWVuZFwiLFxuICAgIHllYXJzSFRNTFRhYmxlQm9keVllYXJzRGV0YWlsXG4gICk7XG4gIHllYXJzSFRNTFRhYmxlQm9keVJvdy5pbnNlcnRBZGphY2VudEVsZW1lbnQoXG4gICAgXCJiZWZvcmVlbmRcIixcbiAgICB5ZWFyc0hUTUxUYWJsZUJvZHlEZXRhaWxOZXh0XG4gICk7XG5cbiAgLy8gYXBwZW5kIHRoZSB0YWJsZSByb3cgdG8gdGhlIHllYXJzIGNoaWxkIHRhYmxlIGJvZHlcbiAgeWVhcnNIVE1MVGFibGVCb2R5Lmluc2VydEFkamFjZW50RWxlbWVudChcImJlZm9yZWVuZFwiLCB5ZWFyc0hUTUxUYWJsZUJvZHlSb3cpO1xuXG4gIC8vIGFwcGVuZCB0aGUgeWVhcnMgdGFibGUgYm9keSB0byB0aGUgeWVhcnMgcGFyZW50IHRhYmxlXG4gIHllYXJzVGFibGVQYXJlbnQuaW5zZXJ0QWRqYWNlbnRFbGVtZW50KFwiYmVmb3JlZW5kXCIsIHllYXJzSFRNTFRhYmxlQm9keSk7XG5cbiAgLy8gYXBwZW5kIHRoZSBwYXJlbnQgdGFibGUgdG8gdGhlIGNhbGVuZGFyIHdyYXBwZXJcbiAgeWVhcnNDYWxlbmRhcldyYXBwZXIuaW5zZXJ0QWRqYWNlbnRFbGVtZW50KFwiYmVmb3JlZW5kXCIsIHllYXJzVGFibGVQYXJlbnQpO1xuXG4gIC8vIGFwcGVuZCB0aGUgeWVhcnMgY2FsZW5kZXIgdG8gdGhlIG5ldyBjYWxlbmRhclxuICBuZXdDYWxlbmRhci5pbnNlcnRBZGphY2VudEVsZW1lbnQoXCJiZWZvcmVlbmRcIiwgeWVhcnNDYWxlbmRhcldyYXBwZXIpO1xuXG4gIC8vIHJlcGxhY2UgY2FsZW5kYXJcbiAgY2FsZW5kYXJFbC5wYXJlbnROb2RlLnJlcGxhY2VDaGlsZChuZXdDYWxlbmRhciwgY2FsZW5kYXJFbCk7XG5cbiAgc3RhdHVzRWwudGV4dENvbnRlbnQgPSBTYW5pdGl6ZXIuZXNjYXBlSFRNTGBTaG93aW5nIHllYXJzICR7eWVhclRvQ2h1bmt9IHRvICR7XG4gICAgeWVhclRvQ2h1bmsgKyBZRUFSX0NIVU5LIC0gMVxuICB9LiBTZWxlY3QgYSB5ZWFyLmA7XG5cbiAgcmV0dXJuIG5ld0NhbGVuZGFyO1xufTtcblxuLyoqXG4gKiBOYXZpZ2F0ZSBiYWNrIGJ5IHllYXJzIGFuZCBkaXNwbGF5IHRoZSB5ZWFyIHNlbGVjdGlvbiBzY3JlZW4uXG4gKlxuICogQHBhcmFtIHtIVE1MQnV0dG9uRWxlbWVudH0gZWwgQW4gZWxlbWVudCB3aXRoaW4gdGhlIGRhdGUgcGlja2VyIGNvbXBvbmVudFxuICovXG5jb25zdCBkaXNwbGF5UHJldmlvdXNZZWFyQ2h1bmsgPSAoZWwpID0+IHtcbiAgaWYgKGVsLmRpc2FibGVkKSByZXR1cm47XG5cbiAgY29uc3QgeyBjYWxlbmRhckVsLCBjYWxlbmRhckRhdGUsIG1pbkRhdGUsIG1heERhdGUgfSA9XG4gICAgZ2V0RGF0ZVBpY2tlckNvbnRleHQoZWwpO1xuICBjb25zdCB5ZWFyRWwgPSBjYWxlbmRhckVsLnF1ZXJ5U2VsZWN0b3IoQ0FMRU5EQVJfWUVBUl9GT0NVU0VEKTtcbiAgY29uc3Qgc2VsZWN0ZWRZZWFyID0gcGFyc2VJbnQoeWVhckVsLnRleHRDb250ZW50LCAxMCk7XG5cbiAgbGV0IGFkanVzdGVkWWVhciA9IHNlbGVjdGVkWWVhciAtIFlFQVJfQ0hVTks7XG4gIGFkanVzdGVkWWVhciA9IE1hdGgubWF4KDAsIGFkanVzdGVkWWVhcik7XG5cbiAgY29uc3QgZGF0ZSA9IHNldFllYXIoY2FsZW5kYXJEYXRlLCBhZGp1c3RlZFllYXIpO1xuICBjb25zdCBjYXBwZWREYXRlID0ga2VlcERhdGVCZXR3ZWVuTWluQW5kTWF4KGRhdGUsIG1pbkRhdGUsIG1heERhdGUpO1xuICBjb25zdCBuZXdDYWxlbmRhciA9IGRpc3BsYXlZZWFyU2VsZWN0aW9uKFxuICAgIGNhbGVuZGFyRWwsXG4gICAgY2FwcGVkRGF0ZS5nZXRGdWxsWWVhcigpXG4gICk7XG5cbiAgbGV0IG5leHRUb0ZvY3VzID0gbmV3Q2FsZW5kYXIucXVlcnlTZWxlY3RvcihDQUxFTkRBUl9QUkVWSU9VU19ZRUFSX0NIVU5LKTtcbiAgaWYgKG5leHRUb0ZvY3VzLmRpc2FibGVkKSB7XG4gICAgbmV4dFRvRm9jdXMgPSBuZXdDYWxlbmRhci5xdWVyeVNlbGVjdG9yKENBTEVOREFSX1lFQVJfUElDS0VSKTtcbiAgfVxuICBuZXh0VG9Gb2N1cy5mb2N1cygpO1xufTtcblxuLyoqXG4gKiBOYXZpZ2F0ZSBmb3J3YXJkIGJ5IHllYXJzIGFuZCBkaXNwbGF5IHRoZSB5ZWFyIHNlbGVjdGlvbiBzY3JlZW4uXG4gKlxuICogQHBhcmFtIHtIVE1MQnV0dG9uRWxlbWVudH0gZWwgQW4gZWxlbWVudCB3aXRoaW4gdGhlIGRhdGUgcGlja2VyIGNvbXBvbmVudFxuICovXG5jb25zdCBkaXNwbGF5TmV4dFllYXJDaHVuayA9IChlbCkgPT4ge1xuICBpZiAoZWwuZGlzYWJsZWQpIHJldHVybjtcblxuICBjb25zdCB7IGNhbGVuZGFyRWwsIGNhbGVuZGFyRGF0ZSwgbWluRGF0ZSwgbWF4RGF0ZSB9ID1cbiAgICBnZXREYXRlUGlja2VyQ29udGV4dChlbCk7XG4gIGNvbnN0IHllYXJFbCA9IGNhbGVuZGFyRWwucXVlcnlTZWxlY3RvcihDQUxFTkRBUl9ZRUFSX0ZPQ1VTRUQpO1xuICBjb25zdCBzZWxlY3RlZFllYXIgPSBwYXJzZUludCh5ZWFyRWwudGV4dENvbnRlbnQsIDEwKTtcblxuICBsZXQgYWRqdXN0ZWRZZWFyID0gc2VsZWN0ZWRZZWFyICsgWUVBUl9DSFVOSztcbiAgYWRqdXN0ZWRZZWFyID0gTWF0aC5tYXgoMCwgYWRqdXN0ZWRZZWFyKTtcblxuICBjb25zdCBkYXRlID0gc2V0WWVhcihjYWxlbmRhckRhdGUsIGFkanVzdGVkWWVhcik7XG4gIGNvbnN0IGNhcHBlZERhdGUgPSBrZWVwRGF0ZUJldHdlZW5NaW5BbmRNYXgoZGF0ZSwgbWluRGF0ZSwgbWF4RGF0ZSk7XG4gIGNvbnN0IG5ld0NhbGVuZGFyID0gZGlzcGxheVllYXJTZWxlY3Rpb24oXG4gICAgY2FsZW5kYXJFbCxcbiAgICBjYXBwZWREYXRlLmdldEZ1bGxZZWFyKClcbiAgKTtcblxuICBsZXQgbmV4dFRvRm9jdXMgPSBuZXdDYWxlbmRhci5xdWVyeVNlbGVjdG9yKENBTEVOREFSX05FWFRfWUVBUl9DSFVOSyk7XG4gIGlmIChuZXh0VG9Gb2N1cy5kaXNhYmxlZCkge1xuICAgIG5leHRUb0ZvY3VzID0gbmV3Q2FsZW5kYXIucXVlcnlTZWxlY3RvcihDQUxFTkRBUl9ZRUFSX1BJQ0tFUik7XG4gIH1cbiAgbmV4dFRvRm9jdXMuZm9jdXMoKTtcbn07XG5cbi8qKlxuICogU2VsZWN0IGEgeWVhciBpbiB0aGUgZGF0ZSBwaWNrZXIgY29tcG9uZW50LlxuICpcbiAqIEBwYXJhbSB7SFRNTEJ1dHRvbkVsZW1lbnR9IHllYXJFbCBBIHllYXIgZWxlbWVudCB3aXRoaW4gdGhlIGRhdGUgcGlja2VyIGNvbXBvbmVudFxuICovXG5jb25zdCBzZWxlY3RZZWFyID0gKHllYXJFbCkgPT4ge1xuICBpZiAoeWVhckVsLmRpc2FibGVkKSByZXR1cm47XG4gIGNvbnN0IHsgY2FsZW5kYXJFbCwgY2FsZW5kYXJEYXRlLCBtaW5EYXRlLCBtYXhEYXRlIH0gPVxuICAgIGdldERhdGVQaWNrZXJDb250ZXh0KHllYXJFbCk7XG4gIGNvbnN0IHNlbGVjdGVkWWVhciA9IHBhcnNlSW50KHllYXJFbC5pbm5lckhUTUwsIDEwKTtcbiAgbGV0IGRhdGUgPSBzZXRZZWFyKGNhbGVuZGFyRGF0ZSwgc2VsZWN0ZWRZZWFyKTtcbiAgZGF0ZSA9IGtlZXBEYXRlQmV0d2Vlbk1pbkFuZE1heChkYXRlLCBtaW5EYXRlLCBtYXhEYXRlKTtcbiAgY29uc3QgbmV3Q2FsZW5kYXIgPSByZW5kZXJDYWxlbmRhcihjYWxlbmRhckVsLCBkYXRlKTtcbiAgbmV3Q2FsZW5kYXIucXVlcnlTZWxlY3RvcihDQUxFTkRBUl9EQVRFX0ZPQ1VTRUQpLmZvY3VzKCk7XG59O1xuXG4vLyAjZW5kcmVnaW9uIENhbGVuZGFyIC0gWWVhciBTZWxlY3Rpb24gVmlld1xuXG4vLyAjcmVnaW9uIENhbGVuZGFyIEV2ZW50IEhhbmRsaW5nXG5cbi8qKlxuICogSGlkZSB0aGUgY2FsZW5kYXIuXG4gKlxuICogQHBhcmFtIHtLZXlib2FyZEV2ZW50fSBldmVudCB0aGUga2V5ZG93biBldmVudFxuICovXG5jb25zdCBoYW5kbGVFc2NhcGVGcm9tQ2FsZW5kYXIgPSAoZXZlbnQpID0+IHtcbiAgY29uc3QgeyBkYXRlUGlja2VyRWwsIGV4dGVybmFsSW5wdXRFbCB9ID0gZ2V0RGF0ZVBpY2tlckNvbnRleHQoZXZlbnQudGFyZ2V0KTtcblxuICBoaWRlQ2FsZW5kYXIoZGF0ZVBpY2tlckVsKTtcbiAgZXh0ZXJuYWxJbnB1dEVsLmZvY3VzKCk7XG5cbiAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbn07XG5cbi8vICNlbmRyZWdpb24gQ2FsZW5kYXIgRXZlbnQgSGFuZGxpbmdcblxuLy8gI3JlZ2lvbiBDYWxlbmRhciBEYXRlIEV2ZW50IEhhbmRsaW5nXG5cbi8qKlxuICogQWRqdXN0IHRoZSBkYXRlIGFuZCBkaXNwbGF5IHRoZSBjYWxlbmRhciBpZiBuZWVkZWQuXG4gKlxuICogQHBhcmFtIHtmdW5jdGlvbn0gYWRqdXN0RGF0ZUZuIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyB0aGUgYWRqdXN0ZWQgZGF0ZVxuICovXG5jb25zdCBhZGp1c3RDYWxlbmRhciA9IChhZGp1c3REYXRlRm4pID0+IChldmVudCkgPT4ge1xuICBjb25zdCB7IGNhbGVuZGFyRWwsIGNhbGVuZGFyRGF0ZSwgbWluRGF0ZSwgbWF4RGF0ZSB9ID0gZ2V0RGF0ZVBpY2tlckNvbnRleHQoXG4gICAgZXZlbnQudGFyZ2V0XG4gICk7XG5cbiAgY29uc3QgZGF0ZSA9IGFkanVzdERhdGVGbihjYWxlbmRhckRhdGUpO1xuXG4gIGNvbnN0IGNhcHBlZERhdGUgPSBrZWVwRGF0ZUJldHdlZW5NaW5BbmRNYXgoZGF0ZSwgbWluRGF0ZSwgbWF4RGF0ZSk7XG4gIGlmICghaXNTYW1lRGF5KGNhbGVuZGFyRGF0ZSwgY2FwcGVkRGF0ZSkpIHtcbiAgICBjb25zdCBuZXdDYWxlbmRhciA9IHJlbmRlckNhbGVuZGFyKGNhbGVuZGFyRWwsIGNhcHBlZERhdGUpO1xuICAgIG5ld0NhbGVuZGFyLnF1ZXJ5U2VsZWN0b3IoQ0FMRU5EQVJfREFURV9GT0NVU0VEKS5mb2N1cygpO1xuICB9XG4gIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG59O1xuXG4vKipcbiAqIE5hdmlnYXRlIGJhY2sgb25lIHdlZWsgYW5kIGRpc3BsYXkgdGhlIGNhbGVuZGFyLlxuICpcbiAqIEBwYXJhbSB7S2V5Ym9hcmRFdmVudH0gZXZlbnQgdGhlIGtleWRvd24gZXZlbnRcbiAqL1xuY29uc3QgaGFuZGxlVXBGcm9tRGF0ZSA9IGFkanVzdENhbGVuZGFyKChkYXRlKSA9PiBzdWJXZWVrcyhkYXRlLCAxKSk7XG5cbi8qKlxuICogTmF2aWdhdGUgZm9yd2FyZCBvbmUgd2VlayBhbmQgZGlzcGxheSB0aGUgY2FsZW5kYXIuXG4gKlxuICogQHBhcmFtIHtLZXlib2FyZEV2ZW50fSBldmVudCB0aGUga2V5ZG93biBldmVudFxuICovXG5jb25zdCBoYW5kbGVEb3duRnJvbURhdGUgPSBhZGp1c3RDYWxlbmRhcigoZGF0ZSkgPT4gYWRkV2Vla3MoZGF0ZSwgMSkpO1xuXG4vKipcbiAqIE5hdmlnYXRlIGJhY2sgb25lIGRheSBhbmQgZGlzcGxheSB0aGUgY2FsZW5kYXIuXG4gKlxuICogQHBhcmFtIHtLZXlib2FyZEV2ZW50fSBldmVudCB0aGUga2V5ZG93biBldmVudFxuICovXG5jb25zdCBoYW5kbGVMZWZ0RnJvbURhdGUgPSBhZGp1c3RDYWxlbmRhcigoZGF0ZSkgPT4gc3ViRGF5cyhkYXRlLCAxKSk7XG5cbi8qKlxuICogTmF2aWdhdGUgZm9yd2FyZCBvbmUgZGF5IGFuZCBkaXNwbGF5IHRoZSBjYWxlbmRhci5cbiAqXG4gKiBAcGFyYW0ge0tleWJvYXJkRXZlbnR9IGV2ZW50IHRoZSBrZXlkb3duIGV2ZW50XG4gKi9cbmNvbnN0IGhhbmRsZVJpZ2h0RnJvbURhdGUgPSBhZGp1c3RDYWxlbmRhcigoZGF0ZSkgPT4gYWRkRGF5cyhkYXRlLCAxKSk7XG5cbi8qKlxuICogTmF2aWdhdGUgdG8gdGhlIHN0YXJ0IG9mIHRoZSB3ZWVrIGFuZCBkaXNwbGF5IHRoZSBjYWxlbmRhci5cbiAqXG4gKiBAcGFyYW0ge0tleWJvYXJkRXZlbnR9IGV2ZW50IHRoZSBrZXlkb3duIGV2ZW50XG4gKi9cbmNvbnN0IGhhbmRsZUhvbWVGcm9tRGF0ZSA9IGFkanVzdENhbGVuZGFyKChkYXRlKSA9PiBzdGFydE9mV2VlayhkYXRlKSk7XG5cbi8qKlxuICogTmF2aWdhdGUgdG8gdGhlIGVuZCBvZiB0aGUgd2VlayBhbmQgZGlzcGxheSB0aGUgY2FsZW5kYXIuXG4gKlxuICogQHBhcmFtIHtLZXlib2FyZEV2ZW50fSBldmVudCB0aGUga2V5ZG93biBldmVudFxuICovXG5jb25zdCBoYW5kbGVFbmRGcm9tRGF0ZSA9IGFkanVzdENhbGVuZGFyKChkYXRlKSA9PiBlbmRPZldlZWsoZGF0ZSkpO1xuXG4vKipcbiAqIE5hdmlnYXRlIGZvcndhcmQgb25lIG1vbnRoIGFuZCBkaXNwbGF5IHRoZSBjYWxlbmRhci5cbiAqXG4gKiBAcGFyYW0ge0tleWJvYXJkRXZlbnR9IGV2ZW50IHRoZSBrZXlkb3duIGV2ZW50XG4gKi9cbmNvbnN0IGhhbmRsZVBhZ2VEb3duRnJvbURhdGUgPSBhZGp1c3RDYWxlbmRhcigoZGF0ZSkgPT4gYWRkTW9udGhzKGRhdGUsIDEpKTtcblxuLyoqXG4gKiBOYXZpZ2F0ZSBiYWNrIG9uZSBtb250aCBhbmQgZGlzcGxheSB0aGUgY2FsZW5kYXIuXG4gKlxuICogQHBhcmFtIHtLZXlib2FyZEV2ZW50fSBldmVudCB0aGUga2V5ZG93biBldmVudFxuICovXG5jb25zdCBoYW5kbGVQYWdlVXBGcm9tRGF0ZSA9IGFkanVzdENhbGVuZGFyKChkYXRlKSA9PiBzdWJNb250aHMoZGF0ZSwgMSkpO1xuXG4vKipcbiAqIE5hdmlnYXRlIGZvcndhcmQgb25lIHllYXIgYW5kIGRpc3BsYXkgdGhlIGNhbGVuZGFyLlxuICpcbiAqIEBwYXJhbSB7S2V5Ym9hcmRFdmVudH0gZXZlbnQgdGhlIGtleWRvd24gZXZlbnRcbiAqL1xuY29uc3QgaGFuZGxlU2hpZnRQYWdlRG93bkZyb21EYXRlID0gYWRqdXN0Q2FsZW5kYXIoKGRhdGUpID0+IGFkZFllYXJzKGRhdGUsIDEpKTtcblxuLyoqXG4gKiBOYXZpZ2F0ZSBiYWNrIG9uZSB5ZWFyIGFuZCBkaXNwbGF5IHRoZSBjYWxlbmRhci5cbiAqXG4gKiBAcGFyYW0ge0tleWJvYXJkRXZlbnR9IGV2ZW50IHRoZSBrZXlkb3duIGV2ZW50XG4gKi9cbmNvbnN0IGhhbmRsZVNoaWZ0UGFnZVVwRnJvbURhdGUgPSBhZGp1c3RDYWxlbmRhcigoZGF0ZSkgPT4gc3ViWWVhcnMoZGF0ZSwgMSkpO1xuXG4vKipcbiAqIGRpc3BsYXkgdGhlIGNhbGVuZGFyIGZvciB0aGUgbW91c2VvdmVyIGRhdGUuXG4gKlxuICogQHBhcmFtIHtNb3VzZUV2ZW50fSBldmVudCBUaGUgbW91c2VvdmVyIGV2ZW50XG4gKiBAcGFyYW0ge0hUTUxCdXR0b25FbGVtZW50fSBkYXRlRWwgQSBkYXRlIGVsZW1lbnQgd2l0aGluIHRoZSBkYXRlIHBpY2tlciBjb21wb25lbnRcbiAqL1xuY29uc3QgaGFuZGxlTW91c2VvdmVyRnJvbURhdGUgPSAoZGF0ZUVsKSA9PiB7XG4gIGlmIChkYXRlRWwuZGlzYWJsZWQpIHJldHVybjtcblxuICBjb25zdCBjYWxlbmRhckVsID0gZGF0ZUVsLmNsb3Nlc3QoREFURV9QSUNLRVJfQ0FMRU5EQVIpO1xuXG4gIGNvbnN0IGN1cnJlbnRDYWxlbmRhckRhdGUgPSBjYWxlbmRhckVsLmRhdGFzZXQudmFsdWU7XG4gIGNvbnN0IGhvdmVyRGF0ZSA9IGRhdGVFbC5kYXRhc2V0LnZhbHVlO1xuXG4gIGlmIChob3ZlckRhdGUgPT09IGN1cnJlbnRDYWxlbmRhckRhdGUpIHJldHVybjtcblxuICBjb25zdCBkYXRlVG9EaXNwbGF5ID0gcGFyc2VEYXRlU3RyaW5nKGhvdmVyRGF0ZSk7XG4gIGNvbnN0IG5ld0NhbGVuZGFyID0gcmVuZGVyQ2FsZW5kYXIoY2FsZW5kYXJFbCwgZGF0ZVRvRGlzcGxheSk7XG4gIG5ld0NhbGVuZGFyLnF1ZXJ5U2VsZWN0b3IoQ0FMRU5EQVJfREFURV9GT0NVU0VEKS5mb2N1cygpO1xufTtcblxuLy8gI2VuZHJlZ2lvbiBDYWxlbmRhciBEYXRlIEV2ZW50IEhhbmRsaW5nXG5cbi8vICNyZWdpb24gQ2FsZW5kYXIgTW9udGggRXZlbnQgSGFuZGxpbmdcblxuLyoqXG4gKiBBZGp1c3QgdGhlIG1vbnRoIGFuZCBkaXNwbGF5IHRoZSBtb250aCBzZWxlY3Rpb24gc2NyZWVuIGlmIG5lZWRlZC5cbiAqXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBhZGp1c3RNb250aEZuIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyB0aGUgYWRqdXN0ZWQgbW9udGhcbiAqL1xuY29uc3QgYWRqdXN0TW9udGhTZWxlY3Rpb25TY3JlZW4gPSAoYWRqdXN0TW9udGhGbikgPT4gKGV2ZW50KSA9PiB7XG4gIGNvbnN0IG1vbnRoRWwgPSBldmVudC50YXJnZXQ7XG4gIGNvbnN0IHNlbGVjdGVkTW9udGggPSBwYXJzZUludChtb250aEVsLmRhdGFzZXQudmFsdWUsIDEwKTtcbiAgY29uc3QgeyBjYWxlbmRhckVsLCBjYWxlbmRhckRhdGUsIG1pbkRhdGUsIG1heERhdGUgfSA9XG4gICAgZ2V0RGF0ZVBpY2tlckNvbnRleHQobW9udGhFbCk7XG4gIGNvbnN0IGN1cnJlbnREYXRlID0gc2V0TW9udGgoY2FsZW5kYXJEYXRlLCBzZWxlY3RlZE1vbnRoKTtcblxuICBsZXQgYWRqdXN0ZWRNb250aCA9IGFkanVzdE1vbnRoRm4oc2VsZWN0ZWRNb250aCk7XG4gIGFkanVzdGVkTW9udGggPSBNYXRoLm1heCgwLCBNYXRoLm1pbigxMSwgYWRqdXN0ZWRNb250aCkpO1xuXG4gIGNvbnN0IGRhdGUgPSBzZXRNb250aChjYWxlbmRhckRhdGUsIGFkanVzdGVkTW9udGgpO1xuICBjb25zdCBjYXBwZWREYXRlID0ga2VlcERhdGVCZXR3ZWVuTWluQW5kTWF4KGRhdGUsIG1pbkRhdGUsIG1heERhdGUpO1xuICBpZiAoIWlzU2FtZU1vbnRoKGN1cnJlbnREYXRlLCBjYXBwZWREYXRlKSkge1xuICAgIGNvbnN0IG5ld0NhbGVuZGFyID0gZGlzcGxheU1vbnRoU2VsZWN0aW9uKFxuICAgICAgY2FsZW5kYXJFbCxcbiAgICAgIGNhcHBlZERhdGUuZ2V0TW9udGgoKVxuICAgICk7XG4gICAgbmV3Q2FsZW5kYXIucXVlcnlTZWxlY3RvcihDQUxFTkRBUl9NT05USF9GT0NVU0VEKS5mb2N1cygpO1xuICB9XG4gIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG59O1xuXG4vKipcbiAqIE5hdmlnYXRlIGJhY2sgdGhyZWUgbW9udGhzIGFuZCBkaXNwbGF5IHRoZSBtb250aCBzZWxlY3Rpb24gc2NyZWVuLlxuICpcbiAqIEBwYXJhbSB7S2V5Ym9hcmRFdmVudH0gZXZlbnQgdGhlIGtleWRvd24gZXZlbnRcbiAqL1xuY29uc3QgaGFuZGxlVXBGcm9tTW9udGggPSBhZGp1c3RNb250aFNlbGVjdGlvblNjcmVlbigobW9udGgpID0+IG1vbnRoIC0gMyk7XG5cbi8qKlxuICogTmF2aWdhdGUgZm9yd2FyZCB0aHJlZSBtb250aHMgYW5kIGRpc3BsYXkgdGhlIG1vbnRoIHNlbGVjdGlvbiBzY3JlZW4uXG4gKlxuICogQHBhcmFtIHtLZXlib2FyZEV2ZW50fSBldmVudCB0aGUga2V5ZG93biBldmVudFxuICovXG5jb25zdCBoYW5kbGVEb3duRnJvbU1vbnRoID0gYWRqdXN0TW9udGhTZWxlY3Rpb25TY3JlZW4oKG1vbnRoKSA9PiBtb250aCArIDMpO1xuXG4vKipcbiAqIE5hdmlnYXRlIGJhY2sgb25lIG1vbnRoIGFuZCBkaXNwbGF5IHRoZSBtb250aCBzZWxlY3Rpb24gc2NyZWVuLlxuICpcbiAqIEBwYXJhbSB7S2V5Ym9hcmRFdmVudH0gZXZlbnQgdGhlIGtleWRvd24gZXZlbnRcbiAqL1xuY29uc3QgaGFuZGxlTGVmdEZyb21Nb250aCA9IGFkanVzdE1vbnRoU2VsZWN0aW9uU2NyZWVuKChtb250aCkgPT4gbW9udGggLSAxKTtcblxuLyoqXG4gKiBOYXZpZ2F0ZSBmb3J3YXJkIG9uZSBtb250aCBhbmQgZGlzcGxheSB0aGUgbW9udGggc2VsZWN0aW9uIHNjcmVlbi5cbiAqXG4gKiBAcGFyYW0ge0tleWJvYXJkRXZlbnR9IGV2ZW50IHRoZSBrZXlkb3duIGV2ZW50XG4gKi9cbmNvbnN0IGhhbmRsZVJpZ2h0RnJvbU1vbnRoID0gYWRqdXN0TW9udGhTZWxlY3Rpb25TY3JlZW4oKG1vbnRoKSA9PiBtb250aCArIDEpO1xuXG4vKipcbiAqIE5hdmlnYXRlIHRvIHRoZSBzdGFydCBvZiB0aGUgcm93IG9mIG1vbnRocyBhbmQgZGlzcGxheSB0aGUgbW9udGggc2VsZWN0aW9uIHNjcmVlbi5cbiAqXG4gKiBAcGFyYW0ge0tleWJvYXJkRXZlbnR9IGV2ZW50IHRoZSBrZXlkb3duIGV2ZW50XG4gKi9cbmNvbnN0IGhhbmRsZUhvbWVGcm9tTW9udGggPSBhZGp1c3RNb250aFNlbGVjdGlvblNjcmVlbihcbiAgKG1vbnRoKSA9PiBtb250aCAtIChtb250aCAlIDMpXG4pO1xuXG4vKipcbiAqIE5hdmlnYXRlIHRvIHRoZSBlbmQgb2YgdGhlIHJvdyBvZiBtb250aHMgYW5kIGRpc3BsYXkgdGhlIG1vbnRoIHNlbGVjdGlvbiBzY3JlZW4uXG4gKlxuICogQHBhcmFtIHtLZXlib2FyZEV2ZW50fSBldmVudCB0aGUga2V5ZG93biBldmVudFxuICovXG5jb25zdCBoYW5kbGVFbmRGcm9tTW9udGggPSBhZGp1c3RNb250aFNlbGVjdGlvblNjcmVlbihcbiAgKG1vbnRoKSA9PiBtb250aCArIDIgLSAobW9udGggJSAzKVxuKTtcblxuLyoqXG4gKiBOYXZpZ2F0ZSB0byB0aGUgbGFzdCBtb250aCAoRGVjZW1iZXIpIGFuZCBkaXNwbGF5IHRoZSBtb250aCBzZWxlY3Rpb24gc2NyZWVuLlxuICpcbiAqIEBwYXJhbSB7S2V5Ym9hcmRFdmVudH0gZXZlbnQgdGhlIGtleWRvd24gZXZlbnRcbiAqL1xuY29uc3QgaGFuZGxlUGFnZURvd25Gcm9tTW9udGggPSBhZGp1c3RNb250aFNlbGVjdGlvblNjcmVlbigoKSA9PiAxMSk7XG5cbi8qKlxuICogTmF2aWdhdGUgdG8gdGhlIGZpcnN0IG1vbnRoIChKYW51YXJ5KSBhbmQgZGlzcGxheSB0aGUgbW9udGggc2VsZWN0aW9uIHNjcmVlbi5cbiAqXG4gKiBAcGFyYW0ge0tleWJvYXJkRXZlbnR9IGV2ZW50IHRoZSBrZXlkb3duIGV2ZW50XG4gKi9cbmNvbnN0IGhhbmRsZVBhZ2VVcEZyb21Nb250aCA9IGFkanVzdE1vbnRoU2VsZWN0aW9uU2NyZWVuKCgpID0+IDApO1xuXG4vKipcbiAqIHVwZGF0ZSB0aGUgZm9jdXMgb24gYSBtb250aCB3aGVuIHRoZSBtb3VzZSBtb3Zlcy5cbiAqXG4gKiBAcGFyYW0ge01vdXNlRXZlbnR9IGV2ZW50IFRoZSBtb3VzZW92ZXIgZXZlbnRcbiAqIEBwYXJhbSB7SFRNTEJ1dHRvbkVsZW1lbnR9IG1vbnRoRWwgQSBtb250aCBlbGVtZW50IHdpdGhpbiB0aGUgZGF0ZSBwaWNrZXIgY29tcG9uZW50XG4gKi9cbmNvbnN0IGhhbmRsZU1vdXNlb3ZlckZyb21Nb250aCA9IChtb250aEVsKSA9PiB7XG4gIGlmIChtb250aEVsLmRpc2FibGVkKSByZXR1cm47XG4gIGlmIChtb250aEVsLmNsYXNzTGlzdC5jb250YWlucyhDQUxFTkRBUl9NT05USF9GT0NVU0VEX0NMQVNTKSkgcmV0dXJuO1xuXG4gIGNvbnN0IGZvY3VzTW9udGggPSBwYXJzZUludChtb250aEVsLmRhdGFzZXQudmFsdWUsIDEwKTtcblxuICBjb25zdCBuZXdDYWxlbmRhciA9IGRpc3BsYXlNb250aFNlbGVjdGlvbihtb250aEVsLCBmb2N1c01vbnRoKTtcbiAgbmV3Q2FsZW5kYXIucXVlcnlTZWxlY3RvcihDQUxFTkRBUl9NT05USF9GT0NVU0VEKS5mb2N1cygpO1xufTtcblxuLy8gI2VuZHJlZ2lvbiBDYWxlbmRhciBNb250aCBFdmVudCBIYW5kbGluZ1xuXG4vLyAjcmVnaW9uIENhbGVuZGFyIFllYXIgRXZlbnQgSGFuZGxpbmdcblxuLyoqXG4gKiBBZGp1c3QgdGhlIHllYXIgYW5kIGRpc3BsYXkgdGhlIHllYXIgc2VsZWN0aW9uIHNjcmVlbiBpZiBuZWVkZWQuXG4gKlxuICogQHBhcmFtIHtmdW5jdGlvbn0gYWRqdXN0WWVhckZuIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyB0aGUgYWRqdXN0ZWQgeWVhclxuICovXG5jb25zdCBhZGp1c3RZZWFyU2VsZWN0aW9uU2NyZWVuID0gKGFkanVzdFllYXJGbikgPT4gKGV2ZW50KSA9PiB7XG4gIGNvbnN0IHllYXJFbCA9IGV2ZW50LnRhcmdldDtcbiAgY29uc3Qgc2VsZWN0ZWRZZWFyID0gcGFyc2VJbnQoeWVhckVsLmRhdGFzZXQudmFsdWUsIDEwKTtcbiAgY29uc3QgeyBjYWxlbmRhckVsLCBjYWxlbmRhckRhdGUsIG1pbkRhdGUsIG1heERhdGUgfSA9XG4gICAgZ2V0RGF0ZVBpY2tlckNvbnRleHQoeWVhckVsKTtcbiAgY29uc3QgY3VycmVudERhdGUgPSBzZXRZZWFyKGNhbGVuZGFyRGF0ZSwgc2VsZWN0ZWRZZWFyKTtcblxuICBsZXQgYWRqdXN0ZWRZZWFyID0gYWRqdXN0WWVhckZuKHNlbGVjdGVkWWVhcik7XG4gIGFkanVzdGVkWWVhciA9IE1hdGgubWF4KDAsIGFkanVzdGVkWWVhcik7XG5cbiAgY29uc3QgZGF0ZSA9IHNldFllYXIoY2FsZW5kYXJEYXRlLCBhZGp1c3RlZFllYXIpO1xuICBjb25zdCBjYXBwZWREYXRlID0ga2VlcERhdGVCZXR3ZWVuTWluQW5kTWF4KGRhdGUsIG1pbkRhdGUsIG1heERhdGUpO1xuICBpZiAoIWlzU2FtZVllYXIoY3VycmVudERhdGUsIGNhcHBlZERhdGUpKSB7XG4gICAgY29uc3QgbmV3Q2FsZW5kYXIgPSBkaXNwbGF5WWVhclNlbGVjdGlvbihcbiAgICAgIGNhbGVuZGFyRWwsXG4gICAgICBjYXBwZWREYXRlLmdldEZ1bGxZZWFyKClcbiAgICApO1xuICAgIG5ld0NhbGVuZGFyLnF1ZXJ5U2VsZWN0b3IoQ0FMRU5EQVJfWUVBUl9GT0NVU0VEKS5mb2N1cygpO1xuICB9XG4gIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG59O1xuXG4vKipcbiAqIE5hdmlnYXRlIGJhY2sgdGhyZWUgeWVhcnMgYW5kIGRpc3BsYXkgdGhlIHllYXIgc2VsZWN0aW9uIHNjcmVlbi5cbiAqXG4gKiBAcGFyYW0ge0tleWJvYXJkRXZlbnR9IGV2ZW50IHRoZSBrZXlkb3duIGV2ZW50XG4gKi9cbmNvbnN0IGhhbmRsZVVwRnJvbVllYXIgPSBhZGp1c3RZZWFyU2VsZWN0aW9uU2NyZWVuKCh5ZWFyKSA9PiB5ZWFyIC0gMyk7XG5cbi8qKlxuICogTmF2aWdhdGUgZm9yd2FyZCB0aHJlZSB5ZWFycyBhbmQgZGlzcGxheSB0aGUgeWVhciBzZWxlY3Rpb24gc2NyZWVuLlxuICpcbiAqIEBwYXJhbSB7S2V5Ym9hcmRFdmVudH0gZXZlbnQgdGhlIGtleWRvd24gZXZlbnRcbiAqL1xuY29uc3QgaGFuZGxlRG93bkZyb21ZZWFyID0gYWRqdXN0WWVhclNlbGVjdGlvblNjcmVlbigoeWVhcikgPT4geWVhciArIDMpO1xuXG4vKipcbiAqIE5hdmlnYXRlIGJhY2sgb25lIHllYXIgYW5kIGRpc3BsYXkgdGhlIHllYXIgc2VsZWN0aW9uIHNjcmVlbi5cbiAqXG4gKiBAcGFyYW0ge0tleWJvYXJkRXZlbnR9IGV2ZW50IHRoZSBrZXlkb3duIGV2ZW50XG4gKi9cbmNvbnN0IGhhbmRsZUxlZnRGcm9tWWVhciA9IGFkanVzdFllYXJTZWxlY3Rpb25TY3JlZW4oKHllYXIpID0+IHllYXIgLSAxKTtcblxuLyoqXG4gKiBOYXZpZ2F0ZSBmb3J3YXJkIG9uZSB5ZWFyIGFuZCBkaXNwbGF5IHRoZSB5ZWFyIHNlbGVjdGlvbiBzY3JlZW4uXG4gKlxuICogQHBhcmFtIHtLZXlib2FyZEV2ZW50fSBldmVudCB0aGUga2V5ZG93biBldmVudFxuICovXG5jb25zdCBoYW5kbGVSaWdodEZyb21ZZWFyID0gYWRqdXN0WWVhclNlbGVjdGlvblNjcmVlbigoeWVhcikgPT4geWVhciArIDEpO1xuXG4vKipcbiAqIE5hdmlnYXRlIHRvIHRoZSBzdGFydCBvZiB0aGUgcm93IG9mIHllYXJzIGFuZCBkaXNwbGF5IHRoZSB5ZWFyIHNlbGVjdGlvbiBzY3JlZW4uXG4gKlxuICogQHBhcmFtIHtLZXlib2FyZEV2ZW50fSBldmVudCB0aGUga2V5ZG93biBldmVudFxuICovXG5jb25zdCBoYW5kbGVIb21lRnJvbVllYXIgPSBhZGp1c3RZZWFyU2VsZWN0aW9uU2NyZWVuKFxuICAoeWVhcikgPT4geWVhciAtICh5ZWFyICUgMylcbik7XG5cbi8qKlxuICogTmF2aWdhdGUgdG8gdGhlIGVuZCBvZiB0aGUgcm93IG9mIHllYXJzIGFuZCBkaXNwbGF5IHRoZSB5ZWFyIHNlbGVjdGlvbiBzY3JlZW4uXG4gKlxuICogQHBhcmFtIHtLZXlib2FyZEV2ZW50fSBldmVudCB0aGUga2V5ZG93biBldmVudFxuICovXG5jb25zdCBoYW5kbGVFbmRGcm9tWWVhciA9IGFkanVzdFllYXJTZWxlY3Rpb25TY3JlZW4oXG4gICh5ZWFyKSA9PiB5ZWFyICsgMiAtICh5ZWFyICUgMylcbik7XG5cbi8qKlxuICogTmF2aWdhdGUgdG8gYmFjayAxMiB5ZWFycyBhbmQgZGlzcGxheSB0aGUgeWVhciBzZWxlY3Rpb24gc2NyZWVuLlxuICpcbiAqIEBwYXJhbSB7S2V5Ym9hcmRFdmVudH0gZXZlbnQgdGhlIGtleWRvd24gZXZlbnRcbiAqL1xuY29uc3QgaGFuZGxlUGFnZVVwRnJvbVllYXIgPSBhZGp1c3RZZWFyU2VsZWN0aW9uU2NyZWVuKFxuICAoeWVhcikgPT4geWVhciAtIFlFQVJfQ0hVTktcbik7XG5cbi8qKlxuICogTmF2aWdhdGUgZm9yd2FyZCAxMiB5ZWFycyBhbmQgZGlzcGxheSB0aGUgeWVhciBzZWxlY3Rpb24gc2NyZWVuLlxuICpcbiAqIEBwYXJhbSB7S2V5Ym9hcmRFdmVudH0gZXZlbnQgdGhlIGtleWRvd24gZXZlbnRcbiAqL1xuY29uc3QgaGFuZGxlUGFnZURvd25Gcm9tWWVhciA9IGFkanVzdFllYXJTZWxlY3Rpb25TY3JlZW4oXG4gICh5ZWFyKSA9PiB5ZWFyICsgWUVBUl9DSFVOS1xuKTtcblxuLyoqXG4gKiB1cGRhdGUgdGhlIGZvY3VzIG9uIGEgeWVhciB3aGVuIHRoZSBtb3VzZSBtb3Zlcy5cbiAqXG4gKiBAcGFyYW0ge01vdXNlRXZlbnR9IGV2ZW50IFRoZSBtb3VzZW92ZXIgZXZlbnRcbiAqIEBwYXJhbSB7SFRNTEJ1dHRvbkVsZW1lbnR9IGRhdGVFbCBBIHllYXIgZWxlbWVudCB3aXRoaW4gdGhlIGRhdGUgcGlja2VyIGNvbXBvbmVudFxuICovXG5jb25zdCBoYW5kbGVNb3VzZW92ZXJGcm9tWWVhciA9ICh5ZWFyRWwpID0+IHtcbiAgaWYgKHllYXJFbC5kaXNhYmxlZCkgcmV0dXJuO1xuICBpZiAoeWVhckVsLmNsYXNzTGlzdC5jb250YWlucyhDQUxFTkRBUl9ZRUFSX0ZPQ1VTRURfQ0xBU1MpKSByZXR1cm47XG5cbiAgY29uc3QgZm9jdXNZZWFyID0gcGFyc2VJbnQoeWVhckVsLmRhdGFzZXQudmFsdWUsIDEwKTtcblxuICBjb25zdCBuZXdDYWxlbmRhciA9IGRpc3BsYXlZZWFyU2VsZWN0aW9uKHllYXJFbCwgZm9jdXNZZWFyKTtcbiAgbmV3Q2FsZW5kYXIucXVlcnlTZWxlY3RvcihDQUxFTkRBUl9ZRUFSX0ZPQ1VTRUQpLmZvY3VzKCk7XG59O1xuXG4vLyAjZW5kcmVnaW9uIENhbGVuZGFyIFllYXIgRXZlbnQgSGFuZGxpbmdcblxuLy8gI3JlZ2lvbiBGb2N1cyBIYW5kbGluZyBFdmVudCBIYW5kbGluZ1xuXG5jb25zdCB0YWJIYW5kbGVyID0gKGZvY3VzYWJsZSkgPT4ge1xuICBjb25zdCBnZXRGb2N1c2FibGVDb250ZXh0ID0gKGVsKSA9PiB7XG4gICAgY29uc3QgeyBjYWxlbmRhckVsIH0gPSBnZXREYXRlUGlja2VyQ29udGV4dChlbCk7XG4gICAgY29uc3QgZm9jdXNhYmxlRWxlbWVudHMgPSBzZWxlY3QoZm9jdXNhYmxlLCBjYWxlbmRhckVsKTtcblxuICAgIGNvbnN0IGZpcnN0VGFiSW5kZXggPSAwO1xuICAgIGNvbnN0IGxhc3RUYWJJbmRleCA9IGZvY3VzYWJsZUVsZW1lbnRzLmxlbmd0aCAtIDE7XG4gICAgY29uc3QgZmlyc3RUYWJTdG9wID0gZm9jdXNhYmxlRWxlbWVudHNbZmlyc3RUYWJJbmRleF07XG4gICAgY29uc3QgbGFzdFRhYlN0b3AgPSBmb2N1c2FibGVFbGVtZW50c1tsYXN0VGFiSW5kZXhdO1xuICAgIGNvbnN0IGZvY3VzSW5kZXggPSBmb2N1c2FibGVFbGVtZW50cy5pbmRleE9mKGFjdGl2ZUVsZW1lbnQoKSk7XG5cbiAgICBjb25zdCBpc0xhc3RUYWIgPSBmb2N1c0luZGV4ID09PSBsYXN0VGFiSW5kZXg7XG4gICAgY29uc3QgaXNGaXJzdFRhYiA9IGZvY3VzSW5kZXggPT09IGZpcnN0VGFiSW5kZXg7XG4gICAgY29uc3QgaXNOb3RGb3VuZCA9IGZvY3VzSW5kZXggPT09IC0xO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIGZvY3VzYWJsZUVsZW1lbnRzLFxuICAgICAgaXNOb3RGb3VuZCxcbiAgICAgIGZpcnN0VGFiU3RvcCxcbiAgICAgIGlzRmlyc3RUYWIsXG4gICAgICBsYXN0VGFiU3RvcCxcbiAgICAgIGlzTGFzdFRhYixcbiAgICB9O1xuICB9O1xuXG4gIHJldHVybiB7XG4gICAgdGFiQWhlYWQoZXZlbnQpIHtcbiAgICAgIGNvbnN0IHsgZmlyc3RUYWJTdG9wLCBpc0xhc3RUYWIsIGlzTm90Rm91bmQgfSA9IGdldEZvY3VzYWJsZUNvbnRleHQoXG4gICAgICAgIGV2ZW50LnRhcmdldFxuICAgICAgKTtcblxuICAgICAgaWYgKGlzTGFzdFRhYiB8fCBpc05vdEZvdW5kKSB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGZpcnN0VGFiU3RvcC5mb2N1cygpO1xuICAgICAgfVxuICAgIH0sXG4gICAgdGFiQmFjayhldmVudCkge1xuICAgICAgY29uc3QgeyBsYXN0VGFiU3RvcCwgaXNGaXJzdFRhYiwgaXNOb3RGb3VuZCB9ID0gZ2V0Rm9jdXNhYmxlQ29udGV4dChcbiAgICAgICAgZXZlbnQudGFyZ2V0XG4gICAgICApO1xuXG4gICAgICBpZiAoaXNGaXJzdFRhYiB8fCBpc05vdEZvdW5kKSB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGxhc3RUYWJTdG9wLmZvY3VzKCk7XG4gICAgICB9XG4gICAgfSxcbiAgfTtcbn07XG5cbmNvbnN0IGRhdGVQaWNrZXJUYWJFdmVudEhhbmRsZXIgPSB0YWJIYW5kbGVyKERBVEVfUElDS0VSX0ZPQ1VTQUJMRSk7XG5jb25zdCBtb250aFBpY2tlclRhYkV2ZW50SGFuZGxlciA9IHRhYkhhbmRsZXIoTU9OVEhfUElDS0VSX0ZPQ1VTQUJMRSk7XG5jb25zdCB5ZWFyUGlja2VyVGFiRXZlbnRIYW5kbGVyID0gdGFiSGFuZGxlcihZRUFSX1BJQ0tFUl9GT0NVU0FCTEUpO1xuXG4vLyAjZW5kcmVnaW9uIEZvY3VzIEhhbmRsaW5nIEV2ZW50IEhhbmRsaW5nXG5cbi8vICNyZWdpb24gRGF0ZSBQaWNrZXIgRXZlbnQgRGVsZWdhdGlvbiBSZWdpc3RyYXRpb24gLyBDb21wb25lbnRcblxuY29uc3QgZGF0ZVBpY2tlckV2ZW50cyA9IHtcbiAgW0NMSUNLXToge1xuICAgIFtEQVRFX1BJQ0tFUl9CVVRUT05dKCkge1xuICAgICAgdG9nZ2xlQ2FsZW5kYXIodGhpcyk7XG4gICAgfSxcbiAgICBbQ0FMRU5EQVJfREFURV0oKSB7XG4gICAgICBzZWxlY3REYXRlKHRoaXMpO1xuICAgIH0sXG4gICAgW0NBTEVOREFSX01PTlRIXSgpIHtcbiAgICAgIHNlbGVjdE1vbnRoKHRoaXMpO1xuICAgIH0sXG4gICAgW0NBTEVOREFSX1lFQVJdKCkge1xuICAgICAgc2VsZWN0WWVhcih0aGlzKTtcbiAgICB9LFxuICAgIFtDQUxFTkRBUl9QUkVWSU9VU19NT05USF0oKSB7XG4gICAgICBkaXNwbGF5UHJldmlvdXNNb250aCh0aGlzKTtcbiAgICB9LFxuICAgIFtDQUxFTkRBUl9ORVhUX01PTlRIXSgpIHtcbiAgICAgIGRpc3BsYXlOZXh0TW9udGgodGhpcyk7XG4gICAgfSxcbiAgICBbQ0FMRU5EQVJfUFJFVklPVVNfWUVBUl0oKSB7XG4gICAgICBkaXNwbGF5UHJldmlvdXNZZWFyKHRoaXMpO1xuICAgIH0sXG4gICAgW0NBTEVOREFSX05FWFRfWUVBUl0oKSB7XG4gICAgICBkaXNwbGF5TmV4dFllYXIodGhpcyk7XG4gICAgfSxcbiAgICBbQ0FMRU5EQVJfUFJFVklPVVNfWUVBUl9DSFVOS10oKSB7XG4gICAgICBkaXNwbGF5UHJldmlvdXNZZWFyQ2h1bmsodGhpcyk7XG4gICAgfSxcbiAgICBbQ0FMRU5EQVJfTkVYVF9ZRUFSX0NIVU5LXSgpIHtcbiAgICAgIGRpc3BsYXlOZXh0WWVhckNodW5rKHRoaXMpO1xuICAgIH0sXG4gICAgW0NBTEVOREFSX01PTlRIX1NFTEVDVElPTl0oKSB7XG4gICAgICBjb25zdCBuZXdDYWxlbmRhciA9IGRpc3BsYXlNb250aFNlbGVjdGlvbih0aGlzKTtcbiAgICAgIG5ld0NhbGVuZGFyLnF1ZXJ5U2VsZWN0b3IoQ0FMRU5EQVJfTU9OVEhfRk9DVVNFRCkuZm9jdXMoKTtcbiAgICB9LFxuICAgIFtDQUxFTkRBUl9ZRUFSX1NFTEVDVElPTl0oKSB7XG4gICAgICBjb25zdCBuZXdDYWxlbmRhciA9IGRpc3BsYXlZZWFyU2VsZWN0aW9uKHRoaXMpO1xuICAgICAgbmV3Q2FsZW5kYXIucXVlcnlTZWxlY3RvcihDQUxFTkRBUl9ZRUFSX0ZPQ1VTRUQpLmZvY3VzKCk7XG4gICAgfSxcbiAgfSxcbiAga2V5dXA6IHtcbiAgICBbREFURV9QSUNLRVJfQ0FMRU5EQVJdKGV2ZW50KSB7XG4gICAgICBjb25zdCBrZXlkb3duID0gdGhpcy5kYXRhc2V0LmtleWRvd25LZXlDb2RlO1xuICAgICAgaWYgKGAke2V2ZW50LmtleUNvZGV9YCAhPT0ga2V5ZG93bikge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgfVxuICAgIH0sXG4gIH0sXG4gIGtleWRvd246IHtcbiAgICBbREFURV9QSUNLRVJfRVhURVJOQUxfSU5QVVRdKGV2ZW50KSB7XG4gICAgICBpZiAoZXZlbnQua2V5Q29kZSA9PT0gRU5URVJfS0VZQ09ERSkge1xuICAgICAgICB2YWxpZGF0ZURhdGVJbnB1dCh0aGlzKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIFtDQUxFTkRBUl9EQVRFXToga2V5bWFwKHtcbiAgICAgIFVwOiBoYW5kbGVVcEZyb21EYXRlLFxuICAgICAgQXJyb3dVcDogaGFuZGxlVXBGcm9tRGF0ZSxcbiAgICAgIERvd246IGhhbmRsZURvd25Gcm9tRGF0ZSxcbiAgICAgIEFycm93RG93bjogaGFuZGxlRG93bkZyb21EYXRlLFxuICAgICAgTGVmdDogaGFuZGxlTGVmdEZyb21EYXRlLFxuICAgICAgQXJyb3dMZWZ0OiBoYW5kbGVMZWZ0RnJvbURhdGUsXG4gICAgICBSaWdodDogaGFuZGxlUmlnaHRGcm9tRGF0ZSxcbiAgICAgIEFycm93UmlnaHQ6IGhhbmRsZVJpZ2h0RnJvbURhdGUsXG4gICAgICBIb21lOiBoYW5kbGVIb21lRnJvbURhdGUsXG4gICAgICBFbmQ6IGhhbmRsZUVuZEZyb21EYXRlLFxuICAgICAgUGFnZURvd246IGhhbmRsZVBhZ2VEb3duRnJvbURhdGUsXG4gICAgICBQYWdlVXA6IGhhbmRsZVBhZ2VVcEZyb21EYXRlLFxuICAgICAgXCJTaGlmdCtQYWdlRG93blwiOiBoYW5kbGVTaGlmdFBhZ2VEb3duRnJvbURhdGUsXG4gICAgICBcIlNoaWZ0K1BhZ2VVcFwiOiBoYW5kbGVTaGlmdFBhZ2VVcEZyb21EYXRlLFxuICAgICAgVGFiOiBkYXRlUGlja2VyVGFiRXZlbnRIYW5kbGVyLnRhYkFoZWFkLFxuICAgIH0pLFxuICAgIFtDQUxFTkRBUl9EQVRFX1BJQ0tFUl06IGtleW1hcCh7XG4gICAgICBUYWI6IGRhdGVQaWNrZXJUYWJFdmVudEhhbmRsZXIudGFiQWhlYWQsXG4gICAgICBcIlNoaWZ0K1RhYlwiOiBkYXRlUGlja2VyVGFiRXZlbnRIYW5kbGVyLnRhYkJhY2ssXG4gICAgfSksXG4gICAgW0NBTEVOREFSX01PTlRIXToga2V5bWFwKHtcbiAgICAgIFVwOiBoYW5kbGVVcEZyb21Nb250aCxcbiAgICAgIEFycm93VXA6IGhhbmRsZVVwRnJvbU1vbnRoLFxuICAgICAgRG93bjogaGFuZGxlRG93bkZyb21Nb250aCxcbiAgICAgIEFycm93RG93bjogaGFuZGxlRG93bkZyb21Nb250aCxcbiAgICAgIExlZnQ6IGhhbmRsZUxlZnRGcm9tTW9udGgsXG4gICAgICBBcnJvd0xlZnQ6IGhhbmRsZUxlZnRGcm9tTW9udGgsXG4gICAgICBSaWdodDogaGFuZGxlUmlnaHRGcm9tTW9udGgsXG4gICAgICBBcnJvd1JpZ2h0OiBoYW5kbGVSaWdodEZyb21Nb250aCxcbiAgICAgIEhvbWU6IGhhbmRsZUhvbWVGcm9tTW9udGgsXG4gICAgICBFbmQ6IGhhbmRsZUVuZEZyb21Nb250aCxcbiAgICAgIFBhZ2VEb3duOiBoYW5kbGVQYWdlRG93bkZyb21Nb250aCxcbiAgICAgIFBhZ2VVcDogaGFuZGxlUGFnZVVwRnJvbU1vbnRoLFxuICAgIH0pLFxuICAgIFtDQUxFTkRBUl9NT05USF9QSUNLRVJdOiBrZXltYXAoe1xuICAgICAgVGFiOiBtb250aFBpY2tlclRhYkV2ZW50SGFuZGxlci50YWJBaGVhZCxcbiAgICAgIFwiU2hpZnQrVGFiXCI6IG1vbnRoUGlja2VyVGFiRXZlbnRIYW5kbGVyLnRhYkJhY2ssXG4gICAgfSksXG4gICAgW0NBTEVOREFSX1lFQVJdOiBrZXltYXAoe1xuICAgICAgVXA6IGhhbmRsZVVwRnJvbVllYXIsXG4gICAgICBBcnJvd1VwOiBoYW5kbGVVcEZyb21ZZWFyLFxuICAgICAgRG93bjogaGFuZGxlRG93bkZyb21ZZWFyLFxuICAgICAgQXJyb3dEb3duOiBoYW5kbGVEb3duRnJvbVllYXIsXG4gICAgICBMZWZ0OiBoYW5kbGVMZWZ0RnJvbVllYXIsXG4gICAgICBBcnJvd0xlZnQ6IGhhbmRsZUxlZnRGcm9tWWVhcixcbiAgICAgIFJpZ2h0OiBoYW5kbGVSaWdodEZyb21ZZWFyLFxuICAgICAgQXJyb3dSaWdodDogaGFuZGxlUmlnaHRGcm9tWWVhcixcbiAgICAgIEhvbWU6IGhhbmRsZUhvbWVGcm9tWWVhcixcbiAgICAgIEVuZDogaGFuZGxlRW5kRnJvbVllYXIsXG4gICAgICBQYWdlRG93bjogaGFuZGxlUGFnZURvd25Gcm9tWWVhcixcbiAgICAgIFBhZ2VVcDogaGFuZGxlUGFnZVVwRnJvbVllYXIsXG4gICAgfSksXG4gICAgW0NBTEVOREFSX1lFQVJfUElDS0VSXToga2V5bWFwKHtcbiAgICAgIFRhYjogeWVhclBpY2tlclRhYkV2ZW50SGFuZGxlci50YWJBaGVhZCxcbiAgICAgIFwiU2hpZnQrVGFiXCI6IHllYXJQaWNrZXJUYWJFdmVudEhhbmRsZXIudGFiQmFjayxcbiAgICB9KSxcbiAgICBbREFURV9QSUNLRVJfQ0FMRU5EQVJdKGV2ZW50KSB7XG4gICAgICB0aGlzLmRhdGFzZXQua2V5ZG93bktleUNvZGUgPSBldmVudC5rZXlDb2RlO1xuICAgIH0sXG4gICAgW0RBVEVfUElDS0VSXShldmVudCkge1xuICAgICAgY29uc3Qga2V5TWFwID0ga2V5bWFwKHtcbiAgICAgICAgRXNjYXBlOiBoYW5kbGVFc2NhcGVGcm9tQ2FsZW5kYXIsXG4gICAgICB9KTtcblxuICAgICAga2V5TWFwKGV2ZW50KTtcbiAgICB9LFxuICB9LFxuICBmb2N1c291dDoge1xuICAgIFtEQVRFX1BJQ0tFUl9FWFRFUk5BTF9JTlBVVF0oKSB7XG4gICAgICB2YWxpZGF0ZURhdGVJbnB1dCh0aGlzKTtcbiAgICB9LFxuICAgIFtEQVRFX1BJQ0tFUl0oZXZlbnQpIHtcbiAgICAgIGlmICghdGhpcy5jb250YWlucyhldmVudC5yZWxhdGVkVGFyZ2V0KSkge1xuICAgICAgICBoaWRlQ2FsZW5kYXIodGhpcyk7XG4gICAgICB9XG4gICAgfSxcbiAgfSxcbiAgaW5wdXQ6IHtcbiAgICBbREFURV9QSUNLRVJfRVhURVJOQUxfSU5QVVRdKCkge1xuICAgICAgcmVjb25jaWxlSW5wdXRWYWx1ZXModGhpcyk7XG4gICAgICB1cGRhdGVDYWxlbmRhcklmVmlzaWJsZSh0aGlzKTtcbiAgICB9LFxuICB9LFxufTtcblxuaWYgKCFpc0lvc0RldmljZSgpKSB7XG4gIGRhdGVQaWNrZXJFdmVudHMubW91c2VvdmVyID0ge1xuICAgIFtDQUxFTkRBUl9EQVRFX0NVUlJFTlRfTU9OVEhdKCkge1xuICAgICAgaGFuZGxlTW91c2VvdmVyRnJvbURhdGUodGhpcyk7XG4gICAgfSxcbiAgICBbQ0FMRU5EQVJfTU9OVEhdKCkge1xuICAgICAgaGFuZGxlTW91c2VvdmVyRnJvbU1vbnRoKHRoaXMpO1xuICAgIH0sXG4gICAgW0NBTEVOREFSX1lFQVJdKCkge1xuICAgICAgaGFuZGxlTW91c2VvdmVyRnJvbVllYXIodGhpcyk7XG4gICAgfSxcbiAgfTtcbn1cblxuY29uc3QgZGF0ZVBpY2tlciA9IGJlaGF2aW9yKGRhdGVQaWNrZXJFdmVudHMsIHtcbiAgaW5pdChyb290KSB7XG4gICAgc2VsZWN0T3JNYXRjaGVzKERBVEVfUElDS0VSLCByb290KS5mb3JFYWNoKChkYXRlUGlja2VyRWwpID0+IHtcbiAgICAgIGVuaGFuY2VEYXRlUGlja2VyKGRhdGVQaWNrZXJFbCk7XG4gICAgfSk7XG4gIH0sXG4gIGdldERhdGVQaWNrZXJDb250ZXh0LFxuICBkaXNhYmxlLFxuICBlbmFibGUsXG4gIGlzRGF0ZUlucHV0SW52YWxpZCxcbiAgc2V0Q2FsZW5kYXJWYWx1ZSxcbiAgdmFsaWRhdGVEYXRlSW5wdXQsXG4gIHJlbmRlckNhbGVuZGFyLFxuICB1cGRhdGVDYWxlbmRhcklmVmlzaWJsZSxcbn0pO1xuXG4vLyAjZW5kcmVnaW9uIERhdGUgUGlja2VyIEV2ZW50IERlbGVnYXRpb24gUmVnaXN0cmF0aW9uIC8gQ29tcG9uZW50XG5cbm1vZHVsZS5leHBvcnRzID0gZGF0ZVBpY2tlcjtcbiIsImNvbnN0IGJlaGF2aW9yID0gcmVxdWlyZShcIi4uLy4uL3Vzd2RzLWNvcmUvc3JjL2pzL3V0aWxzL2JlaGF2aW9yXCIpO1xuY29uc3Qgc2VsZWN0ID0gcmVxdWlyZShcIi4uLy4uL3Vzd2RzLWNvcmUvc3JjL2pzL3V0aWxzL3NlbGVjdFwiKTtcbmNvbnN0IHNlbGVjdE9yTWF0Y2hlcyA9IHJlcXVpcmUoXCIuLi8uLi91c3dkcy1jb3JlL3NyYy9qcy91dGlscy9zZWxlY3Qtb3ItbWF0Y2hlc1wiKTtcbmNvbnN0IHsgcHJlZml4OiBQUkVGSVggfSA9IHJlcXVpcmUoXCIuLi8uLi91c3dkcy1jb3JlL3NyYy9qcy9jb25maWdcIik7XG5jb25zdCB7XG4gIGdldERhdGVQaWNrZXJDb250ZXh0LFxuICBpc0RhdGVJbnB1dEludmFsaWQsXG4gIHVwZGF0ZUNhbGVuZGFySWZWaXNpYmxlLFxufSA9IHJlcXVpcmUoXCIuLi8uLi91c2EtZGF0ZS1waWNrZXIvc3JjL2luZGV4XCIpO1xuXG5jb25zdCBEQVRFX1BJQ0tFUl9DTEFTUyA9IGAke1BSRUZJWH0tZGF0ZS1waWNrZXJgO1xuY29uc3QgREFURV9SQU5HRV9QSUNLRVJfQ0xBU1MgPSBgJHtQUkVGSVh9LWRhdGUtcmFuZ2UtcGlja2VyYDtcbmNvbnN0IERBVEVfUkFOR0VfUElDS0VSX1JBTkdFX1NUQVJUX0NMQVNTID0gYCR7REFURV9SQU5HRV9QSUNLRVJfQ0xBU1N9X19yYW5nZS1zdGFydGA7XG5jb25zdCBEQVRFX1JBTkdFX1BJQ0tFUl9SQU5HRV9FTkRfQ0xBU1MgPSBgJHtEQVRFX1JBTkdFX1BJQ0tFUl9DTEFTU31fX3JhbmdlLWVuZGA7XG5cbmNvbnN0IERBVEVfUElDS0VSID0gYC4ke0RBVEVfUElDS0VSX0NMQVNTfWA7XG5jb25zdCBEQVRFX1JBTkdFX1BJQ0tFUiA9IGAuJHtEQVRFX1JBTkdFX1BJQ0tFUl9DTEFTU31gO1xuY29uc3QgREFURV9SQU5HRV9QSUNLRVJfUkFOR0VfU1RBUlQgPSBgLiR7REFURV9SQU5HRV9QSUNLRVJfUkFOR0VfU1RBUlRfQ0xBU1N9YDtcbmNvbnN0IERBVEVfUkFOR0VfUElDS0VSX1JBTkdFX0VORCA9IGAuJHtEQVRFX1JBTkdFX1BJQ0tFUl9SQU5HRV9FTkRfQ0xBU1N9YDtcblxuY29uc3QgREVGQVVMVF9NSU5fREFURSA9IFwiMDAwMC0wMS0wMVwiO1xuXG4vKipcbiAqIFRoZSBwcm9wZXJ0aWVzIGFuZCBlbGVtZW50cyB3aXRoaW4gdGhlIGRhdGUgcmFuZ2UgcGlja2VyLlxuICogQHR5cGVkZWYge09iamVjdH0gRGF0ZVJhbmdlUGlja2VyQ29udGV4dFxuICogQHByb3BlcnR5IHtIVE1MRWxlbWVudH0gZGF0ZVJhbmdlUGlja2VyRWxcbiAqIEBwcm9wZXJ0eSB7SFRNTEVsZW1lbnR9IHJhbmdlU3RhcnRFbFxuICogQHByb3BlcnR5IHtIVE1MRWxlbWVudH0gcmFuZ2VFbmRFbFxuICovXG5cbi8qKlxuICogR2V0IGFuIG9iamVjdCBvZiB0aGUgcHJvcGVydGllcyBhbmQgZWxlbWVudHMgYmVsb25naW5nIGRpcmVjdGx5IHRvIHRoZSBnaXZlblxuICogZGF0ZSBwaWNrZXIgY29tcG9uZW50LlxuICpcbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsIHRoZSBlbGVtZW50IHdpdGhpbiB0aGUgZGF0ZSBwaWNrZXJcbiAqIEByZXR1cm5zIHtEYXRlUmFuZ2VQaWNrZXJDb250ZXh0fSBlbGVtZW50c1xuICovXG5jb25zdCBnZXREYXRlUmFuZ2VQaWNrZXJDb250ZXh0ID0gKGVsKSA9PiB7XG4gIGNvbnN0IGRhdGVSYW5nZVBpY2tlckVsID0gZWwuY2xvc2VzdChEQVRFX1JBTkdFX1BJQ0tFUik7XG5cbiAgaWYgKCFkYXRlUmFuZ2VQaWNrZXJFbCkge1xuICAgIHRocm93IG5ldyBFcnJvcihgRWxlbWVudCBpcyBtaXNzaW5nIG91dGVyICR7REFURV9SQU5HRV9QSUNLRVJ9YCk7XG4gIH1cblxuICBjb25zdCByYW5nZVN0YXJ0RWwgPSBkYXRlUmFuZ2VQaWNrZXJFbC5xdWVyeVNlbGVjdG9yKFxuICAgIERBVEVfUkFOR0VfUElDS0VSX1JBTkdFX1NUQVJUXG4gICk7XG4gIGNvbnN0IHJhbmdlRW5kRWwgPSBkYXRlUmFuZ2VQaWNrZXJFbC5xdWVyeVNlbGVjdG9yKFxuICAgIERBVEVfUkFOR0VfUElDS0VSX1JBTkdFX0VORFxuICApO1xuXG4gIHJldHVybiB7XG4gICAgZGF0ZVJhbmdlUGlja2VyRWwsXG4gICAgcmFuZ2VTdGFydEVsLFxuICAgIHJhbmdlRW5kRWwsXG4gIH07XG59O1xuXG4vKipcbiAqIGhhbmRsZSB1cGRhdGUgZnJvbSByYW5nZSBzdGFydCBkYXRlIHBpY2tlclxuICpcbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsIGFuIGVsZW1lbnQgd2l0aGluIHRoZSBkYXRlIHJhbmdlIHBpY2tlclxuICovXG5jb25zdCBoYW5kbGVSYW5nZVN0YXJ0VXBkYXRlID0gKGVsKSA9PiB7XG4gIGNvbnN0IHsgZGF0ZVJhbmdlUGlja2VyRWwsIHJhbmdlU3RhcnRFbCwgcmFuZ2VFbmRFbCB9ID1cbiAgICBnZXREYXRlUmFuZ2VQaWNrZXJDb250ZXh0KGVsKTtcbiAgY29uc3QgeyBpbnRlcm5hbElucHV0RWwgfSA9IGdldERhdGVQaWNrZXJDb250ZXh0KHJhbmdlU3RhcnRFbCk7XG4gIGNvbnN0IHVwZGF0ZWREYXRlID0gaW50ZXJuYWxJbnB1dEVsLnZhbHVlO1xuXG4gIGlmICh1cGRhdGVkRGF0ZSAmJiAhaXNEYXRlSW5wdXRJbnZhbGlkKGludGVybmFsSW5wdXRFbCkpIHtcbiAgICByYW5nZUVuZEVsLmRhdGFzZXQubWluRGF0ZSA9IHVwZGF0ZWREYXRlO1xuICAgIHJhbmdlRW5kRWwuZGF0YXNldC5yYW5nZURhdGUgPSB1cGRhdGVkRGF0ZTtcbiAgICByYW5nZUVuZEVsLmRhdGFzZXQuZGVmYXVsdERhdGUgPSB1cGRhdGVkRGF0ZTtcbiAgfSBlbHNlIHtcbiAgICByYW5nZUVuZEVsLmRhdGFzZXQubWluRGF0ZSA9IGRhdGVSYW5nZVBpY2tlckVsLmRhdGFzZXQubWluRGF0ZSB8fCBcIlwiO1xuICAgIHJhbmdlRW5kRWwuZGF0YXNldC5yYW5nZURhdGUgPSBcIlwiO1xuICAgIHJhbmdlRW5kRWwuZGF0YXNldC5kZWZhdWx0RGF0ZSA9IFwiXCI7XG4gIH1cblxuICB1cGRhdGVDYWxlbmRhcklmVmlzaWJsZShyYW5nZUVuZEVsKTtcbn07XG5cbi8qKlxuICogaGFuZGxlIHVwZGF0ZSBmcm9tIHJhbmdlIHN0YXJ0IGRhdGUgcGlja2VyXG4gKlxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWwgYW4gZWxlbWVudCB3aXRoaW4gdGhlIGRhdGUgcmFuZ2UgcGlja2VyXG4gKi9cbmNvbnN0IGhhbmRsZVJhbmdlRW5kVXBkYXRlID0gKGVsKSA9PiB7XG4gIGNvbnN0IHsgZGF0ZVJhbmdlUGlja2VyRWwsIHJhbmdlU3RhcnRFbCwgcmFuZ2VFbmRFbCB9ID1cbiAgICBnZXREYXRlUmFuZ2VQaWNrZXJDb250ZXh0KGVsKTtcbiAgY29uc3QgeyBpbnRlcm5hbElucHV0RWwgfSA9IGdldERhdGVQaWNrZXJDb250ZXh0KHJhbmdlRW5kRWwpO1xuICBjb25zdCB1cGRhdGVkRGF0ZSA9IGludGVybmFsSW5wdXRFbC52YWx1ZTtcblxuICBpZiAodXBkYXRlZERhdGUgJiYgIWlzRGF0ZUlucHV0SW52YWxpZChpbnRlcm5hbElucHV0RWwpKSB7XG4gICAgcmFuZ2VTdGFydEVsLmRhdGFzZXQubWF4RGF0ZSA9IHVwZGF0ZWREYXRlO1xuICAgIHJhbmdlU3RhcnRFbC5kYXRhc2V0LnJhbmdlRGF0ZSA9IHVwZGF0ZWREYXRlO1xuICAgIHJhbmdlU3RhcnRFbC5kYXRhc2V0LmRlZmF1bHREYXRlID0gdXBkYXRlZERhdGU7XG4gIH0gZWxzZSB7XG4gICAgcmFuZ2VTdGFydEVsLmRhdGFzZXQubWF4RGF0ZSA9IGRhdGVSYW5nZVBpY2tlckVsLmRhdGFzZXQubWF4RGF0ZSB8fCBcIlwiO1xuICAgIHJhbmdlU3RhcnRFbC5kYXRhc2V0LnJhbmdlRGF0ZSA9IFwiXCI7XG4gICAgcmFuZ2VTdGFydEVsLmRhdGFzZXQuZGVmYXVsdERhdGUgPSBcIlwiO1xuICB9XG5cbiAgdXBkYXRlQ2FsZW5kYXJJZlZpc2libGUocmFuZ2VTdGFydEVsKTtcbn07XG5cbi8qKlxuICogRW5oYW5jZSBhbiBpbnB1dCB3aXRoIHRoZSBkYXRlIHBpY2tlciBlbGVtZW50c1xuICpcbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsIFRoZSBpbml0aWFsIHdyYXBwaW5nIGVsZW1lbnQgb2YgdGhlIGRhdGUgcmFuZ2UgcGlja2VyIGNvbXBvbmVudFxuICovXG5jb25zdCBlbmhhbmNlRGF0ZVJhbmdlUGlja2VyID0gKGVsKSA9PiB7XG4gIGNvbnN0IGRhdGVSYW5nZVBpY2tlckVsID0gZWwuY2xvc2VzdChEQVRFX1JBTkdFX1BJQ0tFUik7XG5cbiAgY29uc3QgW3JhbmdlU3RhcnQsIHJhbmdlRW5kXSA9IHNlbGVjdChEQVRFX1BJQ0tFUiwgZGF0ZVJhbmdlUGlja2VyRWwpO1xuXG4gIGlmICghcmFuZ2VTdGFydCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgIGAke0RBVEVfUkFOR0VfUElDS0VSfSBpcyBtaXNzaW5nIGlubmVyIHR3byAnJHtEQVRFX1BJQ0tFUn0nIGVsZW1lbnRzYFxuICAgICk7XG4gIH1cblxuICBpZiAoIXJhbmdlRW5kKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgYCR7REFURV9SQU5HRV9QSUNLRVJ9IGlzIG1pc3Npbmcgc2Vjb25kICcke0RBVEVfUElDS0VSfScgZWxlbWVudGBcbiAgICApO1xuICB9XG5cbiAgcmFuZ2VTdGFydC5jbGFzc0xpc3QuYWRkKERBVEVfUkFOR0VfUElDS0VSX1JBTkdFX1NUQVJUX0NMQVNTKTtcbiAgcmFuZ2VFbmQuY2xhc3NMaXN0LmFkZChEQVRFX1JBTkdFX1BJQ0tFUl9SQU5HRV9FTkRfQ0xBU1MpO1xuXG4gIGlmICghZGF0ZVJhbmdlUGlja2VyRWwuZGF0YXNldC5taW5EYXRlKSB7XG4gICAgZGF0ZVJhbmdlUGlja2VyRWwuZGF0YXNldC5taW5EYXRlID0gREVGQVVMVF9NSU5fREFURTtcbiAgfVxuXG4gIGNvbnN0IHsgbWluRGF0ZSB9ID0gZGF0ZVJhbmdlUGlja2VyRWwuZGF0YXNldDtcbiAgcmFuZ2VTdGFydC5kYXRhc2V0Lm1pbkRhdGUgPSBtaW5EYXRlO1xuICByYW5nZUVuZC5kYXRhc2V0Lm1pbkRhdGUgPSBtaW5EYXRlO1xuXG4gIGNvbnN0IHsgbWF4RGF0ZSB9ID0gZGF0ZVJhbmdlUGlja2VyRWwuZGF0YXNldDtcbiAgaWYgKG1heERhdGUpIHtcbiAgICByYW5nZVN0YXJ0LmRhdGFzZXQubWF4RGF0ZSA9IG1heERhdGU7XG4gICAgcmFuZ2VFbmQuZGF0YXNldC5tYXhEYXRlID0gbWF4RGF0ZTtcbiAgfVxuXG4gIGhhbmRsZVJhbmdlU3RhcnRVcGRhdGUoZGF0ZVJhbmdlUGlja2VyRWwpO1xuICBoYW5kbGVSYW5nZUVuZFVwZGF0ZShkYXRlUmFuZ2VQaWNrZXJFbCk7XG59O1xuXG5jb25zdCBkYXRlUmFuZ2VQaWNrZXIgPSBiZWhhdmlvcihcbiAge1xuICAgIFwiaW5wdXQgY2hhbmdlXCI6IHtcbiAgICAgIFtEQVRFX1JBTkdFX1BJQ0tFUl9SQU5HRV9TVEFSVF0oKSB7XG4gICAgICAgIGhhbmRsZVJhbmdlU3RhcnRVcGRhdGUodGhpcyk7XG4gICAgICB9LFxuICAgICAgW0RBVEVfUkFOR0VfUElDS0VSX1JBTkdFX0VORF0oKSB7XG4gICAgICAgIGhhbmRsZVJhbmdlRW5kVXBkYXRlKHRoaXMpO1xuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICB7XG4gICAgaW5pdChyb290KSB7XG4gICAgICBzZWxlY3RPck1hdGNoZXMoREFURV9SQU5HRV9QSUNLRVIsIHJvb3QpLmZvckVhY2goKGRhdGVSYW5nZVBpY2tlckVsKSA9PiB7XG4gICAgICAgIGVuaGFuY2VEYXRlUmFuZ2VQaWNrZXIoZGF0ZVJhbmdlUGlja2VyRWwpO1xuICAgICAgfSk7XG4gICAgfSxcbiAgfVxuKTtcblxubW9kdWxlLmV4cG9ydHMgPSBkYXRlUmFuZ2VQaWNrZXI7XG4iLCJjb25zdCBzZWxlY3RPck1hdGNoZXMgPSByZXF1aXJlKFwiLi4vLi4vdXN3ZHMtY29yZS9zcmMvanMvdXRpbHMvc2VsZWN0LW9yLW1hdGNoZXNcIik7XG5jb25zdCBiZWhhdmlvciA9IHJlcXVpcmUoXCIuLi8uLi91c3dkcy1jb3JlL3NyYy9qcy91dGlscy9iZWhhdmlvclwiKTtcbmNvbnN0IFNhbml0aXplciA9IHJlcXVpcmUoXCIuLi8uLi91c3dkcy1jb3JlL3NyYy9qcy91dGlscy9zYW5pdGl6ZXJcIik7XG5jb25zdCB7IHByZWZpeDogUFJFRklYIH0gPSByZXF1aXJlKFwiLi4vLi4vdXN3ZHMtY29yZS9zcmMvanMvY29uZmlnXCIpO1xuXG5jb25zdCBEUk9QWk9ORV9DTEFTUyA9IGAke1BSRUZJWH0tZmlsZS1pbnB1dGA7XG5jb25zdCBEUk9QWk9ORSA9IGAuJHtEUk9QWk9ORV9DTEFTU31gO1xuY29uc3QgSU5QVVRfQ0xBU1MgPSBgJHtQUkVGSVh9LWZpbGUtaW5wdXRfX2lucHV0YDtcbmNvbnN0IFRBUkdFVF9DTEFTUyA9IGAke1BSRUZJWH0tZmlsZS1pbnB1dF9fdGFyZ2V0YDtcbmNvbnN0IElOUFVUID0gYC4ke0lOUFVUX0NMQVNTfWA7XG5jb25zdCBCT1hfQ0xBU1MgPSBgJHtQUkVGSVh9LWZpbGUtaW5wdXRfX2JveGA7XG5jb25zdCBJTlNUUlVDVElPTlNfQ0xBU1MgPSBgJHtQUkVGSVh9LWZpbGUtaW5wdXRfX2luc3RydWN0aW9uc2A7XG5jb25zdCBQUkVWSUVXX0NMQVNTID0gYCR7UFJFRklYfS1maWxlLWlucHV0X19wcmV2aWV3YDtcbmNvbnN0IFBSRVZJRVdfSEVBRElOR19DTEFTUyA9IGAke1BSRUZJWH0tZmlsZS1pbnB1dF9fcHJldmlldy1oZWFkaW5nYDtcbmNvbnN0IERJU0FCTEVEX0NMQVNTID0gYCR7UFJFRklYfS1maWxlLWlucHV0LS1kaXNhYmxlZGA7XG5jb25zdCBDSE9PU0VfQ0xBU1MgPSBgJHtQUkVGSVh9LWZpbGUtaW5wdXRfX2Nob29zZWA7XG5jb25zdCBBQ0NFUFRFRF9GSUxFX01FU1NBR0VfQ0xBU1MgPSBgJHtQUkVGSVh9LWZpbGUtaW5wdXRfX2FjY2VwdGVkLWZpbGVzLW1lc3NhZ2VgO1xuY29uc3QgRFJBR19URVhUX0NMQVNTID0gYCR7UFJFRklYfS1maWxlLWlucHV0X19kcmFnLXRleHRgO1xuY29uc3QgRFJBR19DTEFTUyA9IGAke1BSRUZJWH0tZmlsZS1pbnB1dC0tZHJhZ2A7XG5jb25zdCBMT0FESU5HX0NMQVNTID0gXCJpcy1sb2FkaW5nXCI7XG5jb25zdCBISURERU5fQ0xBU1MgPSBcImRpc3BsYXktbm9uZVwiO1xuY29uc3QgSU5WQUxJRF9GSUxFX0NMQVNTID0gXCJoYXMtaW52YWxpZC1maWxlXCI7XG5jb25zdCBHRU5FUklDX1BSRVZJRVdfQ0xBU1NfTkFNRSA9IGAke1BSRUZJWH0tZmlsZS1pbnB1dF9fcHJldmlldy1pbWFnZWA7XG5jb25zdCBHRU5FUklDX1BSRVZJRVdfQ0xBU1MgPSBgJHtHRU5FUklDX1BSRVZJRVdfQ0xBU1NfTkFNRX0tLWdlbmVyaWNgO1xuY29uc3QgUERGX1BSRVZJRVdfQ0xBU1MgPSBgJHtHRU5FUklDX1BSRVZJRVdfQ0xBU1NfTkFNRX0tLXBkZmA7XG5jb25zdCBXT1JEX1BSRVZJRVdfQ0xBU1MgPSBgJHtHRU5FUklDX1BSRVZJRVdfQ0xBU1NfTkFNRX0tLXdvcmRgO1xuY29uc3QgVklERU9fUFJFVklFV19DTEFTUyA9IGAke0dFTkVSSUNfUFJFVklFV19DTEFTU19OQU1FfS0tdmlkZW9gO1xuY29uc3QgRVhDRUxfUFJFVklFV19DTEFTUyA9IGAke0dFTkVSSUNfUFJFVklFV19DTEFTU19OQU1FfS0tZXhjZWxgO1xuY29uc3QgU1BBQ0VSX0dJRiA9XG4gIFwiZGF0YTppbWFnZS9naWY7YmFzZTY0LFIwbEdPRGxoQVFBQkFJQUFBQUFBQVAvLy95SDVCQUVBQUFBQUxBQUFBQUFCQUFFQUFBSUJSQUE3XCI7XG5cbmxldCBUWVBFX0lTX1ZBTElEID0gQm9vbGVhbih0cnVlKTsgLy8gbG9naWMgZ2F0ZSBmb3IgY2hhbmdlIGxpc3RlbmVyXG5cbi8qKlxuICogVGhlIHByb3BlcnRpZXMgYW5kIGVsZW1lbnRzIHdpdGhpbiB0aGUgZmlsZSBpbnB1dC5cbiAqIEB0eXBlZGVmIHtPYmplY3R9IEZpbGVJbnB1dENvbnRleHRcbiAqIEBwcm9wZXJ0eSB7SFRNTERpdkVsZW1lbnR9IGRyb3Bab25lRWxcbiAqIEBwcm9wZXJ0eSB7SFRNTElucHV0RWxlbWVudH0gaW5wdXRFbFxuICovXG5cbi8qKlxuICogR2V0IGFuIG9iamVjdCBvZiB0aGUgcHJvcGVydGllcyBhbmQgZWxlbWVudHMgYmVsb25naW5nIGRpcmVjdGx5IHRvIHRoZSBnaXZlblxuICogZmlsZSBpbnB1dCBjb21wb25lbnQuXG4gKlxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWwgdGhlIGVsZW1lbnQgd2l0aGluIHRoZSBmaWxlIGlucHV0XG4gKiBAcmV0dXJucyB7RmlsZUlucHV0Q29udGV4dH0gZWxlbWVudHNcbiAqL1xuY29uc3QgZ2V0RmlsZUlucHV0Q29udGV4dCA9IChlbCkgPT4ge1xuICBjb25zdCBkcm9wWm9uZUVsID0gZWwuY2xvc2VzdChEUk9QWk9ORSk7XG5cbiAgaWYgKCFkcm9wWm9uZUVsKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBFbGVtZW50IGlzIG1pc3Npbmcgb3V0ZXIgJHtEUk9QWk9ORX1gKTtcbiAgfVxuXG4gIGNvbnN0IGlucHV0RWwgPSBkcm9wWm9uZUVsLnF1ZXJ5U2VsZWN0b3IoSU5QVVQpO1xuXG4gIHJldHVybiB7XG4gICAgZHJvcFpvbmVFbCxcbiAgICBpbnB1dEVsLFxuICB9O1xufTtcblxuLyoqXG4gKiBEaXNhYmxlIHRoZSBmaWxlIGlucHV0IGNvbXBvbmVudFxuICpcbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsIEFuIGVsZW1lbnQgd2l0aGluIHRoZSBmaWxlIGlucHV0IGNvbXBvbmVudFxuICovXG5jb25zdCBkaXNhYmxlID0gKGVsKSA9PiB7XG4gIGNvbnN0IHsgZHJvcFpvbmVFbCwgaW5wdXRFbCB9ID0gZ2V0RmlsZUlucHV0Q29udGV4dChlbCk7XG5cbiAgaW5wdXRFbC5kaXNhYmxlZCA9IHRydWU7XG4gIGRyb3Bab25lRWwuY2xhc3NMaXN0LmFkZChESVNBQkxFRF9DTEFTUyk7XG4gIGRyb3Bab25lRWwuc2V0QXR0cmlidXRlKFwiYXJpYS1kaXNhYmxlZFwiLCBcInRydWVcIik7XG59O1xuXG4vKipcbiAqIEVuYWJsZSB0aGUgZmlsZSBpbnB1dCBjb21wb25lbnRcbiAqXG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbCBBbiBlbGVtZW50IHdpdGhpbiB0aGUgZmlsZSBpbnB1dCBjb21wb25lbnRcbiAqL1xuY29uc3QgZW5hYmxlID0gKGVsKSA9PiB7XG4gIGNvbnN0IHsgZHJvcFpvbmVFbCwgaW5wdXRFbCB9ID0gZ2V0RmlsZUlucHV0Q29udGV4dChlbCk7XG5cbiAgaW5wdXRFbC5kaXNhYmxlZCA9IGZhbHNlO1xuICBkcm9wWm9uZUVsLmNsYXNzTGlzdC5yZW1vdmUoRElTQUJMRURfQ0xBU1MpO1xuICBkcm9wWm9uZUVsLnJlbW92ZUF0dHJpYnV0ZShcImFyaWEtZGlzYWJsZWRcIik7XG59O1xuXG4vKipcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gcyBzcGVjaWFsIGNoYXJhY3RlcnNcbiAqIEByZXR1cm5zIHtTdHJpbmd9IHJlcGxhY2VzIHNwZWNpZmllZCB2YWx1ZXNcbiAqL1xuY29uc3QgcmVwbGFjZU5hbWUgPSAocykgPT4ge1xuICBjb25zdCBjID0gcy5jaGFyQ29kZUF0KDApO1xuICBpZiAoYyA9PT0gMzIpIHJldHVybiBcIi1cIjtcbiAgaWYgKGMgPj0gNjUgJiYgYyA8PSA5MCkgcmV0dXJuIGBpbWdfJHtzLnRvTG93ZXJDYXNlKCl9YDtcbiAgcmV0dXJuIGBfXyR7KFwiMDAwXCIsIGMudG9TdHJpbmcoMTYpKS5zbGljZSgtNCl9YDtcbn07XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBJRCBuYW1lIGZvciBlYWNoIGZpbGUgdGhhdCBzdHJpcHMgYWxsIGludmFsaWQgY2hhcmFjdGVycy5cbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lIC0gbmFtZSBvZiB0aGUgZmlsZSBhZGRlZCB0byBmaWxlIGlucHV0IChzZWFyY2h2YWx1ZSlcbiAqIEByZXR1cm5zIHtTdHJpbmd9IHNhbWUgY2hhcmFjdGVycyBhcyB0aGUgbmFtZSB3aXRoIGludmFsaWQgY2hhcnMgcmVtb3ZlZCAobmV3dmFsdWUpXG4gKi9cbmNvbnN0IG1ha2VTYWZlRm9ySUQgPSAobmFtZSkgPT4gbmFtZS5yZXBsYWNlKC9bXmEtejAtOV0vZywgcmVwbGFjZU5hbWUpO1xuXG4vLyBUYWtlcyBhIGdlbmVyYXRlZCBzYWZlIElEIGFuZCBjcmVhdGVzIGEgdW5pcXVlIElELlxuY29uc3QgY3JlYXRlVW5pcXVlSUQgPSAobmFtZSkgPT5cbiAgYCR7bmFtZX0tJHtNYXRoLmZsb29yKERhdGUubm93KCkudG9TdHJpbmcoKSAvIDEwMDApfWA7XG5cbi8qKlxuICogQnVpbGRzIGZ1bGwgZmlsZSBpbnB1dCBjb21wb25lbnRcbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGZpbGVJbnB1dEVsIC0gb3JpZ2luYWwgZmlsZSBpbnB1dCBvbiBwYWdlXG4gKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR8SFRNTEVsZW1lbnR9IC0gSW5zdHJ1Y3Rpb25zLCB0YXJnZXQgYXJlYSBkaXZcbiAqL1xuY29uc3QgYnVpbGRGaWxlSW5wdXQgPSAoZmlsZUlucHV0RWwpID0+IHtcbiAgY29uc3QgYWNjZXB0c011bHRpcGxlID0gZmlsZUlucHV0RWwuaGFzQXR0cmlidXRlKFwibXVsdGlwbGVcIik7XG4gIGNvbnN0IGZpbGVJbnB1dFBhcmVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gIGNvbnN0IGRyb3BUYXJnZXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICBjb25zdCBib3ggPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICBjb25zdCBpbnN0cnVjdGlvbnMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICBjb25zdCBkaXNhYmxlZCA9IGZpbGVJbnB1dEVsLmhhc0F0dHJpYnV0ZShcImRpc2FibGVkXCIpO1xuICBsZXQgZGVmYXVsdEFyaWFMYWJlbDtcblxuICAvLyBBZGRzIGNsYXNzIG5hbWVzIGFuZCBvdGhlciBhdHRyaWJ1dGVzXG4gIGZpbGVJbnB1dEVsLmNsYXNzTGlzdC5yZW1vdmUoRFJPUFpPTkVfQ0xBU1MpO1xuICBmaWxlSW5wdXRFbC5jbGFzc0xpc3QuYWRkKElOUFVUX0NMQVNTKTtcbiAgZmlsZUlucHV0UGFyZW50LmNsYXNzTGlzdC5hZGQoRFJPUFpPTkVfQ0xBU1MpO1xuICBib3guY2xhc3NMaXN0LmFkZChCT1hfQ0xBU1MpO1xuICBpbnN0cnVjdGlvbnMuY2xhc3NMaXN0LmFkZChJTlNUUlVDVElPTlNfQ0xBU1MpO1xuICBpbnN0cnVjdGlvbnMuc2V0QXR0cmlidXRlKFwiYXJpYS1oaWRkZW5cIiwgXCJ0cnVlXCIpO1xuICBkcm9wVGFyZ2V0LmNsYXNzTGlzdC5hZGQoVEFSR0VUX0NMQVNTKTtcbiAgLy8gRW5jb3VyYWdlIHNjcmVlbnJlYWRlciB0byByZWFkIG91dCBhcmlhIGNoYW5nZXMgaW1tZWRpYXRlbHkgZm9sbG93aW5nIHVwbG9hZCBzdGF0dXMgY2hhbmdlXG4gIGZpbGVJbnB1dEVsLnNldEF0dHJpYnV0ZShcImFyaWEtbGl2ZVwiLCBcInBvbGl0ZVwiKTtcblxuICAvLyBBZGRzIGNoaWxkIGVsZW1lbnRzIHRvIHRoZSBET01cbiAgZmlsZUlucHV0RWwucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoZHJvcFRhcmdldCwgZmlsZUlucHV0RWwpO1xuICBmaWxlSW5wdXRFbC5wYXJlbnROb2RlLmluc2VydEJlZm9yZShmaWxlSW5wdXRQYXJlbnQsIGRyb3BUYXJnZXQpO1xuICBkcm9wVGFyZ2V0LmFwcGVuZENoaWxkKGZpbGVJbnB1dEVsKTtcbiAgZmlsZUlucHV0UGFyZW50LmFwcGVuZENoaWxkKGRyb3BUYXJnZXQpO1xuICBmaWxlSW5wdXRFbC5wYXJlbnROb2RlLmluc2VydEJlZm9yZShpbnN0cnVjdGlvbnMsIGZpbGVJbnB1dEVsKTtcbiAgZmlsZUlucHV0RWwucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoYm94LCBmaWxlSW5wdXRFbCk7XG5cbiAgLy8gRGlzYWJsZWQgc3R5bGluZ1xuICBpZiAoZGlzYWJsZWQpIHtcbiAgICBkaXNhYmxlKGZpbGVJbnB1dEVsKTtcbiAgfVxuXG4gIC8vIFNldHMgaW5zdHJ1Y3Rpb24gdGVzdCBhbmQgYXJpYS1sYWJlbCBiYXNlZCBvbiB3aGV0aGVyIG9yIG5vdCBtdWx0aXBsZSBmaWxlcyBhcmUgYWNjZXB0ZWRcbiAgaWYgKGFjY2VwdHNNdWx0aXBsZSkge1xuICAgIGRlZmF1bHRBcmlhTGFiZWwgPSBcIk5vIGZpbGVzIHNlbGVjdGVkXCI7XG4gICAgaW5zdHJ1Y3Rpb25zLmlubmVySFRNTCA9IFNhbml0aXplci5lc2NhcGVIVE1MYDxzcGFuIGNsYXNzPVwiJHtEUkFHX1RFWFRfQ0xBU1N9XCI+RHJhZyBmaWxlcyBoZXJlIG9yIDwvc3Bhbj48c3BhbiBjbGFzcz1cIiR7Q0hPT1NFX0NMQVNTfVwiPmNob29zZSBmcm9tIGZvbGRlcjwvc3Bhbj5gO1xuICAgIGZpbGVJbnB1dEVsLnNldEF0dHJpYnV0ZShcImFyaWEtbGFiZWxcIiwgZGVmYXVsdEFyaWFMYWJlbCk7XG4gICAgZmlsZUlucHV0RWwuc2V0QXR0cmlidXRlKFwiZGF0YS1kZWZhdWx0LWFyaWEtbGFiZWxcIiwgZGVmYXVsdEFyaWFMYWJlbCk7XG4gIH0gZWxzZSB7XG4gICAgZGVmYXVsdEFyaWFMYWJlbCA9IFwiTm8gZmlsZSBzZWxlY3RlZFwiO1xuICAgIGluc3RydWN0aW9ucy5pbm5lckhUTUwgPSBTYW5pdGl6ZXIuZXNjYXBlSFRNTGA8c3BhbiBjbGFzcz1cIiR7RFJBR19URVhUX0NMQVNTfVwiPkRyYWcgZmlsZSBoZXJlIG9yIDwvc3Bhbj48c3BhbiBjbGFzcz1cIiR7Q0hPT1NFX0NMQVNTfVwiPmNob29zZSBmcm9tIGZvbGRlcjwvc3Bhbj5gO1xuICAgIGZpbGVJbnB1dEVsLnNldEF0dHJpYnV0ZShcImFyaWEtbGFiZWxcIiwgZGVmYXVsdEFyaWFMYWJlbCk7XG4gICAgZmlsZUlucHV0RWwuc2V0QXR0cmlidXRlKFwiZGF0YS1kZWZhdWx0LWFyaWEtbGFiZWxcIiwgZGVmYXVsdEFyaWFMYWJlbCk7XG4gIH1cblxuICAvLyBJRTExIGFuZCBFZGdlIGRvIG5vdCBzdXBwb3J0IGRyb3AgZmlsZXMgb24gZmlsZSBpbnB1dHMsIHNvIHdlJ3ZlIHJlbW92ZWQgdGV4dCB0aGF0IGluZGljYXRlcyB0aGF0XG4gIGlmIChcbiAgICAvcnY6MTEuMC9pLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCkgfHxcbiAgICAvRWRnZVxcL1xcZC4vaS50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpXG4gICkge1xuICAgIGZpbGVJbnB1dFBhcmVudC5xdWVyeVNlbGVjdG9yKGAuJHtEUkFHX1RFWFRfQ0xBU1N9YCkub3V0ZXJIVE1MID0gXCJcIjtcbiAgfVxuXG4gIHJldHVybiB7IGluc3RydWN0aW9ucywgZHJvcFRhcmdldCB9O1xufTtcblxuLyoqXG4gKiBSZW1vdmVzIGltYWdlIHByZXZpZXdzLCB3ZSB3YW50IHRvIHN0YXJ0IHdpdGggYSBjbGVhbiBsaXN0IGV2ZXJ5IHRpbWUgZmlsZXMgYXJlIGFkZGVkIHRvIHRoZSBmaWxlIGlucHV0XG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBkcm9wVGFyZ2V0IC0gdGFyZ2V0IGFyZWEgZGl2IHRoYXQgZW5jYXNlcyB0aGUgaW5wdXRcbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGluc3RydWN0aW9ucyAtIHRleHQgdG8gaW5mb3JtIHVzZXJzIHRvIGRyYWcgb3Igc2VsZWN0IGZpbGVzXG4gKi9cbmNvbnN0IHJlbW92ZU9sZFByZXZpZXdzID0gKGRyb3BUYXJnZXQsIGluc3RydWN0aW9ucywgaW5wdXRBcmlhTGFiZWwpID0+IHtcbiAgY29uc3QgZmlsZVByZXZpZXdzID0gZHJvcFRhcmdldC5xdWVyeVNlbGVjdG9yQWxsKGAuJHtQUkVWSUVXX0NMQVNTfWApO1xuICBjb25zdCBmaWxlSW5wdXRFbGVtZW50ID0gZHJvcFRhcmdldC5xdWVyeVNlbGVjdG9yKElOUFVUKTtcbiAgY29uc3QgY3VycmVudFByZXZpZXdIZWFkaW5nID0gZHJvcFRhcmdldC5xdWVyeVNlbGVjdG9yKFxuICAgIGAuJHtQUkVWSUVXX0hFQURJTkdfQ0xBU1N9YFxuICApO1xuICBjb25zdCBjdXJyZW50RXJyb3JNZXNzYWdlID0gZHJvcFRhcmdldC5xdWVyeVNlbGVjdG9yKFxuICAgIGAuJHtBQ0NFUFRFRF9GSUxFX01FU1NBR0VfQ0xBU1N9YFxuICApO1xuXG4gIC8qKlxuICAgKiBmaW5kcyB0aGUgcGFyZW50IG9mIHRoZSBwYXNzZWQgbm9kZSBhbmQgcmVtb3ZlcyB0aGUgY2hpbGRcbiAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gbm9kZVxuICAgKi9cbiAgY29uc3QgcmVtb3ZlSW1hZ2VzID0gKG5vZGUpID0+IHtcbiAgICBub2RlLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQobm9kZSk7XG4gIH07XG5cbiAgLy8gUmVtb3ZlIHRoZSBoZWFkaW5nIGFib3ZlIHRoZSBwcmV2aWV3c1xuICBpZiAoY3VycmVudFByZXZpZXdIZWFkaW5nKSB7XG4gICAgY3VycmVudFByZXZpZXdIZWFkaW5nLm91dGVySFRNTCA9IFwiXCI7XG4gIH1cblxuICAvLyBSZW1vdmUgZXhpc3RpbmcgZXJyb3IgbWVzc2FnZXNcbiAgaWYgKGN1cnJlbnRFcnJvck1lc3NhZ2UpIHtcbiAgICBjdXJyZW50RXJyb3JNZXNzYWdlLm91dGVySFRNTCA9IFwiXCI7XG4gICAgZHJvcFRhcmdldC5jbGFzc0xpc3QucmVtb3ZlKElOVkFMSURfRklMRV9DTEFTUyk7XG4gIH1cblxuICAvLyBHZXQgcmlkIG9mIGV4aXN0aW5nIHByZXZpZXdzIGlmIHRoZXkgZXhpc3QsIHNob3cgaW5zdHJ1Y3Rpb25zXG4gIGlmIChmaWxlUHJldmlld3MgIT09IG51bGwpIHtcbiAgICBpZiAoaW5zdHJ1Y3Rpb25zKSB7XG4gICAgICBpbnN0cnVjdGlvbnMuY2xhc3NMaXN0LnJlbW92ZShISURERU5fQ0xBU1MpO1xuICAgIH1cbiAgICBmaWxlSW5wdXRFbGVtZW50LnNldEF0dHJpYnV0ZShcImFyaWEtbGFiZWxcIiwgaW5wdXRBcmlhTGFiZWwpO1xuICAgIEFycmF5LnByb3RvdHlwZS5mb3JFYWNoLmNhbGwoZmlsZVByZXZpZXdzLCByZW1vdmVJbWFnZXMpO1xuICB9XG59O1xuXG4vKipcbiAqIFdoZW4gbmV3IGZpbGVzIGFyZSBhcHBsaWVkIHRvIGZpbGUgaW5wdXQsIHRoaXMgZnVuY3Rpb24gZ2VuZXJhdGVzIHByZXZpZXdzXG4gKiBhbmQgcmVtb3ZlcyBvbGQgb25lcy5cbiAqIEBwYXJhbSB7ZXZlbnR9IGVcbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGZpbGVJbnB1dEVsIC0gZmlsZSBpbnB1dCBlbGVtZW50XG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBpbnN0cnVjdGlvbnMgLSB0ZXh0IHRvIGluZm9ybSB1c2VycyB0byBkcmFnIG9yIHNlbGVjdCBmaWxlc1xuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZHJvcFRhcmdldCAtIHRhcmdldCBhcmVhIGRpdiB0aGF0IGVuY2FzZXMgdGhlIGlucHV0XG4gKi9cblxuY29uc3QgaGFuZGxlQ2hhbmdlID0gKGUsIGZpbGVJbnB1dEVsLCBpbnN0cnVjdGlvbnMsIGRyb3BUYXJnZXQpID0+IHtcbiAgY29uc3QgZmlsZU5hbWVzID0gZS50YXJnZXQuZmlsZXM7XG4gIGNvbnN0IGZpbGVQcmV2aWV3c0hlYWRpbmcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICBjb25zdCBpbnB1dEFyaWFMYWJlbCA9IGZpbGVJbnB1dEVsLmRhdGFzZXQuZGVmYXVsdEFyaWFMYWJlbDtcbiAgY29uc3QgZmlsZVN0b3JlID0gW107XG5cbiAgLy8gRmlyc3QsIGdldCByaWQgb2YgZXhpc3RpbmcgcHJldmlld3NcbiAgcmVtb3ZlT2xkUHJldmlld3MoZHJvcFRhcmdldCwgaW5zdHJ1Y3Rpb25zLCBpbnB1dEFyaWFMYWJlbCk7XG5cbiAgLy8gVGhlbiwgaXRlcmF0ZSB0aHJvdWdoIGZpbGVzIGxpc3QgYW5kOlxuICAvLyAxLiBBZGQgc2VsZWN0ZWQgZmlsZSBsaXN0IG5hbWVzIHRvIGFyaWEtbGFiZWxcbiAgLy8gMi4gQ3JlYXRlIHByZXZpZXdzXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgZmlsZU5hbWVzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgY29uc3QgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcbiAgICBjb25zdCBmaWxlTmFtZSA9IGZpbGVOYW1lc1tpXS5uYW1lO1xuXG4gICAgLy8gUHVzaCB1cGRhdGVkIGZpbGUgbmFtZXMgaW50byB0aGUgc3RvcmUgYXJyYXlcbiAgICBmaWxlU3RvcmUucHVzaChmaWxlTmFtZSk7XG5cbiAgICAvLyByZWFkIG91dCB0aGUgc3RvcmUgYXJyYXkgdmlhIGFyaWEtbGFiZWwsIHdvcmRpbmcgb3B0aW9ucyB2YXJ5IGJhc2VkIG9uIGZpbGUgY291bnRcbiAgICBpZiAoaSA9PT0gMCkge1xuICAgICAgZmlsZUlucHV0RWwuc2V0QXR0cmlidXRlKFxuICAgICAgICBcImFyaWEtbGFiZWxcIixcbiAgICAgICAgYFlvdSBoYXZlIHNlbGVjdGVkIHRoZSBmaWxlOiAke2ZpbGVOYW1lfWBcbiAgICAgICk7XG4gICAgfSBlbHNlIGlmIChpID49IDEpIHtcbiAgICAgIGZpbGVJbnB1dEVsLnNldEF0dHJpYnV0ZShcbiAgICAgICAgXCJhcmlhLWxhYmVsXCIsXG4gICAgICAgIGBZb3UgaGF2ZSBzZWxlY3RlZCAke2ZpbGVOYW1lcy5sZW5ndGh9IGZpbGVzOiAke2ZpbGVTdG9yZS5qb2luKFwiLCBcIil9YFxuICAgICAgKTtcbiAgICB9XG5cbiAgICAvLyBTdGFydHMgd2l0aCBhIGxvYWRpbmcgaW1hZ2Ugd2hpbGUgcHJldmlldyBpcyBjcmVhdGVkXG4gICAgcmVhZGVyLm9ubG9hZHN0YXJ0ID0gZnVuY3Rpb24gY3JlYXRlTG9hZGluZ0ltYWdlKCkge1xuICAgICAgY29uc3QgaW1hZ2VJZCA9IGNyZWF0ZVVuaXF1ZUlEKG1ha2VTYWZlRm9ySUQoZmlsZU5hbWUpKTtcblxuICAgICAgaW5zdHJ1Y3Rpb25zLmluc2VydEFkamFjZW50SFRNTChcbiAgICAgICAgXCJhZnRlcmVuZFwiLFxuICAgICAgICBTYW5pdGl6ZXIuZXNjYXBlSFRNTGA8ZGl2IGNsYXNzPVwiJHtQUkVWSUVXX0NMQVNTfVwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPlxuICAgICAgICAgIDxpbWcgaWQ9XCIke2ltYWdlSWR9XCIgc3JjPVwiJHtTUEFDRVJfR0lGfVwiIGFsdD1cIlwiIGNsYXNzPVwiJHtHRU5FUklDX1BSRVZJRVdfQ0xBU1NfTkFNRX0gJHtMT0FESU5HX0NMQVNTfVwiLz4ke2ZpbGVOYW1lfVxuICAgICAgICA8ZGl2PmBcbiAgICAgICk7XG4gICAgfTtcblxuICAgIC8vIE5vdCBhbGwgZmlsZXMgd2lsbCBiZSBhYmxlIHRvIGdlbmVyYXRlIHByZXZpZXdzLiBJbiBjYXNlIHRoaXMgaGFwcGVucywgd2UgcHJvdmlkZSBzZXZlcmFsIHR5cGVzIFwiZ2VuZXJpYyBwcmV2aWV3c1wiIGJhc2VkIG9uIHRoZSBmaWxlIGV4dGVuc2lvbi5cbiAgICByZWFkZXIub25sb2FkZW5kID0gZnVuY3Rpb24gY3JlYXRlRmlsZVByZXZpZXcoKSB7XG4gICAgICBjb25zdCBpbWFnZUlkID0gY3JlYXRlVW5pcXVlSUQobWFrZVNhZmVGb3JJRChmaWxlTmFtZSkpO1xuICAgICAgY29uc3QgcHJldmlld0ltYWdlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaW1hZ2VJZCk7XG4gICAgICBpZiAoZmlsZU5hbWUuaW5kZXhPZihcIi5wZGZcIikgPiAwKSB7XG4gICAgICAgIHByZXZpZXdJbWFnZS5zZXRBdHRyaWJ1dGUoXG4gICAgICAgICAgXCJvbmVycm9yXCIsXG4gICAgICAgICAgYHRoaXMub25lcnJvcj1udWxsO3RoaXMuc3JjPVwiJHtTUEFDRVJfR0lGfVwiOyB0aGlzLmNsYXNzTGlzdC5hZGQoXCIke1BERl9QUkVWSUVXX0NMQVNTfVwiKWBcbiAgICAgICAgKTtcbiAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgIGZpbGVOYW1lLmluZGV4T2YoXCIuZG9jXCIpID4gMCB8fFxuICAgICAgICBmaWxlTmFtZS5pbmRleE9mKFwiLnBhZ2VzXCIpID4gMFxuICAgICAgKSB7XG4gICAgICAgIHByZXZpZXdJbWFnZS5zZXRBdHRyaWJ1dGUoXG4gICAgICAgICAgXCJvbmVycm9yXCIsXG4gICAgICAgICAgYHRoaXMub25lcnJvcj1udWxsO3RoaXMuc3JjPVwiJHtTUEFDRVJfR0lGfVwiOyB0aGlzLmNsYXNzTGlzdC5hZGQoXCIke1dPUkRfUFJFVklFV19DTEFTU31cIilgXG4gICAgICAgICk7XG4gICAgICB9IGVsc2UgaWYgKFxuICAgICAgICBmaWxlTmFtZS5pbmRleE9mKFwiLnhsc1wiKSA+IDAgfHxcbiAgICAgICAgZmlsZU5hbWUuaW5kZXhPZihcIi5udW1iZXJzXCIpID4gMFxuICAgICAgKSB7XG4gICAgICAgIHByZXZpZXdJbWFnZS5zZXRBdHRyaWJ1dGUoXG4gICAgICAgICAgXCJvbmVycm9yXCIsXG4gICAgICAgICAgYHRoaXMub25lcnJvcj1udWxsO3RoaXMuc3JjPVwiJHtTUEFDRVJfR0lGfVwiOyB0aGlzLmNsYXNzTGlzdC5hZGQoXCIke0VYQ0VMX1BSRVZJRVdfQ0xBU1N9XCIpYFxuICAgICAgICApO1xuICAgICAgfSBlbHNlIGlmIChmaWxlTmFtZS5pbmRleE9mKFwiLm1vdlwiKSA+IDAgfHwgZmlsZU5hbWUuaW5kZXhPZihcIi5tcDRcIikgPiAwKSB7XG4gICAgICAgIHByZXZpZXdJbWFnZS5zZXRBdHRyaWJ1dGUoXG4gICAgICAgICAgXCJvbmVycm9yXCIsXG4gICAgICAgICAgYHRoaXMub25lcnJvcj1udWxsO3RoaXMuc3JjPVwiJHtTUEFDRVJfR0lGfVwiOyB0aGlzLmNsYXNzTGlzdC5hZGQoXCIke1ZJREVPX1BSRVZJRVdfQ0xBU1N9XCIpYFxuICAgICAgICApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcHJldmlld0ltYWdlLnNldEF0dHJpYnV0ZShcbiAgICAgICAgICBcIm9uZXJyb3JcIixcbiAgICAgICAgICBgdGhpcy5vbmVycm9yPW51bGw7dGhpcy5zcmM9XCIke1NQQUNFUl9HSUZ9XCI7IHRoaXMuY2xhc3NMaXN0LmFkZChcIiR7R0VORVJJQ19QUkVWSUVXX0NMQVNTfVwiKWBcbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgLy8gUmVtb3ZlcyBsb2FkZXIgYW5kIGRpc3BsYXlzIHByZXZpZXdcbiAgICAgIHByZXZpZXdJbWFnZS5jbGFzc0xpc3QucmVtb3ZlKExPQURJTkdfQ0xBU1MpO1xuICAgICAgcHJldmlld0ltYWdlLnNyYyA9IHJlYWRlci5yZXN1bHQ7XG4gICAgfTtcblxuICAgIGlmIChmaWxlTmFtZXNbaV0pIHtcbiAgICAgIHJlYWRlci5yZWFkQXNEYXRhVVJMKGZpbGVOYW1lc1tpXSk7XG4gICAgfVxuXG4gICAgLy8gQWRkcyBoZWFkaW5nIGFib3ZlIGZpbGUgcHJldmlld3MsIHBsdXJhbGl6ZXMgaWYgdGhlcmUgYXJlIG11bHRpcGxlXG4gICAgaWYgKGkgPT09IDApIHtcbiAgICAgIGRyb3BUYXJnZXQuaW5zZXJ0QmVmb3JlKGZpbGVQcmV2aWV3c0hlYWRpbmcsIGluc3RydWN0aW9ucyk7XG4gICAgICBmaWxlUHJldmlld3NIZWFkaW5nLmlubmVySFRNTCA9IGBTZWxlY3RlZCBmaWxlIDxzcGFuIGNsYXNzPVwidXNhLWZpbGUtaW5wdXRfX2Nob29zZVwiPkNoYW5nZSBmaWxlPC9zcGFuPmA7XG4gICAgfSBlbHNlIGlmIChpID49IDEpIHtcbiAgICAgIGRyb3BUYXJnZXQuaW5zZXJ0QmVmb3JlKGZpbGVQcmV2aWV3c0hlYWRpbmcsIGluc3RydWN0aW9ucyk7XG4gICAgICBmaWxlUHJldmlld3NIZWFkaW5nLmlubmVySFRNTCA9IFNhbml0aXplci5lc2NhcGVIVE1MYCR7XG4gICAgICAgIGkgKyAxXG4gICAgICB9IGZpbGVzIHNlbGVjdGVkIDxzcGFuIGNsYXNzPVwidXNhLWZpbGUtaW5wdXRfX2Nob29zZVwiPkNoYW5nZSBmaWxlczwvc3Bhbj5gO1xuICAgIH1cblxuICAgIC8vIEhpZGVzIG51bGwgc3RhdGUgY29udGVudCBhbmQgc2V0cyBwcmV2aWV3IGhlYWRpbmcgY2xhc3NcbiAgICBpZiAoZmlsZVByZXZpZXdzSGVhZGluZykge1xuICAgICAgaW5zdHJ1Y3Rpb25zLmNsYXNzTGlzdC5hZGQoSElEREVOX0NMQVNTKTtcbiAgICAgIGZpbGVQcmV2aWV3c0hlYWRpbmcuY2xhc3NMaXN0LmFkZChQUkVWSUVXX0hFQURJTkdfQ0xBU1MpO1xuICAgIH1cbiAgfVxufTtcblxuLyoqXG4gKiBXaGVuIHVzaW5nIGFuIEFjY2VwdCBhdHRyaWJ1dGUsIGludmFsaWQgZmlsZXMgd2lsbCBiZSBoaWRkZW4gZnJvbVxuICogZmlsZSBicm93c2VyLCBidXQgdGhleSBjYW4gc3RpbGwgYmUgZHJhZ2dlZCB0byB0aGUgaW5wdXQuIFRoaXNcbiAqIGZ1bmN0aW9uIHByZXZlbnRzIHRoZW0gZnJvbSBiZWluZyBkcmFnZ2VkIGFuZCByZW1vdmVzIGVycm9yIHN0YXRlc1xuICogd2hlbiBjb3JyZWN0IGZpbGVzIGFyZSBhZGRlZC5cbiAqIEBwYXJhbSB7ZXZlbnR9IGVcbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGZpbGVJbnB1dEVsIC0gZmlsZSBpbnB1dCBlbGVtZW50XG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBpbnN0cnVjdGlvbnMgLSB0ZXh0IHRvIGluZm9ybSB1c2VycyB0byBkcmFnIG9yIHNlbGVjdCBmaWxlc1xuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZHJvcFRhcmdldCAtIHRhcmdldCBhcmVhIGRpdiB0aGF0IGVuY2FzZXMgdGhlIGlucHV0XG4gKi9cbmNvbnN0IHByZXZlbnRJbnZhbGlkRmlsZXMgPSAoZSwgZmlsZUlucHV0RWwsIGluc3RydWN0aW9ucywgZHJvcFRhcmdldCkgPT4ge1xuICBjb25zdCBhY2NlcHRlZEZpbGVzQXR0ciA9IGZpbGVJbnB1dEVsLmdldEF0dHJpYnV0ZShcImFjY2VwdFwiKTtcbiAgZHJvcFRhcmdldC5jbGFzc0xpc3QucmVtb3ZlKElOVkFMSURfRklMRV9DTEFTUyk7XG5cbiAgLyoqXG4gICAqIFdlIGNhbiBwcm9iYWJseSBtb3ZlIGF3YXkgZnJvbSB0aGlzIG9uY2UgSUUxMSBzdXBwb3J0IHN0b3BzLCBhbmQgcmVwbGFjZVxuICAgKiB3aXRoIGEgc2ltcGxlIGVzIGAuaW5jbHVkZXNgXG4gICAqIGNoZWNrIGlmIGVsZW1lbnQgaXMgaW4gYXJyYXlcbiAgICogY2hlY2sgaWYgMSBvciBtb3JlIGFscGhhYmV0cyBhcmUgaW4gc3RyaW5nXG4gICAqIGlmIGVsZW1lbnQgaXMgcHJlc2VudCByZXR1cm4gdGhlIHBvc2l0aW9uIHZhbHVlIGFuZCAtMSBvdGhlcndpc2VcbiAgICogQHBhcmFtIHtPYmplY3R9IGZpbGVcbiAgICogQHBhcmFtIHtTdHJpbmd9IHZhbHVlXG4gICAqIEByZXR1cm5zIHtCb29sZWFufVxuICAgKi9cbiAgY29uc3QgaXNJbmNsdWRlZCA9IChmaWxlLCB2YWx1ZSkgPT4ge1xuICAgIGxldCByZXR1cm5WYWx1ZSA9IGZhbHNlO1xuICAgIGNvbnN0IHBvcyA9IGZpbGUuaW5kZXhPZih2YWx1ZSk7XG4gICAgaWYgKHBvcyA+PSAwKSB7XG4gICAgICByZXR1cm5WYWx1ZSA9IHRydWU7XG4gICAgfVxuICAgIHJldHVybiByZXR1cm5WYWx1ZTtcbiAgfTtcblxuICAvLyBSdW5zIGlmIG9ubHkgc3BlY2lmaWMgZmlsZXMgYXJlIGFjY2VwdGVkXG4gIGlmIChhY2NlcHRlZEZpbGVzQXR0cikge1xuICAgIGNvbnN0IGFjY2VwdGVkRmlsZXMgPSBhY2NlcHRlZEZpbGVzQXR0ci5zcGxpdChcIixcIik7XG4gICAgY29uc3QgZXJyb3JNZXNzYWdlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcblxuICAgIC8vIElmIG11bHRpcGxlIGZpbGVzIGFyZSBkcmFnZ2VkLCB0aGlzIGl0ZXJhdGVzIHRocm91Z2ggdGhlbSBhbmQgbG9vayBmb3IgYW55IGZpbGVzIHRoYXQgYXJlIG5vdCBhY2NlcHRlZC5cbiAgICBsZXQgYWxsRmlsZXNBbGxvd2VkID0gdHJ1ZTtcbiAgICBjb25zdCBzY2FubmVkRmlsZXMgPSBlLnRhcmdldC5maWxlcyB8fCBlLmRhdGFUcmFuc2Zlci5maWxlcztcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNjYW5uZWRGaWxlcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgY29uc3QgZmlsZSA9IHNjYW5uZWRGaWxlc1tpXTtcbiAgICAgIGlmIChhbGxGaWxlc0FsbG93ZWQpIHtcbiAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBhY2NlcHRlZEZpbGVzLmxlbmd0aDsgaiArPSAxKSB7XG4gICAgICAgICAgY29uc3QgZmlsZVR5cGUgPSBhY2NlcHRlZEZpbGVzW2pdO1xuICAgICAgICAgIGFsbEZpbGVzQWxsb3dlZCA9XG4gICAgICAgICAgICBmaWxlLm5hbWUuaW5kZXhPZihmaWxlVHlwZSkgPiAwIHx8XG4gICAgICAgICAgICBpc0luY2x1ZGVkKGZpbGUudHlwZSwgZmlsZVR5cGUucmVwbGFjZSgvXFwqL2csIFwiXCIpKTtcbiAgICAgICAgICBpZiAoYWxsRmlsZXNBbGxvd2VkKSB7XG4gICAgICAgICAgICBUWVBFX0lTX1ZBTElEID0gdHJ1ZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGJyZWFrO1xuICAgIH1cblxuICAgIC8vIElmIGRyYWdnZWQgZmlsZXMgYXJlIG5vdCBhY2NlcHRlZCwgdGhpcyByZW1vdmVzIHRoZW0gZnJvbSB0aGUgdmFsdWUgb2YgdGhlIGlucHV0IGFuZCBjcmVhdGVzIGFuZCBlcnJvciBzdGF0ZVxuICAgIGlmICghYWxsRmlsZXNBbGxvd2VkKSB7XG4gICAgICByZW1vdmVPbGRQcmV2aWV3cyhkcm9wVGFyZ2V0LCBpbnN0cnVjdGlvbnMpO1xuICAgICAgZmlsZUlucHV0RWwudmFsdWUgPSBcIlwiOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXBhcmFtLXJlYXNzaWduXG4gICAgICBkcm9wVGFyZ2V0Lmluc2VydEJlZm9yZShlcnJvck1lc3NhZ2UsIGZpbGVJbnB1dEVsKTtcbiAgICAgIGVycm9yTWVzc2FnZS50ZXh0Q29udGVudCA9XG4gICAgICAgIGZpbGVJbnB1dEVsLmRhdGFzZXQuZXJyb3JtZXNzYWdlIHx8IGBUaGlzIGlzIG5vdCBhIHZhbGlkIGZpbGUgdHlwZS5gO1xuICAgICAgZXJyb3JNZXNzYWdlLmNsYXNzTGlzdC5hZGQoQUNDRVBURURfRklMRV9NRVNTQUdFX0NMQVNTKTtcbiAgICAgIGRyb3BUYXJnZXQuY2xhc3NMaXN0LmFkZChJTlZBTElEX0ZJTEVfQ0xBU1MpO1xuICAgICAgVFlQRV9JU19WQUxJRCA9IGZhbHNlO1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICB9XG4gIH1cbn07XG5cbi8qKlxuICogMS4gcGFzc2VzIHRocm91Z2ggZ2F0ZSBmb3IgcHJldmVudGluZyBpbnZhbGlkIGZpbGVzXG4gKiAyLiBoYW5kbGVzIHVwZGF0ZXMgaWYgZmlsZSBpcyB2YWxpZFxuICogQHBhcmFtIHtldmVudH0gZXZlbnRcbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnRcbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGluc3RydWN0aW9uc0VsXG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSB0YXJnZXRcbiAqL1xuY29uc3QgaGFuZGxlVXBsb2FkID0gKGV2ZW50LCBlbGVtZW50LCBpbnN0cnVjdGlvbnNFbCwgZHJvcFRhcmdldEVsKSA9PiB7XG4gIHByZXZlbnRJbnZhbGlkRmlsZXMoZXZlbnQsIGVsZW1lbnQsIGluc3RydWN0aW9uc0VsLCBkcm9wVGFyZ2V0RWwpO1xuICBpZiAoVFlQRV9JU19WQUxJRCA9PT0gdHJ1ZSkge1xuICAgIGhhbmRsZUNoYW5nZShldmVudCwgZWxlbWVudCwgaW5zdHJ1Y3Rpb25zRWwsIGRyb3BUYXJnZXRFbCk7XG4gIH1cbn07XG5cbmNvbnN0IGZpbGVJbnB1dCA9IGJlaGF2aW9yKFxuICB7fSxcbiAge1xuICAgIGluaXQocm9vdCkge1xuICAgICAgc2VsZWN0T3JNYXRjaGVzKERST1BaT05FLCByb290KS5mb3JFYWNoKChmaWxlSW5wdXRFbCkgPT4ge1xuICAgICAgICBjb25zdCB7IGluc3RydWN0aW9ucywgZHJvcFRhcmdldCB9ID0gYnVpbGRGaWxlSW5wdXQoZmlsZUlucHV0RWwpO1xuXG4gICAgICAgIGRyb3BUYXJnZXQuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgICBcImRyYWdvdmVyXCIsXG4gICAgICAgICAgZnVuY3Rpb24gaGFuZGxlRHJhZ092ZXIoKSB7XG4gICAgICAgICAgICB0aGlzLmNsYXNzTGlzdC5hZGQoRFJBR19DTEFTUyk7XG4gICAgICAgICAgfSxcbiAgICAgICAgICBmYWxzZVxuICAgICAgICApO1xuXG4gICAgICAgIGRyb3BUYXJnZXQuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgICBcImRyYWdsZWF2ZVwiLFxuICAgICAgICAgIGZ1bmN0aW9uIGhhbmRsZURyYWdMZWF2ZSgpIHtcbiAgICAgICAgICAgIHRoaXMuY2xhc3NMaXN0LnJlbW92ZShEUkFHX0NMQVNTKTtcbiAgICAgICAgICB9LFxuICAgICAgICAgIGZhbHNlXG4gICAgICAgICk7XG5cbiAgICAgICAgZHJvcFRhcmdldC5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgICAgIFwiZHJvcFwiLFxuICAgICAgICAgIGZ1bmN0aW9uIGhhbmRsZURyb3AoKSB7XG4gICAgICAgICAgICB0aGlzLmNsYXNzTGlzdC5yZW1vdmUoRFJBR19DTEFTUyk7XG4gICAgICAgICAgfSxcbiAgICAgICAgICBmYWxzZVxuICAgICAgICApO1xuXG4gICAgICAgIGZpbGVJbnB1dEVsLmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICAgICAgXCJjaGFuZ2VcIixcbiAgICAgICAgICAoZSkgPT4gaGFuZGxlVXBsb2FkKGUsIGZpbGVJbnB1dEVsLCBpbnN0cnVjdGlvbnMsIGRyb3BUYXJnZXQpLFxuICAgICAgICAgIGZhbHNlXG4gICAgICAgICk7XG4gICAgICB9KTtcbiAgICB9LFxuICAgIHRlYXJkb3duKHJvb3QpIHtcbiAgICAgIHNlbGVjdE9yTWF0Y2hlcyhJTlBVVCwgcm9vdCkuZm9yRWFjaCgoZmlsZUlucHV0RWwpID0+IHtcbiAgICAgICAgY29uc3QgZmlsZUlucHV0VG9wRWxlbWVudCA9IGZpbGVJbnB1dEVsLnBhcmVudEVsZW1lbnQucGFyZW50RWxlbWVudDtcbiAgICAgICAgZmlsZUlucHV0VG9wRWxlbWVudC5wYXJlbnRFbGVtZW50LnJlcGxhY2VDaGlsZChmaWxlSW5wdXRFbCwgZmlsZUlucHV0VG9wRWxlbWVudCk7XG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1wYXJhbS1yZWFzc2lnblxuICAgICAgICBmaWxlSW5wdXRFbC5jbGFzc05hbWUgPSBEUk9QWk9ORV9DTEFTUztcbiAgICAgIH0pO1xuICAgIH0sXG4gICAgZ2V0RmlsZUlucHV0Q29udGV4dCxcbiAgICBkaXNhYmxlLFxuICAgIGVuYWJsZSxcbiAgfVxuKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmaWxlSW5wdXQ7XG4iLCJjb25zdCBiZWhhdmlvciA9IHJlcXVpcmUoXCIuLi8uLi91c3dkcy1jb3JlL3NyYy9qcy91dGlscy9iZWhhdmlvclwiKTtcbmNvbnN0IHsgQ0xJQ0sgfSA9IHJlcXVpcmUoXCIuLi8uLi91c3dkcy1jb3JlL3NyYy9qcy9ldmVudHNcIik7XG5jb25zdCB7IHByZWZpeDogUFJFRklYIH0gPSByZXF1aXJlKFwiLi4vLi4vdXN3ZHMtY29yZS9zcmMvanMvY29uZmlnXCIpO1xuXG5jb25zdCBTQ09QRSA9IGAuJHtQUkVGSVh9LWZvb3Rlci0tYmlnYDtcbmNvbnN0IE5BViA9IGAke1NDT1BFfSBuYXZgO1xuY29uc3QgQlVUVE9OID0gYCR7TkFWfSAuJHtQUkVGSVh9LWZvb3Rlcl9fcHJpbWFyeS1saW5rYDtcbmNvbnN0IEhJREVfTUFYX1dJRFRIID0gNDgwO1xuXG4vKipcbiAqIEV4cGFuZHMgc2VsZWN0ZWQgZm9vdGVyIG1lbnUgcGFuZWwsIHdoaWxlIGNvbGxhcHNpbmcgb3RoZXJzXG4gKi9cbmZ1bmN0aW9uIHNob3dQYW5lbCgpIHtcbiAgaWYgKHdpbmRvdy5pbm5lcldpZHRoIDwgSElERV9NQVhfV0lEVEgpIHtcbiAgICBjb25zdCBpc09wZW4gPSB0aGlzLmdldEF0dHJpYnV0ZShcImFyaWEtZXhwYW5kZWRcIikgPT09IFwidHJ1ZVwiO1xuICAgIGNvbnN0IHRoaXNGb290ZXIgPSB0aGlzLmNsb3Nlc3QoU0NPUEUpO1xuXG4gICAgLy8gQ2xvc2UgYWxsIG90aGVyIG1lbnVzXG4gICAgdGhpc0Zvb3Rlci5xdWVyeVNlbGVjdG9yQWxsKEJVVFRPTikuZm9yRWFjaCgoYnV0dG9uKSA9PiB7XG4gICAgICBidXR0b24uc2V0QXR0cmlidXRlKFwiYXJpYS1leHBhbmRlZFwiLCBmYWxzZSk7XG4gICAgfSk7XG5cbiAgICB0aGlzLnNldEF0dHJpYnV0ZShcImFyaWEtZXhwYW5kZWRcIiwgIWlzT3Blbik7XG4gIH1cbn1cblxuLyoqXG4gKiBTd2FwcyB0aGUgPGg0PiBlbGVtZW50IGZvciBhIDxidXR0b24+IGVsZW1lbnQgKGFuZCB2aWNlLXZlcnNhKSBhbmQgc2V0cyBpZFxuICogb2YgbWVudSBsaXN0XG4gKlxuICogQHBhcmFtIHtCb29sZWFufSBpc01vYmlsZSAtIElmIHRoZSBmb290ZXIgaXMgaW4gbW9iaWxlIGNvbmZpZ3VyYXRpb25cbiAqL1xuZnVuY3Rpb24gdG9nZ2xlSHRtbFRhZyhpc01vYmlsZSkge1xuICBjb25zdCBiaWdGb290ZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFNDT1BFKTtcblxuICBpZiAoIWJpZ0Zvb3Rlcikge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGNvbnN0IHByaW1hcnlMaW5rcyA9IGJpZ0Zvb3Rlci5xdWVyeVNlbGVjdG9yQWxsKEJVVFRPTik7XG4gIGNvbnN0IG5ld0VsZW1lbnRUeXBlID0gaXNNb2JpbGUgPyBcImJ1dHRvblwiIDogXCJoNFwiO1xuXG4gIHByaW1hcnlMaW5rcy5mb3JFYWNoKChjdXJyZW50RWxlbWVudCkgPT4ge1xuICAgIGNvbnN0IGN1cnJlbnRFbGVtZW50Q2xhc3NlcyA9IGN1cnJlbnRFbGVtZW50LmdldEF0dHJpYnV0ZShcImNsYXNzXCIpO1xuXG4gICAgLy8gQ3JlYXRlIHRoZSBuZXcgZWxlbWVudFxuICAgIGNvbnN0IG5ld0VsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KG5ld0VsZW1lbnRUeXBlKTtcbiAgICBuZXdFbGVtZW50LnNldEF0dHJpYnV0ZShcImNsYXNzXCIsIGN1cnJlbnRFbGVtZW50Q2xhc3Nlcyk7XG4gICAgbmV3RWxlbWVudC5jbGFzc0xpc3QudG9nZ2xlKFxuICAgICAgYCR7UFJFRklYfS1mb290ZXJfX3ByaW1hcnktbGluay0tYnV0dG9uYCxcbiAgICAgIGlzTW9iaWxlXG4gICAgKTtcbiAgICBuZXdFbGVtZW50LnRleHRDb250ZW50ID0gY3VycmVudEVsZW1lbnQudGV4dENvbnRlbnQ7XG5cbiAgICBpZiAoaXNNb2JpbGUpIHtcbiAgICAgIGNvbnN0IG1lbnVJZCA9IGAke1BSRUZJWH0tZm9vdGVyLW1lbnUtbGlzdC0ke01hdGguZmxvb3IoXG4gICAgICAgIE1hdGgucmFuZG9tKCkgKiAxMDAwMDBcbiAgICAgICl9YDtcblxuICAgICAgbmV3RWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJhcmlhLWNvbnRyb2xzXCIsIG1lbnVJZCk7XG4gICAgICBuZXdFbGVtZW50LnNldEF0dHJpYnV0ZShcImFyaWEtZXhwYW5kZWRcIiwgXCJmYWxzZVwiKTtcbiAgICAgIGN1cnJlbnRFbGVtZW50Lm5leHRFbGVtZW50U2libGluZy5zZXRBdHRyaWJ1dGUoXCJpZFwiLCBtZW51SWQpO1xuICAgICAgbmV3RWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJ0eXBlXCIsIFwiYnV0dG9uXCIpO1xuICAgIH1cblxuICAgIC8vIEluc2VydCB0aGUgbmV3IGVsZW1lbnQgYW5kIGRlbGV0ZSB0aGUgb2xkXG4gICAgY3VycmVudEVsZW1lbnQuYWZ0ZXIobmV3RWxlbWVudCk7XG4gICAgY3VycmVudEVsZW1lbnQucmVtb3ZlKCk7XG4gIH0pO1xufVxuXG5jb25zdCByZXNpemUgPSAoZXZlbnQpID0+IHtcbiAgdG9nZ2xlSHRtbFRhZyhldmVudC5tYXRjaGVzKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gYmVoYXZpb3IoXG4gIHtcbiAgICBbQ0xJQ0tdOiB7XG4gICAgICBbQlVUVE9OXTogc2hvd1BhbmVsLFxuICAgIH0sXG4gIH0sXG4gIHtcbiAgICAvLyBleHBvcnQgZm9yIHVzZSBlbHNld2hlcmVcbiAgICBISURFX01BWF9XSURUSCxcblxuICAgIGluaXQoKSB7XG4gICAgICB0b2dnbGVIdG1sVGFnKHdpbmRvdy5pbm5lcldpZHRoIDwgSElERV9NQVhfV0lEVEgpO1xuICAgICAgdGhpcy5tZWRpYVF1ZXJ5TGlzdCA9IHdpbmRvdy5tYXRjaE1lZGlhKFxuICAgICAgICBgKG1heC13aWR0aDogJHtISURFX01BWF9XSURUSCAtIDAuMX1weClgXG4gICAgICApO1xuICAgICAgdGhpcy5tZWRpYVF1ZXJ5TGlzdC5hZGRMaXN0ZW5lcihyZXNpemUpO1xuICAgIH0sXG5cbiAgICB0ZWFyZG93bigpIHtcbiAgICAgIHRoaXMubWVkaWFRdWVyeUxpc3QucmVtb3ZlTGlzdGVuZXIocmVzaXplKTtcbiAgICB9LFxuICB9XG4pO1xuIiwiY29uc3Qga2V5bWFwID0gcmVxdWlyZShcInJlY2VwdG9yL2tleW1hcFwiKTtcbmNvbnN0IGJlaGF2aW9yID0gcmVxdWlyZShcIi4uLy4uL3Vzd2RzLWNvcmUvc3JjL2pzL3V0aWxzL2JlaGF2aW9yXCIpO1xuY29uc3Qgc2VsZWN0ID0gcmVxdWlyZShcIi4uLy4uL3Vzd2RzLWNvcmUvc3JjL2pzL3V0aWxzL3NlbGVjdFwiKTtcbmNvbnN0IHRvZ2dsZSA9IHJlcXVpcmUoXCIuLi8uLi91c3dkcy1jb3JlL3NyYy9qcy91dGlscy90b2dnbGVcIik7XG5jb25zdCBGb2N1c1RyYXAgPSByZXF1aXJlKFwiLi4vLi4vdXN3ZHMtY29yZS9zcmMvanMvdXRpbHMvZm9jdXMtdHJhcFwiKTtcbmNvbnN0IGFjY29yZGlvbiA9IHJlcXVpcmUoXCIuLi8uLi91c2EtYWNjb3JkaW9uL3NyYy9pbmRleFwiKTtcbmNvbnN0IFNjcm9sbEJhcldpZHRoID0gcmVxdWlyZShcIi4uLy4uL3Vzd2RzLWNvcmUvc3JjL2pzL3V0aWxzL3Njcm9sbGJhci13aWR0aFwiKTtcblxuY29uc3QgeyBDTElDSyB9ID0gcmVxdWlyZShcIi4uLy4uL3Vzd2RzLWNvcmUvc3JjL2pzL2V2ZW50c1wiKTtcbmNvbnN0IHsgcHJlZml4OiBQUkVGSVggfSA9IHJlcXVpcmUoXCIuLi8uLi91c3dkcy1jb3JlL3NyYy9qcy9jb25maWdcIik7XG5cbmNvbnN0IEJPRFkgPSBcImJvZHlcIjtcbmNvbnN0IEhFQURFUiA9IGAuJHtQUkVGSVh9LWhlYWRlcmA7XG5jb25zdCBOQVYgPSBgLiR7UFJFRklYfS1uYXZgO1xuY29uc3QgTkFWX0NPTlRBSU5FUiA9IGAuJHtQUkVGSVh9LW5hdi1jb250YWluZXJgO1xuY29uc3QgTkFWX1BSSU1BUlkgPSBgLiR7UFJFRklYfS1uYXZfX3ByaW1hcnlgO1xuY29uc3QgTkFWX1BSSU1BUllfSVRFTSA9IGAuJHtQUkVGSVh9LW5hdl9fcHJpbWFyeS1pdGVtYDtcbmNvbnN0IE5BVl9DT05UUk9MID0gYGJ1dHRvbi4ke1BSRUZJWH0tbmF2X19saW5rYDtcbmNvbnN0IE5BVl9MSU5LUyA9IGAke05BVn0gYWA7XG5jb25zdCBOT05fTkFWX0hJRERFTl9BVFRSSUJVVEUgPSBgZGF0YS1uYXYtaGlkZGVuYDtcbmNvbnN0IE9QRU5FUlMgPSBgLiR7UFJFRklYfS1tZW51LWJ0bmA7XG5jb25zdCBDTE9TRV9CVVRUT04gPSBgLiR7UFJFRklYfS1uYXZfX2Nsb3NlYDtcbmNvbnN0IE9WRVJMQVkgPSBgLiR7UFJFRklYfS1vdmVybGF5YDtcbmNvbnN0IENMT1NFUlMgPSBgJHtDTE9TRV9CVVRUT059LCAuJHtQUkVGSVh9LW92ZXJsYXlgO1xuY29uc3QgVE9HR0xFUyA9IFtOQVYsIE9WRVJMQVldLmpvaW4oXCIsIFwiKTtcbmNvbnN0IE5PTl9OQVZfRUxFTUVOVFMgPSBgYm9keSAqOm5vdCgke0hFQURFUn0sICR7TkFWX0NPTlRBSU5FUn0sICR7TkFWfSwgJHtOQVZ9ICopOm5vdChbYXJpYS1oaWRkZW5dKWA7XG5jb25zdCBOT05fTkFWX0hJRERFTiA9IGBbJHtOT05fTkFWX0hJRERFTl9BVFRSSUJVVEV9XWA7XG5cbmNvbnN0IEFDVElWRV9DTEFTUyA9IFwidXNhLWpzLW1vYmlsZS1uYXYtLWFjdGl2ZVwiO1xuY29uc3QgVklTSUJMRV9DTEFTUyA9IFwiaXMtdmlzaWJsZVwiO1xuXG5sZXQgbmF2aWdhdGlvbjtcbmxldCBuYXZBY3RpdmU7XG5sZXQgbm9uTmF2RWxlbWVudHM7XG5cbmNvbnN0IGlzQWN0aXZlID0gKCkgPT4gZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QuY29udGFpbnMoQUNUSVZFX0NMQVNTKTtcbmNvbnN0IFNDUk9MTEJBUl9XSURUSCA9IFNjcm9sbEJhcldpZHRoKCk7XG5jb25zdCBJTklUSUFMX1BBRERJTkcgPSB3aW5kb3dcbiAgLmdldENvbXB1dGVkU3R5bGUoZG9jdW1lbnQuYm9keSlcbiAgLmdldFByb3BlcnR5VmFsdWUoXCJwYWRkaW5nLXJpZ2h0XCIpO1xuY29uc3QgVEVNUE9SQVJZX1BBRERJTkcgPSBgJHtcbiAgcGFyc2VJbnQoSU5JVElBTF9QQURESU5HLnJlcGxhY2UoL3B4LywgXCJcIiksIDEwKSArXG4gIHBhcnNlSW50KFNDUk9MTEJBUl9XSURUSC5yZXBsYWNlKC9weC8sIFwiXCIpLCAxMClcbn1weGA7XG5cbmNvbnN0IGhpZGVOb25OYXZJdGVtcyA9ICgpID0+IHtcbiAgY29uc3QgaGVhZGVyUGFyZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgJHtIRUFERVJ9YCkucGFyZW50Tm9kZTtcbiAgbm9uTmF2RWxlbWVudHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKE5PTl9OQVZfRUxFTUVOVFMpO1xuXG4gIG5vbk5hdkVsZW1lbnRzLmZvckVhY2goKG5vbk5hdkVsZW1lbnQpID0+IHtcbiAgICBpZihub25OYXZFbGVtZW50ICE9PSBoZWFkZXJQYXJlbnQpIHtcbiAgICAgIG5vbk5hdkVsZW1lbnQuc2V0QXR0cmlidXRlKFwiYXJpYS1oaWRkZW5cIiwgdHJ1ZSk7XG4gICAgICBub25OYXZFbGVtZW50LnNldEF0dHJpYnV0ZShOT05fTkFWX0hJRERFTl9BVFRSSUJVVEUsIFwiXCIpO1xuICAgIH1cbiAgfSk7XG59O1xuXG5jb25zdCBzaG93Tm9uTmF2SXRlbXMgPSAoKSA9PiB7XG4gIG5vbk5hdkVsZW1lbnRzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChOT05fTkFWX0hJRERFTik7XG5cbiAgaWYgKCFub25OYXZFbGVtZW50cykge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIFJlbW92ZSBhcmlhLWhpZGRlbiBmcm9tIG5vbi1oZWFkZXIgZWxlbWVudHNcbiAgbm9uTmF2RWxlbWVudHMuZm9yRWFjaCgobm9uTmF2RWxlbWVudCkgPT4ge1xuICAgIG5vbk5hdkVsZW1lbnQucmVtb3ZlQXR0cmlidXRlKFwiYXJpYS1oaWRkZW5cIik7XG4gICAgbm9uTmF2RWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUoTk9OX05BVl9ISURERU5fQVRUUklCVVRFKTtcbiAgfSk7XG59O1xuXG4vLyBUb2dnbGUgYWxsIG5vbi1oZWFkZXIgZWxlbWVudHMgIzM1MjcuXG5jb25zdCB0b2dnbGVOb25OYXZJdGVtcyA9IChhY3RpdmUpID0+IHtcbiAgaWYgKGFjdGl2ZSkge1xuICAgIGhpZGVOb25OYXZJdGVtcygpO1xuICB9IGVsc2Uge1xuICAgIHNob3dOb25OYXZJdGVtcygpO1xuICB9XG59O1xuXG5jb25zdCB0b2dnbGVOYXYgPSAoYWN0aXZlKSA9PiB7XG4gIGNvbnN0IHsgYm9keSB9ID0gZG9jdW1lbnQ7XG4gIGNvbnN0IHNhZmVBY3RpdmUgPSB0eXBlb2YgYWN0aXZlID09PSBcImJvb2xlYW5cIiA/IGFjdGl2ZSA6ICFpc0FjdGl2ZSgpO1xuXG4gIGJvZHkuY2xhc3NMaXN0LnRvZ2dsZShBQ1RJVkVfQ0xBU1MsIHNhZmVBY3RpdmUpO1xuXG4gIHNlbGVjdChUT0dHTEVTKS5mb3JFYWNoKChlbCkgPT5cbiAgICBlbC5jbGFzc0xpc3QudG9nZ2xlKFZJU0lCTEVfQ0xBU1MsIHNhZmVBY3RpdmUpXG4gICk7XG5cbiAgbmF2aWdhdGlvbi5mb2N1c1RyYXAudXBkYXRlKHNhZmVBY3RpdmUpO1xuXG4gIGNvbnN0IGNsb3NlQnV0dG9uID0gYm9keS5xdWVyeVNlbGVjdG9yKENMT1NFX0JVVFRPTik7XG4gIGNvbnN0IG1lbnVCdXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKE9QRU5FUlMpO1xuXG4gIGJvZHkuc3R5bGUucGFkZGluZ1JpZ2h0ID1cbiAgICBib2R5LnN0eWxlLnBhZGRpbmdSaWdodCA9PT0gVEVNUE9SQVJZX1BBRERJTkdcbiAgICAgID8gSU5JVElBTF9QQURESU5HXG4gICAgICA6IFRFTVBPUkFSWV9QQURESU5HO1xuXG4gIHRvZ2dsZU5vbk5hdkl0ZW1zKHNhZmVBY3RpdmUpO1xuXG4gIGlmIChzYWZlQWN0aXZlICYmIGNsb3NlQnV0dG9uKSB7XG4gICAgLy8gVGhlIG1vYmlsZSBuYXYgd2FzIGp1c3QgYWN0aXZhdGVkLiBGb2N1cyBvbiB0aGUgY2xvc2UgYnV0dG9uLCB3aGljaCBpc1xuICAgIC8vIGp1c3QgYmVmb3JlIGFsbCB0aGUgbmF2IGVsZW1lbnRzIGluIHRoZSB0YWIgb3JkZXIuXG4gICAgY2xvc2VCdXR0b24uZm9jdXMoKTtcbiAgfSBlbHNlIGlmIChcbiAgICAhc2FmZUFjdGl2ZSAmJlxuICAgIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgPT09IGNsb3NlQnV0dG9uICYmXG4gICAgbWVudUJ1dHRvblxuICApIHtcbiAgICAvLyBUaGUgbW9iaWxlIG5hdiB3YXMganVzdCBkZWFjdGl2YXRlZCwgYW5kIGZvY3VzIHdhcyBvbiB0aGUgY2xvc2VcbiAgICAvLyBidXR0b24sIHdoaWNoIGlzIG5vIGxvbmdlciB2aXNpYmxlLiBXZSBkb24ndCB3YW50IHRoZSBmb2N1cyB0b1xuICAgIC8vIGRpc2FwcGVhciBpbnRvIHRoZSB2b2lkLCBzbyBmb2N1cyBvbiB0aGUgbWVudSBidXR0b24gaWYgaXQnc1xuICAgIC8vIHZpc2libGUgKHRoaXMgbWF5IGhhdmUgYmVlbiB3aGF0IHRoZSB1c2VyIHdhcyBqdXN0IGZvY3VzZWQgb24sXG4gICAgLy8gaWYgdGhleSB0cmlnZ2VyZWQgdGhlIG1vYmlsZSBuYXYgYnkgbWlzdGFrZSkuXG4gICAgbWVudUJ1dHRvbi5mb2N1cygpO1xuICB9XG5cbiAgcmV0dXJuIHNhZmVBY3RpdmU7XG59O1xuXG5jb25zdCByZXNpemUgPSAoKSA9PiB7XG4gIGNvbnN0IGNsb3NlciA9IGRvY3VtZW50LmJvZHkucXVlcnlTZWxlY3RvcihDTE9TRV9CVVRUT04pO1xuXG4gIGlmIChpc0FjdGl2ZSgpICYmIGNsb3NlciAmJiBjbG9zZXIuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkud2lkdGggPT09IDApIHtcbiAgICAvLyBXaGVuIHRoZSBtb2JpbGUgbmF2IGlzIGFjdGl2ZSwgYW5kIHRoZSBjbG9zZSBib3ggaXNuJ3QgdmlzaWJsZSxcbiAgICAvLyB3ZSBrbm93IHRoZSB1c2VyJ3Mgdmlld3BvcnQgaGFzIGJlZW4gcmVzaXplZCB0byBiZSBsYXJnZXIuXG4gICAgLy8gTGV0J3MgbWFrZSB0aGUgcGFnZSBzdGF0ZSBjb25zaXN0ZW50IGJ5IGRlYWN0aXZhdGluZyB0aGUgbW9iaWxlIG5hdi5cbiAgICBuYXZpZ2F0aW9uLnRvZ2dsZU5hdi5jYWxsKGNsb3NlciwgZmFsc2UpO1xuICB9XG59O1xuXG5jb25zdCBvbk1lbnVDbG9zZSA9ICgpID0+IG5hdmlnYXRpb24udG9nZ2xlTmF2LmNhbGwobmF2aWdhdGlvbiwgZmFsc2UpO1xuXG5jb25zdCBoaWRlQWN0aXZlTmF2RHJvcGRvd24gPSAoKSA9PiB7XG4gIGlmICghbmF2QWN0aXZlKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdG9nZ2xlKG5hdkFjdGl2ZSwgZmFsc2UpO1xuICBuYXZBY3RpdmUgPSBudWxsO1xufTtcblxuY29uc3QgZm9jdXNOYXZCdXR0b24gPSAoZXZlbnQpID0+IHtcbiAgY29uc3QgcGFyZW50TmF2SXRlbSA9IGV2ZW50LnRhcmdldC5jbG9zZXN0KE5BVl9QUklNQVJZX0lURU0pO1xuXG4gIC8vIE9ubHkgc2hpZnQgZm9jdXMgaWYgd2l0aGluIGRyb3Bkb3duXG4gIGlmICghZXZlbnQudGFyZ2V0Lm1hdGNoZXMoTkFWX0NPTlRST0wpKSB7XG4gICAgcGFyZW50TmF2SXRlbS5xdWVyeVNlbGVjdG9yKE5BVl9DT05UUk9MKS5mb2N1cygpO1xuICB9XG59O1xuXG5jb25zdCBoYW5kbGVFc2NhcGUgPSAoZXZlbnQpID0+IHtcbiAgaGlkZUFjdGl2ZU5hdkRyb3Bkb3duKCk7XG4gIGZvY3VzTmF2QnV0dG9uKGV2ZW50KTtcbn07XG5cbm5hdmlnYXRpb24gPSBiZWhhdmlvcihcbiAge1xuICAgIFtDTElDS106IHtcbiAgICAgIFtOQVZfQ09OVFJPTF0oKSB7XG4gICAgICAgIC8vIElmIGFub3RoZXIgbmF2IGlzIG9wZW4sIGNsb3NlIGl0XG4gICAgICAgIGlmIChuYXZBY3RpdmUgIT09IHRoaXMpIHtcbiAgICAgICAgICBoaWRlQWN0aXZlTmF2RHJvcGRvd24oKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBzdG9yZSBhIHJlZmVyZW5jZSB0byB0aGUgbGFzdCBjbGlja2VkIG5hdiBsaW5rIGVsZW1lbnQsIHNvIHdlXG4gICAgICAgIC8vIGNhbiBoaWRlIHRoZSBkcm9wZG93biBpZiBhbm90aGVyIGVsZW1lbnQgb24gdGhlIHBhZ2UgaXMgY2xpY2tlZFxuICAgICAgICBpZiAoIW5hdkFjdGl2ZSkge1xuICAgICAgICAgIG5hdkFjdGl2ZSA9IHRoaXM7XG4gICAgICAgICAgdG9nZ2xlKG5hdkFjdGl2ZSwgdHJ1ZSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBEbyB0aGlzIHNvIHRoZSBldmVudCBoYW5kbGVyIG9uIHRoZSBib2R5IGRvZXNuJ3QgZmlyZVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9LFxuICAgICAgW0JPRFldOiBoaWRlQWN0aXZlTmF2RHJvcGRvd24sXG4gICAgICBbT1BFTkVSU106IHRvZ2dsZU5hdixcbiAgICAgIFtDTE9TRVJTXTogdG9nZ2xlTmF2LFxuICAgICAgW05BVl9MSU5LU10oKSB7XG4gICAgICAgIC8vIEEgbmF2aWdhdGlvbiBsaW5rIGhhcyBiZWVuIGNsaWNrZWQhIFdlIHdhbnQgdG8gY29sbGFwc2UgYW55XG4gICAgICAgIC8vIGhpZXJhcmNoaWNhbCBuYXZpZ2F0aW9uIFVJIGl0J3MgYSBwYXJ0IG9mLCBzbyB0aGF0IHRoZSB1c2VyXG4gICAgICAgIC8vIGNhbiBmb2N1cyBvbiB3aGF0ZXZlciB0aGV5J3ZlIGp1c3Qgc2VsZWN0ZWQuXG5cbiAgICAgICAgLy8gU29tZSBuYXZpZ2F0aW9uIGxpbmtzIGFyZSBpbnNpZGUgYWNjb3JkaW9uczsgd2hlbiB0aGV5J3JlXG4gICAgICAgIC8vIGNsaWNrZWQsIHdlIHdhbnQgdG8gY29sbGFwc2UgdGhvc2UgYWNjb3JkaW9ucy5cbiAgICAgICAgY29uc3QgYWNjID0gdGhpcy5jbG9zZXN0KGFjY29yZGlvbi5BQ0NPUkRJT04pO1xuXG4gICAgICAgIGlmIChhY2MpIHtcbiAgICAgICAgICBhY2NvcmRpb24uZ2V0QnV0dG9ucyhhY2MpLmZvckVhY2goKGJ0bikgPT4gYWNjb3JkaW9uLmhpZGUoYnRuKSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBJZiB0aGUgbW9iaWxlIG5hdmlnYXRpb24gbWVudSBpcyBhY3RpdmUsIHdlIHdhbnQgdG8gaGlkZSBpdC5cbiAgICAgICAgaWYgKGlzQWN0aXZlKCkpIHtcbiAgICAgICAgICBuYXZpZ2F0aW9uLnRvZ2dsZU5hdi5jYWxsKG5hdmlnYXRpb24sIGZhbHNlKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICB9LFxuICAgIGtleWRvd246IHtcbiAgICAgIFtOQVZfUFJJTUFSWV06IGtleW1hcCh7IEVzY2FwZTogaGFuZGxlRXNjYXBlIH0pLFxuICAgIH0sXG4gICAgZm9jdXNvdXQ6IHtcbiAgICAgIFtOQVZfUFJJTUFSWV0oZXZlbnQpIHtcbiAgICAgICAgY29uc3QgbmF2ID0gZXZlbnQudGFyZ2V0LmNsb3Nlc3QoTkFWX1BSSU1BUlkpO1xuXG4gICAgICAgIGlmICghbmF2LmNvbnRhaW5zKGV2ZW50LnJlbGF0ZWRUYXJnZXQpKSB7XG4gICAgICAgICAgaGlkZUFjdGl2ZU5hdkRyb3Bkb3duKCk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbiAge1xuICAgIGluaXQocm9vdCkge1xuICAgICAgY29uc3QgdHJhcENvbnRhaW5lciA9IHJvb3QubWF0Y2hlcyhOQVYpID8gcm9vdCA6IHJvb3QucXVlcnlTZWxlY3RvcihOQVYpO1xuXG4gICAgICBpZiAodHJhcENvbnRhaW5lcikge1xuICAgICAgICBuYXZpZ2F0aW9uLmZvY3VzVHJhcCA9IEZvY3VzVHJhcCh0cmFwQ29udGFpbmVyLCB7XG4gICAgICAgICAgRXNjYXBlOiBvbk1lbnVDbG9zZSxcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIHJlc2l6ZSgpO1xuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIiwgcmVzaXplLCBmYWxzZSk7XG4gICAgfSxcbiAgICB0ZWFyZG93bigpIHtcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFwicmVzaXplXCIsIHJlc2l6ZSwgZmFsc2UpO1xuICAgICAgbmF2QWN0aXZlID0gZmFsc2U7XG4gICAgfSxcbiAgICBmb2N1c1RyYXA6IG51bGwsXG4gICAgdG9nZ2xlTmF2LFxuICB9XG4pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IG5hdmlnYXRpb247XG4iLCJjb25zdCBiZWhhdmlvciA9IHJlcXVpcmUoXCIuLi8uLi91c3dkcy1jb3JlL3NyYy9qcy91dGlscy9iZWhhdmlvclwiKTtcbmNvbnN0IHNlbGVjdCA9IHJlcXVpcmUoXCIuLi8uLi91c3dkcy1jb3JlL3NyYy9qcy91dGlscy9zZWxlY3RcIik7XG5jb25zdCB7IHByZWZpeDogUFJFRklYIH0gPSByZXF1aXJlKFwiLi4vLi4vdXN3ZHMtY29yZS9zcmMvanMvY29uZmlnXCIpO1xuY29uc3QgeyBDTElDSyB9ID0gcmVxdWlyZShcIi4uLy4uL3Vzd2RzLWNvcmUvc3JjL2pzL2V2ZW50c1wiKTtcblxuY29uc3QgQ09OVEFJTkVSID0gYC4ke1BSRUZJWH0taW5wdXQtZ3JvdXBgO1xuY29uc3QgSU5QVVQgPSBgJHtDT05UQUlORVJ9IC4ke1BSRUZJWH0taW5wdXRgO1xuY29uc3QgREVDT1JBVElPTiA9IGAke0NPTlRBSU5FUn0gLiR7UFJFRklYfS1pbnB1dC1wcmVmaXgsICR7Q09OVEFJTkVSfSAuJHtQUkVGSVh9LWlucHV0LXN1ZmZpeGA7XG5jb25zdCBGT0NVU19DTEFTUyA9IFwiaXMtZm9jdXNlZFwiO1xuXG5mdW5jdGlvbiBzZXRGb2N1cyhlbCkge1xuICBlbC5jbG9zZXN0KENPTlRBSU5FUikucXVlcnlTZWxlY3RvcihgLiR7UFJFRklYfS1pbnB1dGApLmZvY3VzKCk7XG59XG5cbmZ1bmN0aW9uIGhhbmRsZUZvY3VzKCkge1xuICB0aGlzLmNsb3Nlc3QoQ09OVEFJTkVSKS5jbGFzc0xpc3QuYWRkKEZPQ1VTX0NMQVNTKTtcbn1cblxuZnVuY3Rpb24gaGFuZGxlQmx1cigpIHtcbiAgdGhpcy5jbG9zZXN0KENPTlRBSU5FUikuY2xhc3NMaXN0LnJlbW92ZShGT0NVU19DTEFTUyk7XG59XG5cbmNvbnN0IGlucHV0UHJlZml4U3VmZml4ID0gYmVoYXZpb3IoXG4gIHtcbiAgICBbQ0xJQ0tdOiB7XG4gICAgICBbREVDT1JBVElPTl0oKSB7XG4gICAgICAgIHNldEZvY3VzKHRoaXMpO1xuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICB7XG4gICAgaW5pdChyb290KSB7XG4gICAgICBzZWxlY3QoSU5QVVQsIHJvb3QpLmZvckVhY2goKGlucHV0RWwpID0+IHtcbiAgICAgICAgaW5wdXRFbC5hZGRFdmVudExpc3RlbmVyKFwiZm9jdXNcIiwgaGFuZGxlRm9jdXMsIGZhbHNlKTtcbiAgICAgICAgaW5wdXRFbC5hZGRFdmVudExpc3RlbmVyKFwiYmx1clwiLCBoYW5kbGVCbHVyLCBmYWxzZSk7XG4gICAgICB9KTtcbiAgICB9LFxuICB9XG4pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGlucHV0UHJlZml4U3VmZml4O1xuIiwiY29uc3Qgc2VsZWN0T3JNYXRjaGVzID0gcmVxdWlyZShcIi4uLy4uL3Vzd2RzLWNvcmUvc3JjL2pzL3V0aWxzL3NlbGVjdC1vci1tYXRjaGVzXCIpO1xuY29uc3QgRm9jdXNUcmFwID0gcmVxdWlyZShcIi4uLy4uL3Vzd2RzLWNvcmUvc3JjL2pzL3V0aWxzL2ZvY3VzLXRyYXBcIik7XG5jb25zdCBTY3JvbGxCYXJXaWR0aCA9IHJlcXVpcmUoXCIuLi8uLi91c3dkcy1jb3JlL3NyYy9qcy91dGlscy9zY3JvbGxiYXItd2lkdGhcIik7XG5cbmNvbnN0IHsgcHJlZml4OiBQUkVGSVggfSA9IHJlcXVpcmUoXCIuLi8uLi91c3dkcy1jb3JlL3NyYy9qcy9jb25maWdcIik7XG5cbmNvbnN0IE1PREFMX0NMQVNTTkFNRSA9IGAke1BSRUZJWH0tbW9kYWxgO1xuY29uc3QgT1ZFUkxBWV9DTEFTU05BTUUgPSBgJHtNT0RBTF9DTEFTU05BTUV9LW92ZXJsYXlgO1xuY29uc3QgV1JBUFBFUl9DTEFTU05BTUUgPSBgJHtNT0RBTF9DTEFTU05BTUV9LXdyYXBwZXJgO1xuY29uc3QgT1BFTkVSX0FUVFJJQlVURSA9IFwiZGF0YS1vcGVuLW1vZGFsXCI7XG5jb25zdCBDTE9TRVJfQVRUUklCVVRFID0gXCJkYXRhLWNsb3NlLW1vZGFsXCI7XG5jb25zdCBGT1JDRV9BQ1RJT05fQVRUUklCVVRFID0gXCJkYXRhLWZvcmNlLWFjdGlvblwiO1xuY29uc3QgTk9OX01PREFMX0hJRERFTl9BVFRSSUJVVEUgPSBgZGF0YS1tb2RhbC1oaWRkZW5gO1xuY29uc3QgTU9EQUwgPSBgLiR7TU9EQUxfQ0xBU1NOQU1FfWA7XG5jb25zdCBJTklUSUFMX0ZPQ1VTID0gYC4ke1dSQVBQRVJfQ0xBU1NOQU1FfSAqW2RhdGEtZm9jdXNdYDtcbmNvbnN0IENMT1NFX0JVVFRPTiA9IGAke1dSQVBQRVJfQ0xBU1NOQU1FfSAqWyR7Q0xPU0VSX0FUVFJJQlVURX1dYDtcbmNvbnN0IE9QRU5FUlMgPSBgKlske09QRU5FUl9BVFRSSUJVVEV9XVthcmlhLWNvbnRyb2xzXWA7XG5jb25zdCBDTE9TRVJTID0gYCR7Q0xPU0VfQlVUVE9OfSwgLiR7T1ZFUkxBWV9DTEFTU05BTUV9Om5vdChbJHtGT1JDRV9BQ1RJT05fQVRUUklCVVRFfV0pYDtcbmNvbnN0IE5PTl9NT0RBTFMgPSBgYm9keSA+ICo6bm90KC4ke1dSQVBQRVJfQ0xBU1NOQU1FfSk6bm90KFthcmlhLWhpZGRlbl0pYDtcbmNvbnN0IE5PTl9NT0RBTFNfSElEREVOID0gYFske05PTl9NT0RBTF9ISURERU5fQVRUUklCVVRFfV1gO1xuXG5jb25zdCBBQ1RJVkVfQ0xBU1MgPSBcInVzYS1qcy1tb2RhbC0tYWN0aXZlXCI7XG5jb25zdCBQUkVWRU5UX0NMSUNLX0NMQVNTID0gXCJ1c2EtanMtbm8tY2xpY2tcIjtcbmNvbnN0IFZJU0lCTEVfQ0xBU1MgPSBcImlzLXZpc2libGVcIjtcbmNvbnN0IEhJRERFTl9DTEFTUyA9IFwiaXMtaGlkZGVuXCI7XG5cbmxldCBtb2RhbDtcblxuY29uc3QgaXNBY3RpdmUgPSAoKSA9PiBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5jb250YWlucyhBQ1RJVkVfQ0xBU1MpO1xuY29uc3QgU0NST0xMQkFSX1dJRFRIID0gU2Nyb2xsQmFyV2lkdGgoKTtcbmNvbnN0IElOSVRJQUxfUEFERElORyA9IHdpbmRvd1xuICAuZ2V0Q29tcHV0ZWRTdHlsZShkb2N1bWVudC5ib2R5KVxuICAuZ2V0UHJvcGVydHlWYWx1ZShcInBhZGRpbmctcmlnaHRcIik7XG5jb25zdCBURU1QT1JBUllfUEFERElORyA9IGAke1xuICBwYXJzZUludChJTklUSUFMX1BBRERJTkcucmVwbGFjZSgvcHgvLCBcIlwiKSwgMTApICtcbiAgcGFyc2VJbnQoU0NST0xMQkFSX1dJRFRILnJlcGxhY2UoL3B4LywgXCJcIiksIDEwKVxufXB4YDtcblxuLyoqXG4gKiAgSXMgYm91bmQgdG8gZXNjYXBlIGtleSwgY2xvc2VzIG1vZGFsIHdoZW5cbiAqL1xuY29uc3Qgb25NZW51Q2xvc2UgPSAoKSA9PiB7XG4gIG1vZGFsLnRvZ2dsZU1vZGFsLmNhbGwobW9kYWwsIGZhbHNlKTtcbn07XG5cbi8qKlxuICogIFRvZ2dsZSB0aGUgdmlzaWJpbGl0eSBvZiBhIG1vZGFsIHdpbmRvd1xuICpcbiAqIEBwYXJhbSB7S2V5Ym9hcmRFdmVudH0gZXZlbnQgdGhlIGtleWRvd24gZXZlbnRcbiAqIEByZXR1cm5zIHtib29sZWFufSBzYWZlQWN0aXZlIGlmIG1vYmlsZSBpcyBvcGVuXG4gKi9cbmZ1bmN0aW9uIHRvZ2dsZU1vZGFsKGV2ZW50KSB7XG4gIGxldCBvcmlnaW5hbE9wZW5lcjtcbiAgbGV0IGNsaWNrZWRFbGVtZW50ID0gZXZlbnQudGFyZ2V0O1xuICBjb25zdCB7IGJvZHkgfSA9IGRvY3VtZW50O1xuICBjb25zdCBzYWZlQWN0aXZlID0gIWlzQWN0aXZlKCk7XG4gIGNvbnN0IG1vZGFsSWQgPSBjbGlja2VkRWxlbWVudFxuICAgID8gY2xpY2tlZEVsZW1lbnQuZ2V0QXR0cmlidXRlKFwiYXJpYS1jb250cm9sc1wiKVxuICAgIDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi51c2EtbW9kYWwtd3JhcHBlci5pcy12aXNpYmxlXCIpO1xuICBjb25zdCB0YXJnZXRNb2RhbCA9IHNhZmVBY3RpdmVcbiAgICA/IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKG1vZGFsSWQpXG4gICAgOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLnVzYS1tb2RhbC13cmFwcGVyLmlzLXZpc2libGVcIik7XG5cbiAgLy8gaWYgdGhlcmUgaXMgbm8gbW9kYWwgd2UgcmV0dXJuIGVhcmx5XG4gIGlmICghdGFyZ2V0TW9kYWwpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBjb25zdCBvcGVuRm9jdXNFbCA9IHRhcmdldE1vZGFsLnF1ZXJ5U2VsZWN0b3IoSU5JVElBTF9GT0NVUylcbiAgICA/IHRhcmdldE1vZGFsLnF1ZXJ5U2VsZWN0b3IoSU5JVElBTF9GT0NVUylcbiAgICA6IHRhcmdldE1vZGFsLnF1ZXJ5U2VsZWN0b3IoXCIudXNhLW1vZGFsXCIpO1xuICBjb25zdCByZXR1cm5Gb2N1cyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFxuICAgIHRhcmdldE1vZGFsLmdldEF0dHJpYnV0ZShcImRhdGEtb3BlbmVyXCIpXG4gICk7XG4gIGNvbnN0IG1lbnVCdXR0b24gPSBib2R5LnF1ZXJ5U2VsZWN0b3IoT1BFTkVSUyk7XG4gIGNvbnN0IGZvcmNlVXNlckFjdGlvbiA9IHRhcmdldE1vZGFsLmdldEF0dHJpYnV0ZShGT1JDRV9BQ1RJT05fQVRUUklCVVRFKTtcblxuICAvLyBTZXRzIHRoZSBjbGlja2VkIGVsZW1lbnQgdG8gdGhlIGNsb3NlIGJ1dHRvblxuICAvLyBzbyBlc2Mga2V5IGFsd2F5cyBjbG9zZXMgbW9kYWxcbiAgaWYgKGV2ZW50LnR5cGUgPT09IFwia2V5ZG93blwiICYmIHRhcmdldE1vZGFsICE9PSBudWxsKSB7XG4gICAgY2xpY2tlZEVsZW1lbnQgPSB0YXJnZXRNb2RhbC5xdWVyeVNlbGVjdG9yKENMT1NFX0JVVFRPTik7XG4gIH1cblxuICAvLyBXaGVuIHdlJ3JlIG5vdCBoaXR0aW5nIHRoZSBlc2NhcGUga2V54oCmXG4gIGlmIChjbGlja2VkRWxlbWVudCkge1xuICAgIC8vIE1ha2Ugc3VyZSB3ZSBjbGljayB0aGUgb3BlbmVyXG4gICAgLy8gSWYgaXQgZG9lc24ndCBoYXZlIGFuIElELCBtYWtlIG9uZVxuICAgIC8vIFN0b3JlIGlkIGFzIGRhdGEgYXR0cmlidXRlIG9uIG1vZGFsXG4gICAgaWYgKGNsaWNrZWRFbGVtZW50Lmhhc0F0dHJpYnV0ZShPUEVORVJfQVRUUklCVVRFKSkge1xuICAgICAgaWYgKHRoaXMuZ2V0QXR0cmlidXRlKFwiaWRcIikgPT09IG51bGwpIHtcbiAgICAgICAgb3JpZ2luYWxPcGVuZXIgPSBgbW9kYWwtJHtNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiA5MDAwMDApICsgMTAwMDAwfWA7XG4gICAgICAgIHRoaXMuc2V0QXR0cmlidXRlKFwiaWRcIiwgb3JpZ2luYWxPcGVuZXIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgb3JpZ2luYWxPcGVuZXIgPSB0aGlzLmdldEF0dHJpYnV0ZShcImlkXCIpO1xuICAgICAgfVxuICAgICAgdGFyZ2V0TW9kYWwuc2V0QXR0cmlidXRlKFwiZGF0YS1vcGVuZXJcIiwgb3JpZ2luYWxPcGVuZXIpO1xuICAgIH1cblxuICAgIC8vIFRoaXMgYmFzaWNhbGx5IHN0b3BzIHRoZSBwcm9wYWdhdGlvbiBpZiB0aGUgZWxlbWVudFxuICAgIC8vIGlzIGluc2lkZSB0aGUgbW9kYWwgYW5kIG5vdCBhIGNsb3NlIGJ1dHRvbiBvclxuICAgIC8vIGVsZW1lbnQgaW5zaWRlIGEgY2xvc2UgYnV0dG9uXG4gICAgaWYgKGNsaWNrZWRFbGVtZW50LmNsb3Nlc3QoYC4ke01PREFMX0NMQVNTTkFNRX1gKSkge1xuICAgICAgaWYgKFxuICAgICAgICBjbGlja2VkRWxlbWVudC5oYXNBdHRyaWJ1dGUoQ0xPU0VSX0FUVFJJQlVURSkgfHxcbiAgICAgICAgY2xpY2tlZEVsZW1lbnQuY2xvc2VzdChgWyR7Q0xPU0VSX0FUVFJJQlVURX1dYClcbiAgICAgICkge1xuICAgICAgICAvLyBkbyBub3RoaW5nLiBtb3ZlIG9uLlxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBib2R5LmNsYXNzTGlzdC50b2dnbGUoQUNUSVZFX0NMQVNTLCBzYWZlQWN0aXZlKTtcbiAgdGFyZ2V0TW9kYWwuY2xhc3NMaXN0LnRvZ2dsZShWSVNJQkxFX0NMQVNTLCBzYWZlQWN0aXZlKTtcbiAgdGFyZ2V0TW9kYWwuY2xhc3NMaXN0LnRvZ2dsZShISURERU5fQ0xBU1MsICFzYWZlQWN0aXZlKTtcblxuICAvLyBJZiB1c2VyIGlzIGZvcmNlZCB0byB0YWtlIGFuIGFjdGlvbiwgYWRkaW5nXG4gIC8vIGEgY2xhc3MgdG8gdGhlIGJvZHkgdGhhdCBwcmV2ZW50cyBjbGlja2luZyB1bmRlcm5lYXRoXG4gIC8vIG92ZXJsYXlcbiAgaWYgKGZvcmNlVXNlckFjdGlvbikge1xuICAgIGJvZHkuY2xhc3NMaXN0LnRvZ2dsZShQUkVWRU5UX0NMSUNLX0NMQVNTLCBzYWZlQWN0aXZlKTtcbiAgfVxuXG4gIC8vIEFjY291bnQgZm9yIGNvbnRlbnQgc2hpZnRpbmcgZnJvbSBib2R5IG92ZXJmbG93OiBoaWRkZW5cbiAgLy8gV2Ugb25seSBjaGVjayBwYWRkaW5nUmlnaHQgaW4gY2FzZSBhcHBzIGFyZSBhZGRpbmcgb3RoZXIgcHJvcGVydGllc1xuICAvLyB0byB0aGUgYm9keSBlbGVtZW50XG4gIGJvZHkuc3R5bGUucGFkZGluZ1JpZ2h0ID1cbiAgICBib2R5LnN0eWxlLnBhZGRpbmdSaWdodCA9PT0gVEVNUE9SQVJZX1BBRERJTkdcbiAgICAgID8gSU5JVElBTF9QQURESU5HXG4gICAgICA6IFRFTVBPUkFSWV9QQURESU5HO1xuXG4gIC8vIEhhbmRsZSB0aGUgZm9jdXMgYWN0aW9uc1xuICBpZiAoc2FmZUFjdGl2ZSAmJiBvcGVuRm9jdXNFbCkge1xuICAgIC8vIFRoZSBtb2RhbCB3aW5kb3cgaXMgb3BlbmVkLiBGb2N1cyBpcyBzZXQgdG8gY2xvc2UgYnV0dG9uLlxuXG4gICAgLy8gQmluZHMgZXNjYXBlIGtleSBpZiB3ZSdyZSBub3QgZm9yY2luZ1xuICAgIC8vIHRoZSB1c2VyIHRvIHRha2UgYW4gYWN0aW9uXG4gICAgaWYgKGZvcmNlVXNlckFjdGlvbikge1xuICAgICAgbW9kYWwuZm9jdXNUcmFwID0gRm9jdXNUcmFwKHRhcmdldE1vZGFsKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbW9kYWwuZm9jdXNUcmFwID0gRm9jdXNUcmFwKHRhcmdldE1vZGFsLCB7XG4gICAgICAgIEVzY2FwZTogb25NZW51Q2xvc2UsXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBIYW5kbGVzIGZvY3VzIHNldHRpbmcgYW5kIGludGVyYWN0aW9uc1xuICAgIG1vZGFsLmZvY3VzVHJhcC51cGRhdGUoc2FmZUFjdGl2ZSk7XG4gICAgb3BlbkZvY3VzRWwuZm9jdXMoKTtcblxuICAgIC8vIEhpZGVzIGV2ZXJ5dGhpbmcgdGhhdCBpcyBub3QgdGhlIG1vZGFsIGZyb20gc2NyZWVuIHJlYWRlcnNcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKE5PTl9NT0RBTFMpLmZvckVhY2goKG5vbk1vZGFsKSA9PiB7XG4gICAgICBub25Nb2RhbC5zZXRBdHRyaWJ1dGUoXCJhcmlhLWhpZGRlblwiLCBcInRydWVcIik7XG4gICAgICBub25Nb2RhbC5zZXRBdHRyaWJ1dGUoTk9OX01PREFMX0hJRERFTl9BVFRSSUJVVEUsIFwiXCIpO1xuICAgIH0pO1xuICB9IGVsc2UgaWYgKCFzYWZlQWN0aXZlICYmIG1lbnVCdXR0b24gJiYgcmV0dXJuRm9jdXMpIHtcbiAgICAvLyBUaGUgbW9kYWwgd2luZG93IGlzIGNsb3NlZC5cbiAgICAvLyBOb24tbW9kYWxzIG5vdyBhY2Nlc2libGUgdG8gc2NyZWVuIHJlYWRlclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoTk9OX01PREFMU19ISURERU4pLmZvckVhY2goKG5vbk1vZGFsKSA9PiB7XG4gICAgICBub25Nb2RhbC5yZW1vdmVBdHRyaWJ1dGUoXCJhcmlhLWhpZGRlblwiKTtcbiAgICAgIG5vbk1vZGFsLnJlbW92ZUF0dHJpYnV0ZShOT05fTU9EQUxfSElEREVOX0FUVFJJQlVURSk7XG4gICAgfSk7XG5cbiAgICAvLyBGb2N1cyBpcyByZXR1cm5lZCB0byB0aGUgb3BlbmVyXG4gICAgcmV0dXJuRm9jdXMuZm9jdXMoKTtcbiAgICBtb2RhbC5mb2N1c1RyYXAudXBkYXRlKHNhZmVBY3RpdmUpO1xuICB9XG5cbiAgcmV0dXJuIHNhZmVBY3RpdmU7XG59XG5cbi8qKlxuICogIEJ1aWxkcyBtb2RhbCB3aW5kb3cgZnJvbSBiYXNlIEhUTUxcbiAqXG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBiYXNlQ29tcG9uZW50IHRoZSBtb2RhbCBodG1sIGluIHRoZSBET01cbiAqL1xuY29uc3Qgc2V0VXBNb2RhbCA9IChiYXNlQ29tcG9uZW50KSA9PiB7XG4gIGNvbnN0IG1vZGFsQ29udGVudCA9IGJhc2VDb21wb25lbnQ7XG4gIGNvbnN0IG1vZGFsV3JhcHBlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gIGNvbnN0IG92ZXJsYXlEaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICBjb25zdCBtb2RhbElEID0gYmFzZUNvbXBvbmVudC5nZXRBdHRyaWJ1dGUoXCJpZFwiKTtcbiAgY29uc3QgYXJpYUxhYmVsbGVkQnkgPSBiYXNlQ29tcG9uZW50LmdldEF0dHJpYnV0ZShcImFyaWEtbGFiZWxsZWRieVwiKTtcbiAgY29uc3QgYXJpYURlc2NyaWJlZEJ5ID0gYmFzZUNvbXBvbmVudC5nZXRBdHRyaWJ1dGUoXCJhcmlhLWRlc2NyaWJlZGJ5XCIpO1xuICBjb25zdCBmb3JjZVVzZXJBY3Rpb24gPSBiYXNlQ29tcG9uZW50Lmhhc0F0dHJpYnV0ZShGT1JDRV9BQ1RJT05fQVRUUklCVVRFKVxuICAgID8gYmFzZUNvbXBvbmVudC5oYXNBdHRyaWJ1dGUoRk9SQ0VfQUNUSU9OX0FUVFJJQlVURSlcbiAgICA6IGZhbHNlO1xuICAvLyBDcmVhdGUgcGxhY2Vob2xkZXIgd2hlcmUgbW9kYWwgaXMgZm9yIGNsZWFudXBcbiAgY29uc3Qgb3JpZ2luYWxMb2NhdGlvblBsYWNlSG9sZGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgb3JpZ2luYWxMb2NhdGlvblBsYWNlSG9sZGVyLnNldEF0dHJpYnV0ZShgZGF0YS1wbGFjZWhvbGRlci1mb3JgLCBtb2RhbElEKTtcbiAgb3JpZ2luYWxMb2NhdGlvblBsYWNlSG9sZGVyLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgb3JpZ2luYWxMb2NhdGlvblBsYWNlSG9sZGVyLnNldEF0dHJpYnV0ZSgnYXJpYS1oaWRkZW4nLCAndHJ1ZScpO1xuICBmb3IgKGxldCBhdHRyaWJ1dGVJbmRleCA9IDA7IGF0dHJpYnV0ZUluZGV4IDwgbW9kYWxDb250ZW50LmF0dHJpYnV0ZXMubGVuZ3RoOyBhdHRyaWJ1dGVJbmRleCArPSAxKSB7XG4gICAgY29uc3QgYXR0cmlidXRlID0gbW9kYWxDb250ZW50LmF0dHJpYnV0ZXNbYXR0cmlidXRlSW5kZXhdO1xuICAgIG9yaWdpbmFsTG9jYXRpb25QbGFjZUhvbGRlci5zZXRBdHRyaWJ1dGUoYGRhdGEtb3JpZ2luYWwtJHthdHRyaWJ1dGUubmFtZX1gLCBhdHRyaWJ1dGUudmFsdWUpO1xuICB9XG5cbiAgbW9kYWxDb250ZW50LmFmdGVyKG9yaWdpbmFsTG9jYXRpb25QbGFjZUhvbGRlcik7XG5cbiAgLy8gUmVidWlsZCB0aGUgbW9kYWwgZWxlbWVudFxuICBtb2RhbENvbnRlbnQucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUobW9kYWxXcmFwcGVyLCBtb2RhbENvbnRlbnQpO1xuICBtb2RhbFdyYXBwZXIuYXBwZW5kQ2hpbGQobW9kYWxDb250ZW50KTtcbiAgbW9kYWxDb250ZW50LnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKG92ZXJsYXlEaXYsIG1vZGFsQ29udGVudCk7XG4gIG92ZXJsYXlEaXYuYXBwZW5kQ2hpbGQobW9kYWxDb250ZW50KTtcblxuICAvLyBBZGQgY2xhc3NlcyBhbmQgYXR0cmlidXRlc1xuICBtb2RhbFdyYXBwZXIuY2xhc3NMaXN0LmFkZChISURERU5fQ0xBU1MpO1xuICBtb2RhbFdyYXBwZXIuY2xhc3NMaXN0LmFkZChXUkFQUEVSX0NMQVNTTkFNRSk7XG4gIG92ZXJsYXlEaXYuY2xhc3NMaXN0LmFkZChPVkVSTEFZX0NMQVNTTkFNRSk7XG5cbiAgLy8gU2V0IGF0dHJpYnV0ZXNcbiAgbW9kYWxXcmFwcGVyLnNldEF0dHJpYnV0ZShcInJvbGVcIiwgXCJkaWFsb2dcIik7XG4gIG1vZGFsV3JhcHBlci5zZXRBdHRyaWJ1dGUoXCJpZFwiLCBtb2RhbElEKTtcblxuICBpZiAoYXJpYUxhYmVsbGVkQnkpIHtcbiAgICBtb2RhbFdyYXBwZXIuc2V0QXR0cmlidXRlKFwiYXJpYS1sYWJlbGxlZGJ5XCIsIGFyaWFMYWJlbGxlZEJ5KTtcbiAgfVxuXG4gIGlmIChhcmlhRGVzY3JpYmVkQnkpIHtcbiAgICBtb2RhbFdyYXBwZXIuc2V0QXR0cmlidXRlKFwiYXJpYS1kZXNjcmliZWRieVwiLCBhcmlhRGVzY3JpYmVkQnkpO1xuICB9XG5cbiAgaWYgKGZvcmNlVXNlckFjdGlvbikge1xuICAgIG1vZGFsV3JhcHBlci5zZXRBdHRyaWJ1dGUoRk9SQ0VfQUNUSU9OX0FUVFJJQlVURSwgXCJ0cnVlXCIpO1xuICB9XG5cbiAgLy8gVXBkYXRlIHRoZSBiYXNlIGVsZW1lbnQgSFRNTFxuICBiYXNlQ29tcG9uZW50LnJlbW92ZUF0dHJpYnV0ZShcImlkXCIpO1xuICBiYXNlQ29tcG9uZW50LnJlbW92ZUF0dHJpYnV0ZShcImFyaWEtbGFiZWxsZWRieVwiKTtcbiAgYmFzZUNvbXBvbmVudC5yZW1vdmVBdHRyaWJ1dGUoXCJhcmlhLWRlc2NyaWJlZGJ5XCIpO1xuICBiYXNlQ29tcG9uZW50LnNldEF0dHJpYnV0ZShcInRhYmluZGV4XCIsIFwiLTFcIik7XG5cbiAgLy8gQWRkIGFyaWEtY29udHJvbHNcbiAgY29uc3QgbW9kYWxDbG9zZXJzID0gbW9kYWxXcmFwcGVyLnF1ZXJ5U2VsZWN0b3JBbGwoQ0xPU0VSUyk7XG4gIG1vZGFsQ2xvc2Vycy5mb3JFYWNoKChlbCkgPT4ge1xuICAgIGVsLnNldEF0dHJpYnV0ZShcImFyaWEtY29udHJvbHNcIiwgbW9kYWxJRCk7XG4gIH0pO1xuXG4gIC8vIE1vdmUgYWxsIG1vZGFscyB0byB0aGUgZW5kIG9mIHRoZSBET00uIERvaW5nIHRoaXMgYWxsb3dzIHVzIHRvXG4gIC8vIG1vcmUgZWFzaWx5IGZpbmQgdGhlIGVsZW1lbnRzIHRvIGhpZGUgZnJvbSBzY3JlZW4gcmVhZGVyc1xuICAvLyB3aGVuIHRoZSBtb2RhbCBpcyBvcGVuLlxuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKG1vZGFsV3JhcHBlcik7XG59O1xuXG5jb25zdCBjbGVhblVwTW9kYWwgPSAoYmFzZUNvbXBvbmVudCkgPT4ge1xuICBjb25zdCBtb2RhbENvbnRlbnQgPSBiYXNlQ29tcG9uZW50O1xuICBjb25zdCBtb2RhbFdyYXBwZXIgPSBtb2RhbENvbnRlbnQucGFyZW50RWxlbWVudC5wYXJlbnRFbGVtZW50O1xuICBjb25zdCBtb2RhbElEID0gbW9kYWxXcmFwcGVyLmdldEF0dHJpYnV0ZShcImlkXCIpO1xuXG4gIGNvbnN0IG9yaWdpbmFsTG9jYXRpb25QbGFjZUhvbGRlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYFtkYXRhLXBsYWNlaG9sZGVyLWZvcj1cIiR7bW9kYWxJRH1cIl1gKTtcbiAgaWYob3JpZ2luYWxMb2NhdGlvblBsYWNlSG9sZGVyKVxuICB7XG4gICAgZm9yIChsZXQgYXR0cmlidXRlSW5kZXggPSAwOyBhdHRyaWJ1dGVJbmRleCA8IG9yaWdpbmFsTG9jYXRpb25QbGFjZUhvbGRlci5hdHRyaWJ1dGVzLmxlbmd0aDsgYXR0cmlidXRlSW5kZXggKz0gMSkge1xuICAgICAgY29uc3QgYXR0cmlidXRlID0gb3JpZ2luYWxMb2NhdGlvblBsYWNlSG9sZGVyLmF0dHJpYnV0ZXNbYXR0cmlidXRlSW5kZXhdO1xuICAgICAgaWYoYXR0cmlidXRlLm5hbWUuc3RhcnRzV2l0aCgnZGF0YS1vcmlnaW5hbC0nKSlcbiAgICAgIHtcbiAgICAgICAgLy8gZGF0YS1vcmlnaW5hbC0gaXMgMTQgbG9uZ1xuICAgICAgICBtb2RhbENvbnRlbnQuc2V0QXR0cmlidXRlKGF0dHJpYnV0ZS5uYW1lLnN1YnN0cigxNCksIGF0dHJpYnV0ZS52YWx1ZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgb3JpZ2luYWxMb2NhdGlvblBsYWNlSG9sZGVyLmFmdGVyKG1vZGFsQ29udGVudCk7XG4gICAgb3JpZ2luYWxMb2NhdGlvblBsYWNlSG9sZGVyLnBhcmVudEVsZW1lbnQucmVtb3ZlQ2hpbGQob3JpZ2luYWxMb2NhdGlvblBsYWNlSG9sZGVyKTtcbiAgfVxuXG4gIG1vZGFsV3JhcHBlci5wYXJlbnRFbGVtZW50LnJlbW92ZUNoaWxkKG1vZGFsV3JhcHBlcik7XG59O1xuXG5tb2RhbCA9IHtcbiAgaW5pdChyb290KSB7XG4gICAgc2VsZWN0T3JNYXRjaGVzKE1PREFMLCByb290KS5mb3JFYWNoKChtb2RhbFdpbmRvdykgPT4ge1xuICAgICAgY29uc3QgbW9kYWxJZCA9IG1vZGFsV2luZG93LmlkO1xuICAgICAgc2V0VXBNb2RhbChtb2RhbFdpbmRvdyk7XG5cbiAgICAgIC8vIHRoaXMgd2lsbCBxdWVyeSBhbGwgb3BlbmVycyBhbmQgY2xvc2VycyBpbmNsdWRpbmcgdGhlIG92ZXJsYXlcbiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoYFthcmlhLWNvbnRyb2xzPVwiJHttb2RhbElkfVwiXWApLmZvckVhY2goKGl0ZW0pID0+IHtcbiAgICAgICAgLy8gVHVybiBhbmNob3IgbGlua3MgaW50byBidXR0b25zIGJlY2F1c2Ugb2ZcbiAgICAgICAgLy8gVm9pY2VPdmVyIG9uIFNhZmFyaVxuICAgICAgICBpZiAoaXRlbS5ub2RlTmFtZSA9PT0gXCJBXCIpIHtcbiAgICAgICAgICBpdGVtLnNldEF0dHJpYnV0ZShcInJvbGVcIiwgXCJidXR0b25cIik7XG4gICAgICAgICAgaXRlbS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKGUpID0+IGUucHJldmVudERlZmF1bHQoKSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDYW4gdW5jb21tZW50IHdoZW4gYXJpYS1oYXNwb3B1cD1cImRpYWxvZ1wiIGlzIHN1cHBvcnRlZFxuICAgICAgICAvLyBodHRwczovL2ExMXlzdXBwb3J0LmlvL3RlY2gvYXJpYS9hcmlhLWhhc3BvcHVwX2F0dHJpYnV0ZVxuICAgICAgICAvLyBNb3N0IHNjcmVlbiByZWFkZXJzIHN1cHBvcnQgYXJpYS1oYXNwb3B1cCwgYnV0IG1pZ2h0IGFubm91bmNlXG4gICAgICAgIC8vIGFzIG9wZW5pbmcgYSBtZW51IGlmIFwiZGlhbG9nXCIgaXMgbm90IHN1cHBvcnRlZC5cbiAgICAgICAgLy8gaXRlbS5zZXRBdHRyaWJ1dGUoXCJhcmlhLWhhc3BvcHVwXCIsIFwiZGlhbG9nXCIpO1xuXG4gICAgICAgIGl0ZW0uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRvZ2dsZU1vZGFsKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9LFxuICB0ZWFyZG93bihyb290KSB7XG4gICAgc2VsZWN0T3JNYXRjaGVzKE1PREFMLCByb290KS5mb3JFYWNoKChtb2RhbFdpbmRvdykgPT4ge1xuICAgICAgY2xlYW5VcE1vZGFsKG1vZGFsV2luZG93KTtcbiAgICAgIGNvbnN0IG1vZGFsSWQgPSBtb2RhbFdpbmRvdy5pZDtcblxuICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChgW2FyaWEtY29udHJvbHM9XCIke21vZGFsSWR9XCJdYClcbiAgICAgICAgLmZvckVhY2goKGl0ZW0pID0+IGl0ZW0ucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRvZ2dsZU1vZGFsKSk7XG4gICAgfSk7XG4gIH0sXG4gIGZvY3VzVHJhcDogbnVsbCxcbiAgdG9nZ2xlTW9kYWwsXG4gIG9uKHJvb3QpIHtcbiAgICB0aGlzLmluaXQocm9vdCk7XG4gIH0sXG4gIG9mZihyb290KSB7XG4gICAgdGhpcy50ZWFyZG93bihyb290KTtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBtb2RhbDtcbiIsImNvbnN0IGlnbm9yZSA9IHJlcXVpcmUoXCJyZWNlcHRvci9pZ25vcmVcIik7XG5jb25zdCBiZWhhdmlvciA9IHJlcXVpcmUoXCIuLi8uLi91c3dkcy1jb3JlL3NyYy9qcy91dGlscy9iZWhhdmlvclwiKTtcbmNvbnN0IHNlbGVjdCA9IHJlcXVpcmUoXCIuLi8uLi91c3dkcy1jb3JlL3NyYy9qcy91dGlscy9zZWxlY3RcIik7XG5cbmNvbnN0IHsgQ0xJQ0sgfSA9IHJlcXVpcmUoXCIuLi8uLi91c3dkcy1jb3JlL3NyYy9qcy9ldmVudHNcIik7XG5cbmNvbnN0IEJVVFRPTiA9IFwiLmpzLXNlYXJjaC1idXR0b25cIjtcbmNvbnN0IEZPUk0gPSBcIi5qcy1zZWFyY2gtZm9ybVwiO1xuY29uc3QgSU5QVVQgPSBcIlt0eXBlPXNlYXJjaF1cIjtcbmNvbnN0IENPTlRFWFQgPSBcImhlYWRlclwiOyAvLyBYWFhcblxubGV0IGxhc3RCdXR0b247XG5cbmNvbnN0IGdldEZvcm0gPSAoYnV0dG9uKSA9PiB7XG4gIGNvbnN0IGNvbnRleHQgPSBidXR0b24uY2xvc2VzdChDT05URVhUKTtcbiAgcmV0dXJuIGNvbnRleHQgPyBjb250ZXh0LnF1ZXJ5U2VsZWN0b3IoRk9STSkgOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKEZPUk0pO1xufTtcblxuY29uc3QgdG9nZ2xlU2VhcmNoID0gKGJ1dHRvbiwgYWN0aXZlKSA9PiB7XG4gIGNvbnN0IGZvcm0gPSBnZXRGb3JtKGJ1dHRvbik7XG5cbiAgaWYgKCFmb3JtKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBObyAke0ZPUk19IGZvdW5kIGZvciBzZWFyY2ggdG9nZ2xlIGluICR7Q09OVEVYVH0hYCk7XG4gIH1cblxuICAvKiBlc2xpbnQtZGlzYWJsZSBuby1wYXJhbS1yZWFzc2lnbiAqL1xuICBidXR0b24uaGlkZGVuID0gYWN0aXZlO1xuICBmb3JtLmhpZGRlbiA9ICFhY3RpdmU7XG4gIC8qIGVzbGludC1lbmFibGUgKi9cblxuICBpZiAoIWFjdGl2ZSkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGNvbnN0IGlucHV0ID0gZm9ybS5xdWVyeVNlbGVjdG9yKElOUFVUKTtcblxuICBpZiAoaW5wdXQpIHtcbiAgICBpbnB1dC5mb2N1cygpO1xuICB9XG4gIC8vIHdoZW4gdGhlIHVzZXIgY2xpY2tzIF9vdXRzaWRlXyBvZiB0aGUgZm9ybSB3L2lnbm9yZSgpOiBoaWRlIHRoZVxuICAvLyBzZWFyY2gsIHRoZW4gcmVtb3ZlIHRoZSBsaXN0ZW5lclxuICBjb25zdCBsaXN0ZW5lciA9IGlnbm9yZShmb3JtLCAoKSA9PiB7XG4gICAgaWYgKGxhc3RCdXR0b24pIHtcbiAgICAgIGhpZGVTZWFyY2guY2FsbChsYXN0QnV0dG9uKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11c2UtYmVmb3JlLWRlZmluZVxuICAgIH1cblxuICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlRXZlbnRMaXN0ZW5lcihDTElDSywgbGlzdGVuZXIpO1xuICB9KTtcblxuICAvLyBOb3JtYWxseSB3ZSB3b3VsZCBqdXN0IHJ1biB0aGlzIGNvZGUgd2l0aG91dCBhIHRpbWVvdXQsIGJ1dFxuICAvLyBJRTExIGFuZCBFZGdlIHdpbGwgYWN0dWFsbHkgY2FsbCB0aGUgbGlzdGVuZXIgKmltbWVkaWF0ZWx5KiBiZWNhdXNlXG4gIC8vIHRoZXkgYXJlIGN1cnJlbnRseSBoYW5kbGluZyB0aGlzIGV4YWN0IHR5cGUgb2YgZXZlbnQsIHNvIHdlJ2xsXG4gIC8vIG1ha2Ugc3VyZSB0aGUgYnJvd3NlciBpcyBkb25lIGhhbmRsaW5nIHRoZSBjdXJyZW50IGNsaWNrIGV2ZW50LFxuICAvLyBpZiBhbnksIGJlZm9yZSB3ZSBhdHRhY2ggdGhlIGxpc3RlbmVyLlxuICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICBkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoQ0xJQ0ssIGxpc3RlbmVyKTtcbiAgfSwgMCk7XG59O1xuXG5mdW5jdGlvbiBzaG93U2VhcmNoKCkge1xuICB0b2dnbGVTZWFyY2godGhpcywgdHJ1ZSk7XG4gIGxhc3RCdXR0b24gPSB0aGlzO1xufVxuXG5mdW5jdGlvbiBoaWRlU2VhcmNoKCkge1xuICB0b2dnbGVTZWFyY2godGhpcywgZmFsc2UpO1xuICBsYXN0QnV0dG9uID0gdW5kZWZpbmVkO1xufVxuXG5jb25zdCBzZWFyY2ggPSBiZWhhdmlvcihcbiAge1xuICAgIFtDTElDS106IHtcbiAgICAgIFtCVVRUT05dOiBzaG93U2VhcmNoLFxuICAgIH0sXG4gIH0sXG4gIHtcbiAgICBpbml0KHRhcmdldCkge1xuICAgICAgc2VsZWN0KEJVVFRPTiwgdGFyZ2V0KS5mb3JFYWNoKChidXR0b24pID0+IHtcbiAgICAgICAgdG9nZ2xlU2VhcmNoKGJ1dHRvbiwgZmFsc2UpO1xuICAgICAgfSk7XG4gICAgfSxcbiAgICB0ZWFyZG93bigpIHtcbiAgICAgIC8vIGZvcmdldCB0aGUgbGFzdCBidXR0b24gY2xpY2tlZFxuICAgICAgbGFzdEJ1dHRvbiA9IHVuZGVmaW5lZDtcbiAgICB9LFxuICB9XG4pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHNlYXJjaDtcbiIsImNvbnN0IG9uY2UgPSByZXF1aXJlKFwicmVjZXB0b3Ivb25jZVwiKTtcbmNvbnN0IGJlaGF2aW9yID0gcmVxdWlyZShcIi4uLy4uL3Vzd2RzLWNvcmUvc3JjL2pzL3V0aWxzL2JlaGF2aW9yXCIpO1xuY29uc3QgeyBDTElDSyB9ID0gcmVxdWlyZShcIi4uLy4uL3Vzd2RzLWNvcmUvc3JjL2pzL2V2ZW50c1wiKTtcbmNvbnN0IHsgcHJlZml4OiBQUkVGSVggfSA9IHJlcXVpcmUoXCIuLi8uLi91c3dkcy1jb3JlL3NyYy9qcy9jb25maWdcIik7XG5cbmNvbnN0IExJTksgPSBgLiR7UFJFRklYfS1za2lwbmF2W2hyZWZePVwiI1wiXSwgLiR7UFJFRklYfS1mb290ZXJfX3JldHVybi10by10b3AgW2hyZWZePVwiI1wiXWA7XG5jb25zdCBNQUlOQ09OVEVOVCA9IFwibWFpbi1jb250ZW50XCI7XG5cbmZ1bmN0aW9uIHNldFRhYmluZGV4KCkge1xuICAvLyBOQjogd2Uga25vdyBiZWNhdXNlIG9mIHRoZSBzZWxlY3RvciB3ZSdyZSBkZWxlZ2F0aW5nIHRvIGJlbG93IHRoYXQgdGhlXG4gIC8vIGhyZWYgYWxyZWFkeSBiZWdpbnMgd2l0aCAnIydcbiAgY29uc3QgaWQgPSBlbmNvZGVVUkkodGhpcy5nZXRBdHRyaWJ1dGUoXCJocmVmXCIpKTtcbiAgY29uc3QgdGFyZ2V0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXG4gICAgaWQgPT09IFwiI1wiID8gTUFJTkNPTlRFTlQgOiBpZC5zbGljZSgxKVxuICApO1xuXG4gIGlmICh0YXJnZXQpIHtcbiAgICB0YXJnZXQuc3R5bGUub3V0bGluZSA9IFwiMFwiO1xuICAgIHRhcmdldC5zZXRBdHRyaWJ1dGUoXCJ0YWJpbmRleFwiLCAwKTtcbiAgICB0YXJnZXQuZm9jdXMoKTtcbiAgICB0YXJnZXQuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgIFwiYmx1clwiLFxuICAgICAgb25jZSgoKSA9PiB7XG4gICAgICAgIHRhcmdldC5zZXRBdHRyaWJ1dGUoXCJ0YWJpbmRleFwiLCAtMSk7XG4gICAgICB9KVxuICAgICk7XG4gIH0gZWxzZSB7XG4gICAgLy8gdGhyb3cgYW4gZXJyb3I/XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiZWhhdmlvcih7XG4gIFtDTElDS106IHtcbiAgICBbTElOS106IHNldFRhYmluZGV4LFxuICB9LFxufSk7XG4iLCJjb25zdCBzZWxlY3QgPSByZXF1aXJlKFwiLi4vLi4vdXN3ZHMtY29yZS9zcmMvanMvdXRpbHMvc2VsZWN0XCIpO1xuY29uc3QgYmVoYXZpb3IgPSByZXF1aXJlKFwiLi4vLi4vdXN3ZHMtY29yZS9zcmMvanMvdXRpbHMvYmVoYXZpb3JcIik7XG5jb25zdCB7IENMSUNLIH0gPSByZXF1aXJlKFwiLi4vLi4vdXN3ZHMtY29yZS9zcmMvanMvZXZlbnRzXCIpO1xuY29uc3QgeyBwcmVmaXg6IFBSRUZJWCB9ID0gcmVxdWlyZShcIi4uLy4uL3Vzd2RzLWNvcmUvc3JjL2pzL2NvbmZpZ1wiKTtcbmNvbnN0IFNhbml0aXplciA9IHJlcXVpcmUoXCIuLi8uLi91c3dkcy1jb3JlL3NyYy9qcy91dGlscy9zYW5pdGl6ZXJcIik7XG5cbmNvbnN0IFRBQkxFID0gYC4ke1BSRUZJWH0tdGFibGVgO1xuY29uc3QgU09SVEVEID0gXCJhcmlhLXNvcnRcIjtcbmNvbnN0IEFTQ0VORElORyA9IFwiYXNjZW5kaW5nXCI7XG5jb25zdCBERVNDRU5ESU5HID0gXCJkZXNjZW5kaW5nXCI7XG5jb25zdCBTT1JUX09WRVJSSURFID0gXCJkYXRhLXNvcnQtdmFsdWVcIjtcbmNvbnN0IFNPUlRfQlVUVE9OX0NMQVNTID0gYCR7UFJFRklYfS10YWJsZV9faGVhZGVyX19idXR0b25gO1xuY29uc3QgU09SVF9CVVRUT04gPSBgLiR7U09SVF9CVVRUT05fQ0xBU1N9YDtcbmNvbnN0IFNPUlRBQkxFX0hFQURFUiA9IGB0aFtkYXRhLXNvcnRhYmxlXWA7XG5jb25zdCBBTk5PVU5DRU1FTlRfUkVHSU9OID0gYC4ke1BSRUZJWH0tdGFibGVfX2Fubm91bmNlbWVudC1yZWdpb25bYXJpYS1saXZlPVwicG9saXRlXCJdYDtcblxuLyoqIEdldHMgdGhlIGRhdGEtc29ydC12YWx1ZSBhdHRyaWJ1dGUgdmFsdWUsIGlmIHByb3ZpZGVkIOKAlCBvdGhlcndpc2UsIGdldHNcbiAqIHRoZSBpbm5lclRleHQgb3IgdGV4dENvbnRlbnQg4oCUIG9mIHRoZSBjaGlsZCBlbGVtZW50IChIVE1MVGFibGVDZWxsRWxlbWVudClcbiAqIGF0IHRoZSBzcGVjaWZpZWQgaW5kZXggb2YgdGhlIGdpdmVuIHRhYmxlIHJvd1xuICpcbiAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleFxuICogQHBhcmFtIHthcnJheTxIVE1MVGFibGVSb3dFbGVtZW50Pn0gdHJcbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKi9cbmNvbnN0IGdldENlbGxWYWx1ZSA9ICh0ciwgaW5kZXgpID0+XG4gIHRyLmNoaWxkcmVuW2luZGV4XS5nZXRBdHRyaWJ1dGUoU09SVF9PVkVSUklERSkgfHxcbiAgdHIuY2hpbGRyZW5baW5kZXhdLmlubmVyVGV4dCB8fFxuICB0ci5jaGlsZHJlbltpbmRleF0udGV4dENvbnRlbnQ7XG5cbi8qKlxuICogQ29tcGFyZXMgdGhlIHZhbHVlcyBvZiB0d28gcm93IGFycmF5IGl0ZW1zIGF0IHRoZSBnaXZlbiBpbmRleCwgdGhlbiBzb3J0cyBieSB0aGUgZ2l2ZW4gZGlyZWN0aW9uXG4gKiBAcGFyYW0ge251bWJlcn0gaW5kZXhcbiAqIEBwYXJhbSB7c3RyaW5nfSBkaXJlY3Rpb25cbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKi9cbmNvbnN0IGNvbXBhcmVGdW5jdGlvbiA9IChpbmRleCwgaXNBc2NlbmRpbmcpID0+ICh0aGlzUm93LCBuZXh0Um93KSA9PiB7XG4gIC8vIGdldCB2YWx1ZXMgdG8gY29tcGFyZSBmcm9tIGRhdGEgYXR0cmlidXRlIG9yIGNlbGwgY29udGVudFxuICBjb25zdCB2YWx1ZTEgPSBnZXRDZWxsVmFsdWUoaXNBc2NlbmRpbmcgPyB0aGlzUm93IDogbmV4dFJvdywgaW5kZXgpO1xuICBjb25zdCB2YWx1ZTIgPSBnZXRDZWxsVmFsdWUoaXNBc2NlbmRpbmcgPyBuZXh0Um93IDogdGhpc1JvdywgaW5kZXgpO1xuXG4gIC8vIGlmIG5laXRoZXIgdmFsdWUgaXMgZW1wdHksIGFuZCBpZiBib3RoIHZhbHVlcyBhcmUgYWxyZWFkeSBudW1iZXJzLCBjb21wYXJlIG51bWVyaWNhbGx5XG4gIGlmIChcbiAgICB2YWx1ZTEgJiZcbiAgICB2YWx1ZTIgJiZcbiAgICAhTnVtYmVyLmlzTmFOKE51bWJlcih2YWx1ZTEpKSAmJlxuICAgICFOdW1iZXIuaXNOYU4oTnVtYmVyKHZhbHVlMikpXG4gICkge1xuICAgIHJldHVybiB2YWx1ZTEgLSB2YWx1ZTI7XG4gIH1cbiAgLy8gT3RoZXJ3aXNlLCBjb21wYXJlIGFscGhhYmV0aWNhbGx5IGJhc2VkIG9uIGN1cnJlbnQgdXNlciBsb2NhbGVcbiAgcmV0dXJuIHZhbHVlMS50b1N0cmluZygpLmxvY2FsZUNvbXBhcmUodmFsdWUyLCBuYXZpZ2F0b3IubGFuZ3VhZ2UsIHtcbiAgICBudW1lcmljOiB0cnVlLFxuICAgIGlnbm9yZVB1bmN0dWF0aW9uOiB0cnVlLFxuICB9KTtcbn07XG5cbi8qKlxuICogR2V0IGFuIEFycmF5IG9mIGNvbHVtbiBoZWFkZXJzIGVsZW1lbnRzIGJlbG9uZ2luZyBkaXJlY3RseSB0byB0aGUgZ2l2ZW5cbiAqIHRhYmxlIGVsZW1lbnQuXG4gKiBAcGFyYW0ge0hUTUxUYWJsZUVsZW1lbnR9IHRhYmxlXG4gKiBAcmV0dXJuIHthcnJheTxIVE1MVGFibGVIZWFkZXJDZWxsRWxlbWVudD59XG4gKi9cbmNvbnN0IGdldENvbHVtbkhlYWRlcnMgPSAodGFibGUpID0+IHtcbiAgY29uc3QgaGVhZGVycyA9IHNlbGVjdChTT1JUQUJMRV9IRUFERVIsIHRhYmxlKTtcbiAgcmV0dXJuIGhlYWRlcnMuZmlsdGVyKChoZWFkZXIpID0+IGhlYWRlci5jbG9zZXN0KFRBQkxFKSA9PT0gdGFibGUpO1xufTtcblxuLyoqXG4gKiBVcGRhdGUgdGhlIGJ1dHRvbiBsYWJlbCB3aXRoaW4gdGhlIGdpdmVuIGhlYWRlciBlbGVtZW50LCByZXNldHRpbmcgaXRcbiAqIHRvIHRoZSBkZWZhdWx0IHN0YXRlIChyZWFkeSB0byBzb3J0IGFzY2VuZGluZykgaWYgaXQncyBubyBsb25nZXIgc29ydGVkXG4gKiBAcGFyYW0ge0hUTUxUYWJsZUhlYWRlckNlbGxFbGVtZW50fSBoZWFkZXJcbiAqL1xuY29uc3QgdXBkYXRlU29ydExhYmVsID0gKGhlYWRlcikgPT4ge1xuICBjb25zdCBoZWFkZXJOYW1lID0gaGVhZGVyLmlubmVyVGV4dDtcbiAgY29uc3Qgc29ydGVkQXNjZW5kaW5nID0gaGVhZGVyLmdldEF0dHJpYnV0ZShTT1JURUQpID09PSBBU0NFTkRJTkc7XG4gIGNvbnN0IGlzU29ydGVkID1cbiAgICBoZWFkZXIuZ2V0QXR0cmlidXRlKFNPUlRFRCkgPT09IEFTQ0VORElORyB8fFxuICAgIGhlYWRlci5nZXRBdHRyaWJ1dGUoU09SVEVEKSA9PT0gREVTQ0VORElORyB8fFxuICAgIGZhbHNlO1xuICBjb25zdCBoZWFkZXJMYWJlbCA9IGAke2hlYWRlck5hbWV9Jywgc29ydGFibGUgY29sdW1uLCBjdXJyZW50bHkgJHtcbiAgICBpc1NvcnRlZFxuICAgICAgPyBgJHtzb3J0ZWRBc2NlbmRpbmcgPyBgc29ydGVkICR7QVNDRU5ESU5HfWAgOiBgc29ydGVkICR7REVTQ0VORElOR31gfWBcbiAgICAgIDogXCJ1bnNvcnRlZFwiXG4gIH1gO1xuICBjb25zdCBoZWFkZXJCdXR0b25MYWJlbCA9IGBDbGljayB0byBzb3J0IGJ5ICR7aGVhZGVyTmFtZX0gaW4gJHtcbiAgICBzb3J0ZWRBc2NlbmRpbmcgPyBERVNDRU5ESU5HIDogQVNDRU5ESU5HXG4gIH0gb3JkZXIuYDtcbiAgaGVhZGVyLnNldEF0dHJpYnV0ZShcImFyaWEtbGFiZWxcIiwgaGVhZGVyTGFiZWwpO1xuICBoZWFkZXIucXVlcnlTZWxlY3RvcihTT1JUX0JVVFRPTikuc2V0QXR0cmlidXRlKFwidGl0bGVcIiwgaGVhZGVyQnV0dG9uTGFiZWwpO1xufTtcblxuLyoqXG4gKiBSZW1vdmUgdGhlIGFyaWEtc29ydCBhdHRyaWJ1dGUgb24gdGhlIGdpdmVuIGhlYWRlciBlbGVtZW50LCBhbmQgcmVzZXQgdGhlIGxhYmVsIGFuZCBidXR0b24gaWNvblxuICogQHBhcmFtIHtIVE1MVGFibGVIZWFkZXJDZWxsRWxlbWVudH0gaGVhZGVyXG4gKi9cbmNvbnN0IHVuc2V0U29ydCA9IChoZWFkZXIpID0+IHtcbiAgaGVhZGVyLnJlbW92ZUF0dHJpYnV0ZShTT1JURUQpO1xuICB1cGRhdGVTb3J0TGFiZWwoaGVhZGVyKTtcbn07XG5cbi8qKlxuICogU29ydCByb3dzIGVpdGhlciBhc2NlbmRpbmcgb3IgZGVzY2VuZGluZywgYmFzZWQgb24gYSBnaXZlbiBoZWFkZXIncyBhcmlhLXNvcnQgYXR0cmlidXRlXG4gKiBAcGFyYW0ge0hUTUxUYWJsZUhlYWRlckNlbGxFbGVtZW50fSBoZWFkZXJcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gaXNBc2NlbmRpbmdcbiAqIEByZXR1cm4ge2Jvb2xlYW59IHRydWVcbiAqL1xuY29uc3Qgc29ydFJvd3MgPSAoaGVhZGVyLCBpc0FzY2VuZGluZykgPT4ge1xuICBoZWFkZXIuc2V0QXR0cmlidXRlKFNPUlRFRCwgaXNBc2NlbmRpbmcgPT09IHRydWUgPyBERVNDRU5ESU5HIDogQVNDRU5ESU5HKTtcbiAgdXBkYXRlU29ydExhYmVsKGhlYWRlcik7XG5cbiAgY29uc3QgdGJvZHkgPSBoZWFkZXIuY2xvc2VzdChUQUJMRSkucXVlcnlTZWxlY3RvcihcInRib2R5XCIpO1xuXG4gIC8vIFdlIGNhbiB1c2UgQXJyYXkuZnJvbSgpIGFuZCBBcnJheS5zb3J0KCkgaW5zdGVhZCBvbmNlIHdlIGRyb3AgSUUxMSBzdXBwb3J0LCBsaWtlbHkgaW4gdGhlIHN1bW1lciBvZiAyMDIxXG4gIC8vXG4gIC8vIEFycmF5LmZyb20odGJvZHkucXVlcnlTZWxlY3RvckFsbCgndHInKS5zb3J0KFxuICAvLyAgIGNvbXBhcmVGdW5jdGlvbihcbiAgLy8gICAgIEFycmF5LmZyb20oaGVhZGVyLnBhcmVudE5vZGUuY2hpbGRyZW4pLmluZGV4T2YoaGVhZGVyKSxcbiAgLy8gICAgICFpc0FzY2VuZGluZylcbiAgLy8gICApXG4gIC8vIC5mb3JFYWNoKHRyID0+IHRib2R5LmFwcGVuZENoaWxkKHRyKSApO1xuXG4gIC8vIFtdLnNsaWNlLmNhbGwoKSB0dXJucyBhcnJheS1saWtlIHNldHMgaW50byB0cnVlIGFycmF5cyBzbyB0aGF0IHdlIGNhbiBzb3J0IHRoZW1cbiAgY29uc3QgYWxsUm93cyA9IFtdLnNsaWNlLmNhbGwodGJvZHkucXVlcnlTZWxlY3RvckFsbChcInRyXCIpKTtcbiAgY29uc3QgYWxsSGVhZGVycyA9IFtdLnNsaWNlLmNhbGwoaGVhZGVyLnBhcmVudE5vZGUuY2hpbGRyZW4pO1xuICBjb25zdCB0aGlzSGVhZGVySW5kZXggPSBhbGxIZWFkZXJzLmluZGV4T2YoaGVhZGVyKTtcbiAgYWxsUm93cy5zb3J0KGNvbXBhcmVGdW5jdGlvbih0aGlzSGVhZGVySW5kZXgsICFpc0FzY2VuZGluZykpLmZvckVhY2goKHRyKSA9PiB7XG4gICAgW10uc2xpY2VcbiAgICAgIC5jYWxsKHRyLmNoaWxkcmVuKVxuICAgICAgLmZvckVhY2goKHRkKSA9PiB0ZC5yZW1vdmVBdHRyaWJ1dGUoXCJkYXRhLXNvcnQtYWN0aXZlXCIpKTtcbiAgICB0ci5jaGlsZHJlblt0aGlzSGVhZGVySW5kZXhdLnNldEF0dHJpYnV0ZShcImRhdGEtc29ydC1hY3RpdmVcIiwgdHJ1ZSk7XG4gICAgdGJvZHkuYXBwZW5kQ2hpbGQodHIpO1xuICB9KTtcblxuICByZXR1cm4gdHJ1ZTtcbn07XG5cbi8qKlxuICogVXBkYXRlIHRoZSBsaXZlIHJlZ2lvbiBpbW1lZGlhdGVseSBmb2xsb3dpbmcgdGhlIHRhYmxlIHdoZW5ldmVyIHNvcnQgY2hhbmdlcy5cbiAqIEBwYXJhbSB7SFRNTFRhYmxlRWxlbWVudH0gdGFibGVcbiAqIEBwYXJhbSB7SFRNTFRhYmxlSGVhZGVyQ2VsbEVsZW1lbnR9IHNvcnRlZEhlYWRlclxuICovXG5cbmNvbnN0IHVwZGF0ZUxpdmVSZWdpb24gPSAodGFibGUsIHNvcnRlZEhlYWRlcikgPT4ge1xuICBjb25zdCBjYXB0aW9uID0gdGFibGUucXVlcnlTZWxlY3RvcihcImNhcHRpb25cIikuaW5uZXJUZXh0O1xuICBjb25zdCBzb3J0ZWRBc2NlbmRpbmcgPSBzb3J0ZWRIZWFkZXIuZ2V0QXR0cmlidXRlKFNPUlRFRCkgPT09IEFTQ0VORElORztcbiAgY29uc3QgaGVhZGVyTGFiZWwgPSBzb3J0ZWRIZWFkZXIuaW5uZXJUZXh0O1xuICBjb25zdCBsaXZlUmVnaW9uID0gdGFibGUubmV4dEVsZW1lbnRTaWJsaW5nO1xuICBpZiAobGl2ZVJlZ2lvbiAmJiBsaXZlUmVnaW9uLm1hdGNoZXMoQU5OT1VOQ0VNRU5UX1JFR0lPTikpIHtcbiAgICBjb25zdCBzb3J0QW5ub3VuY2VtZW50ID0gYFRoZSB0YWJsZSBuYW1lZCBcIiR7Y2FwdGlvbn1cIiBpcyBub3cgc29ydGVkIGJ5ICR7aGVhZGVyTGFiZWx9IGluICR7XG4gICAgICBzb3J0ZWRBc2NlbmRpbmcgPyBBU0NFTkRJTkcgOiBERVNDRU5ESU5HXG4gICAgfSBvcmRlci5gO1xuICAgIGxpdmVSZWdpb24uaW5uZXJUZXh0ID0gc29ydEFubm91bmNlbWVudDtcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICBgVGFibGUgY29udGFpbmluZyBhIHNvcnRhYmxlIGNvbHVtbiBoZWFkZXIgaXMgbm90IGZvbGxvd2VkIGJ5IGFuIGFyaWEtbGl2ZSByZWdpb24uYFxuICAgICk7XG4gIH1cbn07XG5cbi8qKlxuICogVG9nZ2xlIGEgaGVhZGVyJ3Mgc29ydCBzdGF0ZSwgb3B0aW9uYWxseSBwcm92aWRpbmcgYSB0YXJnZXRcbiAqIHN0YXRlLlxuICpcbiAqIEBwYXJhbSB7SFRNTFRhYmxlSGVhZGVyQ2VsbEVsZW1lbnR9IGhlYWRlclxuICogQHBhcmFtIHtib29sZWFuP30gaXNBc2NlbmRpbmcgSWYgbm8gc3RhdGUgaXMgcHJvdmlkZWQsIHRoZSBjdXJyZW50XG4gKiBzdGF0ZSB3aWxsIGJlIHRvZ2dsZWQgKGZyb20gZmFsc2UgdG8gdHJ1ZSwgYW5kIHZpY2UtdmVyc2EpLlxuICovXG5jb25zdCB0b2dnbGVTb3J0ID0gKGhlYWRlciwgaXNBc2NlbmRpbmcpID0+IHtcbiAgY29uc3QgdGFibGUgPSBoZWFkZXIuY2xvc2VzdChUQUJMRSk7XG4gIGxldCBzYWZlQXNjZW5kaW5nID0gaXNBc2NlbmRpbmc7XG4gIGlmICh0eXBlb2Ygc2FmZUFzY2VuZGluZyAhPT0gXCJib29sZWFuXCIpIHtcbiAgICBzYWZlQXNjZW5kaW5nID0gaGVhZGVyLmdldEF0dHJpYnV0ZShTT1JURUQpID09PSBBU0NFTkRJTkc7XG4gIH1cblxuICBpZiAoIXRhYmxlKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGAke1NPUlRBQkxFX0hFQURFUn0gaXMgbWlzc2luZyBvdXRlciAke1RBQkxFfWApO1xuICB9XG5cbiAgc2FmZUFzY2VuZGluZyA9IHNvcnRSb3dzKGhlYWRlciwgaXNBc2NlbmRpbmcpO1xuXG4gIGlmIChzYWZlQXNjZW5kaW5nKSB7XG4gICAgZ2V0Q29sdW1uSGVhZGVycyh0YWJsZSkuZm9yRWFjaCgob3RoZXJIZWFkZXIpID0+IHtcbiAgICAgIGlmIChvdGhlckhlYWRlciAhPT0gaGVhZGVyKSB7XG4gICAgICAgIHVuc2V0U29ydChvdGhlckhlYWRlcik7XG4gICAgICB9XG4gICAgfSk7XG4gICAgdXBkYXRlTGl2ZVJlZ2lvbih0YWJsZSwgaGVhZGVyKTtcbiAgfVxufTtcblxuLyoqXG4gKiogSW5zZXJ0cyBhIGJ1dHRvbiB3aXRoIGljb24gaW5zaWRlIGEgc29ydGFibGUgaGVhZGVyXG4gKiBAcGFyYW0ge0hUTUxUYWJsZUhlYWRlckNlbGxFbGVtZW50fSBoZWFkZXJcbiAqL1xuXG5jb25zdCBjcmVhdGVIZWFkZXJCdXR0b24gPSAoaGVhZGVyKSA9PiB7XG4gIGNvbnN0IGJ1dHRvbkVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImJ1dHRvblwiKTtcbiAgYnV0dG9uRWwuc2V0QXR0cmlidXRlKFwidGFiaW5kZXhcIiwgXCIwXCIpO1xuICBidXR0b25FbC5jbGFzc0xpc3QuYWRkKFNPUlRfQlVUVE9OX0NMQVNTKTtcbiAgLy8gSUNPTl9TT1VSQ0VcbiAgYnV0dG9uRWwuaW5uZXJIVE1MID0gU2FuaXRpemVyLmVzY2FwZUhUTUxgXG4gIDxzdmcgY2xhc3M9XCIke1BSRUZJWH0taWNvblwiIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCI+XG4gICAgPGcgY2xhc3M9XCJkZXNjZW5kaW5nXCIgZmlsbD1cInRyYW5zcGFyZW50XCI+XG4gICAgICA8cGF0aCBkPVwiTTE3IDE3TDE1LjU5IDE1LjU5TDEyLjk5OTkgMTguMTdWMkgxMC45OTk5VjE4LjE3TDguNDEgMTUuNThMNyAxN0wxMS45OTk5IDIyTDE3IDE3WlwiIC8+XG4gICAgPC9nPlxuICAgIDxnIGNsYXNzPVwiYXNjZW5kaW5nXCIgZmlsbD1cInRyYW5zcGFyZW50XCI+XG4gICAgICA8cGF0aCB0cmFuc2Zvcm09XCJyb3RhdGUoMTgwLCAxMiwgMTIpXCIgZD1cIk0xNyAxN0wxNS41OSAxNS41OUwxMi45OTk5IDE4LjE3VjJIMTAuOTk5OVYxOC4xN0w4LjQxIDE1LjU4TDcgMTdMMTEuOTk5OSAyMkwxNyAxN1pcIiAvPlxuICAgIDwvZz5cbiAgICA8ZyBjbGFzcz1cInVuc29ydGVkXCIgZmlsbD1cInRyYW5zcGFyZW50XCI+XG4gICAgICA8cG9seWdvbiBwb2ludHM9XCIxNS4xNyAxNSAxMyAxNy4xNyAxMyA2LjgzIDE1LjE3IDkgMTYuNTggNy41OSAxMiAzIDcuNDEgNy41OSA4LjgzIDkgMTEgNi44MyAxMSAxNy4xNyA4LjgzIDE1IDcuNDIgMTYuNDEgMTIgMjEgMTYuNTkgMTYuNDEgMTUuMTcgMTVcIi8+XG4gICAgPC9nPlxuICA8L3N2Zz5cbiAgYDtcbiAgaGVhZGVyLmFwcGVuZENoaWxkKGJ1dHRvbkVsKTtcbiAgdXBkYXRlU29ydExhYmVsKGhlYWRlcik7XG59O1xuXG5jb25zdCB0YWJsZSA9IGJlaGF2aW9yKFxuICB7XG4gICAgW0NMSUNLXToge1xuICAgICAgW1NPUlRfQlVUVE9OXShldmVudCkge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB0b2dnbGVTb3J0KFxuICAgICAgICAgIGV2ZW50LnRhcmdldC5jbG9zZXN0KFNPUlRBQkxFX0hFQURFUiksXG4gICAgICAgICAgZXZlbnQudGFyZ2V0LmNsb3Nlc3QoU09SVEFCTEVfSEVBREVSKS5nZXRBdHRyaWJ1dGUoU09SVEVEKSA9PT1cbiAgICAgICAgICAgIEFTQ0VORElOR1xuICAgICAgICApO1xuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICB7XG4gICAgaW5pdChyb290KSB7XG4gICAgICBjb25zdCBzb3J0YWJsZUhlYWRlcnMgPSBzZWxlY3QoU09SVEFCTEVfSEVBREVSLCByb290KTtcbiAgICAgIHNvcnRhYmxlSGVhZGVycy5mb3JFYWNoKChoZWFkZXIpID0+IGNyZWF0ZUhlYWRlckJ1dHRvbihoZWFkZXIpKTtcblxuICAgICAgY29uc3QgZmlyc3RTb3J0ZWQgPSBzb3J0YWJsZUhlYWRlcnMuZmlsdGVyKFxuICAgICAgICAoaGVhZGVyKSA9PlxuICAgICAgICAgIGhlYWRlci5nZXRBdHRyaWJ1dGUoU09SVEVEKSA9PT0gQVNDRU5ESU5HIHx8XG4gICAgICAgICAgaGVhZGVyLmdldEF0dHJpYnV0ZShTT1JURUQpID09PSBERVNDRU5ESU5HXG4gICAgICApWzBdO1xuICAgICAgaWYgKHR5cGVvZiBmaXJzdFNvcnRlZCA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAvLyBubyBzb3J0YWJsZSBoZWFkZXJzIGZvdW5kXG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHNvcnREaXIgPSBmaXJzdFNvcnRlZC5nZXRBdHRyaWJ1dGUoU09SVEVEKTtcbiAgICAgIGlmIChzb3J0RGlyID09PSBBU0NFTkRJTkcpIHtcbiAgICAgICAgdG9nZ2xlU29ydChmaXJzdFNvcnRlZCwgdHJ1ZSk7XG4gICAgICB9IGVsc2UgaWYgKHNvcnREaXIgPT09IERFU0NFTkRJTkcpIHtcbiAgICAgICAgdG9nZ2xlU29ydChmaXJzdFNvcnRlZCwgZmFsc2UpO1xuICAgICAgfVxuICAgIH0sXG4gICAgVEFCTEUsXG4gICAgU09SVEFCTEVfSEVBREVSLFxuICAgIFNPUlRfQlVUVE9OLFxuICB9XG4pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHRhYmxlO1xuIiwiY29uc3QgYmVoYXZpb3IgPSByZXF1aXJlKFwiLi4vLi4vdXN3ZHMtY29yZS9zcmMvanMvdXRpbHMvYmVoYXZpb3JcIik7XG5jb25zdCBzZWxlY3RPck1hdGNoZXMgPSByZXF1aXJlKFwiLi4vLi4vdXN3ZHMtY29yZS9zcmMvanMvdXRpbHMvc2VsZWN0LW9yLW1hdGNoZXNcIik7XG5jb25zdCB7IHByZWZpeDogUFJFRklYIH0gPSByZXF1aXJlKFwiLi4vLi4vdXN3ZHMtY29yZS9zcmMvanMvY29uZmlnXCIpO1xuY29uc3Qge1xuICBDT01CT19CT1hfQ0xBU1MsXG4gIGVuaGFuY2VDb21ib0JveCxcbn0gPSByZXF1aXJlKFwiLi4vLi4vdXNhLWNvbWJvLWJveC9zcmMvaW5kZXhcIik7XG5cbmNvbnN0IFRJTUVfUElDS0VSX0NMQVNTID0gYCR7UFJFRklYfS10aW1lLXBpY2tlcmA7XG5jb25zdCBUSU1FX1BJQ0tFUiA9IGAuJHtUSU1FX1BJQ0tFUl9DTEFTU31gO1xuY29uc3QgTUFYX1RJTUUgPSA2MCAqIDI0IC0gMTtcbmNvbnN0IE1JTl9USU1FID0gMDtcbmNvbnN0IERFRkFVTFRfU1RFUCA9IDMwO1xuY29uc3QgTUlOX1NURVAgPSAxO1xuXG5jb25zdCBGSUxURVJfREFUQVNFVCA9IHtcbiAgZmlsdGVyOlxuICAgIFwiMD97eyBob3VyUXVlcnlGaWx0ZXIgfX06e3ttaW51dGVRdWVyeUZpbHRlcn19Lip7eyBhcFF1ZXJ5RmlsdGVyIH19bT9cIixcbiAgYXBRdWVyeUZpbHRlcjogXCIoW2FwXSlcIixcbiAgaG91clF1ZXJ5RmlsdGVyOiBcIihbMS05XVswLTJdPylcIixcbiAgbWludXRlUXVlcnlGaWx0ZXI6IFwiW1xcXFxkXSs6KFswLTldezAsMn0pXCIsXG59O1xuXG4vKipcbiAqIFBhcnNlIGEgc3RyaW5nIG9mIGhoOm1tIGludG8gbWludXRlc1xuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSB0aW1lU3RyIHRoZSB0aW1lIHN0cmluZyB0byBwYXJzZVxuICogQHJldHVybnMge251bWJlcn0gdGhlIG51bWJlciBvZiBtaW51dGVzXG4gKi9cbmNvbnN0IHBhcnNlVGltZVN0cmluZyA9ICh0aW1lU3RyKSA9PiB7XG4gIGxldCBtaW51dGVzO1xuXG4gIGlmICh0aW1lU3RyKSB7XG4gICAgY29uc3QgW2hvdXJzLCBtaW5zXSA9IHRpbWVTdHIuc3BsaXQoXCI6XCIpLm1hcCgoc3RyKSA9PiB7XG4gICAgICBsZXQgdmFsdWU7XG4gICAgICBjb25zdCBwYXJzZWQgPSBwYXJzZUludChzdHIsIDEwKTtcbiAgICAgIGlmICghTnVtYmVyLmlzTmFOKHBhcnNlZCkpIHZhbHVlID0gcGFyc2VkO1xuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH0pO1xuXG4gICAgaWYgKGhvdXJzICE9IG51bGwgJiYgbWlucyAhPSBudWxsKSB7XG4gICAgICBtaW51dGVzID0gaG91cnMgKiA2MCArIG1pbnM7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG1pbnV0ZXM7XG59O1xuXG4vKipcbiAqIEVuaGFuY2UgYW4gaW5wdXQgd2l0aCB0aGUgZGF0ZSBwaWNrZXIgZWxlbWVudHNcbiAqXG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbCBUaGUgaW5pdGlhbCB3cmFwcGluZyBlbGVtZW50IG9mIHRoZSBkYXRlIHBpY2tlciBjb21wb25lbnRcbiAqL1xuY29uc3QgdHJhbnNmb3JtVGltZVBpY2tlciA9IChlbCkgPT4ge1xuICBjb25zdCB0aW1lUGlja2VyRWwgPSBlbC5jbG9zZXN0KFRJTUVfUElDS0VSKTtcblxuICBjb25zdCBpbml0aWFsSW5wdXRFbCA9IHRpbWVQaWNrZXJFbC5xdWVyeVNlbGVjdG9yKGBpbnB1dGApO1xuXG4gIGlmICghaW5pdGlhbElucHV0RWwpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYCR7VElNRV9QSUNLRVJ9IGlzIG1pc3NpbmcgaW5uZXIgaW5wdXRgKTtcbiAgfVxuXG4gIGNvbnN0IHNlbGVjdEVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNlbGVjdFwiKTtcblxuICBbXCJpZFwiLCBcIm5hbWVcIiwgXCJyZXF1aXJlZFwiLCBcImFyaWEtbGFiZWxcIiwgXCJhcmlhLWxhYmVsbGVkYnlcIl0uZm9yRWFjaChcbiAgICAobmFtZSkgPT4ge1xuICAgICAgaWYgKGluaXRpYWxJbnB1dEVsLmhhc0F0dHJpYnV0ZShuYW1lKSkge1xuICAgICAgICBjb25zdCB2YWx1ZSA9IGluaXRpYWxJbnB1dEVsLmdldEF0dHJpYnV0ZShuYW1lKTtcbiAgICAgICAgc2VsZWN0RWwuc2V0QXR0cmlidXRlKG5hbWUsIHZhbHVlKTtcbiAgICAgICAgaW5pdGlhbElucHV0RWwucmVtb3ZlQXR0cmlidXRlKG5hbWUpO1xuICAgICAgfVxuICAgIH1cbiAgKTtcblxuICBjb25zdCBwYWRaZXJvcyA9ICh2YWx1ZSwgbGVuZ3RoKSA9PiBgMDAwMCR7dmFsdWV9YC5zbGljZSgtbGVuZ3RoKTtcblxuICBjb25zdCBnZXRUaW1lQ29udGV4dCA9IChtaW51dGVzKSA9PiB7XG4gICAgY29uc3QgbWludXRlID0gbWludXRlcyAlIDYwO1xuICAgIGNvbnN0IGhvdXIyNCA9IE1hdGguZmxvb3IobWludXRlcyAvIDYwKTtcbiAgICBjb25zdCBob3VyMTIgPSBob3VyMjQgJSAxMiB8fCAxMjtcbiAgICBjb25zdCBhbXBtID0gaG91cjI0IDwgMTIgPyBcImFtXCIgOiBcInBtXCI7XG5cbiAgICByZXR1cm4ge1xuICAgICAgbWludXRlLFxuICAgICAgaG91cjI0LFxuICAgICAgaG91cjEyLFxuICAgICAgYW1wbSxcbiAgICB9O1xuICB9O1xuXG4gIGNvbnN0IG1pblRpbWUgPSBNYXRoLm1heChcbiAgICBNSU5fVElNRSxcbiAgICBwYXJzZVRpbWVTdHJpbmcodGltZVBpY2tlckVsLmRhdGFzZXQubWluVGltZSkgfHwgTUlOX1RJTUVcbiAgKTtcbiAgY29uc3QgbWF4VGltZSA9IE1hdGgubWluKFxuICAgIE1BWF9USU1FLFxuICAgIHBhcnNlVGltZVN0cmluZyh0aW1lUGlja2VyRWwuZGF0YXNldC5tYXhUaW1lKSB8fCBNQVhfVElNRVxuICApO1xuICBjb25zdCBzdGVwID0gTWF0aC5mbG9vcihcbiAgICBNYXRoLm1heChNSU5fU1RFUCwgdGltZVBpY2tlckVsLmRhdGFzZXQuc3RlcCB8fCBERUZBVUxUX1NURVApXG4gICk7XG5cbiAgbGV0IGRlZmF1bHRWYWx1ZTtcbiAgZm9yIChsZXQgdGltZSA9IG1pblRpbWU7IHRpbWUgPD0gbWF4VGltZTsgdGltZSArPSBzdGVwKSB7XG4gICAgY29uc3QgeyBtaW51dGUsIGhvdXIyNCwgaG91cjEyLCBhbXBtIH0gPSBnZXRUaW1lQ29udGV4dCh0aW1lKTtcblxuICAgIGNvbnN0IG9wdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJvcHRpb25cIik7XG4gICAgb3B0aW9uLnZhbHVlID0gYCR7cGFkWmVyb3MoaG91cjI0LCAyKX06JHtwYWRaZXJvcyhtaW51dGUsIDIpfWA7XG4gICAgb3B0aW9uLnRleHQgPSBgJHtob3VyMTJ9OiR7cGFkWmVyb3MobWludXRlLCAyKX0ke2FtcG19YDtcbiAgICBpZiAob3B0aW9uLnRleHQgPT09IGluaXRpYWxJbnB1dEVsLnZhbHVlKSB7XG4gICAgICBkZWZhdWx0VmFsdWUgPSBvcHRpb24udmFsdWU7XG4gICAgfVxuICAgIHNlbGVjdEVsLmFwcGVuZENoaWxkKG9wdGlvbik7XG4gIH1cblxuICB0aW1lUGlja2VyRWwuY2xhc3NMaXN0LmFkZChDT01CT19CT1hfQ0xBU1MpO1xuXG4gIC8vIGNvbWJvIGJveCBwcm9wZXJ0aWVzXG4gIE9iamVjdC5rZXlzKEZJTFRFUl9EQVRBU0VUKS5mb3JFYWNoKChrZXkpID0+IHtcbiAgICB0aW1lUGlja2VyRWwuZGF0YXNldFtrZXldID0gRklMVEVSX0RBVEFTRVRba2V5XTtcbiAgfSk7XG4gIHRpbWVQaWNrZXJFbC5kYXRhc2V0LmRpc2FibGVGaWx0ZXJpbmcgPSBcInRydWVcIjtcbiAgdGltZVBpY2tlckVsLmRhdGFzZXQuZGVmYXVsdFZhbHVlID0gZGVmYXVsdFZhbHVlO1xuXG4gIHRpbWVQaWNrZXJFbC5hcHBlbmRDaGlsZChzZWxlY3RFbCk7XG4gIGluaXRpYWxJbnB1dEVsLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbn07XG5cbmNvbnN0IHRpbWVQaWNrZXIgPSBiZWhhdmlvcihcbiAge30sXG4gIHtcbiAgICBpbml0KHJvb3QpIHtcbiAgICAgIHNlbGVjdE9yTWF0Y2hlcyhUSU1FX1BJQ0tFUiwgcm9vdCkuZm9yRWFjaCgodGltZVBpY2tlckVsKSA9PiB7XG4gICAgICAgIHRyYW5zZm9ybVRpbWVQaWNrZXIodGltZVBpY2tlckVsKTtcbiAgICAgICAgZW5oYW5jZUNvbWJvQm94KHRpbWVQaWNrZXJFbCk7XG4gICAgICB9KTtcbiAgICB9LFxuICAgIEZJTFRFUl9EQVRBU0VULFxuICB9XG4pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHRpbWVQaWNrZXI7XG4iLCIvLyBUb29sdGlwc1xuY29uc3Qgc2VsZWN0T3JNYXRjaGVzID0gcmVxdWlyZShcIi4uLy4uL3Vzd2RzLWNvcmUvc3JjL2pzL3V0aWxzL3NlbGVjdC1vci1tYXRjaGVzXCIpO1xuY29uc3QgYmVoYXZpb3IgPSByZXF1aXJlKFwiLi4vLi4vdXN3ZHMtY29yZS9zcmMvanMvdXRpbHMvYmVoYXZpb3JcIik7XG5jb25zdCB7IHByZWZpeDogUFJFRklYIH0gPSByZXF1aXJlKFwiLi4vLi4vdXN3ZHMtY29yZS9zcmMvanMvY29uZmlnXCIpO1xuY29uc3QgaXNFbGVtZW50SW5WaWV3cG9ydCA9IHJlcXVpcmUoXCIuLi8uLi91c3dkcy1jb3JlL3NyYy9qcy91dGlscy9pcy1pbi12aWV3cG9ydFwiKTtcblxuY29uc3QgVE9PTFRJUCA9IGAuJHtQUkVGSVh9LXRvb2x0aXBgO1xuY29uc3QgVE9PTFRJUF9UUklHR0VSID0gYC4ke1BSRUZJWH0tdG9vbHRpcF9fdHJpZ2dlcmA7XG5jb25zdCBUT09MVElQX1RSSUdHRVJfQ0xBU1MgPSBgJHtQUkVGSVh9LXRvb2x0aXBfX3RyaWdnZXJgO1xuY29uc3QgVE9PTFRJUF9DTEFTUyA9IGAke1BSRUZJWH0tdG9vbHRpcGA7XG5jb25zdCBUT09MVElQX0JPRFlfQ0xBU1MgPSBgJHtQUkVGSVh9LXRvb2x0aXBfX2JvZHlgO1xuY29uc3QgU0VUX0NMQVNTID0gXCJpcy1zZXRcIjtcbmNvbnN0IFZJU0lCTEVfQ0xBU1MgPSBcImlzLXZpc2libGVcIjtcbmNvbnN0IFRSSUFOR0xFX1NJWkUgPSA1O1xuY29uc3QgQURKVVNUX1dJRFRIX0NMQVNTID0gYCR7UFJFRklYfS10b29sdGlwX19ib2R5LS13cmFwYDtcblxuLyoqXG4gKlxuICogQHBhcmFtIHtET01FbGVtZW50fSB0cmlnZ2VyIC0gVGhlIHRvb2x0aXAgdHJpZ2dlclxuICogQHJldHVybnMge29iamVjdH0gRWxlbWVudHMgZm9yIGluaXRpYWxpemVkIHRvb2x0aXA7IGluY2x1ZGVzIHRyaWdnZXIsIHdyYXBwZXIsIGFuZCBib2R5XG4gKi9cbmNvbnN0IGdldFRvb2x0aXBFbGVtZW50cyA9ICh0cmlnZ2VyKSA9PiB7XG4gIGNvbnN0IHdyYXBwZXIgPSB0cmlnZ2VyLnBhcmVudE5vZGU7XG4gIGNvbnN0IGJvZHkgPSB3cmFwcGVyLnF1ZXJ5U2VsZWN0b3IoYC4ke1RPT0xUSVBfQk9EWV9DTEFTU31gKTtcblxuICByZXR1cm4geyB0cmlnZ2VyLCB3cmFwcGVyLCBib2R5IH07XG59O1xuXG4vKipcbiAqIFNob3dzIHRoZSB0b29sdGlwXG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSB0b29sdGlwVHJpZ2dlciAtIHRoZSBlbGVtZW50IHRoYXQgaW5pdGlhbGl6ZXMgdGhlIHRvb2x0aXBcbiAqL1xuY29uc3Qgc2hvd1Rvb2xUaXAgPSAodG9vbHRpcEJvZHksIHRvb2x0aXBUcmlnZ2VyLCBwb3NpdGlvbikgPT4ge1xuICB0b29sdGlwQm9keS5zZXRBdHRyaWJ1dGUoXCJhcmlhLWhpZGRlblwiLCBcImZhbHNlXCIpO1xuXG4gIC8vIFRoaXMgc2V0cyB1cCB0aGUgdG9vbHRpcCBib2R5LiBUaGUgb3BhY2l0eSBpcyAwLCBidXRcbiAgLy8gd2UgY2FuIGJlZ2luIHJ1bm5pbmcgdGhlIGNhbGN1bGF0aW9ucyBiZWxvdy5cbiAgdG9vbHRpcEJvZHkuY2xhc3NMaXN0LmFkZChTRVRfQ0xBU1MpO1xuXG4gIC8qKlxuICAgKiBQb3NpdGlvbiB0aGUgdG9vbHRpcCBib2R5IHdoZW4gdGhlIHRyaWdnZXIgaXMgaG92ZXJlZFxuICAgKiBSZW1vdmVzIG9sZCBwb3NpdGlvbmluZyBjbGFzc25hbWVzIGFuZCByZWFwcGxpZXMuIFRoaXMgYWxsb3dzXG4gICAqIHBvc2l0aW9uaW5nIHRvIGNoYW5nZSBpbiBjYXNlIHRoZSB1c2VyIHJlc2l6ZXMgYnJvd3NlciBvciBET00gbWFuaXB1bGF0aW9uXG4gICAqIGNhdXNlcyB0b29sdGlwIHRvIGdldCBjbGlwcGVkIGZyb20gdmlld3BvcnRcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IHNldFBvcyAtIGNhbiBiZSBcInRvcFwiLCBcImJvdHRvbVwiLCBcInJpZ2h0XCIsIFwibGVmdFwiXG4gICAqL1xuICBjb25zdCBzZXRQb3NpdGlvbkNsYXNzID0gKHNldFBvcykgPT4ge1xuICAgIHRvb2x0aXBCb2R5LmNsYXNzTGlzdC5yZW1vdmUoYCR7VE9PTFRJUF9CT0RZX0NMQVNTfS0tdG9wYCk7XG4gICAgdG9vbHRpcEJvZHkuY2xhc3NMaXN0LnJlbW92ZShgJHtUT09MVElQX0JPRFlfQ0xBU1N9LS1ib3R0b21gKTtcbiAgICB0b29sdGlwQm9keS5jbGFzc0xpc3QucmVtb3ZlKGAke1RPT0xUSVBfQk9EWV9DTEFTU30tLXJpZ2h0YCk7XG4gICAgdG9vbHRpcEJvZHkuY2xhc3NMaXN0LnJlbW92ZShgJHtUT09MVElQX0JPRFlfQ0xBU1N9LS1sZWZ0YCk7XG4gICAgdG9vbHRpcEJvZHkuY2xhc3NMaXN0LmFkZChgJHtUT09MVElQX0JPRFlfQ0xBU1N9LS0ke3NldFBvc31gKTtcbiAgfTtcblxuICAvKipcbiAgICogUmVtb3ZlcyBvbGQgcG9zaXRpb25pbmcgc3R5bGVzLiBUaGlzIGFsbG93c1xuICAgKiByZS1wb3NpdGlvbmluZyB0byBjaGFuZ2Ugd2l0aG91dCBpbmhlcml0aW5nIG90aGVyXG4gICAqIGR5bmFtaWMgc3R5bGVzXG4gICAqXG4gICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGUgLSB0aGlzIGlzIHRoZSB0b29sdGlwIGJvZHlcbiAgICovXG4gIGNvbnN0IHJlc2V0UG9zaXRpb25TdHlsZXMgPSAoZSkgPT4ge1xuICAgIC8vIHdlIGRvbid0IG92ZXJyaWRlIGFueXRoaW5nIGluIHRoZSBzdHlsZXNoZWV0IHdoZW4gZmluZGluZyBhbHQgcG9zaXRpb25zXG4gICAgZS5zdHlsZS50b3AgPSBudWxsO1xuICAgIGUuc3R5bGUuYm90dG9tID0gbnVsbDtcbiAgICBlLnN0eWxlLnJpZ2h0ID0gbnVsbDtcbiAgICBlLnN0eWxlLmxlZnQgPSBudWxsO1xuICAgIGUuc3R5bGUubWFyZ2luID0gbnVsbDtcbiAgfTtcblxuICAvKipcbiAgICogZ2V0IG1hcmdpbiBvZmZzZXQgY2FsY3VsYXRpb25zXG4gICAqXG4gICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IHRhcmdldCAtIHRoaXMgaXMgdGhlIHRvb2x0aXAgYm9keVxuICAgKiBAcGFyYW0ge1N0cmluZ30gcHJvcGVydHlWYWx1ZSAtIHRoaXMgaXMgdGhlIHRvb2x0aXAgYm9keVxuICAgKi9cblxuICBjb25zdCBvZmZzZXRNYXJnaW4gPSAodGFyZ2V0LCBwcm9wZXJ0eVZhbHVlKSA9PlxuICAgIHBhcnNlSW50KFxuICAgICAgd2luZG93LmdldENvbXB1dGVkU3R5bGUodGFyZ2V0KS5nZXRQcm9wZXJ0eVZhbHVlKHByb3BlcnR5VmFsdWUpLFxuICAgICAgMTBcbiAgICApO1xuXG4gIC8vIG9mZnNldExlZnQgPSB0aGUgbGVmdCBwb3NpdGlvbiwgYW5kIG1hcmdpbiBvZiB0aGUgZWxlbWVudCwgdGhlIGxlZnRcbiAgLy8gcGFkZGluZywgc2Nyb2xsYmFyIGFuZCBib3JkZXIgb2YgdGhlIG9mZnNldFBhcmVudCBlbGVtZW50XG4gIC8vIG9mZnNldFdpZHRoID0gVGhlIG9mZnNldFdpZHRoIHByb3BlcnR5IHJldHVybnMgdGhlIHZpZXdhYmxlIHdpZHRoIG9mIGFuXG4gIC8vIGVsZW1lbnQgaW4gcGl4ZWxzLCBpbmNsdWRpbmcgcGFkZGluZywgYm9yZGVyIGFuZCBzY3JvbGxiYXIsIGJ1dCBub3RcbiAgLy8gdGhlIG1hcmdpbi5cblxuICAvKipcbiAgICogQ2FsY3VsYXRlIG1hcmdpbiBvZmZzZXRcbiAgICogdG9vbHRpcCB0cmlnZ2VyIG1hcmdpbihwb3NpdGlvbikgb2Zmc2V0ICsgdG9vbHRpcEJvZHkgb2Zmc2V0V2lkdGhcbiAgICogQHBhcmFtIHtTdHJpbmd9IG1hcmdpblBvc2l0aW9uXG4gICAqIEBwYXJhbSB7TnVtYmVyfSB0b29sdGlwQm9keU9mZnNldFxuICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSB0cmlnZ2VyXG4gICAqL1xuICBjb25zdCBjYWxjdWxhdGVNYXJnaW5PZmZzZXQgPSAoXG4gICAgbWFyZ2luUG9zaXRpb24sXG4gICAgdG9vbHRpcEJvZHlPZmZzZXQsXG4gICAgdHJpZ2dlclxuICApID0+IHtcbiAgICBjb25zdCBvZmZzZXQgPVxuICAgICAgb2Zmc2V0TWFyZ2luKHRyaWdnZXIsIGBtYXJnaW4tJHttYXJnaW5Qb3NpdGlvbn1gKSA+IDBcbiAgICAgICAgPyB0b29sdGlwQm9keU9mZnNldCAtIG9mZnNldE1hcmdpbih0cmlnZ2VyLCBgbWFyZ2luLSR7bWFyZ2luUG9zaXRpb259YClcbiAgICAgICAgOiB0b29sdGlwQm9keU9mZnNldDtcblxuICAgIHJldHVybiBvZmZzZXQ7XG4gIH07XG5cbiAgLyoqXG4gICAqIFBvc2l0aW9ucyB0b29sdGlwIGF0IHRoZSB0b3BcbiAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZSAtIHRoaXMgaXMgdGhlIHRvb2x0aXAgYm9keVxuICAgKi9cbiAgY29uc3QgcG9zaXRpb25Ub3AgPSAoZSkgPT4ge1xuICAgIHJlc2V0UG9zaXRpb25TdHlsZXMoZSk7IC8vIGVuc3VyZXMgd2Ugc3RhcnQgZnJvbSB0aGUgc2FtZSBwb2ludFxuICAgIC8vIGdldCBkZXRhaWxzIG9uIHRoZSBlbGVtZW50cyBvYmplY3Qgd2l0aFxuXG4gICAgY29uc3QgdG9wTWFyZ2luID0gY2FsY3VsYXRlTWFyZ2luT2Zmc2V0KFxuICAgICAgXCJ0b3BcIixcbiAgICAgIGUub2Zmc2V0SGVpZ2h0LFxuICAgICAgdG9vbHRpcFRyaWdnZXJcbiAgICApO1xuXG4gICAgY29uc3QgbGVmdE1hcmdpbiA9IGNhbGN1bGF0ZU1hcmdpbk9mZnNldChcbiAgICAgIFwibGVmdFwiLFxuICAgICAgZS5vZmZzZXRXaWR0aCxcbiAgICAgIHRvb2x0aXBUcmlnZ2VyXG4gICAgKTtcblxuICAgIHNldFBvc2l0aW9uQ2xhc3MoXCJ0b3BcIik7XG4gICAgZS5zdHlsZS5sZWZ0ID0gYDUwJWA7IC8vIGNlbnRlciB0aGUgZWxlbWVudFxuICAgIGUuc3R5bGUudG9wID0gYC0ke1RSSUFOR0xFX1NJWkV9cHhgOyAvLyBjb25zaWRlciB0aGUgcHNldWRvIGVsZW1lbnRcbiAgICAvLyBhcHBseSBvdXIgbWFyZ2lucyBiYXNlZCBvbiB0aGUgb2Zmc2V0XG4gICAgZS5zdHlsZS5tYXJnaW4gPSBgLSR7dG9wTWFyZ2lufXB4IDAgMCAtJHtsZWZ0TWFyZ2luIC8gMn1weGA7XG4gIH07XG5cbiAgLyoqXG4gICAqIFBvc2l0aW9ucyB0b29sdGlwIGF0IHRoZSBib3R0b21cbiAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZSAtIHRoaXMgaXMgdGhlIHRvb2x0aXAgYm9keVxuICAgKi9cbiAgY29uc3QgcG9zaXRpb25Cb3R0b20gPSAoZSkgPT4ge1xuICAgIHJlc2V0UG9zaXRpb25TdHlsZXMoZSk7XG5cbiAgICBjb25zdCBsZWZ0TWFyZ2luID0gY2FsY3VsYXRlTWFyZ2luT2Zmc2V0KFxuICAgICAgXCJsZWZ0XCIsXG4gICAgICBlLm9mZnNldFdpZHRoLFxuICAgICAgdG9vbHRpcFRyaWdnZXJcbiAgICApO1xuXG4gICAgc2V0UG9zaXRpb25DbGFzcyhcImJvdHRvbVwiKTtcbiAgICBlLnN0eWxlLmxlZnQgPSBgNTAlYDtcbiAgICBlLnN0eWxlLm1hcmdpbiA9IGAke1RSSUFOR0xFX1NJWkV9cHggMCAwIC0ke2xlZnRNYXJnaW4gLyAyfXB4YDtcbiAgfTtcblxuICAvKipcbiAgICogUG9zaXRpb25zIHRvb2x0aXAgYXQgdGhlIHJpZ2h0XG4gICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGUgLSB0aGlzIGlzIHRoZSB0b29sdGlwIGJvZHlcbiAgICovXG4gIGNvbnN0IHBvc2l0aW9uUmlnaHQgPSAoZSkgPT4ge1xuICAgIHJlc2V0UG9zaXRpb25TdHlsZXMoZSk7XG5cbiAgICBjb25zdCB0b3BNYXJnaW4gPSBjYWxjdWxhdGVNYXJnaW5PZmZzZXQoXG4gICAgICBcInRvcFwiLFxuICAgICAgZS5vZmZzZXRIZWlnaHQsXG4gICAgICB0b29sdGlwVHJpZ2dlclxuICAgICk7XG5cbiAgICBzZXRQb3NpdGlvbkNsYXNzKFwicmlnaHRcIik7XG4gICAgZS5zdHlsZS50b3AgPSBgNTAlYDtcbiAgICBlLnN0eWxlLmxlZnQgPSBgJHtcbiAgICAgIHRvb2x0aXBUcmlnZ2VyLm9mZnNldExlZnQgKyB0b29sdGlwVHJpZ2dlci5vZmZzZXRXaWR0aCArIFRSSUFOR0xFX1NJWkVcbiAgICB9cHhgO1xuICAgIGUuc3R5bGUubWFyZ2luID0gYC0ke3RvcE1hcmdpbiAvIDJ9cHggMCAwIDBgO1xuICB9O1xuXG4gIC8qKlxuICAgKiBQb3NpdGlvbnMgdG9vbHRpcCBhdCB0aGUgcmlnaHRcbiAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZSAtIHRoaXMgaXMgdGhlIHRvb2x0aXAgYm9keVxuICAgKi9cbiAgY29uc3QgcG9zaXRpb25MZWZ0ID0gKGUpID0+IHtcbiAgICByZXNldFBvc2l0aW9uU3R5bGVzKGUpO1xuXG4gICAgY29uc3QgdG9wTWFyZ2luID0gY2FsY3VsYXRlTWFyZ2luT2Zmc2V0KFxuICAgICAgXCJ0b3BcIixcbiAgICAgIGUub2Zmc2V0SGVpZ2h0LFxuICAgICAgdG9vbHRpcFRyaWdnZXJcbiAgICApO1xuXG4gICAgLy8gd2UgaGF2ZSB0byBjaGVjayBmb3Igc29tZSB1dGlsaXR5IG1hcmdpbnNcbiAgICBjb25zdCBsZWZ0TWFyZ2luID0gY2FsY3VsYXRlTWFyZ2luT2Zmc2V0KFxuICAgICAgXCJsZWZ0XCIsXG4gICAgICB0b29sdGlwVHJpZ2dlci5vZmZzZXRMZWZ0ID4gZS5vZmZzZXRXaWR0aFxuICAgICAgICA/IHRvb2x0aXBUcmlnZ2VyLm9mZnNldExlZnQgLSBlLm9mZnNldFdpZHRoXG4gICAgICAgIDogZS5vZmZzZXRXaWR0aCxcbiAgICAgIHRvb2x0aXBUcmlnZ2VyXG4gICAgKTtcblxuICAgIHNldFBvc2l0aW9uQ2xhc3MoXCJsZWZ0XCIpO1xuICAgIGUuc3R5bGUudG9wID0gYDUwJWA7XG4gICAgZS5zdHlsZS5sZWZ0ID0gYC0ke1RSSUFOR0xFX1NJWkV9cHhgO1xuICAgIGUuc3R5bGUubWFyZ2luID0gYC0ke3RvcE1hcmdpbiAvIDJ9cHggMCAwICR7XG4gICAgICB0b29sdGlwVHJpZ2dlci5vZmZzZXRMZWZ0ID4gZS5vZmZzZXRXaWR0aCA/IGxlZnRNYXJnaW4gOiAtbGVmdE1hcmdpblxuICAgIH1weGA7IC8vIGFkanVzdCB0aGUgbWFyZ2luXG4gIH07XG5cbiAgLyoqXG4gICAqIFdlIHRyeSB0byBzZXQgdGhlIHBvc2l0aW9uIGJhc2VkIG9uIHRoZVxuICAgKiBvcmlnaW5hbCBpbnRlbnRpb24sIGJ1dCBtYWtlIGFkanVzdG1lbnRzXG4gICAqIGlmIHRoZSBlbGVtZW50IGlzIGNsaXBwZWQgb3V0IG9mIHRoZSB2aWV3cG9ydFxuICAgKiB3ZSBjb25zdHJhaW4gdGhlIHdpZHRoIG9ubHkgYXMgYSBsYXN0IHJlc29ydFxuICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50KGFsaWFzIHRvb2x0aXBCb2R5KVxuICAgKiBAcGFyYW0ge051bWJlcn0gYXR0ZW1wdCAoLS1mbGFnKVxuICAgKi9cblxuICBjb25zdCBtYXhBdHRlbXB0cyA9IDI7XG5cbiAgZnVuY3Rpb24gZmluZEJlc3RQb3NpdGlvbihlbGVtZW50LCBhdHRlbXB0ID0gMSkge1xuICAgIC8vIGNyZWF0ZSBhcnJheSBvZiBvcHRpb25hbCBwb3NpdGlvbnNcbiAgICBjb25zdCBwb3NpdGlvbnMgPSBbXG4gICAgICBwb3NpdGlvblRvcCxcbiAgICAgIHBvc2l0aW9uQm90dG9tLFxuICAgICAgcG9zaXRpb25SaWdodCxcbiAgICAgIHBvc2l0aW9uTGVmdCxcbiAgICBdO1xuXG4gICAgbGV0IGhhc1Zpc2libGVQb3NpdGlvbiA9IGZhbHNlO1xuXG4gICAgLy8gd2UgdGFrZSBhIHJlY3Vyc2l2ZSBhcHByb2FjaFxuICAgIGZ1bmN0aW9uIHRyeVBvc2l0aW9ucyhpKSB7XG4gICAgICBpZiAoaSA8IHBvc2l0aW9ucy5sZW5ndGgpIHtcbiAgICAgICAgY29uc3QgcG9zID0gcG9zaXRpb25zW2ldO1xuICAgICAgICBwb3MoZWxlbWVudCk7XG5cbiAgICAgICAgaWYgKCFpc0VsZW1lbnRJblZpZXdwb3J0KGVsZW1lbnQpKSB7XG4gICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXBhcmFtLXJlYXNzaWduXG4gICAgICAgICAgdHJ5UG9zaXRpb25zKChpICs9IDEpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBoYXNWaXNpYmxlUG9zaXRpb24gPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgdHJ5UG9zaXRpb25zKDApO1xuICAgIC8vIGlmIHdlIGNhbid0IGZpbmQgYSBwb3NpdGlvbiB3ZSBjb21wcmVzcyBpdCBhbmQgdHJ5IGFnYWluXG4gICAgaWYgKCFoYXNWaXNpYmxlUG9zaXRpb24pIHtcbiAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZChBREpVU1RfV0lEVEhfQ0xBU1MpO1xuICAgICAgaWYgKGF0dGVtcHQgPD0gbWF4QXR0ZW1wdHMpIHtcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXBhcmFtLXJlYXNzaWduXG4gICAgICAgIGZpbmRCZXN0UG9zaXRpb24oZWxlbWVudCwgKGF0dGVtcHQgKz0gMSkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHN3aXRjaCAocG9zaXRpb24pIHtcbiAgICBjYXNlIFwidG9wXCI6XG4gICAgICBwb3NpdGlvblRvcCh0b29sdGlwQm9keSk7XG4gICAgICBpZiAoIWlzRWxlbWVudEluVmlld3BvcnQodG9vbHRpcEJvZHkpKSB7XG4gICAgICAgIGZpbmRCZXN0UG9zaXRpb24odG9vbHRpcEJvZHkpO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSBcImJvdHRvbVwiOlxuICAgICAgcG9zaXRpb25Cb3R0b20odG9vbHRpcEJvZHkpO1xuICAgICAgaWYgKCFpc0VsZW1lbnRJblZpZXdwb3J0KHRvb2x0aXBCb2R5KSkge1xuICAgICAgICBmaW5kQmVzdFBvc2l0aW9uKHRvb2x0aXBCb2R5KTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgXCJyaWdodFwiOlxuICAgICAgcG9zaXRpb25SaWdodCh0b29sdGlwQm9keSk7XG4gICAgICBpZiAoIWlzRWxlbWVudEluVmlld3BvcnQodG9vbHRpcEJvZHkpKSB7XG4gICAgICAgIGZpbmRCZXN0UG9zaXRpb24odG9vbHRpcEJvZHkpO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSBcImxlZnRcIjpcbiAgICAgIHBvc2l0aW9uTGVmdCh0b29sdGlwQm9keSk7XG4gICAgICBpZiAoIWlzRWxlbWVudEluVmlld3BvcnQodG9vbHRpcEJvZHkpKSB7XG4gICAgICAgIGZpbmRCZXN0UG9zaXRpb24odG9vbHRpcEJvZHkpO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG5cbiAgICBkZWZhdWx0OlxuICAgICAgLy8gc2tpcCBkZWZhdWx0IGNhc2VcbiAgICAgIGJyZWFrO1xuICB9XG5cbiAgLyoqXG4gICAqIEFjdHVhbGx5IHNob3cgdGhlIHRvb2x0aXAuIFRoZSBWSVNJQkxFX0NMQVNTXG4gICAqIHdpbGwgY2hhbmdlIHRoZSBvcGFjaXR5IHRvIDFcbiAgICovXG4gIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgIHRvb2x0aXBCb2R5LmNsYXNzTGlzdC5hZGQoVklTSUJMRV9DTEFTUyk7XG4gIH0sIDIwKTtcbn07XG5cbi8qKlxuICogUmVtb3ZlcyBhbGwgdGhlIHByb3BlcnRpZXMgdG8gc2hvdyBhbmQgcG9zaXRpb24gdGhlIHRvb2x0aXAsXG4gKiBhbmQgcmVzZXRzIHRoZSB0b29sdGlwIHBvc2l0aW9uIHRvIHRoZSBvcmlnaW5hbCBpbnRlbnRpb25cbiAqIGluIGNhc2UgdGhlIHdpbmRvdyBpcyByZXNpemVkIG9yIHRoZSBlbGVtZW50IGlzIG1vdmVkIHRocm91Z2hcbiAqIERPTSBtYW5pcHVsYXRpb24uXG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSB0b29sdGlwQm9keSAtIFRoZSBib2R5IG9mIHRoZSB0b29sdGlwXG4gKi9cbmNvbnN0IGhpZGVUb29sVGlwID0gKHRvb2x0aXBCb2R5KSA9PiB7XG4gIHRvb2x0aXBCb2R5LmNsYXNzTGlzdC5yZW1vdmUoVklTSUJMRV9DTEFTUyk7XG4gIHRvb2x0aXBCb2R5LmNsYXNzTGlzdC5yZW1vdmUoU0VUX0NMQVNTKTtcbiAgdG9vbHRpcEJvZHkuY2xhc3NMaXN0LnJlbW92ZShBREpVU1RfV0lEVEhfQ0xBU1MpO1xuICB0b29sdGlwQm9keS5zZXRBdHRyaWJ1dGUoXCJhcmlhLWhpZGRlblwiLCBcInRydWVcIik7XG59O1xuXG4vKipcbiAqIFNldHVwIHRoZSB0b29sdGlwIGNvbXBvbmVudFxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gdG9vbHRpcFRyaWdnZXIgVGhlIGVsZW1lbnQgdGhhdCBjcmVhdGVzIHRoZSB0b29sdGlwXG4gKi9cbmNvbnN0IHNldFVwQXR0cmlidXRlcyA9ICh0b29sdGlwVHJpZ2dlcikgPT4ge1xuICBjb25zdCB0b29sdGlwSUQgPSBgdG9vbHRpcC0ke01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDkwMDAwMCkgKyAxMDAwMDB9YDtcbiAgY29uc3QgdG9vbHRpcENvbnRlbnQgPSB0b29sdGlwVHJpZ2dlci5nZXRBdHRyaWJ1dGUoXCJ0aXRsZVwiKTtcbiAgY29uc3Qgd3JhcHBlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIpO1xuICBjb25zdCB0b29sdGlwQm9keSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIpO1xuICBjb25zdCBwb3NpdGlvbiA9IHRvb2x0aXBUcmlnZ2VyLmdldEF0dHJpYnV0ZShcImRhdGEtcG9zaXRpb25cIilcbiAgICA/IHRvb2x0aXBUcmlnZ2VyLmdldEF0dHJpYnV0ZShcImRhdGEtcG9zaXRpb25cIilcbiAgICA6IFwidG9wXCI7XG4gIGNvbnN0IGFkZGl0aW9uYWxDbGFzc2VzID0gdG9vbHRpcFRyaWdnZXIuZ2V0QXR0cmlidXRlKFwiZGF0YS1jbGFzc2VzXCIpO1xuXG4gIC8vIFNldCB1cCB0b29sdGlwIGF0dHJpYnV0ZXNcbiAgdG9vbHRpcFRyaWdnZXIuc2V0QXR0cmlidXRlKFwiYXJpYS1kZXNjcmliZWRieVwiLCB0b29sdGlwSUQpO1xuICB0b29sdGlwVHJpZ2dlci5zZXRBdHRyaWJ1dGUoXCJ0YWJpbmRleFwiLCBcIjBcIik7XG4gIHRvb2x0aXBUcmlnZ2VyLnJlbW92ZUF0dHJpYnV0ZShcInRpdGxlXCIpO1xuICB0b29sdGlwVHJpZ2dlci5jbGFzc0xpc3QucmVtb3ZlKFRPT0xUSVBfQ0xBU1MpO1xuICB0b29sdGlwVHJpZ2dlci5jbGFzc0xpc3QuYWRkKFRPT0xUSVBfVFJJR0dFUl9DTEFTUyk7XG5cbiAgLy8gaW5zZXJ0IHdyYXBwZXIgYmVmb3JlIGVsIGluIHRoZSBET00gdHJlZVxuICB0b29sdGlwVHJpZ2dlci5wYXJlbnROb2RlLmluc2VydEJlZm9yZSh3cmFwcGVyLCB0b29sdGlwVHJpZ2dlcik7XG5cbiAgLy8gc2V0IHVwIHRoZSB3cmFwcGVyXG4gIHdyYXBwZXIuYXBwZW5kQ2hpbGQodG9vbHRpcFRyaWdnZXIpO1xuICB3cmFwcGVyLmNsYXNzTGlzdC5hZGQoVE9PTFRJUF9DTEFTUyk7XG4gIHdyYXBwZXIuYXBwZW5kQ2hpbGQodG9vbHRpcEJvZHkpO1xuXG4gIC8vIEFwcGx5IGFkZGl0aW9uYWwgY2xhc3MgbmFtZXMgdG8gd3JhcHBlciBlbGVtZW50XG4gIGlmIChhZGRpdGlvbmFsQ2xhc3Nlcykge1xuICAgIGNvbnN0IGNsYXNzZXNBcnJheSA9IGFkZGl0aW9uYWxDbGFzc2VzLnNwbGl0KFwiIFwiKTtcbiAgICBjbGFzc2VzQXJyYXkuZm9yRWFjaCgoY2xhc3NuYW1lKSA9PiB3cmFwcGVyLmNsYXNzTGlzdC5hZGQoY2xhc3NuYW1lKSk7XG4gIH1cblxuICAvLyBzZXQgdXAgdGhlIHRvb2x0aXAgYm9keVxuICB0b29sdGlwQm9keS5jbGFzc0xpc3QuYWRkKFRPT0xUSVBfQk9EWV9DTEFTUyk7XG4gIHRvb2x0aXBCb2R5LnNldEF0dHJpYnV0ZShcImlkXCIsIHRvb2x0aXBJRCk7XG4gIHRvb2x0aXBCb2R5LnNldEF0dHJpYnV0ZShcInJvbGVcIiwgXCJ0b29sdGlwXCIpO1xuICB0b29sdGlwQm9keS5zZXRBdHRyaWJ1dGUoXCJhcmlhLWhpZGRlblwiLCBcInRydWVcIik7XG5cbiAgLy8gcGxhY2UgdGhlIHRleHQgaW4gdGhlIHRvb2x0aXBcbiAgdG9vbHRpcEJvZHkudGV4dENvbnRlbnQgPSB0b29sdGlwQ29udGVudDtcblxuICByZXR1cm4geyB0b29sdGlwQm9keSwgcG9zaXRpb24sIHRvb2x0aXBDb250ZW50LCB3cmFwcGVyIH07XG59O1xuXG4vLyBTZXR1cCBvdXIgZnVuY3Rpb24gdG8gcnVuIG9uIHZhcmlvdXMgZXZlbnRzXG5jb25zdCB0b29sdGlwID0gYmVoYXZpb3IoXG4gIHtcbiAgICBcIm1vdXNlb3ZlciBmb2N1c2luXCI6IHtcbiAgICAgIFtUT09MVElQXShlKSB7XG4gICAgICAgIGNvbnN0IHRyaWdnZXIgPSBlLnRhcmdldDtcbiAgICAgICAgY29uc3QgZWxlbWVudFR5cGUgPSB0cmlnZ2VyLm5vZGVOYW1lO1xuXG4gICAgICAgIC8vIEluaXRpYWxpemUgdG9vbHRpcCBpZiBpdCBoYXNuJ3QgYWxyZWFkeVxuICAgICAgICBpZiAoZWxlbWVudFR5cGUgPT09IFwiQlVUVE9OXCIgJiYgdHJpZ2dlci5oYXNBdHRyaWJ1dGUoXCJ0aXRsZVwiKSkge1xuICAgICAgICAgIHNldFVwQXR0cmlidXRlcyh0cmlnZ2VyKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIFtUT09MVElQX1RSSUdHRVJdKGUpIHtcbiAgICAgICAgY29uc3QgeyB0cmlnZ2VyLCBib2R5IH0gPSBnZXRUb29sdGlwRWxlbWVudHMoZS50YXJnZXQpO1xuXG4gICAgICAgIHNob3dUb29sVGlwKGJvZHksIHRyaWdnZXIsIHRyaWdnZXIuZGF0YXNldC5wb3NpdGlvbik7XG4gICAgICB9LFxuICAgIH0sXG4gICAgXCJtb3VzZW91dCBmb2N1c291dFwiOiB7XG4gICAgICBbVE9PTFRJUF9UUklHR0VSXShlKSB7XG4gICAgICAgIGNvbnN0IHsgYm9keSB9ID0gZ2V0VG9vbHRpcEVsZW1lbnRzKGUudGFyZ2V0KTtcblxuICAgICAgICBoaWRlVG9vbFRpcChib2R5KTtcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbiAge1xuICAgIGluaXQocm9vdCkge1xuICAgICAgc2VsZWN0T3JNYXRjaGVzKFRPT0xUSVAsIHJvb3QpLmZvckVhY2goKHRvb2x0aXBUcmlnZ2VyKSA9PiB7XG4gICAgICAgIHNldFVwQXR0cmlidXRlcyh0b29sdGlwVHJpZ2dlcik7XG4gICAgICB9KTtcbiAgICB9LFxuICAgIHNldHVwOiBzZXRVcEF0dHJpYnV0ZXMsXG4gICAgZ2V0VG9vbHRpcEVsZW1lbnRzLFxuICAgIHNob3c6IHNob3dUb29sVGlwLFxuICAgIGhpZGU6IGhpZGVUb29sVGlwLFxuICB9XG4pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHRvb2x0aXA7XG4iLCJjb25zdCBiZWhhdmlvciA9IHJlcXVpcmUoXCIuLi8uLi91c3dkcy1jb3JlL3NyYy9qcy91dGlscy9iZWhhdmlvclwiKTtcbmNvbnN0IHZhbGlkYXRlID0gcmVxdWlyZShcIi4uLy4uL3Vzd2RzLWNvcmUvc3JjL2pzL3V0aWxzL3ZhbGlkYXRlLWlucHV0XCIpO1xuXG5mdW5jdGlvbiBjaGFuZ2UoKSB7XG4gIHZhbGlkYXRlKHRoaXMpO1xufVxuXG5jb25zdCB2YWxpZGF0b3IgPSBiZWhhdmlvcih7XG4gIFwia2V5dXAgY2hhbmdlXCI6IHtcbiAgICBcImlucHV0W2RhdGEtdmFsaWRhdGlvbi1lbGVtZW50XVwiOiBjaGFuZ2UsXG4gIH0sXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSB2YWxpZGF0b3I7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgcHJlZml4OiBcInVzYVwiLFxufTtcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICAvLyBUaGlzIHVzZWQgdG8gYmUgY29uZGl0aW9uYWxseSBkZXBlbmRlbnQgb24gd2hldGhlciB0aGVcbiAgLy8gYnJvd3NlciBzdXBwb3J0ZWQgdG91Y2ggZXZlbnRzOyBpZiBpdCBkaWQsIGBDTElDS2Agd2FzIHNldCB0b1xuICAvLyBgdG91Y2hzdGFydGAuICBIb3dldmVyLCB0aGlzIGhhZCBkb3duc2lkZXM6XG4gIC8vXG4gIC8vICogSXQgcHJlLWVtcHRlZCBtb2JpbGUgYnJvd3NlcnMnIGRlZmF1bHQgYmVoYXZpb3Igb2YgZGV0ZWN0aW5nXG4gIC8vICAgd2hldGhlciBhIHRvdWNoIHR1cm5lZCBpbnRvIGEgc2Nyb2xsLCB0aGVyZWJ5IHByZXZlbnRpbmdcbiAgLy8gICB1c2VycyBmcm9tIHVzaW5nIHNvbWUgb2Ygb3VyIGNvbXBvbmVudHMgYXMgc2Nyb2xsIHN1cmZhY2VzLlxuICAvL1xuICAvLyAqIFNvbWUgZGV2aWNlcywgc3VjaCBhcyB0aGUgTWljcm9zb2Z0IFN1cmZhY2UgUHJvLCBzdXBwb3J0ICpib3RoKlxuICAvLyAgIHRvdWNoIGFuZCBjbGlja3MuIFRoaXMgbWVhbnQgdGhlIGNvbmRpdGlvbmFsIGVmZmVjdGl2ZWx5IGRyb3BwZWRcbiAgLy8gICBzdXBwb3J0IGZvciB0aGUgdXNlcidzIG1vdXNlLCBmcnVzdHJhdGluZyB1c2VycyB3aG8gcHJlZmVycmVkXG4gIC8vICAgaXQgb24gdGhvc2Ugc3lzdGVtcy5cbiAgQ0xJQ0s6IFwiY2xpY2tcIixcbn07XG4iLCJjb25zdCBhY2NvcmRpb24gPSByZXF1aXJlKFwiLi4vLi4vLi4vdXNhLWFjY29yZGlvbi9zcmMvaW5kZXhcIik7XG5jb25zdCBiYW5uZXIgPSByZXF1aXJlKFwiLi4vLi4vLi4vdXNhLWJhbm5lci9zcmMvaW5kZXhcIik7XG5jb25zdCBjaGFyYWN0ZXJDb3VudCA9IHJlcXVpcmUoXCIuLi8uLi8uLi91c2EtY2hhcmFjdGVyLWNvdW50L3NyYy9pbmRleFwiKTtcbmNvbnN0IGNvbWJvQm94ID0gcmVxdWlyZShcIi4uLy4uLy4uL3VzYS1jb21iby1ib3gvc3JjL2luZGV4XCIpO1xuY29uc3QgZGF0ZVBpY2tlciA9IHJlcXVpcmUoXCIuLi8uLi8uLi91c2EtZGF0ZS1waWNrZXIvc3JjL2luZGV4XCIpO1xuY29uc3QgZGF0ZVJhbmdlUGlja2VyID0gcmVxdWlyZShcIi4uLy4uLy4uL3VzYS1kYXRlLXJhbmdlLXBpY2tlci9zcmMvaW5kZXhcIik7XG5jb25zdCBmaWxlSW5wdXQgPSByZXF1aXJlKFwiLi4vLi4vLi4vdXNhLWZpbGUtaW5wdXQvc3JjL2luZGV4XCIpO1xuY29uc3QgZm9vdGVyID0gcmVxdWlyZShcIi4uLy4uLy4uL3VzYS1mb290ZXIvc3JjL2luZGV4XCIpO1xuY29uc3QgaW5wdXRQcmVmaXhTdWZmaXggPSByZXF1aXJlKFwiLi4vLi4vLi4vdXNhLWlucHV0LXByZWZpeC1zdWZmaXgvc3JjL2luZGV4XCIpO1xuY29uc3QgbW9kYWwgPSByZXF1aXJlKFwiLi4vLi4vLi4vdXNhLW1vZGFsL3NyYy9pbmRleFwiKTtcbmNvbnN0IHBhc3N3b3JkID0gcmVxdWlyZShcIi4uLy4uLy4uL191c2EtcGFzc3dvcmQvc3JjL2luZGV4XCIpO1xuY29uc3Qgc2VhcmNoID0gcmVxdWlyZShcIi4uLy4uLy4uL3VzYS1zZWFyY2gvc3JjL2luZGV4XCIpO1xuY29uc3QgbmF2aWdhdGlvbiA9IHJlcXVpcmUoXCIuLi8uLi8uLi91c2EtaGVhZGVyL3NyYy9pbmRleFwiKTtcbmNvbnN0IHNraXBuYXYgPSByZXF1aXJlKFwiLi4vLi4vLi4vdXNhLXNraXBuYXYvc3JjL2luZGV4XCIpO1xuY29uc3QgdGFibGUgPSByZXF1aXJlKFwiLi4vLi4vLi4vdXNhLXRhYmxlL3NyYy9pbmRleFwiKTtcbmNvbnN0IHRpbWVQaWNrZXIgPSByZXF1aXJlKFwiLi4vLi4vLi4vdXNhLXRpbWUtcGlja2VyL3NyYy9pbmRleFwiKTtcbmNvbnN0IHRvb2x0aXAgPSByZXF1aXJlKFwiLi4vLi4vLi4vdXNhLXRvb2x0aXAvc3JjL2luZGV4XCIpO1xuY29uc3QgdmFsaWRhdG9yID0gcmVxdWlyZShcIi4uLy4uLy4uL3VzYS12YWxpZGF0aW9uL3NyYy9pbmRleFwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGFjY29yZGlvbixcbiAgYmFubmVyLFxuICBjaGFyYWN0ZXJDb3VudCxcbiAgY29tYm9Cb3gsXG4gIGRhdGVQaWNrZXIsXG4gIGRhdGVSYW5nZVBpY2tlcixcbiAgZmlsZUlucHV0LFxuICBmb290ZXIsXG4gIGlucHV0UHJlZml4U3VmZml4LFxuICBtb2RhbCxcbiAgbmF2aWdhdGlvbixcbiAgcGFzc3dvcmQsXG4gIHNlYXJjaCxcbiAgc2tpcG5hdixcbiAgdGFibGUsXG4gIHRpbWVQaWNrZXIsXG4gIHRvb2x0aXAsXG4gIHZhbGlkYXRvcixcbn07XG4iLCIvKiBlc2xpbnQtZGlzYWJsZSBjb25zaXN0ZW50LXJldHVybiAqL1xuLyogZXNsaW50LWRpc2FibGUgZnVuYy1uYW1lcyAqL1xuKGZ1bmN0aW9uICgpIHtcbiAgaWYgKHR5cGVvZiB3aW5kb3cuQ3VzdG9tRXZlbnQgPT09IFwiZnVuY3Rpb25cIikgcmV0dXJuIGZhbHNlO1xuXG4gIGZ1bmN0aW9uIEN1c3RvbUV2ZW50KGV2ZW50LCBfcGFyYW1zKSB7XG4gICAgY29uc3QgcGFyYW1zID0gX3BhcmFtcyB8fCB7XG4gICAgICBidWJibGVzOiBmYWxzZSxcbiAgICAgIGNhbmNlbGFibGU6IGZhbHNlLFxuICAgICAgZGV0YWlsOiBudWxsLFxuICAgIH07XG4gICAgY29uc3QgZXZ0ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoXCJDdXN0b21FdmVudFwiKTtcbiAgICBldnQuaW5pdEN1c3RvbUV2ZW50KFxuICAgICAgZXZlbnQsXG4gICAgICBwYXJhbXMuYnViYmxlcyxcbiAgICAgIHBhcmFtcy5jYW5jZWxhYmxlLFxuICAgICAgcGFyYW1zLmRldGFpbFxuICAgICk7XG4gICAgcmV0dXJuIGV2dDtcbiAgfVxuXG4gIHdpbmRvdy5DdXN0b21FdmVudCA9IEN1c3RvbUV2ZW50O1xufSkoKTtcbiIsImNvbnN0IGVscHJvdG8gPSB3aW5kb3cuSFRNTEVsZW1lbnQucHJvdG90eXBlO1xuY29uc3QgSElEREVOID0gXCJoaWRkZW5cIjtcblxuaWYgKCEoSElEREVOIGluIGVscHJvdG8pKSB7XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShlbHByb3RvLCBISURERU4sIHtcbiAgICBnZXQoKSB7XG4gICAgICByZXR1cm4gdGhpcy5oYXNBdHRyaWJ1dGUoSElEREVOKTtcbiAgICB9LFxuICAgIHNldCh2YWx1ZSkge1xuICAgICAgaWYgKHZhbHVlKSB7XG4gICAgICAgIHRoaXMuc2V0QXR0cmlidXRlKEhJRERFTiwgXCJcIik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnJlbW92ZUF0dHJpYnV0ZShISURERU4pO1xuICAgICAgfVxuICAgIH0sXG4gIH0pO1xufVxuIiwiLy8gcG9seWZpbGxzIEhUTUxFbGVtZW50LnByb3RvdHlwZS5jbGFzc0xpc3QgYW5kIERPTVRva2VuTGlzdFxucmVxdWlyZShcImNsYXNzbGlzdC1wb2x5ZmlsbFwiKTtcbi8vIHBvbHlmaWxscyBIVE1MRWxlbWVudC5wcm90b3R5cGUuaGlkZGVuXG5yZXF1aXJlKFwiLi9lbGVtZW50LWhpZGRlblwiKTtcbi8vIHBvbHlmaWxscyBOdW1iZXIuaXNOYU4oKVxucmVxdWlyZShcIi4vbnVtYmVyLWlzLW5hblwiKTtcbi8vIHBvbHlmaWxscyBDdXN0b21FdmVudFxucmVxdWlyZShcIi4vY3VzdG9tLWV2ZW50XCIpO1xuLy8gcG9seWZpbGxzIHN2ZzRldmVyeWJvZHlcbnJlcXVpcmUoXCIuL3N2ZzRldmVyeWJvZHlcIik7XG4iLCJOdW1iZXIuaXNOYU4gPVxuICBOdW1iZXIuaXNOYU4gfHxcbiAgZnVuY3Rpb24gaXNOYU4oaW5wdXQpIHtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tc2VsZi1jb21wYXJlXG4gICAgcmV0dXJuIHR5cGVvZiBpbnB1dCA9PT0gXCJudW1iZXJcIiAmJiBpbnB1dCAhPT0gaW5wdXQ7XG4gIH07XG4iLCIvKiBlc2xpbnQtZGlzYWJsZSAqL1xuIShmdW5jdGlvbiAoZmFjdG9yeSkge1xuICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcbn0pKGZ1bmN0aW9uICgpIHtcbiAgLyohIHN2ZzRldmVyeWJvZHkgdjIuMS45IHwgZ2l0aHViLmNvbS9qb25hdGhhbnRuZWFsL3N2ZzRldmVyeWJvZHkgKi9cbiAgZnVuY3Rpb24gZW1iZWQocGFyZW50LCBzdmcsIHRhcmdldCwgdXNlKSB7XG4gICAgLy8gaWYgdGhlIHRhcmdldCBleGlzdHNcbiAgICBpZiAodGFyZ2V0KSB7XG4gICAgICAvLyBjcmVhdGUgYSBkb2N1bWVudCBmcmFnbWVudCB0byBob2xkIHRoZSBjb250ZW50cyBvZiB0aGUgdGFyZ2V0XG4gICAgICB2YXIgZnJhZ21lbnQgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCksXG4gICAgICAgIHZpZXdCb3ggPVxuICAgICAgICAgICFzdmcuaGFzQXR0cmlidXRlKFwidmlld0JveFwiKSAmJiB0YXJnZXQuZ2V0QXR0cmlidXRlKFwidmlld0JveFwiKTtcbiAgICAgIC8vIGNvbmRpdGlvbmFsbHkgc2V0IHRoZSB2aWV3Qm94IG9uIHRoZSBzdmdcbiAgICAgIHZpZXdCb3ggJiYgc3ZnLnNldEF0dHJpYnV0ZShcInZpZXdCb3hcIiwgdmlld0JveCk7XG4gICAgICAvLyBjb3B5IHRoZSBjb250ZW50cyBvZiB0aGUgY2xvbmUgaW50byB0aGUgZnJhZ21lbnRcbiAgICAgIGZvciAoXG4gICAgICAgIC8vIGNsb25lIHRoZSB0YXJnZXRcbiAgICAgICAgdmFyIGNsb25lID0gZG9jdW1lbnQuaW1wb3J0Tm9kZVxuICAgICAgICAgICAgPyBkb2N1bWVudC5pbXBvcnROb2RlKHRhcmdldCwgITApXG4gICAgICAgICAgICA6IHRhcmdldC5jbG9uZU5vZGUoITApLFxuICAgICAgICAgIGcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoXG4gICAgICAgICAgICBzdmcubmFtZXNwYWNlVVJJIHx8IFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIixcbiAgICAgICAgICAgIFwiZ1wiXG4gICAgICAgICAgKTtcbiAgICAgICAgY2xvbmUuY2hpbGROb2Rlcy5sZW5ndGg7XG5cbiAgICAgICkge1xuICAgICAgICBnLmFwcGVuZENoaWxkKGNsb25lLmZpcnN0Q2hpbGQpO1xuICAgICAgfVxuICAgICAgaWYgKHVzZSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgdXNlLmF0dHJpYnV0ZXMubGVuZ3RoID4gaTsgaSsrKSB7XG4gICAgICAgICAgdmFyIGF0dHIgPSB1c2UuYXR0cmlidXRlc1tpXTtcbiAgICAgICAgICBcInhsaW5rOmhyZWZcIiAhPT0gYXR0ci5uYW1lICYmXG4gICAgICAgICAgICBcImhyZWZcIiAhPT0gYXR0ci5uYW1lICYmXG4gICAgICAgICAgICBnLnNldEF0dHJpYnV0ZShhdHRyLm5hbWUsIGF0dHIudmFsdWUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBmcmFnbWVudC5hcHBlbmRDaGlsZChnKSwgLy8gYXBwZW5kIHRoZSBmcmFnbWVudCBpbnRvIHRoZSBzdmdcbiAgICAgICAgcGFyZW50LmFwcGVuZENoaWxkKGZyYWdtZW50KTtcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gbG9hZHJlYWR5c3RhdGVjaGFuZ2UoeGhyLCB1c2UpIHtcbiAgICAvLyBsaXN0ZW4gdG8gY2hhbmdlcyBpbiB0aGUgcmVxdWVzdFxuICAgICh4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24gKCkge1xuICAgICAgLy8gaWYgdGhlIHJlcXVlc3QgaXMgcmVhZHlcbiAgICAgIGlmICg0ID09PSB4aHIucmVhZHlTdGF0ZSkge1xuICAgICAgICAvLyBnZXQgdGhlIGNhY2hlZCBodG1sIGRvY3VtZW50XG4gICAgICAgIHZhciBjYWNoZWREb2N1bWVudCA9IHhoci5fY2FjaGVkRG9jdW1lbnQ7XG4gICAgICAgIC8vIGVuc3VyZSB0aGUgY2FjaGVkIGh0bWwgZG9jdW1lbnQgYmFzZWQgb24gdGhlIHhociByZXNwb25zZVxuICAgICAgICBjYWNoZWREb2N1bWVudCB8fFxuICAgICAgICAgICgoY2FjaGVkRG9jdW1lbnQgPSB4aHIuX2NhY2hlZERvY3VtZW50ID1cbiAgICAgICAgICAgIGRvY3VtZW50LmltcGxlbWVudGF0aW9uLmNyZWF0ZUhUTUxEb2N1bWVudChcIlwiKSksXG4gICAgICAgICAgKGNhY2hlZERvY3VtZW50LmJvZHkuaW5uZXJIVE1MID0geGhyLnJlc3BvbnNlVGV4dCksIC8vIGVuc3VyZSBkb21haW5zIGFyZSB0aGUgc2FtZSwgb3RoZXJ3aXNlIHdlJ2xsIGhhdmUgaXNzdWVzIGFwcGVuZGluZyB0aGVcbiAgICAgICAgICAvLyBlbGVtZW50IGluIElFIDExXG4gICAgICAgICAgY2FjaGVkRG9jdW1lbnQuZG9tYWluICE9PSBkb2N1bWVudC5kb21haW4gJiZcbiAgICAgICAgICAgIChjYWNoZWREb2N1bWVudC5kb21haW4gPSBkb2N1bWVudC5kb21haW4pLFxuICAgICAgICAgICh4aHIuX2NhY2hlZFRhcmdldCA9IHt9KSksIC8vIGNsZWFyIHRoZSB4aHIgZW1iZWRzIGxpc3QgYW5kIGVtYmVkIGVhY2ggaXRlbVxuICAgICAgICAgIHhoci5fZW1iZWRzLnNwbGljZSgwKS5tYXAoZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgICAgIC8vIGdldCB0aGUgY2FjaGVkIHRhcmdldFxuICAgICAgICAgICAgdmFyIHRhcmdldCA9IHhoci5fY2FjaGVkVGFyZ2V0W2l0ZW0uaWRdO1xuICAgICAgICAgICAgLy8gZW5zdXJlIHRoZSBjYWNoZWQgdGFyZ2V0XG4gICAgICAgICAgICB0YXJnZXQgfHxcbiAgICAgICAgICAgICAgKHRhcmdldCA9IHhoci5fY2FjaGVkVGFyZ2V0W2l0ZW0uaWRdID1cbiAgICAgICAgICAgICAgICBjYWNoZWREb2N1bWVudC5nZXRFbGVtZW50QnlJZChpdGVtLmlkKSksXG4gICAgICAgICAgICAgIC8vIGVtYmVkIHRoZSB0YXJnZXQgaW50byB0aGUgc3ZnXG4gICAgICAgICAgICAgIGVtYmVkKGl0ZW0ucGFyZW50LCBpdGVtLnN2ZywgdGFyZ2V0LCB1c2UpO1xuICAgICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pLCAvLyB0ZXN0IHRoZSByZWFkeSBzdGF0ZSBjaGFuZ2UgaW1tZWRpYXRlbHlcbiAgICAgIHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UoKTtcbiAgfVxuICBmdW5jdGlvbiBzdmc0ZXZlcnlib2R5KHJhd29wdHMpIHtcbiAgICBmdW5jdGlvbiBvbmludGVydmFsKCkge1xuICAgICAgLy8gaWYgYWxsIDx1c2U+cyBpbiB0aGUgYXJyYXkgYXJlIGJlaW5nIGJ5cGFzc2VkLCBkb24ndCBwcm9jZWVkLlxuICAgICAgaWYgKFxuICAgICAgICBudW1iZXJPZlN2Z1VzZUVsZW1lbnRzVG9CeXBhc3MgJiZcbiAgICAgICAgdXNlcy5sZW5ndGggLSBudW1iZXJPZlN2Z1VzZUVsZW1lbnRzVG9CeXBhc3MgPD0gMFxuICAgICAgKSB7XG4gICAgICAgIHJldHVybiB2b2lkIHJlcXVlc3RBbmltYXRpb25GcmFtZShvbmludGVydmFsLCA2Nyk7XG4gICAgICB9XG4gICAgICAvLyBpZiB0aGVyZSBhcmUgPHVzZT5zIHRvIHByb2Nlc3MsIHByb2NlZWQuXG4gICAgICAvLyByZXNldCB0aGUgYnlwYXNzIGNvdW50ZXIsIHNpbmNlIHRoZSBjb3VudGVyIHdpbGwgYmUgaW5jcmVtZW50ZWQgZm9yIGV2ZXJ5IGJ5cGFzc2VkIGVsZW1lbnQsXG4gICAgICAvLyBldmVuIG9uZXMgdGhhdCB3ZXJlIGNvdW50ZWQgYmVmb3JlLlxuICAgICAgbnVtYmVyT2ZTdmdVc2VFbGVtZW50c1RvQnlwYXNzID0gMDtcbiAgICAgIC8vIHdoaWxlIHRoZSBpbmRleCBleGlzdHMgaW4gdGhlIGxpdmUgPHVzZT4gY29sbGVjdGlvblxuICAgICAgZm9yIChcbiAgICAgICAgLy8gZ2V0IHRoZSBjYWNoZWQgPHVzZT4gaW5kZXhcbiAgICAgICAgdmFyIGluZGV4ID0gMDtcbiAgICAgICAgaW5kZXggPCB1c2VzLmxlbmd0aDtcblxuICAgICAgKSB7XG4gICAgICAgIC8vIGdldCB0aGUgY3VycmVudCA8dXNlPlxuICAgICAgICB2YXIgdXNlID0gdXNlc1tpbmRleF0sXG4gICAgICAgICAgcGFyZW50ID0gdXNlLnBhcmVudE5vZGUsXG4gICAgICAgICAgc3ZnID0gZ2V0U1ZHQW5jZXN0b3IocGFyZW50KSxcbiAgICAgICAgICBzcmMgPSB1c2UuZ2V0QXR0cmlidXRlKFwieGxpbms6aHJlZlwiKSB8fCB1c2UuZ2V0QXR0cmlidXRlKFwiaHJlZlwiKTtcbiAgICAgICAgaWYgKFxuICAgICAgICAgICghc3JjICYmXG4gICAgICAgICAgICBvcHRzLmF0dHJpYnV0ZU5hbWUgJiZcbiAgICAgICAgICAgIChzcmMgPSB1c2UuZ2V0QXR0cmlidXRlKG9wdHMuYXR0cmlidXRlTmFtZSkpLFxuICAgICAgICAgIHN2ZyAmJiBzcmMpXG4gICAgICAgICkge1xuICAgICAgICAgIGlmIChwb2x5ZmlsbCkge1xuICAgICAgICAgICAgaWYgKCFvcHRzLnZhbGlkYXRlIHx8IG9wdHMudmFsaWRhdGUoc3JjLCBzdmcsIHVzZSkpIHtcbiAgICAgICAgICAgICAgLy8gcmVtb3ZlIHRoZSA8dXNlPiBlbGVtZW50XG4gICAgICAgICAgICAgIHBhcmVudC5yZW1vdmVDaGlsZCh1c2UpO1xuICAgICAgICAgICAgICAvLyBwYXJzZSB0aGUgc3JjIGFuZCBnZXQgdGhlIHVybCBhbmQgaWRcbiAgICAgICAgICAgICAgdmFyIHNyY1NwbGl0ID0gc3JjLnNwbGl0KFwiI1wiKSxcbiAgICAgICAgICAgICAgICB1cmwgPSBzcmNTcGxpdC5zaGlmdCgpLFxuICAgICAgICAgICAgICAgIGlkID0gc3JjU3BsaXQuam9pbihcIiNcIik7XG4gICAgICAgICAgICAgIC8vIGlmIHRoZSBsaW5rIGlzIGV4dGVybmFsXG4gICAgICAgICAgICAgIGlmICh1cmwubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgLy8gZ2V0IHRoZSBjYWNoZWQgeGhyIHJlcXVlc3RcbiAgICAgICAgICAgICAgICB2YXIgeGhyID0gcmVxdWVzdHNbdXJsXTtcbiAgICAgICAgICAgICAgICAvLyBlbnN1cmUgdGhlIHhociByZXF1ZXN0IGV4aXN0c1xuICAgICAgICAgICAgICAgIHhociB8fFxuICAgICAgICAgICAgICAgICAgKCh4aHIgPSByZXF1ZXN0c1t1cmxdID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCkpLFxuICAgICAgICAgICAgICAgICAgeGhyLm9wZW4oXCJHRVRcIiwgdXJsKSxcbiAgICAgICAgICAgICAgICAgIHhoci5zZW5kKCksXG4gICAgICAgICAgICAgICAgICAoeGhyLl9lbWJlZHMgPSBbXSkpLCAvLyBhZGQgdGhlIHN2ZyBhbmQgaWQgYXMgYW4gaXRlbSB0byB0aGUgeGhyIGVtYmVkcyBsaXN0XG4gICAgICAgICAgICAgICAgICB4aHIuX2VtYmVkcy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50OiBwYXJlbnQsXG4gICAgICAgICAgICAgICAgICAgIHN2Zzogc3ZnLFxuICAgICAgICAgICAgICAgICAgICBpZDogaWQsXG4gICAgICAgICAgICAgICAgICB9KSwgLy8gcHJlcGFyZSB0aGUgeGhyIHJlYWR5IHN0YXRlIGNoYW5nZSBldmVudFxuICAgICAgICAgICAgICAgICAgbG9hZHJlYWR5c3RhdGVjaGFuZ2UoeGhyLCB1c2UpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIGVtYmVkIHRoZSBsb2NhbCBpZCBpbnRvIHRoZSBzdmdcbiAgICAgICAgICAgICAgICBlbWJlZChwYXJlbnQsIHN2ZywgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpLCB1c2UpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAvLyBpbmNyZWFzZSB0aGUgaW5kZXggd2hlbiB0aGUgcHJldmlvdXMgdmFsdWUgd2FzIG5vdCBcInZhbGlkXCJcbiAgICAgICAgICAgICAgKytpbmRleCwgKytudW1iZXJPZlN2Z1VzZUVsZW1lbnRzVG9CeXBhc3M7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIGluY3JlYXNlIHRoZSBpbmRleCB3aGVuIHRoZSBwcmV2aW91cyB2YWx1ZSB3YXMgbm90IFwidmFsaWRcIlxuICAgICAgICAgICsraW5kZXg7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIC8vIGNvbnRpbnVlIHRoZSBpbnRlcnZhbFxuICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKG9uaW50ZXJ2YWwsIDY3KTtcbiAgICB9XG4gICAgdmFyIHBvbHlmaWxsLFxuICAgICAgb3B0cyA9IE9iamVjdChyYXdvcHRzKSxcbiAgICAgIG5ld2VySUVVQSA9IC9cXGJUcmlkZW50XFwvWzU2N11cXGJ8XFxiTVNJRSAoPzo5fDEwKVxcLjBcXGIvLFxuICAgICAgd2Via2l0VUEgPSAvXFxiQXBwbGVXZWJLaXRcXC8oXFxkKylcXGIvLFxuICAgICAgb2xkZXJFZGdlVUEgPSAvXFxiRWRnZVxcLzEyXFwuKFxcZCspXFxiLyxcbiAgICAgIGVkZ2VVQSA9IC9cXGJFZGdlXFwvLihcXGQrKVxcYi8sXG4gICAgICBpbklmcmFtZSA9IHdpbmRvdy50b3AgIT09IHdpbmRvdy5zZWxmO1xuICAgIHBvbHlmaWxsID1cbiAgICAgIFwicG9seWZpbGxcIiBpbiBvcHRzXG4gICAgICAgID8gb3B0cy5wb2x5ZmlsbFxuICAgICAgICA6IG5ld2VySUVVQS50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpIHx8XG4gICAgICAgICAgKG5hdmlnYXRvci51c2VyQWdlbnQubWF0Y2gob2xkZXJFZGdlVUEpIHx8IFtdKVsxXSA8IDEwNTQ3IHx8XG4gICAgICAgICAgKG5hdmlnYXRvci51c2VyQWdlbnQubWF0Y2god2Via2l0VUEpIHx8IFtdKVsxXSA8IDUzNyB8fFxuICAgICAgICAgIChlZGdlVUEudGVzdChuYXZpZ2F0b3IudXNlckFnZW50KSAmJiBpbklmcmFtZSk7XG4gICAgLy8gY3JlYXRlIHhociByZXF1ZXN0cyBvYmplY3RcbiAgICB2YXIgcmVxdWVzdHMgPSB7fSxcbiAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHwgc2V0VGltZW91dCxcbiAgICAgIHVzZXMgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZShcInVzZVwiKSxcbiAgICAgIG51bWJlck9mU3ZnVXNlRWxlbWVudHNUb0J5cGFzcyA9IDA7XG4gICAgLy8gY29uZGl0aW9uYWxseSBzdGFydCB0aGUgaW50ZXJ2YWwgaWYgdGhlIHBvbHlmaWxsIGlzIGFjdGl2ZVxuICAgIHBvbHlmaWxsICYmIG9uaW50ZXJ2YWwoKTtcbiAgfVxuICBmdW5jdGlvbiBnZXRTVkdBbmNlc3Rvcihub2RlKSB7XG4gICAgZm9yIChcbiAgICAgIHZhciBzdmcgPSBub2RlO1xuICAgICAgXCJzdmdcIiAhPT0gc3ZnLm5vZGVOYW1lLnRvTG93ZXJDYXNlKCkgJiYgKHN2ZyA9IHN2Zy5wYXJlbnROb2RlKTtcblxuICAgICkge31cbiAgICByZXR1cm4gc3ZnO1xuICB9XG4gIHJldHVybiBzdmc0ZXZlcnlib2R5O1xufSk7XG4iLCJ3aW5kb3cudXN3ZHNQcmVzZW50ID0gdHJ1ZTsgLy8gR0xPQkFMIHZhcmlhYmxlIHRvIGluZGljYXRlIHRoYXQgdGhlIHVzd2RzLmpzIGhhcyBsb2FkZWQgaW4gdGhlIERPTS5cblxuLyoqXG4gKiBUaGUgJ3BvbHlmaWxscycgZGVmaW5lIGtleSBFQ01BU2NyaXB0IDUgbWV0aG9kcyB0aGF0IG1heSBiZSBtaXNzaW5nIGZyb21cbiAqIG9sZGVyIGJyb3dzZXJzLCBzbyBtdXN0IGJlIGxvYWRlZCBmaXJzdC5cbiAqL1xucmVxdWlyZShcIi4vcG9seWZpbGxzXCIpO1xuXG5jb25zdCB1c3dkcyA9IHJlcXVpcmUoXCIuL2NvbmZpZ1wiKTtcblxuY29uc3QgY29tcG9uZW50cyA9IHJlcXVpcmUoXCIuL2luZGV4XCIpO1xuY29uc3Qgc3ZnNGV2ZXJ5Ym9keSA9IHJlcXVpcmUoXCIuL3BvbHlmaWxscy9zdmc0ZXZlcnlib2R5XCIpO1xuXG51c3dkcy5jb21wb25lbnRzID0gY29tcG9uZW50cztcblxuY29uc3QgaW5pdENvbXBvbmVudHMgPSAoKSA9PiB7XG4gIGNvbnN0IHRhcmdldCA9IGRvY3VtZW50LmJvZHk7XG4gIE9iamVjdC5rZXlzKGNvbXBvbmVudHMpLmZvckVhY2goKGtleSkgPT4ge1xuICAgIGNvbnN0IGJlaGF2aW9yID0gY29tcG9uZW50c1trZXldO1xuICAgIGJlaGF2aW9yLm9uKHRhcmdldCk7XG4gIH0pO1xuICBzdmc0ZXZlcnlib2R5KCk7XG59O1xuXG5pZiAoZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gXCJsb2FkaW5nXCIpIHtcbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIiwgaW5pdENvbXBvbmVudHMsIHsgb25jZTogdHJ1ZSB9KTtcbn0gZWxzZSB7XG4gIGluaXRDb21wb25lbnRzKCk7XG59XG5cbmV4cG9ydHMuZGVmYXVsdCA9IHVzd2RzO1xuZXhwb3J0cy5pbml0Q29tcG9uZW50cyA9IGluaXRDb21wb25lbnRzO1xuIiwibW9kdWxlLmV4cG9ydHMgPSAoaHRtbERvY3VtZW50ID0gZG9jdW1lbnQpID0+IGh0bWxEb2N1bWVudC5hY3RpdmVFbGVtZW50O1xuIiwiY29uc3QgYXNzaWduID0gcmVxdWlyZShcIm9iamVjdC1hc3NpZ25cIik7XG5jb25zdCBCZWhhdmlvciA9IHJlcXVpcmUoXCJyZWNlcHRvci9iZWhhdmlvclwiKTtcblxuLyoqXG4gKiBAbmFtZSBzZXF1ZW5jZVxuICogQHBhcmFtIHsuLi5GdW5jdGlvbn0gc2VxIGFuIGFycmF5IG9mIGZ1bmN0aW9uc1xuICogQHJldHVybiB7IGNsb3N1cmUgfSBjYWxsSG9va3NcbiAqL1xuLy8gV2UgdXNlIGEgbmFtZWQgZnVuY3Rpb24gaGVyZSBiZWNhdXNlIHdlIHdhbnQgaXQgdG8gaW5oZXJpdCBpdHMgbGV4aWNhbCBzY29wZVxuLy8gZnJvbSB0aGUgYmVoYXZpb3IgcHJvcHMgb2JqZWN0LCBub3QgZnJvbSB0aGUgbW9kdWxlXG5jb25zdCBzZXF1ZW5jZSA9ICguLi5zZXEpID0+XG4gIGZ1bmN0aW9uIGNhbGxIb29rcyh0YXJnZXQgPSBkb2N1bWVudC5ib2R5KSB7XG4gICAgc2VxLmZvckVhY2goKG1ldGhvZCkgPT4ge1xuICAgICAgaWYgKHR5cGVvZiB0aGlzW21ldGhvZF0gPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICB0aGlzW21ldGhvZF0uY2FsbCh0aGlzLCB0YXJnZXQpO1xuICAgICAgfVxuICAgIH0pO1xuICB9O1xuXG4vKipcbiAqIEBuYW1lIGJlaGF2aW9yXG4gKiBAcGFyYW0ge29iamVjdH0gZXZlbnRzXG4gKiBAcGFyYW0ge29iamVjdD99IHByb3BzXG4gKiBAcmV0dXJuIHtyZWNlcHRvci5iZWhhdmlvcn1cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSAoZXZlbnRzLCBwcm9wcykgPT5cbiAgQmVoYXZpb3IoXG4gICAgZXZlbnRzLFxuICAgIGFzc2lnbihcbiAgICAgIHtcbiAgICAgICAgb246IHNlcXVlbmNlKFwiaW5pdFwiLCBcImFkZFwiKSxcbiAgICAgICAgb2ZmOiBzZXF1ZW5jZShcInRlYXJkb3duXCIsIFwicmVtb3ZlXCIpLFxuICAgICAgfSxcbiAgICAgIHByb3BzXG4gICAgKVxuICApO1xuIiwiY29uc3QgYXNzaWduID0gcmVxdWlyZShcIm9iamVjdC1hc3NpZ25cIik7XG5jb25zdCB7IGtleW1hcCB9ID0gcmVxdWlyZShcInJlY2VwdG9yXCIpO1xuY29uc3QgYmVoYXZpb3IgPSByZXF1aXJlKFwiLi9iZWhhdmlvclwiKTtcbmNvbnN0IHNlbGVjdCA9IHJlcXVpcmUoXCIuL3NlbGVjdFwiKTtcbmNvbnN0IGFjdGl2ZUVsZW1lbnQgPSByZXF1aXJlKFwiLi9hY3RpdmUtZWxlbWVudFwiKTtcblxuY29uc3QgRk9DVVNBQkxFID1cbiAgJ2FbaHJlZl0sIGFyZWFbaHJlZl0sIGlucHV0Om5vdChbZGlzYWJsZWRdKSwgc2VsZWN0Om5vdChbZGlzYWJsZWRdKSwgdGV4dGFyZWE6bm90KFtkaXNhYmxlZF0pLCBidXR0b246bm90KFtkaXNhYmxlZF0pLCBpZnJhbWUsIG9iamVjdCwgZW1iZWQsIFt0YWJpbmRleD1cIjBcIl0sIFtjb250ZW50ZWRpdGFibGVdJztcblxuY29uc3QgdGFiSGFuZGxlciA9IChjb250ZXh0KSA9PiB7XG4gIGNvbnN0IGZvY3VzYWJsZUVsZW1lbnRzID0gc2VsZWN0KEZPQ1VTQUJMRSwgY29udGV4dCk7XG4gIGNvbnN0IGZpcnN0VGFiU3RvcCA9IGZvY3VzYWJsZUVsZW1lbnRzWzBdO1xuICBjb25zdCBsYXN0VGFiU3RvcCA9IGZvY3VzYWJsZUVsZW1lbnRzW2ZvY3VzYWJsZUVsZW1lbnRzLmxlbmd0aCAtIDFdO1xuXG4gIC8vIFNwZWNpYWwgcnVsZXMgZm9yIHdoZW4gdGhlIHVzZXIgaXMgdGFiYmluZyBmb3J3YXJkIGZyb20gdGhlIGxhc3QgZm9jdXNhYmxlIGVsZW1lbnQsXG4gIC8vIG9yIHdoZW4gdGFiYmluZyBiYWNrd2FyZHMgZnJvbSB0aGUgZmlyc3QgZm9jdXNhYmxlIGVsZW1lbnRcbiAgZnVuY3Rpb24gdGFiQWhlYWQoZXZlbnQpIHtcbiAgICBpZiAoYWN0aXZlRWxlbWVudCgpID09PSBsYXN0VGFiU3RvcCkge1xuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgIGZpcnN0VGFiU3RvcC5mb2N1cygpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHRhYkJhY2soZXZlbnQpIHtcbiAgICBpZiAoYWN0aXZlRWxlbWVudCgpID09PSBmaXJzdFRhYlN0b3ApIHtcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBsYXN0VGFiU3RvcC5mb2N1cygpO1xuICAgIH1cbiAgICAvLyBUaGlzIGNoZWNrcyBpZiB5b3Ugd2FudCB0byBzZXQgdGhlIGluaXRpYWwgZm9jdXMgdG8gYSBjb250YWluZXJcbiAgICAvLyBpbnN0ZWFkIG9mIGFuIGVsZW1lbnQgd2l0aGluLCBhbmQgdGhlIHVzZXIgdGFicyBiYWNrLlxuICAgIC8vIFRoZW4gd2Ugc2V0IHRoZSBmb2N1cyB0byB0aGUgZmlyc3RcbiAgICBlbHNlIGlmICghZm9jdXNhYmxlRWxlbWVudHMuaW5jbHVkZXMoYWN0aXZlRWxlbWVudCgpKSkge1xuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgIGZpcnN0VGFiU3RvcC5mb2N1cygpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB7XG4gICAgZmlyc3RUYWJTdG9wLFxuICAgIGxhc3RUYWJTdG9wLFxuICAgIHRhYkFoZWFkLFxuICAgIHRhYkJhY2ssXG4gIH07XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IChjb250ZXh0LCBhZGRpdGlvbmFsS2V5QmluZGluZ3MgPSB7fSkgPT4ge1xuICBjb25zdCB0YWJFdmVudEhhbmRsZXIgPSB0YWJIYW5kbGVyKGNvbnRleHQpO1xuICBjb25zdCBiaW5kaW5ncyA9IGFkZGl0aW9uYWxLZXlCaW5kaW5ncztcbiAgY29uc3QgeyBFc2MsIEVzY2FwZSB9ID0gYmluZGluZ3M7XG5cbiAgaWYgKEVzY2FwZSAmJiAhRXNjKSBiaW5kaW5ncy5Fc2MgPSBFc2NhcGU7XG5cbiAgLy8gIFRPRE86IEluIHRoZSBmdXR1cmUsIGxvb3Agb3ZlciBhZGRpdGlvbmFsIGtleWJpbmRpbmdzIGFuZCBwYXNzIGFuIGFycmF5XG4gIC8vIG9mIGZ1bmN0aW9ucywgaWYgbmVjZXNzYXJ5LCB0byB0aGUgbWFwIGtleXMuIFRoZW4gcGVvcGxlIGltcGxlbWVudGluZ1xuICAvLyB0aGUgZm9jdXMgdHJhcCBjb3VsZCBwYXNzIGNhbGxiYWNrcyB0byBmaXJlIHdoZW4gdGFiYmluZ1xuICBjb25zdCBrZXlNYXBwaW5ncyA9IGtleW1hcChcbiAgICBhc3NpZ24oXG4gICAgICB7XG4gICAgICAgIFRhYjogdGFiRXZlbnRIYW5kbGVyLnRhYkFoZWFkLFxuICAgICAgICBcIlNoaWZ0K1RhYlwiOiB0YWJFdmVudEhhbmRsZXIudGFiQmFjayxcbiAgICAgIH0sXG4gICAgICBhZGRpdGlvbmFsS2V5QmluZGluZ3NcbiAgICApXG4gICk7XG5cbiAgY29uc3QgZm9jdXNUcmFwID0gYmVoYXZpb3IoXG4gICAge1xuICAgICAga2V5ZG93bjoga2V5TWFwcGluZ3MsXG4gICAgfSxcbiAgICB7XG4gICAgICBpbml0KCkge1xuICAgICAgICAvLyBUT0RPOiBpcyB0aGlzIGRlc2lyZWFibGUgYmVoYXZpb3I/IFNob3VsZCB0aGUgdHJhcCBhbHdheXMgZG8gdGhpcyBieSBkZWZhdWx0IG9yIHNob3VsZFxuICAgICAgICAvLyB0aGUgY29tcG9uZW50IGdldHRpbmcgZGVjb3JhdGVkIGhhbmRsZSB0aGlzP1xuICAgICAgICBpZiAodGFiRXZlbnRIYW5kbGVyLmZpcnN0VGFiU3RvcCkge1xuICAgICAgICAgIHRhYkV2ZW50SGFuZGxlci5maXJzdFRhYlN0b3AuZm9jdXMoKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIHVwZGF0ZShpc0FjdGl2ZSkge1xuICAgICAgICBpZiAoaXNBY3RpdmUpIHtcbiAgICAgICAgICB0aGlzLm9uKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5vZmYoKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICB9XG4gICk7XG5cbiAgcmV0dXJuIGZvY3VzVHJhcDtcbn07XG4iLCIvLyBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL2EvNzU1NzQzM1xuZnVuY3Rpb24gaXNFbGVtZW50SW5WaWV3cG9ydChcbiAgZWwsXG4gIHdpbiA9IHdpbmRvdyxcbiAgZG9jRWwgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnRcbikge1xuICBjb25zdCByZWN0ID0gZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cbiAgcmV0dXJuIChcbiAgICByZWN0LnRvcCA+PSAwICYmXG4gICAgcmVjdC5sZWZ0ID49IDAgJiZcbiAgICByZWN0LmJvdHRvbSA8PSAod2luLmlubmVySGVpZ2h0IHx8IGRvY0VsLmNsaWVudEhlaWdodCkgJiZcbiAgICByZWN0LnJpZ2h0IDw9ICh3aW4uaW5uZXJXaWR0aCB8fCBkb2NFbC5jbGllbnRXaWR0aClcbiAgKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc0VsZW1lbnRJblZpZXdwb3J0O1xuIiwiLy8gaU9TIGRldGVjdGlvbiBmcm9tOiBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS85MDM5ODg1LzE3NzcxMFxuZnVuY3Rpb24gaXNJb3NEZXZpY2UoKSB7XG4gIHJldHVybiAoXG4gICAgdHlwZW9mIG5hdmlnYXRvciAhPT0gXCJ1bmRlZmluZWRcIiAmJlxuICAgIChuYXZpZ2F0b3IudXNlckFnZW50Lm1hdGNoKC8oaVBvZHxpUGhvbmV8aVBhZCkvZykgfHxcbiAgICAgIChuYXZpZ2F0b3IucGxhdGZvcm0gPT09IFwiTWFjSW50ZWxcIiAmJiBuYXZpZ2F0b3IubWF4VG91Y2hQb2ludHMgPiAxKSkgJiZcbiAgICAhd2luZG93Lk1TU3RyZWFtXG4gICk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNJb3NEZXZpY2U7XG4iLCIvKiBlc2xpbnQtZGlzYWJsZSAqL1xuLyogZ2xvYmFscyBkZWZpbmUsIG1vZHVsZSAqL1xuXG4vKipcbiAqIEEgc2ltcGxlIGxpYnJhcnkgdG8gaGVscCB5b3UgZXNjYXBlIEhUTUwgdXNpbmcgdGVtcGxhdGUgc3RyaW5ncy5cbiAqXG4gKiBJdCdzIHRoZSBjb3VudGVycGFydCB0byBvdXIgZXNsaW50IFwibm8tdW5zYWZlLWlubmVyaHRtbFwiIHBsdWdpbiB0aGF0IGhlbHBzIHVzXG4gKiBhdm9pZCB1bnNhZmUgY29kaW5nIHByYWN0aWNlcy5cbiAqIEEgZnVsbCB3cml0ZS11cCBvZiB0aGUgSG93cyBhbmQgV2h5cyBhcmUgZG9jdW1lbnRlZFxuICogZm9yIGRldmVsb3BlcnMgYXRcbiAqICBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9GaXJlZm94X09TL1NlY3VyaXR5L1NlY3VyaXR5X0F1dG9tYXRpb25cbiAqIHdpdGggYWRkaXRpb25hbCBiYWNrZ3JvdW5kIGluZm9ybWF0aW9uIGFuZCBkZXNpZ24gZG9jcyBhdFxuICogIGh0dHBzOi8vd2lraS5tb3ppbGxhLm9yZy9Vc2VyOkZicmF1bi9HYWlhL1NhZmVpbm5lckhUTUxSb2FkbWFwXG4gKlxuICovXG5cbiEoZnVuY3Rpb24gKGZhY3RvcnkpIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7XG59KShmdW5jdGlvbiAoKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICB2YXIgU2FuaXRpemVyID0ge1xuICAgIF9lbnRpdHk6IC9bJjw+XCInL10vZyxcblxuICAgIF9lbnRpdGllczoge1xuICAgICAgJyYnOiAnJmFtcDsnLFxuICAgICAgJzwnOiAnJmx0OycsXG4gICAgICAnPic6ICcmZ3Q7JyxcbiAgICAgICdcIic6ICcmcXVvdDsnLFxuICAgICAgJ1xcJyc6ICcmYXBvczsnLFxuICAgICAgJy8nOiAnJiN4MkY7J1xuICAgIH0sXG5cbiAgICBnZXRFbnRpdHk6IGZ1bmN0aW9uIChzKSB7XG4gICAgICByZXR1cm4gU2FuaXRpemVyLl9lbnRpdGllc1tzXTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRXNjYXBlcyBIVE1MIGZvciBhbGwgdmFsdWVzIGluIGEgdGFnZ2VkIHRlbXBsYXRlIHN0cmluZy5cbiAgICAgKi9cbiAgICBlc2NhcGVIVE1MOiBmdW5jdGlvbiAoc3RyaW5ncykge1xuICAgICAgdmFyIHJlc3VsdCA9ICcnO1xuXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHN0cmluZ3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgcmVzdWx0ICs9IHN0cmluZ3NbaV07XG4gICAgICAgIGlmIChpICsgMSA8IGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgICAgICB2YXIgdmFsdWUgPSBhcmd1bWVudHNbaSArIDFdIHx8ICcnO1xuICAgICAgICAgIHJlc3VsdCArPSBTdHJpbmcodmFsdWUpLnJlcGxhY2UoU2FuaXRpemVyLl9lbnRpdHksXG4gICAgICAgICAgICBTYW5pdGl6ZXIuZ2V0RW50aXR5KTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogRXNjYXBlcyBIVE1MIGFuZCByZXR1cm5zIGEgd3JhcHBlZCBvYmplY3QgdG8gYmUgdXNlZCBkdXJpbmcgRE9NIGluc2VydGlvblxuICAgICAqL1xuICAgIGNyZWF0ZVNhZmVIVE1MOiBmdW5jdGlvbiAoc3RyaW5ncykge1xuICAgICAgdmFyIF9sZW4gPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgICAgdmFyIHZhbHVlcyA9IG5ldyBBcnJheShfbGVuID4gMSA/IF9sZW4gLSAxIDogMCk7XG4gICAgICBmb3IgKHZhciBfa2V5ID0gMTsgX2tleSA8IF9sZW47IF9rZXkrKykge1xuICAgICAgICB2YWx1ZXNbX2tleSAtIDFdID0gYXJndW1lbnRzW19rZXldO1xuICAgICAgfVxuXG4gICAgICB2YXIgZXNjYXBlZCA9IFNhbml0aXplci5lc2NhcGVIVE1MLmFwcGx5KFNhbml0aXplcixcbiAgICAgICAgW3N0cmluZ3NdLmNvbmNhdCh2YWx1ZXMpKTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIF9faHRtbDogZXNjYXBlZCxcbiAgICAgICAgdG9TdHJpbmc6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICByZXR1cm4gJ1tvYmplY3QgV3JhcHBlZEhUTUxPYmplY3RdJztcbiAgICAgICAgfSxcbiAgICAgICAgaW5mbzogJ1RoaXMgaXMgYSB3cmFwcGVkIEhUTUwgb2JqZWN0LiBTZWUgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcicrXG4gICAgICAgICAgJ2cvZW4tVVMvRmlyZWZveF9PUy9TZWN1cml0eS9TZWN1cml0eV9BdXRvbWF0aW9uIGZvciBtb3JlLidcbiAgICAgIH07XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBVbndyYXAgc2FmZSBIVE1MIGNyZWF0ZWQgYnkgY3JlYXRlU2FmZUhUTUwgb3IgYSBjdXN0b20gcmVwbGFjZW1lbnQgdGhhdFxuICAgICAqIHVuZGVyd2VudCBzZWN1cml0eSByZXZpZXcuXG4gICAgICovXG4gICAgdW53cmFwU2FmZUhUTUw6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBfbGVuID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICAgIHZhciBodG1sT2JqZWN0cyA9IG5ldyBBcnJheShfbGVuKTtcbiAgICAgIGZvciAodmFyIF9rZXkgPSAwOyBfa2V5IDwgX2xlbjsgX2tleSsrKSB7XG4gICAgICAgIGh0bWxPYmplY3RzW19rZXldID0gYXJndW1lbnRzW19rZXldO1xuICAgICAgfVxuXG4gICAgICB2YXIgbWFya3VwTGlzdCA9IGh0bWxPYmplY3RzLm1hcChmdW5jdGlvbihvYmopIHtcbiAgICAgICAgcmV0dXJuIG9iai5fX2h0bWw7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBtYXJrdXBMaXN0LmpvaW4oJycpO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gU2FuaXRpemVyO1xuXG59KTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZ2V0U2Nyb2xsYmFyV2lkdGgoKSB7XG4gIC8vIENyZWF0aW5nIGludmlzaWJsZSBjb250YWluZXJcbiAgY29uc3Qgb3V0ZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgb3V0ZXIuc3R5bGUudmlzaWJpbGl0eSA9ICdoaWRkZW4nO1xuICBvdXRlci5zdHlsZS5vdmVyZmxvdyA9ICdzY3JvbGwnOyAvLyBmb3JjaW5nIHNjcm9sbGJhciB0byBhcHBlYXJcbiAgb3V0ZXIuc3R5bGUubXNPdmVyZmxvd1N0eWxlID0gJ3Njcm9sbGJhcic7IC8vIG5lZWRlZCBmb3IgV2luSlMgYXBwc1xuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKG91dGVyKTtcblxuICAvLyBDcmVhdGluZyBpbm5lciBlbGVtZW50IGFuZCBwbGFjaW5nIGl0IGluIHRoZSBjb250YWluZXJcbiAgY29uc3QgaW5uZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgb3V0ZXIuYXBwZW5kQ2hpbGQoaW5uZXIpO1xuICBcbiAgLy8gQ2FsY3VsYXRpbmcgZGlmZmVyZW5jZSBiZXR3ZWVuIGNvbnRhaW5lcidzIGZ1bGwgd2lkdGggYW5kIHRoZSBjaGlsZCB3aWR0aFxuICBjb25zdCBzY3JvbGxiYXJXaWR0aCA9IGAkeyhvdXRlci5vZmZzZXRXaWR0aCAtIGlubmVyLm9mZnNldFdpZHRoKX1weGA7XG5cbiAgLy8gUmVtb3ZpbmcgdGVtcG9yYXJ5IGVsZW1lbnRzIGZyb20gdGhlIERPTVxuICBvdXRlci5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKG91dGVyKTtcblxuICByZXR1cm4gc2Nyb2xsYmFyV2lkdGg7XG59O1xuIiwiY29uc3Qgc2VsZWN0ID0gcmVxdWlyZShcIi4vc2VsZWN0XCIpO1xuLyoqXG4gKiBAbmFtZSBpc0VsZW1lbnRcbiAqIEBkZXNjIHJldHVybnMgd2hldGhlciBvciBub3QgdGhlIGdpdmVuIGFyZ3VtZW50IGlzIGEgRE9NIGVsZW1lbnQuXG4gKiBAcGFyYW0ge2FueX0gdmFsdWVcbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKi9cbmNvbnN0IGlzRWxlbWVudCA9ICh2YWx1ZSkgPT5cbiAgdmFsdWUgJiYgdHlwZW9mIHZhbHVlID09PSBcIm9iamVjdFwiICYmIHZhbHVlLm5vZGVUeXBlID09PSAxO1xuXG4vKipcbiAqIEBuYW1lIHNlbGVjdE9yTWF0Y2hlc1xuICogQGRlc2Mgc2VsZWN0cyBlbGVtZW50cyBmcm9tIHRoZSBET00gYnkgY2xhc3Mgc2VsZWN0b3Igb3IgSUQgc2VsZWN0b3IuXG4gKiBAcGFyYW0ge3N0cmluZ30gc2VsZWN0b3IgLSBUaGUgc2VsZWN0b3IgdG8gdHJhdmVyc2UgdGhlIERPTSB3aXRoLlxuICogQHBhcmFtIHtEb2N1bWVudHxIVE1MRWxlbWVudD99IGNvbnRleHQgLSBUaGUgY29udGV4dCB0byB0cmF2ZXJzZSB0aGUgRE9NXG4gKiAgIGluLiBJZiBub3QgcHJvdmlkZWQsIGl0IGRlZmF1bHRzIHRvIHRoZSBkb2N1bWVudC5cbiAqIEByZXR1cm4ge0hUTUxFbGVtZW50W119IC0gQW4gYXJyYXkgb2YgRE9NIG5vZGVzIG9yIGFuIGVtcHR5IGFycmF5LlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IChzZWxlY3RvciwgY29udGV4dCkgPT4ge1xuICBjb25zdCBzZWxlY3Rpb24gPSBzZWxlY3Qoc2VsZWN0b3IsIGNvbnRleHQpO1xuICBpZiAodHlwZW9mIHNlbGVjdG9yICE9PSBcInN0cmluZ1wiKSB7XG4gICAgcmV0dXJuIHNlbGVjdGlvbjtcbiAgfVxuXG4gIGlmIChpc0VsZW1lbnQoY29udGV4dCkgJiYgY29udGV4dC5tYXRjaGVzKHNlbGVjdG9yKSkge1xuICAgIHNlbGVjdGlvbi5wdXNoKGNvbnRleHQpO1xuICB9XG5cbiAgcmV0dXJuIHNlbGVjdGlvbjtcbn07XG4iLCIvKipcbiAqIEBuYW1lIGlzRWxlbWVudFxuICogQGRlc2MgcmV0dXJucyB3aGV0aGVyIG9yIG5vdCB0aGUgZ2l2ZW4gYXJndW1lbnQgaXMgYSBET00gZWxlbWVudC5cbiAqIEBwYXJhbSB7YW55fSB2YWx1ZVxuICogQHJldHVybiB7Ym9vbGVhbn1cbiAqL1xuY29uc3QgaXNFbGVtZW50ID0gKHZhbHVlKSA9PlxuICB2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT09IFwib2JqZWN0XCIgJiYgdmFsdWUubm9kZVR5cGUgPT09IDE7XG5cbi8qKlxuICogQG5hbWUgc2VsZWN0XG4gKiBAZGVzYyBzZWxlY3RzIGVsZW1lbnRzIGZyb20gdGhlIERPTSBieSBjbGFzcyBzZWxlY3RvciBvciBJRCBzZWxlY3Rvci5cbiAqIEBwYXJhbSB7c3RyaW5nfSBzZWxlY3RvciAtIFRoZSBzZWxlY3RvciB0byB0cmF2ZXJzZSB0aGUgRE9NIHdpdGguXG4gKiBAcGFyYW0ge0RvY3VtZW50fEhUTUxFbGVtZW50P30gY29udGV4dCAtIFRoZSBjb250ZXh0IHRvIHRyYXZlcnNlIHRoZSBET01cbiAqICAgaW4uIElmIG5vdCBwcm92aWRlZCwgaXQgZGVmYXVsdHMgdG8gdGhlIGRvY3VtZW50LlxuICogQHJldHVybiB7SFRNTEVsZW1lbnRbXX0gLSBBbiBhcnJheSBvZiBET00gbm9kZXMgb3IgYW4gZW1wdHkgYXJyYXkuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gKHNlbGVjdG9yLCBjb250ZXh0KSA9PiB7XG4gIGlmICh0eXBlb2Ygc2VsZWN0b3IgIT09IFwic3RyaW5nXCIpIHtcbiAgICByZXR1cm4gW107XG4gIH1cblxuICBpZiAoIWNvbnRleHQgfHwgIWlzRWxlbWVudChjb250ZXh0KSkge1xuICAgIGNvbnRleHQgPSB3aW5kb3cuZG9jdW1lbnQ7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tcGFyYW0tcmVhc3NpZ25cbiAgfVxuXG4gIGNvbnN0IHNlbGVjdGlvbiA9IGNvbnRleHQucXVlcnlTZWxlY3RvckFsbChzZWxlY3Rvcik7XG4gIHJldHVybiBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChzZWxlY3Rpb24pO1xufTtcbiIsIi8qKlxuICogRmxpcHMgZ2l2ZW4gSU5QVVQgZWxlbWVudHMgYmV0d2VlbiBtYXNrZWQgKGhpZGluZyB0aGUgZmllbGQgdmFsdWUpIGFuZCB1bm1hc2tlZFxuICogQHBhcmFtIHtBcnJheS5IVE1MRWxlbWVudH0gZmllbGRzIC0gQW4gYXJyYXkgb2YgSU5QVVQgZWxlbWVudHNcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gbWFzayAtIFdoZXRoZXIgdGhlIG1hc2sgc2hvdWxkIGJlIGFwcGxpZWQsIGhpZGluZyB0aGUgZmllbGQgdmFsdWVcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSAoZmllbGQsIG1hc2spID0+IHtcbiAgZmllbGQuc2V0QXR0cmlidXRlKFwiYXV0b2NhcGl0YWxpemVcIiwgXCJvZmZcIik7XG4gIGZpZWxkLnNldEF0dHJpYnV0ZShcImF1dG9jb3JyZWN0XCIsIFwib2ZmXCIpO1xuICBmaWVsZC5zZXRBdHRyaWJ1dGUoXCJ0eXBlXCIsIG1hc2sgPyBcInBhc3N3b3JkXCIgOiBcInRleHRcIik7XG59O1xuIiwiY29uc3QgcmVzb2x2ZUlkUmVmcyA9IHJlcXVpcmUoXCJyZXNvbHZlLWlkLXJlZnNcIik7XG5jb25zdCB0b2dnbGVGaWVsZE1hc2sgPSByZXF1aXJlKFwiLi90b2dnbGUtZmllbGQtbWFza1wiKTtcblxuY29uc3QgQ09OVFJPTFMgPSBcImFyaWEtY29udHJvbHNcIjtcbmNvbnN0IFBSRVNTRUQgPSBcImFyaWEtcHJlc3NlZFwiO1xuY29uc3QgU0hPV19BVFRSID0gXCJkYXRhLXNob3ctdGV4dFwiO1xuY29uc3QgSElERV9BVFRSID0gXCJkYXRhLWhpZGUtdGV4dFwiO1xuXG4vKipcbiAqIFJlcGxhY2UgdGhlIHdvcmQgXCJTaG93XCIgKG9yIFwic2hvd1wiKSB3aXRoIFwiSGlkZVwiIChvciBcImhpZGVcIikgaW4gYSBzdHJpbmcuXG4gKiBAcGFyYW0ge3N0cmluZ30gc2hvd1RleHRcbiAqIEByZXR1cm4ge3N0cm9uZ30gaGlkZVRleHRcbiAqL1xuY29uc3QgZ2V0SGlkZVRleHQgPSAoc2hvd1RleHQpID0+XG4gIHNob3dUZXh0LnJlcGxhY2UoL1xcYlNob3dcXGIvaSwgKHNob3cpID0+IGAke3Nob3dbMF0gPT09IFwiU1wiID8gXCJIXCIgOiBcImhcIn1pZGVgKTtcblxuLyoqXG4gKiBDb21wb25lbnQgdGhhdCBkZWNvcmF0ZXMgYW4gSFRNTCBlbGVtZW50IHdpdGggdGhlIGFiaWxpdHkgdG8gdG9nZ2xlIHRoZVxuICogbWFza2VkIHN0YXRlIG9mIGFuIGlucHV0IGZpZWxkIChsaWtlIGEgcGFzc3dvcmQpIHdoZW4gY2xpY2tlZC5cbiAqIFRoZSBpZHMgb2YgdGhlIGZpZWxkcyB0byBiZSBtYXNrZWQgd2lsbCBiZSBwdWxsZWQgZGlyZWN0bHkgZnJvbSB0aGUgYnV0dG9uJ3NcbiAqIGBhcmlhLWNvbnRyb2xzYCBhdHRyaWJ1dGUuXG4gKlxuICogQHBhcmFtICB7SFRNTEVsZW1lbnR9IGVsICAgIFBhcmVudCBlbGVtZW50IGNvbnRhaW5pbmcgdGhlIGZpZWxkcyB0byBiZSBtYXNrZWRcbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gKGVsKSA9PiB7XG4gIC8vIHRoaXMgaXMgdGhlICp0YXJnZXQqIHN0YXRlOlxuICAvLyAqIGlmIHRoZSBlbGVtZW50IGhhcyB0aGUgYXR0ciBhbmQgaXQncyAhPT0gXCJ0cnVlXCIsIHByZXNzZWQgaXMgdHJ1ZVxuICAvLyAqIG90aGVyd2lzZSwgcHJlc3NlZCBpcyBmYWxzZVxuICBjb25zdCBwcmVzc2VkID1cbiAgICBlbC5oYXNBdHRyaWJ1dGUoUFJFU1NFRCkgJiYgZWwuZ2V0QXR0cmlidXRlKFBSRVNTRUQpICE9PSBcInRydWVcIjtcblxuICBjb25zdCBmaWVsZHMgPSByZXNvbHZlSWRSZWZzKGVsLmdldEF0dHJpYnV0ZShDT05UUk9MUykpO1xuICBmaWVsZHMuZm9yRWFjaCgoZmllbGQpID0+IHRvZ2dsZUZpZWxkTWFzayhmaWVsZCwgcHJlc3NlZCkpO1xuXG4gIGlmICghZWwuaGFzQXR0cmlidXRlKFNIT1dfQVRUUikpIHtcbiAgICBlbC5zZXRBdHRyaWJ1dGUoU0hPV19BVFRSLCBlbC50ZXh0Q29udGVudCk7XG4gIH1cblxuICBjb25zdCBzaG93VGV4dCA9IGVsLmdldEF0dHJpYnV0ZShTSE9XX0FUVFIpO1xuICBjb25zdCBoaWRlVGV4dCA9IGVsLmdldEF0dHJpYnV0ZShISURFX0FUVFIpIHx8IGdldEhpZGVUZXh0KHNob3dUZXh0KTtcblxuICBlbC50ZXh0Q29udGVudCA9IHByZXNzZWQgPyBzaG93VGV4dCA6IGhpZGVUZXh0OyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXBhcmFtLXJlYXNzaWduXG4gIGVsLnNldEF0dHJpYnV0ZShQUkVTU0VELCBwcmVzc2VkKTtcbiAgcmV0dXJuIHByZXNzZWQ7XG59O1xuIiwiY29uc3QgRVhQQU5ERUQgPSBcImFyaWEtZXhwYW5kZWRcIjtcbmNvbnN0IENPTlRST0xTID0gXCJhcmlhLWNvbnRyb2xzXCI7XG5jb25zdCBISURERU4gPSBcImhpZGRlblwiO1xuXG5tb2R1bGUuZXhwb3J0cyA9IChidXR0b24sIGV4cGFuZGVkKSA9PiB7XG4gIGxldCBzYWZlRXhwYW5kZWQgPSBleHBhbmRlZDtcblxuICBpZiAodHlwZW9mIHNhZmVFeHBhbmRlZCAhPT0gXCJib29sZWFuXCIpIHtcbiAgICBzYWZlRXhwYW5kZWQgPSBidXR0b24uZ2V0QXR0cmlidXRlKEVYUEFOREVEKSA9PT0gXCJmYWxzZVwiO1xuICB9XG5cbiAgYnV0dG9uLnNldEF0dHJpYnV0ZShFWFBBTkRFRCwgc2FmZUV4cGFuZGVkKTtcblxuICBjb25zdCBpZCA9IGJ1dHRvbi5nZXRBdHRyaWJ1dGUoQ09OVFJPTFMpO1xuICBjb25zdCBjb250cm9scyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKTtcbiAgaWYgKCFjb250cm9scykge1xuICAgIHRocm93IG5ldyBFcnJvcihgTm8gdG9nZ2xlIHRhcmdldCBmb3VuZCB3aXRoIGlkOiBcIiR7aWR9XCJgKTtcbiAgfVxuXG4gIGlmIChzYWZlRXhwYW5kZWQpIHtcbiAgICBjb250cm9scy5yZW1vdmVBdHRyaWJ1dGUoSElEREVOKTtcbiAgfSBlbHNlIHtcbiAgICBjb250cm9scy5zZXRBdHRyaWJ1dGUoSElEREVOLCBcIlwiKTtcbiAgfVxuXG4gIHJldHVybiBzYWZlRXhwYW5kZWQ7XG59O1xuIiwiY29uc3QgeyBwcmVmaXg6IFBSRUZJWCB9ID0gcmVxdWlyZShcIi4uL2NvbmZpZ1wiKTtcblxuY29uc3QgQ0hFQ0tFRCA9IFwiYXJpYS1jaGVja2VkXCI7XG5jb25zdCBDSEVDS0VEX0NMQVNTID0gYCR7UFJFRklYfS1jaGVja2xpc3RfX2l0ZW0tLWNoZWNrZWRgO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHZhbGlkYXRlKGVsKSB7XG4gIGNvbnN0IGlkID0gZWwuZGF0YXNldC52YWxpZGF0aW9uRWxlbWVudDtcbiAgY29uc3QgY2hlY2tMaXN0ID1cbiAgICBpZC5jaGFyQXQoMCkgPT09IFwiI1wiXG4gICAgICA/IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoaWQpXG4gICAgICA6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKTtcblxuICBpZiAoIWNoZWNrTGlzdCkge1xuICAgIHRocm93IG5ldyBFcnJvcihgTm8gdmFsaWRhdGlvbiBlbGVtZW50IGZvdW5kIHdpdGggaWQ6IFwiJHtpZH1cImApO1xuICB9XG5cbiAgT2JqZWN0LmVudHJpZXMoZWwuZGF0YXNldCkuZm9yRWFjaCgoW2tleSwgdmFsdWVdKSA9PiB7XG4gICAgaWYgKGtleS5zdGFydHNXaXRoKFwidmFsaWRhdGVcIikpIHtcbiAgICAgIGNvbnN0IHZhbGlkYXRvck5hbWUgPSBrZXkuc3Vic3RyKFwidmFsaWRhdGVcIi5sZW5ndGgpLnRvTG93ZXJDYXNlKCk7XG4gICAgICBjb25zdCB2YWxpZGF0b3JQYXR0ZXJuID0gbmV3IFJlZ0V4cCh2YWx1ZSk7XG4gICAgICBjb25zdCB2YWxpZGF0b3JTZWxlY3RvciA9IGBbZGF0YS12YWxpZGF0b3I9XCIke3ZhbGlkYXRvck5hbWV9XCJdYDtcbiAgICAgIGNvbnN0IHZhbGlkYXRvckNoZWNrYm94ID0gY2hlY2tMaXN0LnF1ZXJ5U2VsZWN0b3IodmFsaWRhdG9yU2VsZWN0b3IpO1xuXG4gICAgICBpZiAoIXZhbGlkYXRvckNoZWNrYm94KSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgTm8gdmFsaWRhdG9yIGNoZWNrYm94IGZvdW5kIGZvcjogXCIke3ZhbGlkYXRvck5hbWV9XCJgKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgY2hlY2tlZCA9IHZhbGlkYXRvclBhdHRlcm4udGVzdChlbC52YWx1ZSk7XG4gICAgICB2YWxpZGF0b3JDaGVja2JveC5jbGFzc0xpc3QudG9nZ2xlKENIRUNLRURfQ0xBU1MsIGNoZWNrZWQpO1xuICAgICAgdmFsaWRhdG9yQ2hlY2tib3guc2V0QXR0cmlidXRlKENIRUNLRUQsIGNoZWNrZWQpO1xuICAgIH1cbiAgfSk7XG59O1xuIl19
