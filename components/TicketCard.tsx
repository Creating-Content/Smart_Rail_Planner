import React from 'react';
import type { TicketOption } from '../types';
import { TrainIcon, ArrowRightIcon } from './icons';

interface TicketCardProps {
  ticket: TicketOption;
  adults: number;
  children: number;
  onSelect: (ticket: TicketOption) => void;
  isSelected: boolean;
  onBookNow: () => void;
  isAuthenticated: boolean;
}

const TicketCard: React.FC<TicketCardProps> = ({ ticket, adults, children, onSelect, isSelected, onBookNow, isAuthenticated }) => {
  const classColors = {
    Economy: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    Business: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    First: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  };
  
  const totalPassengers = adults + children;
  const totalPrice = (ticket.price * totalPassengers).toFixed(2);

  return (
    <div 
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg mb-4 border-2 transition-all duration-300 ease-in-out hover:shadow-xl hover:border-blue-500 ${isSelected ? 'border-blue-500 ring-2 ring-blue-500' : 'border-transparent'}`}
      onClick={() => onSelect(ticket)}
    >
      <div className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div className="flex-1 mb-4 sm:mb-0">
            <div className="flex items-center mb-2">
              <TrainIcon className="w-6 h-6 text-gray-500 dark:text-gray-400 mr-3" />
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">{ticket.trainName}</h3>
              <span className={`ml-3 px-2 py-1 text-xs font-semibold rounded-full ${classColors[ticket.class]}`}>
                {ticket.class}
              </span>
            </div>
            <div className="flex items-center text-gray-600 dark:text-gray-300">
              <div className="text-center">
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{ticket.departureTime}</p>
              </div>
              <ArrowRightIcon className="w-8 h-8 mx-4 text-gray-400" />
              <div className="text-center">
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{ticket.arrivalTime}</p>
              </div>
              <p className="ml-6 text-sm text-gray-500 dark:text-gray-400">({ticket.duration})</p>
            </div>
          </div>

          <div className="flex flex-col items-start sm:items-end w-full sm:w-auto">
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">₹{ticket.price.toFixed(2)}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">per passenger</p>
          </div>
        </div>
      </div>
      {isSelected && (
        <div className="px-6 pb-6 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 animate-in fade-in duration-300">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">Booking Summary</h3>
          <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
            <div className="flex justify-between">
              <span>{adults} Adult(s)</span>
              <span>₹{(ticket.price * adults).toFixed(2)}</span>
            </div>
            {children > 0 && (
               <div className="flex justify-between">
                <span>{children} Child(ren)</span>
                <span>₹{(ticket.price * children).toFixed(2)}</span>
              </div>
            )}
            <div className="border-t border-dashed my-2 dark:border-gray-600"></div>
            <div className="flex justify-between font-bold text-base text-gray-800 dark:text-white">
              <span>Total Price</span>
              <span>₹{totalPrice}</span>
            </div>
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation(); // Prevent the card's onClick from firing and deselecting
              onBookNow();
            }}
            className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isAuthenticated ? 'Proceed to Book' : 'Sign In to Book'}
          </button>
        </div>
      )}
    </div>
  );
};

export default TicketCard;