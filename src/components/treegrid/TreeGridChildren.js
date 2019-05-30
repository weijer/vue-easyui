import SlideUpDown from '../base/SlideUpDown';
import TreeGridRow from './TreeGridRow';

export const TREEGRIDCHILDREN_TEMPLATE = `
<table class="datagrid-btable" border="0" cellspacing="0" cellpadding="0">
    <colgroup>
        <col v-for="col in columns" :style="{width:col.widthState}">
    </colgroup>
    <tbody>
        <template v-for="(row,index) in rows">
            <TreeGridRow :gridBody="gridBody" :row="row" :prow="prow" :columns="columns" :depth="depth"></TreeGridRow>
            <tr v-if="row.children && row.children.length" class="treegrid-tr-tree">
                <td :colspan="columns.length" style="border:0">
                    <div v-SlideUpDown="{animate:grid.animate,collapsed:row.state=='closed',disabled:false}">
                        <TreeGridChildren :gridBody="gridBody" :rows="row.children" :prow="row" :columns="columns" :depth="depth+1"></TreeGridChildren>
                    </div>
                </td>
            </tr>
        </template>
    </tbody>
</table>
`;

export default {
    name: 'TreeGridChildren',
    template: TREEGRIDCHILDREN_TEMPLATE,
    components: {
        TreeGridRow
    },
    directives: {SlideUpDown},
    props: {
        gridBody: Object,
        rows: {
            type: Array,
            default: () => []
        },
        prow: Object,
        columns: Array,
        depth: {
            type: Number,
            default: 0
        }
    },
    computed: {
        grid(){
            return this.gridBody.view.grid;
        }
    }
}