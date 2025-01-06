'use client'

import * as React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    format,
    addMonths,
    subMonths,
    isSameDay,
    isWithinInterval,
    isBefore,
    isAfter,
    startOfDay,
} from 'date-fns'
import { cn } from '../../lib/utils'
import { Button } from './button'

interface CalendarProps {
    month: Date
    selected?: { from: Date; to: Date }
    onSelect: (date: Date) => void
    onMonthChange: (date: Date) => void
    minDate?: Date
    maxDate?: Date
    className?: string
}

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

export function CustomCalendar({
    month,
    selected,
    onSelect,
    onMonthChange,
    minDate,
    maxDate,
    className,
}: CalendarProps) {
    const firstDay = startOfMonth(month)
    const lastDay = endOfMonth(month)
    const days = eachDayOfInterval({ start: firstDay, end: lastDay })
    const startingDayIndex = firstDay.getDay()
    const prefixDays = Array(startingDayIndex).fill(null)
    const suffixDays = Array(42 - (prefixDays.length + days.length)).fill(null)

    const isDateInRange = (date: Date) => {
        if (!selected?.from || !selected?.to) return false
        return isWithinInterval(date, { start: selected.from, end: selected.to })
    }

    const isDateSelectable = (date: Date) => {
        if (minDate && isBefore(date, startOfDay(minDate))) return false
        if (maxDate && isAfter(date, startOfDay(maxDate))) return false
        return true
    }

    const handlePrevMonth = () => {
        const prevMonth = subMonths(month, 1)
        if (!minDate || !isBefore(prevMonth, startOfMonth(minDate))) {
            onMonthChange(prevMonth)
        }
    }

    const handleNextMonth = () => {
        const nextMonth = addMonths(month, 1)
        if (!maxDate || !isAfter(nextMonth, startOfMonth(maxDate))) {
            onMonthChange(nextMonth)
        }
    }

    return (
        <div className={cn("w-[350px]", className)}>
            <div className="flex items-center justify-between mb-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handlePrevMonth}
                    disabled={minDate && isBefore(subMonths(month, 1), startOfMonth(minDate))}
                    className="hover:bg-accent"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="font-semibold text-foreground">
                    {format(month, 'MMMM yyyy')}
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleNextMonth}
                    disabled={maxDate && isAfter(addMonths(month, 1), startOfMonth(maxDate))}
                    className="hover:bg-accent"
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>

            <div className="grid grid-cols-7 gap-1">
                {WEEKDAYS.map(day => (
                    <div
                        key={day}
                        className="h-9 text-sm font-medium text-center text-muted-foreground flex items-center justify-center"
                    >
                        {day}
                    </div>
                ))}

                {prefixDays.map((_, index) => (
                    <div key={`prefix-${index}`} className="h-9" />
                ))}

                {days.map((day, index) => {
                    const isSelected = selected?.from && selected?.to && isDateInRange(day)
                    const isRangeStart = selected?.from && isSameDay(day, selected.from)
                    const isRangeEnd = selected?.to && isSameDay(day, selected.to)
                    const isSelectable = isDateSelectable(day)
                    const isToday = isSameDay(day, new Date())

                    return (
                        <Button
                            key={day.toISOString()}
                            variant="ghost"
                            size="icon"
                            className={cn(
                                "h-9 w-9 p-0 font-normal relative text-foreground",
                                isSelected && "bg-accent",
                                isRangeStart && "bg-primary text-primary-foreground",
                                isRangeEnd && "bg-primary text-primary-foreground",
                                !isSelectable && "opacity-50 cursor-not-allowed",
                                isToday && !isSelected && !isRangeStart && !isRangeEnd && "border border-primary",
                                (isRangeStart || isRangeEnd) && "hover:bg-primary hover:text-primary-foreground",
                                isSelected && !isRangeStart && !isRangeEnd && "hover:bg-accent"
                            )}
                            disabled={!isSelectable}
                            onClick={() => isSelectable && onSelect(day)}
                        >
                            <time dateTime={format(day, 'yyyy-MM-dd')}>
                                {format(day, 'd')}
                            </time>
                        </Button>
                    )
                })}

                {suffixDays.map((_, index) => (
                    <div key={`suffix-${index}`} className="h-9" />
                ))}
            </div>
        </div>
    )
}