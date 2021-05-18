/* eslint-disable @typescript-eslint/no-var-requires */
const gulp = require("gulp");
const ts = require("gulp-typescript");
const gulpCopy = require("gulp-copy");
const sourcemaps = require('gulp-sourcemaps');
const del = require('del');

const tsProject = ts.createProject("./tsconfig.json");

// Clean dist folder
gulp.task('clean', () => del('dist'));

// Copy files
gulp.task("copy", () => gulp.src(["./src/config/*", "./src/api/api.graphql"])
  .pipe(gulpCopy("dist", { "prefix": 1 })));

// Build ts
gulp.task("build", () => tsProject.src()
  .pipe(sourcemaps.init())
  .pipe(tsProject())
  .pipe(sourcemaps.write(".", { includeContent: false, sourceRoot: '../src' }))
  .pipe(gulp.dest("dist")));

gulp.task("default", gulp.series("clean", "build", "copy"));
