import { Link } from 'lucide-react'
import React from 'react'

export const metadata = {
  title: 'Terms & Conditions - knowmynbr.com'
}

export default function TermsPage() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Terms &amp; Conditions</h1>
      <p><strong>Effective Date:</strong> [Date]</p>

      <p>These Terms &amp; Conditions (“Terms”) govern your use of <strong>knowmynbr.com</strong> 
      (“Website” or “Service”). By accessing or using our Website, you agree to be bound by these Terms.</p>

      <h2 className="text-xl font-semibold mt-6 mb-2">1. Eligibility</h2>
      <ul className="list-disc ml-5">
        <li>You must be at least 18 years old to use our services.</li>
        <li>By creating an account, you represent you have the right and authority to enter into these Terms.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">2. Account Registration</h2>
      <ul className="list-disc ml-5">
        <li><strong>Accuracy:</strong> Provide accurate, current, and complete information.</li>
        <li><strong>Confidentiality:</strong> You are responsible for all activities under your account credentials.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">3. Service Description</h2>
      <ul className="list-disc ml-5">
        <li>We provide a platform similar to dating/networking apps, allowing connections, “NBR Direct,” etc.</li>
        <li>Users can upgrade to VIP or Featured statuses for benefits, purchase coins for direct follows.</li>
        <li>“NBR Direct” enables direct access to personal info if the followed user chooses to share it.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">4. User Conduct</h2>
      <ul className="list-disc ml-5">
        <li>No unlawful, hateful, or offensive content.</li>
        <li>No harassment, stalking, or threatening other users.</li>
        <li>No impersonation or misrepresenting affiliation.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">5. Payments &amp; Refunds</h2>
      <p>Fees for subscriptions or coins are processed via Razorpay or other gateways. 
      Refunds follow our <Link href="/cancellation-and-refund">Cancellation &amp; Refund Policy</Link>.</p>

      <h2 className="text-xl font-semibold mt-6 mb-2">6. Intellectual Property</h2>
      <p>All content is owned by knowmynbr.com or its licensors, protected by copyright laws.</p>

      <h2 className="text-xl font-semibold mt-6 mb-2">7. Disclaimer</h2>
      <ul className="list-disc ml-5">
        <li>No guarantee of successful matches or connections.</li>
        <li>All user interactions are at your own risk; we are not liable for offline interactions.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">8. Limitation of Liability</h2>
      <p>To the fullest extent permitted by law, we shall not be liable for indirect or consequential damages arising from your use.</p>

      <h2 className="text-xl font-semibold mt-6 mb-2">9. Modifications &amp; Termination</h2>
      <p>We may modify or terminate services without notice. We may delete your account for violating these Terms.</p>

      <h2 className="text-xl font-semibold mt-6 mb-2">10. Governing Law &amp; Dispute Resolution</h2>
      <p>These Terms are governed by the laws of India, with disputes resolved in courts of [Your Jurisdiction], India.</p>

      <h2 className="text-xl font-semibold mt-6 mb-2">11. Contact Us</h2>
      <p>For questions about these Terms, email <Link href="mailto:help@knowmynbr.com">help@knowmynbr.com</Link>.</p>
    </main>
  )
}
