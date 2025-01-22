import { Container } from "@arbetsmarknad/components/Container";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@arbetsmarknad/components/Breadcrumb";

import { HeaderMenu } from "@arbetsmarknad/components/HeaderMenu";
import { Page } from "@arbetsmarknad/components/Page";

export default function Home() {
  return (
    <Page>
      <HeaderMenu
        href="https://arbetsmarknad.github.io"
        text="arbetsmarknad.github.io"
      />
      <Breadcrumb className="py-4 w-full flex justify-center">
        <Container>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Arbetsmarknad</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/components">Components</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Container>
      </Breadcrumb>
      <main className="flex justify-center w-full py-4">
        <Container>
          <h1>Arbetsmarknad Starter Project</h1>
        </Container>
      </main>
    </Page>
  );
}
