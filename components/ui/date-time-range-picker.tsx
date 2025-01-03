"use client"

import * as React from "react"
import { CalendarIcon, ClockIcon } from "@radix-ui/react-icons"
import { format, addMonths, isBefore, isAfter, startOfMonth } from "date-fns"
import { DateRange } from "react-day-picker"

import { cn } from "../../lib/utils"
import { Button } from "./button"
import { Calendar } from "./calendar"
import { Input } from "./input"
import { Label } from "./label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./popover"

interface DateTimeRangePickerProps {
  className?: string
  dateTimeRange: DateRange
  setDateTimeRange: (dateTimeRange: DateRange) => void
  onConfirm?: () => void
}

export function DateTimeRangePicker({
  className,
  dateTimeRange,
  setDateTimeRange,
  onConfirm,
}: DateTimeRangePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [startMonth, setStartMonth] = React.useState<Date>(dateTimeRange?.from || new Date())
  const [endMonth, setEndMonth] = React.useState<Date>(
    dateTimeRange?.to || addMonths(dateTimeRange?.from || new Date(), 1)
  )

  const currentMonth = startOfMonth(new Date())

  const handleStartMonthChange = (month: Date) => {
    if (!isAfter(startOfMonth(month), currentMonth)) {
      setStartMonth(month)
      if (isBefore(endMonth, month)) {
        setEndMonth(month)
      }
    }
  }

  const handleEndMonthChange = (month: Date) => {
    if (!isAfter(startOfMonth(month), currentMonth) && !isBefore(month, startMonth)) {
      setEndMonth(month)
    }
  }

  const handleDateSelect = (range: DateRange | undefined) => {
    if (range?.from && range?.to) {
      // Ensure end date is not before start date
      if (isBefore(range.to, range.from)) {
        range.to = range.from
      }
      // Ensure dates are not in the future
      const now = new Date()
      if (isAfter(range.from, now)) {
        range.from = now
      }
      if (isAfter(range.to, now)) {
        range.to = now
      }
      setDateTimeRange(range)
    }
  }

  const handleTimeChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    isStartTime: boolean
  ) => {
    const [hours, minutes] = event.target.value.split(':').map(Number)
    const newDate = isStartTime
      ? new Date(dateTimeRange.from!)
      : new Date(dateTimeRange.to!)
    newDate.setHours(hours)
    newDate.setMinutes(minutes)

    // Validate time constraints
    const now = new Date()
    if (isAfter(newDate, now)) {
      newDate.setTime(now.getTime())
    }

    setDateTimeRange({
      from: isStartTime ? newDate : dateTimeRange.from,
      to: isStartTime ? dateTimeRange.to : newDate,
    })
  }

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm()
    }
    setIsOpen(false)
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !dateTimeRange && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateTimeRange?.from ? (
              dateTimeRange.to ? (
                <>
                  {format(dateTimeRange.from, "LLL dd, y HH:mm")} -{" "}
                  {format(dateTimeRange.to, "LLL dd, y HH:mm")}
                </>
              ) : (
                format(dateTimeRange.from, "LLL dd, y HH:mm")
              )
            ) : (
              <span>Pick a date and time range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="flex w-auto flex-col space-y-4 p-4" align="start">
          <div className="flex gap-4">
            <div className="flex-1">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={startMonth}
                month={startMonth}
                onMonthChange={handleStartMonthChange}
                selected={dateTimeRange}
                onSelect={handleDateSelect}
                numberOfMonths={1}
                className="rounded-md border"
                disabled={(date) => isAfter(date, new Date())}
                fromMonth={undefined}
                toMonth={currentMonth}
              />
            </div>
            <div className="flex-1">
              <Calendar
                mode="range"
                defaultMonth={endMonth}
                month={endMonth}
                onMonthChange={handleEndMonthChange}
                selected={dateTimeRange}
                onSelect={handleDateSelect}
                numberOfMonths={1}
                className="rounded-md border"
                disabled={(date) => isAfter(date, new Date()) || isBefore(date, dateTimeRange?.from || new Date())}
                fromMonth={startMonth}
                toMonth={currentMonth}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="startTime">Start Time</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="startTime"
                  type="time"
                  value={dateTimeRange.from ? format(dateTimeRange.from, "HH:mm") : ""}
                  onChange={(e) => handleTimeChange(e, true)}
                  className="flex-1"
                />
                <ClockIcon className="h-4 w-4 opacity-50" />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="endTime">End Time</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="endTime"
                  type="time"
                  value={dateTimeRange.to ? format(dateTimeRange.to, "HH:mm") : ""}
                  onChange={(e) => handleTimeChange(e, false)}
                  className="flex-1"
                />
                <ClockIcon className="h-4 w-4 opacity-50" />
              </div>
            </div>
          </div>
          <Button
            onClick={handleConfirm}
            disabled={!dateTimeRange?.from || !dateTimeRange?.to}
            className="w-full"
          >
            Confirm Selection
          </Button>
        </PopoverContent>
      </Popover>
    </div>
  )
}

