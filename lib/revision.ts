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
    editorial_preamble: z.string().optional(),
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

const calloutLabels = {
  NOTE: "Note",
  TIP: "Tip",
  IMPORTANT: "Important",
  WARNING: "Warning",
  CAUTION: "Caution",
} as const;

type CalloutType = keyof typeof calloutLabels;

function addTailwindClasses(
  styleLinks = false,
  styleCallouts = false,
): (tree: Nodes) => void {
  return (tree: Nodes): void => {
    addClasses(tree, "ol", ["list-decimal", "pl-6", "mt-4"]);
    addClasses(tree, "ul", ["list-disc", "pl-6", "mt-4"]);
    if (styleLinks) {
      addClasses(tree, "a", ["text-link", "underline"]);
    }
    if (!styleCallouts) return;

    const blockquotes = selectAll("blockquote", tree) as Element[];
    blockquotes.forEach((blockquote) => {
      const firstParagraph = blockquote.children.find(
        (child): child is Element =>
          child.type === "element" && child.tagName === "p",
      );
      const marker = firstParagraph?.children[0];
      if (!firstParagraph || marker?.type !== "text") return;

      const match = marker.value.match(
        /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*/
      );
      if (!match) return;

      const type = match[1] as CalloutType;
      const remainingText = marker.value.slice(match[0].length);
      if (remainingText) {
        marker.value = remainingText;
      } else {
        firstParagraph.children.shift();
      }
      const labelParagraph: Element = {
        type: "element",
        tagName: "p",
        properties: {
          className: [
            "font-bold",
            "uppercase",
            "tracking-wide",
            "text-sm",
            "mb-2",
          ],
        },
        children: [{ type: "text", value: calloutLabels[type] }],
      };
      const firstParagraphIndex = blockquote.children.indexOf(firstParagraph);
      blockquote.children.splice(firstParagraphIndex, 0, labelParagraph);
      blockquote.properties = {
        ...(blockquote.properties || {}),
        className: [
          "border-l-4",
          "border-link",
          "p-4",
          "rounded-r-md",
        ],
      };
    });
  };
}

async function toHtml(
  markdown: string,
  styleLinks = false,
  styleCallouts = false,
): Promise<string> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(() => addTailwindClasses(styleLinks, styleCallouts))
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
      if (element.editorial_preamble) {
        element.editorial_preamble = await toHtml(
          element.editorial_preamble,
          true,
          true,
        );
      }
      return element;
    })
  );
  return revision;
}
