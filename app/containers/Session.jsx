'use strict';

import React from "react";
import requestStore from "../store-helpers/requests";
import Request from "../components/Request";
import styles from "./Session.less";

module.exports = exports = React.createClass({
    /*************************************************************
     * COMPONENT LIFECYCLE
     *************************************************************/
    getInitialState: function () {
        return {
            title: 'WebPrompt',
            ts: (new Date()).toISOString(),
            collapsed: false
        };
    },

    componentWillMount: function () {
        requestStore.subscribe(this.handleStoreUpdate, null);
    },

    handleStoreUpdate: function () {
        this.setState({
            ts: (new Date()).toISOString()
        });
    },
    handleCloseClick: function () {
        requestStore.closeSession(this.props.sessionId);
    },
    handleCollapseClick: function () {
        this.setState({
            collapsed: !this.state.collapsed
        });
    },
    handleSelectClick: function () {
        this.props.onSelect(this.props.sessionId);
    },
    /*************************************************************
    * RENDERING
    *************************************************************/
    render: function () {

        var requests = requestStore.getRequests(this.props.sessionId);

        var unselectedDom;
        if (!this.props.selected) {
            unselectedDom = ([
                <a onClick={this.handleSelectClick} style={{float: 'right', marginLeft: '0.4em', fontSize: '0.8em', marginTop: '0.42em'}}><i className={"fa fa-2x fa-circle-o " + styles.button}></i></a>,
            ]);

            if (this.state.collapsed) {
                unselectedDom.push(<a onClick={this.handleCollapseClick} style={{float: 'right', fontSize: '0.8em', marginTop: '0.42em'}}><i className={"fa fa-2x fa-plus " + styles.button}></i></a>);
            }
            else {
                unselectedDom.push(<a onClick={this.handleCollapseClick} style={{float: 'right', fontSize: '0.8em', marginTop: '0.42em'}}><i className={"fa fa-2x fa-minus " + styles.button}></i></a>);
            }
        }

        return (
            <div className={styles.appcontainer} style={this.props.style}>
                <a onClick={this.handleCloseClick} style={{float: 'right', marginLeft: '0.2em'}}><i className={"fa fa-2x fa-close " + styles.close}></i></a>
                {unselectedDom}
                <h3 style={{margin: '0', lineHeight: '40px'}}>{this.state.title || 'WebPrompt'}</h3>

                {this.state.collapsed ? [] : requests.map(function (request) {
                    return (
                        <Request key={request.id} data={request} />
                    );
                })}
            </div>
        );
    }
});
