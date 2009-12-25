function NewProjectWindow(config){

    if (config.id && Ext.getCmp(config.id) != undefined) {
        return Ext.getCmp(config.id);
    }
    
    return new Ext.Window(Ext.apply({
        title: 'New Project',
        closable: true,
        layout: 'fit',
        plain: false,
        width: 500,
        renderTo: Ext.getCmp('main').getEl(),
        resizable: false,
        buttons: [{
            text: 'Create',
            handler: function(){
                var win = Ext.getCmp(config.id);
                var form = win.get(0).getForm();
                var tree = win.get(1);
                var node = tree.getSelectionModel().getSelectedNode();
                if (!node) {
                    tree.body.addClass('body-notify');
                }
                else {
                    var name = form.getValues().name;
                    if (!name) {
                        name = node.attributes.text;
                    }
                    Ext.ss.Projects.create(name, node.id, function(provider, response){
                        if (provider) {
                            Ext.PROJECT_ID = provider;
                            Ext.PROJECT_NAME = name;
                            var prjtree = Ext.getCmp('projectstree');
                            Ext.getCmp('main').setTitle(Ext.APP_NAME + ' - ' + name);
                            prjtree.on('load', function(){
                                var node = this.getRootNode().findChild('id', Ext.PROJECT_ID);
                                node.select(100, node);
                            }, prjtree, {
                                single: true
                            });
                            prjtree.getRootNode().reload();
                            
                        }
                    });
                    win.close();
                }
            }
        }, {
            text: 'Cancel',
            handler: function(){
                var win = Ext.getCmp(config.id);
                win.close();
            }
        }],
        items: [{
            xtype: 'form',
            labelAlign: 'top',
            bodyStyle: 'padding:5px 5px 0 5px;background-color:#dfe8f6;',
            border: false,
            width: 500,
            autoHeight: true,
            items: [{
                xtype: 'textfield',
                fieldLabel: 'Name',
                name: 'name',
                maxLength: 100,
                anchor: '100%'
            }]
        }, {
            xtype: 'treepanel',
            id: 'filetree',
            style: 'margin:0px 5px 5px 5px;',
            height: 300,
            autoScroll: true,
            useArrows: true,
            animate: true,
            rootVisible: false,
            root: {
                id: 'root'
            },
            loader: new Ext.tree.TreeLoader({
                directFn: Ext.ss.Files.getList
            }),
            listeners: {
                'render': function(comp){
                    new Ext.tree.TreeSorter(comp, {
                        folderSort: true
                    });
                    comp.getRootNode().expand();
                },
                'click': function(node){
					Ext.getCmp(config.id).get(0).getForm().setValues({name: node.attributes.text});
                    Ext.getCmp(config.id).get(1).body.removeClass('body-notify');
                }
            }
        }]
    }, config));
}
