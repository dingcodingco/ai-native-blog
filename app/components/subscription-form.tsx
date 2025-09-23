'use client'

import { useState } from 'react'

interface SubscriptionFormProps {
  className?: string
}

// Utility functions for security
const validateClassName = (className: string = ''): string => {
  // Allow only CSS class characters: letters, numbers, spaces, hyphens, underscores, dots
  return className.replace(/[^a-zA-Z0-9\s\-_\.]/g, '');
};

const sanitizeErrorMessage = (message: string): string => {
  // Remove any HTML tags and limit length for safety
  return message.replace(/<[^>]*>/g, '').substring(0, 200);
};

export function SubscriptionForm({ className = '' }: SubscriptionFormProps) {
  const safeClassName = validateClassName(className);
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Enhanced email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!emailRegex.test(email) || email.length > 254) {
      setError('올바른 이메일 주소를 입력해주세요.')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '구독에 실패했습니다.')
      }

      setIsSubscribed(true)
      setEmail('')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '구독에 실패했습니다.'
      setError(sanitizeErrorMessage(errorMessage))
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubscribed) {
    return (
      <div className={`border border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-700 rounded-lg p-6 ${safeClassName}`}>
        <div className="flex items-center">
          <svg
            className="w-5 h-5 text-green-600 dark:text-green-400 mr-2"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
              구독이 완료되었습니다!
            </h3>
            <p className="text-sm text-green-600 dark:text-green-300 mt-1">
              이메일로 확인 링크를 보내드렸습니다. 확인 후 새 글 알림을 받으실 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`border border-neutral-200 dark:border-neutral-700 rounded-lg p-6 bg-neutral-50 dark:bg-neutral-900 ${safeClassName}`}>
      <h3 className="text-lg font-semibold mb-2">새 글 알림 구독</h3>
      <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-4">
        새로운 AI/개발 관련 글이 올라올 때 이메일로 알림을 받아보세요.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="sr-only">
            이메일 주소
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일 주소를 입력하세요"
            required
            disabled={isLoading}
            className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md
                     bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100
                     placeholder-neutral-500 dark:placeholder-neutral-400
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {error && (
          <div className="text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !email.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-400
                   dark:bg-blue-500 dark:hover:bg-blue-600 dark:disabled:bg-neutral-600
                   text-white font-medium py-2 px-4 rounded-md transition-colors
                   disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {isLoading ? '구독 중...' : '구독하기'}
        </button>
      </form>

      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-3">
        언제든지 구독을 취소할 수 있으며, 개인정보는 안전하게 보호됩니다.
      </p>
    </div>
  )
}