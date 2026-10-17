import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

export const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table
      ref={ref}
      className={cn('w-full caption-bottom text-sm', className)}
      {...props}
    />
  </div>
));
Table.displayName = 'Table';

export const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn(
      'bg-[#F5F2E9]/60 border-b border-[#E3DED2] text-xs uppercase font-semibold text-[#6B7280]',
      className
    )}
    {...props}
  />
));
TableHeader.displayName = 'TableHeader';

export const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn('divide-y divide-[#E3DED2]', className)}
    {...props}
  />
));
TableBody.displayName = 'TableBody';

export const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      'transition-colors hover:bg-black/[0.02] data-[state=selected]:bg-[#7F9565]/10',
      className
    )}
    {...props}
  />
));
TableRow.displayName = 'TableRow';

export interface TableHeadProps
  extends React.ThHTMLAttributes<HTMLTableCellElement> {
  sortable?: boolean;
  sortDirection?: 'asc' | 'desc' | null;
  onSort?: () => void;
}

export const TableHead = React.forwardRef<
  HTMLTableCellElement,
  TableHeadProps
>(({ className, sortable, sortDirection, onSort, children, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      'h-11 px-4 text-left align-middle font-semibold text-[#6B7280] tracking-wider select-none text-xs',
      sortable && 'cursor-pointer hover:text-[#191919] transition-colors',
      className
    )}
    onClick={sortable ? onSort : undefined}
    {...props}
  >
    <div className="inline-flex items-center space-x-1.5">
      <span>{children}</span>
      {sortable && (
        <span className="shrink-0 text-gray-400">
          {sortDirection === 'asc' ? (
            <ChevronUp className="w-3.5 h-3.5 text-[#7F9565]" />
          ) : sortDirection === 'desc' ? (
            <ChevronDown className="w-3.5 h-3.5 text-[#7F9565]" />
          ) : (
            <ChevronsUpDown className="w-3.5 h-3.5" />
          )}
        </span>
      )}
    </div>
  </th>
));
TableHead.displayName = 'TableHead';

export const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn('p-4 align-middle text-[#191919]', className)}
    {...props}
  />
));
TableCell.displayName = 'TableCell';
