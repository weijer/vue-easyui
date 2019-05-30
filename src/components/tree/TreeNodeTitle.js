export default {
    name: 'TreeNodeTitle',
    props: {
        tree: Object,
        node: Object
    },
    render(h) {
        let cell = '';
        if (this.tree.$scopedSlots.default){
            cell = this.tree.$scopedSlots.default({
                node: this.node
            });
        } else {
            cell = this.node.text;
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