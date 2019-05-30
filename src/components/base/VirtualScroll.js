import  domHelper from './DomHelper';

export const VIRTUAL_SCROLL_TEMPLATE = `
<div class="f-column panel-noscroll">
    <div ref="bodyRef" class="scroll-body f-column f-full" @scroll="onScroll($event)">
        <div ref="topRef" class="scroll-top f-noshrink">
            <div v-for="h in topHeights" :style="{height:h+'px'}"></div>
        </div>
        <div ref="contentRef" class="scroll-content f-noshrink">
            <slot></slot>
        </div>
        <div ref="bottomRef" class="scroll-bottom f-noshrink">
            <div v-for="h in bottomHeights" :style="{height:h+'px'}"></div>
        </div>
    </div>
</div>
`;

export default {
    name: 'VirtualScroll',
    template: VIRTUAL_SCROLL_TEMPLATE,
    props: {
        lazy: {
            type: Boolean,
            default: false
        },
        rowHeight: {
            type: Number,
            default: 32
        },
        maxDivHeight: {
            type: Number,
            default: 10000000
        },
        maxVisibleHeight: {
            type: Number,
            default: 15000000
        },
        pageNumber: {
            type: Number,
            default: 1
        },
        pageSize: {
            type: Number,
            default: 10
        },
        total: {
            type: Number,
            default: 0
        },
        data: {
            type: Array,
            default: () => []
        },
        scrollPosition: Object
    },
    data() {
        return {
            innerData: [],
            items: [],
            waitingPage: 1,
            fetchingPage: 0,
            startIndex: 0,
            deltaTopHeight: 0,
            topHeights: [],
            bottomHeights: [],
            isUpdating: false,
            isNewFetching: false,
            totalState: this.total,
            pageNumberState: this.pageNumber,
            scrollPositionState: this.scrollPosition
        }
    },
    watch: {
        total(value){
            this.totalState = value;
        },
        pageNumber(value){
            this.pageNumberState = value;
        },
        data(value){
            if (this.scrollPositionState){
                this.scrollPosition.innerData = value;
                return;
            }
            this.$nextTick(() => {
                this.setData(value);
                setTimeout(() => {
                    this.scrolling();
                },20)
            });
        }
    },
    mounted(){
        this.$nextTick(() => {
            // this.setData(this.data);
            // this.isNewFetching = true;

            if (this.scrollPositionState){
                this.scrollState(this.scrollPositionState);
                this.scrollPositionState = null;
            } else {
                this.setData(this.data);
                this.isNewFetching = true;
            }
        });
    },
    methods: {
        scrollTop(value){
            if (value != undefined){
                this.$refs.bodyRef.scrollTop = value;
            } else {
                return this.$refs.bodyRef.scrollTop;
            }
        },
        relativeScrollTop() {
            return this.$refs.bodyRef.scrollTop - this.startIndex * this.rowHeight + this.deltaTopHeight;
        },
        scrollbarWidth() {
            return domHelper.outerWidth(this.$refs.bodyRef) - domHelper.outerWidth(this.$refs.contentRef);
        },
        scrollState(value){
            if (value != undefined){
                this.topHeights = value.topHeights;
                this.bottomHeights = value.bottomHeights;
                this.deltaTopHeight = value.deltaTopHeight;
                this.startIndex = value.startIndex;
                this.innerData = value.innerData || [];
                this.items = value.items || [];
                this.$emit('update', this.items);
                this.$nextTick(() => {
                    this.scrollTop(value.scrollTop);
                    this.refresh();
                    this.scrolling();
                });
            } else {
                return {
                    topHeights: Object.assign([],this.topHeights),
                    bottomHeights: Object.assign([],this.bottomHeights),
                    deltaTopHeight: this.deltaTopHeight,
                    startIndex: this.startIndex,
                    scrollTop: this.scrollTop(),
                    items: Object.assign([], this.items),
                    innerData: Object.assign([], this.innerData)
                };
            }
        },
        onScroll(event){
			event.stopPropagation();
			if (!this.isUpdating){
				this.scrolling();
            }
            this.$emit('bodyScroll', {
                left: this.$refs.bodyRef.scrollLeft,
                top: this.scrollTop(),
                relativeTop: this.relativeScrollTop(),
                items: this.items
            });
        },
        setData(value) {
            if (value == null){
                value = [];
            }
            // this.innerData = value;
            this.innerData = Object.assign([], value);
            this.fetchingPage = 0;
            if (this.lazy){
                if (this.innerData.length){
                    this.waitingPage = this.pageNumberState;
                    this.loadPage(this.innerData);
                } else {
                    if (this.totalState > 0){
                        this.fetchPage(this.waitingPage);
                    } else {
                        this.loadPage(this.innerData);
                    }
                }
            } else {
                this.totalState = this.innerData.length;
                this.pageNumberState = 1;
                this.waitingPage = 1;
                this.startIndex = 0;
                this.loadPage(this.innerData);
            }
        },
        scrolling() {
            this.isNewFetching = false;
            let bodyHeight = domHelper.outerHeight(this.$refs.bodyRef);
            let bodyOffset = domHelper.offset(this.$refs.bodyRef);
            let contentOffset = domHelper.offset(this.$refs.contentRef);
            let top = contentOffset.top - bodyOffset.top;
            let bottom = top + domHelper.outerHeight(this.$refs.contentRef);
    
            if (top > bodyHeight || bottom < 0){
                let scrollTop = this.$refs.bodyRef.scrollTop;
                let index = Math.floor((scrollTop + this.deltaTopHeight) / this.rowHeight);
                let page = Math.floor(index / this.pageSize) + 1;
                if (page > 0){
                    this.isNewFetching = true;
                    this.startIndex = (page - 1) * this.pageSize;
                    this.waitingPage = page;
                    this.items = [];
                    this.fetchPage(this.waitingPage);
                }
            } else if (top > 0){
                if (this.startIndex == 0){
                    return;
                }
                let page = Math.floor(this.startIndex / this.pageSize) + 1;
                this.waitingPage = page - 1;
                this.fetchPage(this.waitingPage);
            } else if (bottom < bodyHeight){
                if (this.startIndex + this.items.length >= this.totalState){
                    return;
                }
                let page = Math.floor(this.startIndex / this.pageSize) + 1;
                if (this.items.length >= this.pageSize*2){
                    this.waitingPage = page + 2;
                } else {
                    this.waitingPage = page + 1;
                }
                this.fetchPage(this.waitingPage);
            }
        },
        populate() {
            if (!this.$refs.bodyRef){
                return;
            }
            this.isUpdating = true;
    
            let bodyHeight = domHelper.outerHeight(this.$refs.bodyRef);
            let topHeight = this.startIndex * this.rowHeight;
            let bottomHeight = this.totalState * this.rowHeight - topHeight - this.items.length * this.rowHeight;
            this.topHeights = this.splitHeights(topHeight);
            this.bottomHeights = this.splitHeights(bottomHeight);
            let spos = this.$refs.bodyRef.scrollTop + this.deltaTopHeight;
            if (topHeight > this.maxVisibleHeight){
                this.deltaTopHeight = topHeight - this.maxVisibleHeight;
                this.topHeights = this.splitHeights(this.maxVisibleHeight);
            } else {
                this.deltaTopHeight = 0;
            }
            if (bottomHeight > this.maxVisibleHeight){
                this.bottomHeights = this.splitHeights(this.maxVisibleHeight);
            } else if (bottomHeight == 0){
                let lastCount = this.totalState % this.pageSize;
                if (lastCount){
                    this.bottomHeights = this.splitHeights(bodyHeight - lastCount*this.rowHeight);
                }
            }
            this.$refs.bodyRef.scrollTop = spos - this.deltaTopHeight;
            this.$emit('update', this.items);
            this.$nextTick(() => {
                if (this.$refs.bodyRef){
                    this.$refs.bodyRef.scrollTop = spos - this.deltaTopHeight;
                    if (this.isNewFetching){
                        this.scrolling();
                    }
                    this.isUpdating = false;
                }
                // this.scrolling();
            });
        },
        splitHeights(height) {
            let count = Math.floor(height / this.maxDivHeight);
            let leftHeight = height - this.maxDivHeight * count;
            if (height < 0){
                leftHeight = 0;
            }
            let heights = [];
            for(let i=0; i<count; i++){
                heights.push(this.maxDivHeight);
            }
            heights.push(leftHeight);
            return heights;
        },
        loadPage(items){
            if (this.pageNumberState != this.waitingPage){
                return;
            }
            items = items.slice(0, this.pageSize);
            let page = Math.floor(this.startIndex / this.pageSize) + 1;
            if (page == this.waitingPage){
                this.items = items;
                this.populate();
            } else if (this.waitingPage == page + 1){
                this.items = this.items.slice(0, this.pageSize).concat(items);
                this.populate();
            } else if (this.waitingPage == page + 2){
                this.startIndex += this.pageSize;
                this.items = this.items.slice(this.pageSize, this.pageSize*2).concat(items);
                this.populate();
            } else if (this.waitingPage == page - 1){
                this.startIndex -= this.pageSize;
                this.items = items.concat(this.items.slice(0, this.pageSize));
                this.populate();
            } else {
                this.startIndex = (this.pageNumberState - 1) * this.pageSize;
                this.items = items;
                this.populate();
            }
        },
        fetchPage(page) {
            if (this.fetchingPage != page){
                this.fetchingPage = page;
                if (!this.lazy){
                    let start = (page - 1) * this.pageSize;
                    let items = this.innerData.slice(start, start + this.pageSize);
                    this.pageNumberState = page;
                    this.loadPage(items);
                }
                this.$emit('pageChange', {
                    pageNumber: page,
                    pageSize: this.pageSize
                });
            }
        },
        gotoPage(page){
            this.startIndex = (page - 1) * this.pageSize;
            this.waitingPage = page;
            this.populate();
            this.$nextTick(() => {
                this.$refs.bodyRef.scrollTop = this.startIndex * this.rowHeight - this.deltaTopHeight;
                this.fetchPage(page);
            });
        },
        refresh() {
            let page = Math.floor(this.startIndex / this.pageSize) + 1;
            this.waitingPage = page;
            this.fetchingPage = 0;
            this.fetchPage(page);
        }
                    
    }
}