export default function FormInput({ label, type, value, onChange, error, ...props }) {
  return (
    <div className="mb-4">
      <label className="block mb-1 font-medium">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        className={`w-full p-2 border rounded ${error ? "border-red-500" : "border-gray-300"}`}
        {...props}
      />
      {error && <div className="text-red-500 text-sm mt-1">{error}</div>}
    </div>
  );
}