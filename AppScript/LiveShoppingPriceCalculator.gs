
function onEdit(e) {
  if (!e) throw new Error('Please do not run the script in the script editor window. It runs automatically when you hand edit the spreadsheet.');
  // Set a comment on the edited cell to indicate when it was changed.
  const range = e.range;
  const colJpyPrice = 4;
  const colUSDPrice = 5;
  const colCurrent = range.getColumn();
  //console.log("onEdit " + range.getA1Notation());
  //console.log("getColumn() " + colCurrent);
  if (colCurrent == colJpyPrice){
    let usdPrice = 0;
    let jpyPrice = range.getValue();
    //console.log("JPY Value: " + jpyPrice);
    let usdPriceCell = SpreadsheetApp.getActiveSheet().getRange(range.getRow(), colUSDPrice);
    //console.log("usdPriceCell " + usdPriceCell.getA1Notation());
    if (jpyPrice > 0){
      usdPrice = Math.round(computeUSD(jpyPrice, 1) * 100) / 100;
    }
    //console.log(usdPrice);
    usdPriceCell.setValue(usdPrice);
  }
}
/*
function fconvertJpyToUsd() {
  var mySS = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var usdPrice = 0;
  var jpyPriceCol = 4;
  var usdPriceCol = 5;

  var col = 4; // Column D
  var startRow = mySS.getRange(1, 3).getValue();
  var endRow = mySS.getRange(1, 5).getValue();

  if (startRow < 1 || endRow < 1 || startRow >= endRow){ 
    console.log("invalid values");
    return; 
  }

  console.log("start row:" + startRow);
  console.log("end Row" + endRow);

  for (row = startRow; row <= endRow; row++){
    let jpyPrice = mySS.getRange(row, jpyPriceCol).getValue();
    usdPrice = computeUSD(jpyPrice, 1);
    console.log(usdPrice);
    mySS.getRange(row, usdPriceCol).setValue(usdPrice);
    //console.log("Row " + row + " = " + jpyPrice);
  }

}*/

// Function to compute the USD equivalent of the JPY Price (including mark up already)
function computeUSD(jpyVal, storeCategory){
		  
  var mkUPRate = 2;
  var newMkUPRate = mkUPRate;
  var finalSRPUSD = 0;

  const exchangeRateBuffer = 0.0003;
  const exchangeRate = 0.0065; //as of 2025-06-17
	
  // Get USD equivalent with no MU yet
  finalSRPUSD = jpyVal * (exchangeRate + exchangeRateBuffer);
  
  if (jpyVal > 0 && jpyVal < 200){
    finalSRPUSD = 3;
    
  } else if (jpyVal >= 200 && jpyVal < 400){
    finalSRPUSD = 5;
    
  } else if (jpyVal >= 400 && jpyVal < 500){
    finalSRPUSD = 7.50;
    
  } else {
  
    const ranges = [
		{ min: 500, max: 999, action: () => newMkUPRate = mkUPRate},
		{ min: 1000, max: 1499, action: () => newMkUPRate -= 0.05},
		{ min: 1500, max: 1999, action: () => newMkUPRate -= 0.10},
		{ min: 2000, max: 2499, action: () => newMkUPRate -= 0.15},
		{ min: 2500, max: 2999, action: () => newMkUPRate -= 0.25},
		{ min: 3000, max: 3499, action: () => newMkUPRate -= 0.30},
		{ min: 3500, max: 3999, action: () => newMkUPRate -= 0.35},
		{ min: 3500, max: 3999, action: () => newMkUPRate -= 0.35},
		{ min: 4000, max: 4499, action: () => newMkUPRate -= 0.40},
		{ min: 4500, max: 4999, action: () => newMkUPRate -= 0.45},
		{ min: 5000, max: 7499, action: () => newMkUPRate -= 0.50},
		{ min: 7500, max: 9999, action: () => newMkUPRate -= 0.60},
		{ min: 10000, max: 12499, action: () => newMkUPRate -= 0.65},
      ];
      
      
    function handleNumber(number) {
      const foundRange = ranges.find(range => number >= range.min && number <= range.max);
      if (foundRange) {
          foundRange.action();
      } else {
        newMkUPRate -= 0.70;
      }
    }
    
    if (jpyVal > 0){
      handleNumber(jpyVal);
    }
    
    // Final marked up USD price 
    finalSRPUSD *= newMkUPRate;
  }
 
  return finalSRPUSD;
			
}