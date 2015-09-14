'use strict';

import React from 'react';

var GooeyHost = React.createClass({
    /*************************************************************
    * RENDERING
    *************************************************************/
    Gooey: null,

    componentWillMount: function () {
        if (!this.Gooey && this.props.gooey) {
            require.ensure([], function () { // this syntax is weird but it works
                var req = './' + this.props.gooey;
                this.Gooey = require(req); // when this function is called, the module is guaranteed to be synchronously available.
                this.setState({
                    isReady: true
                });
            }.bind(this));
        }
    },

    render: function () {

        if (!this.Gooey) {
            return null;
        }

        return (
            <div>
                <this.Gooey />
            </div>
        );
    }
});

module.exports = GooeyHost;
