import { Link } from 'lucide-react'
import React from 'react'

export const metadata = {
  title: 'Contact Us - knowmynbr.com'
}

export default function ContactPage() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Contact Us</h1>
      <p>If you have questions, concerns, or feedback, please reach out via:</p>

      <ul className="list-disc ml-5 mt-2">
        <li>
          <strong>Email:</strong> <Link href="mailto:help@knowmynbr.com">help@knowmynbr.com</Link>
        </li>
        <li>
          <strong>Website:</strong> <Link href="https://knowmynbr.com">https://knowmynbr.com</Link>
        </li>
      </ul>

      <p className="mt-4">If available, you can also reach us via in-app support chat.</p>
    </main>
  )
}
