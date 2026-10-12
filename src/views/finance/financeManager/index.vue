<template>
	<div class="page-info finance-manager-page">
		<!-- 1. 单行紧凑日常记账筛选栏 -->
		<finance-manager-filter
			v-model:searchInfo="searchInfo"
			@query="query"
			@cancelQuery="cancelQuery"
		/>

		<!-- 2. 一体化概览面板（账单统计与月度预算并排，节省纵向空间） -->
		<div class="finance-overview-card">
			<!-- 左侧：账单收支统计 -->
			<div class="overview-section bill-stats-section">
				<a-skeleton
					:loading="!isFirstSummaryLoaded"
					active
					:title="{ width: '38%' }"
					:paragraph="{ rows: 2, width: ['80%', '60%'] }"
				>
					<div class="section-header">
						<span class="summary-tag-title">
							<CalendarOutlined class="summary-title-icon" />
							<span>{{ summaryTitle }}</span>
						</span>
						<span class="record-total-badge">
							共
							<strong>{{
								summaryData.totalCount ?? pagination.total ?? 0
							}}</strong>
							笔账单
						</span>
					</div>

					<div class="stats-metrics-group">
						<!-- 全部 或 支出模式：展示支出 -->
						<div
							v-if="
								!searchInfo.incomeAndExpenses ||
								searchInfo.incomeAndExpenses === 'expense'
							"
							class="stat-metric expense"
						>
							<span class="label">{{
								searchInfo.incomeAndExpenses === 'expense' ?
									'支出合计'
								:	'总支出'
							}}</span>
							<span class="value"
								>-¥{{ formatAmount(summaryData.totalExpense || 0) }}</span
							>
						</div>

						<!-- 全部 或 收入模式：展示收入 -->
						<div
							v-if="
								!searchInfo.incomeAndExpenses ||
								searchInfo.incomeAndExpenses === 'income'
							"
							class="stat-metric income"
						>
							<span class="label">{{
								searchInfo.incomeAndExpenses === 'income' ?
									'收入合计'
								:	'总收入'
							}}</span>
							<span class="value"
								>+¥{{ formatAmount(summaryData.totalIncome || 0) }}</span
							>
						</div>

						<!-- 仅在全部模式下展示结余 -->
						<div
							v-if="!searchInfo.incomeAndExpenses"
							class="stat-metric balance"
						>
							<span class="label">净结余</span>
							<span
								:class="[
									'value',
									(summaryData.totalBalance || 0) >= 0 ?
										'text-income'
									:	'text-expense',
								]"
							>
								{{ (summaryData.totalBalance || 0) >= 0 ? '+' : '-' }}¥{{
									formatAmount(Math.abs(summaryData.totalBalance || 0))
								}}
							</span>
						</div>
					</div>

					<!-- 微洞察行：日均支出 + Top 3 支出大头微标签 -->
					<div class="stats-insights-row">
						<div
							class="insight-item daily-avg"
							:title="`基于${effectiveDaysInfo.label}计算`"
						>
							<span class="insight-label">日均支出:</span>
							<span class="insight-val">
								¥{{ formatAmount(dailyExpenseAvg) }}
								<span class="insight-unit">/天</span>
							</span>
						</div>

						<div
							v-if="topExpenseCategories.length > 0"
							class="insight-item top-categories"
						>
							<span class="insight-label">主要支出:</span>
							<div class="insight-tags-wrap">
								<span
									v-for="cat in topExpenseCategories"
									:key="cat.name"
									class="insight-top-tag"
									:title="`点击筛选【${cat.name}】，本期支出 ¥${formatAmount(cat.amount)} (${cat.percent}%)`"
									@click="filterByCategory(cat.name)"
								>
									{{ cat.name }} <span class="tag-pct">{{ cat.percent }}%</span>
								</span>
							</div>
						</div>
					</div>
				</a-skeleton>
			</div>

			<!-- 中间细垂直分割线 -->
			<div class="overview-divider"></div>

			<!-- 右侧：零花钱月度预算 -->
			<div class="overview-section budget-section">
				<a-skeleton
					:loading="!isFirstBudgetLoaded"
					active
					:title="{ width: '42%' }"
					:paragraph="{ rows: 2, width: ['80%', '60%'] }"
				>
					<div class="section-header">
						<div class="budget-title-line">
							<WalletOutlined class="budget-icon" />
							<span class="budget-title">{{ currentMonthStr }} 零花钱预算</span>
							<a-tag
								v-if="budgetStatus?.isInherited"
								color="processing"
								class="budget-tag"
							>
								继承自上月
							</a-tag>
							<a-tag
								v-if="budgetStatus?.isOverBudget"
								color="error"
								class="budget-tag"
							>
								已超支
							</a-tag>
						</div>
						<a-button
							type="link"
							size="small"
							class="budget-setting-btn"
							@click="openBudgetModal"
						>
							<template #icon><SettingOutlined /></template>
							调整预算
						</a-button>
					</div>

					<!-- 主金额行：剩余可用 + 上限/已用 -->
					<div class="budget-metrics-group">
						<div class="budget-stat-item">
							<span class="stat-label">{{
								budgetStatus?.isOverBudget ? '超支金额:' : '剩余可用:'
							}}</span>
							<span
								:class="[
									'stat-val',
									budgetStatus?.isOverBudget ? 'text-expense' : 'text-income',
								]"
							>
								{{ budgetStatus?.isOverBudget ? '-' : '' }}¥{{
									formatAmount(Math.abs(budgetStatus?.remainingAmount || 0))
								}}
							</span>
						</div>

						<div class="budget-sub-stats">
							<span class="sub-stat"
								>上限 ¥{{ formatAmount(budgetStatus?.budgetAmount || 0) }}</span
							>
							<span class="sub-sep">/</span>
							<span
								class="sub-stat clickable-sub-stat"
								@click="drillDownBudgetMonth"
								title="点击联动查看当月已计入明细"
							>
								{{ budgetSpentLabel }}
								{{ Number(budgetStatus?.actualExpense || 0) < 0 ? '-' : '' }}¥{{
									formatAmount(
										Math.abs(Number(budgetStatus?.actualExpense || 0)),
									)
								}}
								<span class="drill-icon">↗</span>
							</span>
						</div>
					</div>

					<!-- 微洞察行：进度条 + 计入分类微标签 (与左侧 stats-insights-row 结构对齐) -->
					<div class="budget-insights-row">
						<div
							class="budget-progress-wrap"
							:title="`预算使用率: ${budgetStatus?.usagePercent || 0}%`"
						>
							<a-progress
								:percent="
									Math.max(0, Math.min(budgetStatus?.usagePercent || 0, 100))
								"
								:stroke-color="progressStrokeColor"
								:format="() => `${budgetStatus?.usagePercent || 0}%`"
								size="small"
								class="budget-progress"
							/>
						</div>

						<div
							class="budget-category-hints"
							:title="
								budgetStatus?.categoryNames?.length ?
									budgetStatus.categoryNames.join('、')
								:	budgetDirectionLabel
							"
						>
							<span class="hint-label">计入:</span>
							<template v-if="budgetStatus?.categoryNames?.length">
								<a-tag
									v-for="cat in budgetStatus.categoryNames.slice(0, 3)"
									:key="cat"
									class="cat-pill clickable-cat-pill"
									@click="drillDownCategory(cat)"
									:title="`点击仅查看本月【${cat}】账目`"
								>
									{{ cat }}
								</a-tag>
								<span
									v-if="budgetStatus.categoryNames.length > 3"
									class="cat-pill-more clickable-cat-more"
									@click="drillDownCategory(budgetStatus.categoryNames[3])"
									:title="`点击仅查看本月【${budgetStatus.categoryNames[3]}】账目`"
								>
									+{{ budgetStatus.categoryNames.length - 3 }}
								</span>
							</template>
							<span
								v-else
								class="cat-pill-all clickable-cat-pill"
								@click="drillDownBudgetMonth"
								title="点击查看当月全部预算收支明细"
							>
								{{ budgetDirectionLabel }}
							</span>
						</div>
					</div>
				</a-skeleton>
			</div>
		</div>

		<!-- 联动筛选指示栏 -->
		<div v-if="activeLinkageFilter" class="linkage-active-banner">
			<div class="banner-content">
				<span class="banner-dot"></span>
				<span class="banner-text">
					已联动过滤：<strong>{{ activeLinkageFilter.label }}</strong>
				</span>
			</div>
			<a-button
				type="link"
				size="small"
				class="banner-close-btn"
				@click="clearLinkageFilter"
			>
				清除联动，查看全量
			</a-button>
		</div>

		<!-- 3. 操作按钮区 -->
		<div class="button">
			<a-space>
				<a-button type="primary" @click="editFinance('add')">
					<template #icon><PlusOutlined /></template>
					记一笔
				</a-button>

				<a-popconfirm
					v-if="selectedRowIds.length"
					:title="`确认批量删除选中的 ${selectedRowIds.length} 笔账目?`"
					ok-text="确认"
					cancel-text="取消"
					@confirm="batchDelFinanceManager"
				>
					<a-button type="primary" danger>
						<template #icon><DeleteOutlined /></template>
						批量删除 ({{ selectedRowIds.length }})
					</a-button>
				</a-popconfirm>
				<a-button v-else type="primary" danger disabled>
					<template #icon><DeleteOutlined /></template>
					删除
				</a-button>
			</a-space>
		</div>

		<!-- 4. 账单明细表格 -->
		<div class="content" ref="tableContainerRef">
			<a-table
				:dataSource="dataSource"
				:columns="columns"
				:loading="loading"
				:row-key="(record: FinanceManagerData) => record.id || ''"
				:pagination="pagination"
				@change="handleTableChange"
				:scroll="{ x: 'max-content', y: tableScrollY }"
				:row-selection="rowSelection"
			>
				<template #bodyCell="{ column, record }">
					<!-- 操作列：轻量链接按钮降噪 -->
					<template v-if="column.key === 'operation'">
						<a-space :size="4">
							<a-button
								type="link"
								size="small"
								class="action-link-btn"
								@click="editFinance('update', record.id)"
							>
								编辑
							</a-button>
							<a-divider type="vertical" />
							<a-popconfirm
								title="确认删除该笔账目?"
								ok-text="确认"
								cancel-text="取消"
								@confirm="delFinance(record.id)"
								@cancel="cancel"
							>
								<a-button
									type="link"
									size="small"
									danger
									class="action-link-btn"
								>
									删除
								</a-button>
							</a-popconfirm>
						</a-space>
					</template>

					<!-- 类别列：语义化彩色胶囊 -->
					<template v-else-if="column.key === 'typeCode'">
						<span
							v-if="record.typeCode"
							class="category-pill"
							:style="getCategoryPillStyle(record.typeCode)"
							@click="filterByCategory(record.typeCode)"
							:title="`点击仅筛选【${record.typeCode}】`"
						>
							{{ record.typeCode }}
						</span>
						<span v-else class="text-slate-300">-</span>
					</template>

					<!-- 金额列：等宽、红绿收支色彩区分 -->
					<template v-else-if="column.key === 'amount'">
						<span
							:class="[
								'amount-text',
								record.incomeAndExpenses === 'income' ?
									'amount-income'
								:	'amount-expense',
							]"
						>
							{{ record.incomeAndExpenses === 'income' ? '+' : '-' }}¥{{
								formatAmount(record.amount)
							}}
						</span>
					</template>

					<!-- 状态列：圆点 Badge 风格 -->
					<template v-else-if="column.key === 'isValid'">
						<a-badge
							:status="record.isValid === '1' ? 'success' : 'default'"
							:text="record.isValid === '1' ? '有效' : '失效'"
						/>
					</template>

					<!-- 收支类型列 -->
					<template v-else-if="column.key === 'incomeAndExpenses'">
						<a-tag
							:color="
								record.incomeAndExpenses === 'income' ? 'success' : 'error'
							"
							class="type-tag"
						>
							{{ record.incomeAndExpenses === 'income' ? '收入' : '支出' }}
						</a-tag>
					</template>

					<!-- 业务时间列 -->
					<template v-else-if="column.key === 'infoDate'">
						<span class="info-date-text">
							{{ record.infoDate ? formatTime(record.infoDate) : '-' }}
						</span>
					</template>

					<!-- 支付方式列：图标胶囊 -->
					<template v-else-if="column.key === 'fromSource'">
						<div class="from-source-pill">
							<component
								v-if="iconComponentMap[`finance-${record.fromSource}`]"
								:is="iconComponentMap[`finance-${record.fromSource}`]"
								class="from-source-icon"
							/>
							<span>{{ getFromSourceName(record.fromSource) }}</span>
						</div>
					</template>
				</template>
			</a-table>

			<!-- 记账 / 修改明细弹窗 -->
			<finance-manager-detail
				v-model:modelInfo="modelInfo"
				@success="() => query()"
			></finance-manager-detail>
		</div>

		<!-- 调整零花钱预算弹窗 (Taste-Skill 极简现代高质感风格) -->
		<a-modal
			v-model:open="budgetModalVisible"
			:confirm-loading="budgetSaving"
			width="800px"
			:mask-closable="false"
			:destroy-on-close="true"
			@ok="handleSaveBudget"
		>
			<template #title>
				<div
					class="flex items-center gap-2.5 text-slate-800 font-semibold text-base py-0.5"
				>
					<div
						class="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-solid border-blue-100 shadow-2xs"
					>
						<WalletOutlined class="text-base" />
					</div>
					<div>
						<div class="leading-snug">设置 / 调整零花钱预算</div>
						<div class="text-xs font-normal text-slate-400">
							独立设定每月预算额度，支持快捷档位填充与全量/自选分类统计
						</div>
					</div>
				</div>
			</template>

			<a-form
				ref="budgetFormRef"
				:model="budgetEditForm"
				:rules="budgetRules"
				layout="vertical"
				class="space-y-4 py-2"
			>
				<!-- AI 智能助手面板 (Taste-Skill 渐进式折叠 Progressive Disclosure) -->
				<div
					class="rounded-xl border border-solid border-indigo-100/90 bg-gradient-to-br from-indigo-50/50 via-sky-50/30 to-slate-50/50 transition-all shadow-2xs overflow-hidden"
				>
					<!-- 顶部紧凑微卡片 (高度约 40px，默认常驻展示核心 AI 摘要，0 视口压迫) -->
					<div
						class="flex items-center justify-between px-3.5 py-2.5 cursor-pointer select-none hover:bg-white/40 transition-colors"
						@click="isAiExpanded = !isAiExpanded"
					>
						<div class="flex items-center gap-2.5 flex-1 min-w-0 pr-2">
							<div
								class="w-6 h-6 rounded-md bg-indigo-600 text-white flex items-center justify-center shadow-xs text-xs font-semibold shrink-0"
							>
								AI
							</div>
							<div class="flex items-center gap-2 truncate">
								<span class="text-xs font-semibold text-slate-800 shrink-0"
									>AI 智能助手</span
								>
								<!-- 摘要标签 (动态显示) -->
								<template v-if="aiRecommending">
									<span class="text-2xs text-indigo-500 animate-pulse font-normal"
										>正在结合近 3 月消费流水智能测算中...</span
									>
								</template>
								<template v-else-if="aiRecommendData">
									<span
										class="inline-flex items-center px-1.5 py-0.5 rounded text-2xs bg-indigo-100 text-indigo-700 font-medium shrink-0"
									>
										适度推荐 ¥{{ formatAmount(aiRecommendData.moderateAmount) }}
									</span>
									<span
										v-if="aiRecommendData.recommendedCategories?.length"
										class="text-2xs text-slate-500 truncate"
									>
										建议管控: {{ aiRecommendData.recommendedCategories.slice(0, 3).join(' · ') }}
									</span>
								</template>
								<template v-else>
									<span class="text-2xs text-slate-400 font-normal truncate"
										>点击测算智能生成三档预算与重点分类推荐</span
									>
								</template>
							</div>
						</div>

						<div class="flex items-center gap-2 shrink-0" @click.stop>
							<a-button
								type="link"
								size="small"
								class="!text-xs !p-0 !text-indigo-600 hover:!text-indigo-800 font-medium flex items-center gap-1"
								:loading="aiRecommending"
								@click="fetchAiRecommend"
							>
								<ThunderboltOutlined v-if="!aiRecommending" />
								<span>{{ aiRecommendData ? '重测' : '智能测算' }}</span>
							</a-button>
							<span class="text-slate-200 text-xs">|</span>
							<button
								type="button"
								class="cursor-pointer text-xs text-slate-500 hover:text-indigo-600 flex items-center gap-1 bg-transparent border-none p-0 transition-colors"
								@click="isAiExpanded = !isAiExpanded"
							>
								<span>{{ isAiExpanded ? '收起' : '口语配置' }}</span>
								<UpOutlined v-if="isAiExpanded" class="text-2xs" />
								<DownOutlined v-else class="text-2xs" />
							</button>
						</div>
					</div>

					<!-- 展开区域 (带有平滑过渡与边界容器) -->
					<div
						v-if="isAiExpanded"
						class="px-3.5 pb-3.5 pt-1 space-y-3 border-t border-solid border-indigo-100/70 bg-white/40"
					>
						<!-- 一句话指令快捷配置输入 -->
						<div class="flex items-center gap-2">
							<a-input
								v-model:value="aiCommandInput"
								placeholder="口语化输入，如：“帮我设2500预算，重点管餐饮和交通” 或 “不设上限”"
								class="!rounded-lg text-xs"
								allow-clear
								@press-enter="handleAiParseCommand"
							/>
							<a-button
								type="primary"
								size="small"
								class="!rounded-lg !text-xs !h-8 !px-3 !bg-indigo-600 hover:!bg-indigo-500 !border-indigo-600 flex items-center gap-1"
								:loading="aiParsing"
								@click="handleAiParseCommand"
							>
								<span>AI 解析回填</span>
							</a-button>
						</div>

						<!-- 口语化示例 Chips -->
						<div class="flex items-center gap-1.5 flex-wrap text-2xs text-slate-500">
							<span class="text-slate-400">试试指令:</span>
							<button
								v-for="sample in aiCommandSamples"
								:key="sample"
								type="button"
								class="cursor-pointer px-2 py-0.5 rounded-full bg-white/90 hover:bg-white text-slate-600 border border-solid border-indigo-100 hover:border-indigo-300 hover:text-indigo-600 transition-all select-none"
								@click="applyAiCommandSample(sample)"
							>
								{{ sample }}
							</button>
						</div>

						<!-- AI 测算加载骨架态 (防布局跳动 Shimmer) -->
						<div
							v-if="aiRecommending && !aiRecommendData"
							class="bg-white/80 rounded-lg p-3 border border-solid border-indigo-100/60 animate-pulse space-y-2"
						>
							<div class="h-4 bg-indigo-100/60 rounded w-1/3"></div>
							<div class="h-3 bg-slate-100 rounded w-2/3"></div>
							<div class="grid grid-cols-3 gap-2 pt-1">
								<div class="h-10 bg-slate-100 rounded"></div>
								<div class="h-10 bg-indigo-50 rounded"></div>
								<div class="h-10 bg-slate-100 rounded"></div>
							</div>
						</div>

						<!-- AI 测算结果展示区 -->
						<div
							v-else-if="aiRecommendData"
							class="bg-white/95 rounded-lg p-3 border border-solid border-indigo-100/80 space-y-2.5 transition-all shadow-2xs"
						>
							<div class="flex items-start justify-between gap-3">
								<div class="flex-1">
									<div
										class="flex items-center justify-between text-xs text-indigo-900 font-medium"
									>
										<div class="flex items-center gap-1.5">
											<BulbOutlined class="text-amber-500" />
											<span>AI 消费洞察与建议</span>
										</div>
										<span
											v-if="aiRecommendData.isFallback"
											class="text-3xs px-1.5 py-0.2 rounded bg-amber-100 text-amber-700"
											>智能规则模式</span
										>
										<span
											v-else
											class="text-3xs px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-700"
											>大模型深度洞察</span
										>
									</div>
									<div class="text-xs text-slate-600 mt-1 leading-relaxed">
										{{ aiRecommendData.healthAdvice }}
									</div>
									<div
										v-if="aiRecommendData.dailyLimitSuggest"
										class="text-2xs text-slate-400 mt-1"
									>
										建议每日均摊控制在
										<span class="font-mono font-semibold text-indigo-600"
											>¥{{ formatAmount(aiRecommendData.dailyLimitSuggest) }}</span
										>
										以内
									</div>
								</div>
							</div>

							<!-- 三档推荐胶囊快捷采纳 -->
							<div class="pt-1.5 border-t border-solid border-slate-100">
								<div
									class="flex items-center justify-between text-2xs text-slate-400 mb-1.5"
								>
									<span>推荐档位 (点击一键采纳额度):</span>
									<span v-if="aiRecommendData.avgMonthlyExpense"
										>近3月均支出: ¥{{
											formatAmount(aiRecommendData.avgMonthlyExpense)
										}}</span
									>
								</div>
								<div class="grid grid-cols-3 gap-2">
									<div
										class="cursor-pointer p-2 rounded-lg border border-solid transition-all text-center"
										:class="
											budgetEditForm.budgetAmount ===
											aiRecommendData.savingAmount
												? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-2xs'
												: 'bg-slate-50/60 border-slate-200/60 hover:border-indigo-300 text-slate-700'
										"
										@click="applyRecommendTier(aiRecommendData.savingAmount)"
									>
										<div class="text-2xs text-slate-500">节约档 (85%)</div>
										<div class="text-xs font-bold font-mono mt-0.5">
											¥{{ formatAmount(aiRecommendData.savingAmount) }}
										</div>
									</div>
									<div
										class="cursor-pointer p-2 rounded-lg border border-solid transition-all text-center relative"
										:class="
											budgetEditForm.budgetAmount ===
											aiRecommendData.moderateAmount
												? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-2xs ring-1 ring-indigo-300'
												: 'bg-slate-50/60 border-slate-200/60 hover:border-indigo-300 text-slate-700'
										"
										@click="applyRecommendTier(aiRecommendData.moderateAmount)"
									>
										<span
											class="absolute -top-1.5 right-1 px-1 rounded text-3xs bg-indigo-600 text-white leading-tight"
											>推荐</span
										>
										<div class="text-2xs text-indigo-600 font-medium">
											适度档 (100%)
										</div>
										<div
											class="text-xs font-bold font-mono mt-0.5 text-indigo-700"
										>
											¥{{ formatAmount(aiRecommendData.moderateAmount) }}
										</div>
									</div>
									<div
										class="cursor-pointer p-2 rounded-lg border border-solid transition-all text-center"
										:class="
											budgetEditForm.budgetAmount ===
											aiRecommendData.relaxedAmount
												? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-2xs'
												: 'bg-slate-50/60 border-slate-200/60 hover:border-indigo-300 text-slate-700'
										"
										@click="applyRecommendTier(aiRecommendData.relaxedAmount)"
									>
										<div class="text-2xs text-slate-500">宽松档 (115%)</div>
										<div class="text-xs font-bold font-mono mt-0.5">
											¥{{ formatAmount(aiRecommendData.relaxedAmount) }}
										</div>
									</div>
								</div>
							</div>

							<!-- AI 建议重点分类一键采纳 -->
							<div
								v-if="aiRecommendData.recommendedCategories?.length"
								class="flex items-center justify-between pt-1.5 border-t border-solid border-slate-100 text-2xs"
							>
								<div class="flex items-center gap-1.5 text-slate-600">
									<span>AI 建议重点管控:</span>
									<div class="flex items-center gap-1 flex-wrap">
										<span
											v-for="cat in aiRecommendData.recommendedCategories"
											:key="cat"
											class="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 border border-solid border-indigo-100 font-medium"
										>
											{{ cat }}
										</span>
									</div>
								</div>
								<a-button
									type="link"
									size="small"
									class="!text-2xs !p-0 !text-indigo-600 hover:!text-indigo-800 font-medium"
									@click="
										applyRecommendedCategories(
											aiRecommendData.recommendedCategories,
										)
									"
								>
									一键采用推荐分类
								</a-button>
							</div>
						</div>
					</div>
				</div>

				<!-- 1. 预算额度与快捷填充卡片 -->
				<div
					class="bg-slate-50/70 rounded-xl p-4 border border-solid border-slate-200/80 space-y-3"
				>
					<div class="flex items-center justify-between">
						<span class="text-sm font-medium text-slate-700">预算月份</span>
						<div class="flex items-center gap-2">
							<span
								class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100/80 text-blue-700 border border-solid border-blue-200/60 font-mono"
							>
								{{ currentMonthStr }}
							</span>
							<span class="text-xs text-slate-400"
								>每月独立保存，次月自动继承</span
							>
						</div>
					</div>

					<a-form-item name="budgetAmount" class="!mb-0">
						<template #label>
							<div class="flex flex-col text-left">
								<span class="text-sm font-medium text-slate-700"
									>月度预算额度</span
								>
								<span class="text-xs text-slate-400 font-normal"
									>设为 0 表示不设置限额</span
								>
							</div>
						</template>
						<a-input-number
							v-model:value="budgetEditForm.budgetAmount"
							:min="0"
							:precision="2"
							prefix="¥"
							placeholder="0.00"
							:class="[
								'w-full !rounded-lg font-mono font-medium transition-all duration-500',
								isBudgetHighlighted
									? '!ring-2 !ring-indigo-400/90 !ring-offset-1 !border-indigo-500 shadow-xs'
									: '',
							]"
						/>
					</a-form-item>

					<!-- 快捷档位无边框胶囊，融入输入卡片 -->
					<div class="flex items-center justify-between pt-1">
						<span class="text-xs text-slate-400">快捷填充</span>
						<div class="flex items-center gap-1.5 flex-wrap">
							<!-- 融入 AI 适度推荐档位 (若就绪) -->
							<button
								v-if="aiRecommendData?.moderateAmount"
								type="button"
								:class="[
									'cursor-pointer px-2.5 py-1 rounded-md text-xs font-medium transition-all select-none border border-solid flex items-center gap-1',
									budgetEditForm.budgetAmount ===
									aiRecommendData.moderateAmount
										? '!bg-indigo-600 !text-white !border-indigo-600 shadow-2xs'
										: 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:border-indigo-400 hover:bg-indigo-100',
								]"
								@click="
									applyRecommendTier(aiRecommendData.moderateAmount)
								"
							>
								<span
									class="text-3xs px-1 rounded bg-indigo-500/20 text-indigo-900 font-bold"
									>AI推荐</span
								>
								<span
									>¥{{
										formatAmount(aiRecommendData.moderateAmount)
									}}</span
								>
							</button>

							<button
								v-for="preset in QUICK_BUDGET_PRESETS"
								:key="preset"
								type="button"
								:class="[
									'cursor-pointer px-2.5 py-1 rounded-md text-xs font-medium transition-all select-none border border-solid',
									budgetEditForm.budgetAmount === preset
										? '!bg-blue-600 !text-white !border-blue-600 shadow-2xs'
										: 'bg-white text-slate-600 border-slate-200 hover:border-blue-400 hover:text-blue-600',
								]"
								@click="applyQuickPreset(preset)"
							>
								¥{{ preset }}
							</button>
							<button
								type="button"
								:class="[
									'cursor-pointer px-2.5 py-1 rounded-md text-xs font-medium transition-all select-none border border-solid',
									budgetEditForm.budgetAmount === 0
										? '!bg-slate-700 !text-white !border-slate-700 shadow-2xs'
										: 'bg-white text-slate-500 border-slate-200 hover:border-slate-300',
								]"
								@click="applyQuickPreset(0)"
							>
								不设上限
							</button>
						</div>
					</div>
				</div>

				<!-- 2. 统计范围与收支方向卡片 (自然心智流 + 无分割线容器化) -->
				<div
					class="bg-slate-50/70 rounded-xl p-4 border border-solid border-slate-200/80 space-y-3.5"
				>
					<!-- 收支方向全局前置 -->
					<a-form-item name="selectedDirections" class="!mb-0">
						<template #label>
							<div class="flex items-center justify-between w-full">
								<span class="text-xs font-medium text-slate-700"
									>收支方向:</span
								>
								<span class="text-xs text-slate-400 font-normal">
									{{
										budgetEditForm.selectedDirections.length === 2 ? '双向统计'
										: isDirectionSelected('income') ? '仅限收入'
										: '仅限支出'
									}}
								</span>
							</div>
						</template>
						<div class="flex items-center gap-2">
							<button
								type="button"
								:class="[
									'cursor-pointer px-3 py-1 rounded-lg text-xs font-medium transition-all select-none border border-solid flex items-center gap-1.5',
									isDirectionSelected('expense') ?
										'bg-rose-50/90 text-rose-600 border-rose-300 shadow-2xs ring-1 ring-rose-200'
									:	'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50',
								]"
								@click="toggleDirection('expense')"
							>
								<CheckOutlined
									v-if="isDirectionSelected('expense')"
									class="text-xs"
								/>
								<span>支出 (消费)</span>
							</button>
							<button
								type="button"
								:class="[
									'cursor-pointer px-3 py-1 rounded-lg text-xs font-medium transition-all select-none border border-solid flex items-center gap-1.5',
									isDirectionSelected('income') ?
										'bg-emerald-50/90 text-emerald-600 border-emerald-300 shadow-2xs ring-1 ring-emerald-200'
									:	'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50',
								]"
								@click="toggleDirection('income')"
							>
								<CheckOutlined
									v-if="isDirectionSelected('income')"
									class="text-xs"
								/>
								<span>收入</span>
							</button>
						</div>
					</a-form-item>

					<!-- 统计范畴控制器 (紧随其后) -->
					<div class="flex items-center justify-between pt-0.5">
						<div class="flex items-center gap-1.5">
							<span class="text-xs font-medium text-slate-700">统计范畴</span>
							<a-tooltip
								title="全量日常模式自动汇总当月所有非转账类别的日常收支；自选模式可精细勾选特定消费分类"
							>
								<QuestionCircleOutlined
									class="text-slate-400 hover:text-slate-600 cursor-pointer text-xs"
								/>
							</a-tooltip>
						</div>

						<!-- 原生 Segmented 分段切换，自带丝滑滑块 -->
						<a-segmented
							v-model:value="scopeMode"
							:options="scopeModeOptions"
							class="!rounded-lg text-xs"
						/>
					</div>

					<!-- 自选分类列表 (紧贴控制器展开，白底微质感内嵌容器，无割裂线) -->
					<div
						v-if="scopeMode === 'custom'"
						:class="[
							'bg-white rounded-xl p-3.5 border border-solid border-slate-200/70 shadow-2xs space-y-2.5 transition-all duration-500',
							isCategoriesHighlighted
								? 'ring-2 ring-indigo-400/90 ring-offset-1 !border-indigo-400 shadow-xs'
								: '',
						]"
					>
						<div class="flex items-center justify-between text-xs">
							<div class="flex items-center gap-1.5">
								<span class="text-slate-600 font-medium"
									>选择纳入预算的分类</span
								>
								<span
									class="inline-flex items-center px-1.5 py-0.2 rounded-full text-2xs font-semibold bg-blue-50 text-blue-600 border border-solid border-blue-200/50 font-mono"
								>
									已选 {{ budgetEditForm.categoryCodes.length }} 项
								</span>
							</div>
							<div class="flex items-center gap-2">
								<a-button
									type="link"
									size="small"
									class="!text-xs !p-0 !text-blue-600 font-medium"
									@click="selectAllCategories"
								>
									全选
								</a-button>
								<span class="text-slate-200 text-xs">|</span>
								<a-button
									type="link"
									size="small"
									class="!text-xs !p-0 !text-slate-400 hover:!text-slate-600"
									@click="clearAllCategories"
								>
									清空
								</a-button>
							</div>
						</div>

						<!-- 现代全圆角灵动微胶囊 Pills -->
						<div
							v-if="availableCategories.length"
							class="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1 py-0.5"
						>
							<div
								v-for="cat in availableCategories"
								:key="cat"
								:class="[
									'cursor-pointer px-3 py-1 rounded-full text-xs font-medium transition-all select-none flex items-center gap-1.5 border border-solid active:scale-95',
									isCategorySelected(cat) ?
										'bg-blue-600 border-blue-600 text-white shadow-xs'
									:	'bg-slate-50 border-slate-200/80 text-slate-600 hover:border-slate-300 hover:bg-slate-100/70',
								]"
								@click="toggleCategory(cat)"
							>
								<CheckOutlined
									v-if="isCategorySelected(cat)"
									class="text-2xs"
								/>
								<span>{{ cat }}</span>
							</div>
						</div>
					</div>
				</div>

				<!-- 3. 实时试算与健康度模拟卡片 (高质感金融轻量卡片) -->
				<div
					class="bg-slate-50/80 rounded-xl p-3.5 border border-solid border-slate-200/80 space-y-2.5"
				>
					<div class="flex items-center justify-between text-xs">
						<span class="font-medium flex items-center gap-1.5 text-slate-700">
							<BarChartOutlined class="text-blue-500" />
							<span>实时试算与健康度模拟</span>
						</span>
						<span
							v-if="previewStats.budget > 0"
							:class="[
								'font-medium',
								previewStats.isOver ?
									'text-rose-600 font-semibold'
								:	'text-blue-600',
							]"
						>
							{{
								previewStats.isOver ? '预算已透支超额' : (
									`已使用 ${previewStats.percent}%`
								)
							}}
						</span>
						<span v-else class="text-slate-400">未设置限额</span>
					</div>

					<div class="grid grid-cols-3 gap-2">
						<div
							class="bg-white p-2.5 rounded-lg border border-solid border-slate-200/60 shadow-2xs"
						>
							<div class="text-xs text-slate-400">设定预算</div>
							<div
								class="text-sm font-semibold text-slate-800 mt-0.5 font-mono"
							>
								¥{{
									previewStats.budget > 0 ?
										formatAmount(previewStats.budget)
									:	'无上限'
								}}
							</div>
						</div>
						<div
							class="bg-white p-2.5 rounded-lg border border-solid border-slate-200/60 shadow-2xs"
						>
							<div class="text-xs text-slate-400">本月已计</div>
							<div
								class="text-sm font-semibold text-slate-700 mt-0.5 font-mono"
							>
								<span
									v-if="simulationLoading"
									class="text-xs text-slate-400 font-normal"
									>计算中...</span
								>
								<span v-else>
									{{ previewStats.actual < 0 ? '-' : '' }}¥{{
										formatAmount(Math.abs(previewStats.actual))
									}}
								</span>
							</div>
						</div>
						<div
							class="bg-white p-2.5 rounded-lg border border-solid border-slate-200/60 shadow-2xs"
						>
							<div class="text-xs text-slate-400">试算结余</div>
							<div
								:class="[
									'text-sm font-semibold mt-0.5 font-mono',
									previewStats.isOver ? 'text-rose-600' : 'text-emerald-600',
								]"
							>
								<span
									v-if="simulationLoading"
									class="text-xs text-slate-400 font-normal"
									>计算中...</span
								>
								<span v-else>
									{{ previewStats.remaining < 0 ? '-' : '' }}¥{{
										formatAmount(Math.abs(previewStats.remaining))
									}}
								</span>
							</div>
						</div>
					</div>

					<div v-if="previewStats.budget > 0" class="pt-0.5">
						<a-progress
							:percent="Math.max(0, Math.min(previewStats.percent, 100))"
							:status="previewStats.isOver ? 'exception' : 'active'"
							:stroke-color="getBudgetProgressColor(previewStats.percent)"
							:show-info="false"
							size="small"
						/>
					</div>
				</div>
			</a-form>

			<template #footer>
				<div class="flex items-center justify-end gap-2.5 pt-2">
					<a-button @click="budgetModalVisible = false" class="!rounded-lg"
						>取消</a-button
					>
					<a-button
						type="primary"
						:loading="budgetSaving"
						class="!rounded-lg !bg-blue-600 hover:!bg-blue-500"
						@click="handleSaveBudget"
					>
						保存配置
					</a-button>
				</div>
			</template>
		</a-modal>
	</div>
</template>

<script setup lang="ts">
import type { FormInstance } from 'ant-design-vue';
import type { Rule } from 'ant-design-vue/es/form';
import { message } from 'ant-design-vue';
import {
	formatTime,
	formatDate,
	formatMonth,
	formatDayjs,
	nowDayjs,
	getMonthRange,
	getMonthRangeDayjs,
} from '@/utils/dayjs';
import type { ModelInfo } from '@/views/common/config';
import type {
	FinanceManagerData,
	FinanceBudgetStatusVo,
	FinanceBudgetAiRecommendVo,
	FinanceBudgetAiParseVo,
} from '@/views/finance/financeManager/config';
import {
	columns,
	fromSourceTransferList,
} from '@/views/finance/financeManager/config';
import { iconComponentMap } from '@/views/common/config';
import { formatAmount } from '@/utils/amountInfo';
import {
	getFinanceMangerPage,
	deleteFinanceManger,
	getFinanceSummary,
	getBudgetStatus,
	saveMonthlyBudget,
	getBudgetCategories,
	recommendBudget,
	parseBudgetCommand,
	type FinanceSummaryData,
} from '@/views/finance/financeManager/api';
import { useUserStore } from '@/store/modules/user/user';
import {
	CalendarOutlined,
	PlusOutlined,
	DeleteOutlined,
	WalletOutlined,
	SettingOutlined,
	BarChartOutlined,
	QuestionCircleOutlined,
	CheckOutlined,
	ThunderboltOutlined,
	BulbOutlined,
	DownOutlined,
	UpOutlined,
} from '@ant-design/icons-vue';

// 选中的 ID 列表（严格 string 类型）
const {
	selectedRowKeys: selectedRowIds,
	rowSelection,
	clearSelected,
} = useRowSelection();

// 使用分页组合式函数，直接绑定查询回调，消除包装函数
const { pagination, handleTableChange, setTotal, resetPagination } =
	usePagination({
		onChange: (paginationInfo) => {
			const queryParam = buildQueryParams(searchInfo.value);
			getFinancePage(queryParam, paginationInfo);
		},
	});

const route = useRoute();
const userStore = useUserStore();

const searchInfo = ref<FinanceManagerData>({});
const loading = ref<boolean>(false);
const dataSource = ref<FinanceManagerData[]>([]);
const modelInfo = ref<ModelInfo>({});

// 服务端多维动态聚合统计
const summaryData = ref<FinanceSummaryData>({
	totalExpense: 0,
	totalIncome: 0,
	totalBalance: 0,
	totalCount: 0,
});
const summaryLoading = ref<boolean>(false);
const isFirstSummaryLoaded = ref<boolean>(false);

// 零花钱月度预算状态
const currentMonthStr = computed(() => formatMonth());
const budgetStatus = ref<FinanceBudgetStatusVo | null>(null);
const budgetLoading = ref<boolean>(false);
const isFirstBudgetLoaded = ref<boolean>(false);
const budgetModalVisible = ref<boolean>(false);
const budgetSaving = ref<boolean>(false);
const budgetFormRef = ref<FormInstance>();
const budgetEditForm = reactive({
	budgetAmount: 0,
	incomeAndExpenses: 'expense',
	selectedDirections: ['expense'] as string[],
	categoryCodes: [] as string[],
});

// 预算表单校验规则
const budgetRules: Record<string, Rule[]> = {
	budgetAmount: [
		{
			required: true,
			validator: async (_rule, value) => {
				if (value === null || value === undefined || value === '') {
					return Promise.reject('预算金额不能为空');
				}
				if (Number(value) < 0) {
					return Promise.reject('预算金额不能为负数');
				}
				return Promise.resolve();
			},
			trigger: ['change', 'blur'],
		},
	],
	selectedDirections: [
		{
			required: true,
			validator: async (_rule, value) => {
				if (!value || !value.length) {
					return Promise.reject('收支方向至少需要选择一项');
				}
				return Promise.resolve();
			},
			trigger: 'change',
		},
	],
};

// 快捷预算金额档位
const QUICK_BUDGET_PRESETS = [1000, 2000, 3000, 5000];

// 统计范围模式: 'all' 全部流水(推荐) | 'custom' 指定特定分类
const scopeMode = ref<'all' | 'custom'>('all');
const scopeModeOptions = [
	{ label: '全部日常账目 (推荐)', value: 'all' },
	{ label: '自选专属分类', value: 'custom' },
];

// 系统内置基础分类（防止新月份或新用户记账较少时分类池为空）
const SYSTEM_DEFAULT_CATEGORIES = [
	'餐饮美食',
	'日用百货',
	'交通出行',
	'休闲娱乐',
	'数码电器',
	'服饰美容',
	'医疗保健',
	'住房物业',
	'人情往来',
	'工资薪酬',
];

const isDirectionSelected = (dir: string) => {
	return budgetEditForm.selectedDirections.includes(dir);
};

const toggleDirection = (dir: string) => {
	const current = [...budgetEditForm.selectedDirections];
	const idx = current.indexOf(dir);
	if (idx > -1) {
		if (current.length === 1) {
			message.info('收支类型至少需要保留一项');
			return;
		}
		current.splice(idx, 1);
	} else {
		current.push(dir);
	}
	budgetEditForm.selectedDirections = current;
	budgetEditForm.incomeAndExpenses = current.join(',');
	budgetFormRef.value?.validateFields(['selectedDirections']).catch(() => {});
};

const applyQuickPreset = (amount: number) => {
	budgetEditForm.budgetAmount = amount;
	budgetFormRef.value?.validateFields(['budgetAmount']).catch(() => {});
};

const budgetDirectionLabel = computed(() => {
	const dir = budgetStatus.value?.incomeAndExpenses || 'expense';
	const hasExp = dir.includes('expense');
	const hasInc = dir.includes('income');
	if (hasExp && hasInc) return '全部收支';
	if (hasInc) return '全部收入';
	return '全部支出';
});

const budgetSpentLabel = computed(() => {
	const dir = budgetStatus.value?.incomeAndExpenses || 'expense';
	const hasExp = dir.includes('expense');
	const hasInc = dir.includes('income');
	if (hasExp && hasInc) return '已计';
	if (hasInc) return '已入';
	return '已用';
});

/**
 * 根据预算使用率返回语义色阶 (Taste-Skill 财务风控色板)
 * - < 0%: 净结余充裕 (翡翠绿 #52c41a)
 * - [0%, 75%): 常规安全 (品牌蓝 #1677ff)
 * - [75%, 90%): 适度关注 (琥珀黄 #faad14)
 * - [90%, 100%): 临界高压 (火山橙 #fa541c)
 * - [100%, 150%): 超支破线 (警示红 #ff4d4f)
 * - >= 150%: 严重爆表 (深绛红 #cf1322)
 */
const getBudgetProgressColor = (percent: number): string => {
	if (percent < 0) return '#52c41a';
	if (percent >= 150) return '#cf1322';
	if (percent >= 100) return '#ff4d4f';
	if (percent >= 90) return '#fa541c';
	if (percent >= 75) return '#faad14';
	return '#1677ff';
};

const progressStrokeColor = computed(() => {
	const pct = budgetStatus.value?.usagePercent || 0;
	return getBudgetProgressColor(pct);
});

const recentCategories = ref<string[]>([]);
const categoriesLoading = ref<boolean>(false);

// 可用分类集合：合并系统默认分类与近两月流水分类并去重
const availableCategories = computed(() => {
	const set = new Set<string>();
	SYSTEM_DEFAULT_CATEGORIES.forEach((c) => set.add(c));
	recentCategories.value.forEach((c) => {
		if (
			c &&
			c !== '支出' &&
			c !== '收入' &&
			c !== 'expense' &&
			c !== 'income'
		) {
			set.add(c);
		}
	});
	return Array.from(set);
});

const simulatedActualExpense = ref<number>(0);
const simulationLoading = ref<boolean>(false);

// 预算实时试算：根据当前弹窗选择的收支方向、统计模式与自选分类动态调用汇总
const fetchPreviewSimulation = async () => {
	simulationLoading.value = true;
	try {
		const [monthStart, monthEnd] = getMonthRange();
		const effectiveCategoryCodes =
			scopeMode.value === 'all' ?
				[]
			:	budgetEditForm.categoryCodes.filter(
					(c) =>
						c !== '支出' && c !== '收入' && c !== 'expense' && c !== 'income',
				);

		// 如果选择自选模式但未勾选任何具体分类，则当月已计直接为 0
		if (scopeMode.value === 'custom' && effectiveCategoryCodes.length === 0) {
			simulatedActualExpense.value = 0;
			return;
		}

		const dirs = budgetEditForm.selectedDirections;
		const hasExp = dirs.includes('expense');
		const hasInc = dirs.includes('income');

		const queryParams: FinanceManagerData = {
			infoDateStart: monthStart,
			infoDateEnd: monthEnd,
			belongTo: getEffectiveBudgetBelongTo(),
			isValid: '1',
		};

		if (effectiveCategoryCodes.length > 0) {
			queryParams.typeCodes = effectiveCategoryCodes;
		}

		if (hasExp && hasInc) {
			queryParams.incomeAndExpenses = undefined;
		} else if (hasInc) {
			queryParams.incomeAndExpenses = 'income';
		} else {
			queryParams.incomeAndExpenses = 'expense';
		}

		const { code, data } = await getFinanceSummary(queryParams);
		if (code === '200' && data) {
			const exp = Number(data.totalExpense || 0);
			const inc = Number(data.totalIncome || 0);
			if (hasExp && hasInc) {
				// 双选净支出: 支出 - 收入
				simulatedActualExpense.value = Number((exp - inc).toFixed(2));
			} else if (hasInc) {
				// 仅收入
				simulatedActualExpense.value = Number(inc.toFixed(2));
			} else {
				// 仅支出
				simulatedActualExpense.value = Number(exp.toFixed(2));
			}
		}
	} catch (e) {
		console.warn('预算动态试算失败:', e);
	} finally {
		simulationLoading.value = false;
	}
};

let simulationTimer: ReturnType<typeof setTimeout> | null = null;
const triggerSimulationDebounced = () => {
	if (simulationTimer) {
		clearTimeout(simulationTimer);
	}
	simulationTimer = setTimeout(() => {
		fetchPreviewSimulation();
	}, 150);
};

// 监听影响已计流水统计的维度：收支方向、统计模式、具体分类列表
watch(
	[
		() => budgetEditForm.selectedDirections,
		() => scopeMode.value,
		() => budgetEditForm.categoryCodes,
	],
	() => {
		if (budgetModalVisible.value) {
			triggerSimulationDebounced();
		}
	},
	{ deep: true },
);

// 弹窗内实时试算与健康度预警
const previewStats = computed(() => {
	const budget = Number(budgetEditForm.budgetAmount || 0);
	const actual = simulatedActualExpense.value;
	const remaining = budget > 0 ? Number((budget - actual).toFixed(2)) : 0;
	const percent =
		budget > 0 ?
			actual > 0 ?
				Math.min(Math.round((actual / budget) * 100), 100)
			:	0
		:	0;
	const isOver = budget > 0 && actual > budget;
	return {
		budget,
		actual,
		remaining,
		percent,
		isOver,
	};
});

const isCategorySelected = (cat: string) => {
	return budgetEditForm.categoryCodes.includes(cat);
};

const toggleCategory = (cat: string) => {
	const idx = budgetEditForm.categoryCodes.indexOf(cat);
	if (idx > -1) {
		budgetEditForm.categoryCodes.splice(idx, 1);
	} else {
		budgetEditForm.categoryCodes.push(cat);
	}
};

const selectAllCategories = () => {
	budgetEditForm.categoryCodes = [...availableCategories.value];
};

const clearAllCategories = () => {
	budgetEditForm.categoryCodes = [];
};

const getEffectiveBudgetBelongTo = (): string | undefined => {
	if (searchInfo.value.belongTo) {
		return String(searchInfo.value.belongTo);
	}
	return undefined;
};

const fetchRecentCategories = async () => {
	categoriesLoading.value = true;
	try {
		const { code, data } = await getBudgetCategories(
			currentMonthStr.value,
			getEffectiveBudgetBelongTo(),
		);
		if (code === '200' && Array.isArray(data)) {
			const cleanData = data.filter(
				(c) =>
					c !== '支出' && c !== '收入' && c !== 'expense' && c !== 'income',
			);
			const existingSelected = budgetEditForm.categoryCodes.filter(
				(c) =>
					c !== '支出' && c !== '收入' && c !== 'expense' && c !== 'income',
			);
			recentCategories.value = Array.from(
				new Set([...cleanData, ...existingSelected]),
			).sort();
		}
	} catch (e) {
		console.warn('获取近两月记账类别失败:', e);
	} finally {
		categoriesLoading.value = false;
	}
};

const loadBudgetStatus = async () => {
	budgetLoading.value = true;
	try {
		const { code, data } = await getBudgetStatus(
			currentMonthStr.value,
			getEffectiveBudgetBelongTo(),
		);
		if (code === '200' && data) {
			budgetStatus.value = data;
		}
	} catch (e) {
		console.warn('获取零花钱预算失败:', e);
	} finally {
		budgetLoading.value = false;
		isFirstBudgetLoaded.value = true;
	}
};

const openBudgetModal = async () => {
	budgetEditForm.budgetAmount = Number(budgetStatus.value?.budgetAmount || 0);
	const rawDir = budgetStatus.value?.incomeAndExpenses || 'expense';
	const parsed = rawDir
		.split(',')
		.map((s) => s.trim().toLowerCase())
		.filter((s) => s === 'expense' || s === 'income');
	budgetEditForm.selectedDirections = parsed.length ? parsed : ['expense'];
	budgetEditForm.incomeAndExpenses =
		budgetEditForm.selectedDirections.join(',');
	const existingCats = [...(budgetStatus.value?.categoryCodes || [])].filter(
		(c) => c !== '支出' && c !== '收入' && c !== 'expense' && c !== 'income',
	);
	budgetEditForm.categoryCodes = existingCats;
	scopeMode.value = existingCats.length > 0 ? 'custom' : 'all';
	aiCommandInput.value = '';
	isAiExpanded.value = false;
	if (!aiRecommendData.value) {
		fetchAiRecommend();
	}
	budgetModalVisible.value = true;
	nextTick(() => {
		budgetFormRef.value?.clearValidate();
	});
	fetchPreviewSimulation();
	await fetchRecentCategories();
};

// AI 智能预算测算与解析状态
const isAiExpanded = ref<boolean>(false);
const isBudgetHighlighted = ref<boolean>(false);
const isCategoriesHighlighted = ref<boolean>(false);
const aiRecommending = ref<boolean>(false);
const aiParsing = ref<boolean>(false);
const aiCommandInput = ref<string>('');
const aiRecommendData = ref<FinanceBudgetAiRecommendVo | null>(null);

const triggerBudgetHighlight = () => {
	isBudgetHighlighted.value = true;
	setTimeout(() => {
		isBudgetHighlighted.value = false;
	}, 1200);
};

const triggerCategoriesHighlight = () => {
	isCategoriesHighlighted.value = true;
	setTimeout(() => {
		isCategoriesHighlighted.value = false;
	}, 1200);
};

const aiCommandSamples = [
	'帮我设2500预算，重点管餐饮和交通',
	'每月2000管餐饮',
	'不设上限',
	'设3000预算双向统计',
];

const applyAiCommandSample = (sample: string) => {
	aiCommandInput.value = sample;
	handleAiParseCommand();
};

const fetchAiRecommend = async () => {
	aiRecommending.value = true;
	try {
		const targetBelongTo =
			getEffectiveBudgetBelongTo() ||
			((
				userStore.getUserInfo?.id !== undefined &&
				userStore.getUserInfo?.id !== null
			) ?
				String(userStore.getUserInfo.id)
			:	undefined);
		const { code, data, message: msg } = await recommendBudget({
			budgetMonth: currentMonthStr.value,
			belongTo: targetBelongTo,
		});
		if (code === '200' && data) {
			aiRecommendData.value = data;
			message.success('AI 智能测算完成');
		} else {
			message.warning(msg || 'AI 测算服务暂不可用');
		}
	} catch (e: any) {
		message.error(e?.message || '获取 AI 推荐失败');
	} finally {
		aiRecommending.value = false;
	}
};

const handleAiParseCommand = async () => {
	if (!aiCommandInput.value || !aiCommandInput.value.trim()) {
		message.warning('请输入指令内容');
		return;
	}
	aiParsing.value = true;
	try {
		const { code, data, message: msg } = await parseBudgetCommand({
			command: aiCommandInput.value.trim(),
			budgetMonth: currentMonthStr.value,
		});
		if (code === '200' && data) {
			if (
				data.hasBudget &&
				data.amount !== undefined &&
				data.amount !== null
			) {
				budgetEditForm.budgetAmount = Number(data.amount);
				triggerBudgetHighlight();
			}
			if (data.hasCategories && data.categories && data.categories.length > 0) {
				scopeMode.value = 'custom';
				const matched = data.categories.filter((c) =>
					availableCategories.value.includes(c),
				);
				budgetEditForm.categoryCodes =
					matched.length > 0 ? matched : data.categories;
				triggerCategoriesHighlight();
			}
			message.success(data.reasoning || '已根据 AI 指令更新预算设定');
		} else {
			message.warning(msg || '未能解析该指令');
		}
	} catch (e: any) {
		message.error(e?.message || 'AI 指令解析失败');
	} finally {
		aiParsing.value = false;
	}
};

const applyRecommendTier = (amount?: number) => {
	if (amount !== undefined && amount !== null) {
		budgetEditForm.budgetAmount = Number(amount);
		triggerBudgetHighlight();
	}
};

const applyRecommendedCategories = (categories?: string[]) => {
	if (!categories || !categories.length) return;
	scopeMode.value = 'custom';
	const matched = categories.filter((c) =>
		availableCategories.value.includes(c),
	);
	budgetEditForm.categoryCodes =
		matched.length > 0 ? matched : [...categories];
	triggerCategoriesHighlight();
	message.success('已切换为自选模式并应用推荐分类');
};

const handleSaveBudget = async () => {
	try {
		await budgetFormRef.value?.validate();
	} catch {
		return;
	}
	budgetSaving.value = true;
	try {
		const effectiveCategoryCodes =
			scopeMode.value === 'all' ?
				[]
			:	budgetEditForm.categoryCodes.filter(
					(c) =>
						c !== '支出' && c !== '收入' && c !== 'expense' && c !== 'income',
				);
		const saveBelongTo =
			getEffectiveBudgetBelongTo() ||
			((
				userStore.getUserInfo?.id !== undefined &&
				userStore.getUserInfo?.id !== null
			) ?
				String(userStore.getUserInfo?.id)
			:	undefined);
		const { code, message: msg } = await saveMonthlyBudget({
			budgetMonth: currentMonthStr.value,
			yearMonth: currentMonthStr.value,
			belongTo: saveBelongTo,
			incomeAndExpenses: budgetEditForm.selectedDirections.join(','),
			budgetAmount: budgetEditForm.budgetAmount,
			categoryCodes: effectiveCategoryCodes,
		});
		if (code === '200') {
			message.success('零花钱预算已更新');
			budgetModalVisible.value = false;
			await loadBudgetStatus();
		} else {
			message.error(msg || '保存失败');
		}
	} catch (e: any) {
		message.error(e?.message || '保存预算失败');
	} finally {
		budgetSaving.value = false;
	}
};

watch(
	() => searchInfo.value.belongTo,
	() => {
		loadBudgetStatus();
	},
);

// 统计标签标题自适应
const summaryTitle = computed(() => {
	const start = searchInfo.value.infoDateStart;
	const end = searchInfo.value.infoDateEnd;
	if (start && end) {
		const startStr = formatDate(start);
		const endStr = formatDate(end);
		if (startStr === endStr) {
			return `${startStr} 账单`;
		}
		if (formatMonth(start) === formatMonth(end)) {
			return `${formatDate(start, 'YYYY年M月')} 账单`;
		}
		return `${formatDate(start, 'M/D')} ~ ${formatDate(end, 'M/D')} 统计`;
	}
	if (start) {
		return `自 ${formatDate(start)} 起`;
	}
	if (end) {
		return `至 ${formatDate(end)} 止`;
	}
	return '全量账单统计';
});

// 有效统计天数计算（用于日均支出）
const effectiveDaysInfo = computed(() => {
	const start = searchInfo.value.infoDateStart;
	const end = searchInfo.value.infoDateEnd;
	const today = nowDayjs().startOf('day');

	if (start && end) {
		const startDate = formatDayjs(start).startOf('day');
		const endDate = formatDayjs(end).endOf('day');
		// 若为当月（起始为当月1号），按当月已过天数统计更贴合真实花销节奏
		const isCurrentMonth =
			startDate.isSame(today, 'month') && startDate.date() === 1;
		if (isCurrentMonth && !today.isAfter(endDate, 'day')) {
			const passedDays = today.diff(startDate, 'day') + 1;
			return {
				days: Math.max(1, passedDays),
				label: `本月已过 ${passedDays} 天`,
			};
		}
		const diffDays = Math.max(1, formatDayjs(end).diff(formatDayjs(start), 'day') + 1);
		return { days: diffDays, label: `区间共 ${diffDays} 天` };
	}

	if (start) {
		const startDate = formatDayjs(start).startOf('day');
		const diffDays = Math.max(1, today.diff(startDate, 'day') + 1);
		return { days: diffDays, label: `已过 ${diffDays} 天` };
	}

	if (end) {
		return { days: 30, label: '参考 30 天' };
	}

	// 全量未设时间筛选时，默认以当月已过天数为参考
	const daysThisMonth = today.date();
	return {
		days: Math.max(1, daysThisMonth),
		label: `参考本月已过 ${daysThisMonth} 天`,
	};
});

// 日均支出
const dailyExpenseAvg = computed(() => {
	const totalExp = Number(summaryData.value?.totalExpense) || 0;
	if (totalExp <= 0) return 0;
	const days = effectiveDaysInfo.value.days;
	return Number((totalExp / days).toFixed(2));
});

// Top 3 支出分类结构统计
interface TopExpenseCategoryItem {
	name: string;
	amount: number;
	percent: number;
}

const topExpenseCategories = computed<TopExpenseCategoryItem[]>(() => {
	const records = dataSource.value || [];
	const expenseMap = new Map<string, number>();
	let totalExpenseInList = 0;

	for (const item of records) {
		const isExpense =
			item.incomeAndExpenses === 'expense' ||
			(!item.incomeAndExpenses && (Number(item.amount) || 0) < 0);
		if (isExpense && item.typeCode) {
			const amt = Math.abs(Number(item.amount) || 0);
			if (amt > 0) {
				expenseMap.set(
					item.typeCode,
					(expenseMap.get(item.typeCode) || 0) + amt,
				);
				totalExpenseInList += amt;
			}
		}
	}

	if (expenseMap.size === 0 || totalExpenseInList <= 0) {
		return [];
	}

	const sorted = Array.from(expenseMap.entries())
		.map(([name, amount]) => ({
			name,
			amount,
			percent: Math.round((amount / totalExpenseInList) * 100),
		}))
		.sort((a, b) => b.amount - a.amount);

	return sorted.slice(0, 3);
});

// 构建规整后的查询参数（过滤空字符串并格式化日期）
const buildQueryParams = (param: FinanceManagerData): FinanceManagerData => {
	return {
		...param,
		name: param.name?.trim() || undefined,
		typeCode: param.typeCode?.trim() || undefined,
		fromSource: param.fromSource || undefined,
		incomeAndExpenses: param.incomeAndExpenses || undefined,
		belongTo: param.belongTo || undefined,
		infoDateStart:
			param.infoDateStart ? formatDate(param.infoDateStart) : undefined,
		infoDateEnd: param.infoDateEnd ? formatDate(param.infoDateEnd) : undefined,
	};
};

// 获取服务端动态多维汇总统计
const fetchSummary = async (queryParam: FinanceManagerData) => {
	summaryLoading.value = true;
	try {
		const { code, data } = await getFinanceSummary(queryParam);
		if (code === '200' && data) {
			summaryData.value = {
				totalExpense: Number(data.totalExpense) || 0,
				totalIncome: Number(data.totalIncome) || 0,
				totalBalance: Number(data.totalBalance) || 0,
				totalCount: Number(data.totalCount) || 0,
			};
		}
	} catch (e) {
		console.warn('获取多维统计失败:', e);
	} finally {
		summaryLoading.value = false;
		isFirstSummaryLoaded.value = true;
	}
};

// 获取支付方式展示名称
const getFromSourceName = (source?: string) => {
	if (!source) return '-';
	const matched = fromSourceTransferList.find((item) => item.value === source);
	return matched ? matched.name : source;
};

// 预算/分类穿透联动筛选状态
const activeLinkageFilter = ref<{
	type: string;
	value: string;
	label: string;
} | null>(null);

// 语义化标签配色调色板
const pillColorPalette = [
	{ bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
	{ bg: '#ecfdf5', text: '#047857', border: '#a7f3d0' },
	{ bg: '#fef3c7', text: '#b45309', border: '#fde68a' },
	{ bg: '#f5f3ff', text: '#6d28d9', border: '#ddd6fe' },
	{ bg: '#ecfeff', text: '#0e7490', border: '#a5f3fc' },
	{ bg: '#fff1f2', text: '#be123c', border: '#fecdd3' },
	{ bg: '#eef2ff', text: '#4338ca', border: '#c7d2fe' },
	{ bg: '#fdf4ff', text: '#a21caf', border: '#f5d0fe' },
];

const getCategoryPillStyle = (name?: string) => {
	if (!name) return {};
	let hash = 0;
	for (let i = 0; i < name.length; i++) {
		hash = (hash << 5) - hash + name.charCodeAt(i);
		hash |= 0;
	}
	const idx = Math.abs(hash) % pillColorPalette.length;
	const color = pillColorPalette[idx];
	return {
		backgroundColor: color.bg,
		color: color.text,
		border: `1px solid ${color.border}`,
		borderRadius: '12px',
		padding: '2px 9px',
		fontSize: '12px',
		fontWeight: '500',
		display: 'inline-block',
		lineHeight: '1.4',
		cursor: 'pointer',
		transition: 'all 0.15s ease',
	};
};

const filterByCategory = (cat?: string) => {
	if (!cat) return;
	searchInfo.value.typeCode = cat;
	activeLinkageFilter.value = {
		type: 'category',
		value: cat,
		label: `账目分类：${cat}`,
	};
	query(true);
};

const drillDownCategory = (cat: string) => {
	if (!cat) return;
	searchInfo.value.typeCode = cat;
	const [monthStartDayjs, monthEndDayjs] = getMonthRangeDayjs();
	searchInfo.value.infoDateStart = monthStartDayjs;
	searchInfo.value.infoDateEnd = monthEndDayjs;
	activeLinkageFilter.value = {
		type: 'category',
		value: cat,
		label: `预算分类：${cat}`,
	};
	query(true);
};

const drillDownBudgetMonth = () => {
	const [monthStartDayjs, monthEndDayjs] = getMonthRangeDayjs();
	searchInfo.value.infoDateStart = monthStartDayjs;
	searchInfo.value.infoDateEnd = monthEndDayjs;
	const dir = budgetStatus.value?.incomeAndExpenses || 'expense';
	if (dir === 'expense' || dir === 'income') {
		searchInfo.value.incomeAndExpenses = dir;
	} else {
		searchInfo.value.incomeAndExpenses = undefined;
	}
	if (
		budgetStatus.value?.categoryCodes &&
		budgetStatus.value.categoryCodes.length > 0
	) {
		searchInfo.value.typeCode = budgetStatus.value.categoryCodes.join(',');
	} else {
		searchInfo.value.typeCode = undefined;
	}
	activeLinkageFilter.value = {
		type: 'budgetMonth',
		value: currentMonthStr.value,
		label: `${currentMonthStr.value} 月预算相关账目`,
	};
	query(true);
};

const clearLinkageFilter = () => {
	activeLinkageFilter.value = null;
	searchInfo.value.typeCode = undefined;
	query(true);
};

const cancelQuery = () => {
	activeLinkageFilter.value = null;
	searchInfo.value = {};
	query(true);
};

// 立即查询函数（联动刷新分页与统计）
const query = (resetPage = false) => {
	if (resetPage) {
		resetPagination();
	}
	const queryParam = buildQueryParams(searchInfo.value);
	getFinancePage(queryParam, pagination);
	fetchSummary(queryParam);
	loadBudgetStatus();
};

// 删除账单
const delFinance = async (id?: string) => {
	if (!id) return;
	const { code, message: messageInfo } = await deleteFinanceManger(id);
	if (code === '200') {
		message.success(messageInfo ? `删除${messageInfo}` : '删除成功！', 3);
		selectedRowIds.value = selectedRowIds.value.filter((i) => i !== id);
		query();
	} else {
		message.error(messageInfo || '删除失败！', 3);
	}
};

// 批量删除
const batchDelFinanceManager = () => {
	if (!selectedRowIds.value.length) {
		message.warning('请先选择要删除的账目！', 3);
		return;
	}
	delFinance(selectedRowIds.value.join(','));
};

const cancel = () => {};

// 分页获取账单数据
const getFinancePage = async (
	queryParam: FinanceManagerData,
	cur: PageInfo,
) => {
	loading.value = true;
	try {
		const {
			code,
			data,
			message: messageInfo,
		} = await getFinanceMangerPage(queryParam, cur.current, cur.pageSize);
		if (code === '200') {
			dataSource.value = data?.records || [];
			setTotal(data?.total || 0);
		} else {
			message.error(messageInfo || '查询列表失败！');
		}
	} finally {
		loading.value = false;
	}
};

// 记一笔与修改弹窗
const editFinance = (type: string, id?: string) => {
	const isAdd = type === 'add';
	modelInfo.value.title = isAdd ? '记一笔账' : '修改账单明细';
	modelInfo.value.id = isAdd ? null : (id ?? null);
	modelInfo.value.confirmLoading = true;
	modelInfo.value.open = true;
};

const initPage = () => {
	resetPagination();
	pagination.pageSize = 10;
};

// 初始化页面数据
const init = () => {
	initPage();
	if (route.query.fromSource) {
		searchInfo.value.fromSource = route.query.fromSource as string;
	}
	if (route.query.typeCode) {
		searchInfo.value.typeCode = route.query.typeCode as string;
	}
	const queryParam = buildQueryParams(searchInfo.value);
	getFinancePage(queryParam, pagination);
	fetchSummary(queryParam);
	loadBudgetStatus();
	fetchRecentCategories();
};

// 表格高度自适应计算
const tableContainerRef = ref<HTMLElement | null>(null);
const tableScrollY = ref<number>(450);

const updateTableScrollY = () => {
	if (!tableContainerRef.value) return;
	const containerHeight = tableContainerRef.value.clientHeight;
	if (containerHeight > 180) {
		// 扣除表头(~50px) + 底部分页器与间距(~66px) + 容器内边距(24px) + 边框安全量(12px) ≈ 152px
		tableScrollY.value = Math.max(containerHeight - 152, 160);
	}
};

let resizeObserver: ResizeObserver | null = null;

onMounted(() => {
	nextTick(() => {
		updateTableScrollY();
		if (tableContainerRef.value && typeof ResizeObserver !== 'undefined') {
			resizeObserver = new ResizeObserver(() => {
				updateTableScrollY();
			});
			resizeObserver.observe(tableContainerRef.value);
		}
	});
	window.addEventListener('resize', updateTableScrollY);
});

onUnmounted(() => {
	if (resizeObserver) {
		resizeObserver.disconnect();
		resizeObserver = null;
	}
	window.removeEventListener('resize', updateTableScrollY);
});

init();
</script>

<style lang="scss" scoped>
.finance-manager-page {
	display: flex;
	flex-direction: column;
	height: 100%;
	padding: 10px 10px 12px;
	box-sizing: border-box;
	overflow: hidden;
}

:deep(.search) {
	flex-shrink: 0;
	margin: 0 0 8px;
}

.finance-overview-card {
	flex-shrink: 0;
	background: #fff;
	padding: 8px 16px;
	border-radius: 8px;
	margin: 0 0 8px;
	border: 1px solid #f0f0f0;
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
	display: flex;
	align-items: center;
	gap: 16px;
	min-height: 72px;

	.overview-divider {
		width: 1px;
		align-self: stretch;
		background: #f0f0f0;
		flex-shrink: 0;
		margin: 2px 0;
	}

	.overview-section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		min-width: 0;

		:deep(.ant-skeleton) {
			.ant-skeleton-title {
				margin: 2px 0 8px;
				height: 14px;
				border-radius: 4px;
			}

			.ant-skeleton-paragraph {
				margin: 0;
				padding: 0;

				> li {
					height: 14px;
					border-radius: 4px;
				}
			}
		}

		&.bill-stats-section {
			flex: 1.1;
		}

		&.budget-section {
			flex: 1.3;
		}
	}

	.section-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 5px;
		line-height: 20px;
	}

	.summary-tag-title {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-size: 13px;
		font-weight: 600;
		color: #262626;

		.summary-title-icon {
			color: #1677ff;
			font-size: 14px;
		}
	}

	.record-total-badge {
		font-size: 12px;
		color: #8c8c8c;

		strong {
			color: #262626;
			font-weight: 600;
		}
	}

	.stats-metrics-group {
		display: flex;
		align-items: baseline;
		gap: 16px;
		flex-wrap: wrap;

		.stat-metric {
			display: inline-flex;
			align-items: baseline;
			gap: 4px;
			font-size: 12px;

			.label {
				color: #8c8c8c;
			}

			.value {
				font-family:
					-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
					'Helvetica Neue', Arial, sans-serif;
				font-weight: 600;
				font-size: 14px;
				font-variant-numeric: tabular-nums;
			}

			&.expense .value {
				color: #ff4d4f;
			}

			&.income .value {
				color: #52c41a;
			}
		}
	}

	.stats-insights-row {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-top: 6px;
		padding-top: 5px;
		border-top: 1px dashed #f0f0f0;
		font-size: 12px;
		flex-wrap: wrap;

		.insight-item {
			display: inline-flex;
			align-items: center;
			gap: 4px;

			&.daily-avg {
				flex-shrink: 0;
			}

			.insight-label {
				color: #8c8c8c;
				font-size: 11px;
			}

			.insight-val {
				color: #595959;
				font-weight: 600;
				font-variant-numeric: tabular-nums;
				font-size: 12px;

				.insight-unit {
					font-weight: normal;
					color: #8c8c8c;
					font-size: 11px;
				}
			}
		}

		.insight-tags-wrap {
			display: inline-flex;
			align-items: center;
			gap: 4px;
			flex-wrap: wrap;
		}

		.insight-top-tag {
			display: inline-flex;
			align-items: center;
			gap: 2px;
			padding: 1px 6px;
			border-radius: 10px;
			background: #fafafa;
			border: 1px solid #e8e8e8;
			color: #595959;
			font-size: 11px;
			line-height: 16px;
			cursor: pointer;
			transition: all 0.2s ease;

			.tag-pct {
				color: #8c8c8c;
				font-size: 10px;
			}

			&:hover {
				background: #e6f4ff;
				border-color: #91caff;
				color: #1677ff;

				.tag-pct {
					color: #1677ff;
				}
			}
		}
	}

	.budget-title-line {
		display: inline-flex;
		align-items: center;
		gap: 6px;

		.budget-icon {
			color: #fa8c16;
			font-size: 14px;
		}

		.budget-title {
			font-weight: 600;
			font-size: 13px;
			color: #262626;
		}

		.budget-tag {
			font-size: 11px;
			line-height: 18px;
			padding: 0 5px;
			margin: 0;
		}
	}

	.budget-setting-btn {
		padding: 0 4px;
		font-size: 12px;
		height: 20px;
		line-height: 20px;
	}

	.budget-metrics-group {
		display: flex;
		align-items: baseline;
		gap: 16px;
		flex-wrap: wrap;

		.budget-stat-item {
			display: inline-flex;
			align-items: baseline;
			gap: 4px;
			font-size: 12px;

			.stat-label {
				color: #8c8c8c;
			}

			.stat-val {
				font-family:
					-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
					'Helvetica Neue', Arial, sans-serif;
				font-weight: 600;
				font-size: 14px;
				font-variant-numeric: tabular-nums;
			}
		}

		.budget-sub-stats {
			display: inline-flex;
			align-items: center;
			gap: 4px;
			font-size: 12px;
			color: #8c8c8c;

			.sub-sep {
				color: #d9d9d9;
			}

			.sub-stat {
				font-variant-numeric: tabular-nums;
			}
		}
	}

	.budget-insights-row {
		display: flex;
		align-items: center;
		gap: 16px;
		margin-top: 6px;
		padding-top: 5px;
		border-top: 1px dashed #f0f0f0;
		font-size: 12px;
		min-width: 0;

		.budget-progress-wrap {
			width: 160px;
			flex-shrink: 0;

			:deep(.ant-progress) {
				display: flex;
				align-items: center;
				margin: 0;

				.ant-progress-outer {
					flex: 1;
					margin-inline-end: 0 !important;
					padding-inline-end: 0 !important;
				}

				.ant-progress-text {
					width: auto !important;
					margin-inline-start: 8px !important;
					flex-shrink: 0;
					text-align: right;
					font-variant-numeric: tabular-nums;
				}
			}
		}

		.budget-category-hints {
			display: inline-flex;
			align-items: center;
			gap: 4px;
			font-size: 12px;
			min-width: 0;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;

			.hint-label {
				color: #8c8c8c;
				font-size: 11px;
				flex-shrink: 0;
			}

			.cat-pill {
				font-size: 11px;
				line-height: 16px;
				padding: 0 5px;
				margin: 0;
				border-radius: 10px;
				background: #fafafa;
				border: 1px solid #e8e8e8;
				color: #595959;
				cursor: pointer;
				transition: all 0.2s ease;

				&:hover {
					background: #e6f4ff;
					border-color: #91caff;
					color: #1677ff;
				}
			}

			.cat-pill-more {
				font-size: 11px;
				color: #8c8c8c;
				cursor: pointer;
				flex-shrink: 0;

				&:hover {
					color: #1677ff;
				}
			}

			.cat-pill-all {
				color: #8c8c8c;
				font-size: 11px;
				cursor: pointer;

				&:hover {
					color: #1677ff;
				}
			}
		}
	}
}

@media (max-width: 1300px) {
	.finance-overview-card {
		flex-direction: column;
		align-items: stretch;
		gap: 8px;

		.overview-divider {
			display: none;
		}
	}
}

.text-income {
	color: #52c41a !important;
}

.text-expense {
	color: #ff4d4f !important;
}

.button {
	flex-shrink: 0;
	margin: 0 0 8px;
}

.content {
	flex: 1;
	min-height: 0;
	display: flex;
	flex-direction: column;
	background: #fff;
	padding: 12px 16px;
	border-radius: 8px;
	border: 1px solid #f0f0f0;
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
	margin: 0;
	overflow: hidden;

	:deep(.ant-table-wrapper) {
		height: 100%;
		display: flex;
		flex-direction: column;
		min-height: 0;

		.ant-spin-nested-loading {
			height: 100%;
			display: flex;
			flex-direction: column;
			min-height: 0;

			.ant-spin-container {
				height: 100%;
				display: flex;
				flex-direction: column;
				min-height: 0;

				.ant-table {
					flex: 1;
					min-height: 0;
				}

				.ant-pagination {
					flex-shrink: 0;
					margin: 12px 0 0 !important;
					padding-bottom: 2px;
				}
			}
		}
	}
}

.amount-text {
	font-weight: 600;
	font-size: 14px;
	font-family:
		-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue',
		Arial, sans-serif;
	font-variant-numeric: tabular-nums;

	&.amount-income {
		color: #52c41a;
	}

	&.amount-expense {
		color: #ff4d4f;
	}
}

.action-link-btn {
	padding: 0 2px;
	font-size: 13px;
}

.type-tag {
	border-radius: 4px;
	font-size: 12px;
}

.info-date-text {
	color: #595959;
	font-size: 13px;
	font-variant-numeric: tabular-nums;
}

.from-source-pill {
	display: inline-flex;
	align-items: center;
	gap: 6px;
	padding: 2px 8px;
	background: #fafafa;
	border: 1px solid #f0f0f0;
	border-radius: 4px;
	font-size: 12px;
	color: #595959;

	.from-source-icon {
		width: 16px;
		height: 16px;
	}
}

.linkage-active-banner {
	flex-shrink: 0;
	display: flex;
	align-items: center;
	justify-content: space-between;
	background: #eff6ff;
	border: 1px solid #bfdbfe;
	padding: 5px 14px;
	border-radius: 6px;
	margin-bottom: 8px;
	font-size: 12px;
	color: #1e40af;

	.banner-content {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.banner-dot {
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: #3b82f6;
		display: inline-block;
		box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.25);
	}

	.banner-close-btn {
		padding: 0;
		height: auto;
		font-size: 12px;
		color: #2563eb;
		&:hover {
			color: #1d4ed8;
		}
	}
}

.clickable-sub-stat {
	cursor: pointer;
	transition: color 0.15s ease;
	&:hover {
		color: #1677ff !important;
		text-decoration: underline;
	}
	.drill-icon {
		font-size: 10px;
		margin-left: 2px;
		opacity: 0.7;
	}
}

.clickable-cat-pill {
	cursor: pointer;
	transition: all 0.15s ease;
	&:hover {
		border-color: #1677ff;
		color: #1677ff;
		transform: translateY(-1px);
	}
}

.clickable-cat-more {
	cursor: pointer;
	&:hover {
		color: #1677ff;
	}
}

.category-pill {
	transition: all 0.15s ease;
	&:hover {
		opacity: 0.85;
		transform: translateY(-1px);
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
	}
}
</style>
