module.exports = {
  tags: ["project"],
  eleventyComputed: {
    permalink: data => {
      if (data.actionButtonUrl === "slug") {
        const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        return `/projects/${slug}/`;
      }
      return false;
    },
    layout: data => {
      if (data.actionButtonUrl === "slug") {
        return "layouts/project.njk";
      }
      return undefined;
    }
  }
};
