import domHelper from '../base/DomHelper';
import GridBody from '../gridbase/GridBody';
import DataGridTable from './DataGridTable';
// import { DomHelper } from '../base/DomHelper';

export const DATAGRIDBODY_TEMPLATE = `
<div ref="bodyRef" class="datagrid-body f-full" style="margin-top:0"
        :class="{'datagrid-vbody f-column':isVirtualScroll}"
        @scroll="onScroll($event)">
    <div ref="innerRef" class="datagrid-body-inner"
            :class="{'f-column f-full panel-noscroll':isVirtualScroll}"
            :style="{marginTop:marginTop+'px'}">
        <DataGridTable v-if="!isVirtualScroll" :columns="columns" :rows="currRows" :gridBody="this"></DataGridTable>
        <VirtualScroll v-if="isVirtualScroll" ref="vscroll"
                class="f-full"
                :data="rows"
                :total="view.grid.total"
                :pageSize="view.grid.pageSize"
                :rowHeight="view.grid.rowHeight"
                :lazy="view.grid.lazy"
                :pageNumber="view.grid.pageNumber"
                @update="onVirtualPageUpdate($event)"
                @bodyScroll="onVirtualScroll($event)"
                @pageChange="onVirtualPageChange($event)">
            <DataGridTable :columns="columns" :rows="currRows" :gridBody="this"></DataGridTable>
        </VirtualScroll>
    </div>
</div>
`;

export default {
    name: 'DataGridBody',
    template: DATAGRIDBODY_TEMPLATE,
    extends: GridBody,
    components: {
        DataGridTable
    },
    data() {
        return {
            marginTop: 0,
            currRows: []
        }
    },
    computed: {
        view() {
            return this.$parent;
        },
        isVirtualScroll() {
            if (this.view.grid.virtualScroll && this.view.viewIndex == 2){
                return true;
            } else {
                return false;
            }
    
        }
    },
    watch: {
        rows(){
            // this.currRows = this.rows;
            // if (this.view.grid.virtualScroll && this.view.viewIndex != 2){
            //     this.currRows = this.rows.slice(0, this.view.grid.pageSize*2);
            // }
            if (this.view.grid.virtualScroll){
                this.currRows = this.rows.slice(0, this.view.grid.pageSize*2);
            } else {
                this.currRows = this.rows;
            }
        }
    },
    methods: {
        scrollTop(value){
            if (value == undefined){
                if (this.isVirtualScroll){
                    return this.$refs.vscroll.relativeScrollTop();
                } else {
                    return this.$refs.bodyRef.scrollTop;
                }
            } else {
                if (!this.isVirtualScroll){
                    this.marginTop = -value;
                }
            }
        },
        scrollbarWidth(){
            if (this.$refs.vscroll){
                return this.$refs.vscroll.scrollbarWidth();
            } else {
                return domHelper.outerWidth(this.$refs.bodyRef) - domHelper.outerWidth(this.$refs.innerRef);
            }
        },
        onVirtualScroll(event){
            this.$emit('bodyScroll', event);
        },
        onVirtualPageChange(event){
            this.view.grid.onVirtualPageChange(event);
        },
        onVirtualPageUpdate(event){
            this.currRows = event;
            this.view.grid.updateFrozenView(this.$refs.vscroll ? this.$refs.vscroll.scrollTop : 0, this.currRows);
        }
    }
}
