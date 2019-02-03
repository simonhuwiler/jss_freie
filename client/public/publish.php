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



//Reformat the json to a deep structure
echo "go";
$deep_data = [];


function job_to_object($entry)
{
	$new_job = [];
	$new_job['jahr'] = $entry['jahr'];
	$new_job['lohn'] = $entry['lohn'];
	$new_job['sozialleistungen'] = $entry['sozialleistungen'];
	$new_job['spesen'] = $entry['spesen'];
	$new_job['abrechnung'] = $entry['abrechnung'];
	$new_job['zeichen'] = $entry['zeichen'];
	$new_job['auftrag'] = $entry['auftrag'];
	$new_job['infos'] = $entry['infos'];
	//$new_job['offiziell'] = $entry['offiziell'] == '1' ? true : false;
	return $new_job;
}

function ressort_to_object($entry)
{
	$new_ressort = [];
	$new_ressort['name'] = $entry['ressort'];
	$new_ressort['jobs'] = [];
	$new_ressort['jobs'][] = job_to_object($entry);
	return $new_ressort;
}

foreach($bulk['data'] as $entry)
{
	//Search in deep_data if medium already exists
	$found = false;
	foreach($deep_data as &$medium)
	{
		if($medium['name'] == $entry['medium'])
		{
			$found = true;
			//Medium already in array. Add job

			if($entry['offiziell'] == '1')
			{
				$new_medium['text_offiziell'] = $entry['infos'];
			}
			else
			{

				//First: Look, if ressort already exists
				$found_ressort = false;
				foreach($medium['ressorts'] as &$ressort)
				{
					if($ressort['name'] == $entry['ressort'])
					{
						$found_ressort = true;
						$ressort['jobs'][] = job_to_object($entry);
						break;
					}
				}

				//Ressort not found
				if(!$found_ressort)
				{
					$medium['ressorts'][] = ressort_to_object($entry);
				}

				break;
			}
		}
	}

	if(!$found)
	{
		//Medium not existing. Add it
		$new_medium = [];
		$new_medium['name'] = $entry['medium'];
		$new_medium['logo'] = $entry['logo'];
		$new_medium['ressorts'] = [];

		if($entry['offiziell'] == '1')
			$new_medium['text_offiziell'] = $entry['infos'];
		else
		  $new_medium['ressorts'][] = ressort_to_object($entry);

		$deep_data[] = $new_medium;
	}
}

//Sort array
function cmp_name($a, $b)
{
  return strcasecmp($a['name'], $b['name']);
}

function cmp_year($a, $b)
{
	//Check if empty
	$s_a = $a['jahr'] == "" ? "9999" : $a['jahr'];
	$s_b = $b['jahr'] == "" ? "9999" : $b['jahr'];
	
	if(intval($s_a) < intval($s_b))
		return 1;
	elseif(intval($s_a) == intval($s_b))
		return 0;
	else
	  return -1;
}

//Sort medium
usort($deep_data, "cmp_name");

//Sort Ressorts
foreach($deep_data as &$medium)
{
	usort($medium['ressorts'], "cmp_name");
	foreach($medium['ressorts'] as &$ressort)
	{
		usort($ressort['jobs'], "cmp_year");
	}
}

//Sort Jobs



/*
$fp = fopen('data/data_'.$bulkname.'_new.json', 'w');
fwrite($fp, json_encode($deep_data));
*/

//Safe it
		echo($bulkname." wird geschrieben...<br/>");
		$fp = fopen('data/data_'.$bulkname.'.json', 'w');
		if(fwrite($fp, json_encode($deep_data))) {
			echo("Cache wurde erfolgreich aktualisiert.<br><br>");
		}
		else {
			echo("Ein Fehler ist aufgetreten.<br><br>");	
		}
		fclose($fp);
		
		echo("<br><hr><a href='".$_SERVER['PHP_SELF']."' target='_self'>» Cache erneut schreiben.</a>");


?>