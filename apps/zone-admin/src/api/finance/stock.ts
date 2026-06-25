import { requestClient } from '#/api/request';

// ============================================
// 股票详情：全部数据接口
// ============================================

/** 股票基本信息 */
export interface StockInfo {
  id: number;
  stockCode: string;
  stockName: string;
  market: string;
  listingDate: string;
  totalShares: number;
  circulatingShares: number;
  industryCode: string;
  status: number;
}

/** K线数据 */
export interface StockDaily {
  stockCode: string;
  tradeDate: string;
  open: number;
  high: number;
  low: number;
  close: number;
  preClose: number;
  volume: number;
  amount: number;
  changePct: number;
  turnoverRate: number;
}

/** 估值指标 */
export interface StockValuation {
  tradeDate: string;
  peTtm: number;
  peStatic: number;
  peDynamic: number;
  pb: number;
  ps: number;
  totalMv: number;
  circulatingMv: number;
  divYield: number;
  pePercentile: number;
  pbPercentile: number;
}

/** 财报数据 */
export interface StockAnnualReport {
  reportYear: number;
  reportType: string;
  revenue: number;
  revenueYoy: number;
  netProfit: number;
  netProfitYoy: number;
  eps: number;
  bvps: number;
  roe: number;
  grossMargin: number;
  netMargin: number;
  debtRatio: number;
}

/** 产品/业务 */
export interface StockProduct {
  productName: string;
  productType: string;
  revenueRatio: number;
  grossMargin: number;
  description: string;
}

/** 产业链 */
export interface StockIndustryChain {
  relationType: string;
  relatedStockCode: string;
  relatedCompany: string;
  relationDesc: string;
}

/** 股东 */
export interface StockShareholder {
  holderName: string;
  holderType: string;
  holdShares: number;
  holdPct: number;
  changeShares: number;
  reportDate: string;
}

/** 动态事件 */
export interface StockEvent {
  eventType: string;
  eventDate: string;
  eventTitle: string;
  eventContent: string;
  extData: string;
  source: string;
}

/** 技术指标 */
export interface StockIndicator {
  tradeDate: string;
  ma5: number;
  ma10: number;
  ma20: number;
  ma60: number;
  macdDif: number;
  macdDea: number;
  macdHist: number;
  kdjK: number;
  kdjD: number;
  kdjJ: number;
  rsi6: number;
  rsi12: number;
  rsi24: number;
  bollUpper: number;
  bollMid: number;
  bollLower: number;
}

// ============================================
// API 接口
// ============================================

/** 按股票代码查基本信息 */
export function getStockInfoApi(stockCode: string) {
  return requestClient.get<StockInfo>(`/finance/stock/code/${stockCode}`);
}

/** K线数据 */
export function getStockDailyApi(stockCode: string, start?: string, end?: string) {
  return requestClient.get<StockDaily[]>(`/finance/stock/${stockCode}/daily`, {
    params: { start, end },
  });
}

/** 最新估值 */
export function getStockValuationApi(stockCode: string) {
  return requestClient.get<StockValuation>(`/finance/stock/${stockCode}/valuation`);
}

/** 历史估值 */
export function getStockValuationHistoryApi(stockCode: string, start?: string, end?: string) {
  return requestClient.get<StockValuation[]>(`/finance/stock/${stockCode}/valuation/history`, {
    params: { start, end },
  });
}

/** 财报 */
export function getStockReportApi(stockCode: string) {
  return requestClient.get<StockAnnualReport[]>(`/finance/stock/${stockCode}/report`);
}

/** 产品/业务 */
export function getStockProductApi(stockCode: string) {
  return requestClient.get<StockProduct[]>(`/finance/stock/${stockCode}/product`);
}

/** 产业链 */
export function getStockChainApi(stockCode: string) {
  return requestClient.get<StockIndustryChain[]>(`/finance/stock/${stockCode}/chain`);
}

/** 股东 */
export function getStockShareholderApi(stockCode: string) {
  return requestClient.get<StockShareholder[]>(`/finance/stock/${stockCode}/shareholder`);
}

/** 动态事件 */
export function getStockEventApi(stockCode: string) {
  return requestClient.get<StockEvent[]>(`/finance/stock/${stockCode}/event`);
}

/** 技术指标 */
export function getStockIndicatorApi(stockCode: string, start?: string, end?: string) {
  return requestClient.get<StockIndicator[]>(`/finance/stock/${stockCode}/indicator`, {
    params: { start, end },
  });
}
