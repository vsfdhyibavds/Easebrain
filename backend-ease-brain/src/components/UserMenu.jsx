export default function UserMenu({ user, onLogout }) {
  return (
    <div className="flex items-center gap-2">
      <span>{user?.name || "User"}</span>
      <button className="bg-teal-500 text-white px-2 py-1 rounded" onClick={onLogout}>
        Logout
      </button>
    </div>
  );
}