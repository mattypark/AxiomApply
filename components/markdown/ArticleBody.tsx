import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/** Shared markdown renderer — used by public pages AND the admin preview,
 *  so what Matthew previews is exactly what readers get. */
export function ArticleBody({ markdown }: { markdown: string }) {
  return (
    <div className="article-body">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
    </div>
  );
}
