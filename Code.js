const SPREADSHEET_ID = '18VmspeT4fjVB1DG2ye8FzhkqdHOxgqyL1MYyBjSTEnI';

// Cấu hình CORS để cho phép Front-end từ Github Pages gọi API
function doOptions(e) {
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeader("Access-Control-Allow-Origin", "*")
    .setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    .setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function doGet(e) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheetSuKien = ss.getSheetByName("SuKienDanhGia");
    
    // Lấy toàn bộ dữ liệu (bỏ qua dòng tiêu đề)
    const data = sheetSuKien.getDataRange().getValues();
    const rows = data.slice(1); 
    
    // Lọc sự kiện có trạng thái "Cho phép"
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
          // Định dạng lại ngày nếu cần thiết, hoặc lấy chuỗi trực tiếp
          ngayToChuc: (activeEvents[0][2] instanceof Date) 
                        ? Utilities.formatDate(activeEvents[0][2], "GMT+7", "dd/MM/yyyy") 
                        : activeEvents[0][2]
        }
      };
    }
    
    return ContentService.createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader("Access-Control-Allow-Origin", "*");
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "ERROR", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader("Access-Control-Allow-Origin", "*");
  }
}

function doPost(e) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheetDanhGia = ss.getSheetByName("NoiDungDanhGia");
    
    const payload = JSON.parse(e.postData.contents);
    
    // Tạo mã đánh giá ngẫu nhiên 10 ký tự
    const maDanhGia = generateRandomID(10);
    const maSuKienDanhGia = payload.maSuKien;
    const danhGiaHinhThuc = payload.hinhThuc;
    const danhGiaNoiDung = payload.noiDung;
    const danhGiaBoIch = payload.boIch;
    const gopY = payload.gopY || "";
    
    // Lấy thời gian hiện tại
    const thoiGianDanhGia = Utilities.formatDate(new Date(), "GMT+7", "dd/MM/yyyy, HH:mm:ss");
    
    // Ghi vào sheet (Thứ tự: MaDanhGia, MaSuKienDanhGia, DanhGiaHinhThuc, DanhGiaNoiDung, DanhGiaBoIch, GopY, ThoiGianDanhGia)
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
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader("Access-Control-Allow-Origin", "*");
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "ERROR", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader("Access-Control-Allow-Origin", "*");
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