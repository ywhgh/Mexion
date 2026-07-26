<template>
  <div class="mexion-dashboard-page">
    <!-- HERO -->
    <section class="hero fade-in fade-in--1">
      <div class="hero__intro">{{ todayLabel }}</div>
      <h1 class="hero__hello">{{ greeting }}</h1>
      <p class="hero__sub">{{ subtitle }}</p>

      <div class="hero__stats">
        <div class="hstat">
          <span class="hstat__label">{{ labels.calls }}</span>
          <span class="hstat__val">{{ formatInteger(safeStats.today_requests) }}</span>
          <svg class="hstat__spark" viewBox="0 0 60 16" preserveAspectRatio="none" aria-hidden="true">
            <polyline :points="heroSpark.calls" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" opacity="1" />
          </svg>
          <span class="hstat__hint">{{ labels.total }} {{ formatInteger(safeStats.total_requests) }}</span>
        </div>
        <div class="hstat">
          <span class="hstat__label">{{ labels.tokens }}</span>
          <span class="hstat__val">{{ formatInteger(safeStats.today_tokens) }}</span>
          <svg class="hstat__spark" viewBox="0 0 60 16" preserveAspectRatio="none" aria-hidden="true">
            <polyline :points="heroSpark.tokens" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" opacity="1" />
          </svg>
          <span class="hstat__hint">{{ labels.total }} {{ formatInteger(safeStats.total_tokens) }}</span>
        </div>
        <div class="hstat">
          <span class="hstat__label">{{ labels.latency }}</span>
          <span class="hstat__val">{{ formatDuration(safeStats.average_duration_ms) }}</span>
          <svg class="hstat__spark" viewBox="0 0 60 16" preserveAspectRatio="none" aria-hidden="true">
            <polyline :points="heroSpark.cost" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" opacity="1" />
          </svg>
          <span class="hstat__hint">RPM {{ formatInteger(safeStats.rpm) }} · TPM {{ formatInteger(safeStats.tpm) }}</span>
        </div>
      </div>
    </section>

    <!-- ROW 1 — HEATMAP + CREDENTIALS -->
    <section class="row-1 fade-in fade-in--2">
      <div class="card heatmap">
        <div class="card__head">
          <span class="card__title">{{ labels.activity }}</span>
          <span class="card__title-meta">{{ heatmapMetaLabel }}</span>
          <div class="card__head-actions">
            <div class="tabs" id="hmRangeTabs">
              <button class="tab" type="button" data-hm-range="month" :aria-pressed="hmRange === 'month' ? 'true' : 'false'" @click="setHeatmapRange('month')">{{ labels.month }}</button>
              <button class="tab" type="button" data-hm-range="quarter" :aria-pressed="hmRange === 'quarter' ? 'true' : 'false'" @click="setHeatmapRange('quarter')">{{ labels.quarter }}</button>
              <button class="tab" type="button" data-hm-range="year" :aria-pressed="hmRange === 'year' ? 'true' : 'false'" @click="setHeatmapRange('year')">{{ labels.year }}</button>
            </div>
            <div class="tabs">
              <button class="tab" type="button" data-hm="calls" :aria-pressed="hmMetric === 'calls' ? 'true' : 'false'" @click="setHeatmapMetric('calls')">{{ labels.calls }}</button>
              <button class="tab" type="button" data-hm="tokens" :aria-pressed="hmMetric === 'tokens' ? 'true' : 'false'" @click="setHeatmapMetric('tokens')">{{ labels.tokens }}</button>
              <button class="tab" type="button" data-hm="cost" :aria-pressed="hmMetric === 'cost' ? 'true' : 'false'" @click="setHeatmapMetric('cost')">{{ labels.cost }}</button>
            </div>
          </div>
        </div>

        <div class="heatmap__body">
          <div class="heatmap__lead" id="hmLead" :class="{ 'is-selected': !!selectedHeatmapRow }">
            <div class="heatmap__lead-num" id="hmLeadNum">
              {{ metricLabel(heatmapTotal) }}<span class="heatmap__lead-unit"></span>
            </div>
            <div class="heatmap__lead-note">{{ labels.peak }} {{ metricLabel(heatmapPeak) }}</div>

            <div class="heatmap__sel" id="hmSel">
              <button class="heatmap__sel-close" id="hmSelClose" type="button" aria-label="close" @click="closeHeatmapSelection">×</button>
              <div class="heatmap__sel-left">
                <div class="heatmap__sel-date">
                  <span class="pill">{{ labels.day }}</span>
                  <span id="hmSelDate">{{ selectedHeatmapRow?.key || '—' }}</span>
                  <b id="hmSelDow">{{ selectedHeatmapDow }}</b>
                </div>
                <div class="heatmap__sel-metrics">
                  <div class="heatmap__sel-metric" id="hmSelMcalls" data-metric="calls" :class="{ 'is-active': hmMetric === 'calls' }">
                    <label>{{ labels.calls }}</label><b>{{ formatInteger(selectedHeatmapRow?.requests || 0) }}</b>
                  </div>
                  <div class="heatmap__sel-metric" id="hmSelMtokens" data-metric="tokens" :class="{ 'is-active': hmMetric === 'tokens' }">
                    <label>{{ labels.tokens }}</label><b>{{ formatInteger(selectedHeatmapRow?.total_tokens || 0) }}</b>
                  </div>
                  <div class="heatmap__sel-metric" id="hmSelMcost" data-metric="cost" :class="{ 'is-active': hmMetric === 'cost' }">
                    <label>{{ labels.cost }}</label><b>{{ money(selectedHeatmapRow?.actual_cost || selectedHeatmapRow?.cost || 0, 4) }}</b>
                  </div>
                </div>
              </div>
              <div class="heatmap__sel-right">
                <div class="heatmap__sel-rightlabel">
                  <span>{{ labels.hourly }}</span>
                  <span id="hmSelPeakHr">{{ selectedHeatmapRow ? labels.auto : '—' }}</span>
                </div>
                <div class="heatmap__sel-hours" id="hmSelHours">
                  <i
                    v-for="bar in selectedHourlyBars"
                    :key="bar.hour"
                    class="heatmap__sel-hour"
                    :data-hr="bar.hour"
                    :data-peak="bar.peak ? '1' : '0'"
                    :style="{ height: `${bar.height}px` }"
                  ></i>
                </div>
                <div class="heatmap__sel-hours-axis">
                  <span v-for="hour in 24" :key="hour">{{ hour - 1 }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="hm-months" id="hmMonths" :style="heatCellsStyle">
            <span v-for="(month, idx) in heatmapMonths" :key="`${month}-${idx}`">{{ month }}</span>
          </div>

          <div class="hm-grid" id="hmGrid" :data-range="hmRange">
            <div class="hm-days">
              <span></span><span>M</span><span></span><span>W</span><span></span><span>F</span><span></span>
            </div>
            <div class="hm-cells" id="hmCells" :style="heatCellsStyle">
              <div
                v-for="row in heatmapRows"
                :key="row.key"
                class="hm-cell"
                :class="{ 'is-today': row.isToday, 'is-selected': selectedHeatmapRow?.key === row.key }"
                :data-date="row.key"
                :data-day="row.day"
                :data-lvl="row.level"
                :data-level="row.level"
                :title="`${row.key} · ${metricLabel(metricValue(row))}`"
                @click="selectHeatmapDay(row)"
              ></div>
            </div>
          </div>

          <div class="hm-foot">
            <span>{{ labels.hmFoot }} <span id="hmFootMetric">{{ currentMetricLabel }}</span></span>
            <span class="hm-legend">
              <span>{{ labels.less }}</span>
              <span class="hm-legend-cells">
                <span style="background:var(--h0);"></span>
                <span style="background:var(--h1);"></span>
                <span style="background:var(--h2);"></span>
                <span style="background:var(--h3);"></span>
                <span style="background:var(--h4);"></span>
              </span>
              <span>{{ labels.more }}</span>
            </span>
          </div>
          <div class="hm-tip" id="hmTip">
            <div class="hm-tip__date"><span class="hm-tip__day">—</span><b class="hm-tip__dow">—</b></div>
            <div class="hm-tip__val">—</div>
            <div class="hm-tip__delta">—</div>
            <div class="hm-tip__bar"><i></i></div>
          </div>
        </div>
      </div>

      <div class="creds-col">
        <div class="card creds creds--bal">
          <div class="card__head">
            <span class="card__title">{{ labels.balance }}</span>
          </div>
          <div class="creds__body">
            <div class="creds__balance">
              <div class="creds__amount">
                <span class="creds__amount-cur">$</span>{{ balanceParts.whole }}<span class="creds__amount-frac">.{{ balanceParts.frac }}</span>
              </div>
              <RouterLink class="creds__topup" to="/purchase">
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><line x1="6" y1="2" x2="6" y2="10" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><line x1="2" y1="6" x2="10" y2="6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
                <span>{{ labels.topup }}</span>
              </RouterLink>
            </div>
            <div>
              <div class="creds__bar"><div class="creds__bar-fill" id="credsBarFill" :style="{ width: `${quotaSummary.percent}%` }"></div></div>
              <div class="creds__bar-meta">
                <span id="credsBarUsed">{{ quotaSummary.usedLabel }}</span>
                <span id="credsBarRenew">{{ quotaSummary.renewLabel }}</span>
                <span id="credsBarCap">{{ quotaSummary.capLabel }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="card creds">
          <div class="card__head">
            <span class="card__title">{{ labels.creds }}</span>
            <div class="card__head-actions">
              <RouterLink class="card__action" to="/keys"><span>{{ labels.manage }}</span>
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><polyline points="3,2 7,6 3,10" stroke="currentColor" stroke-width="1.3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </RouterLink>
            </div>
          </div>
          <div class="creds__body">
            <div class="creds__keys-wrap" :class="{ 'has-overflow': apiKeys.length > 3 }">
              <div class="creds__keys" id="keySelector" v-show="apiKeys.length > 1">
                <button
                  v-for="key in apiKeys"
                  :key="key.id"
                  type="button"
                  class="creds__keychip"
                  :class="{ 'is-on': selectedKey?.id === key.id }"
                  :data-id="key.id"
                  @click="selectKey(key.id)"
                >
                  <span class="creds__keychip-label">{{ key.name || `Key ${key.id}` }}</span>
                </button>
              </div>
            </div>

            <div class="creds__keyrow">
              <span class="creds__keyrow__val" id="keyVal">
                <span v-if="!selectedKey" class="mask">{{ labels.noKeys }}</span>
                <template v-else>{{ displayedKey }}</template>
              </span>
              <span v-if="selectedKey" class="creds__keyrow__group" id="keyGroup">{{ selectedKeyGroup }}</span>
              <button class="icbtn" id="revealBtn" type="button" aria-label="reveal" @click="toggleKeyReveal">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 7C2.5 4 4.5 3 7 3s4.5 1 6 4c-1.5 3-3.5 4-6 4S2.5 10 1 7Z" stroke="currentColor" stroke-width="1.2"/><circle cx="7" cy="7" r="1.8" stroke="currentColor" stroke-width="1.2"/></svg>
              </button>
              <button class="icbtn" id="copyBtn" type="button" aria-label="copy" @click="copyKey">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="4" y="4" width="8" height="8" rx="1.3" stroke="currentColor" stroke-width="1.2"/><path d="M9 4V2.3c0-.3-.3-.6-.6-.6H2.3c-.4 0-.6.3-.6.6V8.6c0 .3.2.6.6.6H4" stroke="currentColor" stroke-width="1.2"/></svg>
              </button>
            </div>

            <div class="creds__fmt" role="group" aria-label="API format">
              <button type="button" class="creds__fmt-btn" :class="{ 'is-on': apiFormat === 'openai' }" data-fmt="openai" @click="setApiFormat('openai')">OpenAI · /v1</button>
              <button type="button" class="creds__fmt-btn" :class="{ 'is-on': apiFormat === 'claude' }" data-fmt="claude" @click="setApiFormat('claude')">Claude Code</button>
            </div>

            <div class="creds__endpoint">
              <span class="creds__endpoint-tag">POST</span>
              <span class="creds__endpoint-url">{{ endpointUrl }}</span>
              <button class="icbtn" id="copyEpBtn" type="button" style="color:rgba(255,255,255,0.55);" aria-label="copy endpoint" @click="copyEndpoint">
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><rect x="4" y="4" width="8" height="8" rx="1.3" stroke="currentColor" stroke-width="1.2"/><path d="M9 4V2.3c0-.3-.3-.6-.6-.6H2.3c-.4 0-.6.3-.6.6V8.6c0 .3.2.6.6.6H4" stroke="currentColor" stroke-width="1.2"/></svg>
              </button>
            </div>

            <div class="creds__actions">
              <button type="button" class="creds__act" id="copyConnBtn" @click="copyConnection">{{ labels.copyConn }}</button>
              <button type="button" class="creds__act" id="copyCurlBtn" @click="copyCurl">{{ labels.copyCurl }}</button>
            </div>

            <div class="creds__meta">
              <div class="creds__meta-cell">
                <span class="creds__meta-key">{{ labels.status }}</span>
                <span class="creds__meta-val" id="credsStatus"><span class="creds__meta-dot"></span><span>{{ selectedKeyStatus }}</span></span>
              </div>
              <div class="creds__meta-cell">
                <span class="creds__meta-key">{{ labels.lastUsed }}</span>
                <span class="creds__meta-val" id="credsLastUsed">{{ selectedKeyLastUsed }}</span>
              </div>
              <div class="creds__meta-cell">
                <span class="creds__meta-key">{{ labels.rate }}</span>
                <span class="creds__meta-val" id="credsRate">{{ selectedKeyRate }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ROW 2 — MODEL MIX + LIVE -->
    <section class="row-2 fade-in fade-in--3">
      <div class="card mix">
        <div class="card__head">
          <span class="card__title">{{ labels.mix }}</span>
          <span class="card__title-meta">{{ labels.thisPeriod }}</span>
          <div class="card__head-actions">
            <div class="tabs" id="mixRangeTabs">
              <button class="tab" type="button" data-mix-range="month" aria-pressed="false">{{ labels.month }}</button>
              <button class="tab" type="button" data-mix-range="quarter" aria-pressed="true">{{ labels.quarter }}</button>
              <button class="tab" type="button" data-mix-range="year" aria-pressed="false">{{ labels.year }}</button>
            </div>
          </div>
        </div>
        <div class="mix__body">
          <div class="mix__lead">
            <div class="mix__lead-l">
              <div class="mix__lead-num" id="mixLeadNum">{{ formatInteger(modelRows.length) }}<span class="mix__lead-unit">{{ labels.modelsUnit }}</span></div>
              <div class="mix__lead-sub" id="mixLeadSub">{{ modelRows.length ? labels.sortedByTokens : '—' }}</div>
            </div>
            <div class="mix__lead-r">
              <div class="mix__lead-delta is-up" id="mixDelta"><span>{{ formatInteger(modelRequestsTotal) }}</span></div>
              <div class="mix__lead-deltal">{{ labels.vsPrevious }}</div>
            </div>
          </div>
          <div class="mix__stack" id="mixStack">
            <span
              v-for="row in modelRows"
              :key="`stack-${row.model}`"
              :style="{ width: `${row.percentForStack}%`, background: 'var(--verm)' }"
            ></span>
          </div>
          <div class="mix__rows" id="mixRows">
            <div v-if="!modelRows.length" class="mexion-empty-inline">{{ labels.noModelUsage }}</div>
            <div v-for="row in modelRows" :key="row.model" class="mix__row" :class="{ 'is-hot': row.rank === 1 }">
              <span class="mix__row-rank">{{ String(row.rank).padStart(2, '0') }}</span>
              <span class="mix__row-sw" style="background:var(--verm)"></span>
              <span class="mix__row-name"><span>{{ row.model }}</span></span>
              <span class="mix__row-spark" style="color:var(--verm)">
                <i v-for="spark in row.spark" :key="spark" :style="{ height: `${spark}px` }"></i>
              </span>
              <span class="mix__row-pct">{{ row.percent.toFixed(0) }}<em>%</em></span>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card__head">
          <span class="card__title">{{ labels.live }}</span>
          <span class="live__chip" aria-hidden="true">
            <span class="live__chip-label">LIVE</span>
            <span class="live__chip-bar"></span>
          </span>
          <span class="card__title-meta" id="liveCounter">{{ liveCounterLabel }}</span>
          <div class="card__head-actions">
            <RouterLink class="card__action" :to="mode === 'admin' ? '/admin/usage' : '/usage'"><span>{{ labels.allLogs }}</span>
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><polyline points="3,2 7,6 3,10" stroke="currentColor" stroke-width="1.3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </RouterLink>
          </div>
        </div>
        <div class="live__body" id="liveBody">
          <div v-if="!recentUsage.length" class="mexion-live-empty">{{ labels.noCalls }}</div>
          <button v-for="log in recentUsage.slice(0, 8)" :key="log.id" type="button" class="feed-item">
            <span class="feed-time">{{ formatTime(log.created_at) }}</span>
            <span class="feed-icon" style="background:var(--ink)">{{ providerFromModel(log.model).charAt(0).toUpperCase() }}</span>
            <span class="feed-info">
              <div class="feed-name">{{ log.model || '—' }}</div>
              <div class="feed-meta">{{ formatInteger(logTotalTokens(log)) }} tok · {{ logGroupName(log) }}</div>
            </span>
            <span class="feed-end">
              <div class="feed-cost">{{ money(log.actual_cost || 0, 6) }}</div>
              <span class="pill" :class="logIsOk(log) ? 'pill--ok' : 'pill--err'"><span class="pill__dot"></span>{{ logStatus(log) }}</span>
            </span>
          </button>
        </div>
        <div class="live__foot">
          <span>{{ labels.autoRefreshing }}</span>
          <RouterLink :to="mode === 'admin' ? '/admin/usage' : '/usage'"><span>{{ labels.browseAll }}</span>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><line x1="2" y1="6" x2="9" y2="6" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><polyline points="6.5,3 9.5,6 6.5,9" stroke="currentColor" stroke-width="1.3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- USAGE CHART -->
    <section class="fade-in fade-in--4">
      <div class="card chart-card">
        <div class="card__head">
          <span class="card__title">{{ labels.usage }}</span>
          <span class="card__title-meta" id="usageMeta">{{ usageMetaLabel }}</span>
          <div class="card__head-actions">
            <div class="tabs">
              <button class="tab" type="button" data-range="7" :aria-pressed="chartRange === 7 ? 'true' : 'false'" @click="chartRange = 7">7D</button>
              <button class="tab" type="button" data-range="30" :aria-pressed="chartRange === 30 ? 'true' : 'false'" @click="chartRange = 30">30D</button>
              <button class="tab" type="button" data-range="90" :aria-pressed="chartRange === 90 ? 'true' : 'false'" @click="chartRange = 90">90D</button>
            </div>
          </div>
        </div>
        <div class="chart-card__body">
          <div class="chart-summary">
            <div class="chart-summary__main" id="chartSummaryMain">{{ formatInteger(chartTotal) }}<span class="chart-summary__unit">{{ labels.callsUnit }}</span></div>
            <span class="chart-summary__delta">
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M3 7.5L6 4.5l3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
              <span id="usageDelta">{{ usageMetaLabel }}</span>
            </span>
            <div class="chart-stats" id="chartStats">
              <div class="chart-stat chart-stat--max">
                <span class="chart-stat__dot"></span>
                <span class="chart-stat__lbl">{{ labels.peakShort }}</span>
                <span class="chart-stat__val" id="statPeakVal">{{ formatInteger(chartPeak.value) }}</span>
                <span class="chart-stat__date" id="statPeakDate">{{ chartPeak.date }}</span>
              </div>
              <div class="chart-stat chart-stat--min">
                <span class="chart-stat__dot"></span>
                <span class="chart-stat__lbl">{{ labels.low }}</span>
                <span class="chart-stat__val" id="statLowVal">{{ formatInteger(chartLow.value) }}</span>
                <span class="chart-stat__date" id="statLowDate">{{ chartLow.date }}</span>
              </div>
            </div>
            <div class="chart-legend">
              <span class="chart-legend__item"><span class="chart-legend__sw" style="background:var(--verm);"></span><span>{{ labels.current }}</span></span>
              <span class="chart-legend__item"><span class="chart-legend__sw" style="background:var(--mute-2);height:0;border-top:1px dashed var(--mute-2);"></span><span>{{ labels.previous }}</span></span>
            </div>
          </div>
          <div class="chart" id="chart">
            <svg id="chartSvg" preserveAspectRatio="none" viewBox="0 0 900 220">
              <defs>
                <linearGradient id="gradMain" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#C8392D" stop-opacity="0.16"/>
                  <stop offset="100%" stop-color="#C8392D" stop-opacity="0"/>
                </linearGradient>
              </defs>
              <path class="area-main" :d="chartAreaPath"></path>
              <polyline class="line-main" :points="chartLinePoints"></polyline>
            </svg>
            <div class="chart-tip" id="chartTip">
              <div class="chart-tip__date" id="tipDate">—</div>
              <div class="chart-tip__val" id="tipVal">—</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section v-if="mode === 'admin'" class="row-admin fade-in fade-in--5" id="adminQuickSection">
      <div class="card">
        <div class="card__head">
          <span class="card__title">§ {{ labels.adminQuick }}</span>
          <span class="card__title-meta">Admin</span>
        </div>
        <div class="admin-quick-grid" id="adminQuickGrid">
          <RouterLink v-for="item in adminQuickItems" :key="item.to" class="admin-quick-item" :to="item.to">
            <span class="admin-quick-label">{{ item.label }}</span>
            <span class="admin-quick-count">{{ item.count }}</span>
          </RouterLink>
        </div>
      </div>
    </section>

    <section class="row-ops fade-in fade-in--5" id="opsSection">
      <div class="card">
        <div class="card__head">
          <span class="card__title">§ {{ labels.channelHealth }}</span>
          <span class="card__title-meta">{{ labels.realtime }}</span>
        </div>
        <div class="ops-list" id="channelHealthList">
          <div v-for="row in channelHealthRows" :key="row.title" class="ops-row">
            <div class="ops-row__main">
              <div class="ops-row__title">{{ row.title }}</div>
              <div class="ops-row__meta">{{ row.meta }}</div>
              <div class="ops-meter"><div class="ops-meter__fill" :style="{ width: `${row.percent}%` }"></div></div>
            </div>
            <div class="ops-row__side">{{ row.value }}</div>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="card__head">
          <span class="card__title">§ Provider {{ labels.distribution }}</span>
          <span class="card__title-meta">24h</span>
        </div>
        <div class="ops-list" id="providerDistList">
          <div v-for="row in providerRows" :key="row.title" class="ops-row">
            <div class="ops-row__main">
              <div class="ops-row__title">{{ row.title }}</div>
              <div class="ops-row__meta">{{ row.meta }}</div>
              <div class="ops-meter"><div class="ops-meter__fill" :style="{ width: `${row.percent}%` }"></div></div>
            </div>
            <div class="ops-row__side">{{ row.value }}</div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type {
  ApiKey,
  ModelStat,
  PlatformQuotaItem,
  TrendDataPoint,
  UsageLog,
  UserSpendingRankingItem
} from '@/types'

type DashboardMode = 'user' | 'admin'
type HeatmapMetric = 'calls' | 'tokens' | 'cost'
type HeatmapRange = 'month' | 'quarter' | 'year'
type ApiFormat = 'openai' | 'claude'

interface DashboardStatsLike {
  today_requests?: number
  today_tokens?: number
  total_requests?: number
  total_tokens?: number
  average_duration_ms?: number
  rpm?: number
  tpm?: number
  total_api_keys?: number
  active_api_keys?: number
  total_accounts?: number
  normal_accounts?: number
  error_accounts?: number
  ratelimit_accounts?: number
  overload_accounts?: number
  total_users?: number
  today_new_users?: number
  active_users?: number
}

interface HeatmapRow {
  key: string
  day: number
  date: Date
  requests: number
  total_tokens: number
  cost: number
  actual_cost: number
  level: number
  isToday: boolean
}

const props = withDefaults(defineProps<{
  mode?: DashboardMode
  stats?: DashboardStatsLike | null
  trend?: TrendDataPoint[]
  models?: ModelStat[]
  recentUsage?: UsageLog[]
  apiKeys?: ApiKey[]
  platformQuotas?: PlatformQuotaItem[] | null
  balance?: number
  userName?: string
  userEmail?: string
  rankingItems?: UserSpendingRankingItem[]
  loading?: boolean
}>(), {
  mode: 'user',
  stats: null,
  trend: () => [],
  models: () => [],
  recentUsage: () => [],
  apiKeys: () => [],
  platformQuotas: null,
  balance: 0,
  userName: '',
  userEmail: '',
  rankingItems: () => [],
  loading: false
})

const i18n = useI18n()
const isZh = computed(() => String(i18n.locale?.value || 'zh-CN').startsWith('zh'))

const labels = computed(() => isZh.value ? {
  calls: '调用',
  tokens: 'Token',
  latency: '时延',
  total: '总计',
  activity: '活动热力',
  month: '月',
  quarter: '季',
  year: '年',
  cost: '费用',
  peak: '峰值',
  day: '当日',
  hourly: '时段分布',
  auto: '自动',
  hmFoot: '每格为一天 · 绿→红 = 正常→峰值',
  less: '少',
  more: '多',
  balance: '余额与额度',
  topup: '充值',
  creds: 'API 凭证',
  manage: '管理',
  noKeys: '暂无 API Key',
  copyConn: '复制连接信息',
  copyCurl: '复制 cURL',
  status: '状态',
  lastUsed: '最近使用',
  rate: '速率',
  active: '活跃',
  inactive: '停用',
  unlimited: '无限制',
  available: '可用余额',
  monthly: '月度',
  used: '已用',
  cap: '上限',
  mix: '模型分布',
  thisPeriod: '本周期',
  modelsUnit: '个模型',
  sortedByTokens: '按 Token 排序',
  vsPrevious: '较上一期',
  noModelUsage: '暂无模型用量',
  live: '实时',
  allLogs: '全部日志',
  noCalls: '暂无调用记录',
  autoRefreshing: '自动刷新中',
  browseAll: '查看全部',
  usage: '用量',
  callsUnit: '次调用',
  peakShort: '峰值',
  low: '低谷',
  current: '当前',
  previous: '上期',
  adminQuick: '管理快捷入口',
  channelHealth: '渠道健康',
  realtime: '实时',
  distribution: '分布',
  channels: '渠道管理',
  users: '用户管理',
  accounts: '账号管理',
  groups: '分组管理',
  settings: '系统设置',
  normalAccounts: '正常账号',
  errorAccounts: '异常账号',
  rateLimitAccounts: '限流账号',
  overloadAccounts: '过载账号'
} : {
  calls: 'Calls',
  tokens: 'Tokens',
  latency: 'Latency',
  total: 'Total',
  activity: 'Activity',
  month: 'M',
  quarter: 'Q',
  year: 'Y',
  cost: 'cost',
  peak: 'Peak',
  day: 'DAY',
  hourly: 'hourly distribution',
  auto: 'auto',
  hmFoot: 'Each cell is a day · green→red = low→peak',
  less: 'less',
  more: 'more',
  balance: 'Balance',
  topup: 'Top up',
  creds: 'API Credentials',
  manage: 'Manage',
  noKeys: 'No API keys',
  copyConn: 'Copy connection',
  copyCurl: 'Copy cURL',
  status: 'Status',
  lastUsed: 'Last used',
  rate: 'Rate',
  active: 'Active',
  inactive: 'Inactive',
  unlimited: 'unlimited',
  available: 'available',
  monthly: 'monthly',
  used: 'used',
  cap: 'cap',
  mix: 'Model mix',
  thisPeriod: 'this period',
  modelsUnit: 'models',
  sortedByTokens: 'sorted by tokens',
  vsPrevious: 'vs previous',
  noModelUsage: 'No model usage',
  live: 'Live',
  allLogs: 'All logs',
  noCalls: 'No calls yet',
  autoRefreshing: 'Auto-refreshing',
  browseAll: 'Browse all',
  usage: 'Usage',
  callsUnit: 'calls',
  peakShort: 'peak',
  low: 'low',
  current: 'current',
  previous: 'previous',
  adminQuick: 'Admin quick links',
  channelHealth: 'Channel health',
  realtime: 'realtime',
  distribution: 'distribution',
  channels: 'Channels',
  users: 'Users',
  accounts: 'Accounts',
  groups: 'Groups',
  settings: 'Settings',
  normalAccounts: 'Normal accounts',
  errorAccounts: 'Error accounts',
  rateLimitAccounts: 'Rate limited',
  overloadAccounts: 'Overloaded'
})

const defaultStats: Required<DashboardStatsLike> = {
  today_requests: 0,
  today_tokens: 0,
  total_requests: 0,
  total_tokens: 0,
  average_duration_ms: 0,
  rpm: 0,
  tpm: 0,
  total_api_keys: 0,
  active_api_keys: 0,
  total_accounts: 0,
  normal_accounts: 0,
  error_accounts: 0,
  ratelimit_accounts: 0,
  overload_accounts: 0,
  total_users: 0,
  today_new_users: 0,
  active_users: 0
}

const safeStats = computed(() => ({
  ...defaultStats,
  ...(props.stats || {})
}))

const displayName = computed(() => {
  const name = props.userName?.trim()
  if (name) return name
  const email = props.userEmail?.trim()
  if (email) return email.split('@')[0]
  return props.mode === 'admin' ? 'Admin' : (isZh.value ? '用户' : 'User')
})

const greeting = computed(() => {
  return isZh.value ? `你好，${displayName.value}。` : `Hello, ${displayName.value}.`
})

const subtitle = computed(() => {
  return isZh.value
    ? `余额 ${money(props.balance, 4)}`
    : `Balance ${money(props.balance, 4)}`
})

const todayLabel = computed(() => isZh.value ? '今天' : 'Today')

function numberValue(value: unknown): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

function formatInteger(value: unknown): string {
  return Math.round(numberValue(value)).toLocaleString()
}

function formatDuration(ms: unknown): string {
  const n = numberValue(ms)
  if (n >= 1000) return `${(n / 1000).toFixed(2)}s`
  return `${Math.round(n)}ms`
}

function money(value: unknown, digits = 4): string {
  return `$${numberValue(value).toFixed(digits)}`
}

function dateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function todayKey(): string {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return dateKey(today)
}

interface DailyAgg {
  key: string
  requests: number
  total_tokens: number
  cost: number
  actual_cost: number
}

const trendMap = computed(() => {
  const map = new Map<string, DailyAgg>()
  for (const item of props.trend || []) {
    const key = String(item.date || '').slice(0, 10)
    if (!key) continue
    const existing = map.get(key) || {
      key,
      requests: 0,
      total_tokens: 0,
      cost: 0,
      actual_cost: 0
    }
    existing.requests += numberValue(item.requests)
    existing.total_tokens += numberValue(item.total_tokens)
    existing.cost += numberValue(item.cost)
    existing.actual_cost += numberValue(item.actual_cost)
    map.set(key, existing)
  }
  return map
})

function rowsForLastDays(days: number): HeatmapRow[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const rows: HeatmapRow[] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const key = dateKey(d)
    const agg = trendMap.value.get(key)
    rows.push({
      key,
      day: d.getDate(),
      date: d,
      requests: agg?.requests || 0,
      total_tokens: agg?.total_tokens || 0,
      cost: agg?.cost || 0,
      actual_cost: agg?.actual_cost || 0,
      level: 0,
      isToday: key === todayKey()
    })
  }
  return rows
}

const hmMetric = ref<HeatmapMetric>('calls')
const hmRange = ref<HeatmapRange>('quarter')
const selectedHeatmapDate = ref<string | null>(null)

function rangeDays(range: HeatmapRange): number {
  if (range === 'month') return 30
  if (range === 'year') return 365
  return 91
}

function metricValue(row: Pick<HeatmapRow, 'requests' | 'total_tokens' | 'cost' | 'actual_cost'>): number {
  if (hmMetric.value === 'tokens') return numberValue(row.total_tokens)
  if (hmMetric.value === 'cost') return numberValue(row.actual_cost || row.cost)
  return numberValue(row.requests)
}

function metricLabel(value: number): string {
  if (hmMetric.value === 'tokens') return `${formatInteger(value)} tokens`
  if (hmMetric.value === 'cost') return money(value, 4)
  return isZh.value ? `${formatInteger(value)} 次` : `${formatInteger(value)} calls`
}

const heatmapRows = computed(() => {
  const rows = rowsForLastDays(rangeDays(hmRange.value))
  const max = Math.max(...rows.map(metricValue), 0)
  return rows.map(row => ({
    ...row,
    level: max > 0 ? Math.ceil((metricValue(row) / max) * 4) : 0
  }))
})

const heatWeeks = computed(() => Math.ceil(rangeDays(hmRange.value) / 7))
const heatCellsStyle = computed<Record<string, string>>(() => ({ '--weeks': String(heatWeeks.value) }))
const heatmapTotal = computed(() => heatmapRows.value.reduce((sum, row) => sum + metricValue(row), 0))
const heatmapPeak = computed(() => Math.max(...heatmapRows.value.map(metricValue), 0))

const heatmapMonths = computed(() => {
  const months: string[] = []
  for (let w = 0; w < heatWeeks.value; w++) {
    const idx = Math.min(heatmapRows.value.length - 1, w * 7)
    const d = heatmapRows.value[idx]?.date || new Date()
    months.push(isZh.value ? `${d.getMonth() + 1}月` : d.toLocaleString('en', { month: 'short' }))
  }
  return months
})

const heatmapMetaLabel = computed(() => {
  if (hmRange.value === 'month') return isZh.value ? '近 30 天' : 'last 30 days'
  if (hmRange.value === 'year') return isZh.value ? '近 12 个月' : 'last 12 months'
  return isZh.value ? '近 13 周' : 'last 13 weeks'
})

const currentMetricLabel = computed(() => {
  if (hmMetric.value === 'tokens') return labels.value.tokens
  if (hmMetric.value === 'cost') return labels.value.cost
  return labels.value.calls
})

const selectedHeatmapRow = computed(() => {
  if (!selectedHeatmapDate.value) return null
  return heatmapRows.value.find(row => row.key === selectedHeatmapDate.value) || null
})

const selectedHeatmapDow = computed(() => {
  const row = selectedHeatmapRow.value
  if (!row) return '—'
  return row.date.toLocaleDateString(isZh.value ? 'zh-CN' : 'en-US', { weekday: 'short' })
})

const selectedHourlyBars = computed(() => {
  const base = Math.max(1, numberValue(selectedHeatmapRow.value?.requests || 0))
  const peakIndex = base % 24
  return Array.from({ length: 24 }, (_, index) => {
    const seed = ((index + 3) * (base + 7)) % 23
    return {
      hour: index,
      height: Math.max(2, Math.round((seed / 22) * 30)),
      peak: index === peakIndex
    }
  })
})

function setHeatmapMetric(metric: HeatmapMetric) {
  hmMetric.value = metric
}

function setHeatmapRange(range: HeatmapRange) {
  hmRange.value = range
}

function selectHeatmapDay(row: HeatmapRow) {
  selectedHeatmapDate.value = row.key
}

function closeHeatmapSelection() {
  selectedHeatmapDate.value = null
}

const balanceParts = computed(() => {
  const [whole, frac = '0000'] = numberValue(props.balance).toFixed(4).split('.')
  return {
    whole: Number(whole).toLocaleString(),
    frac
  }
})

const quotaSummary = computed(() => {
  const quotas = props.platformQuotas || []
  const monthlyLimit = quotas.reduce((sum, quota) => sum + numberValue(quota.monthly_limit_usd), 0)
  const monthlyUsage = quotas.reduce((sum, quota) => sum + numberValue(quota.monthly_usage_usd), 0)
  if (monthlyLimit > 0) {
    const percent = Math.min(100, Math.max(3, (monthlyUsage / monthlyLimit) * 100))
    return {
      percent,
      usedLabel: `${labels.value.used} ${Math.round((monthlyUsage / monthlyLimit) * 100)}%`,
      renewLabel: labels.value.monthly,
      capLabel: `${labels.value.cap} ${money(monthlyLimit, 2)}`
    }
  }
  return {
    percent: Math.min(100, Math.max(3, numberValue(props.balance) > 0 ? 18 : 3)),
    usedLabel: labels.value.available,
    renewLabel: 'active',
    capLabel: money(props.balance, 2)
  }
})

const apiFormat = ref<ApiFormat>((typeof localStorage !== 'undefined' && localStorage.getItem('mexion_api_fmt') === 'claude') ? 'claude' : 'openai')
const selectedKeyId = ref<number | null>(null)
const keyRevealed = ref(false)

watch(
  () => props.apiKeys,
  (keys) => {
    if (!keys.length) {
      selectedKeyId.value = null
      return
    }
    if (!selectedKeyId.value || !keys.some(key => key.id === selectedKeyId.value)) {
      selectedKeyId.value = keys[0].id
    }
  },
  { immediate: true }
)

const selectedKey = computed(() => props.apiKeys.find(key => key.id === selectedKeyId.value) || null)

function selectKey(id: number) {
  selectedKeyId.value = id
  keyRevealed.value = false
}

function keyMask(raw: string): string {
  if (!raw) return 'sk-••••'
  if (keyRevealed.value) return raw
  if (raw.length <= 12) return `${raw.slice(0, 4)}••••`
  return `${raw.slice(0, 8)}••••••••${raw.slice(-4)}`
}

const displayedKey = computed(() => keyMask(selectedKey.value?.key || selectedKey.value?.name || ''))
const selectedKeyGroup = computed(() => {
  const key = selectedKey.value
  if (!key) return '—'
  return key.group?.name || (key.group_id != null ? `#${key.group_id}` : (isZh.value ? '默认' : 'default'))
})
const selectedKeyStatus = computed(() => {
  if (!selectedKey.value) return '—'
  const status = selectedKey.value?.status || 'active'
  return status === 'active' ? labels.value.active : labels.value.inactive
})
const selectedKeyLastUsed = computed(() => selectedKey.value?.last_used_at ? new Date(selectedKey.value.last_used_at).toLocaleString() : '—')
const selectedKeyRate = computed(() => {
  if (!selectedKey.value) return '—'
  const limit = selectedKey.value?.rate_limit_1d
  return limit ? `${formatInteger(limit)}/d` : labels.value.unlimited
})

const endpointUrl = computed(() => {
  const base = typeof window !== 'undefined' ? window.location.origin.replace(/\/+$/, '') : ''
  return apiFormat.value === 'claude' ? base : `${base}/v1`
})

function setApiFormat(format: ApiFormat) {
  apiFormat.value = format
  localStorage.setItem('mexion_api_fmt', format)
}

function toggleKeyReveal() {
  keyRevealed.value = !keyRevealed.value
}

async function copyText(text: string) {
  if (!text) return
  await navigator.clipboard?.writeText(text).catch(() => undefined)
}

function copyKey() {
  void copyText(selectedKey.value?.key || selectedKey.value?.name || '')
}

function copyEndpoint() {
  void copyText(endpointUrl.value)
}

function copyConnection() {
  void copyText(`base_url=${endpointUrl.value}\napi_key=${selectedKey.value?.key || selectedKey.value?.name || ''}`)
}

function copyCurl() {
  void copyText(`curl ${endpointUrl.value}/chat/completions -H "Authorization: Bearer YOUR_API_KEY"`)
}

function providerFromModel(model: string | null | undefined): string {
  const normalized = String(model || '').toLowerCase()
  if (normalized.includes('claude')) return 'anthropic'
  if (normalized.includes('gemini')) return 'gemini'
  if (normalized.includes('deepseek')) return 'deepseek'
  if (normalized.includes('qwen')) return 'qwen'
  if (normalized.includes('grok')) return 'xai'
  return 'openai'
}

function logTotalTokens(log: UsageLog): number {
  return numberValue(log.input_tokens) + numberValue(log.output_tokens) + numberValue(log.cache_creation_tokens) + numberValue(log.cache_read_tokens)
}

function formatTime(value: string): string {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleTimeString(isZh.value ? 'zh-CN' : 'en-US', { hour12: false })
}

function logGroupName(log: UsageLog): string {
  return log.group?.name || log.api_key?.name || '—'
}

function logStatus(log: UsageLog): string {
  const raw = (log as UsageLog & { status_code?: number | string }).status_code
  return raw == null ? 'ok' : String(raw)
}

function logIsOk(log: UsageLog): boolean {
  const raw = (log as UsageLog & { status_code?: number | string }).status_code
  const code = raw == null ? 200 : Number(raw)
  return Number.isFinite(code) ? code < 400 : true
}

const modelRows = computed(() => {
  const sorted = [...(props.models || [])].sort((a, b) => numberValue(b.total_tokens || b.requests) - numberValue(a.total_tokens || a.requests))
  const top = sorted.slice(0, 6)
  const total = top.reduce((sum, model) => sum + numberValue(model.total_tokens || model.requests), 0) || 1
  return top.map((model, index) => {
    const value = numberValue(model.total_tokens || model.requests)
    const percent = (value / total) * 100
    return {
      ...model,
      rank: index + 1,
      percent,
      percentForStack: Math.max(2, percent).toFixed(2),
      spark: Array.from({ length: 8 }, (_, sparkIndex) => Math.max(3, (((sparkIndex + index) % 8) + 1) * 2))
    }
  })
})

const modelRequestsTotal = computed(() => modelRows.value.reduce((sum, row) => sum + numberValue(row.requests), 0))
const liveCounterLabel = computed(() => isZh.value
  ? `今日 ${formatInteger(safeStats.value.today_requests)} 次调用`
  : `${formatInteger(safeStats.value.today_requests)} calls today`
)

const chartRange = ref(30)
const chartRows = computed(() => rowsForLastDays(chartRange.value))
const chartTotal = computed(() => chartRows.value.reduce((sum, row) => sum + numberValue(row.requests), 0))
const usageMetaLabel = computed(() => isZh.value ? `近 ${chartRange.value} 天` : `last ${chartRange.value} days`)

function pointsFor(values: number[], width = 60, height = 16): string {
  const source = values.length ? values : [0, 0]
  const max = Math.max(...source.map(numberValue), 1)
  const step = source.length > 1 ? width / (source.length - 1) : width
  return source.map((value, index) => {
    const x = Math.round(index * step * 100) / 100
    const y = height - 1 - (numberValue(value) / max) * (height - 2)
    return `${x},${Math.round(y * 100) / 100}`
  }).join(' ')
}

const heroSpark = computed(() => {
  const rows = rowsForLastDays(14)
  return {
    calls: pointsFor(rows.map(row => row.requests)),
    tokens: pointsFor(rows.map(row => row.total_tokens)),
    cost: pointsFor(rows.map(row => row.actual_cost || row.cost))
  }
})

const chartGeometry = computed(() => {
  const values = chartRows.value.map(row => numberValue(row.requests))
  const w = 900
  const h = 220
  const pad = 14
  const max = Math.max(...values, 1)
  const pts = values.map((value, index) => {
    const x = pad + (values.length <= 1 ? 0 : index * (w - pad * 2) / (values.length - 1))
    const y = h - pad - (value / max) * (h - pad * 2)
    return [x, y] as const
  })
  const line = pts.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(' ')
  const area = pts.length
    ? `M${pts[0][0]},${h - pad} L${line.replace(/ /g, ' L')} L${pts[pts.length - 1][0]},${h - pad} Z`
    : ''
  return { line, area }
})

const chartLinePoints = computed(() => chartGeometry.value.line)
const chartAreaPath = computed(() => chartGeometry.value.area)

const chartPeak = computed(() => {
  let best = chartRows.value[0]
  for (const row of chartRows.value) {
    if (numberValue(row.requests) > numberValue(best?.requests)) best = row
  }
  return { value: best?.requests || 0, date: best?.key?.slice(5) || '—' }
})

const chartLow = computed(() => {
  let best = chartRows.value[0]
  for (const row of chartRows.value) {
    if (numberValue(row.requests) < numberValue(best?.requests)) best = row
  }
  return { value: best?.requests || 0, date: best?.key?.slice(5) || '—' }
})

function adminQuickCount(value: unknown): string {
  return props.stats == null ? '—' : formatInteger(value)
}

const adminQuickItems = computed(() => [
  { to: '/admin/channels', label: labels.value.channels, count: adminQuickCount((safeStats.value as DashboardStatsLike & { total_channels?: number }).total_channels) },
  { to: '/admin/groups', label: labels.value.groups, count: adminQuickCount((safeStats.value as DashboardStatsLike & { total_groups?: number }).total_groups) },
  { to: '/admin/accounts', label: labels.value.accounts, count: adminQuickCount(safeStats.value.total_accounts) },
  { to: '/admin/users', label: labels.value.users, count: adminQuickCount(safeStats.value.total_users) }
])

const channelHealthRows = computed(() => {
  const total = Math.max(1, numberValue(safeStats.value.total_accounts))
  const rows = [
    { title: labels.value.normalAccounts, meta: 'normal', raw: safeStats.value.normal_accounts },
    { title: labels.value.errorAccounts, meta: 'error', raw: safeStats.value.error_accounts },
    { title: labels.value.rateLimitAccounts, meta: 'ratelimit', raw: safeStats.value.ratelimit_accounts },
    { title: labels.value.overloadAccounts, meta: 'overload', raw: safeStats.value.overload_accounts }
  ]
  if (rows.every(row => numberValue(row.raw) <= 0)) return []
  return rows.map(row => ({
    title: row.title,
    meta: row.meta,
    value: formatInteger(row.raw),
    percent: Math.min(100, Math.max(3, (numberValue(row.raw) / total) * 100))
  }))
})

const providerRows = computed(() => {
  const map = new Map<string, { title: string; tokens: number; requests: number }>()
  for (const model of props.models || []) {
    const provider = providerFromModel(model.model)
    const row = map.get(provider) || { title: provider, tokens: 0, requests: 0 }
    row.tokens += numberValue(model.total_tokens)
    row.requests += numberValue(model.requests)
    map.set(provider, row)
  }
  const rows = [...map.values()].sort((a, b) => b.tokens - a.tokens)
  const total = rows.reduce((sum, row) => sum + row.tokens, 0) || 1
  return rows.map(row => ({
    title: row.title,
    meta: `${formatInteger(row.requests)} req · ${formatInteger(row.tokens)} tok`,
    value: `${Math.round((row.tokens / total) * 100)}%`,
    percent: Math.min(100, Math.max(3, (row.tokens / total) * 100))
  }))
})
</script>

<style scoped>
.mexion-dashboard-page {
  min-width: 0;
}

.mexion-empty-inline {
  color: var(--mute-2);
  font-size: 13px;
  padding: 12px 0;
}

.mexion-live-empty {
  text-align: center;
  padding: 40px 16px;
  color: var(--mute-2);
  font-size: 13px;
}
</style>
