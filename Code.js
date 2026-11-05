const SPREADSHEET_ID = '18VmspeT4fjVB1DG2ye8FzhkqdHOxgqyL1MYyBjSTEnI';

function doGet(e) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheetSuKien = ss.getSheetByName("SuKienDanhGia");
    
    const data = sheetSuKien.getDataRange().getValues();
    const rows = data.slice(1); 
    
    const activeEvents = rows.filter(row => row[3] === "Cho phép");
    
    let response = {};
    
    if (activeEvents.length === 0) {
      response = { status: "NO_EVENT" };
    } else if (activeEvents.length > 1) {
      response = { status: "MULTIPLE_EVENTS" };
    } else {
      response = {
        status: "SUCCESS",
        data: {
          maSuKien: activeEvents[0][0],
          tenSuKien: activeEvents[0][1],
          ngayToChuc: (activeEvents[0][2] instanceof Date) 
                        ? Utilities.formatDate(activeEvents[0][2], "GMT+7", "dd/MM/yyyy") 
                        : activeEvents[0][2]
        }
      };
    }
    
    return ContentService.createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "ERROR", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheetDanhGia = ss.getSheetByName("NoiDungDanhGia");
    
    const payload = JSON.parse(e.postData.contents);
    
    const maDanhGia = generateRandomID(10);
    const maSuKienDanhGia = payload.maSuKien;
    const danhGiaHinhThuc = payload.hinhThuc;
    const danhGiaNoiDung = payload.noiDung;
    const danhGiaBoIch = payload.boIch;
    const gopY = payload.gopY || "";
    
    // Đã cập nhật định dạng Ngày/Tháng/Năm Giờ:Phút:Giây
    const thoiGianDanhGia = Utilities.formatDate(new Date(), "GMT+7", "dd/MM/yyyy HH:mm:ss");
    
    sheetDanhGia.appendRow([
      maDanhGia, 
      maSuKienDanhGia, 
      danhGiaHinhThuc, 
      danhGiaNoiDung, 
      danhGiaBoIch, 
      gopY, 
      thoiGianDanhGia
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({ status: "SUCCESS", maDanhGia: maDanhGia }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "ERROR", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function generateRandomID(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}