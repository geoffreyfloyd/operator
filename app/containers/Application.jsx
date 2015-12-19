/* eslint-disable no-unused-vars */
import React from 'react';
import styles from './Application.less';
import { RouteHandler } from 'react-router';

export default class Application extends React.Component {
    static getProps(stores) {
        var transition = stores.Router.getItem('transition');
        return {
            loading: !!transition
        };
    }
    render() {
        // var { loading } = this.props;
        return (<RouteHandler />);
    }
}

Application.propTypes = {
    loading: React.PropTypes.bool
};

Application.contextTypes = {
    stores: React.PropTypes.object,

};
/* eslint-enable no-unused-vars */
