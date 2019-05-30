import GridView from '../gridbase/GridView';
import TreeGridBody from './TreeGridBody'

export const TREEGRIDVIEW_TEMPLATE = `
    <div :class="viewCls">
        <GridHeader ref="header" v-if="grid.showHeader"
            :columnGroup="columnGroup"
            :columns="columns"
            :paddingWidth="headerPaddingWidth"
            :grid="grid"
            @cellClick="onHeaderCellClick($event)">
        </GridHeader>
        <TreeGridBody ref="body" align="center"
            :columns="columns"
            :rows="rows"
            @bodyScroll="onBodyScroll($event)">
        </TreeGridBody>
        <GridFooter ref="footer" v-if="grid.showFooter"
            :columns="columns"
            :rows="footerRows"
            :paddingWidth="headerPaddingWidth">
        </GridFooter>
    </div>
`;

export default {
    name: 'TreeGridView',
    template: TREEGRIDVIEW_TEMPLATE,
    extends: GridView,
    components: {
        TreeGridBody
    },
    computed: {
        grid() {
            return this.$parent;
        }
    },
    methods: {
        onHeaderCellClick(event){
            let col = event.column;
            if (col.sortable){
                this.grid.addSort(event.column);
                // this.grid.data = this.grid.data;
                this.grid.setData(this.grid.innerData);
                this.grid.$emit('sortChange', this.grid.sortsState);
            }
        }
    }
}