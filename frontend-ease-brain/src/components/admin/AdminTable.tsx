import { FC, ReactNode, ChangeEvent } from "react";
import { FaSearch, FaChevronLeft, FaChevronRight } from "react-icons/fa";

export interface Column<T> {
  key: keyof T;
  label: string;
  render?: (value: any, item: T) => ReactNode;
  className?: string;
}

export interface AdminTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onSearch?: (query: string) => void;
  searchPlaceholder?: string;
  emptyMessage?: string;
  actions?: (item: T) => ReactNode;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

const AdminTable: FC<AdminTableProps<any>> = ({
  columns,
  data,
  onSearch,
  searchPlaceholder = "Search...",
  emptyMessage = "No data found",
  actions,
  page = 1,
  totalPages = 1,
  onPageChange,
}) => {
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    onSearch?.(e.target.value);
  };

  const handlePrevious = () => {
    if (page > 1 && onPageChange) {
      onPageChange(page - 1);
    }
  };

  const handleNext = () => {
    if (page < totalPages && onPageChange) {
      onPageChange(page + 1);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      {onSearch && (
        <div className="relative">
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            onChange={handleSearchChange}
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-teal-500 focus:outline-none"
          />
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className="px-6 py-3 text-left text-sm font-semibold text-gray-700"
                >
                  {column.label}
                </th>
              ))}
              {actions && (
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.length > 0 ? (
              data.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  {columns.map((column) => (
                    <td
                      key={String(column.key)}
                      className={`px-6 py-4 text-sm text-gray-900 ${
                        column.className || ""
                      }`}
                    >
                      {column.render
                        ? column.render(item[column.key], item)
                        : String(item[column.key])}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-6 py-4 text-sm">{actions(item)}</td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className="px-6 py-8 text-center text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-4 py-3">
          <p className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={handlePrevious}
              disabled={page === 1}
              className="rounded p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaChevronLeft className="text-gray-600" />
            </button>
            <button
              onClick={handleNext}
              disabled={page === totalPages}
              className="rounded p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaChevronRight className="text-gray-600" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTable;
