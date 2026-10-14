<template>
	<div class="container container-star">
		<div
			v-for="(_, index) in 30"
			:key="index"
			class="star-1"
		/>
		<div
			v-for="(_, index) in 30"
			:key="index"
			class="star-2"
		/>
	</div>
	<div class="container container-bird">
		<div
			v-for="(_, index) in 6"
			:key="index"
			class="bird bird-anim"
		>
			<div class="bird-container">
				<div class="wing wing-left">
					<div class="wing-left-top" />
				</div>
				<div class="wing wing-right">
					<div class="wing-right-top" />
				</div>
			</div>
		</div>
		<div class="container-title">
			<div class="title">
				<div class="number">4</div>
				<div class="moon">
					<div class="face">
						<div class="mouth" />
						<div class="eyes">
							<div class="eye-left" />
							<div class="eye-right" />
						</div>
					</div>
				</div>
				<div class="number">4</div>
			</div>
			<div class="subtitle">哎呀。看来你拐错弯了。</div>
			<div class="btn">
				<!-- <button @click="goHome" style="margin-right:30px">返回首页</button> -->
				<!-- <button @click="goBack" style="margin-left:20px">返回上一页</button> -->
			</div>
		</div>
	</div>
</template>

<script setup lang="ts"></script>

<style lang="less" scoped src="./index.less"></style>
