'use strict';

import React from "react";
import RequestStore from "../store-helpers/requests";
import Request from "../components/Request";
import styles from "./Requests.css";

module.exports = exports = React.createClass({
    /*************************************************************
     * COMPONENT LIFECYCLE
     *************************************************************/
    getInitialState: function () {
        return {
            ts: (new Date()).toISOString()
        };
    },

    componentWillMount: function () {
        RequestStore.subscribe(this.handleStoreUpdate, null);
    },

    handleStoreUpdate: function () {
        this.setState({
            ts: (new Date()).toISOString()
        });
    },
    /*************************************************************
    * RENDERING
    *************************************************************/
    render: function () {

        var requests = RequestStore.get();

        return (
            <div className={styles.appcontainer}>
                {requests.map(function (request) {
                    return (
                        <Request key={request.id} data={request} />
                    );
                })}
            </div>
        );
    }
});
