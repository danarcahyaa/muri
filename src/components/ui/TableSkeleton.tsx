import { TableRow, TableCell } from "@/components/ui/Table";
import { Skeleton } from "@/components/ui/Skeleton";

interface TableSkeletonProps {
  columnsCount: number;
  rowsCount?: number;
  cellWidths?: string[];
}

export function TableSkeleton({
  columnsCount,
  rowsCount = 5,
  cellWidths,
}: TableSkeletonProps) {
  const rows = Array.from({ length: rowsCount });
  const cols = Array.from({ length: columnsCount });

  return (
    <>
      {rows.map((_, rowIndex) => (
        <TableRow key={rowIndex} className="hover:bg-transparent border-b border-line-trace/20">
          {cols.map((_, colIndex) => {
            let widthClass = "w-20";
            if (cellWidths && cellWidths[colIndex]) {
              widthClass = cellWidths[colIndex];
            } else {
              const widths = ["w-12", "w-20", "w-24", "w-32", "w-44"];
              widthClass = widths[(rowIndex + colIndex) % widths.length];
            }

            const isFirstCol = colIndex === 0;
            const isLastCol = colIndex === columnsCount - 1;

            return (
              <TableCell 
                key={colIndex} 
                className={isFirstCol ? "text-center px-4 py-3.5" : isLastCol ? "text-right px-6 py-3.5" : "px-4 py-3.5"}
              >
                <Skeleton 
                  className={`h-4 rounded ${widthClass} ${
                    isFirstCol ? "mx-auto w-6" : isLastCol ? "ml-auto" : ""
                  }`} 
                />
              </TableCell>
            );
          })}
        </TableRow>
      ))}
    </>
  );
}
