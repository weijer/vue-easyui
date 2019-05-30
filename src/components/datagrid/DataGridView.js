import GridView from '../gridbase/GridView';
import DataGridBody from './DataGridBody';

export const DATAGRIDVIEW_TEMPLATE = `
    <div :class="viewCls">
        <GridHeader ref="header" v-if="grid.showHeader"
            :columnGroup="columnGroup"
            :columns="columns"
            :paddingWidth="headerPaddingWidth"
            :grid="grid"
            @cellClick="onHeaderCellClick($event)">
        </GridHeader>
        <DataGridBody ref="body" align="center"
            :columns="columns"
            :rows="rows"
            @bodyScroll="onBodyScroll($event)">
        </DataGridBody>
        <GridFooter ref="footer" v-if="grid.showFooter"
            :columns="columns"
            :rows="footerRows"
            :paddingWidth="headerPaddingWidth">
        </GridFooter>
    </div>
`;

export default {
    name: 'DataGridView',
    template: DATAGRIDVIEW_TEMPLATE,
    extends: GridView,
    components: {
        DataGridBody
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
                this.grid.setData(this.grid.innerData);
                if (this.$refs.body.vscroll){
                    this.$refs.body.vscroll.refresh();
                }
                this.grid.$emit('sortChange', this.grid.sortsState);
            }
        }
    
    }
}