import React, { useState, useCallback, useMemo } from 'react';
import { getSmartTicketResults } from './services/geminiService';
import type { TicketQueryResponse, ParsedQuery, TicketOption, AnyBookedTicket, PlatformTicketData, SeasonTicketData, BookedTicket } from './types';
import Loader from './components/Loader';
import TicketCard from './components/TicketCard';
import SuggestionCard from './components/SuggestionCard';
import Navbar from './components/Navbar';
import LocalBookingModal from './components/LocalBookingModal';
import { TrainIcon, CalendarIcon, ArrowRightIcon, UserCircleIcon, XIcon, CreditCardIcon, CheckCircleIcon, ArrowLeftIcon, SwapIcon, MapPinIcon, TicketIcon, ClockIcon, EyeIcon } from './components/icons';

// --- Start of nested components ---

const QRCode: React.FC = () => (
    <svg width="80" height="80" viewBox="0 0 100 100" className="bg-white p-1 rounded-md">
        {Array.from({ length: 100 }).map((_, i) => (
            <rect
                key={i}
                x={(i % 10) * 10}
                y={Math.floor(i / 10) * 10}
                width="10"
                height="10"
                fill={Math.random() > 0.5 ? '#1a202c' : 'white'}
            />
        ))}
    </svg>
);

const TicketImage: React.FC<{ ticket: TicketOption; query: ParsedQuery; bookingId: string }> = ({ ticket, query, bookingId }) => {
  const totalPassengers = query.adults + query.children;
  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl shadow-lg w-full max-w-md mx-auto font-sans">
      <div className="bg-blue-600 dark:bg-blue-500 text-white p-4 rounded-t-2xl flex justify-between items-center">
        <div className="flex items-center space-x-2">
            <TrainIcon className="w-6 h-6"/>
            <h2 className="text-xl font-bold">SmartRail Pass</h2>
        </div>
        <div className="text-right">
            <p className="text-xs">Class</p>
            <p className="font-semibold text-lg">{ticket.class}</p>
        </div>
      </div>
      
      <div className="p-6">
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">{ticket.trainName}</p>
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-xs text-gray-400">From</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{query.origin}</p>
            <p className="font-semibold text-gray-700 dark:text-gray-300">{ticket.departureTime}</p>
          </div>
          <ArrowRightIcon className="w-8 h-8 text-gray-300 dark:text-gray-600"/>
          <div className="text-right">
            <p className="text-xs text-gray-400">To</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{query.destination}</p>
            <p className="font-semibold text-gray-700 dark:text-gray-300">{ticket.arrivalTime}</p>
          </div>
        </div>

        <div className="border-t border-dashed my-4 dark:border-gray-600"></div>
        
        <div className="flex justify-between items-start">
            <div>
                <div className="mb-3">
                    <p className="text-xs text-gray-400">Date</p>
                    <p className="font-semibold text-gray-700 dark:text-gray-300">{new Date(query.date).toLocaleDateString(undefined, { weekday: 'short', month: 'long', day: 'numeric' })}</p>
                </div>
                <div className="mb-3">
                    <p className="text-xs text-gray-400">Passenger(s)</p>
                    <p className="font-semibold text-gray-700 dark:text-gray-300">{query.adults} Adult{query.adults > 1 ? 's' : ''}{query.children > 0 ? `, ${query.children} Child${query.children > 1 ? 'ren' : ''}` : ''}</p>
                </div>
                 <div>
                    <p className="text-xs text-gray-400">Total Price</p>
                    <p className="font-semibold text-gray-700 dark:text-gray-300">₹{(ticket.price * totalPassengers).toFixed(2)}</p>
                </div>
            </div>
            <div className="text-center">
                 <QRCode />
                 <p className="text-xs text-gray-400 mt-1">Scan at gate</p>
            </div>
        </div>
      </div>
      <div className="bg-gray-100 dark:bg-gray-700 rounded-b-2xl p-2 text-center text-xs text-gray-500 dark:text-gray-400">
        Ticket ID: {bookingId}
      </div>
    </div>
  );
};

const PlatformTicketImage: React.FC<{ ticket: PlatformTicketData }> = ({ ticket }) => (
    <div className="bg-yellow-50 dark:bg-gray-800 rounded-2xl shadow-lg w-full max-w-md mx-auto font-sans">
        <div className="bg-yellow-500 text-white p-4 rounded-t-2xl flex justify-between items-center">
            <div className="flex items-center space-x-2">
                <TicketIcon className="w-6 h-6" />
                <h2 className="text-xl font-bold">Platform Ticket</h2>
            </div>
        </div>
        <div className="p-6">
            <div className="flex items-center gap-3">
                <MapPinIcon className="w-6 h-6 text-yellow-600" />
                <div>
                    <p className="text-xs text-gray-400">Station</p>
                    <p className="font-bold text-lg text-gray-800 dark:text-white">{ticket.stationName}</p>
                </div>
            </div>
            <div className="flex justify-between items-center border-t mt-3 pt-3 border-dashed dark:border-gray-600">
                 <div>
                    <p className="text-xs text-gray-400">Platform No.</p>
                    <p className="font-semibold text-gray-700 dark:text-gray-300">{ticket.platformNumber}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-400">Passenger(s)</p>
                    <p className="font-semibold text-gray-700 dark:text-gray-300">{ticket.peopleCount}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-400">Price</p>
                    <p className="font-bold text-gray-800 dark:text-white">₹{ticket.price.toFixed(2)}</p>
                </div>
            </div>
             <div className="border-t border-dashed mt-3 pt-3 dark:border-gray-600 flex items-center justify-center gap-2 text-sm text-yellow-700 dark:text-yellow-300">
                <ClockIcon className="w-5 h-5" />
                <span>Valid for 24 hours from booking</span>
            </div>
        </div>
        <div className="bg-gray-100 dark:bg-gray-700 rounded-b-2xl p-2 text-center text-xs text-gray-500 dark:text-gray-400">
            Booked on {new Date(ticket.bookingDate).toLocaleDateString()}
        </div>
    </div>
);

const SeasonTicketImage: React.FC<{ ticket: SeasonTicketData }> = ({ ticket }) => (
    <div className="bg-green-50 dark:bg-gray-800 rounded-2xl shadow-lg w-full max-w-md mx-auto font-sans">
        <div className="bg-green-600 text-white p-4 rounded-t-2xl flex justify-between items-center">
            <div className="flex items-center space-x-2">
                <CalendarIcon className="w-6 h-6" />
                <h2 className="text-xl font-bold">Season Pass</h2>
            </div>
             <p className="font-semibold text-lg">{ticket.duration} Days</p>
        </div>
        <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-xs text-gray-400">From</p>
                <p className="text-xl font-bold text-gray-800 dark:text-white">{ticket.fromStation}</p>
              </div>
              <ArrowRightIcon className="w-6 h-6 text-gray-300 dark:text-gray-600"/>
              <div className="text-right">
                <p className="text-xs text-gray-400">To</p>
                <p className="text-xl font-bold text-gray-800 dark:text-white">{ticket.toStation}</p>
              </div>
            </div>
            <div className="flex justify-between items-center border-t pt-3 border-dashed dark:border-gray-600">
                 <div>
                    <p className="text-xs text-gray-400">Ends On</p>
                    <p className="font-semibold text-gray-700 dark:text-gray-300">{new Date(ticket.expiryDate).toLocaleDateString()}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-400">Passenger(s)</p>
                    <p className="font-semibold text-gray-700 dark:text-gray-300">{ticket.peopleCount}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-400">Price</p>
                    <p className="font-bold text-gray-800 dark:text-white">₹{ticket.price.toFixed(2)}</p>
                </div>
            </div>
        </div>
    </div>
);


type BookingStep = 'options' | 'payment' | 'confirmed';

const BookingModal: React.FC<{
  step: BookingStep;
  setStep: (step: BookingStep) => void;
  onClose: () => void;
  onConfirm: () => void;
  ticket: TicketOption;
  adults: number;
  children: number;
}> = ({ step, setStep, onClose, onConfirm, ticket, adults, children }) => {
  const totalPassengers = adults + children;
  const totalPrice = (ticket.price * totalPassengers).toFixed(2);

  const renderContent = () => {
    switch (step) {
      case 'options':
        return (
          <div>
            <h2 className="text-2xl font-bold text-center mb-2 text-gray-800 dark:text-white">Complete Your Booking</h2>
            <p className="text-center text-gray-600 dark:text-gray-300 mb-6">Total Price: <span className="font-bold text-blue-600 dark:text-blue-400">₹{totalPrice}</span></p>
            <div className="space-y-4">
              <button
                onClick={() => setStep('payment')}
                className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
              >
                <CreditCardIcon className="w-6 h-6"/>
                Pay with Card
              </button>
              <button
                onClick={onConfirm}
                className="w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-bold py-3 px-4 rounded-lg transition-colors"
              >
                Create Sample Booking
              </button>
            </div>
          </div>
        );
      case 'payment':
        return (
          <div>
             <button onClick={() => setStep('options')} className="absolute top-4 left-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <ArrowLeftIcon className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Payment Details</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">You are paying <span className="font-bold text-blue-600 dark:text-blue-400">₹{totalPrice}</span></p>
            <form onSubmit={(e) => { e.preventDefault(); onConfirm(); }}>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="card-number" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Card Number</label>
                        <input type="text" id="card-number" placeholder="•••• •••• •••• ••••" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white" required />
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label htmlFor="expiry" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Expiry Date</label>
                            <input type="text" id="expiry" placeholder="MM / YY" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white" required />
                        </div>
                        <div className="flex-1">
                            <label htmlFor="cvc" className="block text-sm font-medium text-gray-700 dark:text-gray-300">CVC</label>
                            <input type="text" id="cvc" placeholder="•••" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white" required />
                        </div>
                    </div>
                </div>
                <button type="submit" className="w-full mt-6 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition-colors">
                    Pay ₹{totalPrice}
                </button>
            </form>
          </div>
        );
      case 'confirmed':
        return (
          <div className="text-center">
            <div className="flex justify-center items-center mb-4">
              <CheckCircleIcon className="w-12 h-12 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">Booking Confirmed!</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">Your ticket has been added to your profile.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div onClick={onClose} className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 animate-in fade-in">
      <div onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-6 md:p-8 w-full max-w-lg relative transform transition-all animate-in fade-in zoom-in-95">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
          <XIcon className="w-6 h-6" />
        </button>
        {renderContent()}
      </div>
    </div>
  );
};

const LoginModal: React.FC<{
    onLogin: (username: string) => void;
    onClose: () => void;
}> = ({ onLogin, onClose }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (username.trim()) {
            onLogin(username);
        }
    };

    return (
        <div onClick={onClose} className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 animate-in fade-in">
            <div onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-8 w-full max-w-md relative transform transition-all animate-in fade-in zoom-in-95">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                    <XIcon className="w-6 h-6" />
                </button>
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">Sign In</h2>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">UserId/Email</label>
                            <input
                                type="text"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="password"  className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
                                required
                            />
                        </div>
                    </div>
                    <button type="submit" className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors">
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
};

const PassengerCounter: React.FC<{ label: string; count: number; setCount: (count: number) => void; baseColor?: 'dark' | 'light' }> = ({ label, count, setCount, baseColor = 'dark' }) => (
    <div className="flex-1">
        <label className={`block text-sm font-medium mb-1 ${baseColor === 'dark' ? 'text-gray-200' : 'text-gray-700 dark:text-gray-300'}`}>{label}</label>
        <div className={`flex items-center justify-center rounded-lg p-1 ${baseColor === 'dark' ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-700'}`}>
            <button type="button" onClick={() => setCount(Math.max(label === 'Adults' ? 1 : 0, count - 1))} className={`px-3 py-1 text-lg font-bold ${baseColor === 'dark' ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>-</button>
            <span className={`w-10 text-center text-lg font-semibold ${baseColor === 'dark' ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{count}</span>
            <button type="button" onClick={() => setCount(count + 1)} className={`px-3 py-1 text-lg font-bold ${baseColor === 'dark' ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>+</button>
        </div>
    </div>
);


const HeroSection: React.FC<{
    onSearch: (query: string) => void;
    isLoading: boolean;
}> = ({ onSearch, isLoading }) => {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [activeInput, setActiveInput] = useState<'source' | 'destination' | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  
  const allSuggestions = useMemo(() => [
    'Mumbai CSMT', 'New Delhi (NDLS)', 'Bangalore City', 'Kolkata (Howrah)', 'Chennai Central', 'Pune Junction', 'Goa (Madgaon)',
    'Hyderabad', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane',
    'Bhopal', 'Visakhapatnam', 'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana', 'Agra Cantt',
    'Nashik', 'Faridabad', 'Meerut', 'Rajkot', 'Varanasi', 'Srinagar', 'Aurangabad',
    'Dhanbad', 'Amritsar', 'Allahabad', 'Ranchi', 'Howrah', 'Coimbatore', 'Jabalpur',
    'Gwalior', 'Vijayawada', 'Jodhpur', 'Madurai', 'Raipur', 'Kota', 'Guwahati', 'Chandigarh',
    'Shimla', 'Mysore', 'Ooty (Udagamandalam)', 'Darjeeling'
  ], []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'source' | 'destination') => {
    const value = e.target.value;
    if (field === 'source') setSource(value);
    else setDestination(value);

    if (value.length > 1) {
        const filtered = allSuggestions.filter(s => 
            s.toLowerCase().startsWith(value.toLowerCase())
        );
        setSuggestions(filtered);
    } else {
        setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (activeInput === 'source') setSource(suggestion);
    if (activeInput === 'destination') setDestination(suggestion);
    setSuggestions([]);
    setActiveInput(null);
  };
  
  const handleSwap = () => {
    setSource(destination);
    setDestination(source);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (source.trim() && destination.trim()) {
      onSearch(`from ${source} to ${destination}`);
      setActiveInput(null);
      setSuggestions([]);
    }
  };

  return (
      <div className="h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800">
          <div className="text-center text-gray-800 dark:text-white p-4 max-w-4xl w-full">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">Your Train Journey</h1>
            <p className="text-lg md:text-xl mb-8 text-gray-600 dark:text-gray-300">
              Find the perfect train journey with the power of AI.
            </p>
            <form onSubmit={handleSearch} className="bg-white dark:bg-gray-800/50 p-4 rounded-xl shadow-2xl" onBlur={() => setTimeout(() => setActiveInput(null), 150)}>
                <div className="flex flex-col md:flex-row items-center gap-2">
                    <div className="relative w-full">
                         <input
                            type="text"
                            value={source}
                            onChange={(e) => handleInputChange(e, 'source')}
                            onFocus={() => setActiveInput('source')}
                            placeholder="Source Station"
                            className="w-full p-4 rounded-lg bg-gray-100 text-gray-900 placeholder-gray-500 transition focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                            disabled={isLoading}
                            autoComplete="off"
                         />
                         {activeInput === 'source' && suggestions.length > 0 && (
                             <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-20 text-left animate-in fade-in duration-200">
                                <ul className="py-1 max-h-60 overflow-y-auto">
                                    {suggestions.map(s => (
                                        <li key={s} onMouseDown={() => handleSuggestionClick(s)} className="px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">{s}</li>
                                    ))}
                                </ul>
                             </div>
                         )}
                    </div>
                    
                    <button type="button" onClick={handleSwap} className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                        <SwapIcon className="w-6 h-6 text-gray-500 dark:text-gray-400"/>
                    </button>
                    
                    <div className="relative w-full">
                        <input
                            type="text"
                            value={destination}
                            onChange={(e) => handleInputChange(e, 'destination')}
                            onFocus={() => setActiveInput('destination')}
                            placeholder="Destination Station"
                            className="w-full p-4 rounded-lg bg-gray-100 text-gray-900 placeholder-gray-500 transition focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                            disabled={isLoading}
                            autoComplete="off"
                        />
                         {activeInput === 'destination' && suggestions.length > 0 && (
                             <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-20 text-left animate-in fade-in duration-200">
                                <ul className="py-1 max-h-60 overflow-y-auto">
                                    {suggestions.map(s => (
                                        <li key={s} onMouseDown={() => handleSuggestionClick(s)} className="px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">{s}</li>
                                    ))}
                                </ul>
                             </div>
                         )}
                    </div>
                    <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-4 px-8 rounded-lg transition-colors duration-300 flex items-center justify-center w-full md:w-auto"
                        disabled={isLoading || !source || !destination}
                    >
                        <TrainIcon className="w-5 h-5 mr-2" />
                        Find Tickets
                    </button>
                </div>
            </form>
          </div>
      </div>
  );
};

const ResultsHeader: React.FC<{ query: ParsedQuery, adults: number, children: number, onAdultsChange: (n: number) => void, onChildrenChange: (n: number) => void }> = ({ query, adults, children, onAdultsChange, onChildrenChange }) => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-gray-700 dark:text-gray-300">
            <div className="flex items-center text-xl font-semibold">
                <span>{query.origin}</span>
                <ArrowRightIcon className="w-6 h-6 mx-4 text-blue-500"/>
                <span>{query.destination}</span>
            </div>
            <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5"/>
                <span>{new Date(query.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700 mt-4 pt-4 flex flex-col sm:flex-row gap-4 items-center justify-center">
            <p className="font-semibold text-gray-800 dark:text-white">Passengers:</p>
            <div className="flex gap-4">
                <PassengerCounter label="Adults" count={adults} setCount={onAdultsChange} baseColor="light"/>
                <PassengerCounter label="Children" count={children} setCount={onChildrenChange} baseColor="light"/>
            </div>
        </div>
    </div>
);

const TicketDetailModal: React.FC<{ ticket: AnyBookedTicket, onClose: () => void }> = ({ ticket, onClose }) => {
    return (
        <div onClick={onClose} className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 animate-in fade-in">
            <div onClick={(e) => e.stopPropagation()} className="bg-transparent w-full max-w-md relative">
                 <button onClick={onClose} className="absolute -top-10 right-0 text-white hover:text-gray-300">
                    <XIcon className="w-8 h-8" />
                </button>
                {ticket.ticketType === 'long-distance' && <TicketImage ticket={ticket.ticketInfo} query={ticket.queryInfo} bookingId={ticket.bookingId} />}
                {ticket.ticketType === 'platform' && <PlatformTicketImage ticket={ticket} />}
                {ticket.ticketType === 'season' && <SeasonTicketImage ticket={ticket} />}
            </div>
        </div>
    );
};

const TicketSummaryCard: React.FC<{ ticket: AnyBookedTicket, onView: () => void }> = ({ ticket, onView }) => {
    const renderContent = () => {
        switch (ticket.ticketType) {
            case 'long-distance':
                return (
                    <>
                        <div className="flex items-center gap-3">
                            <TrainIcon className="w-8 h-8 text-blue-500" />
                            <div>
                                <p className="font-bold text-lg">{ticket.ticketInfo.trainName}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{ticket.queryInfo.origin} &rarr; {ticket.queryInfo.destination}</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                           {new Date(ticket.queryInfo.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                    </>
                );
            case 'platform':
                return (
                    <>
                        <div className="flex items-center gap-3">
                            <TicketIcon className="w-8 h-8 text-yellow-500" />
                            <div>
                                <p className="font-bold text-lg">Platform Ticket</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{ticket.stationName}</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                           Booked: {new Date(ticket.bookingDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </p>
                    </>
                );
            case 'season':
                 return (
                    <>
                        <div className="flex items-center gap-3">
                            <CalendarIcon className="w-8 h-8 text-green-500" />
                            <div>
                                <p className="font-bold text-lg">Season Pass</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{ticket.fromStation} &harr; {ticket.toStation}</p>
                            </div>
                        </div>
                         <p className="text-sm text-gray-600 dark:text-gray-300">
                           Ends: {new Date(ticket.expiryDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </p>
                    </>
                );
        }
    };
    
    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex items-center justify-between">
            {renderContent()}
            <button onClick={onView} className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-sm font-medium py-2 px-3 rounded-lg transition-colors">
                <EyeIcon className="w-5 h-5"/>
                View
            </button>
        </div>
    );
};

const ProfilePage: React.FC<{ user: { name: string; email: string }, bookedTickets: AnyBookedTicket[], onViewTicket: (ticket: AnyBookedTicket) => void, onBack: () => void }> = ({ user, bookedTickets, onViewTicket, onBack }) => {
    const sortedTickets = useMemo(() => {
        return [...bookedTickets].sort((a, b) => {
            const dateA = new Date(a.ticketType === 'long-distance' ? (a as BookedTicket).queryInfo.date : a.bookingDate).getTime();
            const dateB = new Date(b.ticketType === 'long-distance' ? (b as BookedTicket).queryInfo.date : b.bookingDate).getTime();
            return dateB - dateA;
        });
    }, [bookedTickets]);

    return (
        <div className="animate-in fade-in p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
            <button onClick={onBack} className="flex items-center gap-2 mb-6 text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors font-medium">
                <ArrowLeftIcon className="w-5 h-5" />
                Back
            </button>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6 text-center">
                <UserCircleIcon className="w-20 h-20 mx-auto text-blue-500"/>
                <h2 className="text-3xl font-bold mt-4">{user.name}</h2>
                <p className="text-gray-500 dark:text-gray-400">{user.email}</p>
            </div>
            <h3 className="text-2xl font-bold mb-4 text-center">My Bookings</h3>
            {sortedTickets.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {sortedTickets.map(booking => (
                        <TicketSummaryCard key={booking.bookingId} ticket={booking} onView={() => onViewTicket(booking)} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                    <TrainIcon className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600"/>
                    <p className="mt-4 text-gray-500 dark:text-gray-400">You have no booked tickets yet.</p>
                </div>
            )}
        </div>
    );
};


const App = () => {
  type Page = 'search' | 'results' | 'profile';
  type User = { name: string; email: string };
  type LocalBookingType = 'platform' | 'season';
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<TicketQueryResponse | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<TicketOption | null>(null);
  
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);

  const [user, setUser] = useState<User | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [actionAfterLogin, setActionAfterLogin] = useState<'book' | LocalBookingType | null>(null);

  const [bookingStep, setBookingStep] = useState<BookingStep | null>(null);
  const [isBookingConfirmed, setIsBookingConfirmed] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>('search');
  const [previousPage, setPreviousPage] = useState<Page>('search');
  const [bookedTickets, setBookedTickets] = useState<{[key: string]: AnyBookedTicket[]}>({});
  const [localBookingType, setLocalBookingType] = useState<LocalBookingType | null>(null);
  
  const [searchResultsCache, setSearchResultsCache] = useState<Map<string, TicketQueryResponse>>(new Map());
  const [viewingTicket, setViewingTicket] = useState<AnyBookedTicket | null>(null);

  const handleSearch = useCallback(async (query: string) => {
    setIsLoading(true);
    setError(null);
    setResults(null);
    setSelectedTicket(null);
    setCurrentPage('results');
    
    if (searchResultsCache.has(query)) {
        const cachedResponse = searchResultsCache.get(query)!;
        setResults(cachedResponse);
        if (cachedResponse.parsedQuery) {
            setAdults(cachedResponse.parsedQuery.adults);
            setChildren(cachedResponse.parsedQuery.children);
        }
        setIsLoading(false);
        return;
    }

    const response = await getSmartTicketResults(query);
    if (response.isQueryValid && response.parsedQuery) {
      setResults(response);
      setAdults(response.parsedQuery.adults);
      setChildren(response.parsedQuery.children);
      setSearchResultsCache(prevCache => new Map(prevCache).set(query, response));
    } else {
      setError(response.errorMessage || "We couldn't understand your request. Please try again.");
    }
    setIsLoading(false);
  }, [searchResultsCache]);

  const handleReset = () => {
    setResults(null);
    setError(null);
    setSelectedTicket(null);
    setBookingStep(null);
    setIsBookingConfirmed(false);
    setCurrentPage('search');
  };
  
  const handleSelectTicket = (ticket: TicketOption) => {
      setSelectedTicket(ticket.id === selectedTicket?.id ? null : ticket);
  };
  
  const handleBookNow = () => {
    if (!user) {
        setActionAfterLogin('book');
        setIsLoginModalOpen(true);
    } else {
        setBookingStep('options');
    }
  };

  const handleLogin = (username: string) => {
    const newUser = { name: username, email: `${username.toLowerCase().replace(/\s/g, '.')}@example.com`};
    setUser(newUser);
    if (!bookedTickets[username]) {
        setBookedTickets(prev => ({...prev, [username]: []}));
    }
    setIsLoginModalOpen(false);
    if (actionAfterLogin === 'book' && selectedTicket) {
        setBookingStep('options');
    } else if (actionAfterLogin === 'platform' || actionAfterLogin === 'season') {
        setLocalBookingType(actionAfterLogin);
    }
    setActionAfterLogin(null);
  };

  const handleLogout = () => {
    setUser(null);
    handleReset();
  };
  
  const handleNavigate = (page: 'search' | 'platform' | 'season') => {
      if (page === 'search') {
          handleReset();
      } else {
          if (!user) {
              setActionAfterLogin(page);
              setIsLoginModalOpen(true);
          } else {
              setLocalBookingType(page);
          }
      }
  };

  const handleConfirmBooking = () => {
    if (!selectedTicket || !results?.parsedQuery || !user) return;
    const currentQueryWithPassengers = {
        ...results.parsedQuery,
        adults,
        children
    };
    const newBooking: AnyBookedTicket = {
      ticketType: 'long-distance',
      ticketInfo: selectedTicket,
      queryInfo: currentQueryWithPassengers,
      bookingId: `SR-${Date.now()}`
    };
    setBookedTickets(prev => {
        const userTickets = prev[user.name] || [];
        return {...prev, [user.name]: [newBooking, ...userTickets]};
    });
    setBookingStep('confirmed');
    setIsBookingConfirmed(true);
  };
  
  const handleConfirmLocalBooking = (ticketData: PlatformTicketData | SeasonTicketData) => {
      if (!user) return;
      setBookedTickets(prev => {
          const userTickets = prev[user.name] || [];
          return {...prev, [user.name]: [ticketData, ...userTickets] };
      });
      setLocalBookingType(null); // This will close the modal
  };

  const handleCloseConfirmation = () => {
    setBookingStep(null);
    setIsBookingConfirmed(false);
    setSelectedTicket(null);
  }

  const renderPageContent = () => {
      if (isLoading && currentPage !== 'search') {
          return <div className="mt-20"><Loader /></div>;
      }

      switch (currentPage) {
          case 'search':
              return <HeroSection onSearch={handleSearch} isLoading={isLoading} />;
          case 'profile':
              if (user) {
                  const currentUserTickets = bookedTickets[user.name] || [];
                  return <ProfilePage user={user} bookedTickets={currentUserTickets} onViewTicket={setViewingTicket} onBack={() => setCurrentPage(previousPage)} />;
              }
              // Fallback if trying to access profile while not logged in
              setCurrentPage('search'); 
              return <HeroSection onSearch={handleSearch} isLoading={isLoading} />;
          case 'results':
              return (
                  <div className="container mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">
                      {error && (
                          <div className="bg-red-100 dark:bg-red-900 border-l-4 border-red-500 text-red-700 dark:text-red-200 p-4 rounded-r-lg mb-6" role="alert">
                              <p className="font-bold">Oops!</p>
                              <p>{error}</p>
                          </div>
                      )}
                      {results && results.parsedQuery && (
                          <div className="animate-in fade-in">
                              <ResultsHeader query={results.parsedQuery} adults={adults} children={children} onAdultsChange={setAdults} onChildrenChange={setChildren} />
                              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                  <div className="lg:col-span-2">
                                      <h2 className="text-2xl font-bold mb-4">Your Ticket Options</h2>
                                      {results.ticketOptions && results.ticketOptions.length > 0 ? (
                                          results.ticketOptions.map(ticket => (
                                              <TicketCard 
                                                  key={ticket.id} 
                                                  ticket={ticket} 
                                                  adults={adults}
                                                  children={children}
                                                  onSelect={handleSelectTicket}
                                                  isSelected={selectedTicket?.id === ticket.id}
                                                  onBookNow={handleBookNow}
                                                  isAuthenticated={!!user}
                                              />
                                          ))
                                      ) : (
                                          <p>No tickets found for your query.</p>
                                      )}
                                  </div>
                                  <div className="lg:col-span-1">
                                      {results.smartSuggestions && results.smartSuggestions.length > 0 && (
                                          <div className="space-y-4 sticky top-24">
                                              <h2 className="text-2xl font-bold">Smart Suggestions</h2>
                                              {results.smartSuggestions.map((suggestion, index) => (
                                                  <SuggestionCard key={index} suggestion={suggestion} />
                                              ))}
                                          </div>
                                      )}
                                  </div>
                              </div>
                          </div>
                      )}
                  </div>
              );
          default:
              return null;
      }
  };


  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <Navbar 
          user={user}
          onLoginClick={() => setIsLoginModalOpen(true)}
          onProfileClick={() => {
            setPreviousPage(currentPage);
            setCurrentPage('profile');
          }}
          onLogout={handleLogout}
          onNavigate={handleNavigate}
        />
        <main>
            {renderPageContent()}
        </main>
      </div>

      {bookingStep && selectedTicket && results?.parsedQuery && (
        <BookingModal
            step={bookingStep}
            setStep={setBookingStep}
            onClose={handleCloseConfirmation}
            onConfirm={handleConfirmBooking}
            ticket={selectedTicket}
            adults={adults}
            children={children}
        />
      )}
      {isBookingConfirmed && selectedTicket && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 animate-in fade-in">
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-6 md:p-8 w-full max-w-lg relative transform transition-all animate-in fade-in zoom-in-95">
                   <button onClick={handleCloseConfirmation} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                      <XIcon className="w-6 h-6" />
                  </button>
                  <div className="text-center">
                    <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto" />
                    <h2 className="text-2xl font-bold mt-2 mb-2 text-gray-800 dark:text-white">Booking Confirmed!</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">Your ticket is now available in your profile.</p>
                    <div className="space-y-3 mt-6">
                        <button onClick={() => { handleCloseConfirmation(); setPreviousPage('results'); setCurrentPage('profile'); }} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors">View My Tickets</button>
                        <button onClick={() => { handleCloseConfirmation(); handleReset(); }} className="w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-bold py-2 px-4 rounded-lg transition-colors">Book Another Trip</button>
                    </div>
                  </div>
              </div>
          </div>
      )}
      {isLoginModalOpen && (
        <LoginModal 
            onLogin={handleLogin}
            onClose={() => setIsLoginModalOpen(false)}
        />
      )}
      {localBookingType && (
          <LocalBookingModal 
              type={localBookingType}
              onClose={() => setLocalBookingType(null)}
              onConfirm={handleConfirmLocalBooking}
          />
      )}
      {viewingTicket && (
          <TicketDetailModal ticket={viewingTicket} onClose={() => setViewingTicket(null)} />
      )}
    </>
  );
};

export default App;