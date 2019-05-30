import domHelper from '../base/DomHelper';
import ListBase from '../base/ListBase';
import VirtualScroll from '../base/VirtualScroll';

export const DATALIST_TEMPLATE = `
<div class="f-column">
    <div class="panel-body panel-body-noheader datagrid f-full f-column"
        :class="{'panel-body-noborder':!border}">
        <Pagination ref="pageTopRef" v-if="pagination && (pagePosition=='both' || pagePosition=='top')" class="datagrid-pager datagrid-pager-top f-noshrink" 
            :total="totalState"
            :pageSize="pageSizeState"
            :pageNumber="pageNumberState"
            :loading="loading"
            @pageChange="onPageChange($event)">
        </Pagination>
        <div ref="innerRef" :class="innerClasses" :style="innerStyle">
            <template v-if="!virtualScroll">
                <div v-for="(row,rowIndex) in rows" :key="rowIndex"
                    :class="getItemClass(row)"
                    :style="itemStyle"
                    @mouseenter="highlightRow=row"
                    @mouseleave="highlightRow=null"
                    @click="onRowClick(row,$event)">
                    <slot :row="row" :rowIndex="getRowIndex(rowIndex)"></slot>
                </div>
            </template>
            <template v-else>
                <VirtualScroll ref="vscrollRef" class="f-full"
                    :data="rows"
                    :total="total"
                    :pageNumber="pageNumber"
                    :pageSize="pageSize"
                    :rowHeight="rowHeight"
                    :lazy="lazy"
                    :scrollPosition="scrollPosition"
                    @update="vrows=$event"
                    @pageChange="onVirtualPageChange($event)">
                    <div v-for="(row,rowIndex) in vrows" :key="rowIndex"
                        :class="getItemClass(row)"
                        :style="virtualItemStyle"
                        @mouseenter="highlightRow=row"
                        @mouseleave="highlightRow=null"
                        @click="onRowClick(row,$event)">
                        <slot :row="row" :rowIndex="getRowIndex(rowIndex)"></slot>
                    </div>
                </VirtualScroll>
            </template>
        </div>
        <Pagination ref="pageBottomRef" v-if="pagination && (pagePosition=='both' || pagePosition=='bottom')" class="datagrid-pager f-noshrink" 
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
`

export default {
    name: 'DataList',
    template: DATALIST_TEMPLATE,
    extends: ListBase,
    components: { VirtualScroll },
    props: {
        itemStyle: Object,
        itemCls: String,
        hoverCls: {
            type: String,
            default: 'datagrid-row-over'
        },
        selectedCls: {
            type: String,
            default: 'datagrid-row-selected'
        },
        scrollPosition: [Number,Object]
    },
    computed: {
        innerClasses() {
            return ['f-full', {
                'f-column': this.virtualScroll
            }];
        },
        innerStyle() {
            return {overflow: this.virtualScroll ? 'hidden' : 'auto'};
        },
        virtualItemStyle() {
            return Object.assign({}, this.itemStyle, {height:this.rowHeight+'px'});
        }
    },
    data() {
        return {
            vrows: [],
            scrollPositionState: this.scrollPosition
        }
    },
    mounted() {
        if (this.$refs.innerRef && this.scrollPositionState){
            this.$nextTick(() => {
                this.scrollTop(this.scrollPositionState);
                this.scrollPositionState = null;
            });
        }
    },
    methods: {
        getItemClass(row){
            let cc = [];
            if (this.itemCls){
                cc.push(this.itemCls);
            }
            if (this.hoverCls && this.highlightRow == row){
                cc.push(this.hoverCls);
            }
            if (this.selectedCls && this.isSelected(row)){
                cc.push(this.selectedCls);
            }
            return cc.length ? cc.join(' ') : null;    
        },
        getRowIndex(index){
            if (this.$refs.vscrollRef){
                return index + this.$refs.vscrollRef.startIndex;
            } else if (this.pagination){
                return index + (this.pageNumberState - 1) * this.pageSizeState;
            } else {
                return index;
            }
        },
        scrollTop(value){
            if (value != undefined){
                if (this.$refs.vscrollRef){
                    // this.$refs.vscrollRef.scrollTop(value);
                    this.$refs.vscrollRef.scrollState(value);
                } else {
                    this.$refs.innerRef.scrollTop = value;
                }
            } else {
                if (this.$refs.vscrollRef){
                    // return this.$refs.vscrollRef.scrollTop();
                    return this.$refs.vscrollRef.scrollState();
                } else {
                    return this.$refs.innerRef.scrollTop;
                }
            }
        },
        navRow(step){
            ListBase.methods.navRow.call(this, step);
            let index = this.rows.indexOf(this.highlightRow);
            if (index >= 0){
                this.$nextTick(() => {
                    let container = this.$refs.vscrollRef ? this.$refs.vscrollRef.$refs.bodyRef : this.$refs.innerRef;
                    let item = container.querySelector('.'+this.hoverCls);
                    if (item){
                        domHelper.scrollTo(container, item);
                    }
                })
            }
        },
        highlightFirstRow() {
            this.highlightRow = this.rows.length ? this.rows[0] : null;
            this.navRow(0);
        },
        scrollToSelectedRow(){
            let container = this.$refs.vscrollRef ? this.$refs.vscrollRef.$refs.bodyRef : this.$refs.innerRef;
            let item = container.querySelector('.'+this.selectedCls);
            if (item){
                domHelper.scrollTo(container, item);
            }
        }
    }
}