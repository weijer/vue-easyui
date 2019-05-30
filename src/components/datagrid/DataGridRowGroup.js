export default {
    name: 'DataGridRowGroup',
    props: {
        row: Object,
        left: Number,
        grid: Object
    },
    render(h){
        return h(
            'div',
            {
                'class':'datagrid-group-title',
                'style':{left:this.left+'px'}
            },
            [
                this.grid.$scopedSlots.group ? this.grid.$scopedSlots.group({
                    value: this.row.value,
                    rows: this.row.rows
                }) : this.row.value
            ]
        )
    }
}