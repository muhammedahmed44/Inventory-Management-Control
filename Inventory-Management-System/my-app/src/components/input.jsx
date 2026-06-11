export default function Input({ placeholder, value, onChange }) {
  return (
    <input
      className="border p-2 w-full rounded"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
  );
}