import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

const SAFE_PROTOCOL = /^(https?:|mailto:|tel:|\/|#)/i;

const components: Components = {
  a({ href, children, ...rest }) {
    if (href && !SAFE_PROTOCOL.test(href)) {
      return <span>{children}</span>;
    }
    const isExternal = href && /^https?:\/\//i.test(href);
    return (
      <a
        href={href}
        {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...rest}
      >
        {children}
      </a>
    );
  },
  img({ src, alt, ...rest }) {
    if (typeof src === "string" && !SAFE_PROTOCOL.test(src)) return null;
    return <img src={src} alt={alt || ""} {...rest} loading="lazy" />;
  },
};

export default function Markdown({ content }: { content: string }) {
  return (
    <article
      className="prose-ink max-w-none text-text-secondary leading-relaxed font-body
      [&_h2]:font-display [&_h2]:italic [&_h2]:text-text-primary [&_h2]:text-2xl [&_h2]:mt-12 [&_h2]:mb-4
      [&_h3]:font-display [&_h3]:text-text-primary [&_h3]:text-xl [&_h3]:mt-8 [&_h3]:mb-3
      [&_p]:mb-5 [&_strong]:text-text-primary
      [&_a]:text-accent [&_a]:no-underline hover:[&_a]:underline
      [&_pre]:bg-surface-2 [&_pre]:border [&_pre]:border-border [&_pre]:rounded-lg [&_pre]:p-5 [&_pre]:overflow-x-auto [&_pre]:font-mono [&_pre]:text-sm
      [&_code]:text-accent [&_code]:text-sm [&_code]:font-mono
      [&_ul]:pl-5 [&_ul]:list-disc [&_li]:mb-1
      [&_blockquote]:border-l-2 [&_blockquote]:border-accent/40 [&_blockquote]:pl-4 [&_blockquote]:italic
      [&_img]:rounded-lg"
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>{content}</ReactMarkdown>
    </article>
  );
}
