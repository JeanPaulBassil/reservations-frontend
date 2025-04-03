import React, { useState } from 'react';
import { 
  Button, 
  Avatar, 
  Chip, 
  Select, 
  SelectItem, 
  Textarea,
  Calendar,
  ScrollShadow,
  Tabs,
  Tab
} from '@heroui/react';
import { CalendarDate, today, getLocalTimeZone } from '@internationalized/date';
import { AlertTriangle, Info, CalendarDays, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';

interface ReservationFormProps {
  guest: {
    id: string;
    name: string;
    phone: string;
    tags: string[];
  };
  preferredSeating?: string;
  dietaryRestrictions?: string[];
  allergies?: string;
  onSubmit: (reservationData: ReservationData) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export interface ReservationData {
  guestId: string;
  date: string;
  time: string;
  partySize: string;
  table: string;
  specialRequests: string;
}

interface TableOption {
  id: string;
  name: string;
  capacity: {
    min: number;
    max: number;
  };
}

interface TimeSlot {
  value: string;
  label: string;
}

enum TimeFormatEnum {
  TwelveHour = "12h",
  TwentyFourHour = "24h",
}

const timeFormats = [
  { key: TimeFormatEnum.TwelveHour, label: "12h" },
  { key: TimeFormatEnum.TwentyFourHour, label: "24h" },
];

// Function to get tag color
const getTagColor = (tag: string) => {
  const colorMap: Record<string, string> = {
    'VIP': 'warning',
    'Regular': 'primary',
    'First-time': 'success',
    'Vegetarian': 'secondary',
    'Birthday': 'danger'
  };
  
  return colorMap[tag] || 'default';
};

// Generate time slots for reservation
const generateTimeSlots = (timeFormat = TimeFormatEnum.TwelveHour) => {
  const slots: TimeSlot[] = [];
  // Restaurant hours: 11 AM to 10 PM
  for (let hour = 11; hour < 22; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const value = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      
      if (timeFormat === TimeFormatEnum.TwelveHour) {
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        const label = `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
        slots.push({ value, label });
      } else {
        slots.push({ value, label: value });
      }
    }
  }
  return slots;
};

// Mock tables data
const availableTables: TableOption[] = [
  { id: 'table-1', name: 'Table 1 - Window', capacity: { min: 2, max: 4 } },
  { id: 'table-2', name: 'Table 2 - Window', capacity: { min: 1, max: 2 } },
  { id: 'table-3', name: 'Table 3 - Booth', capacity: { min: 4, max: 6 } },
  { id: 'table-4', name: 'Table 4 - Main Hall', capacity: { min: 2, max: 4 } },
  { id: 'table-5', name: 'Table 5 - Main Hall', capacity: { min: 3, max: 4 } },
  { id: 'table-6', name: 'Table 6 - Bar', capacity: { min: 1, max: 2 } },
  { id: 'table-7', name: 'Table 7 - Outdoor', capacity: { min: 2, max: 4 } },
  { id: 'table-8', name: 'Table 8 - Outdoor', capacity: { min: 4, max: 6 } },
  { id: 'table-9', name: 'Table 9 - Private Room', capacity: { min: 6, max: 10 } },
];

// Time slot component
function TimeSlotButton({ 
  slot, 
  isSelected, 
  onTimeSelect 
}: { 
  slot: TimeSlot; 
  isSelected: boolean; 
  onTimeSelect: (time: string) => void 
}) {
  return (
    <Button
      className={`w-full text-sm font-medium transition-all ${isSelected 
        ? 'bg-emerald-50 text-emerald-600 border-emerald-300 border-2 shadow-sm' 
        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
      radius="sm"
      variant="flat"
      onPress={() => onTimeSelect(slot.value)}
    >
      {slot.label}
    </Button>
  );
}

export function ReservationForm({
  guest,
  preferredSeating = 'no-preference',
  dietaryRestrictions = [],
  allergies = '',
  onSubmit,
  onCancel,
  isSubmitting
}: ReservationFormProps) {
  // Get a reasonable default time (first time slot after current time, or noon if morning)
  const getDefaultTime = () => {
    const now = new Date();
    const hour = now.getHours();
    const minutes = now.getMinutes();
    
    // If it's before restaurant hours, default to opening (11:00)
    if (hour < 11) {
      return '11:00';
    }
    
    // If it's after closing, default to next day opening (handled by date selection)
    if (hour >= 22) {
      return '11:00';
    }
    
    // Round up to the next half hour
    const nextSlot = minutes >= 30 ? `${hour + 1}:00` : `${hour}:30`;
    return `${hour.toString().padStart(2, '0')}:${minutes >= 30 ? '00' : '30'}`;
  };

  const [reservationDate, setReservationDate] = useState<CalendarDate>(today(getLocalTimeZone()));
  const [reservationTime, setReservationTime] = useState<string>(getDefaultTime());
  const [partySize, setPartySize] = useState<string>('2');
  const [specialRequests, setSpecialRequests] = useState<string>('');
  const [selectedTable, setSelectedTable] = useState<string>('any');
  const [timeFormat, setTimeFormat] = useState<TimeFormatEnum>(TimeFormatEnum.TwelveHour);
  const [step, setStep] = useState<'date-time' | 'details'>('date-time');
  
  // Filter tables based on party size
  const getFilteredTables = () => {
    const size = parseInt(partySize);
    return availableTables.filter(table => size >= table.capacity.min && size <= table.capacity.max);
  };
  
  const filteredTables = getFilteredTables();
  
  // Reset table if current selection doesn't support the party size
  React.useEffect(() => {
    if (selectedTable !== 'any') {
      const tableStillValid = filteredTables.some(table => table.id === selectedTable);
      if (!tableStillValid) {
        setSelectedTable('any');
      }
    }
  }, [partySize, selectedTable]);
  
  // Format table name with capacity
  const formatTableName = (table: TableOption) => {
    return `${table.name} (${table.capacity.min}-${table.capacity.max} people)`;
  };
  
  const timeSlots = generateTimeSlots(timeFormat);
  
  const handleTimeSelect = (time: string) => {
    setReservationTime(time);
  };
  
  const handlePartySizeSelect = (keys: any) => {
    const selected = Array.from(keys)[0]?.toString() || '2';
    setPartySize(selected);
  };
  
  const handleTableSelect = (keys: any) => {
    const selected = Array.from(keys)[0]?.toString() || '';
    setSelectedTable(selected);
  };
  
  const handleSubmit = async () => {
    await onSubmit({
      guestId: guest.id,
      date: reservationDate.toString(),
      time: reservationTime,
      partySize,
      table: selectedTable,
      specialRequests
    });
  };
  
  const onDateChange = (date: CalendarDate) => {
    setReservationDate(date);
  };
  
  const onTimeFormatChange = (selectedKey: React.Key) => {
    const newFormat = selectedKey.toString() as TimeFormatEnum;
    setTimeFormat(newFormat);
  };
  
  const continueToDetails = () => {
    if (reservationTime) {
      setStep('details');
    }
  };
  
  const goBackToDateTime = () => {
    setStep('date-time');
  };
  
  const getSelectedTimeLabel = () => {
    const slot = timeSlots.find(slot => slot.value === reservationTime);
    return slot ? slot.label : '';
  };

  const formattedDate = format(new Date(reservationDate.toString()), 'EEEE, MMMM d, yyyy', { locale: enUS });
  const weekday = format(new Date(reservationDate.toString()), 'EEE', { locale: enUS });
  const day = reservationDate.day;
  
  if (step === 'date-time') {
    return (
      <div className="w-full space-y-6">
        <div className="flex flex-col md:flex-row md:gap-8">
          {/* Left side - Guest info */}
          <div className="flex flex-col mb-6 md:mb-0 md:w-72">
            <div className="bg-gray-50/80 dark:bg-gray-800/30 rounded-lg p-4 flex items-center mb-5">
              <Avatar 
                name={guest.name}
                className="h-12 w-12 text-sm mr-4 flex-shrink-0"
                color="primary"
              />
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{guest.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{guest.phone}</p>
              </div>
              {guest.tags.length > 0 && (
                <Chip 
                  color={getTagColor(guest.tags[0]) as any}
                  variant="flat"
                  radius="sm"
                  size="sm"
                  className="ml-auto"
                >
                  {guest.tags[0]}
                </Chip>
              )}
            </div>
            
            <div className="mb-5">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Reservation Details</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Select a date and time for {guest.name}'s reservation
              </p>
            </div>
            
            {reservationTime && (
              <div className="bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/20 rounded-lg p-4 mb-5">
                <div className="flex items-start gap-3">
                  <CalendarDays className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{formattedDate}</p>
                    <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium mt-1">{getSelectedTimeLabel()}</p>
                  </div>
                </div>
              </div>
            )}
            
            <Button
              color="success"
              radius="sm"
              size="lg"
              isDisabled={!reservationTime}
              className="mt-auto text-white"
              onPress={continueToDetails}
            >
              Continue to Details
            </Button>
          </div>
          
          {/* Right side - Calendar and Time slots */}
          <div className="flex flex-col md:flex-row gap-6 flex-1">
            <div className="flex-shrink-0">
              <Calendar
                calendarWidth="372px"
                className="shadow-none dark:bg-transparent"
                classNames={{
                  headerWrapper: "bg-transparent px-3 pt-1.5 pb-3",
                  title: "text-default-700 text-small font-semibold",
                  gridHeader: "bg-transparent shadow-none",
                  gridHeaderCell: "font-medium text-default-400 text-xs p-0 w-full",
                  gridHeaderRow: "px-3 pb-3",
                  gridBodyRow: "gap-x-1 px-3 mb-1 first:mt-4 last:mb-0",
                  gridWrapper: "pb-3",
                  cell: "p-1.5 w-full",
                  cellButton:
                    "w-full h-9 rounded-medium data-[selected]:shadow-[0_2px_12px_0] data-[selected]:shadow-emerald-300 text-small font-medium",
                }}
                isDateUnavailable={(date) => {
                  // Disallow dates in the past
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const dateToCheck = new Date(date.toString());
                  return dateToCheck < today;
                }}
                value={reservationDate}
                weekdayStyle="short"
                onChange={onDateChange}
              />
            </div>
            
            <div className="w-full md:w-60">
              <div className="flex justify-between items-center mb-3">
                <div className="text-sm font-medium">
                  <span className="text-gray-900 dark:text-gray-100">{weekday}</span>{' '}
                  <span className="text-gray-500">{day}</span>
                </div>
                <Tabs 
                  size="sm" 
                  aria-label="Time format"
                  selectedKey={timeFormat}
                  onSelectionChange={onTimeFormatChange}
                  classNames={{
                    tabList: "h-7 min-h-unit-0 p-0",
                    tab: "h-7 px-2 text-xs"
                  }}
                >
                  {timeFormats.map((format) => (
                    <Tab key={format.key} title={format.label} />
                  ))}
                </Tabs>
              </div>
              
              <ScrollShadow hideScrollBar className="max-h-[380px] pr-2">
                <div className="flex flex-col gap-2">
                  {timeSlots.map((slot) => (
                    <TimeSlotButton
                      key={slot.value}
                      slot={slot}
                      isSelected={slot.value === reservationTime}
                      onTimeSelect={handleTimeSelect}
                    />
                  ))}
                </div>
              </ScrollShadow>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col md:flex-row md:gap-8">
        {/* Left side - Guest info and reservation summary */}
        <div className="flex flex-col mb-6 md:mb-0 md:w-72">
          <div className="bg-gray-50/80 dark:bg-gray-800/30 rounded-lg p-4 flex items-center mb-5">
            <Avatar 
              name={guest.name}
              className="h-12 w-12 text-sm mr-4 flex-shrink-0"
              color="primary"
            />
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{guest.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{guest.phone}</p>
            </div>
            {guest.tags.length > 0 && (
              <Chip 
                color={getTagColor(guest.tags[0]) as any}
                variant="flat"
                radius="sm"
                size="sm"
                className="ml-auto"
              >
                {guest.tags[0]}
              </Chip>
            )}
          </div>
          
          <div className="bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/20 rounded-lg p-4 mb-5">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CalendarDays className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{formattedDate}</p>
                  <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium mt-1">{getSelectedTimeLabel()}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  Party of {partySize}
                </p>
              </div>
            </div>
          </div>
          
          <Button
            variant="flat"
            radius="sm"
            className="mb-5"
            size="md"
            startContent={<Info className="h-4 w-4" />}
            onPress={goBackToDateTime}
          >
            Change Date/Time
          </Button>
        </div>
        
        {/* Right side - Additional details */}
        <div className="flex-1 space-y-5">
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Party Size</h3>
            <Select
              selectedKeys={new Set([partySize])}
              onSelectionChange={handlePartySizeSelect}
              radius="sm"
              variant="flat"
              classNames={{
                trigger: "bg-gray-50/50 dark:bg-gray-800/30 shadow-sm h-[44px]",
                value: "text-sm"
              }}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((size) => (
                <SelectItem key={String(size)}>
                  {size} {size === 1 ? 'person' : 'people'}
                </SelectItem>
              ))}
            </Select>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Table Preference {filteredTables.length === 0 ? "(No tables available for this party size)" : "(Optional)"}
            </h3>
            <Select
              selectedKeys={selectedTable ? new Set([selectedTable]) : new Set([])}
              onSelectionChange={handleTableSelect}
              radius="sm"
              variant="flat"
              isDisabled={filteredTables.length === 0}
              classNames={{
                trigger: "bg-gray-50/50 dark:bg-gray-800/30 shadow-sm h-[44px]",
                value: "text-sm"
              }}
            >
              {[
                <SelectItem key="any">Any available table</SelectItem>,
                ...filteredTables.map(table => (
                  <SelectItem key={table.id}>{formatTableName(table)}</SelectItem>
                ))
              ]}
            </Select>
            {filteredTables.length === 0 && (
              <p className="mt-2 text-xs text-amber-600 dark:text-amber-400 flex items-start">
                <AlertTriangle className="h-3.5 w-3.5 mr-1.5 mt-0.5 flex-shrink-0" />
                No tables available for a party of {partySize}. Please contact the restaurant directly.
              </p>
            )}
            {preferredSeating !== 'no-preference' && (
              <div className="mt-2 text-xs flex items-start">
                <Info className="h-4 w-4 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-600 dark:text-gray-300">
                  Guest prefers {preferredSeating} seating when available
                </span>
              </div>
            )}
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Special Requests</h3>
            <Textarea
              placeholder="Enter any special requests or notes for this reservation..."
              value={specialRequests}
              onValueChange={setSpecialRequests}
              radius="sm"
              variant="flat"
              rows={3}
              classNames={{
                inputWrapper: "bg-gray-50/50 dark:bg-gray-800/30 shadow-sm",
                input: "text-sm"
              }}
            />
          </div>
          
          {/* Display dietary restrictions if any */}
          {dietaryRestrictions.length > 0 && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-800/30 rounded-lg p-4">
              <div className="flex gap-2 items-center mb-3">
                <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Dietary Restrictions</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {dietaryRestrictions.map((restriction) => (
                  <Chip
                    key={restriction}
                    variant="flat"
                    color="warning"
                    radius="sm"
                    size="sm"
                  >
                    {restriction}
                  </Chip>
                ))}
              </div>
              {allergies && (
                <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-3">
                  <span className="font-medium">Allergies:</span> {allergies}
                </p>
              )}
            </div>
          )}
          
          {/* Action buttons */}
          <div className="flex gap-4 pt-5">
            <Button 
              variant="flat" 
              color="default"
              onPress={onCancel}
              className="flex-1"
              radius="sm"
              size="lg"
            >
              Cancel
            </Button>
            <Button
              color="success"
              onPress={handleSubmit}
              isLoading={isSubmitting}
              className="flex-1 text-white"
              radius="sm"
              size="lg"
              isDisabled={!reservationTime}
            >
              {isSubmitting ? 'Creating...' : 'Create Reservation'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 