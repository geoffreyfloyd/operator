import React from 'react';
import Requests from "../store-helpers/requests";
import Microphone from './Microphone';
import styles from "./Request.less";
import $ from 'jquery/dist/jquery';

module.exports = exports = React.createClass({
    /*************************************************************
     * COMPONENT LIFECYCLE
     *************************************************************/
     getInitialState: function () {
        return this.props.data;
     },

     componentDidMount: function() {
         if (this.props.data.listening) {
             $(this.refs.cmd.getDOMNode()).focus();
             document.addEventListener('keydown', this.handleKeyDown);
         }
     },

     componentWillUnMount: function() {
         document.removeEventListener('keydown', this.handleKeyDown);
     },

     componentWillUpdate: function () {
         if (!this.props.data.listening) {
             document.removeEventListener('keydown', this.handleKeyDown);
         }
     },

    /*************************************************************
     * EVENT HANDLING
     *************************************************************/
    handleRequestClick: function () {
        Requests.repeat(this.state.id);
    },
    handleResponseClick: function () {
        if (this.state.response) {
            console.log(this.state.response.result);
        }
    },
    handleInputChange: function (e) {
        this.setState({
            cmd: e.target.value
        });
    },
    handleKeyDown: function(e) {
        var keyEnter = 13;
        if (e.keyCode == keyEnter) {
            this.handleSendRequest();
        }
    },
    handleSendRequest: function (cmd) {

        var request = this.state;
        request.listening = false;
        if (typeof cmd === 'string') {
            request.cmd = cmd;
        }
        Requests.send(request, this.handleResponseReady);
        this.setState(request);
    },
    handleResponseReady: function (request) {
        this.setState(request);
    },
    handleRequestHoverChange: function (hovering) {
        this.setState({
            requestHovering: hovering
        });
    },
    /*************************************************************
    * RENDERING
    *************************************************************/
    renderTextResponse: function () {
        if (!this.state.response.result) {
            return null;
        }
        var response = [];
        var lines = this.state.response.result.split('\r\n');
        lines.map(function (line) {
            response.push(<span>{line}</span>);
            response.push(<br />);
        }.bind(this));
        return response;
    },
    renderHtmlResponse: function () {
        if (!this.state.response.result) {
            return null;
        }
        var html = this.state.response.result;

        return <span dangerouslySetInnerHTML={{__html: html}}></span>;
    },
    renderJsonResponse: function () {
        if (!this.state.response.result) {
            return null;
        }
        var obj = JSON.parse(this.state.response.result);
        var display = obj.mobileview.sections[0].text;

        // for (var prop in obj.query.pages) {
        //     if (obj.query.pages.hasOwnProperty(prop)) {
        //         display = obj.query.pages[prop].revisions[0]['*'];
        //         break;
        //     }
        // }
        return <span dangerouslySetInnerHTML={{__html: display}}></span>;
    },
    render: function () {
        var data = this.props.data;

        /**
         * Text style based on status of request
         */
        var statusStyle = styles.waiting;
        if (data.response && data.response.status === 'OK') {
            statusStyle = styles.ok;
        }
        else if (data.response && data.response.status === 'ERR') {
            statusStyle = styles.err;
        }

        var cmd;
        var response;

        if (this.state.listening) {
            cmd = (
                <div className={styles.inputcontainer}>
                    <input ref="cmd" id="cmd" type="text" className={styles.input} onChange={this.handleInputChange} value={this.state.cmd} />
                    <Microphone style={{ width: '32px', float: 'right' }} handleSpeechResult={this.handleSendRequest} />
                </div>
            );
        }
        else {
            /**
             * Response media
             */
            if (this.state.response) {
                if (this.state.response.type === 'text') {
                    response = this.renderTextResponse();
                } else if (this.state.response.type === 'json') {
                    response = this.renderJsonResponse();
                } else if (this.state.response.type === 'html') {
                    response = this.renderHtmlResponse();
                }
            }
            response = <div className={styles.response}>{response}</div>;

            cmd = [];
            if (this.state.cmd) {
                cmd.push(<span ref="cmd" className={statusStyle} onClick={this.handleRequestClick}>{this.state.cmd}</span>);
                cmd.push(<br />);
            }
        }

        return (
            <div title={this.state.date} className={styles.container}>
                {cmd}
                {response}
            </div>
        );
    }
});
