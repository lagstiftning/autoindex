export default async function(eleventyConfig) {
  eleventyConfig.setUseGitIgnore(false)

  const { EleventyHtmlBasePlugin } = await import("@11ty/eleventy");
  eleventyConfig.addPlugin(EleventyHtmlBasePlugin)

  eleventyConfig.addCollection("sections", function(collection) {
    const posts = collection.getAll();
    const elements = posts.flatMap(post => post.data.elements)
    const sections = elements.filter(element => element.type === 'section_heading')

    return sections.map(section => {
      const revision = posts.find(post => post.data.elements.includes(section)).data
      const revisionElements = revision.elements

      const headingIndex = revisionElements.indexOf(section)
      const nextheadingIndex = revisionElements.findIndex((element, index) => index > headingIndex && element.type === 'section_heading')
      const elements = revisionElements.slice(headingIndex, nextheadingIndex)

      const prevChapterOrGroupHeading = revisionElements.slice(0, headingIndex).reverse().find(element => element.type === 'chapter_heading' || element.type === 'group_heading')
      if (prevChapterOrGroupHeading) {
        elements.unshift(prevChapterOrGroupHeading)
      }

      const description = elements
        .filter(element => element.type === 'paragraph_text')
        .map(element => element.text.en).join(' ')

      let title = section.text.en
      if (section.chapter) {
        title = `Chapter ${section.chapter} ${title}`
      }

      return {
        ...section,
        title,
        revision,
        elements,
        description,
      }
    })
  })

  const pathPrefix = `/${process.env.LAW}/`;
  return {
    pathPrefix,
  };
}
