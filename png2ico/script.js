const langToggle = document.getElementById('langToggle');
const title = document.getElementById('title');
const subtitle = document.getElementById('subtitle');
const convertBtn = document.getElementById('convertBtn');
const downloadSection = document.getElementById('downloadSection');
const downloadLink = document.getElementById('downloadLink');
const fileInput = document.getElementById('fileInput');
const fileBtn = document.getElementById('fileBtn');
const fileName = document.getElementById('fileName');
const prefixLabel = document.getElementById('prefixLabel');


const prefixInput = document.getElementById('prefixInput');

fileInput.addEventListener('change', () => {
  const fullName = fileInput.files[0]?.name || '';
  const nameOnly = fullName.replace(/\.[^/.]+$/, '');
  fileName.textContent = fullName;
  prefixInput.value = nameOnly;
});


// 在语言文本中加入：

fileBtn.addEventListener('click', () => {
  fileInput.click();
});

fileInput.addEventListener('change', () => {
  fileName.textContent = fileInput.files[0]?.name || '';
});


let isEnglish = true;

const texts = {
  en: {
    fileBtn: "Select PNG File",
    title: "PNG to Icon Sizes",
    subtitle: "Upload a PNG and download resized versions.",
    convert: "Convert",
    download: "Download ZIP",
    langBtn: "中文",
	prefixLabel: "File Name Prefix",
  },
  zh: {
    fileBtn: "选择 PNG 文件",
    title: "PNG 多尺寸转换工具",
    subtitle: "上传 PNG 图像并下载多尺寸图标。",
    convert: "转换",
    download: "下载 ZIP 包",
    langBtn: "English",
	prefixLabel: "生成文件名前缀",
  }
};




langToggle.addEventListener('click', () => {
  isEnglish = !isEnglish;
  const lang = isEnglish ? "en" : "zh";
  title.textContent = texts[lang].title;
  subtitle.textContent = texts[lang].subtitle;
  convertBtn.textContent = texts[lang].convert;
  downloadLink.textContent = texts[lang].download;
  langToggle.textContent = texts[lang].langBtn;
  // 更新语言时加入：
fileBtn.textContent = texts[lang].fileBtn;
// 在语言切换中添加：
prefixLabel.textContent = texts[lang].prefixLabel;
});

document.getElementById('convertBtn').addEventListener('click', () => {
  const file = document.getElementById('fileInput').files[0];
  if (!file) {
    alert(isEnglish ? "Please select a PNG file." : "请选择 PNG 文件");
    return;
  }

  const selectedSizes = Array.from(document.querySelectorAll('#sizeOptions input:checked'))
    .map(input => parseInt(input.value));
  if (selectedSizes.length === 0) {
    alert(isEnglish ? "Please select at least one size." : "请至少选择一个尺寸");
    return;
  }

  const fileName = file.name.replace(/\.[^/.]+$/, ""); // Remove extension

  const reader = new FileReader();
  reader.onload = function (e) {
    const img = new Image();
    img.onload = function () {
      const zip = new JSZip();
      const promises = selectedSizes.map(size => {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, size, size);
        return new Promise(resolve => {
          canvas.toBlob(blob => {
            const prefix = prefixInput.value.trim() || "icon";
zip.file(`${prefix}_${size}x${size}.png`, blob);
            resolve();
          }, "image/png");
        });
      });

      Promise.all(promises).then(() => {
        zip.generateAsync({ type: "blob" }).then(content => {
          const url = URL.createObjectURL(content);
          downloadLink.href = url;
                   downloadLink.download = `${fileName}.zip`;
          downloadSection.classList.remove('hidden');
          downloadSection.classList.remove('hidden');
        });
      });
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
});
