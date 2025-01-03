'use client'

import * as React from 'react'
import { CalendarIcon, ClockIcon } from '@radix-ui/react-icons'
import { format, startOfMonth, isAfter, isBefore, startOfDay } from 'date-fns'
import { cn } from '../../lib/utils'
import { Button } from './button'
import { Input } from './input'
import { Label } from './label'
import { Popover, PopoverContent, PopoverTrigger } from './popover'
import { CustomCalendar } from './custom-calendar'

interface DateRange {
    from: Date
    to: Date
}

interface CustomDateRangePickerProps {
    dateRange: DateRange
    onDateRangeChange: (range: DateRange) => void
    onConfirm?: () => void
    className?: string
    minDate?: Date
    maxDate?: Date
}

export function CustomDateRangePicker({
    dateRange,
    onDateRangeChange,
    onConfirm,
    className,
    minDate,
    maxDate
}: CustomDateRangePickerProps) {
    const [isOpen, setIsOpen] = React.useState(false)
    const [currentMonth, setCurrentMonth] = React.useState(startOfMonth(dateRange.from || new Date()))
    const [tempRange, setTempRange] = React.useState<Partial<DateRange>>(dateRange)

    const handleDateSelect = (date: Date) => {
        const startOfSelectedDay = startOfDay(date)

        if (!tempRange.from || (tempRange.from && tempRange.to)) {
            // Start new selection
            setTempRange({ from: startOfSelectedDay })
        } else {
            // Complete the selection
            if (isBefore(startOfSelectedDay, tempRange.from)) {
                setTempRange({ from: startOfSelectedDay, to: tempRange.from })
            } else {
                setTempRange({ from: tempRange.from, to: startOfSelectedDay })
            }
        }
    }

    const handleTimeChange = (
        event: React.ChangeEvent<HTMLInputElement>,
        isStartTime: boolean
    ) => {
        if (!tempRange.from || !tempRange.to) return

        const [hours, minutes] = event.target.value.split(':').map(Number)
        const newDate = new Date(isStartTime ? tempRange.from : tempRange.to)
        newDate.setHours(hours)
        newDate.setMinutes(minutes)

        // Validate time constraints
        const now = new Date()
        if (isAfter(newDate, now)) {
            newDate.setTime(now.getTime())
        }

        setTempRange(prev => ({
            from: isStartTime ? newDate : prev.from,
            to: isStartTime ? prev.to : newDate
        }))
    }

    const handleConfirm = () => {
        if (tempRange.from && tempRange.to) {
            onDateRangeChange({ from: tempRange.from, to: tempRange.to })
            if (onConfirm) {
                onConfirm()
            }
            setIsOpen(false)
        }
    }

    return (
        <div className={cn("grid gap-2", className)}>
            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className={cn(
                            "w-full justify-start text-left font-normal",
                            !dateRange && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange?.from ? (
                            dateRange.to ? (
                                <>
                                    {format(dateRange.from, "LLL dd, y HH:mm")} -{" "}
                                    {format(dateRange.to, "LLL dd, y HH:mm")}
                                </>
                            ) : (
                                format(dateRange.from, "LLL dd, y HH:mm")
                            )
                        ) : (
                            <span>Pick a date range</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <div className="p-4">
                        <CustomCalendar
                            month={currentMonth}
                            selected={tempRange as DateRange}
                            onSelect={handleDateSelect}
                            onMonthChange={setCurrentMonth}
                            minDate={minDate}
                            maxDate={maxDate}
                        />
                    </div>

                    {tempRange.from && tempRange.to && (
                        <div className="border-t p-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="startTime">Start Time</Label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            id="startTime"
                                            type="time"
                                            value={format(tempRange.from, "HH:mm")}
                                            onChange={(e) => handleTimeChange(e, true)}
                                            className="flex-1"
                                        />
                                        <ClockIcon className="h-4 w-4 opacity-50" />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="endTime">End Time</Label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            id="endTime"
                                            type="time"
                                            value={format(tempRange.to, "HH:mm")}
                                            onChange={(e) => handleTimeChange(e, false)}
                                            className="flex-1"
                                        />
                                        <ClockIcon className="h-4 w-4 opacity-50" />
                                    </div>
                                </div>
                            </div>
                            <Button
                                className="w-full mt-4"
                                onClick={handleConfirm}
                                disabled={!tempRange.from || !tempRange.to}
                            >
                                Confirm Selection
                            </Button>
                        </div>
                    )}
                </PopoverContent>
            </Popover>
        </div>
    )
} 