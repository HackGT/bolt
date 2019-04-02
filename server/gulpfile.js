const gulp = require("gulp");
const gutil = require("gulp-util");
const tslint = require("gulp-tslint");
const ts = require("gulp-typescript");
const webpack = require("webpack");
const nodemon = require("nodemon");
const path = require("path");
const gulpCopy = require("gulp-copy");

const tsProject = ts.createProject("./tsconfig.json");

gulp.task("watch", (done) => {
    gulp.watch("src/**/*", gulp.series("lint", "build:server", "build:static"));
});

gulp.task("lint", () => {
    return gulp.src(["src/**/*.ts"])
        .pipe(tslint({
            formatter: "prose",
        }))
        .pipe(tslint.report({
            emitError: false,
        }));
});

gulp.task("build:static", () => {
   return gulp.src(["./src/config/*", "./package.json"])
       .pipe(gulpCopy("build", { "prefix": 1 }));
});

gulp.task("build:server", () => {
    return tsProject.src()
        .pipe(tsProject())
        .pipe(gulp.dest("build/"));
});

gulp.task("build", gulp.series("lint", "build:server", "build:static"));

gulp.task("serve", gulp.series("lint", "build:server", "build:static", () => {
    nodemon({
        script: path.join(__dirname, "build/app.js"),
        watch: ["build/"],
        ignore: ["build/public", "./node_modules"],
        env: {
            "NODE_ENV": "dev",
        },
    }).on("start", function() {
        gutil.log(gutil.colors.blue("Server started!"));
    });
}));

gulp.task("default", gulp.parallel("serve", "watch"));
