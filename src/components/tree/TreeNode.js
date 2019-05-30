import SlideUpDown from '../base/SlideUpDown';
import TreeNodeTitle from './TreeNodeTitle';
import TreeNodeEditor from './TreeNodeEditor';
import domHelper from '../base/DomHelper';

export const TREENODE_TEMPLATE = `
<li>
    <div :class="nodeClasses"
            @mouseenter="tree.highlightNode=node"
            @mouseleave="tree.highlightNode=null"
            @contextmenu="onNodeContextMenu($event)"
            @click="onClickNode($event)"
            @dblclick="onDblClickNode($event)">
        <span class="tree-indent" :style="{width:indentWidth+'px'}"></span
        ><span v-if="!isLeaf" :class="hitClasses" @click="toggle($event)"></span
        ><span :class="iconClasses"></span
        ><span v-if="tree.checkboxState" :class="checkboxClasses" @click="onCheckNode($event)"></span
        ><TreeNodeTitle v-if="!tree.isEditing(node)" :node="node" :tree="tree"></TreeNodeTitle
        ><TreeNodeEditor v-else :node="node" :tree="tree"></TreeNodeEditor>
    </div>
    <template v-if="node.children && node.children.length">
    <ul class="f-block" v-SlideUpDown="{animate:tree.animate,collapsed:node.state=='closed',disabled:false}">
        <template v-for="cnode in node.children">
            <TreeNode v-if="!cnode.hidden" :node="cnode" :pnode="node" :depth="depth+1" :tree="tree"></TreeNode>
        </template>
    </ul>
    </template>
</li>
`;

export default {
    name: 'TreeNode',
    template: TREENODE_TEMPLATE,
    components: {TreeNodeTitle,TreeNodeEditor},
    directives: {SlideUpDown},
    props: {
        tree: Object,
        node: Object,
        pnode: Object,
        depth: {
            type: Number,
            default: 0
        },
        nodeCls: String
    },
    data() {
        return {
            loading: false,
            innerNode: this.node
        }
    },
    created() {
        this.node.parent = this.pnode;
    },
    computed: {
        indentWidth() {
            if (this.isLeaf){
                return (this.depth+1) * 16;
            } else {
                return this.depth * 16;
            }
        },
        nodeClasses(){
            return ['tree-node', this.node.nodeCls, {
                'tree-node-hover': this.node==this.tree.highlightNode,
                'tree-node-selected': this.isSelected
            }];
        },
        hitClasses(){
            return ['tree-hit', {
                'tree-expanded': this.isExpanded,
                'tree-collapsed': this.isCollapsed
            }];
        },
        iconClasses(){
            return ['tree-icon tree-folder', this.node.iconCls, {
                'tree-folder-open': this.isExpanded,
                'tree-file': this.isLeaf,
                'tree-loading': this.loading
            }];
        },
        checkboxClasses() {
            let cc = ['unchecked','checked','indeterminate'];
            let index = cc.indexOf(this.node.checkState);
            if (index == -1){
                index = 0;
            }
            return 'tree-checkbox tree-checkbox' + index;
        },
        isExpanded() {
            if (!this.node.state || this.node.state == 'open'){
                return true;
            } else {
                return false;
            }
        },
        isCollapsed() {
            if (this.node.state && this.node.state == 'closed'){
                return true;
            } else {
                return false;
            }
        },
        isSelected() {
            return this.node == this.tree.selectionState;
        },
        isLeaf() {
            if (this.node.state == 'closed'){
                return false;
            } else {
                if (this.node.children && this.node.children.length){
                    this.loading = false;
                    return false;
                } else {
                    if (this.loading){
                        return false;
                    }
                    return true;
                }
            }
        }
    },
    methods: {
        toggle(event) {
            event.stopPropagation();
            if (this.isExpanded){
                this.$set(this.node, 'state', 'closed');
                this.tree.$emit('nodeCollapse', this.node);
            } else {
                this.loading = true;
                this.$set(this.node, 'state', 'open');
                this.tree.$emit('nodeExpand', this.node);
            }
        },
        onClickNode(event){
            const {clickToEdit,dblclickToEdit,editingItem} = this.tree;
            event.stopPropagation();
            this.tree.$emit('nodeClick', this.node);
            this.tree.selectNode(this.node);
            if (clickToEdit || (dblclickToEdit && editingItem)){
                this.tree.beginEdit(this.node, domHelper.closest(event.target,'.tree-node'));
            }
        },
        onDblClickNode(event){
            event.stopPropagation();
            this.tree.$emit('nodeDblClick', this.node);
            if (this.tree.dblclickToEdit){
                this.tree.beginEdit(this.node, domHelper.closest(event.target,'.tree-node'));
            }
        },
        onCheckNode(event){
            event.stopPropagation();
            if (this.node.checkState == 'checked'){
                this.tree.uncheckNode(this.node);
            } else {
                this.tree.checkNode(this.node);
            }
        },
        onNodeContextMenu(event){
            this.tree.$emit('nodeContextMenu', {node:this.node, originalEvent:event});
        }
            
    }
}