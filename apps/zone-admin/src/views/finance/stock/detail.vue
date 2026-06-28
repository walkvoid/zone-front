<script lang="ts" setup>
import type {
  StockAnnualReport,
  StockEvent,
  StockIndustryChain,
  StockInfo,
  StockProduct,
  StockShareholder,
  StockValuation,
} from '#/api/finance/stock';

import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { Page } from '@vben/common-ui';

import {
  Card,
  Col,
  Descriptions,
  Empty,
  message,
  Row,
  Spin,
  Statistic,
  Table,
  Tabs,
  Tag,
  Timeline,
  TimelineItem,
  Typography,
} from 'ant-design-vue';

import {
  getStockChainApi,
  getStockEventApi,
  getStockInfoApi,
  getStockProductApi,
  getStockReportApi,
  getStockShareholderApi,
  getStockValuationApi,
} from '#/api/finance/stock';

const { Title, Text } = Typography;

const route = useRoute();
const router = useRouter();
const stockCode = route.params.stockCode as string;

const loading = ref(true);
const stockInfo = ref<null | StockInfo>(null);
const valuation = ref<null | StockValuation>(null);
const reports = ref<StockAnnualReport[]>([]);
const products = ref<StockProduct[]>([]);
const chains = ref<StockIndustryChain[]>([]);
const shareholders = ref<StockShareholder[]>([]);
const events = ref<StockEvent[]>([]);

// 关系类型标签
const relationTypeMap: Record<string, { color: string; label: string }> = {
  UPSTREAM: { color: 'blue', label: '上游' },
  DOWNSTREAM: { color: 'green', label: '下游' },
  COMPETITOR: { color: 'orange', label: '同行' },
  SUBSTITUTE: { color: 'red', label: '替代' },
};

// 事件类型标签
const eventTypeMap: Record<string, { color: string; label: string }> = {
  SHAREHOLDER_ADD: { color: 'green', label: '增持' },
  SHAREHOLDER_REDUCE: { color: 'red', label: '减持' },
  INDEX_IN: { color: 'blue', label: '调入指数' },
  INDEX_OUT: { color: 'orange', label: '调出指数' },
  ST_IN: { color: 'red', label: '列入ST' },
  ST_OUT: { color: 'green', label: '撤销ST' },
  DELIST: { color: 'red', label: '退市' },
  RELIST: { color: 'blue', label: '重新上市' },
  DIVIDEND: { color: 'purple', label: '分红' },
};

// 产品类型标签
const productTypeMap: Record<string, string> = {
  MAIN: '主营',
  NEW: '新业务',
  OTHER: '其他',
};

// 股东类型标签
const holderTypeMap: Record<string, string> = {
  PERSON: '个人',
  INSTITUTION: '机构',
  FUND: '基金',
  OVERSEAS: '外资',
};

// 报告类型标签
const reportTypeMap: Record<string, string> = {
  ANNUAL: '年报',
  SEMI: '半年报',
  Q1: '一季报',
  Q3: '三季报',
};

const tabKey = ref('overview');

async function loadData() {
  loading.value = true;
  try {
    const [info, val, rep, prod, chain, holder, evt] = await Promise.all([
      getStockInfoApi(stockCode),
      getStockValuationApi(stockCode).catch(() => null),
      getStockReportApi(stockCode).catch(() => []),
      getStockProductApi(stockCode).catch(() => []),
      getStockChainApi(stockCode).catch(() => []),
      getStockShareholderApi(stockCode).catch(() => []),
      getStockEventApi(stockCode).catch(() => []),
    ]);
    stockInfo.value = info;
    valuation.value = val;
    reports.value = rep || [];
    products.value = prod || [];
    chains.value = chain || [];
    shareholders.value = holder || [];
    events.value = evt || [];
  } catch {
    message.error('加载股票数据失败');
  } finally {
    loading.value = false;
  }
}

function formatWan(v: number | undefined) {
  if (v === undefined) return '-';
  return `${(v / 10_000).toFixed(2)} 万`;
}

function formatYi(v: number | undefined) {
  if (v === undefined) return '-';
  return `${(v / 100_000_000).toFixed(2)} 亿`;
}

function formatPct(v: number | undefined) {
  if (v === undefined) return '-';
  return `${v.toFixed(2)}%`;
}

function formatNum(v: number | undefined) {
  if (v === undefined) return '-';
  return v.toFixed(2);
}

function goBack() {
  router.back();
}

function getRelationColor(type: string | undefined) {
  if (!type) return undefined;
  return relationTypeMap[type]?.color;
}

function getRelationLabel(type: string | undefined) {
  if (!type) return '-';
  return relationTypeMap[type]?.label || type;
}

onMounted(() => {
  loadData();
});
</script>

<template>
  <Page>
    <Spin :spinning="loading">
      <template v-if="stockInfo">
        <!-- 头部 -->
        <div class="mb-4 flex items-center gap-3">
          <a
            @click="goBack"
            class="cursor-pointer text-gray-400 hover:text-gray-600"
          >
            ← 返回
          </a>
          <Title :level="3" class="!mb-0">
            {{ stockInfo.stockName }}
            <Text type="secondary" class="text-lg font-normal">
              {{ stockInfo.stockCode }}
            </Text>
          </Title>
          <Tag :color="stockInfo.market === 'SH' ? 'red' : 'green'">
            {{
              stockInfo.market === 'SH'
                ? '沪市'
                : stockInfo.market === 'SZ'
                  ? '深市'
                  : stockInfo.market
            }}
          </Tag>
          <Tag v-if="stockInfo.status === 2" color="red">ST</Tag>
        </div>

        <Tabs v-model:active-key="tabKey">
          <!-- 概览 -->
          <Tabs.TabPane key="overview" tab="概览">
            <Row :gutter="[16, 16]">
              <!-- 估值指标 -->
              <Col :span="24">
                <Card title="估值指标" size="small">
                  <Row :gutter="16" v-if="valuation">
                    <Col :span="4">
                      <Statistic
                        title="PE(TTM)"
                        :value="formatNum(valuation.peTtm)"
                      />
                    </Col>
                    <Col :span="4">
                      <Statistic
                        title="PE(静态)"
                        :value="formatNum(valuation.peStatic)"
                      />
                    </Col>
                    <Col :span="4">
                      <Statistic title="PB" :value="formatNum(valuation.pb)" />
                    </Col>
                    <Col :span="4">
                      <Statistic title="PS" :value="formatNum(valuation.ps)" />
                    </Col>
                    <Col :span="4">
                      <Statistic
                        title="总市值(亿)"
                        :value="formatNum(valuation.totalMv)"
                      />
                    </Col>
                    <Col :span="4">
                      <Statistic
                        title="股息率"
                        :value="formatPct(valuation.divYield)"
                      />
                    </Col>
                    <Col :span="4" class="mt-3">
                      <Statistic
                        title="PE分位"
                        :value="formatPct(valuation.pePercentile)"
                      />
                    </Col>
                    <Col :span="4" class="mt-3">
                      <Statistic
                        title="PB分位"
                        :value="formatPct(valuation.pbPercentile)"
                      />
                    </Col>
                  </Row>
                  <Empty v-else description="暂无估值数据" />
                </Card>
              </Col>

              <!-- 基本信息 -->
              <Col :span="12">
                <Card title="基本信息" size="small">
                  <Descriptions :column="1" size="small">
                    <Descriptions.Item label="上市日期">
                      {{ stockInfo.listingDate || '-' }}
                    </Descriptions.Item>
                    <Descriptions.Item label="总股本">
                      {{ formatYi(stockInfo.totalShares) }}
                    </Descriptions.Item>
                    <Descriptions.Item label="流通股本">
                      {{ formatYi(stockInfo.circulatingShares) }}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>

              <!-- 最新财报 -->
              <Col :span="12">
                <Card title="最新财报" size="small">
                  <template v-if="reports.length > 0">
                    <Descriptions :column="1" size="small">
                      <Descriptions.Item label="报告期">
                        {{ reports[0]?.reportYear }}
                        {{
                          reports[0]?.reportType
                            ? reportTypeMap[reports[0].reportType] ||
                              reports[0].reportType
                            : ''
                        }}
                      </Descriptions.Item>
                      <Descriptions.Item label="营收">
                        {{ formatYi(reports[0]?.revenue) }}
                      </Descriptions.Item>
                      <Descriptions.Item label="净利润">
                        {{ formatYi(reports[0]?.netProfit) }}
                      </Descriptions.Item>
                      <Descriptions.Item label="ROE">
                        {{ formatPct(reports[0]?.roe) }}
                      </Descriptions.Item>
                      <Descriptions.Item label="毛利率">
                        {{ formatPct(reports[0]?.grossMargin) }}
                      </Descriptions.Item>
                    </Descriptions>
                  </template>
                  <Empty v-else description="暂无财报数据" />
                </Card>
              </Col>
            </Row>
          </Tabs.TabPane>

          <!-- 财务指标 -->
          <Tabs.TabPane key="finance" tab="财务指标">
            <Card size="small">
              <Table
                v-if="reports.length > 0"
                :data-source="reports"
                :pagination="false"
                size="small"
                row-key="reportYear"
              >
                <Table.Column
                  title="报告期"
                  data-index="reportYear"
                  :width="80"
                >
                  <template #default="{ record }">
                    {{ record.reportYear
                    }}{{ reportTypeMap[record.reportType] || '' }}
                  </template>
                </Table.Column>
                <Table.Column title="营收(亿)" :width="120">
                  <template #default="{ record }">
                    {{ formatYi(record.revenue) }}
                  </template>
                </Table.Column>
                <Table.Column title="净利润(亿)" :width="120">
                  <template #default="{ record }">
                    {{ formatYi(record.netProfit) }}
                  </template>
                </Table.Column>
                <Table.Column title="EPS" :width="80">
                  <template #default="{ record }">
                    {{ formatNum(record.eps) }}
                  </template>
                </Table.Column>
                <Table.Column title="ROE" :width="80">
                  <template #default="{ record }">
                    {{ formatPct(record.roe) }}
                  </template>
                </Table.Column>
                <Table.Column title="毛利率" :width="80">
                  <template #default="{ record }">
                    {{ formatPct(record.grossMargin) }}
                  </template>
                </Table.Column>
                <Table.Column title="净利率" :width="80">
                  <template #default="{ record }">
                    {{ formatPct(record.netMargin) }}
                  </template>
                </Table.Column>
                <Table.Column title="资产负债率" :width="100">
                  <template #default="{ record }">
                    {{ formatPct(record.debtRatio) }}
                  </template>
                </Table.Column>
                <Table.Column title="营收同比" :width="80">
                  <template #default="{ record }">
                    {{ formatPct(record.revenueYoy) }}
                  </template>
                </Table.Column>
                <Table.Column title="净利同比" :width="80">
                  <template #default="{ record }">
                    {{ formatPct(record.netProfitYoy) }}
                  </template>
                </Table.Column>
              </Table>
              <Empty v-else description="暂无财务数据" />
            </Card>
          </Tabs.TabPane>

          <!-- 主营产品 -->
          <Tabs.TabPane key="product" tab="主营产品">
            <Card size="small">
              <Table
                v-if="products.length > 0"
                :data-source="products"
                :pagination="false"
                size="small"
                row-key="productName"
              >
                <Table.Column
                  title="产品/业务"
                  data-index="productName"
                  :width="200"
                />
                <Table.Column title="类型" data-index="productType" :width="80">
                  <template #default="{ record }">
                    <Tag>
                      {{
                        productTypeMap[record.productType] || record.productType
                      }}
                    </Tag>
                  </template>
                </Table.Column>
                <Table.Column title="营收占比" :width="100">
                  <template #default="{ record }">
                    {{ formatPct(record.revenueRatio) }}
                  </template>
                </Table.Column>
                <Table.Column title="毛利率" :width="80">
                  <template #default="{ record }">
                    {{ formatPct(record.grossMargin) }}
                  </template>
                </Table.Column>
                <Table.Column title="描述" data-index="description" />
              </Table>
              <Empty v-else description="暂无产品数据" />
            </Card>
          </Tabs.TabPane>

          <!-- 行业地位 -->
          <Tabs.TabPane key="industry" tab="行业地位">
            <Row :gutter="[16, 16]">
              <Col :span="24">
                <Card title="产业链关系" size="small">
                  <Table
                    v-if="chains.length > 0"
                    :data-source="chains"
                    :pagination="false"
                    size="small"
                    row-key="id"
                  >
                    <Table.Column
                      title="关系"
                      data-index="relationType"
                      :width="80"
                    >
                      <template #default="{ record }">
                        <Tag :color="getRelationColor(record.relationType)">
                          {{ getRelationLabel(record.relationType) }}
                        </Tag>
                      </template>
                    </Table.Column>
                    <Table.Column
                      title="关联公司"
                      data-index="relatedCompany"
                      :width="200"
                    />
                    <Table.Column
                      title="股票代码"
                      data-index="relatedStockCode"
                      :width="100"
                    >
                      <template #default="{ record }">
                        <a
                          v-if="record.relatedStockCode"
                          @click="
                            router.push(
                              `/finance/stock/${record.relatedStockCode}`,
                            )
                          "
                        >
                          {{ record.relatedStockCode }}
                        </a>
                        <span v-else>-</span>
                      </template>
                    </Table.Column>
                    <Table.Column title="描述" data-index="relationDesc" />
                  </Table>
                  <Empty v-else description="暂无产业链数据" />
                </Card>
              </Col>
            </Row>
          </Tabs.TabPane>

          <!-- 股东 -->
          <Tabs.TabPane key="shareholder" tab="股东信息">
            <Card size="small">
              <Table
                v-if="shareholders.length > 0"
                :data-source="shareholders"
                :pagination="false"
                size="small"
                row-key="id"
              >
                <Table.Column
                  title="股东名称"
                  data-index="holderName"
                  :width="250"
                />
                <Table.Column title="类型" data-index="holderType" :width="80">
                  <template #default="{ record }">
                    <Tag>
                      {{
                        holderTypeMap[record.holderType] || record.holderType
                      }}
                    </Tag>
                  </template>
                </Table.Column>
                <Table.Column title="持股数(万)" :width="130">
                  <template #default="{ record }">
                    {{ formatWan(record.holdShares) }}
                  </template>
                </Table.Column>
                <Table.Column title="持股比例" :width="80">
                  <template #default="{ record }">
                    {{ formatPct(record.holdPct) }}
                  </template>
                </Table.Column>
                <Table.Column title="变动(万)" :width="130">
                  <template #default="{ record }">
                    <span
                      :class="
                        (record.changeShares ?? 0) > 0
                          ? 'text-green-600'
                          : (record.changeShares ?? 0) < 0
                            ? 'text-red-600'
                            : ''
                      "
                    >
                      {{
                        record.changeShares != null
                          ? formatWan(record.changeShares)
                          : '-'
                      }}
                    </span>
                  </template>
                </Table.Column>
                <Table.Column
                  title="报告期"
                  data-index="reportDate"
                  :width="110"
                />
              </Table>
              <Empty v-else description="暂无股东数据" />
            </Card>
          </Tabs.TabPane>

          <!-- 动态事件 -->
          <Tabs.TabPane key="event" tab="动态事件">
            <Card size="small">
              <Timeline v-if="events.length > 0">
                <TimelineItem
                  v-for="evt in events"
                  :key="evt.eventDate + evt.eventType"
                >
                  <div class="flex items-center gap-2">
                    <Tag
                      :color="eventTypeMap[evt.eventType]?.color || 'default'"
                    >
                      {{ eventTypeMap[evt.eventType]?.label || evt.eventType }}
                    </Tag>
                    <Text strong>{{ evt.eventTitle }}</Text>
                    <Text type="secondary">{{ evt.eventDate }}</Text>
                  </div>
                  <div v-if="evt.eventContent" class="mt-1 text-gray-500">
                    {{ evt.eventContent }}
                  </div>
                  <div v-if="evt.source" class="text-gray-400 text-xs mt-1">
                    来源：{{ evt.source }}
                  </div>
                </TimelineItem>
              </Timeline>
              <Empty v-else description="暂无动态事件" />
            </Card>
          </Tabs.TabPane>
        </Tabs>
      </template>

      <Empty v-else description="未找到股票信息" />
    </Spin>
  </Page>
</template>
