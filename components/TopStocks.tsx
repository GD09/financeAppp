import React from 'react';
import type { Stock } from '../types';
import { TOP_STOCKS } from '../constants';

interface TopStocksProps {
  currency: string;
}

const MoverItem: React.FC<{ item: Stock }> = ({ item }) => (
    <li className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors duration-200">
        <div>
            <p className="font-bold text-gray-900 dark:text-white">{item.symbol}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[150px]">{item.name}</p>
        </div>
        <div
            className={`px-3 py-1 text-sm font-semibold rounded-full ${
                item.change >= 0 ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300'
            }`}
        >
            {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}%
        </div>
    </li>
);


const TopStocks: React.FC<TopStocksProps> = ({ currency }) => {
  const stocks: Stock[] | undefined = TOP_STOCKS[currency];

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Top Stock Movers</h3>
      
      {stocks && stocks.length > 0 ? (
        <ul className="space-y-2">
          {stocks.map((stock) => (
            <MoverItem key={stock.symbol} item={stock} />
          ))}
        </ul>
      ) : (
        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
          No stock data available for {currency}.
        </div>
      )}
    </div>
  );
};

export default TopStocks;