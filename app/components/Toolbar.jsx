import React from 'react';
import styles from './Toolbar.less';

var Toolbar = React.createClass({
    /*************************************************************
     * DEFINITIONS
     *************************************************************/
    propTypes: {
        children: React.PropTypes.object,
        onClickNewSession: React.PropTypes.func,
        onClickProcesses: React.PropTypes.func,
        showProcesses: React.PropTypes.bool
    },

    /*************************************************************
    * RENDERING
    *************************************************************/
    render: function () {
        return (
            <div className={styles.container}>
                <ul className={styles.menuitem} style={{ float: 'right' }}>
                    <li><button className={styles.button} onClick={this.props.onClickNewSession}><i className="fa fa-2x fa-terminal" title="Start a new session"></i></button></li>
                    <li><button className={styles.button} style={this.props.showProcesses ? { color: '#d6d6d6'} : {}} onClick={this.props.onClickProcesses}><i className="fa fa-2x fa-gears" title="Processes"></i></button></li>
                </ul>
                {this.props.children}
            </div>
        );
    }
});

module.exports = Toolbar;
