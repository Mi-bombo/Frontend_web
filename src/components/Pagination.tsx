type PaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
};

export default function Pagination({
    page,
    pageSize,
    total,
    onPageChange,
    onPageSizeChange,
    pageSizeOptions = [5, 10, 20],
}: PaginationProps) {
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
    const end = Math.min(total, page * pageSize);

    return (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3">
        <div className="text-sm text-slate-600">
            Mostrando <span className="font-semibold">{start}</span>–
            <span className="font-semibold">{end}</span> de{" "}
            <span className="font-semibold">{total}</span>
        </div>

        <div className="flex items-center gap-2">
            {onPageSizeChange && (
            <select
                className="px-2 py-1 text-sm bg-white border rounded-lg cursor-pointer"
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
            >
                {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                    {opt} / pág.
                </option>
                ))}
            </select>
            )}

            <div className="flex items-center">
            <button
                className="px-3 py-1 text-sm border border-r-0 rounded-l-lg cursor-pointer hover:bg-slate-50 disabled:opacity-40 disabled:cursor-default disabled:hover:bg-transparent"
                onClick={() => onPageChange(1)}
                disabled={page === 1}
            >
                «
            </button>
            <button
                className="px-3 py-1 text-sm border cursor-pointer hover:bg-slate-50 disabled:opacity-40 disabled:cursor-default disabled:hover:bg-transparent"
                onClick={() => onPageChange(page - 1)}
                disabled={page === 1}
            >
                Anterior
            </button>
            <button
                className="px-3 py-1 text-sm border cursor-pointer hover:bg-slate-50 disabled:opacity-40 disabled:cursor-default disabled:hover:bg-transparent"
                onClick={() => onPageChange(page + 1)}
                disabled={page === totalPages}
            >
                Siguiente
            </button>
            <button
                className="px-3 py-1 text-sm border border-l-0 rounded-r-lg cursor-pointer hover:bg-slate-50 disabled:opacity-40 disabled:cursor-default disabled:hover:bg-transparent"
                onClick={() => onPageChange(totalPages)}
                disabled={page === totalPages}
            >
                »
            </button>
            </div>
        </div>
        </div>
    );
}
