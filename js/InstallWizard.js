function InstallWizard(){
    var logo = new Ext.Container({
        items: [{
            xtype: 'box',
            autoEl: {
                tag: 'img',
                src: 'images/wb-wetfloor.png'
            }
        }]
    });
    var cardNav = function(incr){
        var l = Ext.getCmp('wiz-panel').getLayout();
        var i = l.activeItem.id.split('step-')[1];
        var next = parseInt(i) + incr;
        var switchTab = function(){
            l.setActiveItem(next);
            //l.activeItem.getEl().slideIn('r');
        }
        switch (next) {
            case 1:
                switchTab();
                if (Ext.getCmp('checkreq').store.find('status', 'fail') >= 0) {
                    Ext.getCmp('next').setDisabled(true);
                }
                else {
                    switchTab();
                }
                break;
            case 2:
                Ext.getCmp('settings').getForm().load();
                switchTab();
                break;
            case 3:
                var form = Ext.getCmp('settings').getForm();
                if (form.isValid()) {
                    form.submit({
                        success: function(){
                            Ext.getCmp('next').setText('Finish');
                            Ext.apply(Ext.getCmp('next'), {
                                handler: function(){
                                    window.location.replace(window.location.href);
                                }
                            });
                            switchTab();
                        },
                        failure: function(form, action){
                            Ext.Msg.show({
                                title: 'Error',
                                msg: action.result.msg,
                                buttons: Ext.Msg.OK,
                                minWidth: 400,
                                icon: Ext.MessageBox.ERROR
                            });
                        }
                    });
                }
                break;
        }
    };
    
    var win = new Ext.Window({
        title: 'Install PHP White Box Studio',
        closable: false,
        layout: 'table',
        plain: false,
        width: 500,
        height: 360,
        resizable: false,
        bbar: ['&copy; <a href="http://raz0r.name/PHPWhiteBoxStudio">Raz0r.name</a> 2009', '->', {
            id: 'next',
            iconCls: 'next',
            text: 'Next &raquo;',
            handler: cardNav.createDelegate(this, [1])
        }],
        items: [logo, {
            layout: 'card',
            id: 'wiz-panel',
            bodyStyle: 'background-color:#dfe8f6;',
            border: false,
            activeItem: 0,
            defaults: {
                border: false,
                padding: 5,
                bodyStyle: 'background-color:#dfe8f6;'
            },
            items: [{
                id: 'step-0',
                html: 'Welcome to PHP White Box Studio ' + Ext.ss.VERSION + '!<br/>Click Next to continue'
            }, {
                id: 'step-1',
                items: [{
                    xtype: 'grid',
                    id: 'checkreq',
                    title: 'Check the requirements',
                    width: 350,
                    store: new Ext.data.DirectStore({
                        directFn: Ext.ss.Installer.checkRequirements,
                        fields: ['item', 'need', 'actual', 'status'],
                        autoLoad: true
                    }),
                    columns: [{
                        dataIndex: 'item',
                        header: 'Item',
                        width: 150
                    }, {
                        dataIndex: 'need',
                        header: 'Needed',
                        width: 70
                    }, {
                        dataIndex: 'actual',
                        header: 'Your Value',
                        width: 70
                    }, {
                        dataIndex: 'status',
                        header: 'Status',
                        width: 50,
                        renderer: function(value, metaData){
                            switch (value) {
                                case 'ok':
                                    metaData.css = 'status-ok';
                                    break
                                case 'warn':
                                    metaData.css = 'status-warn';
                                    break
                                case 'fail':
                                    metaData.css = 'status-fail';
                                    break
                            }
                        }
                    }]
                }]
            }, {
                id: 'step-2',
                items: [{
                    xtype: 'form',
                    id: 'settings',
                    api: {
                        load: Ext.ss.Installer.loadSettings,
                        submit: Ext.ss.Installer.submitSettings
                    },
                    bodyStyle: 'background-color:#dfe8f6;',
                    border: false,
                    width: 350,
                    items: [{
                        xtype: 'fieldset',
                        defaultType: 'textfield',
                        title: 'Database',
                        anchor: '100%',
                        defaults: {
                            anchor: '-20',
                            maxLength: 100,
                            allowBlank: false
                        },
                        items: [{
                            name: 'host',
                            fieldLabel: 'Host'
                        }, {
                            name: 'username',
                            fieldLabel: 'Username'
                        }, {
                            name: 'password',
                            fieldLabel: 'Password',
                            allowBlank: true
                        }, {
                            name: 'database',
                            fieldLabel: 'Database'
                        }, {
                            xtype: 'checkbox',
                            align: 'right',
                            name: 'createdb',
                            boxLabel: 'Create if does not exist'
                        }]
                    }, {
                        xtype: 'fieldset',
                        defaultType: 'textfield',
                        title: 'Environment',
                        anchor: '100%',
                        defaults: {
                            anchor: '-20',
                            maxLength: 200,
                            allowBlank: false
                        },
                        items: [{
                            name: 'docroot',
                            fieldLabel: 'Document Root'
                        }, {
                            name: 'phppath',
                            fieldLabel: 'Path to PHP'
                        }, {
                            name: 'phpext',
                            fieldLabel: 'PHP file ext'
                        }]
                    }]
                }]
            }, {
                id: 'step-3',
                html: 'PHP White Box Studio ' + Ext.ss.VERSION + ' have been successfully installed!<br/>Click Finish to start the application'
            }]
        }]
    });
    
    win.show();
}
