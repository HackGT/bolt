/* eslint-disable @typescript-eslint/no-var-requires */
const gulp = require("gulp");
const gutil = require("gulp-util");
const ts = require("gulp-typescript");
const nodemon = require("nodemon");
const path = require("path");
const gulpCopy = require("gulp-copy");

const tsProject = ts.createProject("./tsconfig.json");

gulp.task("watch", () => {
    gulp.watch("src/**/*", gulp.series("build:server", "build:static"));
});

gulp.task("build:static", () => gulp.src(["./src/config/*", "./package.json", "./src/api/api.graphql"])
       .pipe(gulpCopy("build", { "prefix": 1 })));

gulp.task("build:server", () => tsProject.src()
        .pipe(tsProject())
        .pipe(gulp.dest("build/")));

gulp.task("build", gulp.series("build:server", "build:static"));

gulp.task("serve", gulp.series("build:server", "build:static", () => {
    nodemon({
        script: path.join(__dirname, "build/app.js"),
        watch: ["build/"],
        ignore: ["build/public", "./node_modules"],
        env: {
            "NODE_ENV": "dev",
        },
    }).on("start", () => {
        gutil.log(gutil.colors.blue("Server started!"));
    });
}));

gulp.task("default", gulp.parallel("serve", "watch"));
