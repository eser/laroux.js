// change selector if want to narrow your selection
var checkboxes = $l(['input[type=checkbox]']);
var toggleStatus = !(checkboxes.length > 0 && checkboxes[0].checked);

$l.each(
    checkboxes,
    function(i, element) {
        element.checked = toggleStatus;
    }
);