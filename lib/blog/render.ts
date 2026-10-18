// Markdown -> HTML for posts. Build time only.
//
// Safety model: raw HTML in the Markdown is never parsed into elements
// (remark-rehype without `allowDangerousHtml` drops it), and a sanitising pass
// runs both before and after the third-party plugins to remove event handlers,
// unexpected styles and any URL that is not http(s), mailto, a fragment or a
// site-relative path. The output is trusted and rendered with
// dangerouslySetInnerHTML by the post page only.

import { existsSync, statSync } from "node:fs";
import path from "node:path";

import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { createCssVariablesTheme } from "shiki";
import { unified } from "unified";

import { t } from "./copy";
import { probeImageSize } from "./image";
import { BlogContentError } from "./validate";

// ---- minimal hast shapes (the `hast` types are not a direct dependency) ----

type HText = { type: "text"; value: string };
type HElement = {
  type: "element";
  tagName: string;
  properties: Record<string, unknown>;
  children: HNode[];
};
type HParent = { type: "root" | "element"; children: HNode[] };
type HNode = HElement | HText | { type: "comment" | "doctype" | "raw"; value?: string } | HParent;

const isElement = (n: HNode | undefined, tag?: string): n is HElement =>
  !!n && n.type === "element" && (!tag || (n as HElement).tagName === tag);

/** Depth-first walk over elements. The callback may replace children of `parent` in place. */
function walk(node: HParent, fn: (el: HElement, parent: HParent, index: number) => void) {
  for (let i = 0; i < node.children.length; i++) {
    const child = node.children[i];
    if (isElement(child)) {
      fn(child, node, i);
      // fn may have replaced the child; walk whatever now sits at i.
      const current = node.children[i];
      if (current && "children" in current) walk(current as HParent, fn);
    }
  }
}

function textOf(node: HNode): string {
  if (node.type === "text") return (node as HText).value;
  if ("children" in node) return node.children.map(textOf).join("");
  return "";
}

const classList = (el: HElement): string[] => {
  const c = el.properties.className;
  return Array.isArray(c) ? c.map(String) : typeof c === "string" ? c.split(/\s+/) : [];
};

// ---- render context -------------------------------------------------------

export type RenderContext = {
  /** Repo-relative path, for messages, e.g. `content/blog/foo.md`. */
  file: string;
  /** Absolute path of the `public/` directory. */
  publicDir: string;
  /** Collected problems; the loader throws them together. */
  errors: string[];
  warn: (message: string) => void;
};

type VFileLike = { data: Record<string, unknown> };
const ctxOf = (file: VFileLike) => file.data.blog as RenderContext;

// ---- URL safety -----------------------------------------------------------

const SAFE_SCHEMES = new Set(["http", "https", "mailto"]);

/** Scheme of a URL as a browser would see it (control chars and whitespace ignored). */
function schemeOf(url: string): string | undefined {
  const cleaned = url.replace(/[\u0000- \u007f-\u009f]/g, "");
  const m = /^([a-zA-Z][a-zA-Z0-9+.-]*):/.exec(cleaned);
  return m ? m[1].toLowerCase() : undefined;
}

export function isSafeUrl(url: string): boolean {
  const scheme = schemeOf(url);
  return scheme === undefined || SAFE_SCHEMES.has(scheme);
}

const URL_PROPS = ["href", "src", "srcSet", "action", "formAction", "poster", "cite", "data", "xLinkHref"];
const DROP_TAGS = new Set([
  "script", "style", "iframe", "frame", "frameset", "object", "embed", "applet", "base",
  "link", "meta", "form", "input", "button", "textarea", "select", "template", "noscript",
  "svg", "math",
]);
// Shiki's css-variables theme emits only these declarations.
// rehype-pretty-code adds `display: grid` to `code`.
const SAFE_STYLE =
  /^(?:\s*(?:(?:color|background-color|--shiki-[a-z-]+)\s*:\s*(?:var\(--shiki-[a-z-]+\)|#[0-9a-fA-F]{3,8}|inherit|transparent)|display\s*:\s*grid)\s*;?)*\s*$/;

/**
 * Remove anything that could execute or escape the post: event handlers,
 * dangerous tags, unsafe URL schemes, non-Shiki inline styles. GFM task-list
 * checkboxes (disabled inputs) are the only inputs kept.
 */
function sanitiseTree(tree: HParent) {
  {
    walk(tree, (el, parent, index) => {
      const isTaskBox =
        el.tagName === "input" && el.properties.type === "checkbox" && el.properties.disabled === true;
      if (DROP_TAGS.has(el.tagName) && !isTaskBox) {
        parent.children.splice(index, 1, { type: "text", value: "" });
        return;
      }
      for (const key of Object.keys(el.properties)) {
        if (/^on/i.test(key)) delete el.properties[key];
      }
      if ("style" in el.properties && !SAFE_STYLE.test(String(el.properties.style))) {
        delete el.properties.style;
      }
      for (const key of URL_PROPS) {
        const value = el.properties[key];
        if (value !== undefined && !isSafeUrl(String(value))) delete el.properties[key];
      }
      // A link whose href was removed is just text.
      if (el.tagName === "a" && el.properties.href === undefined && !el.properties.id) {
        parent.children.splice(index, 1, { type: "element", tagName: "span", properties: {}, children: el.children });
      }
      if (el.tagName === "img" && el.properties.src === undefined) {
        parent.children.splice(index, 1, { type: "text", value: "" });
      }
    });
  }
}

// Two distinct attachers: unified de-duplicates a plugin used twice.
const sanitiseBefore = () => sanitiseTree;
const sanitiseAfter = () => sanitiseTree;

// ---- headings -------------------------------------------------------------

// Ids the site layout already uses; a heading called "Main" must not clash.
const RESERVED_IDS = new Set(["main", "footnote-label"]);

const isFootnoteSection = (n: HParent) =>
  n.type === "element" && (n as HElement).tagName === "section" && !!(n as HElement).properties.dataFootnotes;

function avoidReservedIds() {
  return (tree: HParent) => {
    const taken = new Set<string>();
    walk(tree, (el) => {
      if (typeof el.properties.id === "string") taken.add(el.properties.id);
    });
    walk(tree, (el, parent) => {
      const id = el.properties.id;
      if (typeof id !== "string" || !/^h[2-6]$/.test(el.tagName) || !RESERVED_IDS.has(id)) return;
      // The footnotes heading legitimately owns `footnote-label` (refs point at it).
      if (id === "footnote-label" && isFootnoteSection(parent)) return;
      let n = 1;
      while (taken.has(`${id}-${n}`)) n++;
      el.properties.id = `${id}-${n}`;
      taken.add(el.properties.id as string);
    });
  };
}

/** The body never has an `h1` (the title is the page's only one): demote to `h2`. */
function demoteH1() {
  return (tree: HParent) => {
    walk(tree, (el) => {
      if (el.tagName === "h1") el.tagName = "h2";
    });
  };
}

// ---- code, tables, figures, links, images --------------------------------

function codeRegions() {
  return (tree: HParent) => {
    walk(tree, (el) => {
      if (el.tagName !== "pre") return;
      const lang = el.properties.dataLanguage ?? el.properties["data-language"];
      const label =
        typeof lang === "string" && lang && lang !== "plaintext" && lang !== "text"
          ? t("blog.post.code.aria", { language: lang })
          : t("blog.post.code.aria.plain");
      el.properties.tabIndex = 0;
      el.properties.role = "region";
      el.properties.ariaLabel = label;
    });
  };
}

function tableWrap() {
  return (tree: HParent) => {
    walk(tree, (el, parent, index) => {
      if (el.tagName !== "table") return;
      if (isElement(parent as HNode, "div") && classList(parent as HElement).includes("table-wrap")) return;
      parent.children[index] = {
        type: "element",
        tagName: "div",
        properties: { className: ["table-wrap"], tabIndex: 0, role: "region", ariaLabel: t("blog.post.table.aria") },
        children: [el],
      };
    });
  };
}

/** A paragraph holding only an image becomes a figure; its title becomes the caption. */
function figures() {
  return (tree: HParent) => {
    walk(tree, (el, parent, index) => {
      if (el.tagName !== "p") return;
      const meaningful = el.children.filter((c) => !(c.type === "text" && !(c as HText).value.trim()));
      if (meaningful.length !== 1 || !isElement(meaningful[0], "img")) return;
      const img = meaningful[0];
      const title = typeof img.properties.title === "string" ? img.properties.title.trim() : "";
      delete img.properties.title;
      const children: HNode[] = [img];
      if (title) {
        children.push({ type: "element", tagName: "figcaption", properties: {}, children: [{ type: "text", value: title }] });
      }
      parent.children[index] = { type: "element", tagName: "figure", properties: {}, children };
    });
  };
}

function externalLinks() {
  return (tree: HParent) => {
    walk(tree, (el) => {
      if (el.tagName !== "a") return;
      const href = el.properties.href;
      if (typeof href === "string" && /^https?:/i.test(href)) {
        el.properties.rel = ["noopener", "noreferrer"];
        delete el.properties.target;
      }
    });
  };
}

/** Resolve a site-absolute path to a file under public/, or undefined if outside it. */
export function localImagePath(publicDir: string, src: string): string | undefined {
  const clean = src.split(/[?#]/)[0];
  let decoded: string;
  try {
    decoded = decodeURIComponent(clean);
  } catch {
    return undefined;
  }
  const abs = path.resolve(publicDir, "." + decoded);
  return abs.startsWith(publicDir + path.sep) ? abs : undefined;
}

function images() {
  return (tree: HParent, file: VFileLike) => {
    const ctx = ctxOf(file);
    walk(tree, (el) => {
      if (el.tagName !== "img") return;
      const src = String(el.properties.src ?? "");
      el.properties.loading = "lazy";
      el.properties.decoding = "async";
      if (/^https?:/i.test(src)) {
        ctx.warn(`${ctx.file}: external image ${src} (prefer /images/blog/<slug>/...; it is not checked or sized)`);
        return;
      }
      if (!src.startsWith("/") || src.startsWith("//")) {
        ctx.errors.push(`${ctx.file}: image "${src}" must start with /images/blog/ (a path under public/)`);
        return;
      }
      const abs = localImagePath(ctx.publicDir, src);
      if (!abs || !existsSync(abs) || !statSync(abs).isFile()) {
        ctx.errors.push(`${ctx.file}: image "${src}" does not exist (expected public${src.split(/[?#]/)[0]})`);
        return;
      }
      const size = probeImageSize(abs);
      if (size) {
        el.properties.width = size.width;
        el.properties.height = size.height;
      } else {
        ctx.warn(`${ctx.file}: could not read the size of ${src}; it may cause layout shift`);
      }
      if (typeof el.properties.alt !== "string" || !el.properties.alt.trim()) {
        ctx.warn(`${ctx.file}: image ${src} has no alt text`);
      }
    });
  };
}

// ---- pipeline -------------------------------------------------------------

type AutolinkOptions = NonNullable<Parameters<typeof rehypeAutolinkHeadings>[0]>;
const autolinkOptions: AutolinkOptions = {
  behavior: "append",
  test: (el) => el.properties?.id !== "footnote-label",
  properties: (el) => ({
    className: ["anchor"],
    ariaLabel: t("blog.post.anchor.label", { heading: textOf(el as unknown as HNode).trim() }),
  }),
  content: { type: "text", value: "#" },
};

type PrettyCodeOptions = NonNullable<Parameters<typeof rehypePrettyCode>[0]>;
const prettyCodeOptions: PrettyCodeOptions = {
  // Colours come from CSS variables set in the `blog prose` block, so the same
  // HTML works on both grounds and no client JS is involved.
  theme: createCssVariablesTheme({
    name: "css-variables",
    variablePrefix: "--shiki-",
    fontStyle: false,
  }) as PrettyCodeOptions["theme"],
  keepBackground: false,
  // Inline `code{:lang}` highlighting is off: it is not designed, and the
  // plugin builds that HTML by string concatenation.
  bypassInlineCode: true,
};

// unified's generics cannot follow our local tree types; the chain is verified by tests instead.
type AnyPlugin = Parameters<ReturnType<typeof unified>["use"]>[0];
const p = (plugin: unknown) => plugin as AnyPlugin;

let processor: ReturnType<typeof build> | undefined;

function build() {
  return unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, {
      allowDangerousHtml: false,
      footnoteLabel: t("blog.post.footnotes.heading"),
      footnoteBackLabel: (referenceIndex: number, rereferenceIndex: number) =>
        t("blog.post.footnote.backref", {
          n: `${referenceIndex + 1}${rereferenceIndex > 1 ? `-${rereferenceIndex}` : ""}`,
        }),
    })
    .use(p(sanitiseBefore))
    .use(p(demoteH1))
    .use(rehypeSlug)
    .use(p(avoidReservedIds))
    .use(rehypeAutolinkHeadings, autolinkOptions)
    .use(rehypePrettyCode, prettyCodeOptions)
    .use(p(codeRegions))
    .use(p(tableWrap))
    .use(p(figures))
    .use(p(externalLinks))
    .use(p(images))
    .use(p(sanitiseAfter))
    .use(rehypeStringify);
}

/** Render a post body. Problems are pushed to `ctx.errors` (the caller throws). */
export async function renderMarkdown(markdown: string, ctx: RenderContext): Promise<string> {
  processor ??= build();
  try {
    const out = await processor.process({ value: markdown, data: { blog: ctx } });
    return String(out);
  } catch (err) {
    throw new BlogContentError(`${ctx.file}: the body could not be rendered (${(err as Error).message})`);
  }
}

/** `max(1, ceil(words / 200))`, counted on the Markdown source with code fences excluded. */
export function readingMinutes(markdown: string): number {
  const lines = markdown.split(/\r?\n/);
  const kept: string[] = [];
  let fence: string | null = null;
  for (const line of lines) {
    const m = /^\s{0,3}(`{3,}|~{3,})/.exec(line);
    if (fence) {
      if (m && m[1][0] === fence[0] && m[1].length >= fence.length && line.trim() === m[1]) fence = null;
      continue;
    }
    if (m) {
      fence = m[1];
      continue;
    }
    kept.push(line);
  }
  const words = kept.join(" ").match(/[\p{L}\p{N}][\p{L}\p{N}'’_-]*/gu)?.length ?? 0;
  return Math.max(1, Math.ceil(words / 200));
}
