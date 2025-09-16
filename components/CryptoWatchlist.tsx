import React from 'react';
import type { Crypto } from '../types';
import { TOP_CRYPTO } from '../constants';

const MoverItem: React.FC<{ item: Crypto }> = ({ item }) => (
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

const CryptoWatchlist: React.FC = () => {
  const cryptos: Crypto[] = TOP_CRYPTO;

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Crypto Watchlist</h3>
      
       {cryptos && cryptos.length > 0 ? (
        <ul className="space-y-2">
          {cryptos.map((crypto) => (
            <MoverItem key={crypto.symbol} item={crypto} />
          ))}
        </ul>
      ) : (
        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
          No cryptocurrency data available.
        </div>
      )}
    </div>
  );
};

export default CryptoWatchlist;