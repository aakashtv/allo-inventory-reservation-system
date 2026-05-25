import Link from "next/link";
import { Package, Calendar, Database } from "lucide-react";

export function Navbar() {
  return (
    <nav className="border-b bg-background">
      <div className="flex h-16 items-center px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Database className="h-6 w-6 text-primary" />
          <span className="hidden sm:inline-block">Allo System</span>
        </Link>
        <div className="ml-auto flex items-center space-x-4">
          <Link
            href="/products"
            className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1"
          >
            <Package className="h-4 w-4" />
            Products
          </Link>
          <Link
            href="/reservations"
            className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1"
          >
            <Calendar className="h-4 w-4" />
            Reservations
          </Link>
        </div>
      </div>
    </nav>
  );
}
