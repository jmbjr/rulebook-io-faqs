import React from 'react'
import parseDomain from 'parse-domain'
import { graphql } from 'gatsby'

import Link from 'components/link'
import Layout from 'components/layout'
import Breadcrumbs from 'components/breadcrumbs'

import truncateTitle from 'utils/truncate-title'

import styles from './faq-page.module.scss'
import { FAQ } from 'src/types'
import capitalize from 'utils/capitalize'
import SEOFaqPage from 'components/seo-faq-page'

const FAQPage = ({ data }) => {
  const faq: FAQ = data.faqItem

  const title = truncateTitle(faq.question) + ' — ' + faq.game

  const description = `Question: ${faq.question} Answer: ${truncateTitle(
    faq.answer
  )}`

  return (
    <Layout title={title} description={description}>
      <SEOFaqPage question={faq.question} answer={faq.answer} slug={faq.slug} />
      <Breadcrumbs
        path={[
          {
            title: faq.game,
            link: faq.gameSlug,
          },
          {
            title: faq.question,
            link: faq.slug,
          },
        ]}
      />
      <h1>{faq.question}</h1>
      <p>{faq.answer}</p>
      {renderTags(faq.tags, faq.gameSlug)}
      <p>
        {faq.discussion.map(url => (
          <Link to={url} key={url} openInNewTab={true}>
            {formatDiscussionLinkTitle(url)}
          </Link>
        ))}
      </p>
    </Layout>
  )
}

const renderTags = (tags: string[], gameSlug) => {
  const innerBlock = tags.map(t => (
    <Link style={{ marginRight: 16 }} to={gameSlug + `/tags?tag=${t}`}>
      {capitalize(t)}
    </Link>
  ))
  return <div>Tags: {innerBlock}</div>
}

const formatDiscussionLinkTitle = url => {
  const domainInfo = parseDomain(url)
  if (!domainInfo) {
    return 'Discussion'
  } else {
    const site = `${domainInfo.domain}.${domainInfo.tld}`
    return `Discussion (${site})`
  }
}

export const query = graphql`
  query($slug: String!) {
    faqItem(slug: { eq: $slug }) {
      game
      gameSlug
      slug
      tags
      question
      answer
      discussion
    }
  }
`

export default FAQPage
