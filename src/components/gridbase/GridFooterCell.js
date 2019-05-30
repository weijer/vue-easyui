// import GridColumn from "./GridColumn";

export default {
    name: 'GridFooterCell',
    props: {
        row: Object,
        column: Object,
        rowIndex: Number
    },
    render(h) {
        let cell = null;
        if (this.column.$scopedSlots.footer){
            cell = this.column.$scopedSlots.footer({
                row: this.row,
                column: this.column,
                rowIndex: this.rowIndex
            });
        } else {
            cell = this.row[this.column.field];
        }
        return h(
            'div',
            {
                'class':'datagrid-cell',
                'style':{textAlign:this.column.align||null}
            },
            [cell]
        );
    }
}