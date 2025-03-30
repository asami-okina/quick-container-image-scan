type ScanResultsHeaderProps = {
  artifactName: string;
  createdAt: string;
};

export function ScanResultsHeader({
  artifactName,
  createdAt,
}: ScanResultsHeaderProps) {
  return (
    <div className="pb-4">
      <h2 className="text-xl font-semibold bg-gradient-to-r from-pink-600 to-orange-600 bg-clip-text text-transparent font-montserrat">
        Scan Results
      </h2>
      <div className="text-sm text-gray-600 mt-1">
        <p>Image: {artifactName}</p>
        <p>Scan Time: {new Date(createdAt).toLocaleString()}</p>
      </div>
    </div>
  );
}
