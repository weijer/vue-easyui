import { Accordion, AccordionPanel } from '../accordion';
import Tree from '../tree/Tree';

export const SIDEMENUITEMS_TEMPLATE = `
<div class="sidemenu f-column f-full" :style="{width:width?width+'px':null}">
    <Accordion ref="accordion" class="f-full"
            :border="border"
            :animate="sidemenu.animate"
            :multiple="multiple"
            @panelSelect="onPanelSelect($event)"
            @panelUnselect="onPanelUnselect($event)">
        <template v-for="menu in innerData">
        <AccordionPanel
                :title="menu.text"
                :iconCls="tip?null:menu.iconCls"
                :collapsed="menu.state=='closed'">
            <Tree 
                :data="menu.children"
                :selection="sidemenu.selection"
                :selectLeafOnly="true"
                :animate="sidemenu.animate"
                @selectionChange="sidemenu.onSelectionChange($event)"
                @nodeClick="sidemenu.onNodeClick($event)">
            </Tree>
        </AccordionPanel>
        </template>
    </Accordion>
</div>
`;

export default {
    name: 'SideMenuItems',
    template: SIDEMENUITEMS_TEMPLATE,
    components: {
        Accordion,
        AccordionPanel,
        Tree
    },
    props: {
        sidemenu: Object,
        tip: Boolean,
        data: [Array,Object],
        width: null
    },
    data() {
        return {
            innerData: this.data
        }
    },
    computed: {
        border(){
            return this.tip ? true : this.sidemenu.border;
        },
        multiple(){
            return this.tip ? false : this.sidemenu.multiple;
        }
    },
    watch: {
        data(){
            this.setData(this.data);
        }
    },
    created(){
        this.setData(this.data);
    },
    methods: {
        setData(value){
            if (this.tip){
                let v = Object.assign({}, value);
                v.state = 'open';
                this.innerData = [v];
            } else {
                this.innerData = value;
            }
        },
        onPanelSelect(panel){
            let index = this.$refs.accordion.getPanelIndex(panel);
            if (index >= 0){
                this.$set(this.data[index], 'state', 'open');
            }
        },
        onPanelUnselect(panel){
            let index = this.$refs.accordion.getPanelIndex(panel);
            if (index >= 0){
                this.$set(this.data[index], 'state', 'closed');
            }
        }
    }
}