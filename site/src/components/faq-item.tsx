import React from 'react'
import { Link } from 'gatsby'
import { FAQ } from '../types'

const FAQItem = ({ faq, slug }: { faq: FAQ; slug: string }) => {
  return (
    <div>
      <h3>
        <Link to={slug}>{faq.question}</Link>
      </h3>
      <p>{faq.answer}</p>
    </div>
  )
}

export default FAQItem
