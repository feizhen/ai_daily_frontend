import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker, type DayPickerProps } from "react-day-picker"

import { cn } from "@/lib/utils"

export type CalendarProps = DayPickerProps

function Calendar({
  className,
  classNames,
  showOutsideDays = false,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-4", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-3 w-full !ml-0",
        month_caption: "flex items-center pt-0 pb-2 relative h-10 w-full",
        caption_label: "text-base font-semibold",
        nav: "absolute right-2 flex items-center gap-1 z-10",
        button_previous: cn(
          "h-8 w-8 bg-transparent p-0 hover:bg-gray-100 rounded-lg transition-all border-0 flex items-center justify-center shrink-0"
        ),
        button_next: cn(
          "h-8 w-8 bg-transparent p-0 hover:bg-gray-100 rounded-lg transition-all border-0 flex items-center justify-center shrink-0"
        ),
        month_grid: "w-full border-collapse mt-0",
        weekdays: "flex gap-1 mb-2",
        weekday:
          "text-gray-500 w-9 font-medium text-xs text-center py-1.5",
        week: "flex w-full gap-1 mb-1",
        day: "h-9 w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
        day_button: cn(
          "h-9 w-9 p-0 font-normal rounded-full hover:bg-black/5 transition-all",
          "aria-selected:opacity-100"
        ),
        range_end: "day-range-end",
        selected:
          "!bg-black !text-white hover:!bg-black/95 hover:!text-white focus:!bg-black focus:!text-white rounded-full font-medium !ring-0 !border-0",
        today: "bg-gray-100 text-black font-medium rounded-full ring-1 ring-gray-300 border-0",
        outside:
          "day-outside text-gray-400 aria-selected:bg-black/5 aria-selected:text-gray-400",
        disabled: "text-gray-300 line-through cursor-not-allowed opacity-40",
        range_middle:
          "aria-selected:bg-gray-50 aria-selected:text-black",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) => {
          const Icon = orientation === "left" ? ChevronLeft : ChevronRight
          return <Icon className="h-4 w-4 text-gray-700" />
        },
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
