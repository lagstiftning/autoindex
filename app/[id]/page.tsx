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
import { Page } from "@arbetsmarknad/components/Page";
import { TopLevelHeading } from "@arbetsmarknad/components/TopLevelHeading";
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
  props: RevisionProps
): Promise<Metadata> {
  const params = await props.params;
  const id = decodeURIComponent(params.id);
  const revision = await loadRevision(
    path.join(sourceDirectoryPath, `${id}.yaml`)
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
    path.join(sourceDirectoryPath, `${id}.yaml`)
  );

  return (
    <Page>
      <HeaderMenu
        href="https://lagstiftning.github.io"
        text="lagstiftning.github.io"
      />
      <Breadcrumb className="py-4 w-full flex justify-center">
        <Container>
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
                href={`${process.env.NEXT_PUBLIC_BASE_PATH}/${revision.code}`}
              >
                {revision.abbreviation}
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Container>
      </Breadcrumb>
      <main className="flex flex-col items-center w-full py-4">
        <Container className="flex flex-col items-start space-y-12">
          <TopLevelHeading
            text={revision.name.en}
            subtext={`Version ${revision.code}, English Translation`}
          />

          <LegislationTable>
            <tbody>
              {revision.elements.map((element, i) => (
                <LegislationTableRow key={`element-${i}`}>
                  <LegislationTableCell
                    side="left"
                    type={element.type}
                    href={
                      element.type === "section_heading"
                        ? `${process.env.NEXT_PUBLIC_BASE_PATH}/${id}/${element.slug}`
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
                    side="right"
                    type={element.type}
                    href={
                      element.type === "section_heading"
                        ? `${process.env.NEXT_PUBLIC_BASE_PATH}/${id}/${element.slug}`
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
      </main>
    </Page>
  );
}
