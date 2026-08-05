'use client'

import { useEffect } from 'react'
import NextError from 'next/error'
import styles from './_error.module.css'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className={styles.errorContainer}>
      <div className={styles.errorCard}>
        <div className="text-center">
          <h1 className={styles.errorTitle}>Something went wrong</h1>
          <p className={styles.errorMessage}>
            We apologize for the inconvenience. An unexpected error has occurred.
          </p>
          {error.digest && (
            <p className={styles.errorId}>
              Error ID: {error.digest}
            </p>
          )}
          <button
            onClick={reset}
            className={styles.retryButton}
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  )
}
