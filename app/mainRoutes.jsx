import React from 'react';
import { Route, DefaultRoute, NotFoundRoute } from 'react-router';

// Only import from `route-handlers/*`
import Application from 'route-handlers/Application';
import ReadmePage from 'route-handlers/ReadmePage';
import WebPromptPage from 'route-handlers/WebPromptPage';
import NotFoundPage from 'route-handlers/NotFoundPage';

// polyfill
if (!Object.assign) {
    Object.assign = React.__spread; // eslint-disable-line no-underscore-dangle
}

// export routes
module.exports = (
    <Route name="app" path="/" handler={Application}>
        <Route name="readme" path="/readme" handler={ReadmePage} />
        <Route name="cmd" path="/cmd" handler={WebPromptPage} />
        <DefaultRoute handler={WebPromptPage} />
        <NotFoundRoute handler={NotFoundPage} />
    </Route>
);
