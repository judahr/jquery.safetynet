// shortcut for building up and breaking down stub forms
var FormBuilder = {
    clear: function(){
        $('div#testbed form').empty();
    },
    addTextInput: function(name, value){
        var input = $('<input class="test" type="text" id="' + name + '" name="' + name + '" value="' + value + '" />');
        $('div#testbed form').append(input);
        return input;
    },
    addRadioInput: function(name, value, checked){
        var input = $('<input class="test" type="radio" id="' + name + '" name="' + name + '" value="' + value + '" ' + (checked ? 'checked="checked"' : '') + ' />');
        $('div#testbed form').append(input);
        return input;
    },
    addCheckboxInput: function(name, value, checked){
        var input = $('<input class="test" type="checkbox" id="' + name + '" name="' + name + '" value="' + value + '" ' + (checked ? 'checked="checked"' : '') + ' />');
        $('div#testbed form').append(input);
        return input;
    },
    addTextArea: function(name, value){
        var input = $('<textarea class="test" name="' + name + '" id="' + name + '">' + value + '</textarea>');
        $('div#testbed form').append(input);
        return input;
    },
    addSelect: function(name, value, opts){
        var options = $.map(opts,function(o){ return '<option value="'+o+'">'+o+'</option>' }).join('');
        var select = $('<select class="test" id="'+name+'" name="'+name+'">'+options+'</select>');
        $('div#testbed form').append(select);
        select.val(value);
        return select;
    },
    addButton: function(name, value) {
        var input = $('<input class="test" type="button" id="' + name + '" name="' + name + '" value="' + value + '" />');
        $('div#testbed form').append(input);
        return input;
    },
    addSubmitButton: function(name, value) {
        var input = $('<input class="test" type="submit" id="' + name + '" name="' + name + '" value="' + value + '" />');
        $('div#testbed form').append(input);
        return input;
    }
};


QUnit.specify("jQuery.safetynet", function() {           

    describe("jQuery.safetynet", function(){
        after(function(){
            $.safetynet.clearAllChanges();
            $.safetynet.suppressed(false);
            window.onbeforeunload = null;
            $('input[type="submit"]').die('click');
            $('input[type="submit"]').unbind('click');
        });
        
        it("should be equivalent to calling jQuery(jQuery.safetynet.defaults.fields).safetynet(options)", function(){
            var originalSafetynet = $.fn.safetynet;
            try{
                var passedOptions;
                var selection;
                $.fn.safetynet = function(opts) {
                    passedOptions = opts;                                        
                    selection = this;
                };
                var someOpts = {a:1,b:2};
                $.safetynet(someOpts);
                assert(someOpts).isSameAs(passedOptions);
                assert(selection.size()).equals(2);
            } finally {
                $.fn.safetynet = originalSafetynet;
            }   
        });

        describe("defaults", function(){            
            it("should have a default message option of 'Your unsaved changes will be lost.'", function(){
                assert($.safetynet.defaults.message).equals('Your unsaved changes will be lost.');
            });
            it("should have a default fields option of 'input,select,textarea,fileupload'", function(){
                assert($.safetynet.defaults.fields).equals('input,select,textarea,fileupload');
            });
            it("should have a default netChangerEvents option of 'change,keyup,paste'", function(){
                assert($.safetynet.defaults.netChangerEvents).equals('change,keyup,paste');
            });
        });

        describe("raiseChange()", function(){
            it("should throw exception if not provided a key", function(){
                assert(function(){
                    $.safetynet.raiseChange();
                }).throwsException("key is required when raising a jQuery.safetynet change");
            });
            it("should add a change so that hasChanges should result in true", function(){
                assert($.safetynet.hasChanges()).isFalse();
                $.safetynet.raiseChange("a");
                assert($.safetynet.hasChanges()).isTrue();
            });
        });

        describe("clearChange()", function(){
            it("should throw exception if not provided a key", function(){
                assert(function(){
                    $.safetynet.clearChange();
                }).throwsException("key is required when clearing a jQuery.safetynet change");
            });
            it("should remove change so that hasChanges returns true when was only change raised", function(){
                assert($.safetynet.hasChanges()).isFalse();
                $.safetynet.raiseChange("a");
                $.safetynet.raiseChange("b");
                assert($.safetynet.hasChanges()).isTrue();
                $.safetynet.clearChange("a");
                assert($.safetynet.hasChanges()).isTrue();
            });
            it("should remove change so that hasChanges returns false when was not only change raised", function(){
                assert($.safetynet.hasChanges()).isFalse();
                $.safetynet.raiseChange("a");
                $.safetynet.raiseChange("b");
                assert($.safetynet.hasChanges()).isTrue();
                $.safetynet.clearChange("a");
                $.safetynet.clearChange("b");
                assert($.safetynet.hasChanges()).isFalse();
            });
        });

        describe("clearAllChanges()", function(){
            it("should remove all raised changes so that hasChanges returns false no matter how many added", function(){
                assert($.safetynet.hasChanges()).isFalse();
                $.safetynet.raiseChange("a");
                $.safetynet.raiseChange("b");
                $.safetynet.raiseChange("c");
                assert($.safetynet.hasChanges()).isTrue();
                $.safetynet.clearAllChanges();
                assert($.safetynet.hasChanges()).isFalse();
            });
        });

        describe("hasChanges()", function(){
            it("should return false when no changes raised", function(){
                assert($.safetynet.hasChanges()).isFalse();
            });
            it("should return true when 2 changes raised, 1 cleared", function(){
                assert($.safetynet.hasChanges()).isFalse();
                $.safetynet.raiseChange("a");
                $.safetynet.raiseChange("b");
                assert($.safetynet.hasChanges()).isTrue();
                $.safetynet.clearChange("a");
                assert($.safetynet.hasChanges()).isTrue();
            });
            it("should return false when 2 changes raised, both cleared", function(){
                assert($.safetynet.hasChanges()).isFalse();
                $.safetynet.raiseChange("a");
                $.safetynet.raiseChange("b");
                assert($.safetynet.hasChanges()).isTrue();
                $.safetynet.clearChange("a");
                $.safetynet.clearChange("b");
                assert($.safetynet.hasChanges()).isFalse();
            });
        });

        describe("suppressed()", function(){
            it("should return current value of suppressed", function(){
                assert($.safetynet.suppressed()).isFalse();
                assert($.safetynet.suppressed(true)).isTrue();
                assert($.safetynet.suppressed()).isTrue();
                assert($.safetynet.suppressed(false)).isFalse();
                assert($.safetynet.suppressed()).isFalse();
            });
            it("should set new value of suppressed and return it if passed one", function(){
                assert($.safetynet.suppressed(true)).isTrue();
                assert($.safetynet.suppressed()).isTrue();
                assert($.safetynet.suppressed(false)).isFalse();
                assert($.safetynet.suppressed()).isFalse();
            });
        });
    });
    
    describe("jQuery.fn.safetynet", function(){

        var opts;

        before(function(){
            FormBuilder.addTextInput('t1','v1');
            FormBuilder.addTextInput('t2','v2');
            opts = {
                message: 'Your unsaved changes will be lost.',            
                fields: 'input.test,select.test,textarea.test,fileupload.test',
                form: 'form',
                netChangerEvents: 'change,keyup,paste'
            };
        });

        after(function(){
            FormBuilder.clear();
            $.safetynet.clearAllChanges();
            $.safetynet.suppressed(false);
            window.onbeforeunload = null;
            $('input[type="submit"]').die('click');
            $('input[type="submit"]').unbind('click');
        });

        it("should throw exception if jQuery.netchanger is not defined", function(){
            var originalNetchanger = $.fn.netchanger;
            try {
                // temporarily mock netchanger being absent
                delete $.fn['netchanger'];
                assert(function(){
                    $(opts.fields).safetynet(opts);
                }).throwsException('jQuery.safetynet requires a missing dependency, jQuery.netchanger.');
            } finally {
                $.fn.netchanger = originalNetchanger;
            }
        });
        it("should activate netchanger on selection, using netChangerEvents option", function(){
            var originalNetchanger = $.fn.netchanger;
            try {
                var calls = [];
                // temporarily mock netchanger
                $.fn.netchanger = function(opts) {
                    calls.push({selection:this,options:opts});
                    return this;
                };
                $(opts.fields).safetynet(opts);
                assert(calls.length).equals(1);
                assert(calls[0].selection.length).equals(2);
                assert(calls[0].options.events).equals('change,keyup,paste');
            } finally {
                $.fn.netchanger = originalNetchanger;
            }
        });
        it("should only allow one activation per page", function(){
            $(opts.fields).safetynet(opts);
            assert(function(){                
                $(opts.fields).safetynet(opts);
            }).throwsException('Only one activation of jQuery.safetynet is allowed per page');
        });
        it("should bind netchange on selection to raising changes so that hasChanges returns true", function(){
            $(opts.fields).safetynet(opts);
            assert($.safetynet.hasChanges()).isFalse();
            $('input[name="t1"]').trigger('netchange');
            assert($.safetynet.hasChanges()).isTrue();
        });
        it("should bind revertchange on selection to raising changes so that hasChanges returns false", function(){
            $(opts.fields).safetynet(opts);
            assert($.safetynet.hasChanges()).isFalse();
            $('input[name="t1"]').trigger('netchange');
            assert($.safetynet.hasChanges()).isTrue();
            $('input[name="t1"]').trigger('revertchange');
            assert($.safetynet.hasChanges()).isFalse();
        });
        it("should be able to differentiate between non-named, non-id'd but separate inputs when raising/clearing changes",function(){
            // identified ones
            var t1 = FormBuilder.addTextInput('t1','v1');
            var t2 = FormBuilder.addTextInput('t2','v2');
            // anonymous inputs
            var t3 = FormBuilder.addTextInput('','v3');
            var t4 = FormBuilder.addTextInput('','v4');

            $(opts.fields).safetynet(opts);
            assert($.safetynet.hasChanges()).isFalse();
            t1.trigger('netchange');
            t2.trigger('netchange');
            t3.trigger('netchange');
            t4.trigger('netchange');
            assert($.safetynet.hasChanges()).isTrue();
            t1.trigger('revertchange');
            t2.trigger('revertchange');
            assert($.safetynet.hasChanges()).isTrue();
            t3.trigger('revertchange');
            assert($.safetynet.hasChanges()).isTrue();
            t4.trigger('revertchange');
            assert($.safetynet.hasChanges()).isFalse();
        });
        it("should return original selection", function(){
            var selection = $(opts.fields);
            assert($(selection).safetynet(opts).fields).isSameAs(selection.fields);
        });
        it("should set a function to window.onbeforeload", function(){            
            assert(window.onbeforeunload).isNull();
            $(opts.fields).safetynet(opts);
            assert(window.onbeforeunload).isNotNull();
        });
        it("should return settings.message from onbeforeload fn when !supressed() and hasChanges()",function(){
            var originals = {
                suppressed: $.safetynet.suppressed,
                hasChanges: $.safetynet.hasChanges
            };
            try {
                // temporarily mock suppressed and haschanges
                $.safetynet.suppressed = function() { return false; }
                $.safetynet.hasChanges = function() { return true; }
                $(opts.fields).safetynet(opts);
                var beforeUnloadFn = window.onbeforeunload;
                assert(beforeUnloadFn()).equals(opts.message);
            }
            finally {
                // restore non-mocked versions
                $.extend($.safetynet, originals);
            }
        });
        it("should return undefined from onbeforeload fn when !supressed() and !hasChanges()", function(){
            var originals = {
                suppressed: $.safetynet.suppressed,
                hasChanges: $.safetynet.hasChanges
            };
            try {
                // temporarily mock suppressed and haschanges
                $.safetynet.suppressed = function() { return false; }
                $.safetynet.hasChanges = function() { return false; }
                $(opts.fields).safetynet(opts);
                var beforeUnloadFn = window.onbeforeunload;
                assert(beforeUnloadFn()).isUndefined();
            }
            finally {
                // restore non-mocked versions
                $.extend($.safetynet, originals);
            }
        });
        it("should return undefined from onbeforeload fn when supressed() and hasChanges()", function(){
            var originals = {
                suppressed: $.safetynet.suppressed,
                hasChanges: $.safetynet.hasChanges
            };
            try {
                // temporarily mock suppressed and haschanges
                $.safetynet.suppressed = function() { return true; }
                $.safetynet.hasChanges = function() { return true; }
                $(opts.fields).safetynet(opts);
                var beforeUnloadFn = window.onbeforeunload;
                assert(beforeUnloadFn()).isUndefined();
            }
            finally {
                // restore non-mocked versions
                $.extend($.safetynet, originals);
            }
        });
        it("should unsupress after running onbeforeload when was suppressed", function(){
            $(opts.fields).safetynet(opts);
            $.safetynet.raiseChange('somekey');
            $.safetynet.suppressed(true);
            var beforeUnloadFn = window.onbeforeunload;
            assert($.safetynet.suppressed()).isTrue();
            assert(beforeUnloadFn()).isUndefined();
            assert($.safetynet.suppressed()).isFalse();
        });
        it("should return undefined from onbeforeload fn when supressed() and !hasChanges()", function(){
            var originals = {
                suppressed: $.safetynet.suppressed,
                hasChanges: $.safetynet.hasChanges
            };
            try {
                // temporarily mock suppressed and haschanges
                $.safetynet.suppressed = function() { return true; }
                $.safetynet.hasChanges = function() { return false; }
                $(opts.fields).safetynet(opts);
                var beforeUnloadFn = window.onbeforeunload;
                assert(beforeUnloadFn()).isUndefined();
            }
            finally {
                // restore non-mocked versions
                $.extend($.safetynet, originals);
            }
        });
        it("should bind submit on form to supressed(true)", function(){
            var b1 = FormBuilder.addSubmitButton('submittor','go!');
            $(opts.fields).safetynet(opts);
            // mock onbeforeunload since we don't care about its call for this, 
            // and its call will interfere with our check
            window.onbeforeunload = function() { };
            assert($.safetynet.suppressed()).isFalse()
            // block true submits, just want to see what happens up until it
            $(opts.form)
                .bind('submit',function(){ return false; })
                .trigger('submit');
            assert($.safetynet.suppressed()).isTrue()
        });
    });
});
