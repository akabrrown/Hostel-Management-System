import { useState, useEffect, useCallback } from 'react'
import { ApiResponse, PaginatedResponse } from '@/types'

interface UseApiOptions {
  immediate?: boolean
  onSuccess?: (data: any) => void
  onError?: (error: string) => void
}

export function useApi<T = any>(
  apiCall: () => Promise<ApiResponse<T>>,
  options: UseApiOptions = {}
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const execute = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await apiCall()
      
      if (response.success && response.data) {
        setData(response.data)
        options.onSuccess?.(response.data)
      } else {
        const errorMessage = response.error || 'An error occurred'
        setError(errorMessage)
        options.onError?.(errorMessage)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMessage)
      options.onError?.(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [apiCall, options])

  useEffect(() => {
    if (options.immediate) {
      execute()
    }
  }, [execute, options.immediate])

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setLoading(false)
  }, [])

  return {
    data,
    loading,
    error,
    execute,
    reset,
  }
}

export function usePaginatedApi<T = any>(
  apiCall: (page: number, limit: number) => Promise<PaginatedResponse<T>>,
  initialPage = 1,
  initialLimit = 10
) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(initialPage)
  const [limit, setLimit] = useState(initialLimit)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const fetchPage = useCallback(async (pageNum = page, pageLimit = limit) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await apiCall(pageNum, pageLimit)
      
      if (response.success && response.data) {
        setData(response.data)
        setTotal(response.pagination.total)
        setTotalPages(response.pagination.totalPages)
        setPage(response.pagination.page)
      } else {
        const errorMessage = response.error || 'An error occurred'
        setError(errorMessage)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [apiCall, page, limit])

  useEffect(() => {
    fetchPage()
  }, [fetchPage])

  const nextPage = useCallback(() => {
    if (page < totalPages) {
      fetchPage(page + 1, limit)
    }
  }, [page, totalPages, limit, fetchPage])

  const prevPage = useCallback(() => {
    if (page > 1) {
      fetchPage(page - 1, limit)
    }
  }, [page, limit, fetchPage])

  const goToPage = useCallback((pageNum: number) => {
    if (pageNum >= 1 && pageNum <= totalPages) {
      fetchPage(pageNum, limit)
    }
  }, [totalPages, limit, fetchPage])

  const changeLimit = useCallback((newLimit: number) => {
    setLimit(newLimit)
    fetchPage(1, newLimit)
  }, [fetchPage])

  const reset = useCallback(() => {
    setData([])
    setError(null)
    setPage(initialPage)
    setLimit(initialLimit)
    setTotal(0)
    setTotalPages(0)
  }, [initialPage, initialLimit])

  return {
    data,
    loading,
    error,
    page,
    limit,
    total,
    totalPages,
    nextPage,
    prevPage,
    goToPage,
    changeLimit,
    fetchPage,
    reset,
  }
}
