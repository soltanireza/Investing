import gulp from "gulp";
import { argv } from "yargs";
import sass from "gulp-sass";
import cleanCss from "gulp-clean-css";
import gulpIf from "gulp-if";
import sourceMaps from "gulp-sourcemaps";
import imagemin from "gulp-imagemin";
import del from "del";
import webpack from "webpack-stream";
import named from "vinyl-named";
import browserSync from "browser-sync";
import GulpZip from "gulp-zip";
import info from "./package.json";
import replace from "gulp-replace";

const PRODUCTION = argv.prod;

const server = browserSync.create();

const paths = {
  styles: {
    src: "src/scss/bundle.scss",
    dest: "dist/css",
  },
  images: {
    src: "src/img/**/*.{jpg, jpeg, svg, gif}",
    dest: "dist/img",
  },
  scripts: {
    src: "src/js/bundle.js",
    dest: "dist/js",
  },
  other: {
    src: ["src/**/*", "!src/{img,scss,js}", "!src/{img,scss,js}/**/*"],
    dest: "dist/",
  },
};

export const clean = () => del(["dist"]);

export const styles = () => {
  return gulp
    .src(paths.styles.src)
    .pipe(gulpIf(!PRODUCTION, sourceMaps.init()))
    .pipe(sass().on("error", sass.logError))
    .pipe(gulpIf(PRODUCTION, cleanCss({ compability: "ie8" })))
    .pipe(gulpIf(!PRODUCTION, sourceMaps.write()))
    .pipe(gulp.dest(paths.styles.dest));
};

export const images = () => {
  return gulp
    .src(paths.images.src)
    .pipe(gulpIf(!PRODUCTION, imagemin()))
    .pipe(gulp.dest(paths.images.dest));
};

export const copy = () => {
  return gulp.src(paths.other.src).pipe(gulp.dest(paths.other.dest));
};

export const watch = () => {
  gulp.watch("src/scss/**/*.scss", styles);
  gulp.watch("src/js/**/*.js", scripts);
  gulp.watch(paths.images.src, images);
  gulp.watch(paths.other.src, copy);
};

export const scripts = () => {
  return gulp
    .src(paths.scripts.src)
    .pipe(
      webpack({
        module: {
          rules: [
            {
              test: /\.js$/,
              use: {
                loader: "babel-loader",
                options: {
                  presets: ["@babel/preset-env"],
                },
              },
            },
          ],
        },
        output: {
          filename: "bundle.min.js",
        },
        devtool: !PRODUCTION ? "inline-source-map" : false,
        mode: PRODUCTION ? "production" : "development",
      })
    )
    .pipe(gulp.dest(paths.scripts.dest));
};

export const dev = gulp.series(
  clean,
  gulp.parallel(styles, scripts, images, copy),
  watch
);
export const build = gulp.series(
  clean,
  gulp.parallel(styles, scripts, images, copy)
);

export default dev;
