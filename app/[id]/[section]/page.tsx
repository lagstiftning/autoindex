import { Metadata } from "next";
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

const sourceDirectoryPath = process.env.SOURCE_DIRECTORY_PATH || ".";


type SectionParams = {
  id: string;
  section: string;
};

type SectionProps = {
  params: Promise<SectionParams>;
};

export async function generateStaticParams(): Promise<SectionParams[]> {
  const sourceDirectoryContents = await fs.readdir(sourceDirectoryPath);
  const sections = await Promise.all(
    sourceDirectoryContents
      .filter((f) => f.match(/^\d+:\d+\.yaml$/))
      .map(async (f) => {
        const filename = path.join(sourceDirectoryPath, f);
        const revision = await loadRevision(filename);
        const sectionHeadings = revision.elements.filter(
          (element) => element.type === "section_heading",
        );
        return sectionHeadings.map((sectionHeading) => {
          return {
            id: f.split(".")[0]!,
            section: sectionHeading.slug!,
          };
        });
      }),
  );
  return sections.flat();
}

export async function generateMetadata(props: SectionProps): Promise<Metadata> {
  const params = await props.params;
  const id = decodeURIComponent(params.id);
  const filename = path.join(sourceDirectoryPath, `${id}.yaml`);
  const revision = await loadRevision(filename);
  const section = revision.elements.find(
    (element) =>
      element.type === "section_heading" && element.slug === params.section,
  );

  const headingIndex = revision.elements.indexOf(section!);
  const nextHeadingIndex = revision.elements.findIndex(
    (element, index) =>
      index > headingIndex && element.type === "section_heading",
  );
  const elements = revision.elements.slice(
    headingIndex,
    nextHeadingIndex === -1 ? undefined : nextHeadingIndex,
  );
  const prevChapterOrGroupHeading = revision.elements
    .slice(0, headingIndex)
    .reverse()
    .find(
      (element) =>
        element.type === "chapter_heading" || element.type === "group_heading",
    );
  if (prevChapterOrGroupHeading) {
    elements.unshift(prevChapterOrGroupHeading);
  }
  const title = `${section!.text.en} of ${revision.name.en}`;
  const description = elements
    .filter((element) => element.type === "paragraph_text")
    .map((element) => element.text.en)
    .join(" ");
  return {
    title,
    description,
  };
}

export default async function Section(props: SectionProps) {
  const params = await props.params;
  const id = decodeURIComponent(params.id);
  const filename = path.join(sourceDirectoryPath, `${id}.yaml`);
  const revision = await loadRevision(filename);
  const section = revision.elements.find(
    (element) =>
      element.type === "section_heading" && element.slug === params.section,
  );
  const headingIndex = revision.elements.indexOf(section!);
  const nextHeadingIndex = revision.elements.findIndex(
    (element, index) =>
      index > headingIndex && element.type === "section_heading",
  );
  const elements = revision.elements.slice(
    headingIndex,
    nextHeadingIndex === -1 ? undefined : nextHeadingIndex,
  );
  const prevChapterOrGroupHeading = revision.elements
    .slice(0, headingIndex)
    .reverse()
    .find(
      (element) =>
        element.type === "chapter_heading" || element.type === "group_heading",
    );
  if (prevChapterOrGroupHeading) {
    elements.unshift(prevChapterOrGroupHeading);
  }

  const shortTitle = section!.chapter
    ? `Chapter ${section!.chapter} ${section!.text.en}`
    : `${section!.text.en}`;

  return (
    <>
      <Breadcrumbs>
        {{
          "https://svenskamodellen.github.io/": "Svenska modellen",
          "/": "Lagstiftning",
          [`/${process.env.NEXT_PUBLIC_LAW}/${revision.code}`]: `${revision.abbreviation}`,
          [`/${process.env.NEXT_PUBLIC_LAW}/${revision.code}/${section!.slug}`]:
            shortTitle,
        }}
      </Breadcrumbs>
      <Main>
        <Container className="flex flex-col items-start space-y-8">
          <TopLevelHeading
            text={`${shortTitle} of ${revision.name.en}`}
            subtext={`Version ${revision.code}, English Translation`}
          />
          {section!.editorial_preamble && (
            <div
              lang="en"
              className="max-w-prose body-text"
              dangerouslySetInnerHTML={{
                __html: section!.editorial_preamble,
              }}
            />
          )}
          <LegislationTable>
            <tbody>
              {elements.map((element, i) => (
                <LegislationTableRow key={`element-${i}`}>
                  <LegislationTableCell index={i} side="left" type={element.type} asChild>
                    <td dangerouslySetInnerHTML={{ __html: element.text.sv }} />
                  </LegislationTableCell>
                  <LegislationTableCell
                    index={i}
                    side="right"
                    type={element.type}
                    asChild
                  >
                    <td dangerouslySetInnerHTML={{ __html: element.text.en }} />
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
