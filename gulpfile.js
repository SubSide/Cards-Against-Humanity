const { src, dest, series, parallel, watch }  = require('gulp');
const source = require('vinyl-source-stream');
const del = require('del');
const tsify = require('tsify');
const sourcemaps = require('gulp-sourcemaps');
const ts = require('gulp-typescript');
// const uglify = require('gulp-uglify-es').default;
const uglify = require('gulp-uglify-es').default;
const buffer = require('vinyl-buffer');
const browserify = require('browserify');
const util = require('gulp-util');
var { spawn, spawnSync } = require('child_process');
var _console = console;

function clean(cb) {
    del.sync('dist/**');
    cb();
}

let clientTs = 'src/client/**/*.ts';
function buildClientJavascript() {
    // We browserify main.ts
    return browserify( {
        basedir: './src',
        entries: ['./client/js/main.ts'],
        debug: true,
        cache: {},
        packageCache: {}
    })
        .plugin(tsify)
        .transform('browserify-shim')
        .transform('babelify', {
            presets: [
                // ['@babel/preset-typescript', {}],
                '@babel/preset-env',
            ],
            extensions: ['.ts']
        })
        .bundle()
        .on('error', err => {
            util.log(
                util.colors.red('[Error] ', err.toString())
            );
            this.emit('end');
        })
        // // )
        // Then we bundle it to bundle.js
        .pipe(source('./js/bundle.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
        // We uglify it
        // .pipe(uglify())
        .pipe(sourcemaps.write('./'))
        .pipe(buffer())
        .pipe(dest('dist/client'));
    cb();
}

function buildClientOthers() {
    // Add all the other files
    return src(['src/client/**', `!${clientTs}`]) // Here we do all non-ts files
        .pipe(buffer())
        // And put it in our client folder
        .pipe(dest('dist/client'));
}


function buildServer() {
    return src(['src/**/*.ts', `!${clientTs}`])
        .pipe(ts.createProject('tsconfig.json')())
        .pipe(src(['src/**/*', '!src/**/*.ts', `!${clientTs}`]))
        .pipe(src('.env.example', '.env')) // If there exists an .env in the root we want to copy that over too (as clean will remove it)
        .pipe(dest('dist/'));
}

function watchBuild(cb) {
    clean(() => {});
    build()(() => {});
    watch(['src/**/*.ts', `!${clientTs}`], buildServer);
    watch([clientTs, 'src/shared/**'], buildClientJavascript);
    watch(['src/client/**', `!${clientTs}`], buildClientOthers);
    cb();
}

function devRun() {
    return parallel(
        function(cb) {
            watch(['src/**/*.ts', `!${clientTs}`], series(buildServer, runServer));
            watch([clientTs, 'src/shared/**'], buildClientJavascript);
            watch(['src/client/**', `!${clientTs}`], buildClientOthers);
            cb();
        },
        runServer
    )
};

var currentNpm;
var shouldSpawnNew = false;
async function runServer(cb) {
    shouldSpawnNew = true;

    try {
        if (currentNpm) {
            spawnSync('taskkill', ['/pid', currentNpm.pid, '/f', '/t']);
        }
    } catch(e) {}

    spawnNewServer();
    cb();
}

async function spawnNewServer() {
    if (currentNpm || !shouldSpawnNew) return;

    var npmCommand;
    if (process.platform === 'win32') {
        npmCommand = 'npm.cmd';
    } else {
        npmCommand = 'npm';
    }

    currentNpm = spawn(npmCommand, ['start'], { stdio: 'inherit' });
    currentNpm.on('message', message => _console.debug(message));
    currentNpm.on('error', err => console.error(err));
    currentNpm.on('exit', () => {
        _console.warn("--- Process exited ---");
        currentNpm = false;

        if (shouldSpawnNew) {
            spawnNewServer();
        }
    })
}



function build() {
    return parallel(buildServer, buildClientOthers, buildClientJavascript);
}

exports.clean = clean;
exports.watch = watchBuild;
exports.devRun = devRun();
exports.build = build();
exports.default = series(clean, build());
