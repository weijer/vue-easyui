export default {
    name: 'TreeGridTitle',
    props: {
        row: Object,
        column: Object,
        rowIndex: Number
    },
    render(h) {
        let cell = '';
        if (this.column.$scopedSlots.body){
            cell = this.column.$scopedSlots.body({
                row: this.row,
                column: this.column,
                rowIndex: this.rowIndex
            });
        } else if (this.column.$scopedSlots.cell) {
            cell = this.column.$scopedSlots.cell({
                row: this.row,
                column: this.column,
                rowIndex: this.rowIndex
            });
        } else {
            cell = this.row[this.column.field];
        }
        return h(
            'span',
            {
                'class':'tree-title'
            },
            [
                cell
            ]
        )
    }
}