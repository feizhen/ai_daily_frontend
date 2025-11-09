import { format } from "date-fns";
import { enUS, zhCN } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useLanguage } from "@/contexts/LanguageContext";

interface DatePickerProps {
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  className?: string;
}

export function DatePicker({ date, onDateChange, className }: DatePickerProps) {
  const { language } = useLanguage();
  const locale = language === "zh" ? zhCN : enUS;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "inline-flex items-center gap-2 px-4 py-2 h-10",
            "bg-[#f5f5f5] border border-[#e5e5e5] rounded-[20px]",
            "text-sm font-normal text-black",
            "hover:bg-[#ebebeb] transition-colors",
            "cursor-pointer whitespace-nowrap",
            !date && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="h-4 w-4" />
          {date ? (
            format(date, language === "zh" ? "M月d日" : "MMM d", { locale })
          ) : (
            <span>{language === "zh" ? "选择日期" : "Pick a date"}</span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 rounded-2xl border-gray-200 shadow-xl"
        align="end"
        sideOffset={8}
      >
        <Calendar
          mode="single"
          selected={date}
          onSelect={onDateChange}
          locale={locale}
          disabled={(date) =>
            date > new Date() || date < new Date("2020-01-01")
          }
        />
      </PopoverContent>
    </Popover>
  );
}
