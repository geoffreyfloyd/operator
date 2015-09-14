'use strict';

import React from "react";
import Toolbar from "../components/Toolbar";
import Session from "./Session";
import Prompt from "../components/Prompt";
import requestStore from "../store-helpers/requests";
import windowSizeStore from '../store-helpers/window-size-store';

module.exports = exports = React.createClass({
    /*************************************************************
    * COMPONENT LIFECYCLE
    *************************************************************/
    getInitialState: function () {
        return {
            selectedSessionId: null,
            sessionIds: [],
            showProcesses: true,
            sidePanelWidth: 400
        };
    },

    componentWillMount: function () {
        windowSizeStore.subscribe(this.handleWindowSizeChange);
        requestStore.subscribe(this.handleStoreUpdate, null);
    },

    /*************************************************************
    * EVENT HANDLING
    *************************************************************/
    handleStoreUpdate: function () {
        this.setState({
            ts: (new Date()).toISOString()
        });
    },
    handleClickProcesses: function () {
        this.setState({
            showProcesses: !this.state.showProcesses
        });
    },
    handleClickNewSession: function () {
        requestStore.new();
    },
    handleSelectSession: function (sessionId) {
        this.setState({
            selectedSessionId: sessionId
        });
    },
    handleWindowSizeChange: function () {

        var size = windowSizeStore.updates.value;
        
        var sidePanelWidth = 400;
        var workspaceHeight = size.height - 50;

        if (requestStore.getSessionIds().length > 1) {
            if (size.width < sidePanelWidth * 2) {
                sidePanelWidth = size.width - sidePanelWidth;
            }
        }
        else {
            sidePanelWidth = 0;
        }

        this.setState({
            sidePanelWidth: sidePanelWidth,
            workspaceHeight: workspaceHeight
        });
    },

    /*************************************************************
    * RENDERING
    *************************************************************/
    renderMultiSession: function (sessionIds) {

        var selectedSessionId = this.state.selectedSessionId;

        if (selectedSessionId === null) {
            selectedSessionId = sessionIds[0];
        }

        var otherSessionIds = [];

        sessionIds.map(function (sessionId) {
            if (sessionId !== selectedSessionId) {
                otherSessionIds.push(sessionId);
            }
        });

        var sideSessions;
        if (this.state.showProcesses) {
            sideSessions = (
                <div key="sideSessions" style={{ display: 'inline', width: String(this.state.sidePanelWidth) + 'px', margin: '0 10px 0 0'}}>
                    {otherSessionIds.map(function (sessionId) {
                        return (<Session key={sessionId} sessionId={sessionId} style={{maxHeight: '600px'}} onSelect={this.handleSelectSession} />);
                    }.bind(this))}
                </div>
            );
        }


        return (
            <div>
                <Toolbar key="toolbar" showProcesses={this.state.showProcesses} onClickProcesses={this.handleClickProcesses} onClickNewSession={this.handleClickNewSession}>
                    <Prompt sessionId={selectedSessionId} />
                </Toolbar>
                <div style={{display: 'flex'}}>
                    <div key="mainworkspace" style={{flexGrow: '1', margin: '0 10px 0 10px'}} >
                        <Session sessionId={selectedSessionId} selected={true} />
                    </div>
                    <div style={{ width: '10px'}} />
                    {sideSessions}
                </div>
            </div>
        );
    },
    renderSingleSession: function (sessionId) {
        return (
            <div>
                <Toolbar key="toolbar" showProcesses={this.state.showProcesses} onClickProcesses={this.handleClickProcesses} onClickNewSession={this.handleClickNewSession}>
                    <Prompt sessionId={sessionId} />
                </Toolbar>
                <div key="mainworkspace">
                    <Session sessionId={sessionId} selected={true} />
                </div>
            </div>
        );
    },
    render: function () {

        var sessionIds = requestStore.getSessionIds();

        // if (sessionIds.length === 0) {
        //     return (
        //         <div>
        //             <Toolbar key="toolbar" />
        //             <div key="mainworkspace" >
        //                 <Prompt />
        //             </div>
        //         </div>
        //     );
        // }
        if (sessionIds.length === 0) {
            return null;
        }
        else if (sessionIds.length === 1) {
            return this.renderSingleSession(sessionIds[0]);
        }
        else {
            return this.renderMultiSession(sessionIds);
        }

    }
});
