!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.ReactTypeahead=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*!
  Copyright (c) 2015 Jed Watson.
  Licensed under the MIT License (MIT), see
  http://jedwatson.github.io/classnames
*/

function classNames() {
	var classes = '';
	var arg;

	for (var i = 0; i < arguments.length; i++) {
		arg = arguments[i];
		if (!arg) {
			continue;
		}

		if ('string' === typeof arg || 'number' === typeof arg) {
			classes += ' ' + arg;
		} else if (Object.prototype.toString.call(arg) === '[object Array]') {
			classes += ' ' + classNames.apply(null, arg);
		} else if ('object' === typeof arg) {
			for (var key in arg) {
				if (!arg.hasOwnProperty(key) || !arg[key]) {
					continue;
				}
				classes += ' ' + key;
			}
		}
	}
	return classes.substr(1);
}

// safely export classNames for node / browserify
if (typeof module !== 'undefined' && module.exports) {
	module.exports = classNames;
}

// safely export classNames for RequireJS
if (typeof define !== 'undefined' && define.amd) {
	define('classnames', [], function() {
		return classNames;
	});
}

},{}],2:[function(require,module,exports){
/*
 * Fuzzy
 * https://github.com/myork/fuzzy
 *
 * Copyright (c) 2012 Matt York
 * Licensed under the MIT license.
 */

(function() {

var root = this;

var fuzzy = {};

// Use in node or in browser
if (typeof exports !== 'undefined') {
  module.exports = fuzzy;
} else {
  root.fuzzy = fuzzy;
}

// Return all elements of `array` that have a fuzzy
// match against `pattern`.
fuzzy.simpleFilter = function(pattern, array) {
  return array.filter(function(str) {
    return fuzzy.test(pattern, str);
  });
};

// Does `pattern` fuzzy match `str`?
fuzzy.test = function(pattern, str) {
  return fuzzy.match(pattern, str) !== null;
};

// If `pattern` matches `str`, wrap each matching character
// in `opts.pre` and `opts.post`. If no match, return null
fuzzy.match = function(pattern, str, opts) {
  opts = opts || {};
  var patternIdx = 0
    , result = []
    , len = str.length
    , totalScore = 0
    , currScore = 0
    // prefix
    , pre = opts.pre || ''
    // suffix
    , post = opts.post || ''
    // String to compare against. This might be a lowercase version of the
    // raw string
    , compareString =  opts.caseSensitive && str || str.toLowerCase()
    , ch;

  pattern = opts.caseSensitive && pattern || pattern.toLowerCase();

  // For each character in the string, either add it to the result
  // or wrap in template if it's the next string in the pattern
  for(var idx = 0; idx < len; idx++) {
    ch = str[idx];
    if(compareString[idx] === pattern[patternIdx]) {
      ch = pre + ch + post;
      patternIdx += 1;

      // consecutive characters should increase the score more than linearly
      currScore += 1 + currScore;
    } else {
      currScore = 0;
    }
    totalScore += currScore;
    result[result.length] = ch;
  }

  // return rendered string if we have a match for every char
  if(patternIdx === pattern.length) {
    // if the string is an exact match with pattern, totalScore should be maxed
    totalScore = (compareString === pattern) ? Infinity : totalScore;
    return {rendered: result.join(''), score: totalScore};
  }

  return null;
};

// The normal entry point. Filters `arr` for matches against `pattern`.
// It returns an array with matching values of the type:
//
//     [{
//         string:   '<b>lah' // The rendered string
//       , index:    2        // The index of the element in `arr`
//       , original: 'blah'   // The original element in `arr`
//     }]
//
// `opts` is an optional argument bag. Details:
//
//    opts = {
//        // string to put before a matching character
//        pre:     '<b>'
//
//        // string to put after matching character
//      , post:    '</b>'
//
//        // Optional function. Input is an entry in the given arr`,
//        // output should be the string to test `pattern` against.
//        // In this example, if `arr = [{crying: 'koala'}]` we would return
//        // 'koala'.
//      , extract: function(arg) { return arg.crying; }
//    }
fuzzy.filter = function(pattern, arr, opts) {
  if(!arr || arr.length === 0) {
    return [];
  }
  if (typeof pattern !== 'string') {
    return arr;
  }
  opts = opts || {};
  return arr
    .reduce(function(prev, element, idx, arr) {
      var str = element;
      if(opts.extract) {
        str = opts.extract(element);
      }
      var rendered = fuzzy.match(pattern, str, opts);
      if(rendered != null) {
        prev[prev.length] = {
            string: rendered.rendered
          , score: rendered.score
          , index: idx
          , original: element
        };
      }
      return prev;
    }, [])

    // Sort by score. Browsers are inconsistent wrt stable/unstable
    // sorting, so force stable by using the index in the case of tie.
    // See http://ofb.net/~sethml/is-sort-stable.html
    .sort(function(a,b) {
      var compare = b.score - a.score;
      if(compare) return compare;
      return a.index - b.index;
    });
};


}());


},{}],3:[function(require,module,exports){
var Accessor = {
  IDENTITY_FN: function (input) {
    return input;
  },

  generateAccessor: function (field) {
    return function (object) {
      return object[field];
    };
  },

  generateOptionToStringFor: function (prop) {
    if (typeof prop === 'string') {
      return this.generateAccessor(prop);
    } else if (typeof prop === 'function') {
      return prop;
    } else {
      return this.IDENTITY_FN;
    }
  },

  valueForOption: function (option, object) {
    if (typeof option === 'string') {
      return object[option];
    } else if (typeof option === 'function') {
      return option(object);
    } else {
      return object;
    }
  }
};

module.exports = Accessor;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFjY2Vzc29yLmpzIl0sIm5hbWVzIjpbIkFjY2Vzc29yIiwiSURFTlRJVFlfRk4iLCJpbnB1dCIsImdlbmVyYXRlQWNjZXNzb3IiLCJmaWVsZCIsIm9iamVjdCIsImdlbmVyYXRlT3B0aW9uVG9TdHJpbmdGb3IiLCJwcm9wIiwidmFsdWVGb3JPcHRpb24iLCJvcHRpb24iLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiQUFBQSxJQUFJQSxXQUFXO0FBQ2JDLGVBQWEsVUFBU0MsS0FBVCxFQUFnQjtBQUFFLFdBQU9BLEtBQVA7QUFBZSxHQURqQzs7QUFHYkMsb0JBQWtCLFVBQVNDLEtBQVQsRUFBZ0I7QUFDaEMsV0FBTyxVQUFTQyxNQUFULEVBQWlCO0FBQUUsYUFBT0EsT0FBT0QsS0FBUCxDQUFQO0FBQXVCLEtBQWpEO0FBQ0QsR0FMWTs7QUFPYkUsNkJBQTJCLFVBQVNDLElBQVQsRUFBZTtBQUN4QyxRQUFJLE9BQU9BLElBQVAsS0FBZ0IsUUFBcEIsRUFBOEI7QUFDNUIsYUFBTyxLQUFLSixnQkFBTCxDQUFzQkksSUFBdEIsQ0FBUDtBQUNELEtBRkQsTUFFTyxJQUFJLE9BQU9BLElBQVAsS0FBZ0IsVUFBcEIsRUFBZ0M7QUFDckMsYUFBT0EsSUFBUDtBQUNELEtBRk0sTUFFQTtBQUNMLGFBQU8sS0FBS04sV0FBWjtBQUNEO0FBQ0YsR0FmWTs7QUFpQmJPLGtCQUFnQixVQUFTQyxNQUFULEVBQWlCSixNQUFqQixFQUF5QjtBQUN2QyxRQUFJLE9BQU9JLE1BQVAsS0FBa0IsUUFBdEIsRUFBZ0M7QUFDOUIsYUFBT0osT0FBT0ksTUFBUCxDQUFQO0FBQ0QsS0FGRCxNQUVPLElBQUksT0FBT0EsTUFBUCxLQUFrQixVQUF0QixFQUFrQztBQUN2QyxhQUFPQSxPQUFPSixNQUFQLENBQVA7QUFDRCxLQUZNLE1BRUE7QUFDTCxhQUFPQSxNQUFQO0FBQ0Q7QUFDRjtBQXpCWSxDQUFmOztBQTRCQUssT0FBT0MsT0FBUCxHQUFpQlgsUUFBakIiLCJmaWxlIjoiYWNjZXNzb3IuanMiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgQWNjZXNzb3IgPSB7XG4gIElERU5USVRZX0ZOOiBmdW5jdGlvbihpbnB1dCkgeyByZXR1cm4gaW5wdXQ7IH0sXG5cbiAgZ2VuZXJhdGVBY2Nlc3NvcjogZnVuY3Rpb24oZmllbGQpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24ob2JqZWN0KSB7IHJldHVybiBvYmplY3RbZmllbGRdOyB9O1xuICB9LFxuXG4gIGdlbmVyYXRlT3B0aW9uVG9TdHJpbmdGb3I6IGZ1bmN0aW9uKHByb3ApIHtcbiAgICBpZiAodHlwZW9mIHByb3AgPT09ICdzdHJpbmcnKSB7XG4gICAgICByZXR1cm4gdGhpcy5nZW5lcmF0ZUFjY2Vzc29yKHByb3ApO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIHByb3AgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiBwcm9wO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5JREVOVElUWV9GTjtcbiAgICB9XG4gIH0sXG5cbiAgdmFsdWVGb3JPcHRpb246IGZ1bmN0aW9uKG9wdGlvbiwgb2JqZWN0KSB7XG4gICAgaWYgKHR5cGVvZiBvcHRpb24gPT09ICdzdHJpbmcnKSB7XG4gICAgICByZXR1cm4gb2JqZWN0W29wdGlvbl07XG4gICAgfSBlbHNlIGlmICh0eXBlb2Ygb3B0aW9uID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gb3B0aW9uKG9iamVjdCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBvYmplY3Q7XG4gICAgfVxuICB9LFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBBY2Nlc3NvcjtcbiJdfQ==
},{}],4:[function(require,module,exports){
/**
 * PolyFills make me sad
 */
var KeyEvent = KeyEvent || {};
KeyEvent.DOM_VK_UP = KeyEvent.DOM_VK_UP || 38;
KeyEvent.DOM_VK_DOWN = KeyEvent.DOM_VK_DOWN || 40;
KeyEvent.DOM_VK_BACK_SPACE = KeyEvent.DOM_VK_BACK_SPACE || 8;
KeyEvent.DOM_VK_RETURN = KeyEvent.DOM_VK_RETURN || 13;
KeyEvent.DOM_VK_ENTER = KeyEvent.DOM_VK_ENTER || 14;
KeyEvent.DOM_VK_ESCAPE = KeyEvent.DOM_VK_ESCAPE || 27;
KeyEvent.DOM_VK_TAB = KeyEvent.DOM_VK_TAB || 9;

module.exports = KeyEvent;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImtleWV2ZW50LmpzIl0sIm5hbWVzIjpbIktleUV2ZW50IiwiRE9NX1ZLX1VQIiwiRE9NX1ZLX0RPV04iLCJET01fVktfQkFDS19TUEFDRSIsIkRPTV9WS19SRVRVUk4iLCJET01fVktfRU5URVIiLCJET01fVktfRVNDQVBFIiwiRE9NX1ZLX1RBQiIsIm1vZHVsZSIsImV4cG9ydHMiXSwibWFwcGluZ3MiOiJBQUFBOzs7QUFHQSxJQUFJQSxXQUFXQSxZQUFZLEVBQTNCO0FBQ0FBLFNBQVNDLFNBQVQsR0FBcUJELFNBQVNDLFNBQVQsSUFBc0IsRUFBM0M7QUFDQUQsU0FBU0UsV0FBVCxHQUF1QkYsU0FBU0UsV0FBVCxJQUF3QixFQUEvQztBQUNBRixTQUFTRyxpQkFBVCxHQUE2QkgsU0FBU0csaUJBQVQsSUFBOEIsQ0FBM0Q7QUFDQUgsU0FBU0ksYUFBVCxHQUF5QkosU0FBU0ksYUFBVCxJQUEwQixFQUFuRDtBQUNBSixTQUFTSyxZQUFULEdBQXdCTCxTQUFTSyxZQUFULElBQXlCLEVBQWpEO0FBQ0FMLFNBQVNNLGFBQVQsR0FBeUJOLFNBQVNNLGFBQVQsSUFBMEIsRUFBbkQ7QUFDQU4sU0FBU08sVUFBVCxHQUFzQlAsU0FBU08sVUFBVCxJQUF1QixDQUE3Qzs7QUFFQUMsT0FBT0MsT0FBUCxHQUFpQlQsUUFBakIiLCJmaWxlIjoia2V5ZXZlbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIFBvbHlGaWxscyBtYWtlIG1lIHNhZFxuICovXG52YXIgS2V5RXZlbnQgPSBLZXlFdmVudCB8fCB7fTtcbktleUV2ZW50LkRPTV9WS19VUCA9IEtleUV2ZW50LkRPTV9WS19VUCB8fCAzODtcbktleUV2ZW50LkRPTV9WS19ET1dOID0gS2V5RXZlbnQuRE9NX1ZLX0RPV04gfHwgNDA7XG5LZXlFdmVudC5ET01fVktfQkFDS19TUEFDRSA9IEtleUV2ZW50LkRPTV9WS19CQUNLX1NQQUNFIHx8IDg7XG5LZXlFdmVudC5ET01fVktfUkVUVVJOID0gS2V5RXZlbnQuRE9NX1ZLX1JFVFVSTiB8fCAxMztcbktleUV2ZW50LkRPTV9WS19FTlRFUiA9IEtleUV2ZW50LkRPTV9WS19FTlRFUiB8fCAxNDtcbktleUV2ZW50LkRPTV9WS19FU0NBUEUgPSBLZXlFdmVudC5ET01fVktfRVNDQVBFIHx8IDI3O1xuS2V5RXZlbnQuRE9NX1ZLX1RBQiA9IEtleUV2ZW50LkRPTV9WS19UQUIgfHwgOTtcblxubW9kdWxlLmV4cG9ydHMgPSBLZXlFdmVudDtcbiJdfQ==
},{}],5:[function(require,module,exports){
var Typeahead = require('./typeahead');
var Tokenizer = require('./tokenizer');

module.exports = {
  Typeahead: Typeahead,
  Tokenizer: Tokenizer
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlYWN0LXR5cGVhaGVhZC5qcyJdLCJuYW1lcyI6WyJUeXBlYWhlYWQiLCJyZXF1aXJlIiwiVG9rZW5pemVyIiwibW9kdWxlIiwiZXhwb3J0cyJdLCJtYXBwaW5ncyI6IkFBQUEsSUFBSUEsWUFBWUMsUUFBUSxhQUFSLENBQWhCO0FBQ0EsSUFBSUMsWUFBWUQsUUFBUSxhQUFSLENBQWhCOztBQUVBRSxPQUFPQyxPQUFQLEdBQWlCO0FBQ2ZKLGFBQVdBLFNBREk7QUFFZkUsYUFBV0E7QUFGSSxDQUFqQiIsImZpbGUiOiJyZWFjdC10eXBlYWhlYWQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgVHlwZWFoZWFkID0gcmVxdWlyZSgnLi90eXBlYWhlYWQnKTtcbnZhciBUb2tlbml6ZXIgPSByZXF1aXJlKCcuL3Rva2VuaXplcicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgVHlwZWFoZWFkOiBUeXBlYWhlYWQsXG4gIFRva2VuaXplcjogVG9rZW5pemVyXG59O1xuIl19
},{"./tokenizer":6,"./typeahead":8}],6:[function(require,module,exports){
var Accessor = require('../accessor');
var React = window.React || require('react');
var Token = require('./token');
var KeyEvent = require('../keyevent');
var Typeahead = require('../typeahead');
var classNames = require('classnames');

function _arraysAreDifferent(array1, array2) {
  if (array1.length != array2.length) {
    return true;
  }
  for (var i = array2.length - 1; i >= 0; i--) {
    if (array2[i] !== array1[i]) {
      return true;
    }
  }
}

/**
 * A typeahead that, when an option is selected, instead of simply filling
 * the text entry widget, prepends a renderable "token", that may be deleted
 * by pressing backspace on the beginning of the line with the keyboard.
 */
var TypeaheadTokenizer = React.createClass({
  displayName: 'TypeaheadTokenizer',

  propTypes: {
    name: React.PropTypes.string,
    options: React.PropTypes.array,
    customClasses: React.PropTypes.object,
    allowCustomValues: React.PropTypes.number,
    defaultSelected: React.PropTypes.array,
    initialValue: React.PropTypes.string,
    placeholder: React.PropTypes.string,
    disabled: React.PropTypes.bool,
    inputProps: React.PropTypes.object,
    onTokenRemove: React.PropTypes.func,
    onKeyDown: React.PropTypes.func,
    onKeyPress: React.PropTypes.func,
    onKeyUp: React.PropTypes.func,
    onTokenAdd: React.PropTypes.func,
    onFocus: React.PropTypes.func,
    onBlur: React.PropTypes.func,
    filterOption: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.func]),
    searchOptions: React.PropTypes.func,
    displayOption: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.func]),
    formInputOption: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.func]),
    maxVisible: React.PropTypes.number,
    resultsTruncatedMessage: React.PropTypes.string,
    defaultClassNames: React.PropTypes.bool
  },

  getInitialState: function () {
    return {
      // We need to copy this to avoid incorrect sharing
      // of state across instances (e.g., via getDefaultProps())
      selected: this.props.defaultSelected.slice(0)
    };
  },

  getDefaultProps: function () {
    return {
      options: [],
      defaultSelected: [],
      customClasses: {},
      allowCustomValues: 0,
      initialValue: "",
      placeholder: "",
      disabled: false,
      inputProps: {},
      defaultClassNames: true,
      filterOption: null,
      searchOptions: null,
      displayOption: function (token) {
        return token;
      },
      formInputOption: null,
      onKeyDown: function (event) {},
      onKeyPress: function (event) {},
      onKeyUp: function (event) {},
      onFocus: function (event) {},
      onBlur: function (event) {},
      onTokenAdd: function () {},
      onTokenRemove: function () {}
    };
  },

  componentWillReceiveProps: function (nextProps) {
    // if we get new defaultProps, update selected
    if (_arraysAreDifferent(this.props.defaultSelected, nextProps.defaultSelected)) {
      this.setState({ selected: nextProps.defaultSelected.slice(0) });
    }
  },

  focus: function () {
    this.refs.typeahead.focus();
  },

  getSelectedTokens: function () {
    return this.state.selected;
  },

  // TODO: Support initialized tokens
  //
  _renderTokens: function () {
    var tokenClasses = {};
    tokenClasses[this.props.customClasses.token] = !!this.props.customClasses.token;
    var classList = classNames(tokenClasses);
    var result = this.state.selected.map(function (selected) {
      var displayString = Accessor.valueForOption(this.props.displayOption, selected);
      var value = Accessor.valueForOption(this.props.formInputOption || this.props.displayOption, selected);
      return React.createElement(
        Token,
        { key: displayString, className: classList,
          onRemove: this._removeTokenForValue,
          object: selected,
          value: value,
          name: this.props.name },
        displayString
      );
    }, this);
    return result;
  },

  _getOptionsForTypeahead: function () {
    // return this.props.options without this.selected
    return this.props.options;
  },

  _onKeyDown: function (event) {
    // We only care about intercepting backspaces
    if (event.keyCode === KeyEvent.DOM_VK_BACK_SPACE) {
      return this._handleBackspace(event);
    }
    this.props.onKeyDown(event);
  },

  _handleBackspace: function (event) {
    // No tokens
    if (!this.state.selected.length) {
      return;
    }

    // Remove token ONLY when bksp pressed at beginning of line
    // without a selection
    var entry = this.refs.typeahead.refs.entry;
    if (entry.selectionStart == entry.selectionEnd && entry.selectionStart == 0) {
      this._removeTokenForValue(this.state.selected[this.state.selected.length - 1]);
      event.preventDefault();
    }
  },

  _removeTokenForValue: function (value) {
    var index = this.state.selected.indexOf(value);
    if (index == -1) {
      return;
    }

    this.state.selected.splice(index, 1);
    this.setState({ selected: this.state.selected });
    this.props.onTokenRemove(value);
    return;
  },

  _addTokenForValue: function (value) {
    if (this.state.selected.indexOf(value) != -1) {
      return;
    }
    this.state.selected.push(value);
    this.setState({ selected: this.state.selected });
    this.refs.typeahead.setEntryText("");
    this.props.onTokenAdd(value);
  },

  render: function () {
    var classes = {};
    classes[this.props.customClasses.typeahead] = !!this.props.customClasses.typeahead;
    var classList = classNames(classes);
    var tokenizerClasses = [this.props.defaultClassNames && "typeahead-tokenizer"];
    tokenizerClasses[this.props.className] = !!this.props.className;
    var tokenizerClassList = classNames(tokenizerClasses);

    return React.createElement(
      'div',
      { className: tokenizerClassList },
      this._renderTokens(),
      React.createElement(Typeahead, { ref: 'typeahead',
        className: classList,
        placeholder: this.props.placeholder,
        disabled: this.props.disabled,
        inputProps: this.props.inputProps,
        allowCustomValues: this.props.allowCustomValues,
        customClasses: this.props.customClasses,
        options: this._getOptionsForTypeahead(),
        initialValue: this.props.initialValue,
        maxVisible: this.props.maxVisible,
        resultsTruncatedMessage: this.props.resultsTruncatedMessage,
        onOptionSelected: this._addTokenForValue,
        onKeyDown: this._onKeyDown,
        onKeyPress: this.props.onKeyPress,
        onKeyUp: this.props.onKeyUp,
        onFocus: this.props.onFocus,
        onBlur: this.props.onBlur,
        displayOption: this.props.displayOption,
        defaultClassNames: this.props.defaultClassNames,
        filterOption: this.props.filterOption,
        searchOptions: this.props.searchOptions })
    );
  }
});

module.exports = TypeaheadTokenizer;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LmpzIl0sIm5hbWVzIjpbIkFjY2Vzc29yIiwicmVxdWlyZSIsIlJlYWN0IiwiVG9rZW4iLCJLZXlFdmVudCIsIlR5cGVhaGVhZCIsImNsYXNzTmFtZXMiLCJfYXJyYXlzQXJlRGlmZmVyZW50IiwiYXJyYXkxIiwiYXJyYXkyIiwibGVuZ3RoIiwiaSIsIlR5cGVhaGVhZFRva2VuaXplciIsImNyZWF0ZUNsYXNzIiwicHJvcFR5cGVzIiwibmFtZSIsIlByb3BUeXBlcyIsInN0cmluZyIsIm9wdGlvbnMiLCJhcnJheSIsImN1c3RvbUNsYXNzZXMiLCJvYmplY3QiLCJhbGxvd0N1c3RvbVZhbHVlcyIsIm51bWJlciIsImRlZmF1bHRTZWxlY3RlZCIsImluaXRpYWxWYWx1ZSIsInBsYWNlaG9sZGVyIiwiZGlzYWJsZWQiLCJib29sIiwiaW5wdXRQcm9wcyIsIm9uVG9rZW5SZW1vdmUiLCJmdW5jIiwib25LZXlEb3duIiwib25LZXlQcmVzcyIsIm9uS2V5VXAiLCJvblRva2VuQWRkIiwib25Gb2N1cyIsIm9uQmx1ciIsImZpbHRlck9wdGlvbiIsIm9uZU9mVHlwZSIsInNlYXJjaE9wdGlvbnMiLCJkaXNwbGF5T3B0aW9uIiwiZm9ybUlucHV0T3B0aW9uIiwibWF4VmlzaWJsZSIsInJlc3VsdHNUcnVuY2F0ZWRNZXNzYWdlIiwiZGVmYXVsdENsYXNzTmFtZXMiLCJnZXRJbml0aWFsU3RhdGUiLCJzZWxlY3RlZCIsInByb3BzIiwic2xpY2UiLCJnZXREZWZhdWx0UHJvcHMiLCJ0b2tlbiIsImV2ZW50IiwiY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyIsIm5leHRQcm9wcyIsInNldFN0YXRlIiwiZm9jdXMiLCJyZWZzIiwidHlwZWFoZWFkIiwiZ2V0U2VsZWN0ZWRUb2tlbnMiLCJzdGF0ZSIsIl9yZW5kZXJUb2tlbnMiLCJ0b2tlbkNsYXNzZXMiLCJjbGFzc0xpc3QiLCJyZXN1bHQiLCJtYXAiLCJkaXNwbGF5U3RyaW5nIiwidmFsdWVGb3JPcHRpb24iLCJ2YWx1ZSIsIl9yZW1vdmVUb2tlbkZvclZhbHVlIiwiX2dldE9wdGlvbnNGb3JUeXBlYWhlYWQiLCJfb25LZXlEb3duIiwia2V5Q29kZSIsIkRPTV9WS19CQUNLX1NQQUNFIiwiX2hhbmRsZUJhY2tzcGFjZSIsImVudHJ5Iiwic2VsZWN0aW9uU3RhcnQiLCJzZWxlY3Rpb25FbmQiLCJwcmV2ZW50RGVmYXVsdCIsImluZGV4IiwiaW5kZXhPZiIsInNwbGljZSIsIl9hZGRUb2tlbkZvclZhbHVlIiwicHVzaCIsInNldEVudHJ5VGV4dCIsInJlbmRlciIsImNsYXNzZXMiLCJ0b2tlbml6ZXJDbGFzc2VzIiwiY2xhc3NOYW1lIiwidG9rZW5pemVyQ2xhc3NMaXN0IiwibW9kdWxlIiwiZXhwb3J0cyJdLCJtYXBwaW5ncyI6IkFBQUEsSUFBSUEsV0FBV0MsUUFBUSxhQUFSLENBQWY7QUFDQSxJQUFJQyxRQUFRRCxRQUFRLE9BQVIsQ0FBWjtBQUNBLElBQUlFLFFBQVFGLFFBQVEsU0FBUixDQUFaO0FBQ0EsSUFBSUcsV0FBV0gsUUFBUSxhQUFSLENBQWY7QUFDQSxJQUFJSSxZQUFZSixRQUFRLGNBQVIsQ0FBaEI7QUFDQSxJQUFJSyxhQUFhTCxRQUFRLFlBQVIsQ0FBakI7O0FBRUEsU0FBU00sbUJBQVQsQ0FBNkJDLE1BQTdCLEVBQXFDQyxNQUFyQyxFQUE2QztBQUMzQyxNQUFJRCxPQUFPRSxNQUFQLElBQWlCRCxPQUFPQyxNQUE1QixFQUFtQztBQUNqQyxXQUFPLElBQVA7QUFDRDtBQUNELE9BQUssSUFBSUMsSUFBSUYsT0FBT0MsTUFBUCxHQUFnQixDQUE3QixFQUFnQ0MsS0FBSyxDQUFyQyxFQUF3Q0EsR0FBeEMsRUFBNkM7QUFDM0MsUUFBSUYsT0FBT0UsQ0FBUCxNQUFjSCxPQUFPRyxDQUFQLENBQWxCLEVBQTRCO0FBQzFCLGFBQU8sSUFBUDtBQUNEO0FBQ0Y7QUFDRjs7QUFFRDs7Ozs7QUFLQSxJQUFJQyxxQkFBcUJWLE1BQU1XLFdBQU4sQ0FBa0I7QUFBQTs7QUFDekNDLGFBQVc7QUFDVEMsVUFBTWIs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UCxHQUFpQi9FLGtCQUFqQiIsImZpbGUiOiJpbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbInZhciBBY2Nlc3NvciA9IHJlcXVpcmUoJy4uL2FjY2Vzc29yJyk7XG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xudmFyIFRva2VuID0gcmVxdWlyZSgnLi90b2tlbicpO1xudmFyIEtleUV2ZW50ID0gcmVxdWlyZSgnLi4va2V5ZXZlbnQnKTtcbnZhciBUeXBlYWhlYWQgPSByZXF1aXJlKCcuLi90eXBlYWhlYWQnKTtcbnZhciBjbGFzc05hbWVzID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xuXG5mdW5jdGlvbiBfYXJyYXlzQXJlRGlmZmVyZW50KGFycmF5MSwgYXJyYXkyKSB7XG4gIGlmIChhcnJheTEubGVuZ3RoICE9IGFycmF5Mi5sZW5ndGgpe1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIGZvciAodmFyIGkgPSBhcnJheTIubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICBpZiAoYXJyYXkyW2ldICE9PSBhcnJheTFbaV0pe1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogQSB0eXBlYWhlYWQgdGhhdCwgd2hlbiBhbiBvcHRpb24gaXMgc2VsZWN0ZWQsIGluc3RlYWQgb2Ygc2ltcGx5IGZpbGxpbmdcbiAqIHRoZSB0ZXh0IGVudHJ5IHdpZGdldCwgcHJlcGVuZHMgYSByZW5kZXJhYmxlIFwidG9rZW5cIiwgdGhhdCBtYXkgYmUgZGVsZXRlZFxuICogYnkgcHJlc3NpbmcgYmFja3NwYWNlIG9uIHRoZSBiZWdpbm5pbmcgb2YgdGhlIGxpbmUgd2l0aCB0aGUga2V5Ym9hcmQuXG4gKi9cbnZhciBUeXBlYWhlYWRUb2tlbml6ZXIgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gIHByb3BUeXBlczoge1xuICAgIG5hbWU6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmcsXG4gICAgb3B0aW9uczogUmVhY3QuUHJvcFR5cGVzLmFycmF5LFxuICAgIGN1c3RvbUNsYXNzZXM6IFJlYWN0LlByb3BUeXBlcy5vYmplY3QsXG4gICAgYWxsb3dDdXN0b21WYWx1ZXM6IFJlYWN0LlByb3BUeXBlcy5udW1iZXIsXG4gICAgZGVmYXVsdFNlbGVjdGVkOiBSZWFjdC5Qcm9wVHlwZXMuYXJyYXksXG4gICAgaW5pdGlhbFZhbHVlOiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLFxuICAgIHBsYWNlaG9sZGVyOiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLFxuICAgIGRpc2FibGVkOiBSZWFjdC5Qcm9wVHlwZXMuYm9vbCxcbiAgICBpbnB1dFByb3BzOiBSZWFjdC5Qcm9wVHlwZXMub2JqZWN0LFxuICAgIG9uVG9rZW5SZW1vdmU6IFJlYWN0LlByb3BUeXBlcy5mdW5jLFxuICAgIG9uS2V5RG93bjogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsXG4gICAgb25LZXlQcmVzczogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsXG4gICAgb25LZXlVcDogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsXG4gICAgb25Ub2tlbkFkZDogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsXG4gICAgb25Gb2N1czogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsXG4gICAgb25CbHVyOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYyxcbiAgICBmaWx0ZXJPcHRpb246IFJlYWN0LlByb3BUeXBlcy5vbmVPZlR5cGUoW1xuICAgICAgUmVhY3QuUHJvcFR5cGVzLnN0cmluZyxcbiAgICAgIFJlYWN0LlByb3BUeXBlcy5mdW5jXG4gICAgXSksXG4gICAgc2VhcmNoT3B0aW9uczogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsXG4gICAgZGlzcGxheU9wdGlvbjogUmVhY3QuUHJvcFR5cGVzLm9uZU9mVHlwZShbXG4gICAgICBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLFxuICAgICAgUmVhY3QuUHJvcFR5cGVzLmZ1bmNcbiAgICBdKSxcbiAgICBmb3JtSW5wdXRPcHRpb246IFJlYWN0LlByb3BUeXBlcy5vbmVPZlR5cGUoW1xuICAgICAgUmVhY3QuUHJvcFR5cGVzLnN0cmluZyxcbiAgICAgIFJlYWN0LlByb3BUeXBlcy5mdW5jXG4gICAgXSksXG4gICAgbWF4VmlzaWJsZTogUmVhY3QuUHJvcFR5cGVzLm51bWJlcixcbiAgICByZXN1bHRzVHJ1bmNhdGVkTWVzc2FnZTogUmVhY3QuUHJvcFR5cGVzLnN0cmluZyxcbiAgICBkZWZhdWx0Q2xhc3NOYW1lczogUmVhY3QuUHJvcFR5cGVzLmJvb2xcbiAgfSxcblxuICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7XG4gICAgICAvLyBXZSBuZWVkIHRvIGNvcHkgdGhpcyB0byBhdm9pZCBpbmNvcnJlY3Qgc2hhcmluZ1xuICAgICAgLy8gb2Ygc3RhdGUgYWNyb3NzIGluc3RhbmNlcyAoZS5nLiwgdmlhIGdldERlZmF1bHRQcm9wcygpKVxuICAgICAgc2VsZWN0ZWQ6IHRoaXMucHJvcHMuZGVmYXVsdFNlbGVjdGVkLnNsaWNlKDApXG4gICAgfTtcbiAgfSxcblxuICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7XG4gICAgICBvcHRpb25zOiBbXSxcbiAgICAgIGRlZmF1bHRTZWxlY3RlZDogW10sXG4gICAgICBjdXN0b21DbGFzc2VzOiB7fSxcbiAgICAgIGFsbG93Q3VzdG9tVmFsdWVzOiAwLFxuICAgICAgaW5pdGlhbFZhbHVlOiBcIlwiLFxuICAgICAgcGxhY2Vob2xkZXI6IFwiXCIsXG4gICAgICBkaXNhYmxlZDogZmFsc2UsXG4gICAgICBpbnB1dFByb3BzOiB7fSxcbiAgICAgIGRlZmF1bHRDbGFzc05hbWVzOiB0cnVlLFxuICAgICAgZmlsdGVyT3B0aW9uOiBudWxsLFxuICAgICAgc2VhcmNoT3B0aW9uczogbnVsbCxcbiAgICAgIGRpc3BsYXlPcHRpb246IGZ1bmN0aW9uKHRva2VuKXsgcmV0dXJuIHRva2VuIH0sXG4gICAgICBmb3JtSW5wdXRPcHRpb246IG51bGwsXG4gICAgICBvbktleURvd246IGZ1bmN0aW9uKGV2ZW50KSB7fSxcbiAgICAgIG9uS2V5UHJlc3M6IGZ1bmN0aW9uKGV2ZW50KSB7fSxcbiAgICAgIG9uS2V5VXA6IGZ1bmN0aW9uKGV2ZW50KSB7fSxcbiAgICAgIG9uRm9jdXM6IGZ1bmN0aW9uKGV2ZW50KSB7fSxcbiAgICAgIG9uQmx1cjogZnVuY3Rpb24oZXZlbnQpIHt9LFxuICAgICAgb25Ub2tlbkFkZDogZnVuY3Rpb24oKSB7fSxcbiAgICAgIG9uVG9rZW5SZW1vdmU6IGZ1bmN0aW9uKCkge31cbiAgICB9O1xuICB9LFxuXG4gIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHM6IGZ1bmN0aW9uKG5leHRQcm9wcyl7XG4gICAgLy8gaWYgd2UgZ2V0IG5ldyBkZWZhdWx0UHJvcHMsIHVwZGF0ZSBzZWxlY3RlZFxuICAgIGlmIChfYXJyYXlzQXJlRGlmZmVyZW50KHRoaXMucHJvcHMuZGVmYXVsdFNlbGVjdGVkLCBuZXh0UHJvcHMuZGVmYXVsdFNlbGVjdGVkKSl7XG4gICAgICB0aGlzLnNldFN0YXRlKHtzZWxlY3RlZDogbmV4dFByb3BzLmRlZmF1bHRTZWxlY3RlZC5zbGljZSgwKX0pXG4gICAgfVxuICB9LFxuXG4gIGZvY3VzOiBmdW5jdGlvbigpe1xuICAgIHRoaXMucmVmcy50eXBlYWhlYWQuZm9jdXMoKTtcbiAgfSxcblxuICBnZXRTZWxlY3RlZFRva2VuczogZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gdGhpcy5zdGF0ZS5zZWxlY3RlZDtcbiAgfSxcblxuICAvLyBUT0RPOiBTdXBwb3J0IGluaXRpYWxpemVkIHRva2Vuc1xuICAvL1xuICBfcmVuZGVyVG9rZW5zOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgdG9rZW5DbGFzc2VzID0ge307XG4gICAgdG9rZW5DbGFzc2VzW3RoaXMucHJvcHMuY3VzdG9tQ2xhc3Nlcy50b2tlbl0gPSAhIXRoaXMucHJvcHMuY3VzdG9tQ2xhc3Nlcy50b2tlbjtcbiAgICB2YXIgY2xhc3NMaXN0ID0gY2xhc3NOYW1lcyh0b2tlbkNsYXNzZXMpO1xuICAgIHZhciByZXN1bHQgPSB0aGlzLnN0YXRlLnNlbGVjdGVkLm1hcChmdW5jdGlvbihzZWxlY3RlZCkge1xuICAgICAgdmFyIGRpc3BsYXlTdHJpbmcgPSBBY2Nlc3Nvci52YWx1ZUZvck9wdGlvbih0aGlzLnByb3BzLmRpc3BsYXlPcHRpb24sIHNlbGVjdGVkKTtcbiAgICAgIHZhciB2YWx1ZSA9IEFjY2Vzc29yLnZhbHVlRm9yT3B0aW9uKHRoaXMucHJvcHMuZm9ybUlucHV0T3B0aW9uIHx8IHRoaXMucHJvcHMuZGlzcGxheU9wdGlvbiwgc2VsZWN0ZWQpO1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgPFRva2VuIGtleT17ZGlzcGxheVN0cmluZ30gY2xhc3NOYW1lPXtjbGFzc0xpc3R9XG4gICAgICAgICAgb25SZW1vdmU9e3RoaXMuX3JlbW92ZVRva2VuRm9yVmFsdWV9XG4gICAgICAgICAgb2JqZWN0PXtzZWxlY3RlZH1cbiAgICAgICAgICB2YWx1ZT17dmFsdWV9XG4gICAgICAgICAgbmFtZT17dGhpcy5wcm9wcy5uYW1lfT5cbiAgICAgICAgICB7ZGlzcGxheVN0cmluZ31cbiAgICAgICAgPC9Ub2tlbj5cbiAgICAgICk7XG4gICAgfSwgdGhpcyk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfSxcblxuICBfZ2V0T3B0aW9uc0ZvclR5cGVhaGVhZDogZnVuY3Rpb24oKSB7XG4gICAgLy8gcmV0dXJuIHRoaXMucHJvcHMub3B0aW9ucyB3aXRob3V0IHRoaXMuc2VsZWN0ZWRcbiAgICByZXR1cm4gdGhpcy5wcm9wcy5vcHRpb25zO1xuICB9LFxuXG4gIF9vbktleURvd246IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgLy8gV2Ugb25seSBjYXJlIGFib3V0IGludGVyY2VwdGluZyBiYWNrc3BhY2VzXG4gICAgaWYgKGV2ZW50LmtleUNvZGUgPT09IEtleUV2ZW50LkRPTV9WS19CQUNLX1NQQUNFKSB7XG4gICAgICByZXR1cm4gdGhpcy5faGFuZGxlQmFja3NwYWNlKGV2ZW50KTtcbiAgICB9XG4gICAgdGhpcy5wcm9wcy5vbktleURvd24oZXZlbnQpO1xuICB9LFxuXG4gIF9oYW5kbGVCYWNrc3BhY2U6IGZ1bmN0aW9uKGV2ZW50KXtcbiAgICAvLyBObyB0b2tlbnNcbiAgICBpZiAoIXRoaXMuc3RhdGUuc2VsZWN0ZWQubGVuZ3RoKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gUmVtb3ZlIHRva2VuIE9OTFkgd2hlbiBia3NwIHByZXNzZWQgYXQgYmVnaW5uaW5nIG9mIGxpbmVcbiAgICAvLyB3aXRob3V0IGEgc2VsZWN0aW9uXG4gICAgdmFyIGVudHJ5ID0gdGhpcy5yZWZzLnR5cGVhaGVhZC5yZWZzLmVudHJ5O1xuICAgIGlmIChlbnRyeS5zZWxlY3Rpb25TdGFydCA9PSBlbnRyeS5zZWxlY3Rpb25FbmQgJiZcbiAgICAgICAgZW50cnkuc2VsZWN0aW9uU3RhcnQgPT0gMCkge1xuICAgICAgdGhpcy5fcmVtb3ZlVG9rZW5Gb3JWYWx1ZShcbiAgICAgICAgdGhpcy5zdGF0ZS5zZWxlY3RlZFt0aGlzLnN0YXRlLnNlbGVjdGVkLmxlbmd0aCAtIDFdKTtcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgfVxuICB9LFxuXG4gIF9yZW1vdmVUb2tlbkZvclZhbHVlOiBmdW5jdGlvbih2YWx1ZSkge1xuICAgIHZhciBpbmRleCA9IHRoaXMuc3RhdGUuc2VsZWN0ZWQuaW5kZXhPZih2YWx1ZSk7XG4gICAgaWYgKGluZGV4ID09IC0xKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5zdGF0ZS5zZWxlY3RlZC5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIHRoaXMuc2V0U3RhdGUoe3NlbGVjdGVkOiB0aGlzLnN0YXRlLnNlbGVjdGVkfSk7XG4gICAgdGhpcy5wcm9wcy5vblRva2VuUmVtb3ZlKHZhbHVlKTtcbiAgICByZXR1cm47XG4gIH0sXG5cbiAgX2FkZFRva2VuRm9yVmFsdWU6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgaWYgKHRoaXMuc3RhdGUuc2VsZWN0ZWQuaW5kZXhPZih2YWx1ZSkgIT0gLTEpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5zdGF0ZS5zZWxlY3RlZC5wdXNoKHZhbHVlKTtcbiAgICB0aGlzLnNldFN0YXRlKHtzZWxlY3RlZDogdGhpcy5zdGF0ZS5zZWxlY3RlZH0pO1xuICAgIHRoaXMucmVmcy50eXBlYWhlYWQuc2V0RW50cnlUZXh0KFwiXCIpO1xuICAgIHRoaXMucHJvcHMub25Ub2tlbkFkZCh2YWx1ZSk7XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgY2xhc3NlcyA9IHt9O1xuICAgIGNsYXNzZXNbdGhpcy5wcm9wcy5jdXN0b21DbGFzc2VzLnR5cGVhaGVhZF0gPSAhIXRoaXMucHJvcHMuY3VzdG9tQ2xhc3Nlcy50eXBlYWhlYWQ7XG4gICAgdmFyIGNsYXNzTGlzdCA9IGNsYXNzTmFtZXMoY2xhc3Nlcyk7XG4gICAgdmFyIHRva2VuaXplckNsYXNzZXMgPSBbdGhpcy5wcm9wcy5kZWZhdWx0Q2xhc3NOYW1lcyAmJiBcInR5cGVhaGVhZC10b2tlbml6ZXJcIl07XG4gICAgdG9rZW5pemVyQ2xhc3Nlc1t0aGlzLnByb3BzLmNsYXNzTmFtZV0gPSAhIXRoaXMucHJvcHMuY2xhc3NOYW1lO1xuICAgIHZhciB0b2tlbml6ZXJDbGFzc0xpc3QgPSBjbGFzc05hbWVzKHRva2VuaXplckNsYXNzZXMpXG5cbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9e3Rva2VuaXplckNsYXNzTGlzdH0+XG4gICAgICAgIHsgdGhpcy5fcmVuZGVyVG9rZW5zKCkgfVxuICAgICAgICA8VHlwZWFoZWFkIHJlZj1cInR5cGVhaGVhZFwiXG4gICAgICAgICAgY2xhc3NOYW1lPXtjbGFzc0xpc3R9XG4gICAgICAgICAgcGxhY2Vob2xkZXI9e3RoaXMucHJvcHMucGxhY2Vob2xkZXJ9XG4gICAgICAgICAgZGlzYWJsZWQ9e3RoaXMucHJvcHMuZGlzYWJsZWR9XG4gICAgICAgICAgaW5wdXRQcm9wcz17dGhpcy5wcm9wcy5pbnB1dFByb3BzfVxuICAgICAgICAgIGFsbG93Q3VzdG9tVmFsdWVzPXt0aGlzLnByb3BzLmFsbG93Q3VzdG9tVmFsdWVzfVxuICAgICAgICAgIGN1c3RvbUNsYXNzZXM9e3RoaXMucHJvcHMuY3VzdG9tQ2xhc3Nlc31cbiAgICAgICAgICBvcHRpb25zPXt0aGlzLl9nZXRPcHRpb25zRm9yVHlwZWFoZWFkKCl9XG4gICAgICAgICAgaW5pdGlhbFZhbHVlPXt0aGlzLnByb3BzLmluaXRpYWxWYWx1ZX1cbiAgICAgICAgICBtYXhWaXNpYmxlPXt0aGlzLnByb3BzLm1heFZpc2libGV9XG4gICAgICAgICAgcmVzdWx0c1RydW5jYXRlZE1lc3NhZ2U9e3RoaXMucHJvcHMucmVzdWx0c1RydW5jYXRlZE1lc3NhZ2V9XG4gICAgICAgICAgb25PcHRpb25TZWxlY3RlZD17dGhpcy5fYWRkVG9rZW5Gb3JWYWx1ZX1cbiAgICAgICAgICBvbktleURvd249e3RoaXMuX29uS2V5RG93bn1cbiAgICAgICAgICBvbktleVByZXNzPXt0aGlzLnByb3BzLm9uS2V5UHJlc3N9XG4gICAgICAgICAgb25LZXlVcD17dGhpcy5wcm9wcy5vbktleVVwfVxuICAgICAgICAgIG9uRm9jdXM9e3RoaXMucHJvcHMub25Gb2N1c31cbiAgICAgICAgICBvbkJsdXI9e3RoaXMucHJvcHMub25CbHVyfVxuICAgICAgICAgIGRpc3BsYXlPcHRpb249e3RoaXMucHJvcHMuZGlzcGxheU9wdGlvbn1cbiAgICAgICAgICBkZWZhdWx0Q2xhc3NOYW1lcz17dGhpcy5wcm9wcy5kZWZhdWx0Q2xhc3NOYW1lc31cbiAgICAgICAgICBmaWx0ZXJPcHRpb249e3RoaXMucHJvcHMuZmlsdGVyT3B0aW9ufVxuICAgICAgICAgIHNlYXJjaE9wdGlvbnM9e3RoaXMucHJvcHMuc2VhcmNoT3B0aW9uc30gLz5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFR5cGVhaGVhZFRva2VuaXplcjtcbiJdfQ==
},{"../accessor":3,"../keyevent":4,"../typeahead":8,"./token":7,"classnames":1,"react":"react"}],7:[function(require,module,exports){
var React = window.React || require('react');
var classNames = require('classnames');

/**
 * Encapsulates the rendering of an option that has been "selected" in a
 * TypeaheadTokenizer
 */
var Token = React.createClass({
  displayName: 'Token',

  propTypes: {
    className: React.PropTypes.string,
    name: React.PropTypes.string,
    children: React.PropTypes.string,
    object: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.object]),
    onRemove: React.PropTypes.func,
    value: React.PropTypes.string
  },

  render: function () {
    var className = classNames(["typeahead-token", this.props.className]);

    return React.createElement(
      'div',
      { className: className },
      this._renderHiddenInput(),
      this.props.children,
      this._renderCloseButton()
    );
  },

  _renderHiddenInput: function () {
    // If no name was set, don't create a hidden input
    if (!this.props.name) {
      return null;
    }

    return React.createElement('input', {
      type: 'hidden',
      name: this.props.name + '[]',
      value: this.props.value || this.props.object
    });
  },

  _renderCloseButton: function () {
    if (!this.props.onRemove) {
      return "";
    }
    return React.createElement(
      'a',
      { className: this.props.className || "typeahead-token-close", href: '#', onClick: function (event) {
          this.props.onRemove(this.props.object);
          event.preventDefault();
        }.bind(this) },
      '\xD7'
    );
  }
});

module.exports = Token;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRva2VuLmpzIl0sIm5hbWVzIjpbIlJlYWN0IiwicmVxdWlyZSIsImNsYXNzTmFtZXMiLCJUb2tlbiIsImNyZWF0ZUNsYXNzIiwicHJvcFR5cGVzIiwiY2xhc3NOYW1lIiwiUHJvcFR5cGVzIiwic3RyaW5nIiwibmFtZSIsImNoaWxkcmVuIiwib2JqZWN0Iiwib25lT2ZUeXBlIiwib25SZW1vdmUiLCJmdW5jIiwidmFsdWUiLCJyZW5kZXIiLCJwcm9wcyIsIl9yZW5kZXJIaWRkZW5JbnB1dCIsIl9yZW5kZXJDbG9zZUJ1dHRvbiIsImV2ZW50IiwicHJldmVudERlZmF1bHQiLCJiaW5kIiwibW9kdWxlIiwiZXhwb3J0cyJdLCJtYXBwaW5ncyI6IkFBQUEsSUFBSUEsUUFBUUMsUUFBUSxPQUFSLENBQVo7QUFDQSxJQUFJQyxhQUFhRCxRQUFRLFlBQVIsQ0FBakI7O0FBRUE7Ozs7QUFJQSxJQUFJRSxRQUFRSCxNQUFNSSxXQUFOLENBQWtCO0FBQUE7O0FBQzVCQyxhQUFXO0FBQ1RDLGVBQVdOLE1BQU1PLFNBQU4sQ0FBZ0JDLE1BRGxCO0FBRVRDLFVBQU1ULE1BQU1PLFNBQU4sQ0FBZ0JDLE1BRmI7QUFHVEUsY0FBVVYsTUFBTU8sU0FBTixDQUFnQkMsTUFIakI7QUFJVEcsWUFBUVgsTUFBTU8sU0FBTixDQUFnQkssU0FBaEIsQ0FBMEIsQ0FDaENaLE1BQU1PLFNBQU4sQ0FBZ0JDLE1BRGdCLEVBRWhDUixNQUFNTyxTQUFOLENBQWdCSSxNQUZnQixDQUExQixDQUpDO0FBUVRFLGNBQVViLE1BQU1PLFNBQU4sQ0FBZ0JPLElBUmpCO0FBU1RDLFdBQU9mLE1BQU1PLFNBQU4sQ0FBZ0JDO0FBVGQsR0FEaUI7O0FBYTVCUSxVQUFRLFlBQVc7QUFDakIsUUFBSVYsWUFBWUosV0FBVyxDQUN6QixpQkFEeUIsRUFFekIsS0FBS2UsS0FBTCxDQUFXWCxTQUZjLENBQVgsQ0FBaEI7O0FBS0EsV0FDRTtBQUFBO0FBQUEsUUFBSyxXQUFXQSxTQUFoQjtBQUNHLFdBQUtZLGtCQUFMLEVBREg7QUFFRyxXQUFLRCxLQUFMLENBQVdQLFFBRmQ7QUFHRyxXQUFLUyxrQkFBTDtBQUhILEtBREY7QUFPRCxHQTFCMkI7O0FBNEI1QkQsc0JBQW9CLFlBQVc7QUFDN0I7QUFDQSxRQUFJLENBQUMsS0FBS0QsS0FBTCxDQUFXUixJQUFoQixFQUFzQjtBQUNwQixhQUFPLElBQVA7QUFDRDs7QUFFRCxXQUNFO0FBQ0UsWUFBSyxRQURQO0FBRUUsWUFBTyxLQUFLUSxLQUFMLENBQVdSLElBQVgsR0FBa0IsSUFGM0I7QUFHRSxhQUFRLEtBQUtRLEtBQUwsQ0FBV0YsS0FBWCxJQUFvQixLQUFLRSxLQUFMLENBQVdOO0FBSHpDLE1BREY7QUFPRCxHQXpDMkI7O0FBMkM1QlEsc0JBQW9CLFlBQVc7QUFDN0IsUUFBSSxDQUFDLEtBQUtGLEtBQUwsQ0FBV0osUUFBaEIsRUFBMEI7QUFDeEIsYUFBTyxFQUFQO0FBQ0Q7QUFDRCxXQUNFO0FBQUE7QUFBQSxRQUFHLFdBQVcsS0FBS0ksS0FBTCxDQUFXWCxTQUFYLElBQXdCLHVCQUF0QyxFQUErRCxNQUFLLEdBQXBFLEVBQXdFLFNBQVMsVUFBU2MsS0FBVCxFQUFnQjtBQUM3RixlQUFLSCxLQUFMLENBQVdKLFFBQVgsQ0FBb0IsS0FBS0ksS0FBTCxDQUFXTixNQUEvQjtBQUNBUyxnQkFBTUMsY0FBTjtBQUNELFNBSDhFLENBRzdFQyxJQUg2RSxDQUd4RSxJQUh3RSxDQUFqRjtBQUFBO0FBQUEsS0FERjtBQU1EO0FBckQyQixDQUFsQixDQUFaOztBQXdEQUMsT0FBT0MsT0FBUCxHQUFpQnJCLEtBQWpCIiwiZmlsZSI6InRva2VuLmpzIiwic291cmNlc0NvbnRlbnQiOlsidmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbnZhciBjbGFzc05hbWVzID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xuXG4vKipcbiAqIEVuY2Fwc3VsYXRlcyB0aGUgcmVuZGVyaW5nIG9mIGFuIG9wdGlvbiB0aGF0IGhhcyBiZWVuIFwic2VsZWN0ZWRcIiBpbiBhXG4gKiBUeXBlYWhlYWRUb2tlbml6ZXJcbiAqL1xudmFyIFRva2VuID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICBwcm9wVHlwZXM6IHtcbiAgICBjbGFzc05hbWU6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmcsXG4gICAgbmFtZTogUmVhY3QuUHJvcFR5cGVzLnN0cmluZyxcbiAgICBjaGlsZHJlbjogUmVhY3QuUHJvcFR5cGVzLnN0cmluZyxcbiAgICBvYmplY3Q6IFJlYWN0LlByb3BUeXBlcy5vbmVPZlR5cGUoW1xuICAgICAgUmVhY3QuUHJvcFR5cGVzLnN0cmluZyxcbiAgICAgIFJlYWN0LlByb3BUeXBlcy5vYmplY3QsXG4gICAgXSksXG4gICAgb25SZW1vdmU6IFJlYWN0LlByb3BUeXBlcy5mdW5jLFxuICAgIHZhbHVlOiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nXG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgY2xhc3NOYW1lID0gY2xhc3NOYW1lcyhbXG4gICAgICBcInR5cGVhaGVhZC10b2tlblwiLFxuICAgICAgdGhpcy5wcm9wcy5jbGFzc05hbWVcbiAgICBdKTtcblxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT17Y2xhc3NOYW1lfT5cbiAgICAgICAge3RoaXMuX3JlbmRlckhpZGRlbklucHV0KCl9XG4gICAgICAgIHt0aGlzLnByb3BzLmNoaWxkcmVufVxuICAgICAgICB7dGhpcy5fcmVuZGVyQ2xvc2VCdXR0b24oKX1cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH0sXG5cbiAgX3JlbmRlckhpZGRlbklucHV0OiBmdW5jdGlvbigpIHtcbiAgICAvLyBJZiBubyBuYW1lIHdhcyBzZXQsIGRvbid0IGNyZWF0ZSBhIGhpZGRlbiBpbnB1dFxuICAgIGlmICghdGhpcy5wcm9wcy5uYW1lKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICByZXR1cm4gKFxuICAgICAgPGlucHV0XG4gICAgICAgIHR5cGU9XCJoaWRkZW5cIlxuICAgICAgICBuYW1lPXsgdGhpcy5wcm9wcy5uYW1lICsgJ1tdJyB9XG4gICAgICAgIHZhbHVlPXsgdGhpcy5wcm9wcy52YWx1ZSB8fCB0aGlzLnByb3BzLm9iamVjdCB9XG4gICAgICAvPlxuICAgICk7XG4gIH0sXG5cbiAgX3JlbmRlckNsb3NlQnV0dG9uOiBmdW5jdGlvbigpIHtcbiAgICBpZiAoIXRoaXMucHJvcHMub25SZW1vdmUpIHtcbiAgICAgIHJldHVybiBcIlwiO1xuICAgIH1cbiAgICByZXR1cm4gKFxuICAgICAgPGEgY2xhc3NOYW1lPXt0aGlzLnByb3BzLmNsYXNzTmFtZSB8fCBcInR5cGVhaGVhZC10b2tlbi1jbG9zZVwifSBocmVmPVwiI1wiIG9uQ2xpY2s9e2Z1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgdGhpcy5wcm9wcy5vblJlbW92ZSh0aGlzLnByb3BzLm9iamVjdCk7XG4gICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpfT4mI3gwMGQ3OzwvYT5cbiAgICApO1xuICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBUb2tlbjtcbiJdfQ==
},{"classnames":1,"react":"react"}],8:[function(require,module,exports){
var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var Accessor = require('../accessor');
var React = window.React || require('react');
var TypeaheadSelector = require('./selector');
var KeyEvent = require('../keyevent');
var fuzzy = require('fuzzy');
var classNames = require('classnames');

/**
 * A "typeahead", an auto-completing text input
 *
 * Renders an text input that shows options nearby that you can use the
 * keyboard or mouse to select.  Requires CSS for MASSIVE DAMAGE.
 */
var Typeahead = React.createClass({
  displayName: 'Typeahead',

  propTypes: {
    name: React.PropTypes.string,
    customClasses: React.PropTypes.object,
    maxVisible: React.PropTypes.number,
    resultsTruncatedMessage: React.PropTypes.string,
    options: React.PropTypes.array,
    allowCustomValues: React.PropTypes.number,
    initialValue: React.PropTypes.string,
    value: React.PropTypes.string,
    placeholder: React.PropTypes.string,
    disabled: React.PropTypes.bool,
    textarea: React.PropTypes.bool,
    inputProps: React.PropTypes.object,
    onOptionSelected: React.PropTypes.func,
    onChange: React.PropTypes.func,
    onKeyDown: React.PropTypes.func,
    onKeyPress: React.PropTypes.func,
    onKeyUp: React.PropTypes.func,
    onFocus: React.PropTypes.func,
    onBlur: React.PropTypes.func,
    filterOption: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.func]),
    searchOptions: React.PropTypes.func,
    displayOption: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.func]),
    inputDisplayOption: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.func]),
    formInputOption: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.func]),
    defaultClassNames: React.PropTypes.bool,
    customListComponent: React.PropTypes.oneOfType([React.PropTypes.element, React.PropTypes.func]),
    showOptionsWhenEmpty: React.PropTypes.bool
  },

  getDefaultProps: function () {
    return {
      options: [],
      customClasses: {},
      allowCustomValues: 0,
      initialValue: "",
      value: "",
      placeholder: "",
      disabled: false,
      textarea: false,
      inputProps: {},
      onOptionSelected: function (option) {},
      onChange: function (event) {},
      onKeyDown: function (event) {},
      onKeyPress: function (event) {},
      onKeyUp: function (event) {},
      onFocus: function (event) {},
      onBlur: function (event) {},
      filterOption: null,
      searchOptions: null,
      inputDisplayOption: null,
      defaultClassNames: true,
      customListComponent: TypeaheadSelector,
      showOptionsWhenEmpty: false,
      resultsTruncatedMessage: null
    };
  },

  getInitialState: function () {
    return {
      // The options matching the entry value
      searchResults: this.getOptionsForValue(this.props.initialValue, this.props.options),

      // This should be called something else, "entryValue"
      entryValue: this.props.value || this.props.initialValue,

      // A valid typeahead value
      selection: this.props.value,

      // Index of the selection
      selectionIndex: null,

      // Keep track of the focus state of the input element, to determine
      // whether to show options when empty (if showOptionsWhenEmpty is true)
      isFocused: false,

      // true when focused, false onOptionSelected
      showResults: false
    };
  },

  _shouldSkipSearch: function (input) {
    var emptyValue = !input || input.trim().length == 0;

    // this.state must be checked because it may not be defined yet if this function
    // is called from within getInitialState
    var isFocused = this.state && this.state.isFocused;
    return !(this.props.showOptionsWhenEmpty && isFocused) && emptyValue;
  },

  getOptionsForValue: function (value, options) {
    if (this._shouldSkipSearch(value)) {
      return [];
    }

    var searchOptions = this._generateSearchFunction();
    return searchOptions(value, options);
  },

  setEntryText: function (value) {
    this.refs.entry.value = value;
    this._onTextEntryUpdated();
  },

  focus: function () {
    this.refs.entry.focus();
  },

  _hasCustomValue: function () {
    if (this.props.allowCustomValues > 0 && this.state.entryValue.length >= this.props.allowCustomValues && this.state.searchResults.indexOf(this.state.entryValue) < 0) {
      return true;
    }
    return false;
  },

  _getCustomValue: function () {
    if (this._hasCustomValue()) {
      return this.state.entryValue;
    }
    return null;
  },

  _renderIncrementalSearchResults: function () {
    // Nothing has been entered into the textbox
    if (this._shouldSkipSearch(this.state.entryValue)) {
      return "";
    }

    // Something was just selected
    if (this.state.selection) {
      return "";
    }

    return React.createElement(this.props.customListComponent, {
      ref: 'sel', options: this.props.maxVisible ? this.state.searchResults.slice(0, this.props.maxVisible) : this.state.searchResults,
      areResultsTruncated: this.props.maxVisible && this.state.searchResults.length > this.props.maxVisible,
      resultsTruncatedMessage: this.props.resultsTruncatedMessage,
      onOptionSelected: this._onOptionSelected,
      allowCustomValues: this.props.allowCustomValues,
      customValue: this._getCustomValue(),
      customClasses: this.props.customClasses,
      selectionIndex: this.state.selectionIndex,
      defaultClassNames: this.props.defaultClassNames,
      displayOption: Accessor.generateOptionToStringFor(this.props.displayOption) });
  },

  getSelection: function () {
    var index = this.state.selectionIndex;
    if (this._hasCustomValue()) {
      if (index === 0) {
        return this.state.entryValue;
      } else {
        index--;
      }
    }
    return this.state.searchResults[index];
  },

  _replaceWord(value) {
    var tokens = value.split(' ');
    return tokens.length === 0 ? value : tokens[tokens.length - 1];
  },

  _onOptionSelected: function (option, event) {
    var nEntry = this.refs.entry;
    nEntry.focus();

    var displayOption = Accessor.generateOptionToStringFor(this.props.inputDisplayOption || this.props.displayOption);
    var optionString = displayOption(option, 0);

    var formInputOption = Accessor.generateOptionToStringFor(this.props.formInputOption || displayOption);
    var formInputOptionString = formInputOption(option);

    nEntry.value = optionString;

    var entryValue = this.state.entryValue;
    var replaceWord = this._replaceWord(entryValue);
    var lastReplaceWordIndex = entryValue.lastIndexOf(replaceWord);
    var valueBefore = entryValue.substring(0, lastReplaceWordIndex);

    this.setState({ searchResults: this.getOptionsForValue(optionString, this.props.options),
      selection: formInputOptionString,
      entryValue: valueBefore.concat(optionString) });
    return this.props.onOptionSelected(option, event);
  },

  _onTextEntryUpdated: function () {
    var value = this.refs.entry.value;
    this.setState({ searchResults: this.getOptionsForValue(value, this.props.options),
      selection: '',
      entryValue: value });
  },

  _onEnter: function (event) {
    var selection = this.getSelection();
    if (!selection) {
      return this.props.onKeyDown(event);
    }
    return this._onOptionSelected(selection, event);
  },

  _onEscape: function () {
    this.setState({
      selectionIndex: null
    });
  },

  _onTab: function (event) {
    var selection = this.getSelection();
    var option = selection ? selection : this.state.searchResults.length > 0 ? this.state.searchResults[0] : null;

    if (option === null && this._hasCustomValue()) {
      option = this._getCustomValue();
    }

    if (option !== null) {
      return this._onOptionSelected(option, event);
    }
  },

  eventMap: function (event) {
    var events = {};

    events[KeyEvent.DOM_VK_UP] = this.navUp;
    events[KeyEvent.DOM_VK_DOWN] = this.navDown;
    events[KeyEvent.DOM_VK_RETURN] = events[KeyEvent.DOM_VK_ENTER] = this._onEnter;
    events[KeyEvent.DOM_VK_ESCAPE] = this._onEscape;
    events[KeyEvent.DOM_VK_TAB] = this._onTab;

    return events;
  },

  _nav: function (delta) {
    if (!this._hasHint()) {
      return;
    }
    var newIndex = this.state.selectionIndex === null ? delta == 1 ? 0 : delta : this.state.selectionIndex + delta;
    var length = this.props.maxVisible ? this.state.searchResults.slice(0, this.props.maxVisible).length : this.state.searchResults.length;
    if (this._hasCustomValue()) {
      length += 1;
    }

    if (newIndex < 0) {
      newIndex += length;
    } else if (newIndex >= length) {
      newIndex -= length;
    }

    this.setState({ selectionIndex: newIndex });
  },

  navDown: function () {
    this._nav(1);
  },

  navUp: function () {
    this._nav(-1);
  },

  _onChange: function (event) {
    if (this.props.onChange) {
      this.props.onChange(event);
    }

    this._onTextEntryUpdated();
  },

  _onKeyDown: function (event) {
    // If there are no visible elements, don't perform selector navigation.
    // Just pass this up to the upstream onKeydown handler.
    // Also skip if the user is pressing the shift key, since none of our handlers are looking for shift
    if (!this._hasHint() || event.shiftKey) {
      return this.props.onKeyDown(event);
    }

    var handler = this.eventMap()[event.keyCode];

    if (handler) {
      handler(event);
    } else {
      return this.props.onKeyDown(event);
    }
    // Don't propagate the keystroke back to the DOM/browser
    event.preventDefault();
  },

  componentWillReceiveProps: function (nextProps) {
    var searchResults = this.getOptionsForValue(this.state.entryValue, nextProps.options);
    var showResults = Boolean(searchResults.length);
    this.setState({
      searchResults: searchResults,
      showResults: showResults
    });
  },

  render: function () {
    var inputClasses = {};
    inputClasses[this.props.customClasses.input] = !!this.props.customClasses.input;
    var inputClassList = classNames(inputClasses);

    var classes = {
      typeahead: this.props.defaultClassNames
    };
    classes[this.props.className] = !!this.props.className;
    var classList = classNames(classes);

    var InputElement = this.props.textarea ? 'textarea' : 'input';
    return React.createElement(
      'div',
      { className: classList },
      this._renderHiddenInput(),
      React.createElement(InputElement, _extends({ ref: 'entry', type: 'text',
        disabled: this.props.disabled
      }, this.props.inputProps, {
        placeholder: this.props.placeholder,
        className: inputClassList,
        value: this.state.entryValue,
        onChange: this._onChange,
        onKeyDown: this._onKeyDown,
        onKeyPress: this.props.onKeyPress,
        onKeyUp: this.props.onKeyUp,
        onFocus: this._onFocus,
        onBlur: this._onBlur
      })),
      this.state.showResults && this._renderIncrementalSearchResults()
    );
  },

  _onFocus: function (event) {
    this.setState({ isFocused: true, showResults: true }, function () {
      this._onTextEntryUpdated();
    }.bind(this));
    if (this.props.onFocus) {
      return this.props.onFocus(event);
    }
  },

  _onBlur: function (event) {
    this.setState({ isFocused: false }, function () {
      this._onTextEntryUpdated();
    }.bind(this));
    if (this.props.onBlur) {
      return this.props.onBlur(event);
    }
  },

  _renderHiddenInput: function () {
    if (!this.props.name) {
      return null;
    }

    return React.createElement('input', {
      type: 'hidden',
      name: this.props.name,
      value: this.state.selection
    });
  },

  _generateSearchFunction: function () {
    var searchOptionsProp = this.props.searchOptions;
    var filterOptionProp = this.props.filterOption;
    if (typeof searchOptionsProp === 'function') {
      if (filterOptionProp !== null) {
        console.warn('searchOptions prop is being used, filterOption prop will be ignored');
      }
      return searchOptionsProp;
    } else if (typeof filterOptionProp === 'function') {
      return function (value, options) {
        return options.filter(function (o) {
          return filterOptionProp(value, o);
        });
      };
    } else {
      var mapper;
      if (typeof filterOptionProp === 'string') {
        mapper = Accessor.generateAccessor(filterOptionProp);
      } else {
        mapper = Accessor.IDENTITY_FN;
      }
      return function (value, options) {
        return fuzzy.filter(value, options, { extract: mapper }).map(function (res) {
          return options[res.index];
        });
      };
    }
  },

  _hasHint: function () {
    return this.state.searchResults.length > 0 || this._hasCustomValue();
  }
});

module.exports = Typeahead;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LmpzIl0sIm5hbWVzIjpbIkFjY2Vzc29yIiwicmVxdWlyZSIsIlJlYWN0IiwiVHlwZWFoZWFkU2VsZWN0b3IiLCJLZXlFdmVudCIsImZ1enp5IiwiY2xhc3NOYW1lcyIsIlR5cGVhaGVhZCIsImNyZWF0ZUNsYXNzIiwicHJvcFR5cGVzIiwibmFtZSIsIlByb3BUeXBlcyIsInN0cmluZyIsImN1c3RvbUNsYXNzZXMiLCJvYmplY3QiLCJtYXhWaXNpYmxlIiwibnVtYmVyIiwicmVzdWx0c1RydW5jYXRlZE1lc3NhZ2UiLCJvcHRpb25zIiwiYXJyYXkiLCJhbGxvd0N1c3RvbVZhbHVlcyIsImluaXRpYWxWYWx1ZSIsInZhbHVlIiwicGxhY2Vob2xkZXIiLCJkaXNhYmxlZCIsImJvb2wiLCJ0ZXh0YXJlYSIsImlucHV0UHJvcHMiLCJvbk9wdGlvblNlbGVjdGVkIiwiZnVuYyIsIm9uQ2hhbmdlIiwib25LZXlEb3duIiwib25LZXlQcmVzcyIsIm9uS2V5VXAiLCJvbkZvY3VzIiwib25CbHVyIiwiZmlsdGVyT3B0aW9uIiwib25lT2ZUeXBlIiwic2VhcmNoT3B0aW9ucyIsImRpc3BsYXlPcHRpb24iLCJpbnB1dERpc3BsYXlPcHRpb24iLCJmb3JtSW5wdXRPcHRpb24iLCJkZWZhdWx0Q2xhc3NOYW1lcyIsImN1c3RvbUxpc3RDb21wb25lbnQiLCJlbGVtZW50Iiwic2hvd09wdGlvbnNXaGVuRW1wdHkiLCJnZXREZWZhdWx0UHJvcHMiLCJvcHRpb24iLCJldmVudCIsImdldEluaXRpYWxTdGF0ZSIsInNlYXJjaFJlc3VsdHMiLCJnZXRPcHRpb25zRm9yVmFsdWUiLCJwcm9wcyIsImVudHJ5VmFsdWUiLCJzZWxlY3Rpb24iLCJzZWxlY3Rpb25JbmRleCIsImlzRm9jdXNlZCIsInNob3dSZXN1bHRzIiwiX3Nob3VsZFNraXBTZWFyY2giLCJpbnB1dCIsImVtcHR5VmFsdWUiLCJ0cmltIiwibGVuZ3RoIiwic3RhdGUiLCJfZ2VuZXJhdGVTZWFyY2hGdW5jdGlvbiIsInNldEVudHJ5VGV4dCIsInJlZnMiLCJlbnRyeSIsIl9vblRleHRFbnRyeVVwZGF0ZWQiLCJmb2N1cyIsIl9oYXNDdXN0b21WYWx1ZSIsImluZGV4T2YiLCJfZ2V0Q3VzdG9tVmFsdWUiLCJfcmVuZGVySW5jcmVtZW50YWxTZWFyY2hSZXN1bHRzIiwic2xpY2UiLCJfb25PcHRpb25TZWxlY3RlZCIsImdlbmVyYXRlT3B0aW9uVG9TdHJpbmdGb3IiLCJnZXRTZWxlY3Rpb24iLCJpbmRleCIsIl9yZXBsYWNlV29yZCIsInRva2VucyIsInNwbGl0IiwibkVudHJ5Iiwib3B0aW9uU3RyaW5nIiwiZm9ybUlucHV0T3B0aW9uU3RyaW5nIiwicmVwbGFjZVdvcmQiLCJsYXN0UmVwbGFjZVdvcmRJbmRleCIsImxhc3RJbmRleE9mIiwidmFsdWVCZWZvcmUiLCJzdWJzdHJpbmciLCJzZXRTdGF0ZSIsImNvbmNhdCIsIl9vbkVudGVyIiwiX29uRXNjYXBlIiwiX29uVGFiIiwiZXZlbnRNYXAiLCJldmVudHMiLCJET01fVktfVVAiLCJuYXZVcCIsIkRPTV9WS19ET1dOIiwibmF2RG93biIsIkRPTV9WS19SRVRVUk4iLCJET01fVktfRU5URVIiLCJET01fVktfRVNDQVBFIiwiRE9NX1ZLX1RBQiIsIl9uYXYiLCJkZWx0YSIsIl9oYXNIaW50IiwibmV3SW5kZXgiLCJfb25DaGFuZ2UiLCJfb25LZXlEb3duIiwic2hpZnRLZXkiLCJoYW5kbGVyIiwia2V5Q29kZSIsInByZXZlbnREZWZhdWx0IiwiY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyIsIm5leHRQcm9wcyIsIkJvb2xlYW4iLCJyZW5kZXIiLCJpbnB1dENsYXNzZXMiLCJpbnB1dENsYXNzTGlzdCIsImNsYXNzZXMiLCJ0eXBlYWhlYWQiLCJjbGFzc05hbWUiLCJjbGFzc0xpc3QiLCJJbnB1dEVsZW1lbnQiLCJfcmVuZGVySGlkZGVuSW5wdXQiLCJfb25Gb2N1cyIsIl9vbkJsdXIiLCJiaW5kIiwic2VhcmNoT3B0aW9uc1Byb3AiLCJmaWx0ZXJPcHRpb25Qcm9wIiwiY29uc29sZSIsIndhcm4iLCJmaWx0ZXIiLCJvIiwibWFwcGVyIiwiZ2VuZXJhdGVBY2Nlc3NvciIsIklERU5USVRZX0ZOIiwiZXh0cmFjdCIsIm1hcCIsInJlcyIsIm1vZHVsZSIsImV4cG9ydHMiXSwibWFwcGluZ3MiOiI7O0FBQUEsSUFBSUEsV0FBV0MsUUFBUSxhQUFSLENBQWY7QUFDQSxJQUFJQyxRQUFRRCxRQUFRLE9BQVIsQ0FBWjtBQUNBLElBQUlFLG9CQUFvQkYsUUFBUSxZQUFSLENBQXhCO0FBQ0EsSUFBSUcsV0FBV0gsUUFBUSxhQUFSLENBQWY7QUFDQSxJQUFJSSxRQUFRSixRQUFRLE9BQVIsQ0FBWjtBQUNBLElBQUlLLGFBQWFMLFFBQVEsWUFBUixDQUFqQjs7QUFFQTs7Ozs7O0FBTUEsSUFBSU0sWUFBWUwsTUFBTU0sV0FBTixDQUFrQjtBQUFBOztBQUNoQ0MsYUFBVztBQUNUQyxVQUFNUixNQUFNUyxTQUFOLENBQWdCQyxNQURiO0FBRVRDLG1CQUFlWCxNQUFNUyxTQUFOLENBQWdCRyxNQUZ0QjtBQUdUQyxnQkFBWWIsTUFBTVMsU0FBTixDQUFnQkssTUFIbkI7QUFJVEMsNkJBQXlCZixNQUFNUyxTQUFOLENBQWdCQyxNQUpoQztBQUtUTSxhQUFTaEIsTUFBTVMsU0FBTixDQUFnQlEsS0FMaEI7QUFNVEMsdUJBQW1CbEIsTUFBTVMsU0FBTixDQUFnQkssTUFOMUI7QUFPVEssa0JBQWNuQixNQUFNUyxTQUFOLENBQWdCQyxNQVByQjtBQVFUVSxXQUFPcEIsTUFBTVMsU0FBTixDQUFnQkMsTUFSZDtBQVNUVyxpQkFBYXJCLE1BQU1TLFNBQU4sQ0FBZ0JDLE1BVHBCO0FBVVRZLGNBQVV0QixNQUFNUyxTQUFOLENBQWdCYyxJQVZqQjtBQVdUQyxjQUFVeEIsTUFBTVMsU0FBTixDQUFnQmMsSUFYakI7QUFZVEUsZ0JBQVl6QixNQUFNUyxTQUFOLENBQWdCRyxNQVpuQjtBQWFUYyxzQkFBa0IxQixNQUFNUyxTQUFOLENBQWdCa0IsSUFiekI7QUFjVEMsY0FBVTVCLE1BQU1TLFNB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QixFQUF3QmlILENBQXhCLENBQVA7QUFBb0MsU0FBakUsQ0FBUDtBQUNELE9BRkQ7QUFHRCxLQUpNLE1BSUE7QUFDTCxVQUFJQyxNQUFKO0FBQ0EsVUFBSSxPQUFPTCxnQkFBUCxLQUE0QixRQUFoQyxFQUEwQztBQUN4Q0ssaUJBQVN4SSxTQUFTeUksZ0JBQVQsQ0FBMEJOLGdCQUExQixDQUFUO0FBQ0QsT0FGRCxNQUVPO0FBQ0xLLGlCQUFTeEksU0FBUzBJLFdBQWxCO0FBQ0Q7QUFDRCxhQUFPLFVBQVNwSCxLQUFULEVBQWdCSixPQUFoQixFQUF5QjtBQUM5QixlQUFPYixNQUNKaUksTUFESSxDQUNHaEgsS0FESCxFQUNVSixPQURWLEVBQ21CLEVBQUN5SCxTQUFTSCxNQUFWLEVBRG5CLEVBRUpJLEdBRkksQ0FFQSxVQUFTQyxHQUFULEVBQWM7QUFBRSxpQkFBTzNILFFBQVEySCxJQUFJL0QsS0FBWixDQUFQO0FBQTRCLFNBRjVDLENBQVA7QUFHRCxPQUpEO0FBS0Q7QUFDRixHQXBaK0I7O0FBc1poQzZCLFlBQVUsWUFBVztBQUNuQixXQUFPLEtBQUs1QyxLQUFMLENBQVdiLGFBQVgsQ0FBeUJZLE1BQXpCLEdBQWtDLENBQWxDLElBQXVDLEtBQUtRLGVBQUwsRUFBOUM7QUFDRDtBQXhaK0IsQ0FBbEIsQ0FBaEI7O0FBMlpBd0UsT0FBT0MsT0FBUCxHQUFpQnhJLFNBQWpCIiwiZmlsZSI6ImluZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsidmFyIEFjY2Vzc29yID0gcmVxdWlyZSgnLi4vYWNjZXNzb3InKTtcbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG52YXIgVHlwZWFoZWFkU2VsZWN0b3IgPSByZXF1aXJlKCcuL3NlbGVjdG9yJyk7XG52YXIgS2V5RXZlbnQgPSByZXF1aXJlKCcuLi9rZXlldmVudCcpO1xudmFyIGZ1enp5ID0gcmVxdWlyZSgnZnV6enknKTtcbnZhciBjbGFzc05hbWVzID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xuXG4vKipcbiAqIEEgXCJ0eXBlYWhlYWRcIiwgYW4gYXV0by1jb21wbGV0aW5nIHRleHQgaW5wdXRcbiAqXG4gKiBSZW5kZXJzIGFuIHRleHQgaW5wdXQgdGhhdCBzaG93cyBvcHRpb25zIG5lYXJieSB0aGF0IHlvdSBjYW4gdXNlIHRoZVxuICoga2V5Ym9hcmQgb3IgbW91c2UgdG8gc2VsZWN0LiAgUmVxdWlyZXMgQ1NTIGZvciBNQVNTSVZFIERBTUFHRS5cbiAqL1xudmFyIFR5cGVhaGVhZCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgcHJvcFR5cGVzOiB7XG4gICAgbmFtZTogUmVhY3QuUHJvcFR5cGVzLnN0cmluZyxcbiAgICBjdXN0b21DbGFzc2VzOiBSZWFjdC5Qcm9wVHlwZXMub2JqZWN0LFxuICAgIG1heFZpc2libGU6IFJlYWN0LlByb3BUeXBlcy5udW1iZXIsXG4gICAgcmVzdWx0c1RydW5jYXRlZE1lc3NhZ2U6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmcsXG4gICAgb3B0aW9uczogUmVhY3QuUHJvcFR5cGVzLmFycmF5LFxuICAgIGFsbG93Q3VzdG9tVmFsdWVzOiBSZWFjdC5Qcm9wVHlwZXMubnVtYmVyLFxuICAgIGluaXRpYWxWYWx1ZTogUmVhY3QuUHJvcFR5cGVzLnN0cmluZyxcbiAgICB2YWx1ZTogUmVhY3QuUHJvcFR5cGVzLnN0cmluZyxcbiAgICBwbGFjZWhvbGRlcjogUmVhY3QuUHJvcFR5cGVzLnN0cmluZyxcbiAgICBkaXNhYmxlZDogUmVhY3QuUHJvcFR5cGVzLmJvb2wsXG4gICAgdGV4dGFyZWE6IFJlYWN0LlByb3BUeXBlcy5ib29sLFxuICAgIGlucHV0UHJvcHM6IFJlYWN0LlByb3BUeXBlcy5vYmplY3QsXG4gICAgb25PcHRpb25TZWxlY3RlZDogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsXG4gICAgb25DaGFuZ2U6IFJlYWN0LlByb3BUeXBlcy5mdW5jLFxuICAgIG9uS2V5RG93bjogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsXG4gICAgb25LZXlQcmVzczogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsXG4gICAgb25LZXlVcDogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsXG4gICAgb25Gb2N1czogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsXG4gICAgb25CbHVyOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYyxcbiAgICBmaWx0ZXJPcHRpb246IFJlYWN0LlByb3BUeXBlcy5vbmVPZlR5cGUoW1xuICAgICAgUmVhY3QuUHJvcFR5cGVzLnN0cmluZyxcbiAgICAgIFJlYWN0LlByb3BUeXBlcy5mdW5jXG4gICAgXSksXG4gICAgc2VhcmNoT3B0aW9uczogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsXG4gICAgZGlzcGxheU9wdGlvbjogUmVhY3QuUHJvcFR5cGVzLm9uZU9mVHlwZShbXG4gICAgICBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLFxuICAgICAgUmVhY3QuUHJvcFR5cGVzLmZ1bmNcbiAgICBdKSxcbiAgICBpbnB1dERpc3BsYXlPcHRpb246IFJlYWN0LlByb3BUeXBlcy5vbmVPZlR5cGUoW1xuICAgICAgUmVhY3QuUHJvcFR5cGVzLnN0cmluZyxcbiAgICAgIFJlYWN0LlByb3BUeXBlcy5mdW5jXG4gICAgXSksXG4gICAgZm9ybUlucHV0T3B0aW9uOiBSZWFjdC5Qcm9wVHlwZXMub25lT2ZUeXBlKFtcbiAgICAgIFJlYWN0LlByb3BUeXBlcy5zdHJpbmcsXG4gICAgICBSZWFjdC5Qcm9wVHlwZXMuZnVuY1xuICAgIF0pLFxuICAgIGRlZmF1bHRDbGFzc05hbWVzOiBSZWFjdC5Qcm9wVHlwZXMuYm9vbCxcbiAgICBjdXN0b21MaXN0Q29tcG9uZW50OiBSZWFjdC5Qcm9wVHlwZXMub25lT2ZUeXBlKFtcbiAgICAgIFJlYWN0LlByb3BUeXBlcy5lbGVtZW50LFxuICAgICAgUmVhY3QuUHJvcFR5cGVzLmZ1bmNcbiAgICBdKSxcbiAgICBzaG93T3B0aW9uc1doZW5FbXB0eTogUmVhY3QuUHJvcFR5cGVzLmJvb2xcbiAgfSxcblxuICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7XG4gICAgICBvcHRpb25zOiBbXSxcbiAgICAgIGN1c3RvbUNsYXNzZXM6IHt9LFxuICAgICAgYWxsb3dDdXN0b21WYWx1ZXM6IDAsXG4gICAgICBpbml0aWFsVmFsdWU6IFwiXCIsXG4gICAgICB2YWx1ZTogXCJcIixcbiAgICAgIHBsYWNlaG9sZGVyOiBcIlwiLFxuICAgICAgZGlzYWJsZWQ6IGZhbHNlLFxuICAgICAgdGV4dGFyZWE6IGZhbHNlLFxuICAgICAgaW5wdXRQcm9wczoge30sXG4gICAgICBvbk9wdGlvblNlbGVjdGVkOiBmdW5jdGlvbihvcHRpb24pIHt9LFxuICAgICAgb25DaGFuZ2U6IGZ1bmN0aW9uKGV2ZW50KSB7fSxcbiAgICAgIG9uS2V5RG93bjogZnVuY3Rpb24oZXZlbnQpIHt9LFxuICAgICAgb25LZXlQcmVzczogZnVuY3Rpb24oZXZlbnQpIHt9LFxuICAgICAgb25LZXlVcDogZnVuY3Rpb24oZXZlbnQpIHt9LFxuICAgICAgb25Gb2N1czogZnVuY3Rpb24oZXZlbnQpIHt9LFxuICAgICAgb25CbHVyOiBmdW5jdGlvbihldmVudCkge30sXG4gICAgICBmaWx0ZXJPcHRpb246IG51bGwsXG4gICAgICBzZWFyY2hPcHRpb25zOiBudWxsLFxuICAgICAgaW5wdXREaXNwbGF5T3B0aW9uOiBudWxsLFxuICAgICAgZGVmYXVsdENsYXNzTmFtZXM6IHRydWUsXG4gICAgICBjdXN0b21MaXN0Q29tcG9uZW50OiBUeXBlYWhlYWRTZWxlY3RvcixcbiAgICAgIHNob3dPcHRpb25zV2hlbkVtcHR5OiBmYWxzZSxcbiAgICAgIHJlc3VsdHNUcnVuY2F0ZWRNZXNzYWdlOiBudWxsXG4gICAgfTtcbiAgfSxcblxuICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7XG4gICAgICAvLyBUaGUgb3B0aW9ucyBtYXRjaGluZyB0aGUgZW50cnkgdmFsdWVcbiAgICAgIHNlYXJjaFJlc3VsdHM6IHRoaXMuZ2V0T3B0aW9uc0ZvclZhbHVlKHRoaXMucHJvcHMuaW5pdGlhbFZhbHVlLCB0aGlzLnByb3BzLm9wdGlvbnMpLFxuXG4gICAgICAvLyBUaGlzIHNob3VsZCBiZSBjYWxsZWQgc29tZXRoaW5nIGVsc2UsIFwiZW50cnlWYWx1ZVwiXG4gICAgICBlbnRyeVZhbHVlOiB0aGlzLnByb3BzLnZhbHVlIHx8IHRoaXMucHJvcHMuaW5pdGlhbFZhbHVlLFxuXG4gICAgICAvLyBBIHZhbGlkIHR5cGVhaGVhZCB2YWx1ZVxuICAgICAgc2VsZWN0aW9uOiB0aGlzLnByb3BzLnZhbHVlLFxuXG4gICAgICAvLyBJbmRleCBvZiB0aGUgc2VsZWN0aW9uXG4gICAgICBzZWxlY3Rpb25JbmRleDogbnVsbCxcblxuICAgICAgLy8gS2VlcCB0cmFjayBvZiB0aGUgZm9jdXMgc3RhdGUgb2YgdGhlIGlucHV0IGVsZW1lbnQsIHRvIGRldGVybWluZVxuICAgICAgLy8gd2hldGhlciB0byBzaG93IG9wdGlvbnMgd2hlbiBlbXB0eSAoaWYgc2hvd09wdGlvbnNXaGVuRW1wdHkgaXMgdHJ1ZSlcbiAgICAgIGlzRm9jdXNlZDogZmFsc2UsXG5cbiAgICAgIC8vIHRydWUgd2hlbiBmb2N1c2VkLCBmYWxzZSBvbk9wdGlvblNlbGVjdGVkXG4gICAgICBzaG93UmVzdWx0czogZmFsc2VcbiAgICB9O1xuICB9LFxuXG4gIF9zaG91bGRTa2lwU2VhcmNoOiBmdW5jdGlvbihpbnB1dCkge1xuICAgIHZhciBlbXB0eVZhbHVlID0gIWlucHV0IHx8IGlucHV0LnRyaW0oKS5sZW5ndGggPT0gMDtcblxuICAgIC8vIHRoaXMuc3RhdGUgbXVzdCBiZSBjaGVja2VkIGJlY2F1c2UgaXQgbWF5IG5vdCBiZSBkZWZpbmVkIHlldCBpZiB0aGlzIGZ1bmN0aW9uXG4gICAgLy8gaXMgY2FsbGVkIGZyb20gd2l0aGluIGdldEluaXRpYWxTdGF0ZVxuICAgIHZhciBpc0ZvY3VzZWQgPSB0aGlzLnN0YXRlICYmIHRoaXMuc3RhdGUuaXNGb2N1c2VkO1xuICAgIHJldHVybiAhKHRoaXMucHJvcHMuc2hvd09wdGlvbnNXaGVuRW1wdHkgJiYgaXNGb2N1c2VkKSAmJiBlbXB0eVZhbHVlO1xuICB9LFxuXG4gIGdldE9wdGlvbnNGb3JWYWx1ZTogZnVuY3Rpb24odmFsdWUsIG9wdGlvbnMpIHtcbiAgICBpZiAodGhpcy5fc2hvdWxkU2tpcFNlYXJjaCh2YWx1ZSkpIHsgcmV0dXJuIFtdOyB9XG5cbiAgICB2YXIgc2VhcmNoT3B0aW9ucyA9IHRoaXMuX2dlbmVyYXRlU2VhcmNoRnVuY3Rpb24oKTtcbiAgICByZXR1cm4gc2VhcmNoT3B0aW9ucyh2YWx1ZSwgb3B0aW9ucyk7XG4gIH0sXG5cbiAgc2V0RW50cnlUZXh0OiBmdW5jdGlvbih2YWx1ZSkge1xuICAgIHRoaXMucmVmcy5lbnRyeS52YWx1ZSA9IHZhbHVlO1xuICAgIHRoaXMuX29uVGV4dEVudHJ5VXBkYXRlZCgpO1xuICB9LFxuXG4gIGZvY3VzOiBmdW5jdGlvbigpe1xuICAgIHRoaXMucmVmcy5lbnRyeS5mb2N1cygpXG4gIH0sXG5cbiAgX2hhc0N1c3RvbVZhbHVlOiBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5wcm9wcy5hbGxvd0N1c3RvbVZhbHVlcyA+IDAgJiZcbiAgICAgIHRoaXMuc3RhdGUuZW50cnlWYWx1ZS5sZW5ndGggPj0gdGhpcy5wcm9wcy5hbGxvd0N1c3RvbVZhbHVlcyAmJlxuICAgICAgdGhpcy5zdGF0ZS5zZWFyY2hSZXN1bHRzLmluZGV4T2YodGhpcy5zdGF0ZS5lbnRyeVZhbHVlKSA8IDApIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH0sXG5cbiAgX2dldEN1c3RvbVZhbHVlOiBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5faGFzQ3VzdG9tVmFsdWUoKSkge1xuICAgICAgcmV0dXJuIHRoaXMuc3RhdGUuZW50cnlWYWx1ZTtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH0sXG5cbiAgX3JlbmRlckluY3JlbWVudGFsU2VhcmNoUmVzdWx0czogZnVuY3Rpb24oKSB7XG4gICAgLy8gTm90aGluZyBoYXMgYmVlbiBlbnRlcmVkIGludG8gdGhlIHRleHRib3hcbiAgICBpZiAodGhpcy5fc2hvdWxkU2tpcFNlYXJjaCh0aGlzLnN0YXRlLmVudHJ5VmFsdWUpKSB7XG4gICAgICByZXR1cm4gXCJcIjtcbiAgICB9XG5cbiAgICAvLyBTb21ldGhpbmcgd2FzIGp1c3Qgc2VsZWN0ZWRcbiAgICBpZiAodGhpcy5zdGF0ZS5zZWxlY3Rpb24pIHtcbiAgICAgIHJldHVybiBcIlwiO1xuICAgIH1cblxuICAgIHJldHVybiAoXG4gICAgICA8dGhpcy5wcm9wcy5jdXN0b21MaXN0Q29tcG9uZW50XG4gICAgICAgIHJlZj1cInNlbFwiIG9wdGlvbnM9e3RoaXMucHJvcHMubWF4VmlzaWJsZSA/IHRoaXMuc3RhdGUuc2VhcmNoUmVzdWx0cy5zbGljZSgwLCB0aGlzLnByb3BzLm1heFZpc2libGUpIDogdGhpcy5zdGF0ZS5zZWFyY2hSZXN1bHRzfVxuICAgICAgICBhcmVSZXN1bHRzVHJ1bmNhdGVkPXt0aGlzLnByb3BzLm1heFZpc2libGUgJiYgdGhpcy5zdGF0ZS5zZWFyY2hSZXN1bHRzLmxlbmd0aCA+IHRoaXMucHJvcHMubWF4VmlzaWJsZX1cbiAgICAgICAgcmVzdWx0c1RydW5jYXRlZE1lc3NhZ2U9e3RoaXMucHJvcHMucmVzdWx0c1RydW5jYXRlZE1lc3NhZ2V9XG4gICAgICAgIG9uT3B0aW9uU2VsZWN0ZWQ9e3RoaXMuX29uT3B0aW9uU2VsZWN0ZWR9XG4gICAgICAgIGFsbG93Q3VzdG9tVmFsdWVzPXt0aGlzLnByb3BzLmFsbG93Q3VzdG9tVmFsdWVzfVxuICAgICAgICBjdXN0b21WYWx1ZT17dGhpcy5fZ2V0Q3VzdG9tVmFsdWUoKX1cbiAgICAgICAgY3VzdG9tQ2xhc3Nlcz17dGhpcy5wcm9wcy5jdXN0b21DbGFzc2VzfVxuICAgICAgICBzZWxlY3Rpb25JbmRleD17dGhpcy5zdGF0ZS5zZWxlY3Rpb25JbmRleH1cbiAgICAgICAgZGVmYXVsdENsYXNzTmFtZXM9e3RoaXMucHJvcHMuZGVmYXVsdENsYXNzTmFtZXN9XG4gICAgICAgIGRpc3BsYXlPcHRpb249e0FjY2Vzc29yLmdlbmVyYXRlT3B0aW9uVG9TdHJpbmdGb3IodGhpcy5wcm9wcy5kaXNwbGF5T3B0aW9uKX0gLz5cbiAgICApO1xuICB9LFxuXG4gIGdldFNlbGVjdGlvbjogZnVuY3Rpb24oKSB7XG4gICAgdmFyIGluZGV4ID0gdGhpcy5zdGF0ZS5zZWxlY3Rpb25JbmRleDtcbiAgICBpZiAodGhpcy5faGFzQ3VzdG9tVmFsdWUoKSkge1xuICAgICAgaWYgKGluZGV4ID09PSAwKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnN0YXRlLmVudHJ5VmFsdWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpbmRleC0tO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5zdGF0ZS5zZWFyY2hSZXN1bHRzW2luZGV4XTtcbiAgfSxcblxuICBfcmVwbGFjZVdvcmQodmFsdWUpIHtcbiAgICB2YXIgdG9rZW5zID0gdmFsdWUuc3BsaXQoJyAnKTtcbiAgICByZXR1cm4gKHRva2Vucy5sZW5ndGggPT09IDApID8gdmFsdWUgOiB0b2tlbnNbdG9rZW5zLmxlbmd0aCAtIDFdO1xuICB9LFxuXG4gIF9vbk9wdGlvblNlbGVjdGVkOiBmdW5jdGlvbihvcHRpb24sIGV2ZW50KSB7XG4gICAgdmFyIG5FbnRyeSA9IHRoaXMucmVmcy5lbnRyeTtcbiAgICBuRW50cnkuZm9jdXMoKTtcblxuICAgIHZhciBkaXNwbGF5T3B0aW9uID0gQWNjZXNzb3IuZ2VuZXJhdGVPcHRpb25Ub1N0cmluZ0Zvcih0aGlzLnByb3BzLmlucHV0RGlzcGxheU9wdGlvbiB8fCB0aGlzLnByb3BzLmRpc3BsYXlPcHRpb24pO1xuICAgIHZhciBvcHRpb25TdHJpbmcgPSBkaXNwbGF5T3B0aW9uKG9wdGlvbiwgMCk7XG5cbiAgICB2YXIgZm9ybUlucHV0T3B0aW9uID0gQWNjZXNzb3IuZ2VuZXJhdGVPcHRpb25Ub1N0cmluZ0Zvcih0aGlzLnByb3BzLmZvcm1JbnB1dE9wdGlvbiB8fCBkaXNwbGF5T3B0aW9uKTtcbiAgICB2YXIgZm9ybUlucHV0T3B0aW9uU3RyaW5nID0gZm9ybUlucHV0T3B0aW9uKG9wdGlvbik7XG5cbiAgICBuRW50cnkudmFsdWUgPSBvcHRpb25TdHJpbmc7XG5cbiAgICB2YXIgZW50cnlWYWx1ZSA9IHRoaXMuc3RhdGUuZW50cnlWYWx1ZTtcbiAgICB2YXIgcmVwbGFjZVdvcmQgPSB0aGlzLl9yZXBsYWNlV29yZChlbnRyeVZhbHVlKTtcbiAgICB2YXIgbGFzdFJlcGxhY2VXb3JkSW5kZXggPSBlbnRyeVZhbHVlLmxhc3RJbmRleE9mKHJlcGxhY2VXb3JkKTtcbiAgICB2YXIgdmFsdWVCZWZvcmUgPSBlbnRyeVZhbHVlLnN1YnN0cmluZygwLCBsYXN0UmVwbGFjZVdvcmRJbmRleCk7XG5cbiAgICB0aGlzLnNldFN0YXRlKHtzZWFyY2hSZXN1bHRzOiB0aGlzLmdldE9wdGlvbnNGb3JWYWx1ZShvcHRpb25TdHJpbmcsIHRoaXMucHJvcHMub3B0aW9ucyksXG4gICAgICAgICAgICAgICAgICAgc2VsZWN0aW9uOiBmb3JtSW5wdXRPcHRpb25TdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgZW50cnlWYWx1ZTogdmFsdWVCZWZvcmUuY29uY2F0KG9wdGlvblN0cmluZykgfSk7XG4gICAgcmV0dXJuIHRoaXMucHJvcHMub25PcHRpb25TZWxlY3RlZChvcHRpb24sIGV2ZW50KTtcbiAgfSxcblxuICBfb25UZXh0RW50cnlVcGRhdGVkOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgdmFsdWUgPSB0aGlzLnJlZnMuZW50cnkudmFsdWU7XG4gICAgdGhpcy5zZXRTdGF0ZSh7c2VhcmNoUmVzdWx0czogdGhpcy5nZXRPcHRpb25zRm9yVmFsdWUodmFsdWUsIHRoaXMucHJvcHMub3B0aW9ucyksXG4gICAgICAgICAgICAgICAgICAgc2VsZWN0aW9uOiAnJyxcbiAgICAgICAgICAgICAgICAgICBlbnRyeVZhbHVlOiB2YWx1ZX0pO1xuICB9LFxuXG4gIF9vbkVudGVyOiBmdW5jdGlvbihldmVudCkge1xuICAgIHZhciBzZWxlY3Rpb24gPSB0aGlzLmdldFNlbGVjdGlvbigpO1xuICAgIGlmICghc2VsZWN0aW9uKSB7XG4gICAgICByZXR1cm4gdGhpcy5wcm9wcy5vbktleURvd24oZXZlbnQpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fb25PcHRpb25TZWxlY3RlZChzZWxlY3Rpb24sIGV2ZW50KTtcbiAgfSxcblxuICBfb25Fc2NhcGU6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgc2VsZWN0aW9uSW5kZXg6IG51bGxcbiAgICB9KTtcbiAgfSxcblxuICBfb25UYWI6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgdmFyIHNlbGVjdGlvbiA9IHRoaXMuZ2V0U2VsZWN0aW9uKCk7XG4gICAgdmFyIG9wdGlvbiA9IHNlbGVjdGlvbiA/XG4gICAgICBzZWxlY3Rpb24gOiAodGhpcy5zdGF0ZS5zZWFyY2hSZXN1bHRzLmxlbmd0aCA+IDAgPyB0aGlzLnN0YXRlLnNlYXJjaFJlc3VsdHNbMF0gOiBudWxsKTtcblxuICAgIGlmIChvcHRpb24gPT09IG51bGwgJiYgdGhpcy5faGFzQ3VzdG9tVmFsdWUoKSkge1xuICAgICAgb3B0aW9uID0gdGhpcy5fZ2V0Q3VzdG9tVmFsdWUoKTtcbiAgICB9XG5cbiAgICBpZiAob3B0aW9uICE9PSBudWxsKSB7XG4gICAgICByZXR1cm4gdGhpcy5fb25PcHRpb25TZWxlY3RlZChvcHRpb24sIGV2ZW50KTtcbiAgICB9XG4gIH0sXG5cbiAgZXZlbnRNYXA6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgdmFyIGV2ZW50cyA9IHt9O1xuXG4gICAgZXZlbnRzW0tleUV2ZW50LkRPTV9WS19VUF0gPSB0aGlzLm5hdlVwO1xuICAgIGV2ZW50c1tLZXlFdmVudC5ET01fVktfRE9XTl0gPSB0aGlzLm5hdkRvd247XG4gICAgZXZlbnRzW0tleUV2ZW50LkRPTV9WS19SRVRVUk5dID0gZXZlbnRzW0tleUV2ZW50LkRPTV9WS19FTlRFUl0gPSB0aGlzLl9vbkVudGVyO1xuICAgIGV2ZW50c1tLZXlFdmVudC5ET01fVktfRVNDQVBFXSA9IHRoaXMuX29uRXNjYXBlO1xuICAgIGV2ZW50c1tLZXlFdmVudC5ET01fVktfVEFCXSA9IHRoaXMuX29uVGFiO1xuXG4gICAgcmV0dXJuIGV2ZW50cztcbiAgfSxcblxuICBfbmF2OiBmdW5jdGlvbihkZWx0YSkge1xuICAgIGlmICghdGhpcy5faGFzSGludCgpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciBuZXdJbmRleCA9IHRoaXMuc3RhdGUuc2VsZWN0aW9uSW5kZXggPT09IG51bGwgPyAoZGVsdGEgPT0gMSA/IDAgOiBkZWx0YSkgOiB0aGlzLnN0YXRlLnNlbGVjdGlvbkluZGV4ICsgZGVsdGE7XG4gICAgdmFyIGxlbmd0aCA9IHRoaXMucHJvcHMubWF4VmlzaWJsZSA/IHRoaXMuc3RhdGUuc2VhcmNoUmVzdWx0cy5zbGljZSgwLCB0aGlzLnByb3BzLm1heFZpc2libGUpLmxlbmd0aCA6IHRoaXMuc3RhdGUuc2VhcmNoUmVzdWx0cy5sZW5ndGg7XG4gICAgaWYgKHRoaXMuX2hhc0N1c3RvbVZhbHVlKCkpIHtcbiAgICAgIGxlbmd0aCArPSAxO1xuICAgIH1cblxuICAgIGlmIChuZXdJbmRleCA8IDApIHtcbiAgICAgIG5ld0luZGV4ICs9IGxlbmd0aDtcbiAgICB9IGVsc2UgaWYgKG5ld0luZGV4ID49IGxlbmd0aCkge1xuICAgICAgbmV3SW5kZXggLT0gbGVuZ3RoO1xuICAgIH1cblxuICAgIHRoaXMuc2V0U3RhdGUoe3NlbGVjdGlvbkluZGV4OiBuZXdJbmRleH0pO1xuICB9LFxuXG4gIG5hdkRvd246IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX25hdigxKTtcbiAgfSxcblxuICBuYXZVcDogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5fbmF2KC0xKTtcbiAgfSxcblxuICBfb25DaGFuZ2U6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgaWYgKHRoaXMucHJvcHMub25DaGFuZ2UpIHtcbiAgICAgIHRoaXMucHJvcHMub25DaGFuZ2UoZXZlbnQpO1xuICAgIH1cblxuICAgIHRoaXMuX29uVGV4dEVudHJ5VXBkYXRlZCgpO1xuICB9LFxuXG4gIF9vbktleURvd246IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgLy8gSWYgdGhlcmUgYXJlIG5vIHZpc2libGUgZWxlbWVudHMsIGRvbid0IHBlcmZvcm0gc2VsZWN0b3IgbmF2aWdhdGlvbi5cbiAgICAvLyBKdXN0IHBhc3MgdGhpcyB1cCB0byB0aGUgdXBzdHJlYW0gb25LZXlkb3duIGhhbmRsZXIuXG4gICAgLy8gQWxzbyBza2lwIGlmIHRoZSB1c2VyIGlzIHByZXNzaW5nIHRoZSBzaGlmdCBrZXksIHNpbmNlIG5vbmUgb2Ygb3VyIGhhbmRsZXJzIGFyZSBsb29raW5nIGZvciBzaGlmdFxuICAgIGlmICghdGhpcy5faGFzSGludCgpIHx8IGV2ZW50LnNoaWZ0S2V5KSB7XG4gICAgICByZXR1cm4gdGhpcy5wcm9wcy5vbktleURvd24oZXZlbnQpO1xuICAgIH1cblxuICAgIHZhciBoYW5kbGVyID0gdGhpcy5ldmVudE1hcCgpW2V2ZW50LmtleUNvZGVdO1xuXG4gICAgaWYgKGhhbmRsZXIpIHtcbiAgICAgIGhhbmRsZXIoZXZlbnQpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5wcm9wcy5vbktleURvd24oZXZlbnQpO1xuICAgIH1cbiAgICAvLyBEb24ndCBwcm9wYWdhdGUgdGhlIGtleXN0cm9rZSBiYWNrIHRvIHRoZSBET00vYnJvd3NlclxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gIH0sXG5cbiAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wczogZnVuY3Rpb24obmV4dFByb3BzKSB7XG4gICAgdmFyIHNlYXJjaFJlc3VsdHMgPSB0aGlzLmdldE9wdGlvbnNGb3JWYWx1ZSh0aGlzLnN0YXRlLmVudHJ5VmFsdWUsIG5leHRQcm9wcy5vcHRpb25zKTtcbiAgICB2YXIgc2hvd1Jlc3VsdHMgPSBCb29sZWFuKHNlYXJjaFJlc3VsdHMubGVuZ3RoKTtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIHNlYXJjaFJlc3VsdHM6IHNlYXJjaFJlc3VsdHMsXG4gICAgICBzaG93UmVzdWx0czogc2hvd1Jlc3VsdHNcbiAgICB9KTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBpbnB1dENsYXNzZXMgPSB7fTtcbiAgICBpbnB1dENsYXNzZXNbdGhpcy5wcm9wcy5jdXN0b21DbGFzc2VzLmlucHV0XSA9ICEhdGhpcy5wcm9wcy5jdXN0b21DbGFzc2VzLmlucHV0O1xuICAgIHZhciBpbnB1dENsYXNzTGlzdCA9IGNsYXNzTmFtZXMoaW5wdXRDbGFzc2VzKTtcblxuICAgIHZhciBjbGFzc2VzID0ge1xuICAgICAgdHlwZWFoZWFkOiB0aGlzLnByb3BzLmRlZmF1bHRDbGFzc05hbWVzXG4gICAgfTtcbiAgICBjbGFzc2VzW3RoaXMucHJvcHMuY2xhc3NOYW1lXSA9ICEhdGhpcy5wcm9wcy5jbGFzc05hbWU7XG4gICAgdmFyIGNsYXNzTGlzdCA9IGNsYXNzTmFtZXMoY2xhc3Nlcyk7XG5cbiAgICB2YXIgSW5wdXRFbGVtZW50ID0gdGhpcy5wcm9wcy50ZXh0YXJlYSA/ICd0ZXh0YXJlYScgOiAnaW5wdXQnO1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT17Y2xhc3NMaXN0fT5cbiAgICAgICAgeyB0aGlzLl9yZW5kZXJIaWRkZW5JbnB1dCgpIH1cbiAgICAgICAgPElucHV0RWxlbWVudCByZWY9XCJlbnRyeVwiIHR5cGU9XCJ0ZXh0XCJcbiAgICAgICAgICBkaXNhYmxlZD17dGhpcy5wcm9wcy5kaXNhYmxlZH1cbiAgICAgICAgICB7Li4udGhpcy5wcm9wcy5pbnB1dFByb3BzfVxuICAgICAgICAgIHBsYWNlaG9sZGVyPXt0aGlzLnByb3BzLnBsYWNlaG9sZGVyfVxuICAgICAgICAgIGNsYXNzTmFtZT17aW5wdXRDbGFzc0xpc3R9XG4gICAgICAgICAgdmFsdWU9e3RoaXMuc3RhdGUuZW50cnlWYWx1ZX1cbiAgICAgICAgICBvbkNoYW5nZT17dGhpcy5fb25DaGFuZ2V9XG4gICAgICAgICAgb25LZXlEb3duPXt0aGlzLl9vbktleURvd259XG4gICAgICAgICAgb25LZXlQcmVzcz17dGhpcy5wcm9wcy5vbktleVByZXNzfVxuICAgICAgICAgIG9uS2V5VXA9e3RoaXMucHJvcHMub25LZXlVcH1cbiAgICAgICAgICBvbkZvY3VzPXt0aGlzLl9vbkZvY3VzfVxuICAgICAgICAgIG9uQmx1cj17dGhpcy5fb25CbHVyfVxuICAgICAgICAvPlxuICAgICAgICB7IHRoaXMuc3RhdGUuc2hvd1Jlc3VsdHMgJiYgdGhpcy5fcmVuZGVySW5jcmVtZW50YWxTZWFyY2hSZXN1bHRzKCkgfVxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfSxcblxuICBfb25Gb2N1czogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICB0aGlzLnNldFN0YXRlKHtpc0ZvY3VzZWQ6IHRydWUsIHNob3dSZXN1bHRzOiB0cnVlfSwgZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5fb25UZXh0RW50cnlVcGRhdGVkKCk7XG4gICAgfS5iaW5kKHRoaXMpKTtcbiAgICBpZiAoIHRoaXMucHJvcHMub25Gb2N1cyApIHtcbiAgICAgIHJldHVybiB0aGlzLnByb3BzLm9uRm9jdXMoZXZlbnQpO1xuICAgIH1cbiAgfSxcblxuICBfb25CbHVyOiBmdW5jdGlvbihldmVudCkge1xuICAgIHRoaXMuc2V0U3RhdGUoe2lzRm9jdXNlZDogZmFsc2V9LCBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLl9vblRleHRFbnRyeVVwZGF0ZWQoKTtcbiAgICB9LmJpbmQodGhpcykpO1xuICAgIGlmICggdGhpcy5wcm9wcy5vbkJsdXIgKSB7XG4gICAgICByZXR1cm4gdGhpcy5wcm9wcy5vbkJsdXIoZXZlbnQpO1xuICAgIH1cbiAgfSxcblxuICBfcmVuZGVySGlkZGVuSW5wdXQ6IGZ1bmN0aW9uKCkge1xuICAgIGlmICghdGhpcy5wcm9wcy5uYW1lKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICByZXR1cm4gKFxuICAgICAgPGlucHV0XG4gICAgICAgIHR5cGU9XCJoaWRkZW5cIlxuICAgICAgICBuYW1lPXsgdGhpcy5wcm9wcy5uYW1lIH1cbiAgICAgICAgdmFsdWU9eyB0aGlzLnN0YXRlLnNlbGVjdGlvbiB9XG4gICAgICAvPlxuICAgICk7XG4gIH0sXG5cbiAgX2dlbmVyYXRlU2VhcmNoRnVuY3Rpb246IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzZWFyY2hPcHRpb25zUHJvcCA9IHRoaXMucHJvcHMuc2VhcmNoT3B0aW9ucztcbiAgICB2YXIgZmlsdGVyT3B0aW9uUHJvcCA9IHRoaXMucHJvcHMuZmlsdGVyT3B0aW9uO1xuICAgIGlmICh0eXBlb2Ygc2VhcmNoT3B0aW9uc1Byb3AgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGlmIChmaWx0ZXJPcHRpb25Qcm9wICE9PSBudWxsKSB7XG4gICAgICAgIGNvbnNvbGUud2Fybignc2VhcmNoT3B0aW9ucyBwcm9wIGlzIGJlaW5nIHVzZWQsIGZpbHRlck9wdGlvbiBwcm9wIHdpbGwgYmUgaWdub3JlZCcpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHNlYXJjaE9wdGlvbnNQcm9wO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGZpbHRlck9wdGlvblByb3AgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbih2YWx1ZSwgb3B0aW9ucykge1xuICAgICAgICByZXR1cm4gb3B0aW9ucy5maWx0ZXIoZnVuY3Rpb24obykgeyByZXR1cm4gZmlsdGVyT3B0aW9uUHJvcCh2YWx1ZSwgbyk7IH0pO1xuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIG1hcHBlcjtcbiAgICAgIGlmICh0eXBlb2YgZmlsdGVyT3B0aW9uUHJvcCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgbWFwcGVyID0gQWNjZXNzb3IuZ2VuZXJhdGVBY2Nlc3NvcihmaWx0ZXJPcHRpb25Qcm9wKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG1hcHBlciA9IEFjY2Vzc29yLklERU5USVRZX0ZOO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGZ1bmN0aW9uKHZhbHVlLCBvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiBmdXp6eVxuICAgICAgICAgIC5maWx0ZXIodmFsdWUsIG9wdGlvbnMsIHtleHRyYWN0OiBtYXBwZXJ9KVxuICAgICAgICAgIC5tYXAoZnVuY3Rpb24ocmVzKSB7IHJldHVybiBvcHRpb25zW3Jlcy5pbmRleF07IH0pO1xuICAgICAgfTtcbiAgICB9XG4gIH0sXG5cbiAgX2hhc0hpbnQ6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLnN0YXRlLnNlYXJjaFJlc3VsdHMubGVuZ3RoID4gMCB8fCB0aGlzLl9oYXNDdXN0b21WYWx1ZSgpO1xuICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBUeXBlYWhlYWQ7XG4iXX0=
},{"../accessor":3,"../keyevent":4,"./selector":10,"classnames":1,"fuzzy":2,"react":"react"}],9:[function(require,module,exports){
var React = window.React || require('react');
var classNames = require('classnames');

/**
 * A single option within the TypeaheadSelector
 */
var TypeaheadOption = React.createClass({
  displayName: 'TypeaheadOption',

  propTypes: {
    customClasses: React.PropTypes.object,
    customValue: React.PropTypes.string,
    onClick: React.PropTypes.func,
    children: React.PropTypes.string,
    hover: React.PropTypes.bool
  },

  getDefaultProps: function () {
    return {
      customClasses: {},
      onClick: function (event) {
        event.preventDefault();
      }
    };
  },

  render: function () {
    var classes = {};
    classes[this.props.customClasses.hover || "hover"] = !!this.props.hover;
    classes[this.props.customClasses.listItem] = !!this.props.customClasses.listItem;

    if (this.props.customValue) {
      classes[this.props.customClasses.customAdd] = !!this.props.customClasses.customAdd;
    }

    var classList = classNames(classes);

    // For some reason onClick is not fired when clicked on an option
    // onMouseDown is used here as a workaround of #205 and other
    // related tickets
    return React.createElement(
      'li',
      { className: classList, onClick: this._onClick, onMouseDown: this._onClick },
      React.createElement(
        'a',
        { href: 'javascript: void 0;', className: this._getClasses(), ref: 'anchor' },
        this.props.children
      )
    );
  },

  _getClasses: function () {
    var classes = {
      "typeahead-option": true
    };
    classes[this.props.customClasses.listAnchor] = !!this.props.customClasses.listAnchor;

    return classNames(classes);
  },

  _onClick: function (event) {
    event.preventDefault();
    return this.props.onClick(event);
  }
});

module.exports = TypeaheadOption;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm9wdGlvbi5qcyJdLCJuYW1lcyI6WyJSZWFjdCIsInJlcXVpcmUiLCJjbGFzc05hbWVzIiwiVHlwZWFoZWFkT3B0aW9uIiwiY3JlYXRlQ2xhc3MiLCJwcm9wVHlwZXMiLCJjdXN0b21DbGFzc2VzIiwiUHJvcFR5cGVzIiwib2JqZWN0IiwiY3VzdG9tVmFsdWUiLCJzdHJpbmciLCJvbkNsaWNrIiwiZnVuYyIsImNoaWxkcmVuIiwiaG92ZXIiLCJib29sIiwiZ2V0RGVmYXVsdFByb3BzIiwiZXZlbnQiLCJwcmV2ZW50RGVmYXVsdCIsInJlbmRlciIsImNsYXNzZXMiLCJwcm9wcyIsImxpc3RJdGVtIiwiY3VzdG9tQWRkIiwiY2xhc3NMaXN0IiwiX29uQ2xpY2siLCJfZ2V0Q2xhc3NlcyIsImxpc3RBbmNob3IiLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiQUFBQSxJQUFJQSxRQUFRQyxRQUFRLE9BQVIsQ0FBWjtBQUNBLElBQUlDLGFBQWFELFFBQVEsWUFBUixDQUFqQjs7QUFFQTs7O0FBR0EsSUFBSUUsa0JBQWtCSCxNQUFNSSxXQUFOLENBQWtCO0FBQUE7O0FBQ3RDQyxhQUFXO0FBQ1RDLG1CQUFlTixNQUFNTyxTQUFOLENBQWdCQyxNQUR0QjtBQUVUQyxpQkFBYVQsTUFBTU8sU0FBTixDQUFnQkcsTUFGcEI7QUFHVEMsYUFBU1gsTUFBTU8sU0FBTixDQUFnQkssSUFIaEI7QUFJVEMsY0FBVWIsTUFBTU8sU0FBTixDQUFnQkcsTUFKakI7QUFLVEksV0FBT2QsTUFBTU8sU0FBTixDQUFnQlE7QUFMZCxHQUQyQjs7QUFTdENDLG1CQUFpQixZQUFXO0FBQzFCLFdBQU87QUFDTFYscUJBQWUsRUFEVjtBQUVMSyxlQUFTLFVBQVNNLEtBQVQsRUFBZ0I7QUFDdkJBLGNBQU1DLGNBQU47QUFDRDtBQUpJLEtBQVA7QUFNRCxHQWhCcUM7O0FBa0J0Q0MsVUFBUSxZQUFXO0FBQ2pCLFFBQUlDLFVBQVUsRUFBZDtBQUNBQSxZQUFRLEtBQUtDLEtBQUwsQ0FBV2YsYUFBWCxDQUF5QlEsS0FBekIsSUFBa0MsT0FBMUMsSUFBcUQsQ0FBQyxDQUFDLEtBQUtPLEtBQUwsQ0FBV1AsS0FBbEU7QUFDQU0sWUFBUSxLQUFLQyxLQUFMLENBQVdmLGFBQVgsQ0FBeUJnQixRQUFqQyxJQUE2QyxDQUFDLENBQUMsS0FBS0QsS0FBTCxDQUFXZixhQUFYLENBQXlCZ0IsUUFBeEU7O0FBRUEsUUFBSSxLQUFLRCxLQUFMLENBQVdaLFdBQWYsRUFBNEI7QUFDMUJXLGNBQVEsS0FBS0MsS0FBTCxDQUFXZixhQUFYLENBQXlCaUIsU0FBakMsSUFBOEMsQ0FBQyxDQUFDLEtBQUtGLEtBQUwsQ0FBV2YsYUFBWCxDQUF5QmlCLFNBQXpFO0FBQ0Q7O0FBRUQsUUFBSUMsWUFBWXRCLFdBQVdrQixPQUFYLENBQWhCOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQ0U7QUFBQTtBQUFBLFFBQUksV0FBV0ksU0FBZixFQUEwQixTQUFTLEtBQUtDLFFBQXhDLEVBQWtELGFBQWEsS0FBS0EsUUFBcEU7QUFDRTtBQUFBO0FBQUEsVUFBRyxNQUFLLHFCQUFSLEVBQThCLFdBQVcsS0FBS0MsV0FBTCxFQUF6QyxFQUE2RCxLQUFJLFFBQWpFO0FBQ0ksYUFBS0wsS0FBTCxDQUFXUjtBQURmO0FBREYsS0FERjtBQU9ELEdBdkNxQzs7QUF5Q3RDYSxlQUFhLFlBQVc7QUFDdEIsUUFBSU4sVUFBVTtBQUNaLDBCQUFvQjtBQURSLEtBQWQ7QUFHQUEsWUFBUSxLQUFLQyxLQUFMLENBQVdmLGFBQVgsQ0FBeUJxQixVQUFqQyxJQUErQyxDQUFDLENBQUMsS0FBS04sS0FBTCxDQUFXZixhQUFYLENBQXlCcUIsVUFBMUU7O0FBRUEsV0FBT3pCLFdBQVdrQixPQUFYLENBQVA7QUFDRCxHQWhEcUM7O0FBa0R0Q0ssWUFBVSxVQUFTUixLQUFULEVBQWdCO0FBQ3hCQSxVQUFNQyxjQUFOO0FBQ0EsV0FBTyxLQUFLRyxLQUFMLENBQVdWLE9BQVgsQ0FBbUJNLEtBQW5CLENBQVA7QUFDRDtBQXJEcUMsQ0FBbEIsQ0FBdEI7O0FBeURBVyxPQUFPQyxPQUFQLEdBQWlCMUIsZUFBakIiLCJmaWxlIjoib3B0aW9uLmpzIiwic291cmNlc0NvbnRlbnQiOlsidmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbnZhciBjbGFzc05hbWVzID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xuXG4vKipcbiAqIEEgc2luZ2xlIG9wdGlvbiB3aXRoaW4gdGhlIFR5cGVhaGVhZFNlbGVjdG9yXG4gKi9cbnZhciBUeXBlYWhlYWRPcHRpb24gPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gIHByb3BUeXBlczoge1xuICAgIGN1c3RvbUNsYXNzZXM6IFJlYWN0LlByb3BUeXBlcy5vYmplY3QsXG4gICAgY3VzdG9tVmFsdWU6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmcsXG4gICAgb25DbGljazogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsXG4gICAgY2hpbGRyZW46IFJlYWN0LlByb3BUeXBlcy5zdHJpbmcsXG4gICAgaG92ZXI6IFJlYWN0LlByb3BUeXBlcy5ib29sXG4gIH0sXG5cbiAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgY3VzdG9tQ2xhc3Nlczoge30sXG4gICAgICBvbkNsaWNrOiBmdW5jdGlvbihldmVudCkge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgfVxuICAgIH07XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgY2xhc3NlcyA9IHt9O1xuICAgIGNsYXNzZXNbdGhpcy5wcm9wcy5jdXN0b21DbGFzc2VzLmhvdmVyIHx8IFwiaG92ZXJcIl0gPSAhIXRoaXMucHJvcHMuaG92ZXI7XG4gICAgY2xhc3Nlc1t0aGlzLnByb3BzLmN1c3RvbUNsYXNzZXMubGlzdEl0ZW1dID0gISF0aGlzLnByb3BzLmN1c3RvbUNsYXNzZXMubGlzdEl0ZW07XG5cbiAgICBpZiAodGhpcy5wcm9wcy5jdXN0b21WYWx1ZSkge1xuICAgICAgY2xhc3Nlc1t0aGlzLnByb3BzLmN1c3RvbUNsYXNzZXMuY3VzdG9tQWRkXSA9ICEhdGhpcy5wcm9wcy5jdXN0b21DbGFzc2VzLmN1c3RvbUFkZDtcbiAgICB9XG5cbiAgICB2YXIgY2xhc3NMaXN0ID0gY2xhc3NOYW1lcyhjbGFzc2VzKTtcblxuICAgIC8vIEZvciBzb21lIHJlYXNvbiBvbkNsaWNrIGlzIG5vdCBmaXJlZCB3aGVuIGNsaWNrZWQgb24gYW4gb3B0aW9uXG4gICAgLy8gb25Nb3VzZURvd24gaXMgdXNlZCBoZXJlIGFzIGEgd29ya2Fyb3VuZCBvZiAjMjA1IGFuZCBvdGhlclxuICAgIC8vIHJlbGF0ZWQgdGlja2V0c1xuICAgIHJldHVybiAoXG4gICAgICA8bGkgY2xhc3NOYW1lPXtjbGFzc0xpc3R9IG9uQ2xpY2s9e3RoaXMuX29uQ2xpY2t9IG9uTW91c2VEb3duPXt0aGlzLl9vbkNsaWNrfT5cbiAgICAgICAgPGEgaHJlZj1cImphdmFzY3JpcHQ6IHZvaWQgMDtcIiBjbGFzc05hbWU9e3RoaXMuX2dldENsYXNzZXMoKX0gcmVmPVwiYW5jaG9yXCI+XG4gICAgICAgICAgeyB0aGlzLnByb3BzLmNoaWxkcmVuIH1cbiAgICAgICAgPC9hPlxuICAgICAgPC9saT5cbiAgICApO1xuICB9LFxuXG4gIF9nZXRDbGFzc2VzOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgY2xhc3NlcyA9IHtcbiAgICAgIFwidHlwZWFoZWFkLW9wdGlvblwiOiB0cnVlLFxuICAgIH07XG4gICAgY2xhc3Nlc1t0aGlzLnByb3BzLmN1c3RvbUNsYXNzZXMubGlzdEFuY2hvcl0gPSAhIXRoaXMucHJvcHMuY3VzdG9tQ2xhc3Nlcy5saXN0QW5jaG9yO1xuXG4gICAgcmV0dXJuIGNsYXNzTmFtZXMoY2xhc3Nlcyk7XG4gIH0sXG5cbiAgX29uQ2xpY2s6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICByZXR1cm4gdGhpcy5wcm9wcy5vbkNsaWNrKGV2ZW50KTtcbiAgfVxufSk7XG5cblxubW9kdWxlLmV4cG9ydHMgPSBUeXBlYWhlYWRPcHRpb247XG4iXX0=
},{"classnames":1,"react":"react"}],10:[function(require,module,exports){
var React = window.React || require('react');
var TypeaheadOption = require('./option');
var classNames = require('classnames');

/**
 * Container for the options rendered as part of the autocompletion process
 * of the typeahead
 */
var TypeaheadSelector = React.createClass({
  displayName: 'TypeaheadSelector',

  propTypes: {
    options: React.PropTypes.array,
    allowCustomValues: React.PropTypes.number,
    customClasses: React.PropTypes.object,
    customValue: React.PropTypes.string,
    selectionIndex: React.PropTypes.number,
    onOptionSelected: React.PropTypes.func,
    displayOption: React.PropTypes.func.isRequired,
    defaultClassNames: React.PropTypes.bool,
    areResultsTruncated: React.PropTypes.bool,
    resultsTruncatedMessage: React.PropTypes.string
  },

  getDefaultProps: function () {
    return {
      selectionIndex: null,
      customClasses: {},
      allowCustomValues: 0,
      customValue: null,
      onOptionSelected: function (option) {},
      defaultClassNames: true
    };
  },

  render: function () {
    // Don't render if there are no options to display
    if (!this.props.options.length && this.props.allowCustomValues <= 0) {
      return false;
    }

    var classes = {
      "typeahead-selector": this.props.defaultClassNames
    };
    classes[this.props.customClasses.results] = this.props.customClasses.results;
    var classList = classNames(classes);

    // CustomValue should be added to top of results list with different class name
    var customValue = null;
    var customValueOffset = 0;
    if (this.props.customValue !== null) {
      customValueOffset++;
      customValue = React.createElement(
        TypeaheadOption,
        { ref: this.props.customValue, key: this.props.customValue,
          hover: this.props.selectionIndex === 0,
          customClasses: this.props.customClasses,
          customValue: this.props.customValue,
          onClick: this._onClick.bind(this, this.props.customValue) },
        this.props.customValue
      );
    }

    var results = this.props.options.map(function (result, i) {
      var displayString = this.props.displayOption(result, i);
      var uniqueKey = displayString + '_' + i;
      return React.createElement(
        TypeaheadOption,
        { ref: uniqueKey, key: uniqueKey,
          hover: this.props.selectionIndex === i + customValueOffset,
          customClasses: this.props.customClasses,
          onClick: this._onClick.bind(this, result) },
        displayString
      );
    }, this);

    if (this.props.areResultsTruncated && this.props.resultsTruncatedMessage !== null) {
      var resultsTruncatedClasses = {
        "results-truncated": this.props.defaultClassNames
      };
      resultsTruncatedClasses[this.props.customClasses.resultsTruncated] = this.props.customClasses.resultsTruncated;
      var resultsTruncatedClassList = classNames(resultsTruncatedClasses);

      results.push(React.createElement(
        'li',
        { key: 'results-truncated', className: resultsTruncatedClassList },
        this.props.resultsTruncatedMessage
      ));
    }

    return React.createElement(
      'ul',
      { className: classList },
      customValue,
      results
    );
  },

  _onClick: function (result, event) {
    return this.props.onOptionSelected(result, event);
  }

});

module.exports = TypeaheadSelector;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNlbGVjdG9yLmpzIl0sIm5hbWVzIjpbIlJlYWN0IiwicmVxdWlyZSIsIlR5cGVhaGVhZE9wdGlvbiIsImNsYXNzTmFtZXMiLCJUeXBlYWhlYWRTZWxlY3RvciIsImNyZWF0ZUNsYXNzIiwicHJvcFR5cGVzIiwib3B0aW9ucyIsIlByb3BUeXBlcyIsImFycmF5IiwiYWxsb3dDdXN0b21WYWx1ZXMiLCJudW1iZXIiLCJjdXN0b21DbGFzc2VzIiwib2JqZWN0IiwiY3VzdG9tVmFsdWUiLCJzdHJpbmciLCJzZWxlY3Rpb25JbmRleCIsIm9uT3B0aW9uU2VsZWN0ZWQiLCJmdW5jIiwiZGlzcGxheU9wdGlvbiIsImlzUmVxdWlyZWQiLCJkZWZhdWx0Q2xhc3NOYW1lcyIsImJvb2wiLCJhcmVSZXN1bHRzVHJ1bmNhdGVkIiwicmVzdWx0c1RydW5jYXRlZE1lc3NhZ2UiLCJnZXREZWZhdWx0UHJvcHMiLCJvcHRpb24iLCJyZW5kZXIiLCJwcm9wcyIsImxlbmd0aCIsImNsYXNzZXMiLCJyZXN1bHRzIiwiY2xhc3NMaXN0IiwiY3VzdG9tVmFsdWVPZmZzZXQiLCJfb25DbGljayIsImJpbmQiLCJtYXAiLCJyZXN1bHQiLCJpIiwiZGlzcGxheVN0cmluZyIsInVuaXF1ZUtleSIsInJlc3VsdHNUcnVuY2F0ZWRDbGFzc2VzIiwicmVzdWx0c1RydW5jYXRlZCIsInJlc3VsdHNUcnVuY2F0ZWRDbGFzc0xpc3QiLCJwdXNoIiwiZXZlbnQiLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiQUFBQSxJQUFJQSxRQUFRQyxRQUFRLE9BQVIsQ0FBWjtBQUNBLElBQUlDLGtCQUFrQkQsUUFBUSxVQUFSLENBQXRCO0FBQ0EsSUFBSUUsYUFBYUYsUUFBUSxZQUFSLENBQWpCOztBQUVBOzs7O0FBSUEsSUFBSUcsb0JBQW9CSixNQUFNSyxXQUFOLENBQWtCO0FBQUE7O0FBQ3hDQyxhQUFXO0FBQ1RDLGFBQVNQLE1BQU1RLFNBQU4sQ0FBZ0JDLEtBRGhCO0FBRVRDLHVCQUFtQlYs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a0MsS0FBS0ssS0FBTCxDQUFXSix1QkFBWCxLQUF1QyxJQUE3RSxFQUFtRjtBQUNqRixVQUFJaUIsMEJBQTBCO0FBQzVCLDZCQUFxQixLQUFLYixLQUFMLENBQVdQO0FBREosT0FBOUI7QUFHQW9CLDhCQUF3QixLQUFLYixLQUFMLENBQVdoQixhQUFYLENBQXlCOEIsZ0JBQWpELElBQXFFLEtBQUtkLEtBQUwsQ0FBV2hCLGFBQVgsQ0FBeUI4QixnQkFBOUY7QUFDQSxVQUFJQyw0QkFBNEJ4QyxXQUFXc0MsdUJBQVgsQ0FBaEM7O0FBRUFWLGNBQVFhLElBQVIsQ0FDRTtBQUFBO0FBQUEsVUFBSSxLQUFJLG1CQUFSLEVBQTRCLFdBQVdELHlCQUF2QztBQUNHLGFBQUtmLEtBQUwsQ0FBV0o7QUFEZCxPQURGO0FBS0Q7O0FBRUQsV0FDRTtBQUFBO0FBQUEsUUFBSSxXQUFXUSxTQUFmO0FBQ0lsQixpQkFESjtBQUVJaUI7QUFGSixLQURGO0FBTUQsR0F0RnVDOztBQXdGeENHLFlBQVUsVUFBU0csTUFBVCxFQUFpQlEsS0FBakIsRUFBd0I7QUFDaEMsV0FBTyxLQUFLakIsS0FBTCxDQUFXWCxnQkFBWCxDQUE0Qm9CLE1BQTVCLEVBQW9DUSxLQUFwQyxDQUFQO0FBQ0Q7O0FBMUZ1QyxDQUFsQixDQUF4Qjs7QUE4RkFDLE9BQU9DLE9BQVAsR0FBaUIzQyxpQkFBakIiLCJmaWxlIjoic2VsZWN0b3IuanMiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xudmFyIFR5cGVhaGVhZE9wdGlvbiA9IHJlcXVpcmUoJy4vb3B0aW9uJyk7XG52YXIgY2xhc3NOYW1lcyA9IHJlcXVpcmUoJ2NsYXNzbmFtZXMnKTtcblxuLyoqXG4gKiBDb250YWluZXIgZm9yIHRoZSBvcHRpb25zIHJlbmRlcmVkIGFzIHBhcnQgb2YgdGhlIGF1dG9jb21wbGV0aW9uIHByb2Nlc3NcbiAqIG9mIHRoZSB0eXBlYWhlYWRcbiAqL1xudmFyIFR5cGVhaGVhZFNlbGVjdG9yID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICBwcm9wVHlwZXM6IHtcbiAgICBvcHRpb25zOiBSZWFjdC5Qcm9wVHlwZXMuYXJyYXksXG4gICAgYWxsb3dDdXN0b21WYWx1ZXM6IFJlYWN0LlByb3BUeXBlcy5udW1iZXIsXG4gICAgY3VzdG9tQ2xhc3NlczogUmVhY3QuUHJvcFR5cGVzLm9iamVjdCxcbiAgICBjdXN0b21WYWx1ZTogUmVhY3QuUHJvcFR5cGVzLnN0cmluZyxcbiAgICBzZWxlY3Rpb25JbmRleDogUmVhY3QuUHJvcFR5cGVzLm51bWJlcixcbiAgICBvbk9wdGlvblNlbGVjdGVkOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYyxcbiAgICBkaXNwbGF5T3B0aW9uOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgIGRlZmF1bHRDbGFzc05hbWVzOiBSZWFjdC5Qcm9wVHlwZXMuYm9vbCxcbiAgICBhcmVSZXN1bHRzVHJ1bmNhdGVkOiBSZWFjdC5Qcm9wVHlwZXMuYm9vbCxcbiAgICByZXN1bHRzVHJ1bmNhdGVkTWVzc2FnZTogUmVhY3QuUHJvcFR5cGVzLnN0cmluZ1xuICB9LFxuXG4gIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHNlbGVjdGlvbkluZGV4OiBudWxsLFxuICAgICAgY3VzdG9tQ2xhc3Nlczoge30sXG4gICAgICBhbGxvd0N1c3RvbVZhbHVlczogMCxcbiAgICAgIGN1c3RvbVZhbHVlOiBudWxsLFxuICAgICAgb25PcHRpb25TZWxlY3RlZDogZnVuY3Rpb24ob3B0aW9uKSB7IH0sXG4gICAgICBkZWZhdWx0Q2xhc3NOYW1lczogdHJ1ZVxuICAgIH07XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAvLyBEb24ndCByZW5kZXIgaWYgdGhlcmUgYXJlIG5vIG9wdGlvbnMgdG8gZGlzcGxheVxuICAgIGlmICghdGhpcy5wcm9wcy5vcHRpb25zLmxlbmd0aCAmJiB0aGlzLnByb3BzLmFsbG93Q3VzdG9tVmFsdWVzIDw9IDApIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICB2YXIgY2xhc3NlcyA9IHtcbiAgICAgIFwidHlwZWFoZWFkLXNlbGVjdG9yXCI6IHRoaXMucHJvcHMuZGVmYXVsdENsYXNzTmFtZXNcbiAgICB9O1xuICAgIGNsYXNzZXNbdGhpcy5wcm9wcy5jdXN0b21DbGFzc2VzLnJlc3VsdHNdID0gdGhpcy5wcm9wcy5jdXN0b21DbGFzc2VzLnJlc3VsdHM7XG4gICAgdmFyIGNsYXNzTGlzdCA9IGNsYXNzTmFtZXMoY2xhc3Nlcyk7XG5cbiAgICAvLyBDdXN0b21WYWx1ZSBzaG91bGQgYmUgYWRkZWQgdG8gdG9wIG9mIHJlc3VsdHMgbGlzdCB3aXRoIGRpZmZlcmVudCBjbGFzcyBuYW1lXG4gICAgdmFyIGN1c3RvbVZhbHVlID0gbnVsbDtcbiAgICB2YXIgY3VzdG9tVmFsdWVPZmZzZXQgPSAwO1xuICAgIGlmICh0aGlzLnByb3BzLmN1c3RvbVZhbHVlICE9PSBudWxsKSB7XG4gICAgICBjdXN0b21WYWx1ZU9mZnNldCsrO1xuICAgICAgY3VzdG9tVmFsdWUgPSAoXG4gICAgICAgIDxUeXBlYWhlYWRPcHRpb24gcmVmPXt0aGlzLnByb3BzLmN1c3RvbVZhbHVlfSBrZXk9e3RoaXMucHJvcHMuY3VzdG9tVmFsdWV9XG4gICAgICAgICAgaG92ZXI9e3RoaXMucHJvcHMuc2VsZWN0aW9uSW5kZXggPT09IDB9XG4gICAgICAgICAgY3VzdG9tQ2xhc3Nlcz17dGhpcy5wcm9wcy5jdXN0b21DbGFzc2VzfVxuICAgICAgICAgIGN1c3RvbVZhbHVlPXt0aGlzLnByb3BzLmN1c3RvbVZhbHVlfVxuICAgICAgICAgIG9uQ2xpY2s9e3RoaXMuX29uQ2xpY2suYmluZCh0aGlzLCB0aGlzLnByb3BzLmN1c3RvbVZhbHVlKX0+XG4gICAgICAgICAgeyB0aGlzLnByb3BzLmN1c3RvbVZhbHVlIH1cbiAgICAgICAgPC9UeXBlYWhlYWRPcHRpb24+XG4gICAgICApO1xuICAgIH1cblxuICAgIHZhciByZXN1bHRzID0gdGhpcy5wcm9wcy5vcHRpb25zLm1hcChmdW5jdGlvbihyZXN1bHQsIGkpIHtcbiAgICAgIHZhciBkaXNwbGF5U3RyaW5nID0gdGhpcy5wcm9wcy5kaXNwbGF5T3B0aW9uKHJlc3VsdCwgaSk7XG4gICAgICB2YXIgdW5pcXVlS2V5ID0gZGlzcGxheVN0cmluZyArICdfJyArIGk7XG4gICAgICByZXR1cm4gKFxuICAgICAgICA8VHlwZWFoZWFkT3B0aW9uIHJlZj17dW5pcXVlS2V5fSBrZXk9e3VuaXF1ZUtleX1cbiAgICAgICAgICBob3Zlcj17dGhpcy5wcm9wcy5zZWxlY3Rpb25JbmRleCA9PT0gaSArIGN1c3RvbVZhbHVlT2Zmc2V0fVxuICAgICAgICAgIGN1c3RvbUNsYXNzZXM9e3RoaXMucHJvcHMuY3VzdG9tQ2xhc3Nlc31cbiAgICAgICAgICBvbkNsaWNrPXt0aGlzLl9vbkNsaWNrLmJpbmQodGhpcywgcmVzdWx0KX0+XG4gICAgICAgICAgeyBkaXNwbGF5U3RyaW5nIH1cbiAgICAgICAgPC9UeXBlYWhlYWRPcHRpb24+XG4gICAgICApO1xuICAgIH0sIHRoaXMpO1xuXG4gICAgaWYgKHRoaXMucHJvcHMuYXJlUmVzdWx0c1RydW5jYXRlZCAmJiB0aGlzLnByb3BzLnJlc3VsdHNUcnVuY2F0ZWRNZXNzYWdlICE9PSBudWxsKSB7XG4gICAgICB2YXIgcmVzdWx0c1RydW5jYXRlZENsYXNzZXMgPSB7XG4gICAgICAgIFwicmVzdWx0cy10cnVuY2F0ZWRcIjogdGhpcy5wcm9wcy5kZWZhdWx0Q2xhc3NOYW1lc1xuICAgICAgfTtcbiAgICAgIHJlc3VsdHNUcnVuY2F0ZWRDbGFzc2VzW3RoaXMucHJvcHMuY3VzdG9tQ2xhc3Nlcy5yZXN1bHRzVHJ1bmNhdGVkXSA9IHRoaXMucHJvcHMuY3VzdG9tQ2xhc3Nlcy5yZXN1bHRzVHJ1bmNhdGVkO1xuICAgICAgdmFyIHJlc3VsdHNUcnVuY2F0ZWRDbGFzc0xpc3QgPSBjbGFzc05hbWVzKHJlc3VsdHNUcnVuY2F0ZWRDbGFzc2VzKTtcblxuICAgICAgcmVzdWx0cy5wdXNoKFxuICAgICAgICA8bGkga2V5PVwicmVzdWx0cy10cnVuY2F0ZWRcIiBjbGFzc05hbWU9e3Jlc3VsdHNUcnVuY2F0ZWRDbGFzc0xpc3R9PlxuICAgICAgICAgIHt0aGlzLnByb3BzLnJlc3VsdHNUcnVuY2F0ZWRNZXNzYWdlfVxuICAgICAgICA8L2xpPlxuICAgICAgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gKFxuICAgICAgPHVsIGNsYXNzTmFtZT17Y2xhc3NMaXN0fT5cbiAgICAgICAgeyBjdXN0b21WYWx1ZSB9XG4gICAgICAgIHsgcmVzdWx0cyB9XG4gICAgICA8L3VsPlxuICAgICk7XG4gIH0sXG5cbiAgX29uQ2xpY2s6IGZ1bmN0aW9uKHJlc3VsdCwgZXZlbnQpIHtcbiAgICByZXR1cm4gdGhpcy5wcm9wcy5vbk9wdGlvblNlbGVjdGVkKHJlc3VsdCwgZXZlbnQpO1xuICB9XG5cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFR5cGVhaGVhZFNlbGVjdG9yO1xuIl19
},{"./option":9,"classnames":1,"react":"react"}]},{},[5])(5)
});