"use client";

// Minimal, dependency-free Markdown renderer tuned for assistant replies.
//
// Design goals:
//   - No `dangerouslySetInnerHTML`. We escape all HTML before re-interpreting
//     a small, fixed subset of Markdown syntax. This keeps the chat surface
//     safe against prompt-injected markup from model output.
//   - Handles the common shapes a small Turkic LM actually emits: headings,
//     paragraphs, unordered/ordered lists, blockquotes, fenced code, inline
//     code, bold, italics, and links.
//   - Styled via the Orkhon design tokens (see chat.css) so it reads as part
//     of the inscription-grade UI, not generic prose.

import { Fragment, type ReactNode } from "react";

/* ---------- escaping ---------- */

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/* ---------- inline formatting ---------- */

// Renders inline markdown (bold, italic, code, links) into React nodes.
// The input MUST already be HTML-escaped; we operate on a safe string and
// only ever wrap recognized tokens in elements.
function renderInline(escaped: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  // Tokenizer captures, in priority order: inline code, links, bold, italics.
  const pattern =
    /(`[^`]+`)|(\[[^\]]+\]\([^)]+\))|(\*\*[^*]+\*\*)|(\*[^*]+\*|_[^_]+_)/g;

  let lastIndex = 0;
  let key = 0;

  let match: RegExpExecArray | null;
  while ((match = pattern.exec(escaped)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(
        <Fragment key={`t-${key++}`}>{escaped.slice(lastIndex, match.index)}</Fragment>,
      );
    }
    const token = match[0];

    if (token.startsWith("`")) {
      nodes.push(
        <code key={`c-${key++}`} className="orkhon-md__code">
          {token.slice(1, -1)}
        </code>,
      );
    } else if (token.startsWith("[")) {
      const linkMatch = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token);
      if (linkMatch) {
        const label = linkMatch[1];
        const rawHref = linkMatch[2];
        // Allow only http(s) and relative hrefs; never javascript:.
        const isSafe =
          /^(https?:\/\/|mailto:)/i.test(rawHref) || rawHref.startsWith("/");
        nodes.push(
          isSafe ? (
            <a
              key={`l-${key++}`}
              href={rawHref}
              target="_blank"
              rel="noopener noreferrer"
            >
              {label}
            </a>
          ) : (
            <Fragment key={`l-${key++}`}>{label}</Fragment>
          ),
        );
      }
    } else if (token.startsWith("**")) {
      nodes.push(<strong key={`b-${key++}`}>{token.slice(2, -2)}</strong>);
    } else {
      nodes.push(<em key={`i-${key++}`}>{token.slice(1, -1)}</em>);
    }

    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < escaped.length) {
    nodes.push(<Fragment key={`t-${key++}`}>{escaped.slice(lastIndex)}</Fragment>);
  }

  return nodes;
}

/* ---------- block parsing ---------- */

interface CodeFence {
  type: "code";
  lang: string;
  content: string;
}
interface Blockquote {
  type: "quote";
  lines: string[];
}
interface ListBlock {
  type: "list";
  ordered: boolean;
  items: string[];
}
interface Heading {
  type: "heading";
  level: number;
  text: string;
}
interface Paragraph {
  type: "paragraph";
  text: string;
}

type Block = CodeFence | Blockquote | ListBlock | Heading | Paragraph;

function parseBlocks(src: string): Block[] {
  const lines = src.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Blank line — skip.
    if (line.trim() === "") {
      i += 1;
      continue;
    }

    // Fenced code block ```lang ... ```.
    const fence = /^```(\w+)?\s*$/.exec(line);
    if (fence) {
      const lang = fence[1] ?? "";
      const buf: string[] = [];
      i += 1;
      while (i < lines.length && !/^```\s*$/.test(lines[i])) {
        buf.push(lines[i]);
        i += 1;
      }
      // Consume the closing fence (if present).
      if (i < lines.length) i += 1;
      blocks.push({ type: "code", lang, content: buf.join("\n") });
      continue;
    }

    // Heading.
    const heading = /^(#{1,4})\s+(.*)$/.exec(line);
    if (heading) {
      blocks.push({
        type: "heading",
        level: heading[1].length,
        text: heading[2].trim(),
      });
      i += 1;
      continue;
    }

    // Blockquote (consecutive `>` lines).
    if (/^>\s?/.test(line)) {
      const buf: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        buf.push(lines[i].replace(/^>\s?/, ""));
        i += 1;
      }
      blocks.push({ type: "quote", lines: buf });
      continue;
    }

    // List (consecutive `- `, `* `, or `1. ` lines).
    const ulMatch = /^\s*[-*]\s+(.*)$/.exec(line);
    const olMatch = /^\s*\d+\.\s+(.*)$/.exec(line);
    if (ulMatch || olMatch) {
      const ordered = Boolean(olMatch);
      const items: string[] = [];
      while (i < lines.length) {
        const ul = /^\s*[-*]\s+(.*)$/.exec(lines[i]);
        const ol = /^\s*\d+\.\s+(.*)$/.exec(lines[i]);
        if (ordered && ol) {
          items.push(ol[1]);
          i += 1;
        } else if (!ordered && ul) {
          items.push(ul[1]);
          i += 1;
        } else {
          break;
        }
      }
      blocks.push({ type: "list", ordered, items });
      continue;
    }

    // Paragraph — consume until a blank line or a block-starting line.
    const buf: string[] = [line];
    i += 1;
    while (i < lines.length) {
      const next = lines[i];
      if (
        next.trim() === "" ||
        /^```/.test(next) ||
        /^(#{1,4})\s+/.test(next) ||
        /^>\s?/.test(next) ||
        /^\s*[-*]\s+/.test(next) ||
        /^\s*\d+\.\s+/.test(next)
      ) {
        break;
      }
      buf.push(next);
      i += 1;
    }
    blocks.push({ type: "paragraph", text: buf.join("\n") });
  }

  return blocks;
}

/* ---------- rendering ---------- */

export function Markdown({ content }: { content: string }) {
  const blocks = parseBlocks(content);

  return (
    <div className="orkhon-md">
      {blocks.map((block, idx) => {
        switch (block.type) {
          case "code":
            return (
              <pre key={idx} className="orkhon-md__pre">
                {block.lang && (
                  <span className="orkhon-md__lang" aria-hidden="true">
                    {block.lang}
                  </span>
                )}
                <code>{block.content}</code>
              </pre>
            );
          case "quote":
            return (
              <blockquote key={idx} className="orkhon-md__quote">
                {renderInline(escapeHtml(block.lines.join(" ")))}
              </blockquote>
            );
          case "list":
            return block.ordered ? (
              <ol key={idx} className="orkhon-md__list orkhon-md__list--ordered">
                {block.items.map((item, j) => (
                  <li key={j}>{renderInline(escapeHtml(item))}</li>
                ))}
              </ol>
            ) : (
              <ul key={idx} className="orkhon-md__list">
                {block.items.map((item, j) => (
                  <li key={j}>{renderInline(escapeHtml(item))}</li>
                ))}
              </ul>
            );
          case "heading": {
            const inner = renderInline(escapeHtml(block.text));
            // Map markdown levels (1-4) to document levels (h2-h4) so the
            // rendered markdown never competes with the page's real <h1>.
            const cls = "orkhon-md__heading";
            if (block.level <= 1) {
              return (
                <h2 key={idx} className={cls}>
                  {inner}
                </h2>
              );
            }
            if (block.level === 2) {
              return (
                <h3 key={idx} className={cls}>
                  {inner}
                </h3>
              );
            }
            return (
              <h4 key={idx} className={cls}>
                {inner}
              </h4>
            );
          }
          case "paragraph":
            return (
              <p key={idx} className="orkhon-md__p">
                {renderInline(escapeHtml(block.text.replace(/\n/g, " ")))}
              </p>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
