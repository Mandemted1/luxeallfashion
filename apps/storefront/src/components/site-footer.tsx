import Link from "next/link";
import { footerColumns } from "@/lib/footer";
import { getEnabledSocialLinks } from "@/lib/homepage-content";

export async function SiteFooter() {
  const socialLinks = await getEnabledSocialLinks();

  return (
    <footer className="border-t border-black/10 px-4 pt-14 pb-8 sm:px-6 lg:px-10">
      <div className="grid grid-cols-2 gap-4 sm:gap-6">
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

      {socialLinks.length > 0 && (
        <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2 border-t border-black/10 pt-6">
          {socialLinks.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs uppercase tracking-[0.1em] hover:opacity-70"
            >
              {link.platform}
            </a>
          ))}
        </div>
      )}

      <div
        className={`border-t border-black/10 pt-6 text-center text-xs text-black/50 ${
          socialLinks.length > 0 ? "mt-8" : "mt-14"
        }`}
      >
        © {new Date().getFullYear()} LUXEALLFASHION. All Rights Reserved.
      </div>
    </footer>
  );
}
