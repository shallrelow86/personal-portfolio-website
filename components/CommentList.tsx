interface Comment {
  _id: string;
  authorName: string;
  body: string;
  createdAt: string;
}

interface CommentListProps {
  comments: Comment[];
}

export default function CommentList({ comments }: CommentListProps) {
  if (comments.length === 0) {
    return (
      <p className="font-mono text-sm text-muted py-6">
        No comments yet. Be the first.
      </p>
    );
  }

  return (
    <div className="space-y-px bg-border mb-8">
      {comments.map((comment) => (
        <div key={comment._id} className="bg-surface p-5">
          <div className="flex items-baseline gap-3 mb-2">
            <span className="font-mono text-sm font-bold text-primary">
              {comment.authorName}
            </span>
            <span className="font-mono text-xs text-muted">
              {new Date(comment.createdAt).toLocaleDateString('zh-CN')}
            </span>
          </div>
          <p className="font-sans text-sm text-muted leading-relaxed">
            {comment.body}
          </p>
        </div>
      ))}
    </div>
  );
}
