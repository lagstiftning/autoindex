import { promises as fs } from "fs";
import { parse } from "yaml";
import { z } from "zod";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import { selectAll } from "hast-util-select";
import type { Element, Nodes } from "hast";

const Text = z.object({
  sv: z.string(),
  en: z.string(),
});

const ElementType = z.union([
  z.literal("document_heading"),
  z.literal("chapter_heading"),
  z.literal("group_heading"),
  z.literal("section_heading"),
  z.literal("paragraph_text"),
]);

const Element = z
  .object({
    type: ElementType,
    text: Text,
    chapter: z.string().optional(),
    section: z.string().optional(),
    slug: z.string().optional(),
    paragraph: z.string().optional(),
  })
  .strict();

const Revision = z
  .object({
    name: Text,
    code: z.string(),
    abbreviation: z.string(),
    elements: z.array(Element),
  })
  .strict();

export type Revision = z.infer<typeof Revision>;

function addClasses(tree: Nodes, selector: string, classes: string[]): void {
  const nodes: Element[] = selectAll(selector, tree) as Element[];
  nodes.forEach((node) => {
    node.properties = node.properties || {};
    node.properties.className = Array.isArray(node.properties.className)
      ? [...node.properties.className, ...classes]
      : classes;
  });
}

function addTailwindClasses(): (tree: Nodes) => void {
  return (tree: Nodes): void => {
    addClasses(tree, "ol", ["list-decimal", "pl-6", "mt-4"]);
    addClasses(tree, "ul", ["list-disc", "pl-6", "mt-4"]);
  };
}

async function toHtml(markdown: string): Promise<string> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(addTailwindClasses)
    .use(rehypeStringify)
    .process(markdown);
  return String(file);
}

export async function loadRevision(path: string): Promise<Revision> {
  const yaml = await fs.readFile(path, "utf-8");
  const data = parse(yaml);
  const revision = Revision.parse(data);
  revision.elements = await Promise.all(
    revision.elements.map(async (element) => {
      if (element.type === "paragraph_text") {
        element.text.sv = await toHtml(element.text.sv);
        element.text.en = await toHtml(element.text.en);
      }
      return element;
    })
  );
  return revision;
}
