import domHelper from '../base/DomHelper';
import GridBodyCell from '../gridbase/GridBodyCell';
import TreeGridTitle from './TreeGridTitle';

export const TREEGRIDROW_TEMPLATE = `
<tr :class="['datagrid-row',{'datagrid-row-over':grid.isHighlighted(row),'datagrid-row-selected':grid.isSelected(row)}]"
    @mouseenter="grid.highlightRow=row"
    @mouseleave="grid.highlightRow=null"
    @click="onRowClick(row,$event)"
    @dblclick="onRowDblClick(row,$event)"
    @contextmenu="onRowContextMenu(row,$event)">
    <td v-for="col in columns"
            :class="[{'datagrid-row-selected':grid.isSelected(row,col),'datagrid-row-over':grid.isHighlighted(row,col)}]"
            @mouseenter="grid.highlightCell={row:row,column:col}"
            @mouseleave="grid.highlightCell=null"
            @click="onCellClick(col,$event)"
            @dblclick="onCellDblClick(col,$event)"
            @contextmenu="onCellContextMenu(col,$event)"
            @keydown="onCellKeyDown(col,$event)">
        <GridBodyCell v-if="!isTreeField(col.field) || isEditable(row,col)" :row="row" :column="col"></GridBodyCell>
        <div v-else
                :class="['datagrid-cell',{'datagrid-editable':isEditable(row,col)}]"
                :style="{textAlign:col.align||null}">
            <template v-if="!isEditable(row,col)">
                <span class="tree-indent" :style="{width:indentWidth+'px'}"></span
                ><span v-if="!isLeaf" :class="hitClasses" @click="toggle($event)"></span
                ><span :class="iconClasses"></span
                ><span v-if="grid.checkbox" :class="checkboxClasses" @click="onCheckRow($event)"></span
                ><TreeGridTitle :row="row" :column="col"></TreeGridTitle>
            </template>
        </div>
    </td>
</tr>
`;

export default {
    name: 'TreeGridRow',
    template: TREEGRIDROW_TEMPLATE,
    components: {
        GridBodyCell,
        TreeGridTitle
    },
    props: {
        gridBody: Object,
        row: Object,
        prow: Object,
        columns: Array,
        depth: Number,
        rowIndex: Number
    },
    data() {
        return {
            loading: false
        }
    },
    computed: {
        grid(){
            return this.gridBody.view.grid;
        },
        indentWidth() {
            if (this.isLeaf){
                return (this.depth+1) * 16;
            } else {
                return this.depth * 16;
            }
        },
        isExpanded() {
            if (!this.row.state || this.row.state == 'open'){
                return true;
            } else {
                return false;
            }
        },
        isCollapsed() {
            if (this.row.state && this.row.state == 'closed'){
                return true;
            } else {
                return false;
            }
        },
        isLeaf() {
            if (this.row.state == 'closed'){
                return false;
            } else {
                if (this.row.children && this.row.children.length){
                    this.loading = false;
                    return false;
                } else {
                    if (this.loading){
                        return false;
                    }
                    return true;
                }
            }
        },
        hitClasses(){
            return ['tree-hit', {
                'tree-expanded': this.isExpanded,
                'tree-collapsed': this.isCollapsed
            }];
        },
        iconClasses(){
            return ['tree-icon tree-folder', this.row.iconCls, {
                'tree-folder-open': this.isExpanded,
                'tree-file': this.isLeaf,
                'tree-loading': this.loading
            }];
        },
        checkboxClasses() {
            let cc = ['unchecked','checked','indeterminate'];
            let index = cc.indexOf(this.row.checkState);
            if (index == -1){
                index = 0;
            }
            return 'tree-checkbox tree-checkbox' + index;
        }
    },
    created() {
        this.row.parent = this.prow;
    },
    methods: {
        isTreeField(field) {
            return field == this.gridBody.view.grid.treeField;
        },
        isEditable(row,col) {
            if (this.grid.isEditing(row, col)){
                if (col.editable){
                    return true;
                }
            }
            return false;
        },
        doEdit(col, target){
            target = domHelper.closest(target, 'td');
            this.grid.beginEdit(this.row, col);
            setTimeout(() => {
                let input = target.querySelector('.textbox-text');
                if (input){
                    input.focus();
                }
            });
        },
        toggle(event) {
            event.stopPropagation();
            if (this.isExpanded){
                this.$set(this.row, 'state', 'closed');
                this.grid.$emit('rowCollapse', this.row);
            } else {
                this.loading = true;
                this.$set(this.row, 'state', 'open');
                this.grid.$emit('rowExpand', this.row);
            }
        },
        onCheckRow(event){
            event.stopPropagation();
            if (this.row.checkState == 'checked'){
                this.grid.uncheckRow(this.row);
            } else {
                this.grid.checkRow(this.row);
            }
        },
        onRowClick(row, event){
            event.stopPropagation();
            this.grid.onRowClick(row);
        },
        onRowDblClick(row){
            this.grid.$emit('rowDblClick', row);
        },
        onRowContextMenu(row, event){
            this.grid.$emit('rowContextMenu', {row:row, originalEvent:event});
        },
        onCellClick(col, event){
            this.grid.onCellClick(this.row, col, event);
            if (this.grid.clickToEdit || (this.grid.dblclickToEdit && this.grid.editingItem)){
                this.doEdit(col, event.target);
            }
        },
        onCellDblClick(col, event){
            this.grid.$emit('cellDblClick', {row:this.row, column:col});
            if (this.grid.dblclickToEdit){
                this.doEdit(col, event.target);
            }
        },
        onCellContextMenu(col, event){
            this.grid.$emit('cellContextMenu', {row:this.row,column:col,originalEvent:event});
        },
        onCellKeyDown(col, event){
            if (this.grid.editMode == 'cell'){
                if (event.which == 13){
                    event.stopPropagation();
                    this.grid.endEdit();
                } else if (event.which == 27){
                    event.stopPropagation();
                    this.grid.cancelEdit();
                }
            }
        }
    }
}