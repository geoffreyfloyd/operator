'use strict';

import React from "react";
import styles from './Toolbar.less';

module.exports = exports = React.createClass({
    render: function () {
        return (
            <div className={styles.container}>
                <ul className={styles.menuitem}>
                    <li><button className={styles.button}><i className="fa fa-2x fa-gears" title="Processes"></i></button></li>
                    <li><button className={styles.button}><i className="fa fa-2x fa-cog" title="Settings"></i></button></li>
                </ul>
            </div>
        );
    }
});
