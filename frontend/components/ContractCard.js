import Link from "next/link";

export default function ContractCard({ contract }) {
  return (
    <div className="p-4 border rounded-lg shadow-sm flex justify-between items-center">
      <div>
        <h2 className="font-semibold">{contract.original_filename}</h2>
        <p className="text-sm text-gray-500">Status: {contract.state}</p>
        <p className="text-sm text-gray-500">
          Uploaded: {new Date(contract.upload_ts).toLocaleString()}
        </p>
      </div>
      <Link href={`/contracts/${contract.contract_id}`}>
        <span className="text-blue-600 underline cursor-pointer">View</span>
      </Link>
    </div>
  );
}
