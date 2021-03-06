'use strict';

goog.provide("Entry.Vim");

Entry.Vim = function(dom) {
    if (typeof dom === "string")
        dom = $('#' + dom);
    else
        dom = $(dom);

    if (dom.prop("tagName") !== "DIV")
        return console.error("Dom is not div element");

    this.createDom(dom);

    this._parser = new Entry.Parser("maze", "js", this.codeMirror);
    this._blockParser = new Entry.Parser("maze", "block");

    Entry.Model(this, false);
    window.eventset = [];
};

(function(p) {
    p.createDom = function (dom) {
        var parent, _self, target;
        parent = dom;
        this.view = Entry.Dom('div', {
            parent:parent,
            class: 'entryVimBoard'
        });

        this.codeMirror = CodeMirror(this.view[0], {
            lineNumbers: true,
            value: "",
            mode:  {name:"javascript", globalVars: true},
            theme: "default",
            indentUnit: 4,
            styleActiveLine: true,
            extraKeys: {
                "Ctrl-Space": "javascriptComplete",
                "Tab": function(cm) {
                    var spaces = Array(cm.getOption("indentUnit") + 1).join(" ");
                    cm.replaceSelection(spaces);
                }
            },
            // gutters: ["CodeMirror-lint-markers"],
            lint: true,
            viewportMargin: 10
        });

        this.doc = this.codeMirror.getDoc();

        _self = this;
        target = this.view[0];
        function eventDragEnd(e) {
            var textCode = _self.getCodeToText(e.block);
            _self.codeMirror.display.dragFunctions.leave(e);
            var mousedown = Entry.Utils.createMouseEvent('mousedown', e);
            _self.codeMirror.display.scroller.dispatchEvent(mousedown);
            var testArr = textCode.split('\n');
            var max = testArr.length - 1;
            var lastLine = 0;
            testArr.forEach(function (text, i) {
                _self.codeMirror.replaceSelection(text);
                var cursor = _self.doc.getCursor();
                lastLine = cursor.line;
                _self.codeMirror.indentLine(lastLine);
                if(i === 0 || max !== i) {
                    _self.codeMirror.replaceSelection('\n');
                }
            });
            var mouseup = Entry.Utils.createMouseEvent('mouseup', e);
            _self.codeMirror.display.scroller.dispatchEvent(mouseup);
        }

        function eventDragOver(e) {
            _self.codeMirror.display.dragFunctions.over(e);
        }

        target.removeEventListener("dragEnd", eventDragEnd);
        target.removeEventListener("dragOver", eventDragOver);
        target.addEventListener('dragEnd', eventDragEnd);
        target.addEventListener('dragOver', eventDragOver);
    };

    p.hide = function() {
        this.view.addClass('entryRemove');
    };

    p.show = function() {
        this.view.removeClass('entryRemove');
    };

    p.textToCode = function() {
        var textCode = this.codeMirror.getValue();
        var code = this._parser.parse(textCode);
        if(code.length === 0) {
            throw ('블록 파싱 오류');
        }
        return code;
    };

    p.codeToText = function(code) {
        var textCode = this._blockParser.parse(code);
        this.codeMirror.setValue(textCode);
        // this.codeMirror.getDoc().markText({line:0, ch:0}, {line: 1, ch: 100}, {readOnly: true});
    };

    p.getCodeToText = function(code) {
        var textCode = this._blockParser.parse(code);
        return textCode;
    };

})(Entry.Vim.prototype);
