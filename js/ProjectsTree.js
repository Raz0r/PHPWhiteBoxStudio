var ProjectsTree = function(){
    var loadHandler = function(){
        var node = Ext.getCmp('projectstree').getSelectionModel().getSelectedNode();
        if (!node) 
            return;
        if (!node.isLeaf()) {
            node.toggle();
        }
        if (node.attributes.iconCls == 'php-file') {
            var tabs = Ext.getCmp('tabs');
            var item = tabs.getItem(node.attributes.hash);
            if (item !== undefined) {
                tabs.setActiveTab(item);
            }
            else {
                LoadFile(node.id, node.attributes.hash, false, false);
            }
        }
        else 
            if (node.attributes.cat == 'project' && node.id != Ext.PROJECT_ID) {
                Ext.PROJECT_ID = node.id;
                Ext.PROJECT_NAME = node.attributes.text;
                Ext.getCmp('main').setTitle(Ext.APP_NAME + ' - ' + node.attributes.text);
                Ext.info.msg('Success', 'Project ' + node.attributes.text + ' had been loaded');
            }
            else 
                if (node.attributes.cat == 'scan') {
                    var scanID = node.id.slice(4);
                    var panel = ScanResults({
                        id: 'ScanResults' + scanID,
                        title: node.attributes.text,
                        scan: scanID,
                        iconCls: 'scan',
                        projectId: node.parentNode.parentNode.id,
                        projectName: node.parentNode.parentNode.attributes.text,
                        presetName: node.attributes.presetName
                    });
                    Ext.getCmp('tabs').setActiveTab(Ext.getCmp('tabs').add(panel));
                    
                    var store = panel.getStore();
                    store.setBaseParam('id', scanID);
                    store.setBaseParam('lastid', 0);
                    store.load();
                    
                    Ext.ss.ScanResults.getStatus(scanID, function(status){
                        switch (status) {
                            case 'Finished':
                                panel.setIconClass('scan-finished');
                                panel.getBottomToolbar().setStatus({
                                    text: 'Finished',
                                    iconCls: 'x-status-valid'
                                });
                                panel.getBottomToolbar().get(3).disable();
                                break;
                            case 'Started':
                                panel.setIconClass('scan-started');
                                panel.getBottomToolbar().showBusy();
                                var lID = store.getCount() > 0 ? store.getAt(store.getCount() - 1).get('id') : 0;
                                UpdateResults(panel, lID);
                                break;
                            case 'Stopped':
                                panel.setIconClass('scan-stopped');
                                panel.getBottomToolbar().setStatus({
                                    text: 'Stopped',
                                    iconCls: 'x-status-valid'
                                });
                                panel.getBottomToolbar().get(3).disable();
                                break;
                        }
                    });
                }
                else 
                    if (node.attributes.cat == 'vuln') {
                        var tabs = Ext.getCmp('tabs');
                        var item = tabs.getItem(node.attributes.hash);
                        if (item !== undefined) {
                            tabs.setActiveTab(item);
                        }
                        else {
                            LoadFile(node.attributes.file, node.attributes.hash, node.attributes.line, node.attributes.code);
                        }
                    }
    }
    
    var deleteHandler = function(){
        var tree = Ext.getCmp('projectstree');
        var node = tree.getSelectionModel().getSelectedNode();
        var parent = node.parentNode;
        if (node.isLeaf() && node.attributes.cat == 'scan') {
            var scanId = node.id.slice(4);
            Ext.ss.ScanHistory.destroy(scanId, function(provider, response){
                if (provider) {
                    Ext.each(Ext.getCmp('tabs').items.items, function(){
                        if (this.scan && this.scan == scanId) {
                            Ext.getCmp('tabs').remove(this);
                        }
                    });
                    node.parentNode.reload();
                }
                else {
                    Ext.Msg.show({
                        title: 'Error',
                        msg: 'Could not delete scanning',
                        buttons: Ext.Msg.OK,
                        minWidth: 400,
                        icon: Ext.MessageBox.ERROR
                    });
                }
            });
        }
        else 
            if (node.attributes.cat == 'project') {
                Ext.Msg.show({
                    title: 'Do you really want to delete?',
                    msg: 'You are going to delete the project "' + node.attributes.text + '". All the associated scan information will be deleted as well. Do you wish to proceed?',
                    buttons: Ext.Msg.YESNO,
                    fn: function(btn){
                        if (btn == 'yes') {
                            Ext.ss.Projects.destroy(node.id, function(provider, response){
                                if (provider) {
                                    if (Ext.PROJECT_ID == node.id) {
                                        Ext.getCmp('main').setTitle(Ext.APP_NAME);
                                        Ext.each(Ext.getCmp('tabs').items.items, function(){
                                            if (this.projectId == node.id) {
                                                Ext.getCmp('tabs').remove(this);
                                            }
                                        });
                                    }
                                    node.parentNode.reload();
                                }
                                else {
                                    Ext.Msg.show({
                                        title: 'Error',
                                        msg: 'Could not delete project',
                                        buttons: Ext.Msg.OK,
                                        minWidth: 400,
                                        icon: Ext.MessageBox.ERROR
                                    });
                                }
                            });
                        }
                    },
                    icon: Ext.MessageBox.QUESTION
                });
            }
            else 
                if (node.attributes.cat == 'vuln') {
                    Ext.ss.Vulnerabilities.destroy(node.id.slice(4), function(provider, response){
                        if (provider) {
                            node.parentNode.reload();
                        }
                        else {
                            Ext.Msg.show({
                                title: 'Error',
                                msg: 'Could not delete',
                                buttons: Ext.Msg.OK,
                                minWidth: 400,
                                icon: Ext.MessageBox.ERROR
                            });
                        }
                    });
                }
        
    }
    
    return new Ext.tree.TreePanel({
        id: 'projectstree',
        region: 'north',
        title: 'Projects',
        height: 300,
        margins: "2 2 2 2",
        autoScroll: true,
        useArrows: true,
        animate: true,
        collapsible: true,
        rootVisible: false,
        split: true,
        root: {
            id: 'root',
            cat: 'projects'
        },
        keys: [{
            key: 13,
            fn: loadHandler
        }],
        loader: new Ext.tree.TreeLoader({
            directFn: Ext.ss.Projects.read,
            listeners: {
                'beforeload': function(treeLoader, node){
                    this.baseParams.cat = node.attributes.cat;
                }
            },
            paramOrder: ['cat']
        }),
        tbar: [{
            text: 'New',
            iconCls: 'project-new',
            handler: function(){
                var win = NewProjectWindow({
                    id: 'NewProjectWin'
                });
                win.show();
            }
        }, {
            text: 'Load',
            iconCls: 'project-load',
            handler: loadHandler
        }, {
            text: 'Delete',
            iconCls: 'project-delete',
            handler: deleteHandler
        }],
        listeners: {
            'render': function(comp){
                /*new Ext.tree.TreeSorter(comp, {
                 folderSort: true
                 }); */
                comp.getRootNode().expand();
            },
            'dblclick': loadHandler
        }
    });
}
