'use strict';

import React from "react";
import Toolbar from "../components/Toolbar";
import Requests from "./Requests";
import Prompt from "../components/Prompt";

module.exports = exports = React.createClass({
    render: function () {
        return (
            <div >
                <Toolbar />
                <Requests />
                <Prompt />
            </div>
        );
    }
});
