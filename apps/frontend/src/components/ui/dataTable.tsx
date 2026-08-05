'use client'

import React, { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { TableColumn } from '@/types'
import Button from './button'
import Input from './input'
import styles from './dataTable.module.css'

interface DataTableProps<T = any> {
  columns: TableColumn<T>[]
  data: T[]
  pagination?: boolean
  pageSize?: number
  searchable?: boolean
  className?: string
}

export function DataTable<T = any>({
  columns,
  data,
  pagination = false,
  pageSize = 10,
  searchable = false,
  className
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredData = useMemo(() => {
    if (!searchTerm) return data
    
    return data.filter(item => {
      return columns.some(column => {
        const value = item[column.key as keyof T]
        return value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      })
    })
  }, [data, searchTerm, columns])

  const paginatedData = useMemo(() => {
    if (!pagination) return filteredData
    
    const startIndex = (currentPage - 1) * pageSize
    return filteredData.slice(startIndex, startIndex + pageSize)
  }, [filteredData, currentPage, pageSize, pagination])

  const totalPages = Math.ceil(filteredData.length / pageSize)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  return (
    <div className={cn('w-full', className)}>
      {searchable && (
        <div className="mb-4">
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            className="max-w-sm"
          />
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key as string}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50">
                {columns.map((column) => (
                  <td
                    key={column.key as string}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                  >
                    {column.render
                      ? column.render(row[column.key as keyof T], row)
                      : row[column.key as keyof T]?.toString() || '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {((currentPage - 1) * pageSize) + 1} to{' '}
            {Math.min(currentPage * pageSize, filteredData.length)} of{' '}
            {filteredData.length} results
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="flex items-center px-3 py-1 text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default DataTable
