import { ShieldAlert, ArrowLeft } from "lucide-react";

const AccessDenied = ({
  message = "You do not have permission to view this page.",
  backTo = "/",
}: {
  message?: string;
  backTo?: string;
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center bg-background text-foreground min-h-[80vh]">
      {/* Icon */}
      <ShieldAlert className="w-14 h-14 text-red-500 mb-4" />

      {/* Title */}
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>

      {/* Message */}
      <p className="text-gray-600 max-w-md mb-6">{message}</p>

      {/* Back Button */}
      <button
        onClick={() => (window.location.href = backTo)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Go Back
      </button>
    </div>
  );
};

export default AccessDenied;
