export default {
    name: 'TabPanelHeader',
    props: {
        panel: Object
    },
    render(h){
        let title = null;
        if (this.panel.$slots.header){
            title = this.panel.$slots.header;
        } else {
            title = h(
                'span',
                {
                    'class': ['tabs-title', {
                        'tabs-with-icon':this.panel.iconCls,
                        'tabs-closable':this.panel.closable
                    }]
                },
                [this.panel.title]
            )
        }
        let icon = null;
        if (this.panel.iconCls){
            icon = h('span', {
                'class': ['tabs-icon', this.panel.iconCls]
            })
        }
        let closable = null;
        if (this.panel.closable){
            closable = h('a', {
                attrs: {
                    href:'javascript:;',
                    tabindex: -1
                },
                'class': 'tabs-close',
                on: {
                    click: ($event) => this.$emit('close', $event)
                }
            })
        }
        return h(
            'span',
            {
                // attrs: {href:'javascript:;'},
                'class': ['tabs-inner f-inline-row f-full',this.panel.headerCls],
                'style': [this.panel.headerStyle, {
                    width:!this.$parent.isHorizontal?this.$parent.tabWidth+'px':null,
                    height:this.$parent.isHorizontal?this.$parent.tabHeight+'px':null
                }]
            },
            [
                title,
                icon,
                closable
            ]
        )
    }
}