var gulp = require('gulp'),
    paths = {
        ts:  'modules/**/*.ts',
        dest: 'build'
    };

gulp.task('typescript', function () {
    var ts = require('gulp-ts');
    return gulp.src(paths.ts).pipe(ts({
        target : 'ES5',
        out: 'bcw.js',
        module: null,
        noImplicitAny : false
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
    gulp.watch(paths.ts, ['typescript']);
});
gulp.task('default', ['typescript', 'watch', 'static-server']);
