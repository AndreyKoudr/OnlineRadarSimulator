
// accepts only 0..9
function isNumberKey(evt)
{
	var charCode = (evt.which) ? evt.which : event.keyCode
	if (charCode > 31 && (charCode < 48 || charCode > 57))
		return false;

	return true;
}
// accepts 0..9 and period
function isNumberOrDotKey(evt)
{
	var charCode = (evt.which) ? evt.which : event.keyCode
	if (charCode > 31 && charCode != 46 && (charCode < 48 || charCode > 57))
		return false;

	return true;
}
// accepts 0..9 and period and -
function isNumberOrDotOrMinusKey(evt)
{
	var charCode = (evt.which) ? evt.which : event.keyCode
	if (charCode > 31 && charCode != 46 && charCode != 45 && (charCode < 48 || charCode > 57))
		return false;

	return true;
}
// accepts only 1..5
function isNumber5Key(evt)
{
	var charCode = (evt.which) ? evt.which : event.keyCode
	if (charCode > 31 && (charCode < 49 || charCode > 53))
		return false;

	return true;
}
// accepts only 0..5
function isNumber05Key(evt)
{
	var charCode = (evt.which) ? evt.which : event.keyCode
	if (charCode > 31 && (charCode < 48 || charCode > 53))
		return false;

	return true;
}
// accepts only n,s,N,S (North/South)
function isNSKey(evt)
{
	var charCode = (evt.which) ? evt.which : event.keyCode
	if (charCode > 31 && charCode != 78 && charCode != 83 && charCode != 110 && charCode != 115)
		return false;

	return true;
}
// accepts only e,w,E,W (East/West)
function isEWKey(evt)
{
	var charCode = (evt.which) ? evt.which : event.keyCode
	if (charCode > 31 && charCode != 69 && charCode != 87 && charCode != 101 && charCode != 119)
		return false;

	return true;
}
