import { Link } from 'lucide-react'
import React from 'react'

export const metadata = {
  title: 'Shipping and Delivery Policy - knowmynbr.com'
}

export default function ShippingDeliveryPage() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Shipping &amp; Delivery Policy</h1>
      <p><strong>Effective Date:</strong> [Date]</p>

      <p><strong>knowmynbr.com</strong> primarily offers digital services (e.g., VIP subscriptions, 
      coin purchases, NBR Direct). We do not typically ship physical goods. If we do in the future, 
      this policy applies:</p>

      <h2 className="text-xl font-semibold mt-6 mb-2">1. Digital Services</h2>
      <p>All subscriptions and coin purchases are delivered instantly online upon payment confirmation.</p>

      <h2 className="text-xl font-semibold mt-6 mb-2">2. Merchandise Shipping</h2>
      <ul className="list-disc ml-5">
        <li><strong>Shipping Method &amp; Time:</strong> Items ship via reputable couriers; 
        time varies by location.</li>
        <li><strong>Shipping Fees:</strong> Calculated at checkout, if applicable.</li>
        <li><strong>Delivery Confirmation:</strong> Tracking info may be sent via email.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">3. Delays &amp; Issues</h2>
      <ul className="list-disc ml-5">
        <li><strong>Wrong Address:</strong> We are not responsible for lost items 
        if the address is incorrect.</li>
        <li><strong>Customs/Duties:</strong> International orders may incur additional fees 
        the buyer must cover.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">4. Damaged or Lost Shipments</h2>
      <p>If an item arrives damaged, contact <Link href="mailto:help@knowmynbr.com">help@knowmynbr.com</Link> 
      within 48 hours with photos. We will arrange a replacement or refund as appropriate.</p>

      <h2 className="text-xl font-semibold mt-6 mb-2">5. Updates</h2>
      <p>We may modify shipping carriers, fees, or methods. Check this page for updates.</p>
    </main>
  )
}
