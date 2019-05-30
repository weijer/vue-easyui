export default {
    name: 'DataGridRowDetail',
    props: {
        gridBody: Object,
        row: Object,
        rowIndex: Number
    },
    computed: {
        grid(){
            return this.gridBody.view.grid;
        }
    },
    render(h){
        if (this.gridBody.view.viewIndex==2){
            return h(
                'div',
                {
                    'class':'datagrid-row-detail'
                },
                [
                    this.grid.$scopedSlots.detail({
                        row: this.row,
                        rowIndex: this.rowIndex
                    })
                ]
            );
        } else {
            return '';
        }
    }
}