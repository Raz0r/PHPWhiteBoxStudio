function HomePanel(){
    var bubbleStart = '<table class="shadowed shadownormal"><tbody><tr><td class="stl"/><td class="stt"/><td class="str"/></tr><tr><td class="sll"/><td class="smm">';
    var bubbleEnd = '</td><td class="srr"/></tr><tr><td class="sbl"/><td class="sbb"/><td class="sbr"/></tr></tbody></table>';
    return new Ext.Panel({
        xtype: 'panel',
        id: 'home',
        title: 'Home',
        bodyCssClass: 'home',
        iconCls: 'home-icon',
        border: false,
        layout: 'anchor',
        closable: false,
        items: [{
            xtype: 'container',
            anchor: '100%',
            layout: 'table',
            layoutConfig: {
                columns: 2
            },
            items: [{
                xtype: 'box',
                autoEl: {
                    tag: 'img',
                    src: 'images/wb-wetfloor.png',
                    style: 'margin-top: 30px'
                },
                rowspan: 4
            }, {
                xtype: 'label',
                html: '<h1>Welcome to PHP White Box Studio</h1>'
            }, {
                xtype: 'dataview',
                width: 600,
                store: new Ext.data.DirectStore({
                    fields: ['name', 'value'],
                    directFn: Ext.ss.Home.getData,
                    autoLoad: true
                }),
                itemSelector: '',
                tpl: new Ext.XTemplate(bubbleStart + '<h3>Right now you have:</h3>', '<ul>', '<tpl for=".">', '<li><span class="number">{value}</span> {name}</li>\n', '</tpl>', '</ul>' + bubbleEnd)
            }, {
                xtype: 'panel',
                border: false,
                width: 600,
                bodyStyle: 'background-color: transparent;',
                html: bubbleStart + 'White box testing (a.k.a. clear box testing, glass box testing, transparent box testing, translucent box testing or structural testing) uses an internal perspective of the system to design test cases based on internal structure. It requires programming skills to identify all paths through the software. The tester chooses test case inputs to exercise paths through the code and determines the appropriate outputs.<br/><b>PHP White Box Studio</b> enables you to explore the source code thoroughly, manage your scannings easily and find the problematic pieces of web applications effectively' + bubbleEnd
            }, {
                xtype: 'panel',
                border: false,
                width: 600,
                bodyStyle: 'background-color: transparent;',
                html: bubbleStart + 'You are using version ' + Ext.ss.VERSION + bubbleEnd,
                listeners: {
                    'render': function(){
                        var panel = this;
                        (function(){
                            Ext.ss.Home.getVersion(Ext.ss.VERSION, function(result){
                                panel.body.update(bubbleStart + 'You are using version ' + Ext.ss.VERSION + ' (' + result + ')' + bubbleEnd);
                            })
                        }).defer(500);
                    }
                }
            }]
        }]
    });
}
