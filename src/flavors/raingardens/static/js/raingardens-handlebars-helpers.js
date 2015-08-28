/*global Handlebars _ moment */

var Shareabouts = Shareabouts || {};

(function(NS) {
  
  Handlebars.registerHelper('thousands_comma', function(garden_number) {
    // source: https://chiragrdarji.wordpress.com/2007/05/28/thousand-separator-function-for-java-script/
    var decimalDigits = 0;
    var Value = garden_number;
    // Separator Length. Here this is thousand separator
    var separatorLength = 3;
    var OriginalValue=Value;
    var TempValue = '' + OriginalValue;
    var NewValue = '';

    // Store digits after decimal
    var pStr;

    // store digits before decimal
    var dStr;

    // Add decimal point if it is not there
    if (TempValue.indexOf('.')==-1)
    {
      TempValue+='.'
    }

    dStr=TempValue.substr(0,TempValue.indexOf('.'));

    pStr=TempValue.substr(TempValue.indexOf('.'))

    // Add '0' for remaining digits after decimal point
    while (pStr.length-1< decimalDigits){pStr+='0'}

    if(pStr =='.')
      pStr =''; 
    
    if(dStr.length > separatorLength)
    {
      // Logic of separation
      while( dStr.length > separatorLength)
      {
        NewValue = ',' + dStr.substr(dStr.length - separatorLength) + NewValue;
        dStr = dStr.substr(0,dStr.length - separatorLength);
      }
      NewValue = dStr + NewValue;
    }
    else
    {
      NewValue = dStr;
    }
    // Add decimal part
    NewValue = NewValue + pStr;
    return NewValue;
  });

}(Shareabouts));
