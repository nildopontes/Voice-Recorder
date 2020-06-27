<?php
   $data = 'data.txt';
   if(!file_exists($data)){
      file_put_contents($data, '', FILE_APPEND);
   }
   if(isset($_GET['cmd'])){
      $command = $_GET['cmd'];
      switch($command){
         case 'delete':
            echo "Command is delete";
            break;
         case 'update':
            echo "Command is update";
            break;
      }
   }else{
      $file = file_get_contents('php://input');
      $id = filesize($data);
      file_put_contents('records/rec-'.$id.'.oga', $file, FILE_APPEND);
      file_put_contents($data, '1', FILE_TEXT|FILE_APPEND);
      echo $id;
   }
?>
