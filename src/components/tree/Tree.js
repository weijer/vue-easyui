import treeHelper from '../base/TreeHelper';
import TreeNode from './TreeNode';

export const TREE_TEMPLATE = `
<ul class="tree">
    <template v-for="node in innerData">
        <TreeNode v-if="!node.hidden" :node="node" :tree="tree"></TreeNode>
    </template>
</ul>
`;

export default {
    name: 'Tree',
    template: TREE_TEMPLATE,
    components: {
        TreeNode
    },
    props: {
        data: Array,
        selection: Object,
        animate: {
            type: Boolean,
            default: false
        },
        selectLeafOnly: {
            type: Boolean,
            default: false
        },
        checkbox: {
            type: Boolean,
            default: false
        },
        cascadeCheck: {
            type: Boolean,
            default: true
        },
        clickToEdit: {
            type: Boolean,
            default: false
        },
        dblclickToEdit: {
            type: Boolean,
            default: false
        },
        editRules: [Array,Object],
        tipOptions: Object,
        filterIncludingChild: {
            type: Boolean,
            default: false
        },
        filter: {
            type: Function,
            default: (q,node) => {
                if (!q){
                    return true;
                }
                let qq = (q instanceof Array) ? q : [q];
                qq = qq.map((q) => q.trim()).filter((q) => q);
                for(let i=0; i<qq.length; i++){
                    let index = node.text.toLowerCase().indexOf(qq[i].toLowerCase());
                    if (index >= 0){
                        return true;
                    }
                }
                return !qq.length;
            }
        }
    },
    data() {
        return {
            highlightNode: null,
            editingItem: null,
            innerData: [],
            selectionState: this.selection,
            checkboxState: this.checkbox
        }
    },
    computed: {
        tree(){
            return this;
        }
    },
    watch: {
        data(value){
            this.setData(value);
        },
        selection(value){
            this.selectNode(value);
        },
        checkbox(value){
            this.checkboxState = value;
        }
    },
    created() {
        treeHelper.$vue = this;
    },
    mounted() {
        this.setData(this.data);
    },
    methods: {
        setData(value){
            if (value == null){
                value = [];
            }
            this.innerData = Object.assign([], value);
        },
        getCheckedNodes(state = 'checked'){
            let nodes = [];
            treeHelper.cascadeCheck = this.cascadeCheck;
            treeHelper.forNodes(this.innerData, (node) => {
                if (node.checkState == state){
                    nodes.push(node);
                }
            });
            return nodes;
        },
    
        selectNode(node){
            if (node.children && node.children.length && this.selectLeafOnly){
                return;
            }
            if (this.selectionState != node){
                this.selectionState = node;
                this.$emit('selectionChange', node);
            }
        },
        checkNode(node){
            treeHelper.cascadeCheck = this.cascadeCheck;
            treeHelper.checkNode(node, () => {
                this.$emit('nodeCheck', node);
                this.$emit('checkChange', this.getCheckedNodes());
            });
        },
        uncheckNode(node){
            treeHelper.cascadeCheck = this.cascadeCheck;
            treeHelper.uncheckNode(node, () => {
                this.$emit('nodeUncheck', node);
                this.$emit('checkChange', this.getCheckedNodes());
            });
        },
        uncheckAllNodes() {
            treeHelper.uncheckAllNodes(this.innerData, () => {
                this.$emit('checkChange', []);
            });
        },
        adjustCheck(node) {
            treeHelper.cascadeCheck = this.cascadeCheck;
            treeHelper.adjustCheck(node);
        },
        showNode(node) {
            this.$set(node, 'hidden', false);
        },
        hideNode(node) {
            this.$set(node, 'hidden', true);
        },
        doFilter(q){
            let nodes = [];
            treeHelper.cascadeCheck = this.cascadeCheck;
            treeHelper.forNodes(this.innerData, (node) => {
                if (this.filter(q, node)){
                    this.showNode(node);
                    nodes.push(node);
                } else {
                    this.hideNode(node);
                }
            });
            for(let node of nodes){
                let pnode = node.parent;
                while(pnode){
                    this.showNode(pnode);
                    pnode = pnode.parent;
                }
                if (this.filterIncludingChild && node.children){
                    treeHelper.forNodes(node.children, (node) => {
                        this.showNode(node);
                    });
                }
            }
        },
        isEditing(node){
            if (this.editingItem){
                return this.editingItem.node == node;
            }
            return false;
        },
        beginEdit(node, el=null){
            if (!this.isEditing(node)){
                this.endEdit();
                if (this.editingItem){
                    setTimeout(() => {
                        this.selectNode(this.editingItem.node)
                    })
                    return;
                }
                this.editingItem = {
                    node: node,
                    originalValue: node.text,
                    element: el
                }
                this.$emit('editBegin', this.editingItem);
            }
        },
        endEdit(){
            if (this.editingItem){
                let el = this.editingItem.element;
                if (el && el.querySelector('.validatebox-invalid')){
                    return;
                }
                if (this.editingItem.invalid){
                    return;
                }
                this.$emit('editEnd', this.editingItem);
                this.editingItem = null;
            }
        },
        cancelEdit(){
            if (this.editingItem){
                this.editingItem.node.text = this.editingItem.originalValue;
                this.$emit('editCancel', this.editingItem);
                this.editingItem = null;
            }
        }
                        
    }
}