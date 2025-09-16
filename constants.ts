import type { Stock, Crypto } from './types';

export const CATEGORIES = {
  expense: [
    'Groceries',
    'Utilities',
    'Transport',
    'Rent/Mortgage',
    'Entertainment',
    'Dining Out',
    'Shopping',
    'Health',
    'Education',
    'Other',
  ],
  income: ['Salary', 'Freelance', 'Investment', 'Gift', 'Other'],
};

export const SUPPORTED_CURRENCIES: { [key: string]: string } = {
  'USD': 'United States Dollar',
  'EUR': 'Euro',
  'JPY': 'Japanese Yen',
  'GBP': 'British Pound',
  'CAD': 'Canadian Dollar',
  'AUD': 'Australian Dollar',
  'INR': 'Indian Rupee',
};

export const TOP_CRYPTO: Crypto[] = [
    { symbol: 'BTC', name: 'Bitcoin', change: 5.72 },
    { symbol: 'ETH', name: 'Ethereum', change: 4.15 },
    { symbol: 'SOL', name: 'Solana', change: -2.30 },
    { symbol: 'DOGE', name: 'Dogecoin', change: 12.88 },
];

export const TOP_STOCKS: { [key: string]: Stock[] } = {
    'USD': [
        { symbol: 'AAPL', name: 'Apple Inc.', change: 1.25 },
        { symbol: 'MSFT', name: 'Microsoft Corp.', change: -0.75 },
        { symbol: 'GOOGL', name: 'Alphabet Inc.', change: 2.10 },
        { symbol: 'AMZN', name: 'Amazon.com, Inc.', change: 0.88 },
        { symbol: 'TSLA', name: 'Tesla, Inc.', change: -3.45 },
    ],
    'EUR': [
        { symbol: 'ASML', name: 'ASML Holding', change: 1.95 },
        { symbol: 'LVMH', name: 'LVMH Moët Hennessy', change: 0.60 },
        { symbol: 'SAP', name: 'SAP SE', change: -0.25 },
        { symbol: 'SIE', name: 'Siemens AG', change: 1.15 },
    ],
    'JPY': [
        { symbol: '7203.T', name: 'Toyota Motor Corp', change: 0.90 },
        { symbol: '6758.T', name: 'Sony Group Corp', change: 1.50 },
        { symbol: '9984.T', name: 'SoftBank Group Corp', change: -1.20 },
    ],
    'GBP': [
        { symbol: 'AZN.L', name: 'AstraZeneca PLC', change: 2.30 },
        { symbol: 'SHEL.L', name: 'Shell PLC', change: 0.45 },
        { symbol: 'HSBA.L', name: 'HSBC Holdings PLC', change: -0.85 },
    ],
    'CAD': [
        { symbol: 'RY.TO', name: 'Royal Bank of Canada', change: 0.70 },
        { symbol: 'SHOP.TO', name: 'Shopify Inc.', change: 3.10 },
        { symbol: 'ENB.TO', name: 'Enbridge Inc.', change: -0.50 },
    ],
    'AUD': [
        { symbol: 'BHP.AX', name: 'BHP Group Limited', change: 1.20 },
        { symbol: 'CBA.AX', name: 'Commonwealth Bank', change: 0.80 },
        { symbol: 'WES.AX', name: 'Wesfarmers Limited', change: -0.30 },
    ],
    'INR': [
        { symbol: 'RELIANCE.NS', name: 'Reliance Industries', change: 2.75 },
        { symbol: 'TCS.NS', name: 'Tata Consultancy', change: 1.90 },
        { symbol: 'HDFCBANK.NS', name: 'HDFC Bank', change: -0.65 },
    ],
};
