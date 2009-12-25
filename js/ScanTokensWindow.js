function EditWindow(config){

    if (config.id && Ext.getCmp(config.id) != undefined) {
        return Ext.getCmp(config.id);
    }
    
    function createRecord(index, type, token, value, regexp, parentid){
        var r = Ext.data.Record.create([{
            name: 'id',
            type: 'int'
        }, {
            name: 'parentid',
            type: 'int'
        }, {
            name: 'index',
            type: 'int'
        }, {
            name: 'type',
            type: 'int'
        }, {
            name: 'token',
            type: 'string'
        }, {
            name: 'value',
            type: 'string'
        }, {
            name: 'regexp',
            type: 'boolean'
        }]);
        var rec = new r({
            id: 1,
            parentid: parentid,
            index: index,
            type: type,
            token: token,
            value: value,
			regexp: regexp
        });
        rec.set('id', rec.id);
        return rec;
    }
    
    return new Ext.Window(Ext.apply({
        title: 'Scan Tokens',
        closable: true,
        iconCls: 'scanitem',
        layout: 'fit',
        width: 500,
        resizable: false,
        buttons: [{
            text: 'Save',
            handler: function(){
                var win = Ext.getCmp(config.id);
                var form = win.get(0).getForm();
                var grid = win.get(1);
                var store = grid.getStore();
                var editor = grid.plugins[0];
                editor.stopEditing();
                if (!store.getCount()) {
                    grid.body.addClass('body-notify');
                }
                else 
                    if (form.isValid()) {
                        if (form.baseParams.action == 'add') {
                            form.submit({
                                success: function(f, a){
                                    store.each(function(){
                                        this.set('parentid', a.result.msg);
                                    });
                                    store.save();
                                    
                                },
                                failure: function(){
                                
                                }
                            });
                        }
                        else {
                            form.submit();
                            store.save();
                        }
                        (function(){
                            win.close();
                            Ext.getCmp('presetstree').getRootNode().reload()
                        }).defer(500);
                    }
            }
        }, {
            text: 'Cancel',
            handler: function(){
                var win = Ext.getCmp(config.id);
                var form = win.get(0).getForm();
                var grid = win.get(1);
                var store = grid.getStore();
                if (form.isDirty() || store.getModifiedRecords().length > 0) {
                    Ext.Msg.show({
                        title: 'Close Window?',
                        width: 400,
                        msg: 'You are closing the window that has unsaved changes. Would you like to continue?',
                        buttons: Ext.Msg.YESNO,
                        fn: function(btn, text){
                            if (btn == 'yes') {
                                win.close();
                            }
                        },
                        icon: Ext.MessageBox.QUESTION
                    });
                }
                else {
                    win.close();
                }
            }
        }],
        items: [{
            xtype: 'form',
            labelAlign: 'top',
            bodyStyle: 'padding:5px 5px 0 5px;background-color:#dfe8f6;',
            border: false,
            trackResetOnLoad: true,
            width: 500,
            baseParams: {
                id: '',
                action: ''
            },
            autoHeight: true,
            api: {
                submit: Ext.ss.ScanItems.submit
            },
            items: [{
                xtype: 'textfield',
                fieldLabel: 'Name',
                name: 'name',
                maxLength: 100,
                anchor: '100%',
                allowBlank: false
            }, {
                xtype: 'textarea',
                fieldLabel: 'Description',
                name: 'description',
                anchor: '100%',
                maxLength: 1024
            }]
        }, {
            xtype: 'grid',
            style: 'margin:0px 5px 5px 5px;',
            viewConfig: {
                forceFit: true,
                markDirty: false
            },
            stripeRows: true,
            enableDragDrop: true,
            ddGroup: 'myGridDD',
            dragConfig: {
                containerScroll: true
            },
            tbar: [{
                text: "Add",
                iconCls: "script-add",
                handler: function(){
                    var grid = Ext.getCmp(config.id).get(1);
                    var store = grid.getStore();
                    var editor = grid.plugins[0];
                    var e = createRecord(store.getCount(), 0, 'T_STRING', '', 0, store.baseParams.parentid);
                    editor.stopEditing();
                    store.add(e);
                    grid.getView().refresh();
                    grid.getSelectionModel().selectRow(store.getCount() - 1);
                    editor.startEditing(store.getCount() - 1);
                }
            }, {
                text: "Edit",
                iconCls: "script-edit",
                handler: function(){
                    var grid = Ext.getCmp(config.id).get(1);
                    var editor = grid.plugins[0];
                    editor.startEditing(grid.getSelectionModel().getSelected());
                }
            }, {
                text: "Delete",
                iconCls: "script-delete",
                handler: function(){
                    var grid = Ext.getCmp(config.id).get(1);
                    var editor = grid.plugins[0];
                    var store = grid.getStore();
                    var sel = grid.getSelectionModel().getSelected();
                    if (sel) {
                        editor.stopEditing();
                        Ext.ux.deleted.push(sel.get('id'));
                        store.remove(sel);
                        grid.getView().refresh();
                    }
                    
                }
            }, '->', {
                xtype: 'combo',
                mode: 'remote',
                store: new Ext.data.DirectStore({
                    fields: ['id', 'name', 'tokens'],
                    directFn: Ext.ss.ScanTokensTpl.read
                }),
                valueField: 'id',
                displayField: 'name',
                editable: false,
                triggerAction: 'all',
                emptyText: 'Insert template...',
                listeners: {
                    'select': function(combo, record){
                        Ext.each(record.get('tokens'), function(){
                            var store = Ext.getCmp(config.id).get(1).getStore();
                            var r = createRecord(store.getCount(), this.type, this.token, this.value, this.regexp, store.baseParams.parentid);
                            store.add(r);
                        });
                    }
                }
            }],
            height: 150,
            store: new Ext.data.DirectStore({
                fields: ['id', 'parentid', 'index', 'type', 'token', 'value', 'regexp'],
                autoSave: false,
                api: {
                    read: Ext.ss.ScanTokens.read,
                    create: Ext.ss.ScanTokens.create,
                    update: Ext.ss.ScanTokens.update,
                    destroy: Ext.ss.ScanTokens.destroy
                },
                paramOrder: ['parentid'],
                baseParams: {
                    parentid: ''
                },
                writer: new Ext.data.JsonWriter({
                    encode: false,
                    writeAllFields: true
                }),
                sortInfo: {
                    field: 'index',
                    direction: 'ASC'
                },
                listeners: {
                    'add': function(){
                        Ext.getCmp(config.id).get(1).body.removeClass('body-notify');
                    }
                }
            }),
            plugins: [new Ext.ux.grid.RowEditor({
                id: 'roweditor',
                saveText: 'OK'
            }), new Ext.ux.dd.GridDragDropRowOrder({
                copy: false,
                scrollable: true,
                listeners: {
                    'afterrowmove': {
                        fn: function(){
                            this.grid.store.fireEvent('datachanged', this.grid.store);
                        }
                    }
                }
            })],
            sm: new Ext.grid.RowSelectionModel({
                singleSelect: true
            }),
            columns: [new Ext.grid.RowNumberer(), {
                id: 'type',
                dataIndex: 'type',
                width: 20,
                sortable: false,
                editor: {
                    xtype: 'checkbox',
                    listeners: {
                        'render': function(){
                            Ext.QuickTips.register({
                                target: this,
                                text: "Check if token should follow the previous one immediately",
                                enabled: true
                            });
                        }
                    }
                },
                renderer: function(value, meta){
                    if (value == 0) {
                        meta.css = 'token-down';
                    }
                    else {
                        meta.css = 'token-down-after';
                    }
                }
            }, {
                id: 'token',
                header: 'Token',
                dataIndex: 'token',
                width: 200,
                sortable: false,
                editor: {
                    xtype: 'combo',
                    mode: 'remote',
                    store: new Ext.data.DirectStore({
                        fields: ['id', 'token', 'qtip'],
                        directFn: Ext.ss.Tokens.read
                    }),
                    typeAhead: true,
                    valueField: 'token',
                    displayField: 'token',
                    triggerAction: 'all',
                    tpl: '<tpl for="."><div ext:qtip="{qtip}" class="x-combo-list-item">{token}</div></tpl>',
                    validator: function(value){
                        if (this.store.getCount() == 0) {
                            return true;
                        }
                        return this.store.findExact('token', value) == -1 ? false : true;
                    }
                }
            }, {
                id: 'value',
                header: 'Value',
                dataIndex: 'value',
                width: 200,
                sortable: false,
                editor: {
                    xtype: 'textfield',
                    allowBlank: false
                }
            }, {
                id: 'regexp',
                header: 'RegEx',
                dataIndex: 'regexp',
                width: 50,
                sortable: false,
                editor: {
                    xtype: 'checkbox',
                    listeners: {
                        'render': function(){
                            Ext.QuickTips.register({
                                target: this,
                                text: "Check if token value should be treated as reggular expression",
                                enabled: true
                            });
                        }
                    }
                },
                renderer: function(value, meta){
                    if (value == 1) {
                        meta.css = 'tick';
                    } else {
						meta.css = '';
					}
                }
            }]
        }]
    }, config));
}
