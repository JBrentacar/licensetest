// main.js

// 1. カメラ起動
const video = document.getElementById('video');
navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
  .then(stream => video.srcObject = stream)
  .catch(console.error);

// 2. キャプチャ＆OCR処理
document.getElementById('capture').addEventListener('click', async () => {
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  // 動画フレームをキャンバスに描画
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0);

  // 3. OpenCVで簡易前処理（必要に応じて矩形検出＋透視変換を追加）
  let src = cv.imread(canvas);
  let gray = new cv.Mat();
  cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
  cv.adaptiveThreshold(gray, gray, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C,
                       cv.THRESH_BINARY, 11, 2);
  cv.imshow(canvas, gray);
  src.delete(); gray.delete();

  // 4. Tesseract.js で OCR
  const { data: { text } } = await Tesseract.recognize(
    canvas,
    'jpn',            // 日本語＋英数字
    { logger: m => console.log(m) }
  );

  document.getElementById('result').textContent = text;
});
