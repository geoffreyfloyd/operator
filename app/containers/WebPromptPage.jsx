import React from 'react';
import Toolbar from '../components/Toolbar';
import Session from './Session';
import Prompt from '../components/Prompt';
import requestStore from '../store-helpers/requests';
import windowSizeStore from '../store-helpers/window-size-store';
import styles from './WebPromptPage.less';

var WebPromptPage = React.createClass({
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

    componentDidMount: function () {
        windowSizeStore.subscribe(this.handleStoreUpdate);
        requestStore.subscribe(this.handleStoreUpdate, null);
    },

    /*************************************************************
    * EVENT HANDLING
    *************************************************************/
    handleStoreUpdate: function () {
        var selectedSessionId = this.state.selectedSessionId;
        if (requestStore.getRequests(selectedSessionId).length === 0) {
            var sessionIds = requestStore.getSessionIds();
            if (sessionIds.length > 0) {
                this.setState({
                    ts: (new Date()).toISOString(),
                    selectedSessionId: sessionIds[0]
                });
                return;
            }
        }

        this.setState({
            ts: (new Date()).toISOString()
        });
    },
    handleClickProcesses: function () {
        var state = Object.assign({
            showProcesses: !this.state.showProcesses
        }, this.calculateSize(!this.state.showProcesses));
        this.setState(state);
    },
    handleClickNewSession: function () {
        requestStore.new();
    },
    handleSelectSession: function (sessionId) {
        this.setState({
            selectedSessionId: sessionId
        });
    },

    calculateSize: function (showProcesses) {
        var size = windowSizeStore.updates.value;

        var sidePanelWidth = 400;
        var workspaceHeight = size.height - 75;

        if (requestStore.getSessionIds().length > 1 && showProcesses) {
            if (size.width < sidePanelWidth * 2) {
                sidePanelWidth = size.width - sidePanelWidth;
            }
        }
        else {
            sidePanelWidth = 0;
        }

        return {
            sidePanelWidth: sidePanelWidth,
            workspaceWidth: size.width - sidePanelWidth,
            workspaceHeight: workspaceHeight
        };
    },

    /*************************************************************
    * RENDERING
    *************************************************************/
    renderMultiSession: function (sessionIds, size) {

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
                <div className={styles.scroll} key="sideSessions" style={{ height: size.workspaceHeight + 'px', overflowY: 'auto', width: String(size.sidePanelWidth) + 'px', margin: '0 10px 0 0'}}>
                    {otherSessionIds.map(function (sessionId) {
                        return (<Session key={sessionId} sessionId={sessionId} className={styles.scroll} style={{maxHeight: '600px', overflowY: 'auto'}} onSelect={this.handleSelectSession} />);
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
                    <div className={styles.scroll} key="mainworkspace" style={{ flexGrow: '1', margin: '0 10px', maxWidth: String(size.workspaceWidth) + 'px', height: size.workspaceHeight + 'px', overflowY: 'auto' }} >
                        <Session sessionId={selectedSessionId} selected />
                    </div>

                    {sideSessions}
                </div>
            </div>
        );
    },
    renderSingleSession: function (sessionId, size) {
        return (
            <div>
                <Toolbar key="toolbar" showProcesses={false} onClickProcesses={this.handleClickProcesses} onClickNewSession={this.handleClickNewSession}>
                    <Prompt sessionId={sessionId} />
                </Toolbar>
                <div className={styles.scroll} key="mainworkspace" style={{ margin: '0 10px 10px', height: size.workspaceHeight + 'px', overflowY: 'auto'}}>
                    <Session sessionId={sessionId} selected />
                </div>
            </div>
        );
    },
    render: function () {

        var size = this.calculateSize(this.state.showProcesses);

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
            return this.renderSingleSession(sessionIds[0], size);
        }
        else {
            return this.renderMultiSession(sessionIds, size);
        }

    }
});

module.exports = WebPromptPage;
