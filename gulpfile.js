const { src, dest, series, parallel } = require('gulp');
var { exec, spawn } = require('child_process');
const del = require('del');

let loggedSpawn = function(cb, ...args) {
    let spawnObject = spawn(...args);
    spawnObject.stdout.on('data', data => {
        console.log(`${data}`);
    });

    spawnObject.stderr.on('data', data => {
        console.error(`${data}`);
    });

    if (cb) {
        spawnObject.on('exit', () => {cb();});
    }

    return spawnObject;

}

function appendForWindows(command) {
    return (process.platform === 'win32') ? `${command}.cmd` : command
}

function clean(cb) {
    // We clean both client and server
    del.sync('./dist/**');
    cb();
};

function buildServer(cb) {
    exec("tsc -p tsconfig.server.json", err => {
        if (err) console.error(err);
        cb();
    })
}

function buildClient(cb) {
    let npxCmd = (process.platform === 'win32') ? 'npx.cmd' : 'npx';
    exec(`${npxCmd} webpack --config webpack.prod.js`, err => {
        if (err) console.error(err);
        cb();
    });
}

function runServer(cb) {
    loggedSpawn(cb, appendForWindows('nodemon'), [ '.\\dist\\server\\index.js']);
}

function buildWatchedServer(cb) {
    // We need to suffix .cmd after it to make it work for windows32
    let serverSpawn = spawn(appendForWindows('tsc'), ['-p', 'tsconfig.server.json', '--watch']);
    serverSpawn.on('exit', () => {cb();});
}

function runWatchedClient(cb) {
    loggedSpawn(cb, appendForWindows('.\\node_modules\\.bin\\webpack-dev-server'), ['--config', 'webpack.dev.js']);
}

// .\node_modules\.bin\webpack-dev-server

exports.clean = clean;

exports.buildClient = buildClient;
exports.buildServer = buildServer;
exports.build = parallel(buildClient, buildServer);

exports.runWatchedServer = series(buildServer, parallel(runServer, buildWatchedServer));
exports.runWatchedClient = runWatchedClient;
exports.watch = parallel(
    series(
        buildServer, 
        parallel(
            runServer, 
            buildWatchedServer
        )
    ), 
    runWatchedClient
);

exports.runServer = runServer;