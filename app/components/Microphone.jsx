import React from 'react';

var Microphone = React.createClass({
    //mixins: [React.addons.PureRenderMixin],
    /*************************************************************
     * COMPONENT LIFECYCLE
     *************************************************************/
    getInitialState: function () {
        return {
            isListening: false
        };
    },

    componentDidMount: function () {
        if (typeof webkitSpeechRecognition !== 'undefined') {
            var recognition = this.recognition = new webkitSpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.onresult = this.handleSpeech;
            recognition.onend = this.handleNoSpeech;
        }
    },

    /*************************************************************
     * EVENT HANDLING
     *************************************************************/
    handleSpeakReadyClick: function () {
        /**
         * Already listening, abort
         */
        if (this.state.isListening) {
            return;
        }

        this.recognition.start();
        this.setState({isListening: true});
    },

    handleSpeech: function (event) {
        var context,
            existingAction,
            newAction,
            speech,
            spokenArgs;

        if (event.results.length > 0) {
            speech = event.results[0][0].transcript.trim().toLowerCase();

            if (this.props.handleSpeechResult) {
                this.props.handleSpeechResult(speech);
            }
        }

        this.setState({isListening: false});
    },

    handleNoSpeech: function () {
        this.setState({isListening: false});
    },

    /*************************************************************
     * HELPERS
     *************************************************************/
    createActionObjectLiteral: function (actionName, created) {
        // Use IIFE for lexical scope
        var newAction,
            tags;

        /**
         * Get current focus and filter tags
         */
        tags = ui.tags || [];
        tags = tags.slice();
        tags.push(this.props.focusTag);

        /**
         * Create new action {} object literal
         */
        newAction = doozy.action(actionName, tags);
        newAction.created = created;
    },

    parseSpeech: function (speech, context) {
        var actionIndex = 0,
            actionName,
            commandArgs,
            commandWord,
            date,
            dateSignal = false,
            duration,
            durationSignal = false,
            parseDuration;

        if (context === 'new-action') {
            contextWord = 'will';
        } else if (context === 'log-action') {
            contextWord = 'did';
        }

        /**
         * Check for a language signal that a date is referenced
         */
        if (speech.indexOf(' i ' + contextWord + ' ') > -1) {
            dateSignal = true;
            speech = speech.replace(' i ' + contextWord + ' ', '|');
        }

        /**
         * Check for a language signal that a duration is referenced
         */
        if (speech.indexOf(' for ') > -1) {
            durationSignal = true;
            speech = speech.replace(' for ', '|');
        }

        /**
         * Remove 'excess' language for clean split of command arguments
         */
        if (speech.slice(0, (3 + contextWord.length)) === 'i ' + contextWord + ' ') {
            speech = speech.replace('i ' + contextWord + ' ', '');
        }

        /**
         * Split command arguments
         */
        commandArgs = speech.split('|');

        /**
         * Parse date argument if supplied, else today
         */
        date = Date.create('today');
        if (dateSignal) {
            date = Date.create(commandArgs[0]);
            if (isNaN(date.getTime())) {
                console.log('Bad Date Argument: ' + commandArgs[0]);
                date = Date.create('today');
            }
        }

        /**
         * Parse duration argument if supplied, else 0
         */
        duration = 0;
        if (durationSignal) {
            parseDuration = babble.get('durations')
                .translate(commandArgs[commandArgs.length - 1]);

            if (parseDuration.tokens.length > 0) {
                duration = parseDuration.tokens[0].value.toMinutes();
            }
        }

        /**
         * Determine the arg index that contains the name of the action
         */
        if (commandArgs.length === 3) {
            actionIndex = 1;
        } else if (commandArgs.length === 2 && dateSignal) {
            actionIndex = 1;
        } else if  (commandArgs.length === 2 && durationSignal) {
            actionIndex = 0;
        }

        /**
         * Build a clean action name (begin with uppercase)
         */
        actionName = commandArgs[actionIndex].slice(0,1).toUpperCase() + commandArgs[actionIndex].slice(1);

        /**
         * Return an object literal of parsed arguments
         */
        return {
            actionName: actionName,
            date: date,
            duration: duration
        };
    },

    /*************************************************************
     * RENDERING
     *************************************************************/
    render: function () {
        if (typeof webkitSpeechRecognition === 'undefined') {
            return null;
        }

        var iconStyle = { minWidth: '40px', color: this.state.isListening ? '#ddd' : '#444' };

        var listItemContentStyle = {
            padding: '5px',
            textAlign: 'center'
        };

        return (
            <div style={this.props.style} title="Use microphone to send command">
                <a style={listItemContentStyle}
                        href="javascript:;"
                        onClick={this.handleSpeakReadyClick}>
                    <i style={iconStyle} className="fa fa-2x fa-microphone"></i>
                </a>
            </div>
        );
    },
});

module.exports = Microphone;
