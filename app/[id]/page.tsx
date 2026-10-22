import { promises as fs } from "fs";
import path from "path";
import { Breadcrumbs } from "@svenskamodellen/components/Breadcrumb";
import { Container } from "@svenskamodellen/components/Container";
import {
  LegislationTable,
  LegislationTableCell,
  LegislationTableRow,
} from "@/components/LegislationTable";
import { Main } from "@svenskamodellen/components/Main";
import { TopLevelHeading } from "@svenskamodellen/components/TopLevelHeading";
import { loadRevision } from "@/lib/revision";
import { Metadata } from "next";

const sourceDirectoryPath = process.env.SOURCE_DIRECTORY_PATH || ".";


type RevisionParams = {
  id: string;
};

type RevisionProps = {
  params: Promise<RevisionParams>;
};

export async function generateStaticParams(): Promise<RevisionParams[]> {
  const sourceDirectoryContents = await fs.readdir(sourceDirectoryPath);
  const revisionParams = sourceDirectoryContents
    .filter((f) => f.match(/^\d+:\d+\.yaml$/))
    .map((f) => {
      const id = f.split(".")[0];
      return {
        id,
      };
    });

  return revisionParams;
}

export async function generateMetadata(
  props: RevisionProps,
): Promise<Metadata> {
  const params = await props.params;
  const id = decodeURIComponent(params.id);
  const revision = await loadRevision(
    path.join(sourceDirectoryPath, `${id}.yaml`),
  );
  const title = revision.name.en;
  const description = `Version ${revision.code}, English Translation`;
  return {
    title,
    description,
  };
}

export default async function Revision(props: RevisionProps) {
  const params = await props.params;
  const id = decodeURIComponent(params.id);
  const revision = await loadRevision(
    path.join(sourceDirectoryPath, `${id}.yaml`),
  );

  type TocEntry = { anchor: string; text: string };
  const slugify = (text: string): string =>
    text
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  const toc: TocEntry[] = [];
  const anchorByIndex = new Map<number, string>();
  const usedAnchors = new Set<string>();
  const uniqueAnchor = (base: string, fallback: string): string => {
    let anchor = base || fallback;
    let n = 2;
    while (usedAnchors.has(anchor)) {
      anchor = `${base || fallback}-${n++}`;
    }
    usedAnchors.add(anchor);
    return anchor;
  };
  const documentHeadingIndex = revision.elements.findIndex(
    (element) => element.type === "document_heading",
  );
  const documentHeading =
    documentHeadingIndex === -1
      ? undefined
      : revision.elements[documentHeadingIndex];
  const rootAnchor = uniqueAnchor(
    documentHeading ? slugify(documentHeading.text.en) : "",
    "top",
  );
  revision.elements.forEach((element, index) => {
    if (
      element.type === "chapter_heading" ||
      element.type === "group_heading"
    ) {
      const anchor = uniqueAnchor(slugify(element.text.en), `heading-${index}`);
      anchorByIndex.set(index, anchor);
      toc.push({ anchor, text: element.text.en });
    }
  });

  return (
    <>
      <Breadcrumbs>
        {{
          "https://svenskamodellen.github.io/": "Svenska modellen",
          "/": "Lagstiftning",
          [`/${process.env.NEXT_PUBLIC_LAW}/${revision.code}`]: `${revision.abbreviation}`,
        }}
      </Breadcrumbs>
      <Main>
        <Container className="flex flex-col items-start space-y-8">
          <TopLevelHeading
            text={revision.name.en}
            subtext={`Version ${revision.code}, English Translation`}
          />

          {documentHeading && (
            <nav aria-label="Table of Contents" className="flex flex-col gap-y-2">
              <h2 className="section-heading">Table of Contents</h2>
              <ul className="flex flex-col font-lilex">
                <li>
                  <a
                    className="font-bold text-link underline"
                    href={`#${rootAnchor}`}
                  >
                    {documentHeading.text.en}
                  </a>
                  {toc.length > 0 && (
                    <ul className="flex flex-col pl-1">
                      {toc.map((entry) => (
                        <li
                          key={entry.anchor}
                          className="relative py-1 pl-6 before:absolute before:left-0 before:top-0 before:h-[1.1rem] before:w-4 before:rounded-bl-[0.2rem] before:border-b before:border-l before:border-slate-300 after:absolute after:left-0 after:top-0 after:h-full after:w-px after:bg-slate-300 last:after:hidden dark:before:border-slate-600 dark:after:bg-slate-600"
                        >
                          <a
                            className="text-link underline"
                            href={`#${entry.anchor}`}
                          >
                            {entry.text}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              </ul>
            </nav>
          )}

          <LegislationTable>
            <tbody>
              {revision.elements.map((element, i) => (
                <LegislationTableRow
                  key={`element-${i}`}
                  id={i === documentHeadingIndex ? rootAnchor : anchorByIndex.get(i)}
                >
                  <LegislationTableCell
                    index={i}
                    side="left"
                    type={element.type}
                    href={
                      element.type === "section_heading"
                        ? `/${process.env.NEXT_PUBLIC_LAW}/${id}/${element.slug}`
                        : undefined
                    }
                    asChild={element.type === "paragraph_text"}
                  >
                    {element.type === "paragraph_text" ? (
                      <td
                        dangerouslySetInnerHTML={{ __html: element.text.sv }}
                      />
                    ) : (
                      element.text.sv
                    )}
                  </LegislationTableCell>
                  <LegislationTableCell
                    index={i}
                    side="right"
                    type={element.type}
                    href={
                      element.type === "section_heading"
                        ? `/${process.env.NEXT_PUBLIC_LAW}/${id}/${element.slug}`
                        : undefined
                    }
                    asChild={element.type === "paragraph_text"}
                  >
                    {element.type === "paragraph_text" ? (
                      <td
                        dangerouslySetInnerHTML={{ __html: element.text.en }}
                      />
                    ) : (
                      element.text.en
                    )}
                  </LegislationTableCell>
                </LegislationTableRow>
              ))}
            </tbody>
          </LegislationTable>
        </Container>
      </Main>
    </>
  );
}
