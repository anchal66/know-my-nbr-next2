// src/components/layout/Footer.tsx
import Link from 'next/link'

export function Footer() {
  return (
    <footer className="
      w-full 
      border-t 
      border-gray-700 
      bg-neutral-800 
      text-brand-white 
      p-4 
      flex 
      flex-col 
      items-center
      justify-center
      md:flex-row
      md:justify-between
      text-sm
      space-y-3
      md:space-y-0
    ">
      {/* Left or center container */}
      <nav className="
        flex
        flex-wrap
        items-center
        justify-center
        gap-4
        md:justify-start
      ">
        <Link href="/privacy" className="hover:underline">
          Privacy Policy
        </Link>
        <Link href="/terms" className="hover:underline">
          Terms &amp; Conditions
        </Link>
        <Link href="/cancellation-and-refund" className="hover:underline">
          Cancellation &amp; Refund
        </Link>
        <Link href="/shipping-and-delivery" className="hover:underline">
          Shipping &amp; Delivery
        </Link>
        <Link href="/contact" className="hover:underline">
          Contact Us
        </Link>
      </nav>

      {/* Right or bottom container */}
      <p className="text-xs text-gray-400">
        &copy; {new Date().getFullYear()} knowmynbr.com. All Rights Reserved.
      </p>
    </footer>
  )
}
