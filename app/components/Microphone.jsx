/* globals webkitSpeechRecognition */
import React from 'react';

var Microphone = React.createClass({
    /*************************************************************
     * DEFINITIONS
     *************************************************************/
    // mixins: [React.addons.PureRenderMixin],
    propTypes: {
        handleSpeechResult: React.PropTypes.func,
        focusTag: React.PropTypes.string,
        style: React.PropTypes.object
    },

    /*************************************************************
     * COMPONENT LIFECYCLE
     *************************************************************/
    getInitialState: function () {
        return {
            isListening: false
        };
    },

    componentDidMount: function () {
        if (webkitSpeechRecognition !== undefined) {
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
        var speech;

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
     * RENDERING
     *************************************************************/
    render: function () {
        if (webkitSpeechRecognition === undefined) {
            return null;
        }

        var iconStyle = { minWidth: '40px', color: this.state.isListening ? '#ddd' : '#444' };

        var listItemContentStyle = {
            padding: '5px',
            textAlign: 'center'
        };
        /* eslint-disable no-script-url */
        return (
            <div style={this.props.style} title="Use microphone to send command">
                <a style={listItemContentStyle}
                        href="javascript:;"
                        onClick={this.handleSpeakReadyClick}>
                    <i style={iconStyle} className="fa fa-2x fa-microphone"></i>
                </a>
            </div>
        );
        /* eslint-enable no-script-url */
    },
});

module.exports = Microphone;
