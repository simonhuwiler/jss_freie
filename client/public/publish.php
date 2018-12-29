<?php
/*

	Code by Rafemen. Thanks!
	https://rafenew.world/

*/
header("Pragma: no-cache");
header("Cache-Control: no-store, no-cache, max-age=0, must-revalidate");
header("Content-Type: text/html; charset=utf-8");
setlocale(LC_ALL, 'de_DE.UTF-8'); 


$names = array();
$urls = array();

$names[0] = "data";

$urls[0] = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTugUHbfipmch2ALQwWHKgpuF5ZkoWesAVyAMvqcpB9GH6g3AyoXHwZMfIgXWxoVTgxeIAAXhp6qZED/pub?gid=1617353131&single=true&output=csv";

$bulkname = "bulk";



for($i=0;$i<count($names);$i++) {
	//echo($names[$i]);

	$url = $urls[$i];

	//echo(" Cache wird geschrieben...<br/>");

	$core_data = array();
	$anzahl_zeilen = 0;
	$titelzeile = array();


	if (($handle = fopen($url, "r")) !== FALSE) {
		while (($data_zeile = fgetcsv($handle, 10000, ",")) !== FALSE) {
			$anzahl_reihen = count($data_zeile);
			//echo($anzahl_reihen."<br>");
			if($anzahl_zeilen==0) {
				$titelzeile=$data_zeile;
			}
			else {
				$row=array();
				for($j=0;$j<$anzahl_reihen;$j++) {
					if($titelzeile[$j]!='Info') {
						$row[$titelzeile[$j]]=$data_zeile[$j];	
					}
				}
				//$core_data[strtolower($data_zeile[0])]=$row;
				array_push($core_data,$row);
			}

			$anzahl_zeilen++;
			}
	    }
		//echo(json_encode($core_data));
	    fclose($handle);
	    //echo(json_encode($titelzeile));
		//$core_data['Stimmen']=$core_data;

	    /*
		$fp = fopen('data/data_'.$names[$i].'.json', 'w');
		if(fwrite($fp, json_encode($core_data))) {
			echo("Cache wurde erfolgreich aktualisiert.<br><br>");
		}
		else {
			echo("Ein Fehler ist aufgetreten.<br><br>");	
		}
		fclose($fp);
		*/

		$bulk[$names[$i]] = $core_data;

}
		echo($bulkname." wird geschrieben...<br/>");
		$fp = fopen('data/data_'.$bulkname.'.json', 'w');
		if(fwrite($fp, json_encode($bulk))) {
			echo("Cache wurde erfolgreich aktualisiert.<br><br>");
		}
		else {
			echo("Ein Fehler ist aufgetreten.<br><br>");	
		}
		fclose($fp);
		
		echo("<br><hr><a href='".$_SERVER['PHP_SELF']."' target='_self'>» Cache erneut schreiben.</a>");


?>