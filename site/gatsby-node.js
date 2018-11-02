const path = require(`path`)
const { createFilePath } = require(`gatsby-source-filesystem`)
const generateSlug = require('./src/utils/_generate-slug')

exports.onCreateWebpackConfig = ({ stage, actions }) => {
  actions.setWebpackConfig({
    resolve: {
      modules: [path.resolve(__dirname, 'src'), 'node_modules'],
    },
  })
}

exports.onCreateNode = props => {
  const { node, getNode, actions, createContentDigest, createNodeId } = props
  const { createNodeField } = actions

  if (node.internal.type === `GamesHJson`) {
    const fileNode = getNode(node.parent)
    const slug = createFilePath({
      node,
      getNode,
      basePath: `faqs`,
      trailingSlash: false,
    })

    node.faqs.forEach(faq => {
      createFaqItemNode(
        props,
        Object.assign({}, faq, {
          game: node.name,
          gameSlug: slug,
        }),
        node.id
      )
    })

    createNodeField({
      node,
      name: `slug`,
      value: slug,
    })
  }
}

function createFaqItemNode(
  { actions, createNodeId, createContentDigest },
  data,
  parentId
) {
  const { createNode } = actions

  const faqSlug = generateSlug(data)

  createNode({
    id: createNodeId(`${data.game}-${data.question}-${data.answer}`),
    parent: parentId,
    children: [],
    question: data.question,
    answer: data.answer,
    game: data.game,
    gameSlug: data.gameSlug,
    discussion: data.discussion,
    slug: `${data.gameSlug}/${faqSlug}`,
    internal: {
      type: `FaqItem`,
      content: JSON.stringify(data),
      contentDigest: createContentDigest(data),
    },
  })
}

exports.createPages = ({
  graphql,
  actions,
  createNodeId,
  createContentDigest,
}) => {
  const { createPage, createNode } = actions

  return new Promise((resolve, reject) => {
    resolve(
      graphql(
        `
          {
            allGamesHJson {
              edges {
                node {
                  faqs {
                    question
                    answer
                  }
                  fields {
                    slug
                  }
                }
              }
            }
            allFaqItem {
              edges {
                node {
                  question
                  answer
                  slug
                }
              }
            }
          }
        `
      ).then(result => {
        if (result.errors) {
          return reject(result.errors)
        }

        const gamePageTemplate = path.resolve(`src/templates/game-page.js`)
        const faqPageTemplate = path.resolve(`src/templates/faq-page.js`)

        const { allGamesHJson, allFaqItem } = result.data
        const games = allGamesHJson.edges
        const faqs = allFaqItem.edges

        games.forEach(({ node }) => {
          const slug = node.fields.slug
          createPage({
            path: slug,
            component: gamePageTemplate,
            context: {
              slug,
            },
          })
        })

        faqs.forEach(({ node: faq }) => {
          createPage({
            path: faq.slug,
            component: faqPageTemplate,
            context: {
              faq,
            },
          })
        })
      })
    )
  })
}
