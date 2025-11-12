
import React from 'react';

const messages = [
  "Plotting the best route...",
  "Consulting the train schedules...",
  "Finding the most scenic journey...",
  "Packing your virtual bags...",
  "Brewing some coffee for the trip...",
  "Checking for the fastest trains...",
];

const Loader = () => {
  const [message, setMessage] = React.useState(messages[0]);

  React.useEffect(() => {
    const intervalId = setInterval(() => {
      setMessage(messages[Math.floor(Math.random() * messages.length)]);
    }, 2000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center text-center p-8">
      <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-blue-500 dark:border-blue-400"></div>
      <p className="mt-4 text-lg font-medium text-gray-700 dark:text-gray-300">{message}</p>
    </div>
  );
};

export default Loader;
