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

async function clean() {
    return del('dist/**');
}

function build(cb) {
    let clientItems = 'src/client/**/*.ts';
    browserify( {
        basedir: './src/client',
        entries: ['./js/main.ts'],
        debug: true,
        cache: {},
        packageCache: {}
    })
        // .plugin(tsify)
        .transform('babelify', {
            presets: ['@babel/preset-typescript', '@babel/env', 'minify'],
            extensions: ['.ts']
        })
        .bundle()
        // )
         // First we browserify the client items
        .pipe(source('./js/bundle.js'))
        .pipe(buffer())
        .pipe(uglify())
        .on('error', err => {
            util.log(
                util.colors.red('[Error] ', err.toString())
            );
            this.emit('end');
        })
        .pipe(src(['src/client/**', `!${clientItems}`])) // Here we do all non-ts files
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
        // .pipe(uglify())
        .pipe(sourcemaps.write('./'))
        .pipe(dest('dist/client'));
    
    // Then we do the rest
    src(['src/**/*.ts', `!${clientItems}`])
        .pipe(ts.createProject('tsconfig.json')())
        .pipe(src(['src/**/*', '!src/**/*.ts', `!${clientItems}`]))
        .pipe(src('.env.example', '.env')) // If there exists an .env in the root we want to copy that over too (as clean will remove it)
        .pipe(dest('dist/'));

    cb();
}

function watchBuild(cb) {
    clean();
    build(() => {});
    watch('src/**', build);
}

exports.watch = watchBuild;
exports.build = build;
exports.default = series(clean, build);





// var gulp = require('gulp');
// var browserify = require('browserify');
// var source = require('vinyl-source-stream');
// var tsify = require('tsify');
// var paths = {
//     pages: ['src/*.html']
// };

// gulp.task('copy-html', function () {
//     return gulp.src(paths.pages)
//         .pipe(gulp.dest('dist'));
// });

// gulp.task('default', gulp.series(gulp.parallel('copy-html'), function () {
//     return browserify({
//         basedir: '.',
//         debug: true,
//         entries: ['src/main.ts'],
//         cache: {},
//         packageCache: {}
//     })
//     .plugin(tsify)
//     .bundle()
//     .pipe(source('bundle.js'))
//     .pipe(gulp.dest('dist'));
// }));