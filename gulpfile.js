var gulp = require('gulp'),
    paths = {
        ts:  'modules/**/*.ts',
        dest: 'build',
        file: 'bcw.js'
    };

gulp.task('typescript', function () {
    var ts = require('gulp-tsc');

    return gulp.src(paths.ts).pipe(ts({
        target: 'ES5',
        emitError: false,
        out: paths.file
    })).pipe(gulp.dest(paths.dest));
});
gulp.task('static-server', function (next) {
    var NodeServer = require('node-static'),
        server = new NodeServer.Server('./' + paths.dest),
        port = 8080;

    require('http').createServer(function (request, response) {
        request.addListener('end', function () {
            server.serve(request, response);
        }).resume();
    }).listen(port, function () {
        console.log('Server listening on port: ' + port);
        next();
    });
});
gulp.task('watch', function () {
    var livereload = require('gulp-livereload'),
        server = livereload();

    gulp.watch(paths.ts, ['typescript']);

    gulp.watch([paths.dest, paths.file].join('/')).on('change', function (file) {
        server.changed(file.path);
    });
});
gulp.task('default', ['typescript', 'watch', 'static-server']);
