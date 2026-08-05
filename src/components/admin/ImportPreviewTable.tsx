import type { ImportPreviewRow } from "@/types/api";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function ImportPreviewTable({
  rows,
  validCount,
  totalCount,
}: {
  rows: ImportPreviewRow[];
  validCount: number;
  totalCount: number;
}) {
  if (rows.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">
        {validCount} / {totalCount} questions valid
      </p>
      <div className="max-h-64 overflow-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">#</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Preview</TableHead>
              <TableHead className="w-16">Opts</TableHead>
              <TableHead className="w-20">Status</TableHead>
              <TableHead>Errors</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.index}>
                <TableCell>{row.index}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-[10px]">
                    {row.questionType}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-xs truncate text-xs">{row.questionText}</TableCell>
                <TableCell>{row.optionCount}</TableCell>
                <TableCell>
                  {row.valid ? (
                    <Badge className="bg-green-600">OK</Badge>
                  ) : (
                    <Badge variant="destructive">Err</Badge>
                  )}
                </TableCell>
                <TableCell className="max-w-md text-xs text-destructive">
                  {!row.valid && row.errors?.join("; ")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
