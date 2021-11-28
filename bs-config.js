module.exports = {
  server: {
    baseDir: ["./src", "./src/html", "./build/contracts"],
    routes: {
      "/vendor": "./node_modules",
    },
  },
  notify: false,
};
