import GridFilterCell from './GridFilterCell';

export const GRID_FILTER_ROW_TEMPLATE = `
<tr class="datagrid-header-row datagrid-filter-row">
    <td v-for="col in columns">
        <GridFilterCell :column="col" :grid="grid"></GridFilterCell>
    </td>
</tr>
`;

export default {
    name: 'GridFilterRow',
    template: GRID_FILTER_ROW_TEMPLATE,
    components: {
        GridFilterCell
    },
    props: {
        columns: Array,
        grid: Object
    },
    methods1: {
        isOnLeft(col) {
            if (col.filterOperators && col.filterOperators.length){
                if (this.grid.filterBtnPosition == 'left'){
                    return true;
                }
            }
            return false;
        },
        isOnRight(col) {
            if (col.filterOperators && col.filterOperators.length){
                if (this.grid.filterBtnPosition == 'right'){
                    return true;
                }
            }
            return false;
        }
    
    }
}