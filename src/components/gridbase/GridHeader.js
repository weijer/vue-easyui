import domHelper from '../base/DomHelper';
import GridHeaderCell from './GridHeaderCell';
import GridFilterRow from './GridFilterRow';
import Resizable from '../resizable/Resizable';

export const GRID_HEADER_TEMPLATE = `
    <div class="datagrid-header f-row f-noshrink">
        <div ref="headerRef" class="datagrid-header-inner f-full" :style="{height:heightState+'px'}">
            <table ref="contentRef" class="datagrid-htable" border="0" cellspacing="0" cellpadding="0">
				<colgroup>
					<col v-for="col in columns" :style="{width:col.widthState}">
                </colgroup>
                <tbody v-if="columnGroup">
                    <GridFilterRow v-if="filterOnTop" :columns="columns" :grid="grid"></GridFilterRow>
                    <tr v-for="row in columnGroup.rows" class="datagrid-header-row">
                        <td v-for="col in row.columns"
                                v-Resizable="getResizableOpts(col)"
                                :rowspan="col.rowspan"
                                :colspan="col.colspan"
                                :class="{'datagrid-field-td':col.field,'datagrid-header-over':hoverColumn==col && col.sortable}"
                                @mouseenter="hoverColumn=col"
                                @mouseleave="hoverColumn=null"
                                @click="onCellClick($event,col)">
                            <GridHeaderCell :column="col"></GridHeaderCell>
                        </td>
                    </tr>
                    <GridFilterRow v-if="filterOnBottom" :columns="columns" :grid="grid"></GridFilterRow>
                </tbody>
                <tbody v-if="!columnGroup">
                    <GridFilterRow v-if="filterOnTop" :columns="columns" :grid="grid"></GridFilterRow>
                    <tr class="datagrid-header-row">
                        <td v-for="col in columns"
                                v-Resizable="getResizableOpts(col)"
                                class="datagrid-field-td"
                                :class="{'datagrid-header-over':hoverColumn==col && col.sortable}"
                                @mouseenter="hoverColumn=col"
                                @mouseleave="hoverColumn=null"
                                @click="onCellClick($event,col)">
                            <GridHeaderCell :column="col"></GridHeaderCell>
                        </td>
                    </tr>
                    <GridFilterRow v-if="filterOnBottom" :columns="columns" :grid="grid"></GridFilterRow>
                </tbody>
            </table>
        </div>
		<div v-if="paddingWidth" class="datagrid-header f-noshrink" :style="{width:paddingWidth+'px'}"></div>
    </div>
`;

export default {
    name: 'GridHeader',
    template: GRID_HEADER_TEMPLATE,
    components: {
        GridHeaderCell,
        GridFilterRow
    },
    directives: {
        Resizable
    },
    props: {
        columns: {
            type: Array,
            default: () => []
        },
        columnGroup: Object,
        paddingWidth: {
            type: Number,
            default: 0
        },
        filterable: {
            type: Boolean,
            default: false
        },
        grid: Object
    },
    data() {
        return {
            heightState: 0,
            scrollLeftState: 0,
            hoverColumn: null
        }
    },
    computed: {
        filterOnTop(){
            if (this.grid.filterable){
                if (this.grid.filterPosition == 'both' || this.grid.filterPosition == 'top'){
                    return true;
                }
            }
            return false;    
        },
        filterOnBottom(){
            if (this.grid.filterable){
                if (this.grid.filterPosition == 'both' || this.grid.filterPosition == 'bottom'){
                    return true;
                }
            }
            return false;
        }
    },
    methods: {
        height(value){
            if (value == undefined){
                return domHelper.outerHeight(this.$refs.contentRef);
            } else {
                this.heightState = value ? value-1 : value;
            }
        },
        scrollLeft(value){
            if (value == undefined){
                return this.scrollLeftState;
            } else {
                this.scrollLeftState = value;
                this.$refs.headerRef.scrollLeft = value;
            }
        },
        onCellClick(event, col){
            this.$emit('cellClick', {
                column: col,
                originalEvent: event
            });
        },
        getResizableOpts(col){
            return {
                disabled: !this.grid.columnResizing || !col.field,
                handles: 'e',
                resizing: (event)=>{this.onColumnResizing(col,event)},
                resizeStop: (event)=>{this.onColumnResizeStop(col,event)}
            }
        },
        onColumnResizing(col,event){
            event.target.style.width = null;
            event.target.style.left = null;
            event.target.style.top = null;
            this.grid.resizeColumn(col.field, event.width);
        },
        onColumnResizeStop(col,event){
            event.target.style.width = null;
            event.target.style.left = null;
            event.target.style.top = null;
            this.grid.resizeColumn(col.field, event.width);
        }
    }
}