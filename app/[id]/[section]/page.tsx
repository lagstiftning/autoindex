import { Metadata } from "next";
import { promises as fs } from "fs";
import path from "path";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@arbetsmarknad/components/Breadcrumb";
import { Container } from "@arbetsmarknad/components/Container";
import { HeaderMenu } from "@arbetsmarknad/components/HeaderMenu";
import {
  LegislationTable,
  LegislationTableCell,
  LegislationTableRow,
} from "@arbetsmarknad/components/LegislationTable";
import { Footer } from "@arbetsmarknad/components/Footer";
import { Main } from "@arbetsmarknad/components/Main";
import { Page } from "@arbetsmarknad/components/Page";
import { TopLevelHeading } from "@arbetsmarknad/components/TopLevelHeading";
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
    <Page>
      <HeaderMenu
        href="https://lagstiftning.github.io"
        text="lagstiftning.github.io"
      />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="https://arbetsmarknad.github.io/">
              Arbetsmarknad
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Lagstiftning</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink
              href={`/${process.env.NEXT_PUBLIC_LAW}/${revision.code}`}
            >
              {revision.abbreviation}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink
              href={`/${process.env.NEXT_PUBLIC_LAW}/${revision.code}/${
                section!.slug
              }`}
            >
              {shortTitle}
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Main>
        <Container className="flex flex-col items-start space-y-12">
          <TopLevelHeading
            text={`${section!.text.en} of ${revision.name.en}`}
            subtext={`Version ${revision.code}, English Translation`}
          />
          <LegislationTable>
            <tbody>
              {elements.map((element, i) => (
                <LegislationTableRow key={`element-${i}`}>
                  <LegislationTableCell side="left" type={element.type} asChild>
                    <td dangerouslySetInnerHTML={{ __html: element.text.sv }} />
                  </LegislationTableCell>
                  <LegislationTableCell
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
      <Footer
        sourceCode={[
          `lagstiftning/${process.env.NEXT_PUBLIC_LAW}`,
          "lagstiftning/autoindex",
          "arbetsmarknad/components",
        ]}
      />
    </Page>
  );
}
