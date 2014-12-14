<?php

$tIsJsonTested = isset($_POST["tested"]) && $_POST["tested"] == "t";

$tObject = [
    "jsonTested" => $tIsJsonTested
];

echo json_encode($tObject);
