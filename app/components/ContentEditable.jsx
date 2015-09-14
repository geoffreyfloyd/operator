var React = require('react');

/*
 * ContentEditable
 */
var ContentEditable = React.createClass({
    /*************************************************************
     * DEFINITIONS
     *************************************************************/
	// mixins: [React.addons.PureRenderMixin],
    propTypes: {
        className: React.PropTypes.string,
        html: React.PropTypes.string,
        id: React.PropTypes.string,
        onChange: React.PropTypes.func,
        style: React.PropTypes.object
    },

    emitChange: function () {
        var html = this.getDOMNode().innerHTML;
        if (this.props.onChange && html !== this.lastHtml) {
            this.props.onChange({
                target: {
                    id: this.props.id || null,
                    value: html
                }
            });
        }
        this.lastHtml = html;
    },

    render: function () {
        return (
			<div
            style={Object.assign({display: 'inline'}, this.props.style)}
            className={this.props.className}
            onInput={this.emitChange}
            onBlur={this.emitChange}
            contentEditable
            dangerouslySetInnerHTML={{__html: this.props.html}}></div>
		);
    }
});

module.exports = ContentEditable;
