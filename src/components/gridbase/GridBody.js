import domHelper from '../base/DomHelper';

export const GRID_BODY_TEMPLATE = `
	<div ref="bodyRef" class="datagrid-body f-full" @scroll="onScroll($event)">
		<div ref="innerRef" class="datagrid-body-inner">
		</div>
	</div>
`;

export default {
    name: 'GridBody',
    template: GRID_BODY_TEMPLATE,
    props: {
        columns: {
            type: Array,
            default: () => []
        },
        rows: {
            type: Array,
            default: () => []
        }
    },
    data() {
        return {
            scrollTopState: 0
        }
    },
    methods: {
        onScroll(){
            this.$emit('bodyScroll', {
                left: this.$refs.bodyRef.scrollLeft,
                top: this.$refs.bodyRef.scrollTop
            });
        },
        scrollTop(value){
            if (value == undefined){
                return this.scrollTopState;
            } else {
                this.scrollTopState = value;
                this.$refs.bodyRef.scrollTop = value;
            }
        },
        scrollbarWidth(){
            return domHelper.outerWidth(this.$refs.bodyRef) - domHelper.outerWidth(this.$refs.innerRef);
        }
    }
}