Ext.StudioViewport = Ext.extend(Ext.Viewport, {
    xtype: 'viewport',
    layout: 'border',
    initComponent: function(){
        this.items = [{
            region: 'center',
            id: 'main',
            title: Ext.APP_NAME,
            xtype: 'panel',
            margins: '20 20 20 20',
            tbar: [{
                xtype: 'button',
                text: 'Home',
                iconCls: 'home-icon-big',
                scale: 'medium',
                iconAlign: 'top',
                handler: function(){
                    var tabs = Ext.getCmp('tabs');
                    var home = tabs.getItem('home');
                    if (home) {
                        Ext.getCmp('tabs').setActiveTab(home);
                    }
                    else {
                        tabs.setActiveTab(tabs.add(HomePanel()));
                    }
                }
            }, {
                xtype: 'button',
                id: 'startscanbtn',
                text: 'Start Scan',
                iconCls: 'scan-start',
                scale: 'medium',
                iconAlign: 'top',
                handler: function(){
                    if (!Ext.PROJECT_ID) {
                        var msg = Ext.Msg.show({
                            title: 'Project',
                            msg: 'There is no active project. Would you like to create a new one?',
                            buttons: Ext.Msg.YESNO,
                            fn: function(btn){
                                if (btn == 'yes') {
                                    var win = NewProjectWindow({
                                        id: 'NewProjectWin'
                                    });
                                    win.show();
                                }
                            },
                            icon: Ext.MessageBox.QUESTION
                        });
                        return;
                    }
                    
                    if (!Ext.PRESET_ID) {
                        Ext.Msg.show({
                            title: 'Warning',
                            msg: 'Please select a preset',
                            buttons: Ext.Msg.OK,
                            minWidth: 400,
                            icon: Ext.MessageBox.WARNING
                        });
                        return;
                    }
                    
                    if (!Ext.PROJECT_ID || !Ext.PRESET_ID) {
                        return;
                    }
                    
                    Ext.ss.Scan.start(Ext.PROJECT_ID, Ext.PRESET_ID, function(scanID, response){
                        if (scanID) {
                            var panel = ScanResults({
                                id: 'ScanResults' + scanID,
                                title: Ext.PRESET_NAME + ' (0)',
                                iconCls: 'scan-started',
                                scan: scanID,
                                projectId: Ext.PROJECT_ID,
                                projectName: Ext.PROJECT_NAME,
                                presetId: Ext.PRESET_ID,
                                presetName: Ext.PRESET_NAME
                            });
                            
                            Ext.getCmp('tabs').setActiveTab(Ext.getCmp('tabs').add(panel));
                            panel.getBottomToolbar().showBusy();
                            
                            (function(){
                                var scansNode = Ext.getCmp('projectstree').getNodeById('scans' + Ext.PROJECT_ID);
                                if (scansNode && scansNode.isExpanded()) {
                                    scansNode.reload();
                                }
                            }).defer(1000);
                            
                            UpdateResults(panel, 0);
                        }
                        else {
                            Ext.Msg.show({
                                title: 'Error',
                                msg: 'Could not start a new scan',
                                buttons: Ext.Msg.OK,
                                minWidth: 400,
                                icon: Ext.MessageBox.ERROR
                            });
                        }
                    });
                }
            }, {
                xtype: 'button',
                text: 'About',
                iconCls: 'about',
                scale: 'medium',
                iconAlign: 'top',
                handler: function(){
                    Ext.Msg.show({
                        title: 'About',
                        msg: '<b>PHP White Box Studio ' + Ext.ss.VERSION + '</b><br/> ' +
                        'Visit my website at <a href="http://raz0r.name/">http://raz0r.name/</a><br/>' +
                        'Contribute your code at <a href="http://github.com/arseny/PHPWhiteBoxStudio">http://github.com/arseny/PHPWhiteBoxStudio</a><br/>' +
                        'This software is released under BSD license<br/>' +
                        '&copy 2009',
                        buttons: Ext.Msg.OK,
                        minWidth: 400,
                        icon: Ext.MessageBox.INFO
                    });
                }
            }],
            shadow: 'frame',
            shadowOffset: 8,
            floating: true,
            layout: 'border',
            items: [{
                layout: "border",
                region: "west",
                xtype: "panel",
                collapsible: true,
                collapseMode: 'mini',
                hideCollapseTool: true,
                split: true,
                margins: "4 0 4 4",
                width: 210,
                items: [ProjectsTree(), PresetsTree()]
            }, {
                xtype: "tabpanel",
                id: 'tabs',
                activeTab: 0,
                margins: "4 4 4 0",
                enableTabScroll: true,
                region: "center",
                width: 100,
                items: [HomePanel()]
            }]
        }]
        Ext.StudioViewport.superclass.initComponent.call(this);
    }
});
