import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function Markdown({ content }: { content: string }) {
  return (
    <article
      className="prose max-w-none text-text-secondary leading-relaxed
      [&_h2]:text-text-primary [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-12 [&_h2]:mb-4
      [&_h3]:text-text-primary [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-8 [&_h3]:mb-3
      [&_p]:mb-5 [&_strong]:text-text-primary
      [&_a]:text-accent [&_a]:no-underline hover:[&_a]:underline
      [&_pre]:bg-surface [&_pre]:border [&_pre]:border-border [&_pre]:rounded-lg [&_pre]:p-5 [&_pre]:overflow-x-auto
      [&_code]:text-accent [&_code]:text-sm
      [&_ul]:pl-5 [&_ul]:list-disc [&_li]:mb-1
      [&_blockquote]:border-l-2 [&_blockquote]:border-accent/30 [&_blockquote]:pl-4
      [&_img]:rounded-lg"
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </article>
  );
}
