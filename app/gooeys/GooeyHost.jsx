import React from 'react';

var GooeyHost = React.createClass({
    /*************************************************************
     * DEFINITIONS
     *************************************************************/
    propTypes: {
        gooey: React.PropTypes.string,
    },
    Gooey: null,

    /*************************************************************
    * COMPONENT LIFECYCLE
    *************************************************************/
    componentWillMount: function () {
        if (!this.Gooey && this.props.gooey) {
            // Dynamically require a gooey component
            // This syntax is weird but it works
            require.ensure([], function () {
                // Build require string
                var req = './' + this.props.gooey;

                // when this function is called
                // the module is guaranteed to be synchronously available.
                this.Gooey = require(req);

                // Set state to notify GooeyHost component
                // that we have the requested Gooey component
                this.setState({
                    isReady: true
                });
            }.bind(this));
        }
    },

    /*************************************************************
    * RENDERING
    *************************************************************/
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

export default GooeyHost;
