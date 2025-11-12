import React, { useState, useEffect } from 'react';
import { XIcon, TicketIcon, CreditCardIcon, CheckCircleIcon } from './icons';
import type { PlatformTicketData, SeasonTicketData } from '../types';

type ModalType = 'platform' | 'season';

interface LocalBookingModalProps {
  type: ModalType;
  onClose: () => void;
  onConfirm: (ticketData: PlatformTicketData | SeasonTicketData) => void;
}

const LocalBookingModal: React.FC<LocalBookingModalProps> = ({ type, onClose, onConfirm }) => {
  const [step, setStep] = useState<'form' | 'confirm'>('form');

  // State for randomized base prices
  const [platformBasePrice, setPlatformBasePrice] = useState(10);
  const [seasonDailyRate, setSeasonDailyRate] = useState(5);

  useEffect(() => {
    // Set random base prices when the modal opens
    setPlatformBasePrice(Math.random() < 0.5 ? 10 : 20);
    setSeasonDailyRate(Math.floor(Math.random() * 3) + 4); // Random daily rate: 4, 5, or 6
  }, []);

  // Form state
  const [stationName, setStationName] = useState('');
  const [platformNumber, setPlatformNumber] = useState('');
  const [peopleCount, setPeopleCount] = useState(1);
  const [fromStation, setFromStation] = useState('');
  const [toStation, setToStation] = useState('');
  const [duration, setDuration] = useState(30);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('confirm');
    // We will call onConfirm AFTER the "payment" is successful on the next screen
  };
  
  const price = type === 'platform' ? (peopleCount * platformBasePrice) : (duration * peopleCount * seasonDailyRate);

  const handlePayment = () => {
      if (type === 'platform') {
          const ticketData: PlatformTicketData = {
              ticketType: 'platform',
              bookingId: `PLT-${Date.now()}`,
              stationName,
              platformNumber,
              peopleCount,
              price: price,
              bookingDate: new Date().toISOString(),
          };
          onConfirm(ticketData);
      } else { // season ticket
          const bookingDate = new Date();
          const expiryDate = new Date(bookingDate);
          expiryDate.setDate(bookingDate.getDate() + duration);
          
          const ticketData: SeasonTicketData = {
              ticketType: 'season',
              bookingId: `SEA-${Date.now()}`,
              fromStation,
              toStation,
              peopleCount,
              duration,
              price: price,
              bookingDate: bookingDate.toISOString(),
              expiryDate: expiryDate.toISOString(),
          };
          onConfirm(ticketData);
      }
  }

  const renderForm = () => {
    if (type === 'platform') {
      return (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="station-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Station Name</label>
            <input type="text" id="station-name" value={stationName} onChange={e => setStationName(e.target.value)} placeholder="e.g., Grand Central" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white" required />
          </div>
          <div>
            <label htmlFor="platform-number" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Platform Number</label>
            <input type="text" id="platform-number" value={platformNumber} onChange={e => setPlatformNumber(e.target.value)} placeholder="e.g., 5A" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white" required />
          </div>
          <div>
            <label htmlFor="people-count" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Number of People</label>
            <input type="number" id="people-count" min="1" value={peopleCount} onChange={e => setPeopleCount(Math.max(1, parseInt(e.target.value) || 1))} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white" required />
          </div>
          <button type="submit" className="w-full mt-6 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
            <CreditCardIcon className="w-5 h-5" /> Proceed to Pay ₹{price.toFixed(2)}
          </button>
        </form>
      );
    }

    if (type === 'season') {
      return (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <label htmlFor="from-station" className="block text-sm font-medium text-gray-700 dark:text-gray-300">From Station</label>
              <input type="text" id="from-station" value={fromStation} onChange={e => setFromStation(e.target.value)} placeholder="e.g., Downtown Central" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white" required />
            </div>
            <div className="flex-1">
              <label htmlFor="to-station" className="block text-sm font-medium text-gray-700 dark:text-gray-300">To Station</label>
              <input type="text" id="to-station" value={toStation} onChange={e => setToStation(e.target.value)} placeholder="e.g., North Junction" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white" required />
            </div>
          </div>
          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Duration (days)</label>
            <input type="number" id="duration" min="7" value={duration} onChange={e => setDuration(Math.max(7, parseInt(e.target.value) || 7))} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white" required />
          </div>
          <div>
            <label htmlFor="people-count-season" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Number of People</label>
            <input type="number" id="people-count-season" min="1" value={peopleCount} onChange={e => setPeopleCount(Math.max(1, parseInt(e.target.value) || 1))} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white" required />
          </div>
          <button type="submit" className="w-full mt-6 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
            <CreditCardIcon className="w-5 h-5" /> Proceed to Pay ₹{price.toFixed(2)}
          </button>
        </form>
      );
    }
    return null;
  }

  const renderConfirmation = () => (
    <div className="text-center">
      <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto" />
      <h2 className="text-2xl font-bold mt-2 mb-2 text-gray-800 dark:text-white">Payment Successful!</h2>
      <p className="text-gray-600 dark:text-gray-300 mb-4">Your {type === 'platform' ? 'Platform' : 'Season'} Ticket has been added to your profile.</p>
      <button onClick={handlePayment} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors">Done</button>
    </div>
  );

  return (
    <div onClick={onClose} className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 animate-in fade-in">
      <div onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-6 md:p-8 w-full max-w-lg relative transform transition-all animate-in fade-in zoom-in-95">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
          <XIcon className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-3 mb-6">
          <TicketIcon className="w-8 h-8 text-blue-500" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            {type === 'platform' ? 'Book Platform Ticket' : 'Book Season Ticket'}
          </h2>
        </div>
        
        {step === 'form' ? renderForm() : renderConfirmation()}
        
      </div>
    </div>
  );
};
export default LocalBookingModal;