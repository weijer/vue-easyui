import treeHelper from '../base/TreeHelper';
import Pagination from '../pagination/Pagination';
import GridBase from '../gridbase/GridBase';
import TreeGridView from './TreeGridView';

export const TREEGRID_TEMPLATE = `
<div class="f-column panel-noscroll">
    <div style="display:none"><slot></slot></div>
    <div class="panel-body panel-body-noheader datagrid datagrid-wrap f-full f-column" :class="{'panel-body-noborder':!border}">
        <Pagination v-if="pagination && (pagePosition=='both' || pagePosition=='top')" class="datagrid-pager datagrid-pager-top f-noshrink"
                :total="totalState"
                :pageSize="pageSizeState"
                :pageNumber="pageNumberState"
                :loading="loading"
                @pageChange="onPageChange($event)">
        </Pagination>
        <div ref="viewRef" class="datagrid-view f-row f-full">
            <TreeGridView ref="view1" v-if="leftGroup || leftColumns"
                    :viewIndex="1"
                    :columnGroup="leftGroup"
                    :columns="leftColumns"
                    :rows="rows"
                    :footerRows="footerRows"
                    :style="{width:leftFrozenWidth}"></TreeGridView>
            <TreeGridView ref="view2"
                    :viewIndex="2"
                    :columnGroup="centerGroup"
                    :columns="centerColumns"
                    :rows="rows"
                    :footerRows="footerRows"
                    @bodyScroll="onBodyScroll($event)"></TreeGridView>
            <TreeGridView ref="view3" v-if="rightGroup || rightColumns"
                    :viewIndex="3"
                    :columnGroup="rightGroup"
                    :columns="rightColumns"
                    :rows="rows"
                    :footerRows="footerRows"
                    :style="{width:rightFrozenWidth}"></TreeGridView>
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
    name: 'TreeGrid',
    template: TREEGRID_TEMPLATE,
    extends: GridBase,
    components: {
        Pagination,
        TreeGridView
    },
    props: {
        idField: String,
        treeField: String,
        selectionMode: {
            type: String,
            default: 'single'
        },
        checkbox: {
            type: Boolean,
            default: false
        },
        cascadeCheck: {
            type: Boolean,
            default: true
        },
        animate: {
            type: Boolean,
            default: false
        }
    },
    created() {
        treeHelper.$vue = this;
    },
    methods: {
        getCheckedRows(state = 'checked'){
            let rows = [];
            treeHelper.cascadeCheck = this.cascadeCheck;
            treeHelper.forNodes(this.innerData, (row) => {
                if (row.checkState == state){
                    rows.push(row);
                }
            });
            return rows;
        },
        checkRow(row){
            treeHelper.cascadeCheck = this.cascadeCheck;
            treeHelper.checkNode(row, () => {
                this.$emit('rowCheck', row);
            });
        },
        uncheckRow(row){
            treeHelper.cascadeCheck = this.cascadeCheck;
            treeHelper.uncheckNode(row, () => {
                this.$emit('rowUncheck', row);
            });
        },
        uncheckAllRows(){
            treeHelper.uncheckAllNodes(this.innerData, () => {
    
            });
        },
        adjustCheck(row){
            treeHelper.cascadeCheck = this.cascadeCheck;
            treeHelper.adjustCheck(row);
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
            let _sort = (rows) => {
                rows.sort((r1,r2) => {
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
                rows.forEach(row => {
                    if (row.children && row.children.length){
                        _sort(row.children);
                    }
                });
            };
            _sort(this.innerData);
        }
    }
}