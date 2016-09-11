var gulp = require("gulp");
var mkdirp = require("mkdirp");
var source = require("vinyl-source-stream");
var buffer = require("vinyl-buffer");
var uglify = require("gulp-uglify");
var browserify = require("browserify");
var watchify = require("watchify");
var autoprefixer = require("gulp-autoprefixer");
var cssnano = require("gulp-cssnano");

function jsBundle(js) {
	mkdirp("build");
	js.bundle()
		.pipe(source("main.js"))
		.pipe(buffer())
		.pipe(uglify())
		.pipe(gulp.dest("build"));
}

gulp.task("build-js", function() {
	jsBundle(browserify("./js/main.js"));
});

gulp.task("watch-js", function() {
	var js = browserify("./js/main.js", {
		cache: {},
		packageCache: {},
		plugin: [watchify]
	});
	js.on("update", function() { jsBundle(js); });
	jsBundle(js);
});

function cssBundle(css) {
	mkdirp("build");
	css.pipe(autoprefixer({
			browsers: ["last 2 versions"],
			cascade: false
		}))
		.pipe(cssnano())
		.pipe(gulp.dest("build"));
}

gulp.task("build-css", function() {
	cssBundle(gulp.src("css/main.css"));
});

gulp.task("watch-css", function() {
	gulp.watch("css/*.css", function(event) { cssBundle(gulp.src(event.path)); });
	cssBundle(gulp.src("css/*.css"));
});

gulp.task("build", ["build-js", "build-css"]);
gulp.task("watch", ["watch-js", "watch-css"]);