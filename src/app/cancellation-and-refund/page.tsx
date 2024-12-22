import React from 'react'

export const metadata = {
  title: 'Cancellation and Refund Policy - knowmynbr.com'
}

export default function CancellationRefundPage() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Cancellation &amp; Refund Policy</h1>
      <p><strong>Effective Date:</strong> [Date]</p>

      <p>We at <strong>knowmynbr.com</strong> strive for customer satisfaction. This policy outlines 
      how we handle cancellations and refunds for subscriptions, coin purchases, or other paid features.</p>

      <h2 className="text-xl font-semibold mt-6 mb-2">1. Subscriptions</h2>
      <ul className="list-disc ml-5">
        <li><strong>VIP/Featured Plans:</strong> May be canceled any time, but no refunds once a 
        billing cycle starts.</li>
        <li><strong>Automatic Renewal:</strong> Cancel before cycle ends to avoid charges.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">2. Coin Purchases</h2>
      <ul className="list-disc ml-5">
        <li>Coins for “NBR Direct” or premium features are <strong>non-refundable</strong> once purchased, 
        except in cases of proven errors.</li>
        <li>Unused coins remain in your wallet; we do not offer monetary refunds for unused coins.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">3. Transaction Errors</h2>
      <p>For payment errors or technical issues, contact <a href="mailto:help@knowmynbr.com">help@knowmynbr.com</a> 
      within 48 hours. If valid, we’ll process a refund or credit.</p>

      <h2 className="text-xl font-semibold mt-6 mb-2">4. Chargebacks</h2>
      <p>If you initiate a chargeback, we may suspend your account until resolved. 
      Contact support first to resolve payment issues.</p>

      <h2 className="text-xl font-semibold mt-6 mb-2">5. Requesting a Refund</h2>
      <p>Email <a href="mailto:help@knowmynbr.com">help@knowmynbr.com</a> with transaction details 
      and reason. We respond within 7 business days to confirm eligibility.</p>

      <h2 className="text-xl font-semibold mt-6 mb-2">6. Changes to This Policy</h2>
      <p>We may update periodically. Continued use after updates indicates acceptance of changes.</p>
    </main>
  )
}
