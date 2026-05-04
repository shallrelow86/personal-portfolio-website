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
    return <p className="text-gray-500 text-sm py-4">暂无评论，来说两句吧！</p>;
  }

  return (
    <div className="space-y-4 py-4">
      {comments.map((comment) => (
        <div key={comment._id} className="border rounded p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-medium text-sm">{comment.authorName}</span>
            <span className="text-xs text-gray-400">
              {new Date(comment.createdAt).toLocaleDateString('zh-CN')}
            </span>
          </div>
          <p className="text-sm text-gray-700">{comment.body}</p>
        </div>
      ))}
    </div>
  );
}
