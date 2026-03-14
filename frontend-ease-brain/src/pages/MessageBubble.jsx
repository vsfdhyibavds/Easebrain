export function MessageBubble({ msg, isOwn }) {
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
        <p>{msg.message}</p>
      )}

      <div className="flex justify-end text-[10px] opacity-70 mt-1">
        {msg.read ? "✓✓ Read" : "✓ Sent"}
      </div>
    </div>
  );
}
