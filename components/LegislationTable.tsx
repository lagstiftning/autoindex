import * as React from "react";
import { FC, ReactElement } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "./utils";

export type LegislationTableProps = {
  children:
    | ReactElement<LegislationTableRowProps>
    | ReactElement<LegislationTableRowProps>[];
  className?: string;
};

export const LegislationTable: FC<LegislationTableProps> = ({
  children,
  className,
}) => {
  return <table className={cn("", className)}>{children}</table>;
};

export type LegislationTableRowProps = {
  children:
    | ReactElement<LegislationTableCellProps>
    | ReactElement<LegislationTableCellProps>[];
  className?: string;
  id?: string;
};

export const LegislationTableRow: FC<LegislationTableRowProps> = ({
  children,
  className,
  id,
}) => {
  return (
    <tr className={cn("", className)} id={id}>
      {children}
    </tr>
  );
};

export type LegislationTableCellProps = {
  asChild?: boolean;
  children: ReactElement | ReactElement[] | string;
  className?: string;
  href?: string;
  side: "left" | "right";
  type:
    | "document_heading"
    | "group_heading"
    | "chapter_heading"
    | "section_heading"
    | "paragraph_text";
  index: number;
};

export const LegislationTableCell: FC<LegislationTableCellProps> = ({
  asChild,
  children,
  className,
  href,
  side,
  type,
  index,
}) => {
  const Component = asChild ? Slot : "td";
  return (
    <Component
      lang={side === "left" ? "sv" : "en"}
      className={cn(
        "max-w-[50%] overflow-hidden hyphens-auto [overflow-wrap:anywhere] lg:[overflow-wrap:normal]",
        {
          "pr-1 md:pr-4": side === "left",
          "pl-1 md:pl-4": side === "right",
          "pt-8": index > 0,
          // "font-serif":
          //   type === "document_heading" ||
          //   type === "group_heading" ||
          //   type === "chapter_heading" ||
          //   type === "section_heading",
          "body-text align-top":
            type === "document_heading",
          "section-heading align-top":
            type === "section_heading" || type === "group_heading" || type === "chapter_heading",
          "font-lilex text-xs sm:text-base align-top tracking-tighter md:tracking-normal":
            type === "paragraph_text",
        },
        className,
      )}
    >
      {href ? (
        <a href={href} className="text-link underline">
          {children}
        </a>
      ) : (
        children
      )}
    </Component>
  );
};
