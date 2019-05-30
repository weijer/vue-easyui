import domHelper from '../base/DomHelper';
import TabPanelHeader from './TabPanelHeader';

export const TABS_TEMPLATE = `
<div ref="containerRef" :class="containerClasses">
    <div ref="headerRef" :class="headerClasses" :style="{width:isHorizontal?headerWidth+'px':null,height:!isHorizontal?headerHeight+'px':null}">
        <div v-if="isScrollerVisible" class="tabs-scroller-left f-order1" @click="scrollBy(-scrollIncrement)"></div>
        <div v-if="isScrollerVisible" class="tabs-scroller-right f-order3" @click="scrollBy(scrollIncrement)"></div>
        <div ref="tabsWrapRef" class="tabs-wrap f-column f-full f-order2">
            <ul v-if="isScrollable" class="tabs tabs-scrollable f-full" style="width:100%"></ul>
            <ul ref="tabsRef" :class="tabsClasses" :style="tabsStyle">
                <li class="f-inline-row" v-for="panel in usedPanels"
                        :class="[{'f-full':justified,'f-noshrink':isScrollable,'tabs-selected':panel.selectedState,'tabs-disabled':panel.disabled,'tabs-first':panel.isFirst,'tabs-last':panel.isLast}]"
                        @click="onClickTab(panel,$event)">
                    <TabPanelHeader :panel="panel" @close="onCloseTab(panel,$event)"></TabPanelHeader>
                </li>
            </ul>
        </div>
    </div>
    <div :class="bodyClasses">
        <slot></slot>
    </div>
</div>
`;

export default {
    name: 'Tabs',
    template: TABS_TEMPLATE,
    components: {
        TabPanelHeader
    },
    props: {
        headerWidth: {
            type: Number,
            default: 150
        },
        headerHeight: {
            type: Number,
            default: 35
        },
        tabWidth: Number,
        tabHeight: {
            type: Number,
            default: 32
        },
        tabPosition: {
            type: String,
            default: 'top'
        },
        plain: {
            type: Boolean,
            default: false
        },
        narrow: {
            type: Boolean,
            default: false
        },
        justified: {
            type: Boolean,
            default: false
        },
        border: {
            type: Boolean,
            default: true
        },
        scrollable: {
            type: Boolean,
            default: false
        },
        scrollIncrement: {
            type: Number,
            default: 100
        },
        selectedIndex: {
            type: Number,
            default: 0
        }
    },
    data() {
        return {
            panels: [],
            selectedHis: [],
            scrollDistance: 0,
            maxScrollDistance: 0
        }
    },
    computed: {
        containerClasses(){
            return 'tabs-container ' + (this.isHorizontal ? 'f-row' : 'f-column');
        },
        headerClasses(){
            return ['tabs-header f-row f-noshrink', {
                'tabs-header-plain': this.plain,
                'tabs-header-narrow': this.narrow,
                'tabs-header-noborder': !this.border,
                'tabs-header-bottom f-order2': this.tabPosition=='bottom',
                'tabs-header-left f-column': this.tabPosition=='left',
                'tabs-header-right f-column f-order2': this.tabPosition=='right'
            }]
        },
        bodyClasses(){
            return ['tabs-panels f-column f-full', {
                'tabs-panels-noborder': !this.border,
                'tabs-panels-top': this.tabPosition=='bottom',
                'tabs-panels-right': this.tabPosition=='left',
                'tabs-panels-left': this.tabPosition=='right'
            }]
        },
        tabsClasses(){
            return ['tabs f-full', {
                'f-row': !this.isHorizontal,
                'f-column': this.isHorizontal,
                'tabs-scrollable': this.isScrollable,
                'tabs-narrow': this.narrow
            }]
        },
        tabsStyle() {
            if (this.isScrollable){
                return {
                    left: (-this.scrollDistance)+'px'
                };
            } else {
                return null;
            }
        },
        isHorizontal() {
            return this.tabPosition == 'left' || this.tabPosition == 'right';
        },
        isScrollable() {
            if (this.isHorizontal){
                return false;
            } else {
                return this.scrollable && !this.justified;
            }
        },
        isScrollerVisible() {
            if (this.isScrollable){
                return this.maxScrollDistance > 0;
            } else {
                return false;
            }
        },
        usedPanels() {
            return this.panels.filter((p) => {return p.isUsed});
        }
        
    
    },
    watch: {
        panels(){
            this.initPanels();
        }
    },
    methods: {
        addPanel(panel){
            this.panels.push(panel);
        },
        removePanel(panel){
            let index = this.panels.indexOf(panel);
            if (index >= 0){
                this.panels.splice(index,1);
            }
            this.removeHis(panel);
        },
        setMaxScrollDistance() {
            if (!this.$refs.tabsRef){
                this.maxScrollDistance = 0;
            }
            let width = this.$refs.tabsRef.scrollWidth;
            let wrapWidth = this.$refs.tabsWrapRef.offsetWidth;
            this.maxScrollDistance = width > wrapWidth ? width - wrapWidth : 0;
        },
        onClickTab(panel,event) {
            event.stopPropagation();
            panel.select();
        },
        onCloseTab(panel, event){
            event.stopPropagation();
            if (!panel.disabled){
                panel.close();
            }
        },
        initPanels() {
            if (this.panels.length){
                this.panels.forEach((p) => {
                    p.isFirst = false;
                    p.isLast = false;
                });
                let pp = this.panels.filter((p) => {return p.isUsed});
                if (pp.length){
                    pp[0].isFirst = true;
                    pp[pp.length-1].isLast = true;
                }
                this.initSelectedPanel();
            }
            this.$nextTick(() => this.setScrollers());
        },
        initSelectedPanel() {
            let panel = this.getSelectedPanel();
            if (!panel){
                panel = this.selectedHis.pop();
            }
            if (!panel){
                panel = this.getPanel(this.selectedIndex);
            }
            if (panel){
                this.usedPanels.filter(p => p != panel).forEach(p => p.selectedState = false);
                panel.selectedState = true;
                this.selectedHis = this.selectedHis.filter(p => this.getPanelIndex(p) != -1);
                this.removeHis(panel);
                this.addHis(panel);
            }
        },
        setScrollers(){
            if (!this.isScrollable){
                return;
            }
            this.setMaxScrollDistance();
            // let dis = this.scrollDistance;
            let panel = this.getSelectedPanel();
            if (panel){
                let wrapWidth = domHelper.outerWidth(this.$refs.tabsWrapRef);
                let index = this.getPanelIndex(panel);
                let li = this.$refs.tabsRef.children[index];
                let width = domHelper.outerWidth(li, true);
                let pos = domHelper.position(li);
                let left = pos.left - this.scrollDistance;
                let right = left + width;
                if (left < 0){
                    let distance = left - (wrapWidth-width)/2;
                    this.scrollBy(distance);
                } else if (right > wrapWidth){
                    let distance = left - (wrapWidth-width)/2;
                    this.scrollBy(distance);
                } else {
                    this.scrollBy(0);
                }
            }
        },     
        addHis(panel) {
            this.selectedHis.push(panel);
        },
        removeHis(panel) {
            this.selectedHis = this.selectedHis.filter(p => p != panel);
        },
        backHis() {
            let panel = this.selectedHis.pop();
            if (panel){
                this.removeHis(panel);
                panel.select();
            } else {
                this.select(0);
            }
        },
        select(index) {
            let panel = this.getPanel(index);
            if (panel){
                panel.select();
            }
        },
        unselect(index) {
            let panel = this.getPanel(index);
            if (panel){
                panel.unselect();
            }
        },
        getPanel(index) {
            return this.usedPanels[index];
        },
        getPanelIndex(panel) {
            let pp = this.usedPanels;
            for(let i=0; i<pp.length; i++){
                if (pp[i] == panel){
                    return i;
                }
            }
            return -1;
        },
        getSelectedPanel() {
            let pp = this.usedPanels.filter(p => p.selectedState && !p.disabled);
            return pp.length ? pp[0] : null;
        },
        scrollBy(distance){
            this.setMaxScrollDistance();
            distance += this.scrollDistance;
            if (distance > this.maxScrollDistance){
                distance = this.maxScrollDistance;
            }
            if (distance < 0){
                distance = 0;
            }
            this.scrollDistance = distance;
        },
        resize(){
            this.setMaxScrollDistance();
        }          
    
    
    }
}