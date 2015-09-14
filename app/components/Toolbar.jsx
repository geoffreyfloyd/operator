'use strict';

import React from "react";
import styles from './Toolbar.less';

var Toolbar = React.createClass({
    render: function () {
        return (
            <div className={styles.container}>
                <ul className={styles.menuitem} style={{ float: 'right' }}>
                    <li><button className={styles.button} onClick={this.props.onClickNewSession}><i className="fa fa-2x fa-terminal" title="New Session"></i></button></li>
                    <li><button className={styles.button} style={this.props.showProcesses ? { color: '#d6d6d6'} : {}} onClick={this.props.onClickProcesses}><i className="fa fa-2x fa-gears" title="Processes"></i></button></li>
                </ul>
                {this.props.children}
            </div>
        );
    }
});

module.exports = Toolbar;
