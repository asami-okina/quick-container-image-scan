import ContainerScanForm from "@/app/components/container-scan-form";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-orange-50 to-yellow-50 p-4 sm:p-6 md:p-8 lg:p-10 font-poppins">
      <main className="container mx-auto max-w-8xl">
        <div className="space-y-6 py-8">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent font-montserrat">
              Quick Container Image Scan
            </h1>
            <p className="text-gray-600">
              Enter a container image URL to scan for vulnerabilities and
              licenses.
            </p>
          </div>
          <ContainerScanForm />
        </div>
      </main>
    </div>
  );
}
