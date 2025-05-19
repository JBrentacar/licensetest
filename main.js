// main.js

// ——————————————————————————————
// 1. 要素取得
// ——————————————————————————————
const video       = document.getElementById('video');
const canvas      = document.getElementById('canvas');
const captureBtn  = document.getElementById('capture');
const resultPre   = document.getElementById('result');
const ctx         = canvas.getContext('2d');

// ——————————————————————————————
// 2. カメラ起動（背面カメラ）
// ——————————————————————————————
async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' }
    });
    video.srcObject = stream;
  } catch (err) {
    console.error('カメラ起動エラー:', err);
    alert('カメラを起動できませんでした。権限設定をご確認ください。');
  }
}

// ——————————————————————————————
// 3. キャプチャ＆OCR 実行
// ——————————————————————————————
captureBtn.addEventListener('click', async () => {
  if (!video.videoWidth || !video.videoHeight) {
    alert('カメラ映像が取得できていません');
    return;
  }

  // 3-1. キャンバスにフレーム描画
  canvas.width  = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0);

  // 3-2. OpenCV.js 前処理
  let src  = cv.imread(canvas);
  let gray = new cv.Mat();
  cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

  // ノイズ除去
  let blur = new cv.Mat();
  cv.GaussianBlur(gray, blur, new cv.Size(5, 5), 0);

  // 二値化（文字を白抜きに）
  let binary = new cv.Mat();
  cv.adaptiveThreshold(
    blur, binary,
    255,
    cv.ADAPTIVE_THRESH_MEAN_C,
    cv.THRESH_BINARY_INV,
    15, 10
  );

  cv.imshow(canvas, binary);

  // メモリ解放
  src.delete(); gray.delete(); blur.delete(); binary.delete();

  // 3-3. OCR 実行
  resultPre.textContent = '認識中… 少々お待ちください';
  try {
    const { data: { text } } = await Tesseract.recognize(
      canvas,
      'jpn',
      {
        logger: m => console.log(m),                 // 進捗ログ
        tessedit_pageseg_mode: Tesseract.PSM.SINGLE_BLOCK,
        tessedit_char_whitelist: '一-龥ァ-ヴー0-9A-Za-z'
      }
    );
    resultPre.textContent = text.trim() || 'テキストが検出できませんでした';
  } catch (err) {
    console.error('OCR エラー:', err);
    resultPre.textContent = 'OCR 実行中にエラーが発生しました';
  }
});

// ——————————————————————————————
// 4. 初期化
// ——————————————————————————————
window.addEventListener('DOMContentLoaded', startCamera);
