'use strict';

import React from "react";
import requestStore from "../store-helpers/requests";
import Microphone from './Microphone';
import styles from "./Prompt.less";

var Prompt = React.createClass({
    /*************************************************************
     * COMPONENT LIFECYCLE
     *************************************************************/
    getInitialState: function () {
        return {
            ts: (new Date()).toISOString()
        };
    },

    componentDidMount: function() {
        document.addEventListener('keydown', this.handleKeyDown);
    },

    componentWillUnMount: function() {
        document.removeEventListener('keydown', this.handleKeyDown);
    },

    /*************************************************************
    * EVENT HANDLING
    *************************************************************/
    handleInputChange: function (e) {
        this.setState({
            request: e.target.value
        });
    },
    handleKeyDown: function(e) {
        var keyEnter = 13;
        if (e.keyCode == keyEnter) {
            this.handleSendRequest();
        }
    },
    handleSendRequest: function (request) {
        // get request text
        request = request || this.state.request;

        // send request
        requestStore.send(request, this.props.sessionId, this.handleResponseReady);

        // clear input
        this.setState({
            request: ''
        });
    },

    /*************************************************************
    * RENDERING
    *************************************************************/
    render: function () {
        //TODO: Tab suggest autocompletion and up / down request history
        return (
            <div className={styles.inputcontainer}>
                <i className="fa fa-2x fa-chevron-right" title="webprompt> command the web"></i>
                <Microphone handleSpeechResult={this.handleSendRequest} />
                <input ref="cmd" id="cmd" type="text" className={styles.input} onChange={this.handleInputChange} value={this.state.request} />
            </div>
        );
    }
});

module.exports = Prompt;
