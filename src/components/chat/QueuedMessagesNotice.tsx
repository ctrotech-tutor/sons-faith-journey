
interface QueuedMessagesNoticeProps {
  queuedCount: number;
  isOnline: boolean;
}

const QueuedMessagesNotice = ({ queuedCount, isOnline }: QueuedMessagesNoticeProps) => {
  if (isOnline || queuedCount === 0) return null;

  return (
    <div className="bg-yellow-100 border border-yellow-400 rounded-lg p-3 text-center mx-4 mb-3">
      <p className="text-yellow-800 text-sm">
        {queuedCount} message(s) queued. Will send when back online.
      </p>
    </div>
  );
};

export default QueuedMessagesNotice;
