Ext.info = function(){
    var msgCt;

    function createBox(t, s){
        return ['<table class="shadowed shadownormal"><tbody><tr><td class="stl"/><td class="stt"/><td class="str"/></tr><tr><td class="sll"/><td class="smm"><h3>', t, '</h3>', s, '</td><td class="srr"/></tr><tr><td class="sbl"/><td class="sbb"/><td class="sbr"/></tr></tbody></table>'].join('');
    }
    return {
        msg : function(title, format){
            if(!msgCt){
                msgCt = Ext.DomHelper.append(document.body, {id:'msg-div', style:'width:500px;z-index:2'}, true);
            }
            msgCt.alignTo(document, 't-t');
            var s = String.format.apply(String, Array.prototype.slice.call(arguments, 1));
            var m = Ext.DomHelper.append(msgCt, {html:createBox(title, s)}, true);
            m.slideIn('t').pause(3).ghost("t", {remove:true});
        }
    };
}();