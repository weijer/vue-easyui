import treeHelper from '../base/TreeHelper';
import SideMenuItems from './SideMenuItems';

export const SIDEMENU_TEMPLATE = `
<div class="f-column">
    <div v-if="collapsed" class="sidemenu sidemenu-collapsed f-full">
        <div :class="['accordion',{'accordion-noborder':!border}]">
            <template v-for="menu in innerData">
            <div class="panel-header accordion-header" v-Tooltip="getTipOpts(menu)">
                <div class="panel-title panel-with-icon"></div>
                <div :class="['panel-icon',menu.iconCls]"></div>
            </div>
            </template>
        </div>
    </div>
    <SideMenuItems v-if="!collapsed" :sidemenu="sidemenu" :data="innerData"></SideMenuItems>
</div>
`;

export default {
    name: 'SideMenu',
    template: SIDEMENU_TEMPLATE,
    components: {
        SideMenuItems
    },
    props: {
        data: Array,
        collapsed: {
            type: Boolean,
            default: false
        },
        border: {
            type: Boolean,
            default: true
        },
        animate: {
            type: Boolean,
            default: true
        },
        multiple: {
            type: Boolean,
            default: true
        },
        floatMenuWidth: {
            type: Number,
            default: 200
        },
        floatMenuPosition: {
            type: String,
            default: 'right'
        }
    },
    data() {
        return {
            selection: null,
            tipClosed: true,
            innerData: []
        }
    },
    watch: {
        data(value) {
            this.setData(value);
        }
    },
    computed: {
        sidemenu(){
            return this;
        }
    },
    created(){
        this.setData(this.data);
    },
    methods: {
        setData(value){
            if (value == null){
                value = [];
            }
            this.innerData = Object.assign([],value);
            treeHelper.$vue = this;
            treeHelper.forNodes(this.innerData, (node) => {
                if (!node.iconCls){
                    this.$set(node, 'iconCls', 'sidemenu-default-icon');
                }
                if (node.children){
                    this.$set(node, 'nodeCls', 'tree-node-nonleaf');
                    if (!node.state){
                        this.$set(node, 'state', 'closed');
                    }
                    if (node.state == 'open'){
                        this.$set(node, 'nodeCls', 'tree-node-nonleaf');
                    } else {
                        this.$set(node, 'nodeCls', 'tree-node-nonleaf tree-node-nonleaf-collapsed');
                    }
                }
            });
        },
        getTipOpts(menu){
            return {
                position: this.floatMenuPosition,
                tooltipCls: 'sidemenu-tooltip',
                valign: 'top',
                propsData: {
                    sidemenu: this,
                    data: menu,
                    tip: true,
                    width: this.floatMenuWidth
                },
                component: SideMenuItems,
                closed: menu.tipClosed!=null?menu.tipClosed:true,
                tooltipShow: () => {
                    this.$set(menu, 'tipClosed', false);
                },
                tooltipHide: () => {
                    this.$set(menu, 'tipClosed', true);
                }
            };
        },
        onSelectionChange(node){
            this.selection = node;
            this.$emit('selectionChange', this.selection);
        },
        onNodeClick(node){
            if (node.children){
                this.$set(node, 'state', node.state=='closed' ? 'open' : 'closed');
                if (node.state == 'open'){
                    this.$set(node, 'nodeCls', 'tree-node-nonleaf');
                } else {
                    this.$set(node, 'nodeCls', 'tree-node-nonleaf tree-node-nonleaf-collapsed');
                }
            } else {
                this.$emit('itemClick', node);
                this.innerData.forEach(menu => this.$set(menu, 'tipClosed', true));
            }
        }
    }
}