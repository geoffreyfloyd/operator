import React from 'react';
import Requests from "../store-helpers/requests";
import styles from "./Request.less";
import $ from 'jquery/dist/jquery';

var Request = React.createClass({
    /*************************************************************
     * COMPONENT LIFECYCLE
     *************************************************************/
     getInitialState: function () {
        return this.props.data;
     },

     componentDidMount: function () {
        Requests.subscribe(this.handleStoreUpdate, this.props.data.id);
     },

     componentWillUpdate: function() {
         var node = this.refs.responseContainer.getDOMNode();
         this.shouldScrollBottom = node.scrollTop + node.offsetHeight === node.scrollHeight;
     },

     componentDidUpdate: function() {
         if (this.shouldScrollBottom) {
             var node = this.refs.responseContainer.getDOMNode();
             node.scrollTop = node.scrollHeight
         }
     },

    /*************************************************************
     * EVENT HANDLING
     *************************************************************/
    handleRequestClick: function () {
        var data = this.props.data;
        Requests.repeat(data.id);
    },
    handleResponseClick: function () {
        var data = this.props.data;
        if (data.response) {
            console.log(data.response.result);
        }
    },
    handleStoreUpdate: function () {
        this.setState({
            ts: (new Date()).toISOString()
        });
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
        var data = this.props.data;
        if (!data.response.result) {
            return null;
        }
        var response = [];
        var lines = data.response.result.split('\r\n');
        lines.map(function (line, index) {
            response.push(<div key={index}><span>{line}</span></div>);
            //response.push(<br />);
        }.bind(this));
        return response;
    },
    renderHtmlResponse: function () {
        var data = this.props.data;
        if (!data.response.result) {
            return null;
        }
        var html = data.response.result;

        return <span dangerouslySetInnerHTML={{__html: html}}></span>;
    },
    renderJsonResponse: function () {
        var data = this.props.data;
        if (!data.response.result) {
            return null;
        }
        var obj = JSON.parse(data.response.result);
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
            if (data.context.processId) {
                // in a process - still expecting more responses
                statusStyle = styles.inprocess;
            }
            else {
                statusStyle = styles.ok;
            }
        }
        else if (data.response && data.response.status === 'ERR') {
            statusStyle = styles.err;
        }

        var cmd;
        var response;


        /**
         * Response media
         */
        if (data.response) {
            if (data.response.type === 'text') {
                response = this.renderTextResponse();
            } else if (data.response.type === 'json') {
                response = this.renderJsonResponse();
            } else if (data.response.type === 'html') {
                response = this.renderHtmlResponse();
            }
        }
        response = <div ref="responseContainer" className={styles.response + ' ' + styles.scroll}>{response}</div>;

        cmd = [];
        if (data.cmd) {
            cmd.push(<span ref="cmd" className={statusStyle} onClick={this.handleRequestClick}>{this.state.cmd}</span>);
            cmd.push(<br />);
        }

        return (
            <div title={this.state.date} className={styles.container}>
                {cmd}
                {response}
            </div>
        );
    }
});

module.exports = Request;
