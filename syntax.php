<?php
/**
 * @license    See LICENSE file
 * @author     Jaap de Haan <jaap.dehaan@color-of-code.de>
*/
     
// must be run within DokuWiki
if(!defined('DOKU_INC')) die();
     
if(!defined('DOKU_PLUGIN')) define('DOKU_PLUGIN',DOKU_INC.'lib/plugins/');
require_once DOKU_PLUGIN.'syntax.php';

// See help: https://www.dokuwiki.org/devel:syntax_plugins

class syntax_plugin_bpmnio extends DokuWiki_Syntax_Plugin {

    public function getPType() {
        return 'block';
    }

    public function getType() {
        return 'protected';
    }

    public function getSort() {
        return 0;
    }
     
    public function connectTo($mode) {
        $this->Lexer->addEntryPattern('<bpmnio.*?>(?=.*?</bpmnio>)', $mode, 'plugin_bpmnio');
    }
    
    public function postConnect() {
        $this->Lexer->addExitPattern('</bpmnio>', 'plugin_bpmnio');
    }
    
    public function handle($match, $state, $pos, Doku_Handler $handler) {
        $end = $pos + strlen($match);
        if ($state == DOKU_LEXER_UNMATCHED) {
            $match = base64_encode($match);
        }
        return array($match, $state, $pos, $end);
    }

    public function render($mode, Doku_Renderer $renderer, $data) {
        // $data is returned by handle()
        if(is_null($data)) return false;
        
        global $ID;
        switch($mode) {
            case 'xhtml':
                /** @var $renderer Doku_Renderer_xhtml */
                $this->_showData($data, $renderer);
                return true;
            case 'metadata':
                /** @var $renderer Doku_Renderer_metadata */
                //$this->_saveData($data, $ID, $renderer->meta['title']);
                return true;
            case 'plugin_bpmnio_edit':
                /** @var $renderer Doku_Renderer_plugin_bpmnio_edit */
                $this->_editData($data, $renderer);
                return true;
            default:
                return false;
        }
    }
    
    function _showData($data, Doku_Renderer $renderer) {
        list($match, $state, $pos, $end) = $data;
        switch ($state) {
            case DOKU_LEXER_ENTER :
                $bpmnid = uniqid('__bpmnio_');
                $class = $renderer->startSectionEdit($pos, 'plugin_bpmnio');                    
                $renderer->doc .= '<div class="' . $class . '">';
                $renderer->doc .= '<div style="overflow:auto;">';
                $renderer->doc .= $match;
                $renderer->doc .= '<textarea class="bpmnio_data" id="'.$bpmnid.'" style="visibility:hidden;">';
                break;
 
            case DOKU_LEXER_UNMATCHED :                      
                $renderer->doc .= trim($match);
                break;
            case DOKU_LEXER_EXIT :       
                $renderer->doc .= '</textarea>';
                $renderer->doc .= $match;
                $renderer->doc .= '</div>';
                $renderer->doc .= '</div>';
                //$renderer->doc .= '<textarea style="visibility:hidden;">' . 'blank line' . '</textarea>';
                $renderer->finishSectionEdit($end);
                break;
            default:
                return false;
        }
        return true;
    }
    
    function _editData($data, Doku_Renderer $renderer) {
        list($match, $state, $pos, $end) = $data;
        switch ($state) {
            case DOKU_LEXER_ENTER :
                $bpmnid = uniqid('__bpmnio_');
                $header = '<div style="overflow:auto;">';
                $header .= $match;
                $header .= '<textarea class="bpmnio_chart" id="'.$bpmnid.'" style="visibility:hidden;">';
                $renderer->form->addElement($header);
                break;
            case DOKU_LEXER_UNMATCHED :                      
                $header = trim($match);
                $renderer->form->addElement($header);
                $renderer->form->addHidden($this->getLang('secedit_name'), '');
                break;
            case DOKU_LEXER_EXIT :
                $header = '</textarea>';
                $header .= $match;
                $header .= '</div>';
                $renderer->form->addElement($header);
                break;
            default:
                return false;
        }
        return true;
    }
    
    /**
     * Handles the data posted from the editor to recreate the entry syntax
     *
     * @param array $data data given via POST
     * @return string
     */
    public static function editToWiki($data) {
        $ret = '<bpmnio zoom=1.0>';
        $ret .= base64_decode($data);
        $ret .= '</bpmnio>';
        return $ret;
    }
}
