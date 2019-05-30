import GridBody from '../gridbase/GridBody';
import TreeGridChildren from './TreeGridChildren';

export const TREEGRIDBODY_TEMPLATE = `
<div ref="bodyRef" class="datagrid-body f-full" @scroll="onScroll($event)">
    <div ref="innerRef" class="datagrid-body-inner">
        <TreeGridChildren :gridBody="this" :rows="rows" :columns="columns"></TreeGridChildren>
    </div>
</div>
`;

export default {
    name: 'TreeGridBody',
    template: TREEGRIDBODY_TEMPLATE,
    extends: GridBody,
    components: {
        TreeGridChildren
    },
    computed: {
        view() {
            return this.$parent;
        }
    }
}