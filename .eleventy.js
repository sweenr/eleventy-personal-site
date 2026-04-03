const { DateTime } = require("luxon");
const CleanCSS = require("clean-css");
const UglifyJS = require("uglify-js");
const htmlmin = require("html-minifier");
const eleventyNavigationPlugin = require("@11ty/eleventy-navigation");
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const { IdAttributePlugin } = require("@11ty/eleventy");

module.exports = function (eleventyConfig) {
  // Eleventy Navigation https://www.11ty.dev/docs/plugins/navigation/
  eleventyConfig.addPlugin(eleventyNavigationPlugin);
  eleventyConfig.addPlugin(syntaxHighlight);
  eleventyConfig.addPlugin(IdAttributePlugin);

  // Configuration API: use eleventyConfig.addLayoutAlias(from, to) to add
  // layout aliases! Say you have a bunch of existing content using
  // layout: post. If you don’t want to rewrite all of those values, just map
  // post to a new file like this:
  // eleventyConfig.addLayoutAlias("post", "layouts/my_new_post_layout.njk");

  // Merge data instead of overriding
  // https://www.11ty.dev/docs/data-deep-merge/
  eleventyConfig.setDataDeepMerge(true);

  // Extract excerpt from content before <!-- endexcerpt --> marker
  eleventyConfig.setFrontMatterParsingOptions({
    excerpt: true,
    excerpt_separator: "<!-- endexcerpt -->",
  });

  // Add support for maintenance-free post authors
  // Adds an authors collection using the author key in our post frontmatter
  // Thanks to @pdehaan: https://github.com/pdehaan
  eleventyConfig.addCollection("authors", (collection) => {
    const blogs = collection.getFilteredByGlob("content/posts/*/index.md");
    return blogs.reduce((coll, post) => {
      const author = post.data.author;
      if (!author) {
        return coll;
      }
      if (!coll.hasOwnProperty(author)) {
        coll[author] = [];
      }
      coll[author].push(post.data);
      return coll;
    }, {});
  });

  // Talks collection: non-draft talks, newest first
  eleventyConfig.addCollection("talks", (collection) => {
    return collection
      .getFilteredByGlob("content/talks/*.md")
      .filter((item) => item.data.draft !== true)
      .sort((a, b) => b.date - a.date);
  });

  // Projects collection: non-draft projects, newest first
  eleventyConfig.addCollection("projects", (collection) => {
    return collection
      .getFilteredByGlob("content/projects/*.md")
      .filter((item) => item.data.draft !== true)
      .sort((a, b) => b.date - a.date);
  });

  // Render markdown excerpt to HTML
  eleventyConfig.addFilter("renderMarkdown", (content) => {
    if (!content) return "";
    const markdownIt = require("markdown-it")({ breaks: true, linkify: true });
    return markdownIt.render(content);
  });

  // Date formatting (human readable)
  eleventyConfig.addFilter("readableDate", (dateObj) => {
    return DateTime.fromJSDate(dateObj).toFormat("dd LLL yyyy");
  });

  // Date formatting (machine readable)
  eleventyConfig.addFilter("machineDate", (dateObj) => {
    return DateTime.fromJSDate(dateObj).toFormat("yyyy-MM-dd");
  });

  // Current year
  eleventyConfig.addFilter("year", () => {
    return new Date().getFullYear();
  });

  // Minify CSS
  eleventyConfig.addFilter("cssmin", function (code) {
    return new CleanCSS({}).minify(code).styles;
  });

  // Minify JS
  eleventyConfig.addFilter("jsmin", function (code) {
    let minified = UglifyJS.minify(code);
    if (minified.error) {
      console.log("UglifyJS error: ", minified.error);
      return code;
    }
    return minified.code;
  });

  // Minify HTML output
  eleventyConfig.addTransform("htmlmin", function (content, outputPath) {
    if (outputPath && outputPath.indexOf(".html") > -1) {
      let minified = htmlmin.minify(content, {
        useShortDoctype: true,
        removeComments: true,
        collapseWhitespace: true,
      });
      return minified;
    }
    return content;
  });

  // Don't process folders with static assets e.g. images
  eleventyConfig.addPassthroughCopy("favicon.ico");
  eleventyConfig.addPassthroughCopy({ static: "/" });
  eleventyConfig.addPassthroughCopy("admin/");
  // We additionally output a copy of our CSS for use in Decap CMS previews
  eleventyConfig.addPassthroughCopy("_includes/assets/css/inline.css");

  // Copy post assets (images, etc.) to output matching post permalink structure
  const fs = require("fs");
  const path = require("path");
  const postsDir = path.join(__dirname, "content/posts");
  if (fs.existsSync(postsDir)) {
    fs.readdirSync(postsDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .forEach((d) => {
        const src = `content/posts/${d.name}`;
        const dest = `posts/${d.name.toLowerCase()}`;
        eleventyConfig.addPassthroughCopy({
          [src + "/*.{png,jpg,jpeg,gif,svg,webp}"]: dest,
        });
      });
  }

  /* Markdown Plugins */
  let markdownIt = require("markdown-it");
  let markdownItAnchor = require("markdown-it-anchor");
  let options = {
    html: true,
    breaks: true,
    linkify: true,
  };
  let opts = {
    permalink: false,
  };

  eleventyConfig.setLibrary(
    "md",
    markdownIt(options).use(markdownItAnchor, opts),
  );

  return {
    templateFormats: ["md", "njk", "liquid"],

    // If your site lives in a different subdirectory, change this.
    // Leading or trailing slashes are all normalized away, so don’t worry about it.
    // If you don’t have a subdirectory, use "" or "/" (they do the same thing)
    // This is only used for URLs (it does not affect your file structure)
    pathPrefix: "/",

    markdownTemplateEngine: "liquid",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk",
    dir: {
      input: ".",
      includes: "_includes",
      data: "_data",
      output: "_site",
    },
  };
};
