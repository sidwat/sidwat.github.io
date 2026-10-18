# sidwat.github.io

Personal and academic site of Sidhartha Watsa — [sidwat.github.io](https://sidwat.github.io).

Built with Next.js 16 (App Router) and Tailwind CSS v4, statically exported and
deployed to GitHub Pages.

```bash
pnpm install
pnpm dev            # http://localhost:3000 (shows drafts)
pnpm build          # static export to out/
pnpm build:drafts   # the same, with draft and scheduled posts included
```

Blog posts are Markdown files in `content/blog/`; see its
[README](content/blog/README.md). Build through the pnpm scripts rather than
bare `next build`: they finish with a step the static export needs (explained
in DEVELOPMENT.md).

See [DEVELOPMENT.md](DEVELOPMENT.md) for the stack, branch strategy, deployment
steps, and roadmap. The previous Jekyll site is preserved under
`_legacy-jekyll/`.
