<template>
	<Layout style="">
		<LayoutPanel region="north" style="height:50px;">
			<div class="title">North Region</div>
		</LayoutPanel>
		<LayoutPanel region="south" style="height:50px;">
			<div class="title">South Region</div>
		</LayoutPanel>
		<LayoutPanel region="center" style="height:100%">
			<Split style="height:100%" v-model="split1">
				<div slot="left" style="height:100%">
					<Panel title="上海巨一科技发展有限公司" :bodyStyle="{padding:'10px'}" style="height:100%">
						<Tree :data="data" @selectionChange="selection=$event"></Tree>
					</Panel>
				</div>
				<div slot="right">
					Right Pane
				</div>
			</Split>
		</LayoutPanel>
	</Layout>
</template>
<script>
	export default {
		data() {
			return {
				split1: 0.2,
				data: this.getData()
			}
		},
		methods: {
			getData() {
				return [{
					id: 1,
					text: "My Documents",
					children: [{
							id: 11,
							text: "Photos",
							state: "closed",
							children: [{
									id: 111,
									text: "Friend"
								},
								{
									id: 112,
									text: "Wife"
								},
								{
									id: 113,
									text: "Company"
								}
							]
						},
						{
							id: 12,
							text: "Program Files",
							children: [{
									id: 121,
									text: "Intel"
								},
								{
									id: 122,
									text: "Java"
								},
								{
									id: 123,
									text: "Microsoft Office"
								},
								{
									id: 124,
									text: "Games"
								}
							]
						},
						{
							id: 13,
							text: "index.html"
						},
						{
							id: 14,
							text: "about.html"
						},
						{
							id: 15,
							text: "welcome.html"
						}
					]
				}];
			}
		}
	}
</script>
<style>
	.ivu-split-wrapper {
		position: relative;
		width: 100%;
		height: 100%;
	}

	.ivu-split-pane.left-pane {
		left: 0;
	}

	.ivu-split-pane.left-pane,
	.ivu-split-pane.right-pane {
		top: 0;
		bottom: 0;
	}

	.ivu-split-trigger-vertical {
		width: 6px;
		height: 100%;
		background: #f8f8f9;
		border-top: none;
		border-bottom: none;
		cursor: col-resize;
	}

	.ivu-split-horizontal .ivu-split-trigger-con {
		top: 50%;
		height: 100%;
		width: 0;
	}

	.ivu-split-trigger-con {
		position: absolute;
		-webkit-transform: translate(-50%, -50%);
		transform: translate(-50%, -50%);
		z-index: 10;
	}

	.ivu-split-trigger {
		border: 1px solid #dcdee2;
	}

	.ivu-split-pane {
		position: absolute;
	}

	html,
	body {
		height: 100%;
		margin: 0;
	}

	#app {
		height: 100%;
	}
</style>
