import domHelper from '../base/DomHelper';
import Pagination from '../pagination/Pagination';
import ListBase from '../base/ListBase';
import GridBase from '../gridbase/GridBase';
import DataGridView from './DataGridView';

export const DATAGRID_TEMPLATE = `
<div class="f-column panel-noscroll">
    <div style="display:none"><slot></slot></div>
    <div class="panel-body panel-body-noheader datagrid datagrid-wrap f-full f-column" :class="{'panel-body-noborder':!border}">
        <Pagination v-if="pagination && (pagePosition=='both' || pagePosition=='top')" class="datagrid-pager datagrid-pager-top f-noshrink"
                :total="totalState"
                :pageSize="pageSizeState"
                :pageNumber="pageNumberState"
                :layout="pageLayout"
                :pageList="pageList"
                :links="pageLinks"
                :loading="loading"
                @pageChange="onPageChange($event)">
            <slot name="tpl" :datagrid="this"></slot>
        </Pagination>
        <div ref="viewRef" class="datagrid-view f-row f-full">
            <DataGridView ref="view1" v-if="leftGroup || leftColumns"
                    :viewIndex="1"
                    :columnGroup="leftGroup"
                    :columns="leftColumns"
                    :rows="frozenRows"
                    :footerRows="footerRows"
                    :style="{width:leftFrozenWidth}"></DataGridView>
            <DataGridView ref="view2"
                    :viewIndex="2"
                    :columnGroup="centerGroup"
                    :columns="centerColumns"
                    :rows="rows"
                    :footerRows="footerRows"
                    @bodyScroll="onBodyScroll($event)"></DataGridView>
            <DataGridView ref="view3" v-if="rightGroup || rightColumns"
                    :viewIndex="3"
                    :columnGroup="rightGroup"
                    :columns="rightColumns"
                    :rows="frozenRows"
                    :footerRows="footerRows"
                    :style="{width:rightFrozenWidth}"></DataGridView>
        </div>
        <Pagination v-if="pagination && (pagePosition=='both' || pagePosition=='bottom')" class="datagrid-pager f-noshrink"
                :total="totalState"
                :pageSize="pageSizeState"
                :pageNumber="pageNumberState"
                :layout="pageLayout"
                :pageList="pageList"
                :links="pageLinks"
                :loading="loading"
                @pageChange="onPageChange($event)">
            <slot name="tpl" :datagrid="this"></slot>
        </Pagination>
    </div>
	<div v-if="loading" class="datagrid-loading f-row">
		<div class="datagrid-mask"></div>
		<div class="datagrid-mask-msg">{{loadMsg}}</div>
	</div>
</div>
`;

export default {
    name: 'DataGrid',
    template: DATAGRID_TEMPLATE,
    extends: GridBase,
    components: {
        Pagination,
        DataGridView
    },
    props: {
        groupField: String,
        expanderWidth: {
            type: Number,
            default: 30
        }
    },
    data() {
        return {
            groupData: [],
            expandedRows: [],
            frozenRows: []
        }
    },
    watch: {
        rows(){
            if (!this.virtualScroll){
                this.frozenRows = this.rows;
            }
        }
    },
    methods: {
        setData(value){
            if (value == null){
                value = [];
            }
            ListBase.methods.setData.call(this, value);
            this.frozenRows = this.virtualScroll ? [] : this.rows;
        },
        setGroupData(){
            if (this.groupField){
                if (!this.isGrouped(this.filteredData)){
                    this.groupData = this.makeGroup(this.filteredData);
                    this.filteredData = this.makeGroupedRows();
                    let index = 0;
                    this.filteredData.forEach(row => {
                        if (!this.isGroupRow(row)){
                            row._rowIndex = index++;
                        }
                    });
                }
            }
        },
        setPageData(){
            if (this.groupField){
                const dataRows = this.makeGroupedRows();
                const getIndex = (index) => {
                    let count = 0;
                    let currIndex = 0;
                    if (index === 0){
                        return 0;
                    }
                    for(let i=0; i<dataRows.length && count<index; i++){
                        let row = dataRows[i];
                        if (!this.isGroupRow(row)){
                            count++;
                            currIndex = i;
                        } else {
                            let group = this.getGroup(row.value);
                            if (group){
                                row.collapsed = group.collapsed;
                            }
                        }
                    }
                    return currIndex+1;
                }
                let start = (this.pageNumberState - 1) * this.pageSizeState;
                let end = start + (+this.pageSizeState);
                let rows = dataRows.slice(getIndex(start), getIndex(end));
                let groupedRows = dataRows.filter(row => this.isGroupRow(row));
                this.totalState = dataRows.length - groupedRows.length;
                let lastRows = [];
                let pageCount = (!this.totalState ? 0 : Math.ceil(this.totalState / this.pageSizeState) || 1);
                if (this.pageNumberState === pageCount){
                    for(let i=groupedRows.length-1; i>=0; i--){
                        let row = groupedRows[i];
                        if (row.collapsed){
                            lastRows.unshift(row);
                        } else {
                            break;
                        }
                    }
                }
                this.rows = rows.concat(lastRows);
            } else {
                ListBase.methods.setPageData.call(this);
            }
        },
        updateFrozenView(scrollTop, rows){
            if (rows){
                this.frozenRows = rows;
            }
            if (this.$refs.view1){
                this.$refs.view1.scrollTop(scrollTop);
            }
            if (this.$refs.view3){
                this.$refs.view3.scrollTop(scrollTop);
            }
        },
        onBodyScroll(event){
            this.updateFrozenView(event.relativeTop||event.top, event.items);
        },
        getRowIndex(row){
            let body = this.$refs.view2.$refs.body;
            let index = body.currRows.indexOf(row);
            if (index == -1){
                return -1;
            }
            if (body.$refs.vscroll){
                return index + body.$refs.vscroll.startIndex;
            } else if (this.pagination){
                return index + (this.pageNumberState - 1) * this.pageSizeState;
            } else {
                return index;
            }
        },
        getAbsoluteIndex(index){
            let body = this.$refs.view2.$refs.body;
            if (body.$refs.vscroll){
                return index + body.$refs.vscroll.startIndex;
            } else if (this.pagination){
                return index + (this.pageNumberState - 1) * this.pageSizeState;
            } else {
                return index;
            }
        },
        scrollTo(row){
            let index = this.$refs.view2.$refs.body.currRows.indexOf(row);
            if (index >= 0){
                let body = this.$refs.view2.$refs.body.$refs.bodyRef;
                let tr = body.querySelector('table>tbody>tr:nth-child(' + (index + 1) + ')');
                domHelper.scrollTo(body, tr);
                this.updateFrozenView(this.$refs.view2.$refs.body.scrollTop(), this.rows);
            }
        },
        sortData() {
            if (!this.sortsState || !this.sortsState.length){
                return;
            }
            let cc = [];
            for(let i=0; i<this.sortsState.length; i++){
                cc.push(this.findColumn(this.sortsState[i].field));
            }
            let sortFunc = (a,b) => {
                return a==b ? 0 : (a>b?1:-1);
            };
            this.innerData.sort((r1,r2) => {
                let r = 0;
                for(let i=0; i<this.sortsState.length; i++){
                    let sort = this.sortsState[i];
                    if (cc[i] && cc[i].sorter){
                        r = cc[i].sorter(r1, r2);
                    } else {
                        r = sortFunc(r1[sort.field], r2[sort.field]);
                    }
                    r = r * (sort.order=='asc' ? 1 : -1);
                    if (r != 0){
                        return r;
                    }
                }
                return r;
            });
        },
                    
        isGroupRow(row){
            return row._groupRow ? true : false;
        },
        isGrouped(data){
            if (data && data.length){
                if (this.isGroupRow(data[0])){
                    return true;
                }
            }
            return false;
        },
        getGroup(value, groups) {
            if (!groups){
                groups = this.groupData;
            }
            for(let group of groups){
                if (group.value == value){
                    return group;
                }
            }
            return null;
        },
        makeGroup(data) {
            let groups = [];
            for(let row of data){
                if (!this.isGroupRow(row)){
                    let group = this.getGroup(row[this.groupField], groups);
                    if (group){
                        group.rows.push(row);
                    } else {
                        group = {
                            value: row[this.groupField],
                            collapsed: false,
                            rows: [row]
                        };
                        groups.push(group);
                    }
                }
            }
            return groups;
        },
        makeGroupedRows() {
            let rows = [];
            for(let group of this.groupData){
                rows.push({
                    _groupRow: true,
                    value: group.value,
                    rows: group.rows,
                    collapsed: group.collapsed
                });
                if (!group.collapsed){
                    rows = rows.concat(group.rows);
                }
            }
            return rows;
        },
        collapseGroup(value) {
            let group = this.getGroup(value);
            if (group){
                group.collapsed = true;
                this.rows = this.makeGroupedRows();
                if (this.pagination && !this.lazy){
                    this.setPageData();
                }
                this.$emit('groupCollapse', group);
            }
        },
        expandGroup(value) {
            let group = this.getGroup(value);
            if (group){
                group.collapsed = false;
                this.rows = this.makeGroupedRows();
                if (this.pagination && !this.lazy){
                    this.setPageData();
                }
                this.$emit('groupExpand', group);
            }
        },
        toggleGroup(value) {
            let group = this.getGroup(value);
            if (group){
                if (group.collapsed){
                    this.expandGroup(value);
                } else {
                    this.collapseGroup(value);
                }
            }
        },
        getExpandedIndex(row){
            if (this.idField){
                for(let i=0; i<this.expandedRows.length; i++){
                    if (this.expandedRows[i][this.idField] == row[this.idField]){
                        return i;
                    }
                }
                return -1;
            } else {
                return this.expandedRows.indexOf(row);
            }
        },
        isRowExpanded(row) {
            let index = this.getExpandedIndex(row);
            return index != -1;
        },
        collapseRow(row){
            let index = this.getExpandedIndex(row);
            if (index >= 0){
                this.expandedRows.splice(index, 1);
                this.$emit('rowCollapse', row);
            }
        },
        expandRow(row){
            if (!this.isRowExpanded(row)){
                this.expandedRows.push(row);
                this.$emit('rowExpand', row);
            }
        },
        toggleRow(row){
            if (this.isRowExpanded(row)){
                this.collapseRow(row);
            } else {
                this.expandRow(row);
            }
        }
                                                
    }

}