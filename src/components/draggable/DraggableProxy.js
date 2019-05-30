export const DRAGGABLE_PROXY_TEMPLATE = `
<div style="display:none">
    <div ref="proxyRef" 
            :class="proxyClasses" 
            :style="proxyStyles"
            @transitionend="onTransitionEnd($event)">
        <slot></slot>
    </div>
</div>
`;

export default {
    name: 'DraggableProxy',
    template: DRAGGABLE_PROXY_TEMPLATE,
    props: {
        proxyCls: String,
        proxyStyle: Object
    },
    data() {
        return {
            left: 0,
            top: 0,
            width: 0,
            height: 0,
            reverting: false,
            closed: true
        }
    },
    computed: {
        proxyClasses(){
            return [this.proxyCls, {
                'draggable-reverting': this.reverting
            }]
        },
        proxyStyles(){
            return [this.proxyStyle, {
                position: 'absolute',
                left: this.left+'px',
                top: this.top+'px',
                width: this.width+'px',
                height: this.height+'px',
                display: this.closed?'none':'block'
            }];
        }
    },
    mounted() {
        document.body.appendChild(this.$refs.proxyRef);
    },
    beforeDestroy() {
		if (this.$refs.proxyRef){
			this.$el.appendChild(this.$refs.proxyRef);
		}
    },
    methods: {
        onTransitionEnd() {
            this.reverting = false;
            this.closed = true;
        }
    }
}