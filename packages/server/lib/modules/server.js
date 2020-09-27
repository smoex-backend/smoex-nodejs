"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listenServer = void 0;
const tslib_1 = require("tslib");
const debug_1 = tslib_1.__importDefault(require("debug"));
const http_1 = tslib_1.__importDefault(require("http"));
const debug = debug_1.default('demo:server');
/**
 * Get port from environment and store in Express.
 */
var port = normalizePort(process.env.PORT || '9000');
// app.set('port', port);
/**
 * Create HTTP server.
 */
exports.listenServer = (app) => {
    var server = http_1.default.createServer(app.callback());
    /**
     * Listen on provided port, on all network interfaces.
     */
    server.listen(port);
    server.on('error', onError);
    server.on('listening', onListening(server));
};
/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
    var port = parseInt(val, 10);
    if (isNaN(port)) {
        // named pipe
        return val;
    }
    if (port >= 0) {
        // port number
        return port;
    }
    return false;
}
/**
 * Event listener for HTTP server "error" event.
 */
function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }
    var bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;
    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}
/**
 * Event listener for HTTP server "listening" event.
 */
function onListening(server) {
    return () => {
        var addr = server.address();
        var bind = typeof addr === 'string'
            ? 'pipe ' + addr
            : 'port ' + (addr === null || addr === void 0 ? void 0 : addr.port);
        debug('Listening on ' + bind);
        console.log('Listening on ' + bind);
    };
}
