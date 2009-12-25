var SaveFile = function(panel){
    var statusbar = panel.getBottomToolbar();
    statusbar.showBusy();
    Ext.ss.Files.saveContents(panel.file, panel.editor.getCode(), panel.encoding, function(result){
        if (result) {
            statusbar.setStatus({
                text: 'Saved',
                iconCls: 'x-status-valid'
            });
        }
        else {
            statusbar.setStatus({
                text: 'An error occured while saving',
                iconCls: 'x-status-error'
            });
        }
    });
}
var LoadFile = function(file, hash, line, code){
    Ext.ss.Files.getContents(file, function(data){
        var re = /\/([^\/]+?)$/g;
        var filename = re.exec(file)[1];
        var tabs = Ext.getCmp('tabs');
        var panel = new Ext.SourceCodePanel({
            id: hash,
            title: filename,
            tabTip: file
        });
        tabs.setActiveTab(tabs.add(panel));
        var editor = new CodeMirror(panel.body, {
            height: "100%",
            parserfile: ["parsexml.js", "parsecss.js", "tokenizejavascript.js", "parsejavascript.js", "../contrib/php/js/tokenizephp.js", "../contrib/php/js/parsephp.js", "../contrib/php/js/parsephphtmlmixed.js"],
            stylesheet: ["codemirror/css/xmlcolors.css", "codemirror/css/jscolors.css", "codemirror/css/csscolors.css", "codemirror/contrib/php/css/phpcolors.css"],
            path: "codemirror/js/",
            continuousScanning: 500,
            lineNumbers: true,
            textWrapping: false,
            content: data.contents,
            saveFunction: SaveFile.createDelegate(this, [panel]),
            iframeClass: 'editor',
            initCallback: function(){
                if (line) {
                    (function(){
                        selectLine(editor, line, code);
                    }).defer(500);
                    panel.lines.push({
                        line: line,
                        code: code
                    });
                }
            }
        });
        
        panel.file = file;
		panel.encoding = data.encoding;
        panel.editor = editor;
    });
}
var selectLine = function(editor, line, code){
    var l = editor.nthLine(line);
    editor.selectLines(l, 1);
    var c = editor.getSearchCursor(code, true);
    try {
        var f = c.findNext();
    } 
    catch (e) {
    }
    if (f) {
        c.select();
    }
    else {
        editor.selectLines(l, 0, l, editor.lineContent(l).length);
    }
}
Ext.SourceCodePanel = Ext.extend(Ext.Panel, {
    initComponent: function(){
        this.closable = true;
        this.layout = 'fit';
        this.iconCls = 'show-code';
        this.lines = [];
        this.tbar = [{
            xtype: 'trigger',
            triggerClass: 'x-form-search-trigger',
            emptyText: 'Type to search...',
            onTriggerClick: function(){
                var editor = this.ownerCt.ownerCt.editor;
                var cursor = editor.getSearchCursor(this.getValue(), true, true);
                var found = cursor.findNext();
                if (!found) {
                    var cursor = editor.getSearchCursor(this.getValue(), false, true);
                    var found = cursor.findNext();
                    if (!found) {
                        Ext.Msg.show({
                            title: 'Not Found',
                            width: 400,
                            msg: 'Search string was not found',
                            buttons: Ext.Msg.OK,
                            icon: Ext.MessageBox.ERROR
                        });
                    }
                }
                cursor.select();
            }
        }, '-', {
            text: 'Jump To Next',
            iconCls: 'jump',
            handler: function(){
                var panel = this.ownerCt.ownerCt;
                if (!panel.lines.length) {
                    return;
                }
                var jump = true;
                var cmp = function(a, b){
                    return a.line - b.line;
                }
                panel.lines.sort(cmp);
                Ext.each(panel.lines, function(){
                    if (this.line > panel.editor.lineNumber(panel.editor.cursorPosition().line)) {
                        selectLine(panel.editor, this.line, this.code);
                        jump = false;
                        return false;
                    }
                });
                if (jump) {
                    var first = panel.lines.shift();
                    selectLine(panel.editor, first.line, first.code);
                    panel.lines.unshift(first);
                }
            }
        }, '-', {
            iconCls: 'undo',
            tooltip: 'Undo',
            handler: function(){
                this.ownerCt.ownerCt.editor.undo();
            }
        }, {
            iconCls: 'redo',
            tooltip: 'Redo',
            handler: function(){
                this.ownerCt.ownerCt.editor.redo();
            }
        }, '-', {
            text: 'Save',
            iconCls: 'script-save',
            handler: function(){
                var panel = this.ownerCt.ownerCt;
                SaveFile(panel);
            }
        }];
        this.bbar = {
            xtype: 'statusbar',
            busyText: 'Saving...',
            text: 'Ready',
            iconCls: 'x-status-valid'
        };
        Ext.SourceCodePanel.superclass.initComponent.call(this);
    }
});
