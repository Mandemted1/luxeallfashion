import { SiteHeader } from "@/components/site-header";

export interface LegalSection {
  heading: string;
  body: string[];
}

export function LegalPage({
  title,
  updated,
  intro,
  sections,
}: {
  title: string;
  updated: string;
  intro?: string;
  sections: LegalSection[];
}) {
  return (
    <>
      <SiteHeader />
      <div className="px-4 pt-28 pb-20 sm:px-6 sm:pt-32 lg:px-10">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-semibold sm:text-5xl">{title}</h1>
          <p className="mt-3 text-xs uppercase tracking-[0.1em] text-black/40">
            Last updated {updated}
          </p>

          {intro && <p className="mt-8 text-sm text-black/70">{intro}</p>}

          <div className="mt-10 flex flex-col gap-10">
            {sections.map((section) => (
              <section key={section.heading}>
                <h2 className="text-sm font-medium uppercase tracking-[0.1em] text-black/50">
                  {section.heading}
                </h2>
                <div className="mt-3 flex flex-col gap-3">
                  {section.body.map((paragraph, index) => (
                    <p key={index} className="text-sm leading-relaxed text-black/70">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
