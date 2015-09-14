// CommonJS, AMD, and Global shim
(function (factory) {
    'use strict';
    module.exports = exports = factory(
        require('./store')
    );
}(function (store) {
    'use strict';

    var WindowSizeStore = function () {
        store.Store.call(this);
        var me = this;

        var onWindowResize = function () {
            me.updates.value = {
                width: window.innerWidth,
                height: window.innerHeight
            };
            me.notify();
        };

        this.onFirstIn = function () {
            window.addEventListener('resize', onWindowResize);
            onWindowResize();
        };

        this.onLastOut = function () {
            window.removeEventListener('resize', onWindowResize);
        };
    };
    WindowSizeStore.prototype = Object.create(store.Store.prototype);
    WindowSizeStore.prototype.constructor = WindowSizeStore;

    return new WindowSizeStore();
}));
