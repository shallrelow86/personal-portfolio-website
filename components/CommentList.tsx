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
    return <p className="text-muted text-sm py-4">暂无评论，来说两句吧！</p>;
  }

  return (
    <div className="space-y-3 mb-8">
      {comments.map((comment) => (
        <div key={comment._id} className="bg-surface-alt border border-border rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <span className="font-semibold text-sm">{comment.authorName}</span>
            <span className="text-xs text-muted">
              {new Date(comment.createdAt).toLocaleDateString('zh-CN')}
            </span>
          </div>
          <p className="text-sm text-muted leading-relaxed">{comment.body}</p>
        </div>
      ))}
    </div>
  );
}
