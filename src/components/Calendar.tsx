import React, { useState, useEffect } from 'react';
import Button from './Button';
import Input from './Input/Input';
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { Colors } from '@/styles/styles';
import { MONTH_NAMES, WEEK_DAYS } from '@/lib/utils/DateUtils';
type DatePicker1Props = {
  onDateSelect?: (date: string) => void;
};
export default function DatePicker1({ onDateSelect }: DatePicker1Props) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [yearInput, setYearInput] = useState(
    currentDate.getFullYear().toString(),
  );
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const formatDate = (day: number, month: number, year: number) => {
    const dayStr = day < 10 ? `0${day}` : `${day}`;
    const monthStr = month + 1 < 10 ? `0${month + 1}` : `${month + 1}`;
    return `${year}-${monthStr}-${dayStr}`;
  };
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };
  // Sincroniza el valor del input del año con currentDate cuando cambie
  useEffect(() => {
    setYearInput(currentDate.getFullYear().toString());
  }, [currentDate]);

  const handleYearChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newYearStr = event.target.value;
    // Permitir solo números y un máximo de 4 caracteres
    if (/^\d{0,4}$/.test(newYearStr)) {
      setYearInput(newYearStr);
      if (newYearStr.length === 4) {
        const newYear = Number(newYearStr);
        if (!isNaN(newYear)) {
          setCurrentDate(new Date(newYear, month, 1));
        }
      }
    }
  };
  const handleSelectDate = (day: number) => {
    const newDate = formatDate(day, month, year);
    setSelectedDate(newDate);
    console.log(newDate);
    if (onDateSelect) {
      onDateSelect(newDate);
    }
  };
  const handleClearDate = () => {
    setSelectedDate(null);
    setIsCalendarOpen(false);
  };
  const handleDone = () => {
    setIsCalendarOpen(false);
  };
  return (
    <div className="relative">
      <div onClick={() => setIsCalendarOpen(!isCalendarOpen)}>
        <Input
          type="text"
          placeholder="Selecciona una fecha"
          value={selectedDate || ''}
          onChange={() => {}}
          icon={CalendarIcon}
          iconColor={Colors.textLowContrast}
          iconPosition="right"
          borderSize="1px"
          borderColor={Colors.stroke}
        />
      </div>
      {isCalendarOpen && (
        <div className="relative mt-2 w-full max-w-md rounded-md bg-white p-4 shadow-lg sm:h-[532px] sm:h-auto sm:w-[509px]">
          <div className="mb-4 flex items-center justify-between px-4">
            <button
              onClick={handlePrevMonth}
              className="rounded-md p-2 text-lg hover:bg-gray-200"
            >
              <ChevronLeftIcon className="h-6 w-6 text-gray-600" />
            </button>
            <div className="flex items-center space-x-4">
              <span className="text-xl font-medium">{MONTH_NAMES[month]}</span>
              <input
                type="number"
                value={yearInput}
                onChange={handleYearChange}
                className="w-16 appearance-auto bg-transparent text-center text-lg font-medium outline-none md:appearance-auto"
                min="0"
                max="3000"
              />
            </div>
            <button
              onClick={handleNextMonth}
              className="rounded-md p-2 text-lg hover:bg-gray-200"
            >
              <ChevronRightIcon className="h-6 w-6 text-gray-600" />
            </button>
          </div>
          <div className="mb-2 grid grid-cols-7 gap-2 text-center font-semibold">
            {WEEK_DAYS.map((day, index) => (
              <div key={index} className="text-gray-600">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {[...Array(firstDayOfMonth)].map((_, i) => (
              <div
                key={`empty-${i}`}
                className="h-10 w-10 sm:h-12 sm:w-12"
              ></div>
            ))}
            {[...Array(daysInMonth)].map((_, i) => {
              const dayNumber = i + 1;
              const currentFormattedDate = formatDate(dayNumber, month, year);
              return (
                <button
                  key={dayNumber}
                  onClick={() => handleSelectDate(dayNumber)}
                  className={`h-10 w-10 rounded-md text-sm font-medium sm:h-12 sm:w-12 sm:text-lg ${
                    selectedDate === currentFormattedDate
                      ? 'bg-[#1C2143] text-white'
                      : 'hover:bg-gray-200'
                  }`}
                >
                  {dayNumber}
                </button>
              );
            })}
          </div>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-between">
            <Button
              variant="gray"
              paddingX={6}
              paddingY={3}
              textSize="base"
              className="h-11 w-full sm:h-[50px] sm:w-[215px]"
              onClick={handleClearDate}
            >
              Quitar
            </Button>
            <Button
              variant="submit"
              paddingX={6}
              paddingY={3}
              textSize="base"
              className="h-11 w-full sm:h-[50px] sm:w-[215px]"
              onClick={handleDone}
            >
              Hecho
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
