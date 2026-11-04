export interface User {
  id: number;
  account_id: string;
  full_name: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  kyc_status: 'unverified' | 'pending' | 'approved' | 'rejected';
  email_verified: boolean | number;
  phone?: string;
  country?: string;
  address?: string;
  transaction_pin?: string;
  recovery_phrase?: string;
  created_at?: string;
}

export interface Wallet {
  id: number;
  user_id: number;
  asset_symbol: string;
  asset_name: string;
  balance: number;
  locked_balance: number;
  deposit_address?: string;
  network?: string;
  current_price_usd?: number;
  usd_value?: number;
}

export interface PortfolioSummary {
  total_portfolio_usd: number;
  wallets: Wallet[];
}

export interface Ticker {
  pair: string;
  symbol: string;
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  timestamp: number;
}

export interface OrderBookEntry {
  price: number;
  amount: number;
  total: number;
}

export interface OrderBook {
  pair: string;
  asks: OrderBookEntry[];
  bids: OrderBookEntry[];
  timestamp: number;
}

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface Trade {
  id: number;
  pair: string;
  side: 'BUY' | 'SELL';
  order_type: 'MARKET' | 'LIMIT';
  price: number;
  amount: number;
  filled_amount?: number;
  total_value: number;
  fee?: number;
  status: 'OPEN' | 'FILLED' | 'CANCELLED' | 'REJECTED';
  created_at: string;
  filled_at?: string;
}

export interface Position {
  pair: string;
  asset: string;
  size: number;
  currentPrice: number;
  totalValue: number;
  unrealizedPnl: number;
  unrealizedPnlPct: number;
}

export interface TradingBot {
  id: number;
  name: string;
  slug: string;
  strategy_type: string;
  description: string;
  roi_min: number;
  roi_max: number;
  win_rate: number;
  min_investment: number;
  risk_level: string;
  default_params?: any;
  icon?: string;
  badge_color?: string;
}

export interface UserBot {
  id: number;
  user_id: number;
  bot_id: number;
  bot_name: string;
  pair: string;
  allocated_capital: number;
  pay_method: string;
  status: 'running' | 'paused' | 'stopped';
  total_profit_loss: number;
  win_trades: number;
  total_trades: number;
  started_at: string;
  strategy_type?: string;
  risk_level?: string;
  badge_color?: string;
}

export interface BacktestResult {
  strategyType: string;
  pair: string;
  initialCapital: number;
  finalEquity: number;
  totalReturnPct: number;
  winRate: number;
  tradesCount: number;
  sharpeRatio: number;
  maxDrawdownPct: number;
  equityCurve: { time: number; equity: number }[];
}

export interface VirtualCard {
  id: number;
  card_holder_name: string;
  card_type: 'Visa' | 'Mastercard';
  card_tier: string;
  status: 'active' | 'frozen' | 'pending';
  balance: number;
  spending_limit: number;
  masked_number: string;
  masked_cvv: string;
  card_number?: string;
  cvv?: string;
  expiry: string;
  created_at: string;
}

export interface Transaction {
  id: number;
  user_id: number;
  type: 'deposit' | 'withdrawal' | 'swap' | 'trade' | 'bot_allocation' | 'bot_profit';
  asset_symbol: string;
  network?: string;
  amount: number;
  amount_usd: number;
  fee?: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  tx_hash?: string;
  destination_address?: string;
  withdrawal_pin?: string;
  notes?: string;
  created_at: string;
  full_name?: string;
  email?: string;
  account_id?: string;
}

export interface AdminMetrics {
  total_users: number;
  active_bots: number;
  simulated_volume_usd: number;
  total_liquidity_usd: number;
  total_deposits_usd: number;
  total_withdrawals_usd: number;
}

export interface GrowthPlan {
  id: number;
  name: string;
  description: string;
  initial_amount: number;
  target_amount: number;
  duration_days: number;
  duration_seconds: number;
  roi_percentage: number;
  net_profit?: number;
  risk_level: string;
  badge: string;
  icon?: string;
  color?: string;
  is_active: number;
}

export interface PlanCountdown {
  remaining_seconds: number;
  formatted: string;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export interface UserSubscription {
  id: number;
  user_id: number;
  plan_id: number;
  plan_name: string;
  invested_amount: number;
  target_amount: number;
  current_value: number;
  current_profit: number;
  profit_percent?: number;
  target_profit_percent?: number;
  progress_percent: number;
  duration_days: number;
  duration_seconds: number;
  start_date: string;
  end_date: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  payout_credited: number;
  last_tick_at?: string;
  created_at: string;
  user_name?: string;
  user_email?: string;
  countdown: PlanCountdown;
}

export interface PlanCandleTick {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}
