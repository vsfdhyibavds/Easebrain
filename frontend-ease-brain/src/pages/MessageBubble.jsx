export function MessageBubble({ msg, isOwn }) {
  const messageText = msg.content || msg.message;
  const isRead = msg.is_read !== undefined ? msg.is_read : msg.read;

  return (
    <div
      className={`max-w-[70%] px-4 py-2 rounded-xl text-sm shadow
      ${isOwn
        ? "ml-auto bg-teal-600 text-white rounded-br-none"
        : "mr-auto bg-gray-100 text-gray-800 rounded-bl-none"
      }`}
    >
      {msg.file_url ? (
        <a
          href={msg.file_url}
          target="_blank"
          className="underline"
        >
          📎 View attachment
        </a>
      ) : (
        <p>{messageText}</p>
      )}

      <div className="flex justify-end text-[10px] opacity-70 mt-1">
        {isRead ? "✓✓ Read" : "✓ Sent"}
      </div>
    </div>
  );
}

