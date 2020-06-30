<?php
   $data = 'data.txt';
   $recDir = 'records';
   clearstatcache();
   if(!file_exists($data)){
      file_put_contents($data, '', FILE_APPEND);
   }
   if(!file_exists($recDir)){
      mkdir($recDir);
   }
   if(isset($_GET['cmd'])){
      $command = $_GET['cmd'];
      $id = intval($_GET['id']);
      switch($command){
         case 'delete':
            $temp = str_split(file_get_contents($data, FILE_TEXT), 1);
            $temp[$id] = '0';
            file_put_contents($data, implode('', $temp), FILE_TEXT);
            if(unlink($recDir.'/rec-'.$id.'.oga')){
               echo '0';
            }else{
               echo '1';
            }
            break;
         case 'update':
            echo file_get_contents($data, FILE_TEXT);
            break;
      }
   }else{
      $file = file_get_contents('php://input');
      $id = filesize($data);
      file_put_contents($recDir.'/rec-'.$id.'.oga', $file, FILE_APPEND);
      file_put_contents($data, '1', FILE_TEXT|FILE_APPEND);
      echo $id;
   }
?>
