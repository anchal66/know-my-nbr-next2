import React from 'react'

export const metadata = {
  title: 'Privacy Policy - knowmynbr.com'
}

export default function PrivacyPage() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
      <p><strong>Effective Date:</strong> [Date]</p>

      <p>Welcome to <strong>knowmynbr.com</strong> (the “Website”). We value your privacy 
      and strive to protect your personal information. This Privacy Policy (“Policy”) 
      explains how we collect, use, disclose, and protect your information when you use 
      our services.</p>

      <h2 className="text-xl font-semibold mt-6 mb-2">1. Information We Collect</h2>
      <ul className="list-disc ml-5">
        <li><strong>Personal Information:</strong> Name, email address, gender, date of birth, 
        payment details, etc., that you voluntarily provide during registration or payment processes.</li>
        <li><strong>Usage Data:</strong> IP addresses, browser type, device information, pages visited, 
        and other analytical data.</li>
        <li><strong>Location Data:</strong> If you enable location-based features for matching or 
        connecting with other users, we may collect and process your geolocation data.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">2. How We Use Your Information</h2>
      <ul className="list-disc ml-5">
        <li>To provide our services: facilitate user profiles, match suggestions, VIP/Featured 
        subscriptions, “NBR Direct” connections, etc.</li>
        <li>For payment processing through secure third-party gateways (e.g., Razorpay).</li>
        <li>To communicate about account notifications, promotions, and respond to inquiries.</li>
        <li>To analyze usage trends and improve features, security, and reliability.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">3. Sharing Your Information</h2>
      <ul className="list-disc ml-5">
        <li><strong>With Other Users:</strong> Certain profile details are visible to others, 
        including contact information if you allow “NBR Direct.”</li>
        <li><strong>Third-Party Processors:</strong> Payment gateways, hosting, or analytics 
        under strict confidentiality.</li>
        <li><strong>Legal Requirements:</strong> We may disclose if required by law or to 
        protect rights, safety, or property.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">4. Cookies &amp; Tracking Technologies</h2>
      <p>We use cookies and similar technologies to store preferences, analyze traffic, 
      and enhance user experience. Manage cookies via your browser settings.</p>

      <h2 className="text-xl font-semibold mt-6 mb-2">5. Data Security</h2>
      <p>We implement security measures to protect your data. However, no electronic 
      transmission or storage is 100% secure.</p>

      <h2 className="text-xl font-semibold mt-6 mb-2">6. Children’s Privacy</h2>
      <p>Our Website is not intended for individuals under 18. We do not knowingly collect 
      data from minors. If you believe we have, contact us at <a href="mailto:help@knowmynbr.com">help@knowmynbr.com</a>.</p>

      <h2 className="text-xl font-semibold mt-6 mb-2">7. International Transfers</h2>
      <p>If you access from outside India, your data may be transferred to India or other 
      countries where our servers/providers are located.</p>

      <h2 className="text-xl font-semibold mt-6 mb-2">8. Changes to This Policy</h2>
      <p>We may update this Policy periodically. Continued use after changes 
      indicates acceptance of the updated policy.</p>

      <h2 className="text-xl font-semibold mt-6 mb-2">9. Contact Us</h2>
      <p>For questions about this Privacy Policy, email us at 
        <a href="mailto:help@knowmynbr.com"> help@knowmynbr.com</a>.</p>
    </main>
  )
}
