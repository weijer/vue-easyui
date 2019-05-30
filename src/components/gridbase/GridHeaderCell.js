import GridColumn from "./GridColumn";

export default {
    name: 'GridHeaderCell',
    props: {
        column: GridColumn
    },
    render(h){
        let cell = null;
        if (this.column.$slots.header){
            cell = this.column.$slots.header;
        } else if (this.column.$scopedSlots.header){
            cell = this.column.$scopedSlots.header({column:this.column});
        } else {
            cell = h('span', this.column.title);
        }
        return h(
            'div',
            {
                'class':{
                    'datagrid-cell':true,
                    'datagrid-sort':this.column.field && this.column.sortable,
                    'datagrid-sort-asc':this.column.currOrder=='asc',
                    'datagrid-sort-desc':this.column.currOrder=='desc'
                },
                'style':{
                    'text-align':this.column.halign || this.column.align || null
                }
            },
            [
                cell,
                h('span', {class:'datagrid-sort-icon'})
            ]
        )
    }
}