function chartview(tag) {
     try {
        var xml = jQuery(tag).text();
        xml = decodeURIComponent(escape(window.atob(xml)));
  	
	// bundle exposes the viewer / modeler via the BpmnJS variable
  	var BpmnViewer = window.BpmnJSViewer;
  	var containerdiv = document.createElement('div');
  	containerdiv.className = "canvas";
  	jQuery(tag).parent().append(containerdiv);
  	var viewer = new BpmnViewer({ container: containerdiv });
	viewer.importXML(xml, function(err) {
	    if (err) {
	        containerdiv.text = err;
      	        console.log('error rendering', err);
    	    } else {
                var canvas = viewer.get('canvas');
                var bboxViewport = canvas.getDefaultLayer().getBBox();
                var bboxSvg = canvas.getSize();
                canvas.viewbox({ x: bboxViewport.x, y: bboxViewport.y, width: bboxSvg.width, height: bboxSvg.height });
                var height = bboxViewport.height + 4;
                // hack: adjust the div height because it doesn't automatically.
                containerdiv.style.height = "" + height + 'px';
                containerdiv.style.width = "" + bboxViewport.width + 'px';
                // Fix #3 by introducing a small space to allow clicks.
                containerdiv.style.marginRight = "32px";
            }
	});
	jQuery(tag).remove();
    }catch(err){
        console.warn(err.message);
    }
}

function chartmodel(tag) {
     try {
        var xml = jQuery(tag).text();
        xml = decodeURIComponent(escape(window.atob(xml)));
  	
	// bundle exposes the viewer / modeler via the BpmnJS variable
  	var BpmnModeler = window.BpmnJS;
  	var containerdiv = document.createElement('div');
  	containerdiv.className = "canvas";
  	jQuery(tag).parent().append(containerdiv);
        if (window.bpmnviewer===void(0)) {
            window.bpmnviewer = new BpmnModeler({ container: containerdiv });
        }
	window.bpmnviewer.importXML(xml, function(err) {
	    if (err) {
	        containerdiv.text = err;
      	        console.log('error rendering', err);
    	    } else {
                var canvas = window.bpmnviewer.get('canvas');
                var bboxViewport = canvas.getDefaultLayer().getBBox();
                var bboxSvg = canvas.getSize();
                canvas.viewbox({ x: bboxViewport.x, y: bboxViewport.y, width: bboxSvg.width, height: bboxSvg.height });
                var nheight = Math.max(bboxViewport.height, bboxSvg.height);
                // hack: adjust the div height because it doesn't automatically.
                containerdiv.style.height = "" + nheight + 'px';
                var nwidth = bboxSvg.width;
                containerdiv.style.width = "" + nwidth + 'px';
                // Fix #3 by introducing a small space to allow clicks.
                containerdiv.style.marginRight = "32px";
            }
	});
	jQuery(tag).remove();
    }catch(err){
        console.warn(err.message);
    }
}

function createtoolbar() {
    // we need an ID on the input field
    jQuery("bpmnio").attr('id', 'contenteditable');
    var bpmnioToolbar = new Array();
    for (var i = 0; i < toolbar.length - 1; i++) {
        var button = toolbar[i];
        switch (button['title']) {
            case 'Bold Text':
            case 'Italic Text':
            case 'Underlined Text':
            case 'Monospaced Text':
            case 'Strike-through Text':
            case 'Internal Link':
            case 'External Link':
                bpmnioToolbar.push(button);
                break;
            default:
                break;
        }        
    };
    initToolbar('tool__bar', 'contenteditable', bpmnioToolbar);
    jQuery('#tool__bar').attr('role', 'toolbar'); 
    jQuery("bpmnio").attr('id', '');

    window.insertTags = function (textAreaProp, tagOpen, tagClose, sampleText){
        var txtarea = jQuery('div[' + textAreaProp + '=true]')[0];

        var text = txtarea.innerText;
        
        // surround with tags
        text = tagOpen + text + tagClose;

        // do it
        txtarea.innerText = text;
    };
 }

function regevents() {
    jQuery('#edbtn__save').click(function() {
        window.bpmnviewer.saveXML(function(err, xml){
            if (err) {
	        jQuery('input[name=bpmnchart]:first').attr('value',err);
      	        console.log('error rendering', err);
    	    } else {
                var sdata = window.btoa(unescape(encodeURIComponent(xml.toString())));
                jQuery('input[name=bpmnchart]:first').attr('value', sdata);
            }
        });
    });
    jQuery('#edbtn__preview').click(function() {
        window.bpmnviewer.saveXML(function(err, xml){
            if (err) {
	        jQuery('input[name=bpmnchart]:first').attr('value',err);
      	        console.log('error rendering', err);
    	    } else {
                var sdata = window.btoa(unescape(encodeURIComponent(xml.toString())));
                jQuery('input[name=bpmnchart]:first').attr('value', sdata);
            }
        });
    });
    jQuery('.toolbutton[title="Internal Link [L]"]').click(function() {
        var txtdiv = jQuery('div[contenteditable=true]')[0];
        if (txtdiv === void(0)) return;
        
        var txtarea = jQuery(txtdiv).find('textarea')[0];
        if(txtarea === void(0)) {
            var sText = txtdiv.innerHTML;
            txtdiv.innerHTML = sText + '<textarea id=contenteditable style="visibility:hidden;">' + sText + '</textarea>';
            txtarea = jQuery(txtdiv).find('textarea')[0];
        }
        window.dw_linkwiz.textArea = txtarea;
        window.dw_linkwiz.selection = DWgetSelection(txtarea);
        var original_linkwiz_insertlink = window.dw_linkwiz.insertLink;
        window.dw_linkwiz.insertLink = function(title) {
            var link = dw_linkwiz.$entry.val(),
            sel,
            stxt;
            if (!link) {
                return;
            }
            
            var txtdiv = jQuery('div[contenteditable=true]')[0];
            if (txtdiv === void(0)) return;
            txtdiv.innerText = '[[' + link +'|' + txtdiv.innerText + ']]';
            dw_linkwiz.hide();

            // reset the entry to the parent namespace
            var externallinkpattern = new RegExp('^((f|ht)tps?:)?//', 'i'),
                entry_value;
            if (externallinkpattern.test(dw_linkwiz.$entry.val())) {
                if (JSINFO.namespace) {
                    entry_value = JSINFO.namespace + ':';
                } else {
                    entry_value = ''; //reset whole external links
                }
            } else {
                entry_value = dw_linkwiz.$entry.val().replace(/[^:]*$/, '')
            }
            dw_linkwiz.$entry.val(entry_value);
        };
    });
}

jQuery(document).ready(function() {
    //jQuery("textarea[id^=__bpmnio_]").each(function(i, tag) { try {
    jQuery("bpmnio textarea[class=bpmnio_data]").each(function(i, tag) {
        chartview(tag);
    });
    jQuery("bpmnio textarea[class=bpmnio_chart]:first").each(function(i, tag) {
        chartmodel(tag);
        createtoolbar();
        regevents();
    });
});
