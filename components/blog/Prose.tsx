/**
 * The rendered post body. `html` comes from lib/blog, which builds it at build
 * time from Markdown with raw HTML disabled and a sanitising pass (see
 * lib/blog/render.ts), so it is trusted. This is one of the three places
 * dangerouslySetInnerHTML is allowed (02 §5.4). Styles: the `blog prose`
 * block of app/globals.css, scoped under `.post-body`.
 */
export default function Prose({ html }: { html: string }) {
  return (
    <div className="reading-veil mt-10">
      <div data-testid="post-body" className="post-body" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
