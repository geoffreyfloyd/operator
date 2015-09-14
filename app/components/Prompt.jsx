// TODO: burst token bubble when a delete or paste enters/modifies text within a bubble
// TODO: Tab suggest autocompletion and up / down request history

import React from 'react';
import babble from 'babble';
import requestStore from 'store-helpers/requests';
import ContentEditable from 'components/ContentEditable';
import Microphone from 'components/Microphone';
import styles from './Prompt.less';

var Prompt = React.createClass({
    /*************************************************************
     * DEFINITIONS
     *************************************************************/
    propTypes: {
        sessionId: React.PropTypes.string,
    },
    statics: {
        shortcuts: {
            65: 'action',
            88: 'measure'
        }
    },
    getInitialState: function () {
        return {
            ts: (new Date()).toISOString(),
            plaintext: '',
            tokens: [],
            actionTokens: [],
            measureTokens: [],
            caret: 0
        };
    },

    /*************************************************************
     * COMPONENT LIFECYCLE
     *************************************************************/
    componentDidMount: function () {
        document.addEventListener('keydown', this.handleKeyDown);
    },

    shouldComponentUpdate: function (nextProps) {
        return nextProps.html !== this.getDOMNode().innerHTML;
    },

    componentDidUpdate: function () {
        this.setCaretPosition();
    },

    componentWillUnMount: function () {
        document.removeEventListener('keydown', this.handleKeyDown);
    },

    /*************************************************************
     * EVENT HANDLING
     *************************************************************/
    handleInputChange: function () {
        var element = this.refs.input.getDOMNode();
        var value = element.innerText;
        var duration = babble.get('durations').translate(value, 'en-US');

        this.setState({
            plaintext: value,
            tokens: duration.tokens,
            caret: this.getCaretPosition()
        });
    },
    handleKeyDown: function (e) {
        var keyEnter = 13;
        var backspaceKeys = [8, 46];

        if (e.keyCode === keyEnter) {
            this.handleSendRequest(this.state.plaintext);
        }
        else if (backspaceKeys.indexOf(e.keyCode) > -1) {
            // Vaguely recall a possible need to get selection as a hack
            // var words = this.state.plaintext;
            // var sel = this.getSelection();
        }
        else if (e.ctrlKey && Prompt.shortcuts[String(e.keyCode)]) {

            // get selection
            var sel = this.getSelection();
            if (!sel) {
                return;
            }

            // make a copy of the appropriate tag array
            var tagType = {
                kind: Prompt.shortcuts[e.keyCode],
                tokens: this.state[Prompt.shortcuts[e.keyCode] + 'Tokens'].slice()
            };

            // add new tag to the array
            tagType.tokens.push({
                kind: tagType.kind,
                pos: sel.pos,
                text: sel.text
            });

            // timeout wrap to avoid some kind of bug (chrome-specific?)
            // that selects the entire text if sel.removeAllRanges() does
            // not get processed fully by the browser before we destroy
            // and recreate the elements
            sel.sel.removeAllRanges();
            setTimeout(function () {
                // update state with new token array value
                var state = {};
                state[tagType.kind + 'Tokens'] = tagType.tokens.slice();
                this.setState(state);
            }.bind(this), 1);
        }
    },
    handleSendRequest: function (hoomanInput) {
        var duration = babble.get('durations').translate(hoomanInput, 'en-US');

        // send request
        requestStore.send(hoomanInput, this.props.sessionId, this.handleResponseReady);

        this.setState({
            plaintext: hoomanInput,
            tokens: duration.tokens,
            caret: this.getCaretPosition()
        });
    },

    /*************************************************************
     * TEXT SELECTION & CARET POSITION
     *************************************************************/
    getActualPos: function (node, pos) {
        var offset = 0;
        var parent = node.parentNode.parentNode;
        if (parent.childNodes.length > 1) {
            for (var i = 0; i < parent.childNodes.length; i++) {
                if (parent.childNodes[i].childNodes[0] === node) {
                    break;
                }
                else {
                    offset += parent.childNodes[i].childNodes[0].length;
                    continue;
                }
            }
        }
        return offset + pos;
    },
    getSelectionRange: function (sel) {
        var range;
        var anchorPos = this.getActualPos(sel.anchorNode, sel.anchorOffset);
        var extentPos = this.getActualPos(sel.extentNode, sel.extentOffset);
        if (anchorPos > extentPos) {
            range = {
                start: extentPos,
                end: anchorPos
            };
        }
        else {
            range = {
                start: anchorPos,
                end: extentPos
            };
        }
        return range;
    },

    getSelection: function (sel) {
        // handle case where anchor node and extentNode differ
        if (typeof sel === 'undefined') {
            sel = window.getSelection(); // eslint-disable-line no-param-reassign
        }

        if (sel.anchorOffset === sel.extentOffset) {
            return null;
        }

        // find range of highlighted text
        var range = this.getSelectionRange(sel);

        return {
            pos: range.start,
            text: this.state.plaintext.slice(range.start, range.end),
            sel: sel
        };
    },

    getCaretPosition: function () {
        var element = this.refs.input.getDOMNode();
        var caretOffset = 0;
        var doc = element.ownerDocument || element.document;
        var win = doc.defaultView || doc.parentWindow;
        var sel;
        if (win.getSelection !== undefined) {
            sel = win.getSelection();
            if (sel.rangeCount > 0) {
                var range = win.getSelection().getRangeAt(0);
                var preCaretRange = range.cloneRange();
                preCaretRange.selectNodeContents(element);
                preCaretRange.setEnd(range.endContainer, range.endOffset);
                caretOffset = preCaretRange.toString().length;
            }
        }
        else if ( (sel = doc.selection) && sel.type !== 'Control') {
            var textRange = sel.createRange();
            var preCaretTextRange = doc.body.createTextRange();
            preCaretTextRange.moveToElementText(element);
            preCaretTextRange.setEndPoint('EndToEnd', textRange);
            caretOffset = preCaretTextRange.text.length;
        }
        return caretOffset;
    },
    setCaretPosition() {
        var caretPos = this.state.caret;

        var node = this.refs.input.getDOMNode();

        if (!node.childNodes || node.childNodes.length === 0 || !node.childNodes[0].childNodes || node.childNodes[0].childNodes.length === 0) {
            return;
        }

        for (var i = 0; i < node.childNodes.length; i++) {
            if (node.childNodes[i].childNodes[0].length < caretPos) {
                caretPos -= node.childNodes[i].childNodes[0].length;
                continue;
            }
            else {
                node = node.childNodes[i].childNodes[0];
                break;
            }
        }

        try {

            var sel = window.getSelection();
            if (sel.rangeCount > 0) {
                sel.removeAllRanges();
            }

            var range = document.createRange();
            range.setStart(node, caretPos);
            range.collapse(true);

            sel.addRange(range);
        }
        catch (e) {
            console.log(e);
        }
    },
    /*************************************************************
     * RENDERING
     *************************************************************/
    renderTextToHtml: function () {
        var i, text;
        var elements = [];
        var tokens = this.state.tokens;
        tokens = tokens.concat(this.state.actionTokens);
        tokens = tokens.concat(this.state.measureTokens);

        // nothing special
        if (!tokens || !tokens.length) {
            return ('<span>' + this.state.plaintext + '</span>');
        }

        // create tokenized spans
        for (i = 0; i < tokens.length; i++) {
            // var style = '';

            var element = {
                pos: tokens[i].pos,
                len: tokens[i].text.length,
                obj: ('<span class="' + styles[tokens[i].kind.split('.')[0]] + '">' + tokens[i].text + '</span>'), // <span className={styles.duration}>{tokens[i].text}</span>
            };
            elements.push(element);
        }

        // fill in the blanks with normal spans
        elements = elements.sort(function (n) {
            return n.pos;
        });

        var innerHtml = '';
        var atPos = 0;
        for (i = 0; i < elements.length; i++) {
            if (atPos < elements[i].pos) {
                text = this.state.plaintext.slice(atPos, elements[i].pos);
                // insert normal text
                // reactObjs.push(<span>{text}</span>);
                innerHtml += '<span class="normal">' + text + '</span>';
            }
            // insert tagged text
            // reactObjs.push(elements[i].obj);
            innerHtml += elements[i].obj;

            // set new processing position
            atPos = elements[i].pos + elements[i].len;
        }

        if (atPos < this.state.plaintext.length) {
            text = this.state.plaintext.slice(atPos, this.state.plaintext.length);
            // insert normal text
            // reactObjs.push(<span>{text}</span>);
            innerHtml += '<span class="normal">' + text + '</span>';
        }

        return innerHtml;
    },
    render: function () {
        return (
            <div className={styles.inputcontainer}>
                <i className="fa fa-2x fa-chevron-right" title="webprompt> command the web"></i>
                <Microphone handleSpeechResult={this.handleSendRequest} />
                <ContentEditable ref="input" type="text" className={styles.input} placeholder="How can i help you?" onChange={this.handleInputChange} html={this.renderTextToHtml()} />
            </div>
        );
    }
});

module.exports = Prompt;
