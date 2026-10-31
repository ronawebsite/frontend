export interface StockTicker {
  pair: string;
  symbol: string;
  name: string;
  market: string;
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  marketCap?: string;
  peRatio?: number;
  timestamp: number;
}

export interface StockHolding {
  symbol: string;
  name: string;
  shares: number;
  availableShares: number;
  currentPrice: number;
  change24h: number;
  totalValue: number;
}

export interface StockPortfolio {
  total_equity_usd: number;
  stock_equity_usd: number;
  cash_usd: number;
  available_cash: number;
  holdings: StockHolding[];
}

export interface StockBotTemplate {
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
  icon: string;
  badge_color: string;
  default_pair: string;
}

export interface StockPosition {
  pair: string;
  symbol: string;
  name: string;
  shares: number;
  currentPrice: number;
  totalValue: number;
  unrealizedPnl: number;
  unrealizedPnlPct: number;
}
