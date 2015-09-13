'use strict';
module.exports = exports = {
    componentWillMount: function () {
        this.state = this.state || {};
        this.state.onHover = false;
    },
    componentDidMount: function () {
        this.getDOMNode().addEventListener('mouseover', this.onOver);
        this.getDOMNode().addEventListener('mouseout', this.onOut);
    },
    componentWillUnmount: function () {
        this.getDOMNode().removeEventListener('mouseover', this.onOver);
        this.getDOMNode().removeEventListener('mouseout', this.onOut);
    },
    onOver: function () {
        this.setState({ onHover: true });
    },
    onOut: function () {
        this.setState({ onHover: false });
    },
};
