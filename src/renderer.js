const { setupUpload } = require('./src/upload');
const { initCrop, applyCrop, cancelCrop } = require('./src/crop');
const { setupExport } = require('./src/export');
const { saveState, undo, redo } = require('./src/history'); 
const { flipImage } = require('./src/flip'); 
const { setupLayers } = require('./src/layers');
const { removeBackground } = require('./src/remove-bg');
const { setupFilters } = require('./src/filters');
const { setupZoom } = require('./src/zoom');
const { setupText } = require('./src/text');

const imageElement = document.getElementById('editor-image');
const cropBtn = document.getElementById('btn-crop'); 
const mirrorBtn = document.getElementById('btn-mirror'); 
const removeBgBtn = document.getElementById('btn-remove-bg');

const { addLayer } = setupLayers();

setupText(addLayer);

const cropActionContainer = document.createElement('div');
cropActionContainer.style.display = "none";
cropActionContainer.style.gap = "8px"; 
cropActionContainer.style.marginTop = "8px";

const applyCropBtn = document.createElement('button');
applyCropBtn.textContent = "Apply";
applyCropBtn.className = "primary";
applyCropBtn.style.flex = "1";

const cancelCropBtn = document.createElement('button');
cancelCropBtn.textContent = "Cancel";
cancelCropBtn.style.flex = "1";
cancelCropBtn.style.backgroundColor = "#555"; 

cropActionContainer.appendChild(applyCropBtn);
cropActionContainer.appendChild(cancelCropBtn);
cropBtn.parentNode.insertBefore(cropActionContainer, cropBtn.nextSibling);

let isCropping = false;
let isWorking = false;

function lockUI() {
  isWorking = true;
  document.body.style.cursor = 'wait';
}

function unlockUI() {
  isWorking = false;
  document.body.style.cursor = 'default';
  mirrorBtn.style.opacity = "1";
}

function exitCropMode() {
  isCropping = false;
  cropActionContainer.style.display = "none";
}

setupUpload(
  (loadedImageElement) => {
    if (isCropping) cancelCrop();
    exitCropMode();
    setupFilters(loadedImageElement);
  },
  (layerBase64Data) => {
    addLayer(layerBase64Data); 
  }
);

setupExport();
setupZoom();

cropBtn.addEventListener('click', () => {
  if (!imageElement.src || imageElement.src === window.location.href) return; 
  if (isCropping || isWorking) return; 
  
  isCropping = true;
  initCrop(imageElement);
  cropActionContainer.style.display = "flex"; 
});

applyCropBtn.addEventListener('click', () => {
  if (!isCropping) return;
  
  saveState(imageElement); 
  applyCrop(imageElement);
  exitCropMode();
});

cancelCropBtn.addEventListener('click', () => {
  if (!isCropping) return;
  cancelCrop();
  exitCropMode();
});

mirrorBtn.addEventListener('click', () => {
  if (!imageElement.src || imageElement.src === window.location.href) return;
  if (isCropping || isWorking) return;
  
  lockUI(); 
  mirrorBtn.style.opacity = "0.5"; 
  saveState(imageElement);
  
  flipImage(imageElement, unlockUI);
});

removeBgBtn.addEventListener('click', () => {
  if (!imageElement.src || imageElement.src === window.location.href) return;
  if (isCropping || isWorking) return;
  
  saveState(imageElement);
  
  lockUI();
  
  const originalText = removeBgBtn.textContent;
  removeBgBtn.textContent = "Removing AI...";
  removeBgBtn.style.opacity = "0.5";
  
  removeBackground(imageElement, () => {
    unlockUI();
    removeBgBtn.textContent = originalText;
    removeBgBtn.style.opacity = "1";
  });
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && isCropping) {
    cancelCrop();
    exitCropMode();
  }

  if (isCropping || isWorking) return; 

  // Undo
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
    lockUI();
    undo(imageElement, unlockUI);
  }

  // Redo
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'y') {
    lockUI();
    redo(imageElement, unlockUI);
  }
});

// Copyright notice

/* Refloow Photo Studio
 * Copyright (C) 2026  Veljko Vuckovic (Refloow) <legal@refloow.com>
 * Code origin: https://github.com/Refloow/Refloow-Photo-Studio
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
