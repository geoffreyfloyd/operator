'use strict';

import React from "react";
import Requests from "../store-helpers/requests";
import Request from "./Request";
import styles from "./WebPrompt.css";

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
        Requests.subscribe(this.handleSendRequest);
    },

    handleSendRequest: function () {
        this.setState({
            ts: (new Date()).toISOString()
        });
    },
    /*************************************************************
    * RENDERING
    *************************************************************/
    render: function () {

        var requests = Requests.get();

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
