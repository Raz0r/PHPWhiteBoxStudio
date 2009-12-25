var UpdateResults = function(panel, lastID){
    if (!Ext.TASKS[panel.scan]) {
        Ext.TASKS[panel.scan] = {
            run: function(){
                Ext.ss.ScanResults.read(panel.scan, lastID, function(resp){
                    if (!Ext.getCmp('ScanResults' + panel.scan)) {
                        Ext.TaskMgr.stop(Ext.TASKS[panel.scan]);
                        Ext.TASKS[panel.scan] = false;
                        return;
                    }
                    if (resp.status == 'Finished') {
						var node = Ext.getCmp('projectstree').getNodeById('scans' + panel.projectId);
						if(node) {
							node.reload();
						}
                        Ext.TaskMgr.stop(Ext.TASKS[panel.scan]);
                        Ext.TASKS[panel.scan] = false;
                        panel.setIconClass('scan-finished');
                        panel.getBottomToolbar().setStatus({
                            text: 'Finished',
                            iconCls: 'x-status-valid'
                        });
                        panel.getBottomToolbar().get(3).disable();
                        Ext.info.msg(panel.projectName, 'Scanning against ' + panel.presetName + ' had finished');
                    }
                    if (resp.records.length > 0) {
                        lastID = resp.records[resp.records.length - 1].id;
                        panel.getStore().loadData({
                            records: resp.records
                        }, true);
                        panel.setTitle(panel.presetName + ' (' + panel.getStore().getCount() + ')');
                    }
                });
            },
            interval: 5000
        };
        Ext.TaskMgr.start(Ext.TASKS[panel.scan]);
    }
}

var markReviewed = function(grid){
    var records = grid.getSelectionModel().getSelections();
    Ext.each(records, function(){
        this.set('reviewed', true);
    });
}

var markVulnerable = function(grid){
    var records = grid.getSelectionModel().getSelections();
    Ext.each(records, function(){
        this.set('vulnerable', true);
    });
    var vulnsNode = Ext.getCmp('projectstree').getNodeById('vulns' + grid.projectId);
    if (vulnsNode && vulnsNode.isExpanded()) {
        vulnsNode.reload();
    }
}

var ScanResults = function(config){

    if (config.id && Ext.getCmp(config.id) != undefined) {
        return Ext.getCmp(config.id);
    }
    
    var OpenSourceCodePanel = function(store, record){
        if (!store || !record) 
            return;
        record.set('reviewed', true);
        var tabs = Ext.getCmp('tabs');
        var item = tabs.getItem(record.get('hash'));
        if (item !== undefined) {
            tabs.setActiveTab(item);
            (function(){
                selectLine(item.editor, record.get('line'), record.get('code'));
            }).defer(1000);
            item.lines.push({
                line: record.get('line'),
                code: record.get('code')
            });
        }
        else {
            LoadFile(record.get('file'), record.get('hash'), record.get('line'), record.get('code'));
        }
    }
    
    return new Ext.grid.GridPanel(Ext.apply({
        closable: true,
        layout: 'fit',
        store: new Ext.data.GroupingStore({
            proxy: new Ext.data.DirectProxy({
                api: {
                    read: Ext.ss.ScanResults.read,
                    update: Ext.ss.ScanResults.update,
                    create: Ext.ss.ScanResults.create,
                    destroy: undefined
                },
                paramOrder: ['id', 'lastid']
            }),
            reader: new Ext.data.JsonReader({
                fields: ['id', 'file', 'hash', 'item', 'line', 'code', 'vulnerable', 'reviewed'],
                root: 'records'
            }),
            sortInfo: {
                field: 'id',
                direction: 'ASC'
            },
            writer: new Ext.data.JsonWriter({
                encode: false
            }),
            listeners: {
                'beforewrite': function(d, action){
                    if (action == Ext.data.Api.actions.create) {
                        return false;
                    }
                }
            }
        }),
        keys: [{
            key: 13,
            fn: function(){
                var grid = Ext.getCmp(this);
                OpenSourceCodePanel(grid.getStore(), grid.getSelectionModel().getSelected());
            },
            scope: config.id
        }, {
            key: 27,
            fn: function(){
                Ext.getCmp('tabs').remove(Ext.getCmp(this));
            },
            scope: config.id
        }, {
            key: 'q',
            alt: true,
            fn: function(){
                markReviewed(Ext.getCmp(this));
            },
            scope: config.id
        }, {
            key: 'w',
            alt: true,
            fn: function(){
                markVulnerable(Ext.getCmp(this));
            },
            scope: config.id
        }, {
            key: 'e',
            alt: true,
            fn: function(){
                var grid = Ext.getCmp(this);
                OpenSourceCodePanel(grid.getStore(), grid.getSelectionModel().getSelected());
            },
            scope: config.id
        }],
        listeners: {
            'cellclick': function(grid, rowIndex, columnIndex, e){
                var store = grid.getStore();
                if (columnIndex == 1) {
                    var reviewed = store.getAt(rowIndex).get('reviewed');
                    if (typeof(reviewed) == 'string') {
                        reviewed = parseInt(reviewed);
                    }
                    store.getAt(rowIndex).set('reviewed', !reviewed);
                }
                else 
                    if (columnIndex == 2) {
                        var vuln = store.getAt(rowIndex).get('vulnerable');
                        if (typeof(vuln) == 'string') {
                            vuln = parseInt(vuln);
                        }
                        store.getAt(rowIndex).set('vulnerable', !vuln);
                        var vulnsNode = Ext.getCmp('projectstree').getNodeById('vulns' + grid.projectId);
                        if (vulnsNode.isExpanded()) {
                            vulnsNode.reload();
                        }
                    }
            },
            'rowdblclick': function(grid, rowIndex){
                var store = grid.getStore();
                OpenSourceCodePanel(store, store.getAt(rowIndex));
            }
        },
        autoExpandColumn: 'code',
        view: new Ext.grid.GroupingView({
            markDirty: false
        }),
        bbar: {
            xtype: 'statusbar',
            busyText: 'Scanning...',
            text: 'Ready',
            iconCls: 'x-status-valid',
            items: ['-', {
                text: '<b>STOP</b>',
                iconCls: 'stop',
                handler: function(){
                    var button = this;
                    var panel = this.ownerCt.ownerCt;
                    if (!panel) {
                        return;
                    }
                    Ext.ss.Scan.stop(panel.scan, function(data, response){
                        if (data) {
                            if (Ext.TASKS[panel.scan]) {
                                Ext.TaskMgr.stop(Ext.TASKS[panel.scan]);
                                Ext.TASKS[panel.scan] = false;
                            }
                            
                            panel.setIconClass('scan-stopped');
                            panel.getBottomToolbar().setStatus({
                                text: 'Stopped',
                                iconCls: 'x-status-valid'
                            });
                            
                            var store = panel.getStore();
                            var lastID = store.getCount() > 0 ? store.getAt(store.getCount() - 1).get('id') : 0;
                            
                            Ext.info.msg('Success', 'The scan process had been successfully stopped');
                            button.disable();
                            var scansNode = Ext.getCmp('projectstree').getNodeById('scans' + panel.projectId);
                            if (scansNode && scansNode.isExpanded()) {
                                scansNode.reload();
                            }
                            
                            Ext.ss.ScanResults.read(panel.scan, lastID, function(resp){
                                if (!resp.records) 
                                    return;
                                panel.getStore().loadData({
                                    records: resp.records
                                }, true);
                                panel.setTitle(panel.presetName + ' (' + panel.getStore().getCount() + ')');
                            });
                        }
                        else {
                            Ext.Msg.show({
                                title: 'Error',
                                msg: 'Could not stop the scan process',
                                buttons: Ext.Msg.OK,
                                minWidth: 400,
                                icon: Ext.MessageBox.ERROR
                            });
                        }
                    });
                }
            }]
        },
        tbar: [{
            text: 'Mark Reviewed',
            iconCls: 'mark-reviewed',
            tooltipType: 'title',
            tooltip: 'Alt + Q',
            handler: function(){
                markReviewed(this.ownerCt.ownerCt);
            }
        }, {
            text: 'Mark Vulnerable',
            iconCls: 'mark-vuln',
            tooltipType: 'title',
            tooltip: 'Alt + W',
            handler: function(){
                markVulnerable(this.ownerCt.ownerCt);
            }
        }, '-', {
            text: 'Show Source Code',
            iconCls: 'show-code',
            tooltipType: 'title',
            tooltip: 'Alt + E',
            handler: function(){
                var grid = this.ownerCt.ownerCt;
                OpenSourceCodePanel(grid.getStore(), grid.getSelectionModel().getSelected());
            }
        }],
        columns: [new Ext.grid.RowNumberer({
            width: 25
        }), {
            id: 'reviewed',
            dataIndex: 'reviewed',
            width: 20,
            groupable: false,
            sortable: true,
            renderer: function(value, metaData){
                if (value == 0) {
                    metaData.css = 'unreviewed';
                }
                else {
                    metaData.css = 'reviewed';
                }
            }
        }, {
            id: 'vulnerable',
            groupName: 'Vulnerable',
            dataIndex: 'vulnerable',
            width: 40,
            groupable: false,
            sortable: true,
            renderer: function(value, metaData){
                if (value == 1) {
                    metaData.css = 'unvuln';
                }
                else {
                    metaData.css = 'vuln';
                }
            }
        }, {
            id: 'file',
            header: 'File',
            dataIndex: 'file',
            width: 250,
            sortable: true
        }, {
            id: 'item',
            header: 'Item',
            dataIndex: 'item',
            width: 100,
            sortable: true
        }, {
            id: 'line',
            header: 'Line',
            dataIndex: 'line',
            width: 50,
            sortable: true
        }, {
            id: 'code',
            header: 'Code',
            dataIndex: 'code',
            width: 300,
            sortable: true,
            renderer: function(value){
                return Ext.util.Format.htmlEncode(value);
            }
        }]
    }, config));
}
