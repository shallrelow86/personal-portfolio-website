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
    <div className="space-y-3 py-4">
      {comments.map((comment) => (
        <div key={comment._id} className="border border-border rounded-lg p-4 bg-surface-alt">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-medium text-sm text-primary">{comment.authorName}</span>
            <span className="text-xs text-muted">
              {new Date(comment.createdAt).toLocaleDateString('zh-CN')}
            </span>
          </div>
          <p className="text-sm text-foreground">{comment.body}</p>
        </div>
      ))}
    </div>
  );
}
