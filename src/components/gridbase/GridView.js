import GridHeader from './GridHeader';
import GridBody from './GridBody';
import GridFooter from './GridFooter';

export const GRID_VIEW_TEMPLATE = `
    <div :class="viewCls">
        <GridHeader ref="header"
            :columnGroup="columnGroup"
            :columns="columns"
            :paddingWidth="headerPaddingWidth">
        </GridHeader>
        <GridBody ref="body" align="center"
            :columns="columns"
            :rows="rows"
            @bodyScroll="onBodyScroll($event)">
        </GridBody>
    </div>
`;

export default {
    name: 'GridView',
    template: GRID_VIEW_TEMPLATE,
    components: {
        GridHeader,
        GridBody,
        GridFooter
    },
    props: {
        columns: {
            type: Array,
            default: () => []
        },
        columnGroup: Object,
        viewIndex: {
            type: Number,
            default: 2
        },
        rows: {
            type: Array,
            default: () => []
        },
        footerRows: {
            type: Array,
            default: () => []
        },
        filterable: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            headerPaddingWidth: 0
        }
    },
    computed: {
        viewCls(){
            return 'f-column datagrid-view' + this.viewIndex + (this.viewIndex==2 ? ' f-full' : ' f-noshrink');           
        },
    },
    watch: {
        rows(){
            this.$nextTick(() => {
                this.headerPaddingWidth = this.getHeaderPaddingWidth();
            })
        }
    },
    methods: {
        scrollTop(value){
            if (value == undefined){
                return this.$refs.body.scrollTop();
            } else {
                this.$refs.body.scrollTop(value);
            }
        },
        headerHeight(value){
            if (value == undefined){
                return this.$refs.header ? this.$refs.header.height() : 0;
            } else {
                if (this.$refs.header){
                    this.$refs.header.height(value);
                }
            }
        },
        getHeaderPaddingWidth(){
            if (this.viewIndex == 2){
                let width = this.$refs.body ? this.$refs.body.scrollbarWidth() : 0;
                if (width > 0){
                    return width;
                }
            }
            return null;
        },
        onBodyScroll(event){
            // this.headerPaddingWidth = this.getHeaderPaddingWidth();
            if (this.$refs.header){
                this.$refs.header.scrollLeft(event.left);
            }
            if (this.$refs.footer){
                this.$refs.footer.scrollLeft(event.left);
            }
            this.$emit('bodyScroll', event);
        },
        onResize(){
            
        }

    }
}