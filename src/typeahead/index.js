var Accessor = require('../accessor');
var React = require('react');
var TypeaheadSelector = require('./selector');
var KeyEvent = require('../keyevent');
var fuzzy = require('fuzzy');
var classNames = require('classnames');
var lineheight = 20;

/**
 * A "typeahead", an auto-completing text input
 *
 * Renders an text input that shows options nearby that you can use the
 * keyboard or mouse to select.  Requires CSS for MASSIVE DAMAGE.
 */
var Typeahead = React.createClass({
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
    filterOption: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.func
    ]),
    searchOptions: React.PropTypes.func,
    displayOption: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.func
    ]),
    inputDisplayOption: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.func
    ]),
    formInputOption: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.func
    ]),
    defaultClassNames: React.PropTypes.bool,
    customListComponent: React.PropTypes.oneOfType([
      React.PropTypes.element,
      React.PropTypes.func
    ]),
    showOptionsWhenEmpty: React.PropTypes.bool
  },

  getDefaultProps: function() {
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
      onOptionSelected: function(option) {},
      onChange: function(event) {},
      onKeyDown: function(event) {},
      onKeyPress: function(event) {},
      onKeyUp: function(event) {},
      onFocus: function(event) {},
      onBlur: function(event) {},
      filterOption: null,
      searchOptions: null,
      inputDisplayOption: null,
      defaultClassNames: true,
      customListComponent: TypeaheadSelector,
      showOptionsWhenEmpty: false,
      resultsTruncatedMessage: null
    };
  },

  getInitialState: function() {
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
      showResults: false,

      // Number of rows to show for a text area
      rows: 1,

      // caret position for text area,
      caretPosition: { top: 0, left: 0 }
    };
  },

  _shouldSkipSearch: function(input) {
    var emptyValue = !input || input.trim().length == 0;

    // this.state must be checked because it may not be defined yet if this function
    // is called from within getInitialState
    var isFocused = this.state && this.state.isFocused;
    return !(this.props.showOptionsWhenEmpty && isFocused) && emptyValue;
  },

  getOptionsForValue: function(value, options) {
    if (this._shouldSkipSearch(value)) { return []; }

    var searchOptions = this._generateSearchFunction();
    return searchOptions(value, options);
  },

  setEntryText: function(value) {
    this.refs.entry.value = value;
    this._onTextEntryUpdated();
  },

  focus: function(){
    this.refs.entry.focus()
  },

  _hasCustomValue: function() {
    if (this.props.allowCustomValues > 0 &&
      this.state.entryValue.length >= this.props.allowCustomValues &&
      this.state.searchResults.indexOf(this.state.entryValue) < 0) {
      return true;
    }
    return false;
  },

  _getCustomValue: function() {
    if (this._hasCustomValue()) {
      return this.state.entryValue;
    }
    return null;
  },

  _renderIncrementalSearchResults: function() {
    // Nothing has been entered into the textbox
    if (this._shouldSkipSearch(this.state.entryValue)) {
      return "";
    }

    // Something was just selected
    if (this.state.selection) {
      return "";
    }

    var options = this.props.maxVisible ? this.state.searchResults.slice(0, this.props.maxVisible) : this.state.searchResults;
    if (options.length === 0) {
      return "";
    }

    var style = { top: this.state.caretPosition.top + 30, left: this.state.caretPosition.left - 10 };
    return (
      <div className={this.props.customClasses.listWrapper} style={style}>
        <this.props.customListComponent
          ref="sel" options={options}
          areResultsTruncated={this.props.maxVisible && this.state.searchResults.length > this.props.maxVisible}
          resultsTruncatedMessage={this.props.resultsTruncatedMessage}
          caretPosition={this.state.caretPosition}
          onOptionSelected={this._onOptionSelected}
          allowCustomValues={this.props.allowCustomValues}
          customValue={this._getCustomValue()}
          customClasses={this.props.customClasses}
          selectionIndex={this.state.selectionIndex}
          defaultClassNames={this.props.defaultClassNames}
          displayOption={Accessor.generateOptionToStringFor(this.props.displayOption)} />
        <div className={this.props.customClasses.footer}>
          <div>
            <i className="fa fa-long-arrow-up" />
            <i className="fa fa-long-arrow-down" />
            to navigate
          </div>
          <div>esc to dismiss</div>
        </div>
      </div>
    );
  },

  getSelection: function() {
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
    var openBracketIndex = value.lastIndexOf('{{');
    var closeBracketIndex = value.lastIndexOf('}}');
    if (openBracketIndex > -1 && openBracketIndex > closeBracketIndex) {
      return value.substr(openBracketIndex);
    }
    return (tokens.length === 0) ? value : tokens[tokens.length - 1];
  },

  _onOptionSelected: function(option, event) {
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

    this.setState({searchResults: this.getOptionsForValue(optionString, this.props.options),
                   selection: formInputOptionString,
                   entryValue: valueBefore.concat(optionString) });
    return this.props.onOptionSelected(option, event);
  },

  _onTextEntryUpdated: function() {
    var value = this.refs.entry.value;
    this.setState({searchResults: this.getOptionsForValue(value, this.props.options),
                   selection: '',
                   entryValue: value});
  },

  _onEnter: function(event) {
    var selection = this.getSelection();
    if (!selection) {
      return this.props.onKeyDown(event);
    }
    return this._onOptionSelected(selection, event);
  },

  _onEscape: function() {
    this.setState({
      selectionIndex: null
    });
  },

  _onTab: function(event) {
    var selection = this.getSelection();
    var option = selection ?
      selection : (this.state.searchResults.length > 0 ? this.state.searchResults[0] : null);

    if (option === null && this._hasCustomValue()) {
      option = this._getCustomValue();
    }

    if (option !== null) {
      return this._onOptionSelected(option, event);
    }
  },

  eventMap: function(event) {
    var events = {};

    events[KeyEvent.DOM_VK_UP] = this.navUp;
    events[KeyEvent.DOM_VK_DOWN] = this.navDown;
    events[KeyEvent.DOM_VK_RETURN] = events[KeyEvent.DOM_VK_ENTER] = this._onEnter;
    events[KeyEvent.DOM_VK_ESCAPE] = this._onEscape;
    events[KeyEvent.DOM_VK_TAB] = this._onTab;

    return events;
  },

  _nav: function(delta) {
    if (!this._hasHint()) {
      return;
    }
    var newIndex = this.state.selectionIndex === null ? (delta == 1 ? 0 : delta) : this.state.selectionIndex + delta;
    var length = this.props.maxVisible ? this.state.searchResults.slice(0, this.props.maxVisible).length : this.state.searchResults.length;
    if (this._hasCustomValue()) {
      length += 1;
    }

    if (newIndex < 0) {
      newIndex += length;
    } else if (newIndex >= length) {
      newIndex -= length;
    }

    this.setState({selectionIndex: newIndex});
  },

  navDown: function() {
    this._nav(1);
  },

  navUp: function() {
    this._nav(-1);
  },

  _onChange: function(event) {
    if (this.props.onChange) {
      this.props.onChange(event);
    }

    this._onTextEntryUpdated();

    var oldRows = event.target.rows;
    event.target.rows = 1;
    var newRows = Math.floor(event.target.scrollHeight / lineheight);

    if (newRows === oldRows) {
      event.target.rows = newRows;
    }

    var caretPosition = $(event.target).caret('position');
    this.setState({ rows: newRows, caretPosition: caretPosition });
  },

  _onKeyDown: function(event) {
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

  componentWillReceiveProps: function(nextProps) {
    var searchResults = this.getOptionsForValue(this.state.entryValue, nextProps.options);
    var showResults = Boolean(searchResults.length);
    this.setState({
      searchResults: searchResults,
      showResults: showResults
    });
  },

  componentDidMount: function() {
    if (this.refs.entry) {
      const numRows = Math.floor(this.refs.entry.scrollHeight / lineheight);
      this.setState({ rows: numRows });
    }
  },

  render: function() {
    var inputClasses = {};
    inputClasses[this.props.customClasses.input] = !!this.props.customClasses.input;
    var inputClassList = classNames(inputClasses);

    var classes = {
      typeahead: this.props.defaultClassNames
    };
    classes[this.props.className] = !!this.props.className;
    var classList = classNames(classes);

    var InputElement = this.props.textarea ? 'textarea' : 'input';

    return (
      <div className={classList}>
        { this._renderHiddenInput() }
        <InputElement ref="entry" type="text"
          disabled={this.props.disabled}
          {...this.props.inputProps}
          placeholder={this.props.placeholder}
          rows={this.state.rows}
          className={inputClassList}
          value={this.state.entryValue}
          onChange={this._onChange}
          onKeyDown={this._onKeyDown}
          onKeyPress={this.props.onKeyPress}
          onKeyUp={this.props.onKeyUp}
          onFocus={this._onFocus}
          onBlur={this._onBlur}
        />
        { this.state.showResults && this._renderIncrementalSearchResults() }
      </div>
    );
  },

  _onFocus: function(event) {
    this.setState({isFocused: true, showResults: true}, function () {
      this._onTextEntryUpdated();
    }.bind(this));
    if ( this.props.onFocus ) {
      return this.props.onFocus(event);
    }
  },

  _onBlur: function(event) {
    this.setState({isFocused: false}, function () {
      this._onTextEntryUpdated();
    }.bind(this));
    if ( this.props.onBlur ) {
      return this.props.onBlur(event);
    }
  },

  _renderHiddenInput: function() {
    if (!this.props.name) {
      return null;
    }

    return (
      <input
        type="hidden"
        name={ this.props.name }
        value={ this.state.selection }
      />
    );
  },

  _generateSearchFunction: function() {
    var searchOptionsProp = this.props.searchOptions;
    var filterOptionProp = this.props.filterOption;
    if (typeof searchOptionsProp === 'function') {
      if (filterOptionProp !== null) {
        console.warn('searchOptions prop is being used, filterOption prop will be ignored');
      }
      return searchOptionsProp;
    } else if (typeof filterOptionProp === 'function') {
      return function(value, options) {
        return options.filter(function(o) { return filterOptionProp(value, o); });
      };
    } else {
      var mapper;
      if (typeof filterOptionProp === 'string') {
        mapper = Accessor.generateAccessor(filterOptionProp);
      } else {
        mapper = Accessor.IDENTITY_FN;
      }
      return function(value, options) {
        return fuzzy
          .filter(value, options, {extract: mapper})
          .map(function(res) { return options[res.index]; });
      };
    }
  },

  _hasHint: function() {
    return this.state.searchResults.length > 0 || this._hasCustomValue();
  }
});

module.exports = Typeahead;
