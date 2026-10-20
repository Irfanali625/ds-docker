"use client";

import { getDownloadUrl } from "@/utils/getUrls";

interface HistoryTableProps {
  history: any;
}

export function HistoryTable({ history }: HistoryTableProps) {
  if (!history || history.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center py-8 text-gray-500">
          No history found. Validate some phone numbers to start building your
          history!
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "single":
        return "bg-blue-100 text-blue-800";
      case "bulk":
        return "bg-green-100 text-green-800";
      case "csv":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Validations
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                File
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created At
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {history.map((h: any) => (
              <tr key={h.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeColor(
                      h.type
                    )}`}
                  >
                    {h.type.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {h.total}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 truncate max-w-xs">
                    {h.filePath || "-"}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {formatDate(h.createdAt)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {h.filePath && (
                    <a
                      href={getDownloadUrl(h.filePath)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Download
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
