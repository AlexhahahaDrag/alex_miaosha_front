<template>
	<div>
		<!-- 03 · 账户资产分布 (Tailwind Soft UI 无边框卡片：上排流动资金 Indigo 软底 & 信用负债 Rose 软底，下排水电话费预存 Amber 软底两列) -->
		<div
			class="bg-white p-5 rounded-2xl border-0 shadow-sm shadow-slate-200/60 mb-4"
		>
			<div class="flex items-center justify-between gap-2 mb-4 flex-wrap">
				<div class="flex items-center gap-2">
					<span
						class="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-600 inline-flex items-center justify-center shrink-0"
					>
						<CreditCardOutlined class="text-xs" />
					</span>
					<span class="text-sm font-bold text-slate-800">账户资产分布</span>
					<span class="text-xs text-slate-400 hidden sm:inline">
						点击任意账户名称或金额可查看对应流水明细
					</span>
				</div>
			</div>

			<!-- 上排：可动产 (左 7/12 Indigo 柔和底) + 不动产 (右 5/12 Emerald 柔和底) -->
			<div class="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4">
				<!-- 可动产：Indigo 柔和背景 -->
				<div
					class="lg:col-span-7 bg-indigo-500/[0.05] rounded-2xl p-4 border-0 flex flex-col"
				>
					<div class="flex items-center justify-between gap-2 mb-3">
						<div class="flex items-center gap-2">
							<span
								class="w-2 h-2 rounded-full bg-indigo-500 inline-block shrink-0"
							></span>
							<span class="text-sm font-bold text-slate-800">
								{{ liquidConfig.title }}
							</span>
							<span
								class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/10 text-indigo-600"
							>
								{{ liquidItems.length }} 个账户
							</span>
						</div>
						<div
							:class="[
								'text-base font-extrabold font-mono tabular-nums',
								Number(liquidConfig.subtotal || 0) < 0 ?
									'text-rose-600'
								:	'text-indigo-600',
							]"
						>
							{{ Number(liquidConfig.subtotal || 0) < 0 ? '-' : '' }}¥{{
								formatAmount(Math.abs(Number(liquidConfig.subtotal || 0)))
							}}
						</div>
					</div>

					<!-- 查询中骨架屏 -->
					<div v-if="accountLoading" class="space-y-2 flex-1 animate-pulse">
						<div
							v-for="i in 2"
							:key="i"
							class="bg-white/80 rounded-xl px-3.5 py-2.5 border-0 shadow-2xs"
						>
							<div class="flex items-center justify-between mb-2 gap-2">
								<div class="flex items-center gap-2">
									<div class="w-4 h-4 rounded bg-indigo-500/20 shrink-0"></div>
									<div class="w-20 h-3.5 bg-slate-200/90 rounded"></div>
								</div>
								<div class="flex items-baseline gap-2.5">
									<div class="w-16 h-3.5 bg-slate-200/90 rounded"></div>
									<div class="w-8 h-3 bg-slate-200/70 rounded"></div>
								</div>
							</div>
							<div
								class="w-full h-1.5 bg-indigo-500/10 rounded-full overflow-hidden"
							>
								<div
									class="h-full bg-indigo-500/30 rounded-full"
									:style="{ width: i === 1 ? '65%' : '40%' }"
								></div>
							</div>
						</div>
					</div>

					<div v-else-if="liquidItems.length > 0" class="space-y-2 flex-1">
						<div
							v-for="(item, idx) in liquidItems"
							:key="item.typeCode || idx"
							class="group bg-white/95 hover:bg-white rounded-xl px-3.5 py-2.5 border-0 shadow-2xs hover:ring-1 hover:ring-indigo-500/30 cursor-pointer transition-all"
							:title="`点击查看【${item.typeName}】相关流水`"
							@click="item.typeCode && $emit('select-account', item.typeCode)"
						>
							<div class="flex items-center justify-between text-xs mb-1.5 gap-2">
								<div class="flex items-center gap-2 min-w-0">
									<component
										v-if="getFinanceIconComponent(item.typeCode)"
										:is="getFinanceIconComponent(item.typeCode)"
										class="w-4 h-4 shrink-0"
									/>
									<CreditCardOutlined
										v-else
										class="text-xs text-slate-400 shrink-0"
									/>
									<span
										class="font-semibold text-slate-700 group-hover:text-indigo-600 truncate transition-colors"
									>
										{{ item.typeName }}
									</span>
								</div>
								<div
									class="flex items-baseline gap-2.5 shrink-0 font-mono tabular-nums"
								>
									<span
										:class="[
											'font-bold text-xs',
											Number(item.amount || 0) < 0 ?
												'text-rose-600'
											:	'text-slate-800',
										]"
									>
										{{ Number(item.amount || 0) < 0 ? '-' : '' }}¥{{
											formatAmount(Math.abs(Number(item.amount || 0)))
										}}
									</span>
									<span class="text-[11px] text-slate-400 w-11 text-right">
										{{ item.sharePercent }}%
									</span>
								</div>
							</div>
							<div
								:class="[
									'w-full h-1.5 rounded-full overflow-hidden',
									Number(item.amount || 0) < 0 ?
										'bg-rose-500/10'
									:	'bg-indigo-500/10',
								]"
							>
								<div
									:class="[
										'h-full rounded-full transition-all duration-300',
										Number(item.amount || 0) < 0 ?
											'bg-rose-500'
										:	'bg-indigo-500',
									]"
									:style="{ width: `${Math.max(item.sharePercent, 2)}%` }"
								></div>
							</div>
						</div>
					</div>
					<div
						v-else
						class="flex-1 flex items-center justify-center py-8 text-xs text-slate-400"
					>
						暂无可动产账户数据
					</div>
				</div>

				<!-- 不动产：Emerald 柔和背景 -->
				<div
					class="lg:col-span-5 bg-emerald-500/[0.05] rounded-2xl p-4 border-0 flex flex-col"
				>
					<div class="flex items-center justify-between gap-2 mb-3">
						<div class="flex items-center gap-2">
							<span
								class="w-2 h-2 rounded-full bg-emerald-500 inline-block shrink-0"
							></span>
							<span class="text-sm font-bold text-slate-800">
								{{ creditConfig.title }}
							</span>
							<span
								class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600"
							>
								{{ creditItems.length }} 个账户
							</span>
						</div>
						<div
							:class="[
								'text-base font-extrabold font-mono tabular-nums',
								Number(creditConfig.subtotal || 0) < 0 ?
									'text-rose-600'
								:	'text-emerald-600',
							]"
						>
							{{ Number(creditConfig.subtotal || 0) < 0 ? '-' : '' }}¥{{
								formatAmount(Math.abs(Number(creditConfig.subtotal || 0)))
							}}
						</div>
					</div>

					<!-- 查询中骨架屏 -->
					<div v-if="accountLoading" class="space-y-2.5 flex-1 animate-pulse">
						<div
							v-for="i in 2"
							:key="i"
							class="bg-white/80 rounded-xl px-3.5 py-3 border-0 shadow-2xs"
						>
							<div class="flex items-center justify-between mb-2 gap-2">
								<div class="flex items-center gap-2">
									<div class="w-4 h-4 rounded bg-emerald-500/20 shrink-0"></div>
									<div class="w-20 h-3.5 bg-slate-200/90 rounded"></div>
								</div>
								<div class="flex items-baseline gap-2.5">
									<div class="w-16 h-3.5 bg-slate-200/90 rounded"></div>
									<div class="w-8 h-3 bg-slate-200/70 rounded"></div>
								</div>
							</div>
							<div
								class="w-full h-1.5 bg-emerald-500/10 rounded-full overflow-hidden"
							>
								<div
									class="h-full bg-emerald-500/30 rounded-full"
									:style="{ width: i === 1 ? '55%' : '30%' }"
								></div>
							</div>
						</div>
					</div>

					<div v-else-if="creditItems.length > 0" class="space-y-2.5 flex-1">
						<div
							v-for="(item, idx) in creditItems"
							:key="item.typeCode || idx"
							class="group bg-white/95 hover:bg-white rounded-xl px-3.5 py-3 border-0 shadow-2xs hover:ring-1 hover:ring-emerald-500/30 cursor-pointer transition-all"
							:title="`点击查看【${item.typeName}】相关流水`"
							@click="item.typeCode && $emit('select-account', item.typeCode)"
						>
							<div class="flex items-center justify-between text-xs mb-1.5 gap-2">
								<div class="flex items-center gap-2 min-w-0">
									<component
										v-if="getFinanceIconComponent(item.typeCode)"
										:is="getFinanceIconComponent(item.typeCode)"
										class="w-4 h-4 shrink-0"
									/>
									<CreditCardOutlined
										v-else
										class="text-xs text-slate-400 shrink-0"
									/>
									<span
										class="font-semibold text-slate-700 group-hover:text-emerald-600 truncate transition-colors"
									>
										{{ item.typeName }}
									</span>
								</div>
								<div
									class="flex items-baseline gap-2.5 shrink-0 font-mono tabular-nums"
								>
									<span
										:class="[
											'font-bold text-xs',
											Number(item.amount || 0) < 0 ?
												'text-rose-600'
											:	'text-slate-800',
										]"
									>
										{{ Number(item.amount || 0) < 0 ? '-' : '' }}¥{{
											formatAmount(Math.abs(Number(item.amount || 0)))
										}}
									</span>
									<span class="text-[11px] text-slate-400 w-11 text-right">
										{{ item.sharePercent }}%
									</span>
								</div>
							</div>
							<div
								class="w-full h-1.5 bg-emerald-500/10 rounded-full overflow-hidden"
							>
								<div
									class="h-full bg-emerald-500 rounded-full transition-all duration-300"
									:style="{ width: `${Math.max(item.sharePercent, 2)}%` }"
								></div>
							</div>
						</div>
					</div>
					<div
						v-else
						class="flex-1 flex items-center justify-center py-8 text-xs text-slate-400"
					>
						暂无不动产账户数据
					</div>
				</div>
			</div>

			<!-- 下排独立一行：水电话费预存 (Amber 柔和背景 + 两列账户明细布局) -->
			<div class="bg-amber-500/[0.06] rounded-2xl p-4 border-0">
				<div class="flex items-center justify-between gap-2 mb-3">
					<div class="flex items-center gap-2">
						<span
							class="w-2 h-2 rounded-full bg-amber-500 inline-block shrink-0"
						></span>
						<span class="text-sm font-bold text-slate-800">
							{{ prepaidConfig.title }}
						</span>
						<span
							class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/12 text-amber-600"
						>
							{{ prepaidItems.length }} 个账户
						</span>
					</div>
					<div
						class="text-base font-extrabold font-mono tabular-nums text-amber-600"
					>
						¥{{ formatAmount(prepaidConfig.subtotal) }}
					</div>
				</div>

				<!-- 查询中骨架屏 -->
				<div
					v-if="accountLoading"
					class="grid grid-cols-1 md:grid-cols-2 gap-2.5 animate-pulse"
				>
					<div
						v-for="i in 2"
						:key="i"
						class="bg-white/80 rounded-xl px-3.5 py-2.5 border-0 shadow-2xs"
					>
						<div class="flex items-center justify-between mb-2 gap-2">
							<div class="flex items-center gap-2">
								<div class="w-4 h-4 rounded bg-amber-500/20 shrink-0"></div>
								<div class="w-20 h-3.5 bg-slate-200/90 rounded"></div>
							</div>
							<div class="flex items-baseline gap-2.5">
								<div class="w-16 h-3.5 bg-slate-200/90 rounded"></div>
								<div class="w-8 h-3 bg-slate-200/70 rounded"></div>
							</div>
						</div>
						<div
							class="w-full h-1.5 bg-amber-500/15 rounded-full overflow-hidden"
						>
							<div
								class="h-full bg-amber-500/30 rounded-full"
								:style="{ width: i === 1 ? '50%' : '35%' }"
							></div>
						</div>
					</div>
				</div>

				<div
					v-else-if="prepaidItems.length > 0"
					class="grid grid-cols-1 md:grid-cols-2 gap-2.5"
				>
					<div
						v-for="(item, idx) in prepaidItems"
						:key="item.typeCode || idx"
						class="group bg-white/95 hover:bg-white rounded-xl px-3.5 py-2.5 border-0 shadow-2xs hover:ring-1 hover:ring-amber-500/35 cursor-pointer transition-all"
						:title="`点击查看【${item.typeName}】相关流水`"
						@click="item.typeCode && $emit('select-account', item.typeCode)"
					>
						<div class="flex items-center justify-between text-xs mb-1.5 gap-2">
							<div class="flex items-center gap-2 min-w-0">
								<component
									v-if="getFinanceIconComponent(item.typeCode)"
									:is="getFinanceIconComponent(item.typeCode)"
									class="w-4 h-4 shrink-0"
								/>
								<CreditCardOutlined
									v-else
									class="text-xs text-slate-400 shrink-0"
								/>
								<span
									class="font-semibold text-slate-700 group-hover:text-amber-600 truncate transition-colors"
								>
									{{ item.typeName }}
								</span>
							</div>
							<div
								class="flex items-baseline gap-2.5 shrink-0 font-mono tabular-nums"
							>
								<span class="font-bold text-slate-800 text-xs">
									¥{{ formatAmount(item.amount) }}
								</span>
								<span class="text-[11px] text-slate-400 w-11 text-right">
									{{ item.sharePercent }}%
								</span>
							</div>
						</div>
						<div
							class="w-full h-1.5 bg-amber-500/12 rounded-full overflow-hidden"
						>
							<div
								class="h-full bg-amber-500 rounded-full transition-all duration-300"
								:style="{ width: `${Math.max(item.sharePercent, 2)}%` }"
							></div>
						</div>
					</div>
				</div>
				<div
					v-else
					class="flex items-center justify-center py-6 text-xs text-slate-400"
				>
					暂无专户预存数据
				</div>
			</div>
		</div>

		<!-- 04 · 收入与支出结构 (两张独立纯白无框卡片，Emerald 收入绿系 + Rose/Amber/Indigo/Violet/Cyan 多色支出分类体系) -->
		<div class="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4">
			<!-- 左卡：收入结构 (占 5/12，Emerald 绿色系) -->
			<div
				class="lg:col-span-5 bg-white p-5 rounded-2xl border-0 shadow-sm shadow-slate-200/60 flex flex-col justify-between"
			>
				<div>
					<div
						class="flex items-center justify-between gap-2 pb-3 mb-4 border-0 border-b border-solid border-slate-100"
					>
						<div class="flex items-center gap-2">
							<span
								class="w-2 h-2 rounded-full bg-emerald-500 inline-block"
							></span>
							<span class="text-sm font-bold text-slate-800">收入结构</span>
							<span
								class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600"
							>
								流入
							</span>
						</div>
						<span
							class="text-lg font-extrabold font-mono tabular-nums text-emerald-600"
						>
							¥{{ formatAmount(incomeTotal) }}
						</span>
					</div>

					<!-- 查询中骨架屏 -->
					<div v-if="categoryLoading" class="space-y-3 animate-pulse">
						<!-- 顶部复合色条骨架 -->
						<div
							class="w-full h-2 bg-emerald-500/15 rounded-full overflow-hidden"
						></div>

						<!-- 分类横向条形明细骨架 -->
						<div class="space-y-2.5 pt-1">
							<div
								v-for="i in 3"
								:key="i"
								class="py-1.5 px-2 -mx-2 rounded-xl"
							>
								<div class="flex items-center justify-between mb-2 gap-2">
									<div class="flex items-center gap-2">
										<div
											class="w-2 h-2 rounded-full bg-emerald-500/30 shrink-0"
										></div>
										<div
											class="w-3.5 h-3.5 rounded bg-slate-200/90 shrink-0"
										></div>
										<div class="w-16 h-3.5 bg-slate-200/90 rounded"></div>
									</div>
									<div class="flex items-baseline gap-2.5">
										<div class="w-14 h-3.5 bg-slate-200/90 rounded"></div>
										<div
											class="w-8 h-3 bg-emerald-500/30 rounded"
										></div>
									</div>
								</div>
								<div
									class="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden"
								>
									<div
										class="h-full bg-emerald-500/30 rounded-full"
										:style="{
											width: getSkeletonBarWidth(i),
										}"
									></div>
								</div>
							</div>
						</div>
					</div>

					<!-- 有收入数据时：Emerald 绿色系横向条形图 -->
					<div v-else-if="rankedIncomeList.length > 0" class="space-y-3">
						<!-- 顶部构成复合色条 -->
						<div
							class="w-full h-2 bg-emerald-500/10 rounded-full overflow-hidden flex gap-0.5"
						>
							<div
								v-for="(item, idx) in rankedIncomeList"
								:key="item.name"
								class="h-full first:rounded-l-full last:rounded-r-full transition-all duration-300"
								:style="{
									width: `${Math.max(item.percent, 3)}%`,
									backgroundColor: getIncomeBarColor(idx),
								}"
								:title="`${item.name}: ¥${formatAmount(item.value)} (${item.percent}%)`"
							></div>
						</div>

						<!-- 分类横向条形明细 -->
						<div class="space-y-2.5 pt-1">
							<div
								v-for="(item, idx) in rankedIncomeList"
								:key="item.name"
								:class="[
									'group py-1.5 px-2 -mx-2 rounded-xl transition-colors',
									item.isOther ?
										'cursor-default'
									:	'cursor-pointer hover:bg-emerald-500/[0.06]',
								]"
								:title="`${item.name} · ¥${formatAmount(item.value)} (${item.percent}%)`"
								@click="
									!item.isOther && $emit('select-category', item.name, 'income')
								"
							>
								<div
									class="flex items-center justify-between text-xs mb-1.5 gap-2"
								>
									<div class="flex items-center gap-2 min-w-0">
										<span
											class="w-2 h-2 rounded-full shrink-0"
											:style="{ backgroundColor: getIncomeBarColor(idx) }"
										></span>
										<span class="text-xs leading-none shrink-0">{{
											item.isOther ? '📦' : getCategoryEmoji(item.name)
										}}</span>
										<span
											class="font-semibold text-slate-700 group-hover:text-emerald-600 truncate transition-colors"
										>
											{{ item.name }}
										</span>
									</div>
									<div
										class="flex items-baseline gap-2.5 shrink-0 font-mono tabular-nums"
									>
										<span class="font-bold text-slate-800">
											¥{{ formatAmount(item.value) }}
										</span>
										<span
											class="text-[11px] font-semibold text-emerald-600 w-11 text-right"
										>
											{{ item.percent }}%
										</span>
									</div>
								</div>
								<div
									class="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden"
								>
									<div
										class="h-full rounded-full transition-all duration-300"
										:style="{
											width: `${Math.max(item.percent, 3)}%`,
											backgroundColor: getIncomeBarColor(idx),
										}"
									></div>
								</div>
							</div>
						</div>
					</div>

					<!-- 无收入数据时：展示干净的 0% 环形视觉主体 -->
					<div
						v-else
						class="py-6 flex flex-col items-center justify-center gap-3"
					>
						<div
							class="w-28 h-28 rounded-full border-[10px] border-solid border-emerald-500/12 flex flex-col items-center justify-center"
						>
							<span class="text-lg font-extrabold font-mono text-emerald-600"
								>0%</span
							>
							<span class="text-[11px] text-slate-400">收入构成</span>
						</div>
						<span class="text-xs text-slate-400">当月暂无收入分类数据</span>
					</div>
				</div>
			</div>

			<!-- 右卡：支出结构 (占 7/12，Rose 与多色分类横向条形图体系) -->
			<div
				class="lg:col-span-7 bg-white p-5 rounded-2xl border-0 shadow-sm shadow-slate-200/60 flex flex-col justify-between"
			>
				<div>
					<div
						class="flex items-center justify-between gap-2 pb-3 mb-4 border-0 border-b border-solid border-slate-100"
					>
						<div class="flex items-center gap-2">
							<span
								class="w-2 h-2 rounded-full bg-rose-500 inline-block"
							></span>
							<span class="text-sm font-bold text-slate-800">支出结构</span>
							<span
								class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-600"
							>
								流出
							</span>
						</div>
						<span
							class="text-lg font-extrabold font-mono tabular-nums text-rose-600"
						>
							¥{{ formatAmount(expenseTotal) }}
						</span>
					</div>

					<!-- 查询中骨架屏 -->
					<div v-if="categoryLoading" class="space-y-3 animate-pulse">
						<!-- 顶部多色构成条骨架 -->
						<div
							class="w-full h-2 bg-rose-500/15 rounded-full overflow-hidden"
						></div>

						<!-- 分类横向条形明细骨架 -->
						<div class="space-y-2.5 pt-1">
							<div
								v-for="i in 3"
								:key="i"
								class="py-1.5 px-2 -mx-2 rounded-xl"
							>
								<div class="flex items-center justify-between mb-2 gap-2">
									<div class="flex items-center gap-2">
										<div
											class="w-2 h-2 rounded-full bg-rose-500/30 shrink-0"
										></div>
										<div
											class="w-3.5 h-3.5 rounded bg-slate-200/90 shrink-0"
										></div>
										<div class="w-16 h-3.5 bg-slate-200/90 rounded"></div>
									</div>
									<div class="flex items-baseline gap-2.5">
										<div class="w-14 h-3.5 bg-slate-200/90 rounded"></div>
										<div class="w-8 h-3 bg-rose-500/30 rounded"></div>
									</div>
								</div>
								<div
									class="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden"
								>
									<div
										class="h-full bg-rose-500/30 rounded-full"
										:style="{
											width: getExpenseSkeletonWidth(i),
										}"
									></div>
								</div>
							</div>
						</div>
					</div>

					<!-- 有支出数据时：多色分类复合构成条 + 横向条形图 -->
					<div v-else-if="rankedExpenseList.length > 0" class="space-y-3">
						<!-- 顶部多色支出构成比例条 -->
						<div
							class="w-full h-2 bg-rose-500/10 rounded-full overflow-hidden flex gap-0.5"
						>
							<div
								v-for="(item, idx) in rankedExpenseList"
								:key="item.name"
								class="h-full first:rounded-l-full last:rounded-r-full transition-all duration-300"
								:style="{
									width: `${Math.max(item.percent, 3)}%`,
									backgroundColor: getExpenseBarColor(idx),
								}"
								:title="`${item.name}: ¥${formatAmount(item.value)} (${item.percent}%)`"
							></div>
						</div>

						<!-- 分类横向条形图明细 -->
						<div class="space-y-2.5 pt-1">
							<div
								v-for="(item, idx) in rankedExpenseList"
								:key="item.name"
								:class="[
									'group py-1.5 px-2 -mx-2 rounded-xl transition-colors',
									item.isOther ?
										'cursor-default'
									:	'cursor-pointer hover:bg-rose-500/[0.05]',
								]"
								:title="`${item.name} · ¥${formatAmount(item.value)} (${item.percent}%)`"
								@click="
									!item.isOther &&
									$emit('select-category', item.name, 'expense')
								"
							>
								<div
									class="flex items-center justify-between text-xs mb-1.5 gap-2"
								>
									<div class="flex items-center gap-2 min-w-0">
										<span
											class="w-2 h-2 rounded-full shrink-0"
											:style="{ backgroundColor: getExpenseBarColor(idx) }"
										></span>
										<span class="text-xs leading-none shrink-0">{{
											item.isOther ? '📦' : getCategoryEmoji(item.name)
										}}</span>
										<span
											class="font-semibold text-slate-700 group-hover:text-rose-600 truncate transition-colors"
										>
											{{ item.name }}
										</span>
									</div>
									<div
										class="flex items-baseline gap-2.5 shrink-0 font-mono tabular-nums"
									>
										<span class="font-bold text-slate-800">
											¥{{ formatAmount(item.value) }}
										</span>
										<span
											class="text-[11px] font-semibold w-11 text-right"
											:style="{ color: getExpenseBarColor(idx) }"
										>
											{{ item.percent }}%
										</span>
									</div>
								</div>
								<div
									class="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden"
								>
									<div
										class="h-full rounded-full transition-all duration-300"
										:style="{
											width: `${Math.max(item.percent, 3)}%`,
											backgroundColor: getExpenseBarColor(idx),
										}"
									></div>
								</div>
							</div>
						</div>
					</div>

					<!-- 无支出数据时 -->
					<div
						v-else
						class="py-6 flex flex-col items-center justify-center gap-3"
					>
						<div
							class="w-28 h-28 rounded-full border-[10px] border-solid border-rose-500/12 flex flex-col items-center justify-center"
						>
							<span class="text-lg font-extrabold font-mono text-rose-600"
								>0%</span
							>
							<span class="text-[11px] text-slate-400">支出构成</span>
						</div>
						<span class="text-xs text-slate-400">当月暂无支出分类数据</span>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { CreditCardOutlined } from '@ant-design/icons-vue';
import { iconComponentMap } from '@/config/icons';
import {
	getCategoryEmoji,
	type FinanceManagerData,
} from '@/views/selfFinance/financeManager/config';
import type { ItemInfo } from '@/views/selfFinance/financeAnalysis/analysis';

const props = defineProps<{
	accountLoading?: boolean;
	categoryLoading?: boolean;
	listConfigs: Array<{
		key?: string;
		icon: string;
		title: string;
		desc?: string;
		subtotal: number | string;
		list: FinanceManagerData[];
		valueClass?: string;
	}>;
	pieIncomeData: ItemInfo[];
	pieExpenseData: ItemInfo[];
	formatAmount: (val?: any) => string;
}>();

defineEmits<{
	(
		e: 'select-category',
		categoryName: string,
		direction: 'income' | 'expense',
	): void;
	(e: 'select-account', fromSourceCode: string): void;
}>();

const financeSourceIconMap: Record<string, string> = {
	hfw: 'hf',
	hfm: 'hf',
	hfb: 'hf',
	hfmj: 'hf',
	dfw: 'df',
	dfm: 'df',
};

const SKELETON_BAR_WIDTHS: Record<number, string> = {
	1: '70%',
	2: '45%',
};
const getSkeletonBarWidth = (index: number) => SKELETON_BAR_WIDTHS[index] || '20%';

const EXPENSE_SKELETON_WIDTHS: Record<number, string> = {
	1: '60%',
	2: '35%',
};
const getExpenseSkeletonWidth = (index: number) => EXPENSE_SKELETON_WIDTHS[index] || '15%';

const resolveFinanceIconKey = (source: string): string => {
	if (financeSourceIconMap[source]) return financeSourceIconMap[source];
	if (source.startsWith('hf')) return 'hf';
	if (source.startsWith('df')) return 'df';
	return source;
};

const getFinanceIconComponent = (source?: string) => {
	if (!source) return null;
	const iconKey = resolveFinanceIconKey(source);
	return iconComponentMap[`finance-${iconKey}`] || null;
};

// Tailwind 原生 Emerald / Teal / Cyan 收入色阶
const incomePalette = [
	'#10b981', // emerald-500
	'#06b6d4', // cyan-500
	'#14b8a6', // teal-500
	'#34d399', // emerald-400
	'#0ea5e9', // sky-500
	'#94a3b8', // slate-400
];
const getIncomeBarColor = (idx: number) =>
	incomePalette[idx % incomePalette.length];

// Tailwind 原生 Rose / Amber / Indigo / Violet / Cyan 支出多色色阶
const expensePalette = [
	'#f43f5e', // rose-500
	'#f59e0b', // amber-500
	'#6366f1', // indigo-500
	'#8b5cf6', // violet-500
	'#06b6d4', // cyan-500
	'#94a3b8', // slate-400
];
const getExpenseBarColor = (idx: number) =>
	expensePalette[idx % expensePalette.length];

const enrichGroupItems = (rawList: FinanceManagerData[] = []) => {
	const absTotal = rawList.reduce(
		(sum, item) => sum + Math.abs(Number(item.amount) || 0),
		0,
	);
	return rawList.map((item) => {
		const absVal = Math.abs(Number(item.amount) || 0);
		const sharePercent =
			absTotal > 0 ? Number(((absVal / absTotal) * 100).toFixed(1)) : 0;
		return {
			...item,
			sharePercent,
		};
	});
};

const liquidConfig = computed(
	() =>
		props.listConfigs[0] || {
			title: '可动产',
			subtotal: 0,
			list: [],
		},
);

const creditConfig = computed(
	() =>
		props.listConfigs[1] || {
			title: '不动产',
			subtotal: 0,
			list: [],
		},
);

const prepaidConfig = computed(
	() =>
		props.listConfigs[2] || {
			title: '生活缴费',
			subtotal: 0,
			list: [],
		},
);

const liquidItems = computed(() => enrichGroupItems(liquidConfig.value.list));
const creditItems = computed(() => enrichGroupItems(creditConfig.value.list));
const prepaidItems = computed(() => enrichGroupItems(prepaidConfig.value.list));

interface RankedStructureItem {
	name: string;
	value: number;
	percent: number;
	isOther?: boolean;
}

const buildRankedList = (
	raw: ItemInfo[],
	maxTop = 5,
): RankedStructureItem[] => {
	if (!Array.isArray(raw) || raw.length === 0) return [];
	const cleaned = raw
		.map((item) => ({
			name: item.name || '未分类',
			value: Math.abs(Number(item.value) || 0),
		}))
		.filter((item) => item.value > 0)
		.sort((a, b) => b.value - a.value);

	const total = cleaned.reduce((sum, item) => sum + item.value, 0);
	if (total <= 0) return [];

	const topItems = cleaned.slice(0, maxTop);
	const restItems = cleaned.slice(maxTop);
	const result: RankedStructureItem[] = topItems.map((item) => ({
		name: item.name,
		value: item.value,
		percent: Number(((item.value / total) * 100).toFixed(1)),
	}));

	if (restItems.length > 0) {
		const otherVal = restItems.reduce((sum, item) => sum + item.value, 0);
		result.push({
			name: `其他分类 (${restItems.length}项)`,
			value: otherVal,
			percent: Number(((otherVal / total) * 100).toFixed(1)),
			isOther: true,
		});
	}
	return result;
};

const expenseTotal = computed(() =>
	(props.pieExpenseData || []).reduce(
		(sum, item) => sum + Math.abs(Number(item.value) || 0),
		0,
	),
);

const incomeTotal = computed(() =>
	(props.pieIncomeData || []).reduce(
		(sum, item) => sum + Math.abs(Number(item.value) || 0),
		0,
	),
);

const rankedExpenseList = computed(() =>
	buildRankedList(props.pieExpenseData, 5),
);
const rankedIncomeList = computed(() =>
	buildRankedList(props.pieIncomeData, 5),
);
</script>
