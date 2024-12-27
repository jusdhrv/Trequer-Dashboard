"use client"

import * as React from "react"
import { CalendarIcon, ClockIcon } from "@radix-ui/react-icons"
import { format } from "date-fns"
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
}

export function DateTimeRangePicker({
  className,
  dateTimeRange,
  setDateTimeRange,
}: DateTimeRangePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  const handleDateSelect = (range: DateRange | undefined) => {
    if (range?.from && range?.to) {
      setDateTimeRange({
        from: range.from,
        to: range.to,
      })
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
    setDateTimeRange({
      from: isStartTime ? newDate : dateTimeRange.from,
      to: isStartTime ? dateTimeRange.to : newDate,
    })
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
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
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateTimeRange?.from}
            selected={dateTimeRange}
            onSelect={handleDateSelect}
            numberOfMonths={2}
          />
          <div className="grid grid-cols-2 gap-2 p-3">
            <div>
              <Label htmlFor="startTime">Start Time</Label>
              <div className="flex items-center">
                <Input
                  id="startTime"
                  type="time"
                  value={dateTimeRange.from ? format(dateTimeRange.from, "HH:mm") : ""}
                  onChange={(e) => handleTimeChange(e, true)}
                />
                <ClockIcon className="ml-2 h-4 w-4 opacity-50" />
              </div>
            </div>
            <div>
              <Label htmlFor="endTime">End Time</Label>
              <div className="flex items-center">
                <Input
                  id="endTime"
                  type="time"
                  value={dateTimeRange.to ? format(dateTimeRange.to, "HH:mm") : ""}
                  onChange={(e) => handleTimeChange(e, false)}
                />
                <ClockIcon className="ml-2 h-4 w-4 opacity-50" />
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

