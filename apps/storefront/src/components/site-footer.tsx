import Link from "next/link";
import { footerColumns } from "@/lib/footer";

export function SiteFooter() {
  return (
    <footer className="border-t border-black/10 px-4 pt-14 pb-8 sm:px-6 lg:px-10">
      <div className="grid grid-cols-3 gap-4 sm:gap-6">
        {footerColumns.map((column, i) => (
          <ul key={i} className="space-y-2 sm:space-y-3">
            {column.links.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="text-xs hover:opacity-70 sm:text-sm"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        ))}
      </div>

      <div className="mt-14 border-t border-black/10 pt-6 text-center text-xs text-black/50">
        © {new Date().getFullYear()} LUXEALLFASHION. All Rights Reserved.
      </div>
    </footer>
  );
}
