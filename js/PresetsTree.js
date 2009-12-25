var OpenScanTokensWindow = function(){
    var node = Ext.getCmp('presetstree').getSelectionModel().getSelectedNode();
    if (node) {
        var win = EditWindow({
            id: 'ScanTokensWin' + node.id,
            title: 'Edit Scan Item - ' + node.attributes.text
        });
        var formPanel = win.get(0);
        var form = formPanel.getForm();
        form.setValues({
            name: node.attributes.text,
            description: node.attributes.qtipCfg.title + "\n" + node.attributes.qtipCfg.text
        });
        var store = win.get(1).getStore();
        store.baseParams.parentid = node.id;
        form.baseParams.action = 'edit';
        form.baseParams.id = node.id;
        store.load();
        win.show();
    }
}
var PresetsTree = function(){
    return new Ext.tree.TreePanel({
        id: "presetstree",
        title: "Scan Items",
        region: "center",
        margins: "2 2 2 2",
        autoScroll: true,
        useArrows: true,
        animate: true,
        bbar: [{
            xtype: 'combo',
            id: 'presetcombo',
            mode: 'remote',
            store: new Ext.data.DirectStore({
                fields: ['id', 'name'],
                directFn: Ext.ss.Presets.read
            }),
            valueField: 'id',
            displayField: 'name',
            editable: false,
            triggerAction: 'all',
            emptyText: 'Select a preset...',
            listeners: {
                'select': function(combo, record){
                    Ext.getCmp('presetstree').getRootNode().id = record.get('id');
                    Ext.getCmp('presetstree').getRootNode().reload();
                    Ext.PRESET_ID = record.get('id');
                    Ext.PRESET_NAME = record.get('name');
                }
            }
        }, {
            iconCls: 'add',
            text: 'Add',
            handler: function(){
                Ext.Msg.prompt('Add a new preset', 'Name:', function(btn, text){
                    if (btn == 'ok' && text) {
                        Ext.ss.Presets.create(text, function(provider, response){
                            if (provider) {
                                var combo = Ext.getCmp('presetcombo');
                                var store = combo.getStore();
                                store.on('load', function(){
                                    var i = this.findExact('name', text);
                                    var record = this.getAt(i);
                                    combo.setValue(text);
                                    combo.fireEvent('select', combo, record);
                                }, store, {
                                    single: true
                                });
                                store.reload();
                            }
                        });
                    }
                });
            }
        }, {
            iconCls: 'delete',
            text: 'Delete',
            handler: function(){
                var id = Ext.getCmp('presetstree').getRootNode().id;
                if (id == 'root') {
                    return;
                }
                var r = Ext.getCmp('presetcombo').getStore().getById(id);
                Ext.Msg.show({
                    title: 'Do you really want to delete?',
                    msg: 'You are going to delete the preset "' + r.get('name') + '". All the scan items contained will be deleted as well. Do you wish to proceed?',
                    buttons: Ext.Msg.YESNO,
                    fn: function(btn){
                        if (btn == 'yes') {
                            Ext.ss.Presets.destroy(id, function(provider, response){
                                if (provider) {
                                    var combo = Ext.getCmp('presetcombo');
                                    var tree = Ext.getCmp('presetstree');
                                    combo.getStore().reload();
                                    combo.setValue('');
                                    tree.getRootNode().id = 'root';
                                    tree.getRootNode().reload();
                                }
                            });
                        }
                    },
                    icon: Ext.MessageBox.QUESTION
                });
            }
        }],
        rootVisible: false,
        tbar: [{
            text: 'Add',
            iconCls: 'add',
            handler: function(){
                if (Ext.getCmp('presetstree').getRootNode().id != 'root') {
                    var win = EditWindow({
                        id: 'ScanTokensWin',
                        title: 'Add a new Scan Item'
                    });
                    var form = win.get(0);
                    form.getForm().baseParams.action = 'add';
                    form.getForm().baseParams.id = Ext.getCmp('presetstree').getRootNode().id;
                    win.show();
                }
                else {
                    Ext.Msg.show({
                        title: 'Warning',
                        msg: 'Please select a preset',
                        buttons: Ext.Msg.OK,
                        minWidth: 400,
                        icon: Ext.MessageBox.WARNING
                    });
                    return;
                }
            }
        }, {
            text: 'Edit',
            iconCls: 'edit',
            handler: OpenScanTokensWindow
        }, {
            text: 'Delete',
            iconCls: 'delete',
            handler: function(){
                var node = Ext.getCmp('presetstree').getSelectionModel().getSelectedNode();
                if (!node) {
                    return;
                }
                Ext.Msg.show({
                    title: 'Do you really want to delete?',
                    msg: 'You are going to delete the scan item "' + node.attributes.text + '". Do you wish to proceed?',
                    buttons: Ext.Msg.YESNO,
                    fn: function(btn){
                        if (btn == 'yes') {
                            Ext.ss.ScanItems.destroy(node.id, function(provider, response){
                                if (provider) {
                                    node.remove();
                                }
                            });
                        }
                    },
                    icon: Ext.MessageBox.QUESTION
                });
            }
        }],
        root: {
            text: 'root',
            id: 'root',
            async: true,
            expanded: false
        },
        loader: new Ext.tree.TreeLoader({
            directFn: Ext.ss.ScanItems.read
        }),
		keys: [{
			key: 13,
			fn: OpenScanTokensWindow
		}],
        listeners: {
            'afterrender': function(){
                this.getBottomToolbar().getLayout().moreMenu.enableScrolling = false;
            },
            'dblclick': function(){
            	OpenScanTokensWindow();
            }
        }
    });
}
