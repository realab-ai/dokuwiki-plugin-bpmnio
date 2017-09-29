<?php

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

require_once DOKU_INC . 'inc/parser/renderer.php';

class Doku_Renderer_plugin_bpmnio_edit extends Doku_Renderer {
    /**
     * @var Doku_Form
     */
    public $form;

    function getFormat(){
        return 'plugin_bpmnio_edit';
    }
}
