import Link from 'next/link';
import { Button } from "@/components/ui/button";

export default function Header() {
  return (
    <header className="bg-white shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className="w-full py-6 flex items-center justify-between border-b border-indigo-500 lg:border-none">
          <div className="flex items-center">
            <Link href="/">
              <span className="sr-only">Unnati Cloud Labs</span>
              <img
                className="h-10 w-auto"
                src="/unnati-logo.svg"
                alt="Unnati Cloud Labs"
              />
            </Link>
            <div className="hidden ml-10 space-x-8 lg:block">
              <Link href="/manual" className="text-base font-medium text-gray-500 hover:text-gray-900">
                User Manual
              </Link>
              <Link href="/buy-credits" className="text-base font-medium text-gray-500 hover:text-gray-900">
                Buy Credits
              </Link>
            </div>
          </div>
          <div className="ml-10 space-x-4">
            <Link href="/login">
              <Button variant="ghost">Sign in</Button>
            </Link>
            <Link href="/signup">
              <Button>Sign up</Button>
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
