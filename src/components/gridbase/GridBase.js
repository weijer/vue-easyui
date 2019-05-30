import ListBase from '../base/ListBase';
import domHelper from '../base/DomHelper';
import GridColumn from './GridColumn';
import GridHeaderRow from './GridHeaderRow';
import GridHeader from './GridHeader';
import GridView from './GridView';

export const GRID_BASE_TEMPLATE = `
<div class="f-column">
    <div class="panel-body panel-body-noheader datagrid datagrid-wrap f-full f-column" :class="{'panel-body-noborder':!border}">
        <div><slot></slot></div>
        <Pagination v-if="pagination && (pagePosition=='both' || pagePosition=='top')" class="datagrid-pager datagrid-pager-top f-noshrink"
                :total="totalState"
                :pageSize="pageSizeState"
                :pageNumber="pageNumberState"
                :loading="loading"
                @pageChange="onPageChange($event)">
        </Pagination>
        <div ref="viewRef" class="datagrid-view f-row f-full">
            <GridView ref="view1" v-if="leftGroup||leftColumns"
                :viewIndex="1"
                :columnGroup="leftGroup"
                :columns="leftColumns"
                :rows="rows"
                :style="{width:leftFrozenWidth}">
            </GridView>
            <GridView ref="view2" v-if="centerGroup||centerColumns"
                :viewIndex="2"
                :columnGroup="centerGroup"
                :columns="centerColumns"
                :rows="rows"
                @bodyScroll="onBodyScroll($event)">
            </GridView>
            <GridView ref="view3" v-if="rightGroup||rightColumns"
                :viewIndex="3"
                :columnGroup="rightGroup"
                :columns="rightColumns"
                :rows="rows"
                :style="{width:rightFrozenWidth}">
            </GridView>
        </div>
        <Pagination v-if="pagination && (pagePosition=='both' || pagePosition=='bottom')" class="datagrid-pager f-noshrink"
                :total="totalState"
                :pageSize="pageSizeState"
                :pageNumber="pageNumberState"
                :loading="loading"
                @pageChange="onPageChange($event)">
        </Pagination>
    </div>
	<div v-if="loading" class="datagrid-loading f-row">
		<div class="datagrid-mask"></div>
		<div class="datagrid-mask-msg">{{loadMsg}}</div>
	</div>
</div>
`;

export default {
    name: 'GridBase',
    template: GRID_BASE_TEMPLATE,
    extends: ListBase,
    components: {
        GridColumn,
        GridHeaderRow,
        GridHeader,
        GridView
    },
    props: {
        rowHeight: {
            type: Number,
            default: 32
        },
        striped: {
            type: Boolean,
            default: false
        },
        rowCss: [Object, Function],
        frozenWidth: {
            type: [Number, String],
            default: '200px'
        },
        frozenAlign: {
            type: String,
            default: 'left'
        },
        sorts: {
            type: [Object,Array],
            default: () => []
        },
        multiSort: {
            type: Boolean,
            default: false
        },
        showHeader: {
            type: Boolean,
            default: true
        },
        showFooter: {
            type: Boolean,
            default: false
        },
        editMode: String,   // row, cell
        tipOptions: Object,
        clickToEdit: {
            type: Boolean,
            default: false
        },
        dblclickToEdit: {
            type: Boolean,
            default: false
        },
        footerData: {
            type: Array,
            default: () => []
        },
        filterRules: {
            type: Array,
            default: () => []
        },
        columnResizing: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            leftGroup: null,
            rightGroup: null,
            centerGroup: null,
            leftColumns: [],
            rightColumns: [],
            centerColumns: [],
            columnRefs: [],
            groupRefs: [],
            sortsState: this.sorts,
            editingItem: null,
            headerHeight: 0
        }
    },
    computed: {
        allColumns() {
            let cc = [];
            if (this.leftColumns){
                cc = cc.concat(this.leftColumns);
            }
            if (this.centerColumns){
                cc = cc.concat(this.centerColumns);
            }
            if (this.rightColumns){
                cc = cc.concat(this.rightColumns);
            }
            return cc;
        },
        footerRows(){
            if (this.footerData instanceof Array){
                return this.footerData;
            } else {
                return [this.footerData];
            }
        },
        leftFrozenWidth() {
            let width = this.leftGroup ? this.leftGroup.widthState : 0;
            return width ? width : this.frozenWidth;
        },
        rightFrozenWidth() {
            let width = this.rightGroup ? this.rightGroup.widthState : 0;
            return width ? width : this.frozenWidth;
        }
    },
    watch: {
        groupRefs(){
            this.initColumns();
            this.initHeaderHeight();
        },
        columnRefs(){
            this.initColumns();
            this.initHeaderHeight();
        },
        filterRules(){
            this.initFilterRules();
        }
    },
    created(){
        this.initColumnSort();
        if (window.EventHub){
            window.EventHub.$on('tabSelect', (tab) => {
                if (domHelper.isChild(this.$el, tab.$el)){
                    if (!this.headerHeight){
                        this.initHeaderHeight();
                    }
                }
            })
        }
    },
    mounted(){
        this.initFilterRules();
        this.$nextTick(() => this.initHeaderHeight());
    },
    methods: {
        addColumn(column){
            this.columnRefs.push(column);
        },
        removeColumn(column){
            let index = this.columnRefs.indexOf(column);
            if (index >= 0){
                this.columnRefs.splice(index,1);
            }
        },
        addColumnGroup(group){
            this.groupRefs.push(group);
        },
        removeColumnGroup(group){
            let index = this.columnRefs.indexOf(group);
            if (index >= 0){
                this.groupRefs.splice(index,1);
            }
        },
        initColumns(){
            this.leftGroup = null;
            this.leftColumns = null;
            this.rightGroup = null;
            this.rightColumns = null;
            this.centerGroup = null;
            this.centerColumns = null;
            if (this.groupRefs && this.groupRefs.length){
                this.groupRefs.forEach((g) => {
                    let cc = this.getColumnLayout(g);
                    let columns = cc[cc.length-1];
                    if (g.frozen){
                        if (g.align == 'left'){
                            this.leftGroup = g;
                            this.leftColumns = columns;
                        } else {
                            this.rightGroup = g;
                            this.rightColumns = columns;
                        }
                    } else {
                        this.centerGroup = g;
                        this.centerColumns = columns;
                    }
                });
            }
            if (!this.centerColumns) {
                this.centerColumns = this.columnRefs.filter((c) => {
                    return !c.frozen;
                });
                let frozenColumns = this.columnRefs.filter((c) => {
                    return c.frozen;
                });
                if (frozenColumns.length){
                    if (this.frozenAlign == 'left'){
                        this.leftColumns = frozenColumns;
                    } else {
                        this.rightColumns = frozenColumns;
                    }
                }
            }
            this.allColumns.forEach(c => c.grid = this);
            this.initColumnSort();
        },
        initHeaderHeight(){
            if (this.$refs.view1){
                this.$refs.view1.headerHeight(null);
            }
            if (this.$refs.view2){
                this.$refs.view2.headerHeight(null);
            }
            if (this.$refs.view3){
                this.$refs.view3.headerHeight(null);
            }
            let h1 = this.$refs.view1 ? this.$refs.view1.headerHeight() : 0;
            let h2 = this.$refs.view2 ? this.$refs.view2.headerHeight() : 0;
            let h3 = this.$refs.view3 ? this.$refs.view3.headerHeight() : 0;
            this.headerHeight = Math.max(h1, h2, h3);
            if (this.$refs.view1){
                this.$refs.view1.headerHeight(this.headerHeight);
            }
            if (this.$refs.view2){
                this.$refs.view2.headerHeight(this.headerHeight);
            }
            if (this.$refs.view3){
                this.$refs.view3.headerHeight(this.headerHeight);
            }
        },
        initFilterRules(){
            this.filterRules.forEach(r => {
                let col = this.findColumn(r.field);
                if (col){
                    col.filterValue = r.value;
                    col.filterOperator = r.op;
                }
            });
        },
        getColumnLayout(group){
            let aa = [];
            let count = this.getColumnCount(group);
            for(let i=0; i<group.rows.length; i++){
                aa[i] = new Array(count);
            }
            group.rows.forEach((row,rowIndex) => {
                row.columns.forEach(col => {
                    let colIndex = this.getColumnIndex(aa[rowIndex]);
                    if (colIndex >= 0){
                        for(let c=0; c<col.colspan; c++){
                            for(let r=0; r<col.rowspan; r++){
                                aa[rowIndex+r][colIndex] = col||'';
                            }
                        }
                    }
                })
            });
            return aa;
        },
        getColumnCount(group){
            let count = 0;
            group.rows[0].columns.forEach(col => {
                count += Number(col.colspan);
            });
            return count;
        },
        getColumnIndex(a){
            for(let i=0; i<a.length; i++){
                if (a[i] == undefined){
                    return i;
                }
            }
            return -1;
        },
        onBodyScroll(event){
            let top = event ? event.top : this.view2.scrollTop();
            if (this.$refs.view1){
                this.$refs.view1.scrollTop(top);
            }
            if (this.$refs.view3){
                this.$refs.view3.scrollTop(top);
            }
        },
        addSort(col) {
            let index = -1;
            for(let i=0; i<this.sortsState.length; i++){
                if (this.sortsState[i].field == col.field){
                    index = i;
                    break;
                }
            }
            if (index >= 0){
                let nextOrder = this.sortsState[index].order == 'asc' ? 'desc' : 'asc';
                if (this.multiSort && nextOrder == col.order){
                    this.sortsState.splice(index, 1);
                } else {
                    this.sortsState[index].order = nextOrder;
                }
            } else {
                if (this.multiSort){
                    this.sortsState.push({
                        field: col.field,
                        order: col.order
                    });
                } else {
                    this.sortsState = [{
                        field: col.field,
                        order: col.order
                    }];
                }
            }
            this.initColumnSort();
        },
        initColumnSort() {
            this.sortsState = this.sortsState || [];
            if (!(this.sortsState instanceof Array)){
                this.sortsState = [this.sortsState];
            }
            if (!this.multiSort){
                this.sortsState = this.sortsState.slice(0, 1);
            }
            for(let c=0; c<this.allColumns.length; c++){
                let col = this.allColumns[c];
                col.currOrder = null;
                for(let s=0; s<this.sortsState.length; s++){
                    let sort = this.sortsState[s];
                    if (sort.field == col.field){
                        col.currOrder = sort.order;
                        break;
                    }
                }
            }
        },
        findColumn(field) {
            let cc = this.allColumns;
            for(let i=0; i<cc.length; i++){
                if (cc[i].field == field){
                    return cc[i];
                }
            }
            return null;
        },
        addFilterRule(rule) {
            // super.addFilterRule(rule);
            ListBase.methods.addFilterRule.call(this, rule);
            let col = this.findColumn(rule.field);
            if (col){
                col.filterValue = rule.value;
                col.filterOperator = rule.op;
            }
        },
        resizeColumn(field, width){
            const col = this.findColumn(field);
            if (col){
                col.widthState = domHelper.toStyleValue(width);
                this.$emit('columnResize', col);
            }
        },
        
        isEditing(row, column = null){
            if (this.editMode && this.editingItem){
                if (this.editMode == 'cell' && this.editingItem.column != column){
                    return false;
                }
                if (this.idField){
                    if (this.editingItem.row[this.idField] == row[this.idField]){
                        return true;
                    }
                } else {
                    if (this.editingItem.row == row){
                        return true;
                    }
                }
            }
            return false;
        },
        beginEdit(row, column = null, rowEl = null) {
            if (!this.isEditing(row, column)){
                this.endEdit();
                if (this.editingItem){
                    setTimeout(() => {
                        if (this.editMode == 'row'){
                            this.selectRow(this.editingItem.row);
                        } else if (this.editMode == 'cell'){
                            this.selectCell(this.editingItem.row, this.editingItem.column);
                        }
                    });
                    return;
                }
                let originalValue = this.editMode == 'row' ? Object.assign({}, row) : row[column.field];
                this.editingItem = {
                    row: row,
                    column: column,
                    originalValue: originalValue,
                    element: rowEl
                };
                this.$emit('editBegin', this.editingItem);
            }
        },
        endEdit() {
            if (this.editingItem){
                let el = this.editingItem.element;
                if (el && el.querySelector('.validatebox-invalid')){
                    return;
                }
                if (this.editingItem.invalid){
                    return;
                }
                this.$emit('editEnd', this.editingItem);
                this.editingItem = null;
            }
        },
        // cancelEdit1() {
        //     if (this.editingItem){
        //         if (this.editMode == 'cell'){
        //             this.editingItem.row[this.editingItem.column.field] = this.editingItem.originalValue;
        //         } else {
        //             Object.assign(this.editingItem.row, this.editingItem.originalValue);
        //         }
        //         this.$emit('editCancel', this.editingItem);
        //         this.editingItem = null;
        //     }
        // },
        cancelEdit() {
            if (this.editingItem){
                let item = this.editingItem;
                this.editingItem = null;
                setTimeout(() => {
                    if (this.editMode == 'cell'){
                        item.row[item.column.field] = item.originalValue;
                    } else {
                        Object.assign(item.row, item.originalValue);
                    }
                    this.$emit('editCancel', item);
                });
            }
        },
        navRow(step){
            ListBase.methods.navRow.call(this, step);
            let index = this.rows.indexOf(this.highlightRow);
            if (index >= 0){
                this.$nextTick(() => {
                    let container = this.$refs.view2.$refs.body.$refs.bodyRef;
                    let item = container.querySelector('.datagrid-row-over');
                    if (item){
                        domHelper.scrollTo(container, item);
                    }
                })
            }
        },
      
    }
}