'use client'

import React, { ReactElement, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

export interface AnimatedListProps {
  className?: string
  children: React.ReactNode
  delay?: number
}

export const AnimatedList = React.memo(
  ({ className, children, delay = 3000 }: AnimatedListProps) => {
    const [items, setItems] = useState<React.ReactNode[]>([])
    const [addingCompleted, setAddingCompleted] = useState(false) // Track if adding is completed

    const childrenArray = useMemo(() => React.Children.toArray(children), [children])

    useEffect(() => {
      if (childrenArray.length === 0) {
        return
      }

      // Add items one by one with a delay
      const interval = setInterval(() => {
        setItems((prevItems) => {
          const nextIndex = prevItems.length
          if (nextIndex < childrenArray.length) {
            return [...prevItems, childrenArray[nextIndex]]
          } else {
            setAddingCompleted(true) // Mark as completed once all items are added
            clearInterval(interval) // Stop the interval once all items are added
            return prevItems
          }
        })
      }, delay)

      return () => clearInterval(interval)
    }, [childrenArray, delay])

    // Remove items after they are shown for a certain period
    useEffect(() => {
      if (items.length > 0) {
        const timeout = setTimeout(() => {
          setItems((prevItems) => prevItems.slice(1))
        }, delay)

        return () => clearTimeout(timeout)
      }
    }, [items, delay])

    return (
      <div className={`flex flex-col items-center gap-4 ${className}`}>
        <AnimatePresence>
          {items.map((item, index) => (
            <AnimatedListItem key={(item as ReactElement).key || index}>
              {item}
            </AnimatedListItem>
          ))}
        </AnimatePresence>
      </div>
    )
  }
)

AnimatedList.displayName = 'AnimatedList'

export function AnimatedListItem({ children }: { children: React.ReactNode }) {
  const animations = {
    initial: { scale: 0, opacity: 0 },
    animate: { scale: 1, opacity: 1, originY: 0 },
    exit: { scale: 0, opacity: 0 },
    transition: { type: 'spring', stiffness: 350, damping: 40 },
  }

  return (
    <motion.div {...animations} layout className="mx-auto w-full">
      {children}
    </motion.div>
  )
}
