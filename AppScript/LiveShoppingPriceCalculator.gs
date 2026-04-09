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
      usdPrice = Math.round(computeUSD(jpyPrice) * 100) / 100;
    }
    console.log(usdPrice);
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
function computeUSD(jpyVal){
		  
  var mkUPRate = 1.90;
  var finalSRPUSD = 0;

  var exchangeRateBuffer = 0.0003;
  var exchangeRate = 0.0065; // as of 2025-08-20, verified Apr 2026
  
  // Guard: return 0 if empty or not a number
  if (isNaN(jpyVal) || jpyVal <= 0) return 0;

  // Base USD conversion
  finalSRPUSD = jpyVal * (exchangeRate + exchangeRateBuffer);

  if (jpyVal > 0 && jpyVal < 200) {
    finalSRPUSD = 3;

  } else if (jpyVal >= 200 && jpyVal < 400) {
    finalSRPUSD = 5;

  } else if (jpyVal >= 400 && jpyVal < 550) {
    finalSRPUSD = 7.00; // updated Apr 2026, was $7.50

  } else if (jpyVal >= 550) {

    // Smooth continuous markup curve (updated Apr 2026)
    // Anchors: ¥600 = 1.90x, ¥5,000 = $48.00
    // Floor: 1.45x for ¥6,500-¥9,999
    //        1.40x for ¥10,000+
    const A = 4.6496; // corrected Apr 2026
    const B = 0.1399;
    
    var curveRate = A * Math.pow(jpyVal, -B);

    var floorRate;
    if (jpyVal >= 10000) {
      floorRate = 1.40;
    } else if (jpyVal >= 6500) {
      floorRate = 1.45;
    } else {
      floorRate = 0;
    }

    var newMkUPRate = Math.max(floorRate, curveRate);
    finalSRPUSD *= newMkUPRate;
  }

  return finalSRPUSD;
}
