export default function Avatar({ src, alt = "Avatar", size = 40 }) {
  return (
    <img
      src={src || "/default-avatar.png"}
      alt={alt}
      className="rounded-full"
      style={{ width: size, height: size }}
    />
  );
}