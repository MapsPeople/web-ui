const { EleventyHtmlBasePlugin } = require("@11ty/eleventy");

module.exports = function (eleventyConfig) {
    eleventyConfig.addPlugin(EleventyHtmlBasePlugin);
    eleventyConfig.addPassthroughCopy({ "www/build": "_js" });
    eleventyConfig.addPassthroughCopy({ "src/docs/assets": "/" });

    eleventyConfig.addCollection("components", function (collection) {
        return collection
            .getFilteredByGlob("src/**/*.md")
        // The sort function has stopped working. TODO: Fix!
        // .sort(function (a, b) {
        //     let nameA = a.data.title.toUpperCase();
        //     let nameB = b.data.title.toUpperCase();
        //     if (nameA < nameB) return -1;
        //     else if (nameA > nameB) return 1;
        //     else return 0;
        // });
    });

    eleventyConfig.setUseGitIgnore(false);
    eleventyConfig.addWatchTarget("./src/docs/_sass/");
    eleventyConfig.setBrowserSyncConfig({
        port: 8000,
        ui: false,
    });


    return {
        dir: {
            input: "src",
            includes: "docs/_includes",
            output: "docs",
        },
    };
};
