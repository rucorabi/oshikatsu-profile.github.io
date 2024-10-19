document.addEventListener("DOMContentLoaded", function () {
  const clickableAreas = document.querySelectorAll(".clickable-area");
  const inputForm = document.getElementById("inputForm");
  const inputText = document.getElementById("inputText");
  const inputFont = document.getElementById("inputFont");
  const inputSize = document.getElementById("inputSize");
  const inputLineHeight = document.getElementById("inputLineHeight");
  const inputLetterSpacing = document.getElementById("inputLetterSpacing");
  const saveButton = document.getElementById("saveButton");
  const cancelButton = document.getElementById("cancelButton");
  const iconUpload = document.getElementById("iconUpload");
  const generateButton = document.getElementById("generateButton");
  const currentEditArea = document.getElementById("currentEditArea");

  let currentArea = null;
  let originalValues = {};

  clickableAreas.forEach((area) => {
    area.addEventListener("click", () => openInputForm(area));
  });

  function openInputForm(area) {
    if (currentArea) {
      currentArea.classList.remove("editing");
    }
    currentArea = area;
    currentArea.classList.add("editing");

    if (currentArea.id === "icon") {
      iconUpload.click();
    } else {
      const textElement = currentArea.querySelector(".clickable-area-text");
      originalValues = {
        text: textElement.textContent.trim(),
        font: window
          .getComputedStyle(textElement)
          .fontFamily.split(",")[0]
          .replace(/['"]/g, ""),
        size: parseInt(window.getComputedStyle(textElement).fontSize),
        lineHeight:
          parseFloat(window.getComputedStyle(textElement).lineHeight) || 1.2,
        letterSpacing:
          parseFloat(window.getComputedStyle(textElement).letterSpacing) || 0,
      };

      inputText.value = originalValues.text;
      inputFont.value = originalValues.font;
      inputSize.value = originalValues.size;
      inputLineHeight.value = originalValues.lineHeight;
      inputLetterSpacing.value = originalValues.letterSpacing;

      currentEditArea.textContent =
        currentArea.id.charAt(0).toUpperCase() + currentArea.id.slice(1);
      showForm();

      setTimeout(() => {
        inputText.focus();
      }, 100);
    }
  }

  function showForm() {
    inputForm.style.display = "block";
    document.body.style.overflow = "hidden";
    window.scrollTo(0, document.body.scrollHeight);
  }

  function hideForm() {
    inputForm.style.display = "none";
    document.body.style.overflow = "";
    if (currentArea) {
      currentArea.classList.remove("editing");
    }
  }

  // リアルタイム更新のためのイベントリスナーを追加
  inputText.addEventListener("input", updatePreview);
  inputFont.addEventListener("change", updatePreview);
  inputSize.addEventListener("input", updatePreview);
  inputLineHeight.addEventListener("input", updatePreview);
  inputLetterSpacing.addEventListener("input", updatePreview);

  function updatePreview() {
    if (!currentArea) return;
    const textElement = currentArea.querySelector(".clickable-area-text");
    textElement.textContent = inputText.value;
    textElement.style.fontFamily = inputFont.value;
    textElement.style.fontSize = `${inputSize.value}px`;
    textElement.style.lineHeight = inputLineHeight.value;
    textElement.style.letterSpacing = `${inputLetterSpacing.value}px`;
  }

  saveButton.addEventListener("click", () => {
    hideForm();
  });

  cancelButton.addEventListener("click", () => {
    if (currentArea && originalValues) {
      const textElement = currentArea.querySelector(".clickable-area-text");
      textElement.textContent = originalValues.text;
      textElement.style.fontFamily = originalValues.font;
      textElement.style.fontSize = `${originalValues.size}px`;
      textElement.style.lineHeight = originalValues.lineHeight;
      textElement.style.letterSpacing = `${originalValues.letterSpacing}px`;
    }
    hideForm();
  });

  // エスケープキーでフォームを閉じる
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && inputForm.style.display === "block") {
      cancelButton.click();
    }
  });

  // フォームの外側をクリックしたときにフォームを閉じる
  document.addEventListener("click", (e) => {
    if (
      e.target !== inputForm &&
      !inputForm.contains(e.target) &&
      !e.target.classList.contains("clickable-area") &&
      !e.target.classList.contains("clickable-area-text")
    ) {
      hideForm();
    }
  });

  iconUpload.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          // アイコンエリアのサイズを取得
          const iconArea = document.getElementById("icon");
          const areaWidth = iconArea.offsetWidth;
          const areaHeight = iconArea.offsetHeight;

          // 画像のアスペクト比を維持しながら、エリア内に収まるようにリサイズ
          const scale = Math.min(
            areaWidth / img.width,
            areaHeight / img.height
          );
          const width = img.width * scale;
          const height = img.height * scale;

          // キャンバスサイズを設定（高解像度ディスプレイ対応）
          const dpr = window.devicePixelRatio || 1;
          canvas.width = width * dpr;
          canvas.height = height * dpr;
          canvas.style.width = width + "px";
          canvas.style.height = height + "px";
          ctx.scale(dpr, dpr);

          // 画像を描画
          ctx.drawImage(img, 0, 0, width, height);

          // 画像をPNG形式で保存（高画質）
          const dataUrl = canvas.toDataURL("image/png");
          currentArea.querySelector(
            ".clickable-area-text"
          ).innerHTML = `<img src="${dataUrl}" alt="アイコン" style="width:100%;height:100%;object-fit:contain;">`;
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  });

  generateButton.addEventListener("click", () => {
    const baseImage = document.getElementById("baseImage");
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // 高解像度対応
    const dpr = window.devicePixelRatio || 1;
    canvas.width = baseImage.width * dpr;
    canvas.height = baseImage.height * dpr;
    ctx.scale(dpr, dpr);

    // ベース画像を描画
    ctx.drawImage(baseImage, 0, 0, canvas.width / dpr, canvas.height / dpr);

    // 各エリアのテキストを描画
    clickableAreas.forEach((area) => {
      const textElement = area.querySelector(".clickable-area-text");
      const x = (parseFloat(area.style.left) / 100) * (canvas.width / dpr);
      const y = (parseFloat(area.style.top) / 100) * (canvas.height / dpr);
      const width = (parseFloat(area.style.width) / 100) * (canvas.width / dpr);
      const height =
        (parseFloat(area.style.height) / 100) * (canvas.height / dpr);

      if (area.id === "icon") {
        const iconImg = textElement.querySelector("img");
        if (iconImg) {
          const aspectRatio = iconImg.naturalWidth / iconImg.naturalHeight;
          let drawWidth = width;
          let drawHeight = height;
          if (width / height > aspectRatio) {
            drawWidth = height * aspectRatio;
          } else {
            drawHeight = width / aspectRatio;
          }
          const drawX = x + (width - drawWidth) / 2;
          const drawY = y + (height - drawHeight) / 2;
          ctx.drawImage(iconImg, drawX, drawY, drawWidth, drawHeight);
        }
      } else {
        const computedStyle = window.getComputedStyle(textElement);
        ctx.font = computedStyle.font;
        ctx.fillStyle = computedStyle.color;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const fontSize = parseFloat(computedStyle.fontSize);
        const lineHeight = parseFloat(computedStyle.lineHeight) / fontSize;

        const lines = textElement.textContent.split("\n");
        const totalTextHeight = lines.length * fontSize * lineHeight;
        let startY = y + height / 2 - totalTextHeight / 2 + fontSize / 2;

        lines.forEach((line, index) => {
          ctx.fillText(
            line,
            x + width / 2,
            startY + index * fontSize * lineHeight
          );
        });
      }
    });

    // 画像をダウンロード
    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = "推し活プロフィール.png";
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
});
