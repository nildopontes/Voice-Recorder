<?php
   $file = file_get_contents('php://input');
   echo file_put_contents('audio.oga', $file, FILE_APPEND);
?> 
