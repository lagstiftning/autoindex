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
};

export const LegislationTableRow: FC<LegislationTableRowProps> = ({
  children,
  className,
}) => {
  return <tr className={cn("", className)}>{children}</tr>;
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
};

export const LegislationTableCell: FC<LegislationTableCellProps> = ({
  asChild,
  children,
  className,
  href,
  side,
  type,
}) => {
  const Component = asChild ? Slot : "td";
  return (
    <Component
      className={cn(
        "max-w-[50%] overflow-hidden",
        {
          "pr-1 md:pr-4": side === "left",
          "pl-1 md:pl-4": side === "right",
          "text-base lg:text-2xl font-normal align-top":
            type === "document_heading",
          "text-base lg:text-xl font-bold py-4 align-top text-ellipsis":
            type === "group_heading" || type === "chapter_heading",
          "text-base lg:text-xl font-bold pt-4 align-top":
            type === "section_heading",
          "text-xs md:text-base lg:text-lg py-4 align-top":
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
