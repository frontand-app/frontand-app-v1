import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  ChevronLeft, 
  ChevronRight,
  Download,
  Search,
  Filter,
  RefreshCw,
  MoreHorizontal,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';

export interface TableColumn {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'date' | 'boolean' | 'email' | 'url' | 'status' | 'currency';
  width?: string;
  sortable?: boolean;
  filterable?: boolean;
}

export interface TableRow {
  id: string | number;
  [key: string]: any;
}

export interface TableData {
  columns: TableColumn[];
  rows: TableRow[];
  metadata?: {
    totalRows?: number;
    source?: string;
    lastUpdated?: string;
    processingTime?: string;
    successCount?: number;
    errorCount?: number;
  };
}

interface TableOutputProps {
  data: TableData;
  title?: string;
  className?: string;
  pageSize?: number;
  enableSearch?: boolean;
  enableExport?: boolean;
  enablePagination?: boolean;
  maxHeight?: string;
}

export const TableOutput: React.FC<TableOutputProps> = ({
  data,
  title = "Data Table",
  className = "",
  pageSize = 10,
  enableSearch = true,
  enableExport = true,
  enablePagination = true,
  maxHeight = "500px"
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Filter and search data
  const filteredData = useMemo(() => {
    if (!searchTerm) return data.rows;
    
    return data.rows.filter(row =>
      Object.values(row).some(value =>
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [data.rows, searchTerm]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortColumn) return filteredData;
    
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];
      
      // Handle different data types
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
      
      const aStr = aVal?.toString() || '';
      const bStr = bVal?.toString() || '';
      
      if (sortDirection === 'asc') {
        return aStr.localeCompare(bStr);
      } else {
        return bStr.localeCompare(aStr);
      }
    });
  }, [filteredData, sortColumn, sortDirection]);

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!enablePagination) return sortedData;
    
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return sortedData.slice(start, end);
  }, [sortedData, currentPage, pageSize, enablePagination]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  const handleSort = (columnKey: string) => {
    const column = data.columns.find(col => col.key === columnKey);
    if (!column?.sortable) return;

    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  const formatCellValue = (value: any, column: TableColumn) => {
    if (value === null || value === undefined) return '-';
    
    switch (column.type) {
      case 'boolean':
        return value ? '✓' : '✗';
      case 'date':
        return new Date(value).toLocaleDateString();
      case 'email':
        return (
          <a href={`mailto:${value}`} className="text-blue-600 hover:underline">
            {value}
          </a>
        );
      case 'url':
        return (
          <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
            {value.length > 30 ? `${value.substring(0, 30)}...` : value}
          </a>
        );
      case 'currency':
        if (typeof value === 'number') {
          return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }
        return `$${parseFloat(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      case 'status':
        const status = value.toLowerCase();
        const statusColors = {
          active: 'bg-green-100 text-green-800',
          inactive: 'bg-gray-100 text-gray-800',
          success: 'bg-green-100 text-green-800',
          completed: 'bg-green-100 text-green-800',
          error: 'bg-red-100 text-red-800',
          failed: 'bg-red-100 text-red-800',
          pending: 'bg-yellow-100 text-yellow-800',
          processing: 'bg-blue-100 text-blue-800',
          cancelled: 'bg-gray-100 text-gray-800',
          draft: 'bg-blue-100 text-blue-800'
        };
        return (
          <Badge className={statusColors[status] || 'bg-gray-100 text-gray-800'}>
            {value}
          </Badge>
        );
      case 'number':
        if (typeof value === 'number') {
          return value.toLocaleString();
        }
        return value;
      default:
        const str = value.toString();
        return str.length > 50 ? `${str.substring(0, 50)}...` : str;
    }
  };

  const exportToCSV = () => {
    const headers = data.columns.map(col => col.label).join(',');
    const csvRows = data.rows.map(row =>
      data.columns.map(col => {
        const value = row[col.key];
        const str = value?.toString() || '';
        return str.includes(',') ? `"${str.replace(/"/g, '""')}"` : str;
      }).join(',')
    );
    
    const csvContent = [headers, ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success':
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
      case 'processing':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  return (
    <Card className={`${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <span>{title}</span>
              {data.metadata?.source && (
                <Badge variant="outline" className="text-xs">
                  {data.metadata.source}
                </Badge>
              )}
            </CardTitle>
            {data.metadata && (
              <div className="flex items-center space-x-4 text-sm text-gray-500 mt-2">
                {data.metadata.totalRows && (
                  <span>{data.metadata.totalRows.toLocaleString()} rows</span>
                )}
                {data.metadata.processingTime && (
                  <span>Processed in {data.metadata.processingTime}</span>
                )}
                {data.metadata.lastUpdated && (
                  <span>Updated {new Date(data.metadata.lastUpdated).toLocaleTimeString()}</span>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {enableSearch && (
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-48"
                />
              </div>
            )}
            {enableExport && (
              <Button variant="outline" size="sm" onClick={exportToCSV}>
                <Download className="h-4 w-4 mr-1" />
                Export CSV
              </Button>
            )}
          </div>
        </div>

        {/* Status Summary */}
        {data.metadata && (data.metadata.successCount || data.metadata.errorCount) && (
          <div className="flex items-center space-x-4 pt-2 border-t">
            {data.metadata.successCount > 0 && (
              <div className="flex items-center space-x-1 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm">{data.metadata.successCount} successful</span>
              </div>
            )}
            {data.metadata.errorCount > 0 && (
              <div className="flex items-center space-x-1 text-red-600">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{data.metadata.errorCount} errors</span>
              </div>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0">
        <div style={{ maxHeight, overflowY: 'auto' }}>
          <Table>
            <TableHeader>
              <TableRow>
                {data.columns.map((column) => (
                  <TableHead 
                    key={column.key}
                    className={`${column.sortable ? 'cursor-pointer hover:bg-gray-50' : ''} ${column.width ? `w-${column.width}` : ''}`}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{column.label}</span>
                      {column.sortable && sortColumn === column.key && (
                        <span className="text-xs">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length > 0 ? (
                paginatedData.map((row, index) => (
                  <TableRow key={row.id || index}>
                    {data.columns.map((column) => (
                      <TableCell key={column.key} className="py-2">
                        <div className="flex items-center space-x-2">
                          {column.type === 'status' && getStatusIcon(row[column.key])}
                          <span>{formatCellValue(row[column.key], column)}</span>
                        </div>
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={data.columns.length} className="text-center py-8 text-gray-500">
                    {searchTerm ? 'No matching results found' : 'No data available'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {enablePagination && totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t">
            <div className="text-sm text-gray-500">
              Showing {Math.min((currentPage - 1) * pageSize + 1, sortedData.length)} to{' '}
              {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} entries
              {searchTerm && ` (filtered from ${data.rows.length} total)`}
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="w-8 h-8 p-0"
                    >
                      {page}
                    </Button>
                  );
                })}
                {totalPages > 5 && (
                  <>
                    <span className="text-gray-400">...</span>
                    <Button
                      variant={currentPage === totalPages ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(totalPages)}
                      className="w-8 h-8 p-0"
                    >
                      {totalPages}
                    </Button>
                  </>
                )}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 
 