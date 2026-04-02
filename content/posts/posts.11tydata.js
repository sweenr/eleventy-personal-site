module.exports = {
  eleventyComputed: {
    permalink: data => {
      if (data.draft === true) return false;
      const folder = data.page.filePathStem.split('/').slice(-2, -1)[0];
      return `/posts/${folder.toLowerCase()}/`;
    },
    featuredImageUrl: data => {
      if (!data.featuredImage) return null;
      const folder = data.page.filePathStem.split('/').slice(-2, -1)[0];
      return `/posts/${folder.toLowerCase()}/${data.featuredImage}`;
    }
  }
};
