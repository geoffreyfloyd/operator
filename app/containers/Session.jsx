import React from 'react';
import requestStore from '../store-helpers/requests';
import Request from '../components/Request';
import styles from './Session.less';

var Session = React.createClass({
    /*************************************************************
     * DEFINITIONS
     *************************************************************/
    propTypes: {
        className: React.PropTypes.string,
        style: React.PropTypes.object,
        onSelect: React.PropTypes.func,
        sessionId: React.PropTypes.string,
        selected: React.PropTypes.bool
    },
    getInitialState: function () {
        return {
            title: null,
            ts: (new Date()).toISOString(),
            collapsed: false
        };
    },

    /*************************************************************
     * COMPONENT LIFECYCLE
     *************************************************************/
    componentDidMount: function () {
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
        var titleByRequest, unselectedDom;
        if (requests.length > 0 && requests[0].cmd) {
            titleByRequest = requests[0].cmd;
        }
        else if (requests.length > 1) {
            titleByRequest = requests[1].cmd;
        }
        var title = this.state.title || titleByRequest || 'How can I help you?';

        if (!this.props.selected) {
            unselectedDom = ([
                <a onClick={this.handleSelectClick} style={{float: 'right', marginLeft: '0.4em', fontSize: '0.8em', marginTop: '0.42em'}}><i className={'fa fa-2x fa-circle-o ' + styles.button}></i></a>,
            ]);

            if (this.state.collapsed) {
                unselectedDom.push(<a onClick={this.handleCollapseClick} style={{float: 'right', fontSize: '0.8em', marginTop: '0.42em'}}><i className={'fa fa-2x fa-plus ' + styles.button}></i></a>);
            }
            else {
                unselectedDom.push(<a onClick={this.handleCollapseClick} style={{float: 'right', fontSize: '0.8em', marginTop: '0.42em'}}><i className={'fa fa-2x fa-minus ' + styles.button}></i></a>);
            }
        }

        return (
            <div className={styles.appcontainer + ' ' + this.props.className} style={this.props.style}>
                <a onClick={this.handleCloseClick} style={{float: 'right', marginLeft: '0.2em'}}><i className={'fa fa-2x fa-close ' + styles.close}></i></a>
                {unselectedDom}
                <h3 style={{margin: '0', lineHeight: '40px'}}>{title}</h3>

                {this.state.collapsed ? [] : requests.map(function (request) {
                    return (
                        <Request key={request.id} data={request} />
                    );
                })}
            </div>
        );
    }
});

module.exports = Session;
