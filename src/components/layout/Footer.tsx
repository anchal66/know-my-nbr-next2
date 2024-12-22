import Link from "next/link";

export function Footer() {
    return (
      <footer className="w-full border-t bg-white py-2 px-4 text-center text-sm text-gray-600">
        <nav className="flex justify-center space-x-4">
        <Link href="/privacy">Privacy Policy</Link>
        <Link href="/terms">Terms &amp; Conditions</Link>
        <Link href="/cancellation-and-refund">Cancellation &amp; Refund</Link>
        <Link href="/shipping-and-delivery">Shipping &amp; Delivery</Link>
        <Link href="/contact">Contact Us</Link>
      </nav>
      <p className="text-sm text-gray-500 mt-2">
        &copy; {new Date().getFullYear()} knowmynbr.com. All Rights Reserved.
      </p>
      </footer>
    )
  }
  