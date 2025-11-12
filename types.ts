export interface TicketOption {
  id: string;
  trainName: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number; // Price is now in INR
  class: 'Economy' | 'Business' | 'First';
}

export interface ParsedQuery {
  origin: string;
  destination: string;
  date: string;
  adults: number;
  children: number;
}

export interface TicketQueryResponse {
  isQueryValid: boolean;
  errorMessage?: string;
  parsedQuery?: ParsedQuery;
  ticketOptions?: TicketOption[];
  smartSuggestions?: string[];
}

export interface BookedTicket {
  ticketType: 'long-distance';
  ticketInfo: TicketOption;
  queryInfo: ParsedQuery;
  bookingId: string;
}

export interface PlatformTicketData {
    ticketType: 'platform';
    bookingId: string;
    stationName: string;
    platformNumber: string;
    peopleCount: number;
    price: number;
    bookingDate: string;
}

export interface SeasonTicketData {
    ticketType: 'season';
    bookingId: string;
    fromStation: string;
    toStation: string;
    peopleCount: number;
    duration: number; // in days
    price: number;
    bookingDate: string;
    expiryDate: string;
}

export type AnyBookedTicket = BookedTicket | PlatformTicketData | SeasonTicketData;