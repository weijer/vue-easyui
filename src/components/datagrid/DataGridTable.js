import domHelper from '../base/DomHelper';
import GridBodyCell from '../gridbase/GridBodyCell';
import DataGridRowDetail from './DataGridRowDetail';
import DataGridRowGroup from './DataGridRowGroup';

export const DATA_GRID_TABLE_TEMPLATE = `
<table class="datagrid-btable" border="0" cellspacing="0" cellpadding="0">
    <colgroup>
        <col v-for="col in columns" :style="{width:col.widthState}">
    </colgroup>
    <tbody>
        <template v-for="(row,rowIndex) in rows">
        <tr v-if="grid.isGroupRow(row)" class="datagrid-row datagrid-group-row">
            <td class="datagrid-td-group" :colspan="columns.length">
                <div class="datagrid-group f-row">
                    <span v-if="showExpandIcon()"
                        class="datagrid-group-expander f-row f-content-center f-noshrink"
                        :style="{width:grid.expanderWidth+'px'}"
                        @click="onGroupExpanderClick(row.value, $event)">
                        <span class="datagrid-row-expander"
                            :class="{'datagrid-row-expand':row.collapsed,'datagrid-row-collapse':!row.collapsed}">
                        </span>
                    </span>
                    <DataGridRowGroup :grid="grid" :left="-titleLeft()" :row="row"></DataGridRowGroup>
                </div>
            </td>
        </tr>
        <tr v-if="!grid.isGroupRow(row)" class="datagrid-row"
                :class="[getRowClass(row),{'datagrid-row-over':grid.isHighlighted(row),'datagrid-row-selected':grid.isSelected(row),'datagrid-row-alt':grid.striped && getRowIndex(rowIndex,row)%2}]"
                :style="getRowStyle(row)"
                @mouseenter="grid.highlightRow=row"
                @mouseleave="grid.highlightRow=null"
                @click="onRowClick(row,$event)"
                @dblclick="onRowDblClick(row,$event)"
                @contextmenu="onRowContextMenu(row,$event)">
            <template v-for="col in columns">
                <td v-if="col.expander" class="datagrid-td-expander">
                    <div class="datagrid-cell f-row f-content-center">
                        <span class="datagrid-row-expander"
                            :class="{'datagrid-row-collapse':grid.isRowExpanded(row),'datagrid-row-expand':!grid.isRowExpanded(row)}"
                            @click="onDetailExpanderClick(row, $event)">
                        </span>
                    </div>
                </td>
                <td v-else class="datagrid-td"
                        :class="[getCellClass(col,row),{'datagrid-row-selected':grid.isSelected(row,col),'datagrid-row-over':grid.isHighlighted(row,col)}]"
                        :style="getCellStyle(col,row)"
                        @mouseenter="grid.highlightCell={row:row,column:col}"
                        @mouseleave="grid.highlightCell=null"
                        @click="onCellClick(row,col,$event)"
                        @dblclick="onCellDblClick(row,col,$event)"
                        @contextmenu="onCellContextMenu(row,col,$event)"
                        @keydown="onCellKeyDown(row,col,$event)">
                    <GridBodyCell :row="row" :column="col" :rowIndex="getRowIndex(rowIndex,row)"></GridBodyCell>
                </td>
            </template>
        </tr>
        <tr v-if="grid.$scopedSlots.detail && grid.isRowExpanded(row) && !grid.isGroupRow(row)">
            <td :colspan="columns.length">
                <DataGridRowDetail :gridBody="gridBody" :row="row" :rowIndex="getRowIndex(rowIndex,row)"></DataGridRowDetail>
            </td>
        </tr>
        </template>
    </tbody>
</table>
`;

export default {
    name: 'DataGridTable',
    template: DATA_GRID_TABLE_TEMPLATE,
    components: {
        GridBodyCell,
        DataGridRowDetail,
        DataGridRowGroup
    },
    props: {
        columns: {
            type: Array,
            default: () => []
        },
        rows: {
            type: Array,
            default: () => []
        },
        gridBody: Object
    },
    computed: {
        grid(){
            return this.gridBody.view.grid;
        }
    },
    methods: {
        showExpandIcon(){
            if (this.grid.leftColumns){
                if (this.gridBody.view.viewIndex == 1){
                    return true;
                }
            } else if (this.gridBody.view.viewIndex == 2){
                return true;
            }
            return false;
        },
        groupTitleWidth(){
            return domHelper.outerWidth(this.$refs.groupTitleRef);
        },
        titleLeft(){
            if (this.gridBody.view.viewIndex == 2){
                if (this.grid.leftColumns){
                    if (this.grid.view1){
                        let width = domHelper.outerWidth(this.grid.$refs.view1.$refs.body.$refs.bodyRef);
                        return width - this.grid.expanderWidth;
                    }
                }
            }
            return null;    
        },
        onRowClick(row){
            this.grid.onRowClick(row);
        },
        onRowDblClick(row){
            this.grid.$emit('rowDblClick', row);
        },
        onRowContextMenu(row, event){
            this.grid.$emit('rowContextMenu', {row:row, originalEvent:event});
        },
        onCellClick(row, col, event){
            let cellEl = domHelper.closest(event.target, '.datagrid-td');
            let rowEl = domHelper.closest(cellEl, '.datagrid-row');
            this.grid.onCellClick(row, col, event);
            if (this.grid.clickToEdit || (this.grid.dblclickToEdit && this.grid.editingItem)){
                this.doEdit(row, col, rowEl, cellEl);
            }
        },
        onCellDblClick(row, col, event){
            let cellEl = domHelper.closest(event.target, '.datagrid-td');
            let rowEl = domHelper.closest(cellEl, '.datagrid-row');
            this.grid.$emit('cellDblClick', {row:row, column:col});
            if (this.grid.dblclickToEdit){
                this.doEdit(row, col, rowEl, cellEl);
            }
        },
        onCellContextMenu(row,col,event){
            this.grid.$emit('cellContextMenu', {row:row,column:col,originalEvent:event});
        },
        onCellKeyDown(row, col, event){
            // if (this.grid.editMode == 'cell'){
            //     setTimeout(() => {
            //         if (event.which == 13){
            //             event.stopPropagation();
            //             this.grid.endEdit();
            //         } else if (event.which == 27){
            //             event.stopPropagation();
            //             this.grid.cancelEdit();
            //         }
            //     });
            // }
        },
        doEdit(row, col, rowEl, cellEl){
            this.grid.beginEdit(row, col, rowEl);
            setTimeout(() => {
                let input = cellEl.querySelector('.textbox-text');
                if (input){
                    input.focus();
                }
            });
        },
        onGroupExpanderClick(value, event){
            event.stopPropagation();
            this.grid.toggleGroup(value);
        },
        onDetailExpanderClick(row, event){
            event.stopPropagation();
            this.grid.toggleRow(row);
        },
        getRowIndex(rowIndex,row){
            if (this.grid.groupField){
                rowIndex = row._rowIndex;
            }
            return this.grid.getAbsoluteIndex(rowIndex);
        },
        getCss(css, row, value, type){
            if (css){
                let cssValue = typeof css == 'function' ? css(row, value) : css;
                if (type == 'class'){
                    return typeof cssValue == 'string' ? cssValue : null;
                } else {
                    return typeof cssValue == 'object' ? cssValue : null;
                }
            }
            return null;
        },
        getRowClass(row) {
            return this.getCss(this.grid.rowCss, row, null, 'class');
        },
        getRowStyle(row) {
            return this.getCss(this.grid.rowCss, row, null, 'style');
        },
        getCellClass(column, row){
            return this.getCss(column.cellCss, row, row[column.field], 'class');
        },
        getCellStyle(column, row){
            return this.getCss(column.cellCss, row, row[column.field], 'style');
        },
        isEditable(row, col) {
            if (this.grid.isEditing(row, col)){
                if (col.editable){
                    return true;
                }
            }
            return false;
        }
                                                          
    
    }
}