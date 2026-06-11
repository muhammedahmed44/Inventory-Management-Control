export default function Table({ data }) {
  return (
    <table className="w-full border mt-4">
      <thead>
        <tr className="bg-gray-200">
          <th className="p-2">Name</th>
          <th className="p-2">Stock</th>
        </tr>
      </thead>

      <tbody>
        {data.map((item) => (
          <tr key={item.id} className="text-center border-t">
            <td className="p-2">{item.name}</td>
            <td className="p-2">{item.stock}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}