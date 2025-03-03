import CryptoJS from 'https://cdn.jsdelivr.net/npm/crypto-js@4.2.0/+esm';
import FileSaver from 'https://cdn.jsdelivr.net/npm/file-saver@2.0.5/+esm';
import JSZip from 'https://cdn.jsdelivr.net/npm/jszip@3.10.1/+esm';

// Use FileSaver's saveAs function
const saveAs = FileSaver.saveAs;

// DOM elements
const fileInput = document.getElementById('fileInput');
const directoryInput = document.getElementById('directoryInput');
const selectFile = document.getElementById('selectFile');
const selectDirectory = document.getElementById('selectDirectory');
const dropArea = document.getElementById('dropArea');
const fileListContainer = document.getElementById('fileListContainer');
const fileList = document.getElementById('fileList');
const fileCount = document.getElementById('fileCount');
const fileInfo = document.getElementById('fileInfo');
const originalHash = document.getElementById('originalHash');
const modifyBtn = document.getElementById('modifyBtn');
const modifyAllBtn = document.getElementById('modifyAllBtn');
const modifiedHash = document.getElementById('modifiedHash');
const downloadBtn = document.getElementById('downloadBtn');
const downloadAllBtn = document.getElementById('downloadAllBtn');
const status = document.getElementById('status');
const progressContainer = document.getElementById('progressContainer');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');
const batchResults = document.getElementById('batchResults');
const resultsList = document.getElementById('resultsList');
const previewContainer = document.getElementById('previewContainer');
const batchPreviewContainer = document.getElementById('batchPreviewContainer');
const previewContent = document.getElementById('previewContent');

// File type filter elements
const allTypesCheckbox = document.getElementById('allTypes');
const fileTypeCheckboxes = document.querySelectorAll('input[name="fileType"]');
const customExtensionInput = document.getElementById('customExtension');
const addCustomTypeBtn = document.getElementById('addCustomType');
const customTypesList = document.getElementById('customTypesList');

// Modification options
const appendData = document.getElementById('appendData');
const appendText = document.getElementById('appendText');
const changeBytes = document.getElementById('changeBytes');
const bytePosition = document.getElementById('bytePosition');
const byteValue = document.getElementById('byteValue');

// Variables to store file data
let originalFile = null;
let modifiedFile = null;
let selectedFiles = [];
let modifiedFiles = [];
let currentFileIndex = 0;
let modifiedFileData = null;
let customFileTypes = [];
let filteredFiles = [];

// File type definitions
const fileTypeMap = {
  image: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'tiff', 'ico'],
  text: ['txt', 'md', 'csv', 'json', 'xml', 'log', 'ini', 'cfg', 'conf'],
  document: ['doc', 'docx', 'pdf', 'odt', 'rtf', 'tex', 'ppt', 'pptx', 'xls', 'xlsx'],
  audio: ['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a', 'wma'],
  video: ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm'],
  archive: ['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz'],
  code: ['js', 'ts', 'html', 'css', 'scss', 'less', 'php', 'py', 'java', 'c', 'cpp', 'cs', 'go', 'rb', 'pl', 'sh', 'bat']
};

// Toggle between file and directory selection
selectFile.addEventListener('change', () => {
  if (selectFile.checked) {
    fileListContainer.style.display = 'none';
    modifyBtn.style.display = 'block';
    modifyAllBtn.style.display = 'none';
    downloadBtn.style.display = 'block';
    downloadAllBtn.style.display = 'none';
    batchResults.style.display = 'none';
    previewContainer.style.display = 'none';
    batchPreviewContainer.style.display = 'none';
    resetUI();
  }
});

selectDirectory.addEventListener('change', () => {
  if (selectDirectory.checked) {
    fileListContainer.style.display = 'block';
    modifyBtn.style.display = 'none';
    modifyAllBtn.style.display = 'block';
    downloadBtn.style.display = 'none';
    downloadAllBtn.style.display = 'block';
    previewContainer.style.display = 'none';
    batchPreviewContainer.style.display = 'block';
    resetUI();
  }
});

// Set up drag and drop functionality
dropArea.addEventListener('click', () => {
  if (selectFile.checked) {
    fileInput.click();
  } else {
    directoryInput.click();
  }
});

// Drag and drop events
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
  dropArea.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
  dropArea.addEventListener(eventName, () => {
    dropArea.classList.add('active');
  }, false);
});

['dragleave', 'drop'].forEach(eventName => {
  dropArea.addEventListener(eventName, () => {
    dropArea.classList.remove('active');
  }, false);
});

dropArea.addEventListener('drop', handleDrop, false);

// Handle dropped files
async function handleDrop(e) {
  const items = e.dataTransfer.items;
  
  if (items.length === 0) return;
  
  // Check if we're dropping a directory or files
  if (items[0].webkitGetAsEntry && items[0].webkitGetAsEntry().isDirectory) {
    // Directory drop
    selectDirectory.checked = true;
    fileListContainer.style.display = 'block';
    modifyBtn.style.display = 'none';
    modifyAllBtn.style.display = 'block';
    downloadBtn.style.display = 'none';
    downloadAllBtn.style.display = 'block';
    previewContainer.style.display = 'none';
    batchPreviewContainer.style.display = 'block';
    
    // Process directory entries
    const entries = Array.from(items).map(item => item.webkitGetAsEntry());
    const files = await getAllFilesFromEntries(entries);
    
    if (files.length > 0) {
      handleMultipleFiles(files);
    }
  } else {
    // Single or multiple files drop
    const files = Array.from(e.dataTransfer.files);
    
    if (files.length === 1) {
      // Single file
      selectFile.checked = true;
      fileListContainer.style.display = 'none';
      modifyBtn.style.display = 'block';
      modifyAllBtn.style.display = 'none';
      downloadBtn.style.display = 'block';
      downloadAllBtn.style.display = 'none';
      batchResults.style.display = 'none';
      batchPreviewContainer.style.display = 'none';
      
      handleSingleFile(files[0]);
    } else if (files.length > 1) {
      // Multiple files
      selectDirectory.checked = true;
      fileListContainer.style.display = 'block';
      modifyBtn.style.display = 'none';
      modifyAllBtn.style.display = 'block';
      downloadBtn.style.display = 'none';
      downloadAllBtn.style.display = 'block';
      previewContainer.style.display = 'none';
      batchPreviewContainer.style.display = 'block';
      
      handleMultipleFiles(files);
    }
  }
}

// Recursively get all files from directory entries
async function getAllFilesFromEntries(entries) {
  const files = [];
  
  for (const entry of entries) {
    if (entry.isFile) {
      const file = await getFileFromEntry(entry);
      files.push(file);
    } else if (entry.isDirectory) {
      const dirFiles = await getFilesFromDirectory(entry);
      files.push(...dirFiles);
    }
  }
  
  return files;
}

// Get a file from a file entry
function getFileFromEntry(entry) {
  return new Promise((resolve) => {
    entry.file(file => {
      resolve(file);
    });
  });
}

// Get all files from a directory entry
function getFilesFromDirectory(dirEntry) {
  return new Promise((resolve) => {
    const dirReader = dirEntry.createReader();
    const allFiles = [];
    
    // Read all entries in the directory
    function readEntries() {
      dirReader.readEntries(async (entries) => {
        if (entries.length === 0) {
          // No more entries, resolve with all files
          resolve(allFiles);
        } else {
          // Process this batch of entries
          const files = await getAllFilesFromEntries(entries);
          allFiles.push(...files);
          
          // Continue reading
          readEntries();
        }
      });
    }
    
    readEntries();
  });
}

// Calculate MD5 hash from ArrayBuffer
function calculateMD5(arrayBuffer) {
  const wordArray = CryptoJS.lib.WordArray.create(arrayBuffer);
  const hash = CryptoJS.MD5(wordArray).toString();
  return hash;
}

// Convert string to ArrayBuffer
function stringToArrayBuffer(str) {
  const encoder = new TextEncoder();
  return encoder.encode(str).buffer;
}

// Convert hex string to byte
function hexToByte(hex) {
  return parseInt(hex, 16);
}

// Get file extension
function getFileExtension(filename) {
  return filename.split('.').pop().toLowerCase();
}

// Check if file matches selected file types
function fileMatchesSelectedTypes(file) {
  // If all types are selected, return true
  if (allTypesCheckbox.checked) {
    return true;
  }
  
  const extension = getFileExtension(file.name);
  
  // Check custom file types
  if (customFileTypes.includes(extension)) {
    return true;
  }
  
  // Check if file matches any of the selected types
  for (const checkbox of fileTypeCheckboxes) {
    if (checkbox.checked) {
      const fileType = checkbox.value;
      if (fileTypeMap[fileType] && fileTypeMap[fileType].includes(extension)) {
        return true;
      }
    }
  }
  
  return false;
}

// Filter files based on selected file types
function filterFiles() {
  filteredFiles = selectedFiles.filter(file => fileMatchesSelectedTypes(file));
  
  // Update file list display
  updateFileList();
  
  // Update file count
  fileCount.textContent = `${filteredFiles.length} (从 ${selectedFiles.length} 个文件中筛选)`;
  
  // Enable/disable modify all button
  modifyAllBtn.disabled = filteredFiles.length === 0;
}

// Update file list display
function updateFileList() {
  fileList.innerHTML = '';
  
  filteredFiles.forEach((file, index) => {
    const fileItem = document.createElement('div');
    fileItem.className = 'file-item';
    
    // Get file type for display
    const extension = getFileExtension(file.name);
    let fileTypeLabel = '未知';
    
    for (const [type, extensions] of Object.entries(fileTypeMap)) {
      if (extensions.includes(extension)) {
        // Translate file type labels to Chinese
        const typeTranslations = {
          'image': '图片',
          'text': '文本',
          'document': '文档',
          'audio': '音频',
          'video': '视频',
          'archive': '压缩包',
          'code': '代码'
        };
        fileTypeLabel = typeTranslations[type] || type;
        break;
      }
    }
    
    fileItem.innerHTML = `
      ${file.name} <span class="file-type-badge">${fileTypeLabel}</span>
    `;
    fileItem.dataset.index = index;
    fileItem.addEventListener('click', () => selectFileFromList(index));
    fileList.appendChild(fileItem);
  });
}

// Handle a single file selection
function handleSingleFile(file) {
  if (!file) {
    resetUI();
    return;
  }

  originalFile = file;
  
  // Display file info
  fileInfo.innerHTML = `
    <p><strong>名称:</strong> ${file.name}</p>
    <p><strong>大小:</strong> ${(file.size / 1024).toFixed(2)} KB</p>
    <p><strong>类型:</strong> ${file.type || '未知'}</p>
  `;
  
  // Calculate and display original hash
  file.arrayBuffer().then(arrayBuffer => {
    const hash = calculateMD5(arrayBuffer);
    originalHash.textContent = `原始 MD5: ${hash}`;
    modifyBtn.disabled = false;
    status.textContent = '';
    status.className = 'status';
  }).catch(error => {
    console.error('计算哈希时出错:', error);
    status.textContent = '计算哈希时出错: ' + error.message;
    status.className = 'status error';
  });
}

// Handle multiple files selection
function handleMultipleFiles(files) {
  if (files.length === 0) {
    resetUI();
    return;
  }
  
  selectedFiles = files;
  filteredFiles = [...files]; // Initialize filtered files with all files
  
  fileCount.textContent = files.length;
  
  // Display file list
  updateFileList();
  
  modifyAllBtn.disabled = false;
  status.textContent = '';
  status.className = 'status';
}

// Display file information and calculate original hash for single file
fileInput.addEventListener('change', (event) => {
  if (event.target.files.length > 0) {
    handleSingleFile(event.target.files[0]);
  }
});

// Handle directory selection
directoryInput.addEventListener('change', (event) => {
  if (event.target.files.length > 0) {
    handleMultipleFiles(Array.from(event.target.files));
  }
});

// Select a file from the list
function selectFileFromList(index) {
  const fileItems = fileList.querySelectorAll('.file-item');
  fileItems.forEach(item => item.classList.remove('selected'));
  
  const selectedItem = fileList.querySelector(`[data-index="${index}"]`);
  if (selectedItem) {
    selectedItem.classList.add('selected');
  }
  
  originalFile = filteredFiles[index];
  currentFileIndex = index;
  
  // Display file info
  fileInfo.innerHTML = `
    <p><strong>名称:</strong> ${originalFile.name}</p>
    <p><strong>大小:</strong> ${(originalFile.size / 1024).toFixed(2)} KB</p>
    <p><strong>类型:</strong> ${originalFile.type || '未知'}</p>
  `;
  
  // Calculate and display original hash
  originalFile.arrayBuffer().then(arrayBuffer => {
    const hash = calculateMD5(arrayBuffer);
    originalHash.textContent = `原始 MD5: ${hash}`;
  }).catch(error => {
    console.error('计算哈希时出错:', error);
    status.textContent = '计算哈希时出错: ' + error.message;
    status.className = 'status error';
  });
  
  // If this file has been modified, show its preview
  const modifiedFile = modifiedFiles.find(mf => mf.originalFile === originalFile);
  if (modifiedFile) {
    showFilePreview(modifiedFile.modifiedFile, modifiedFile.modifiedArray, modifiedFile.changedPosition);
  } else {
    previewContainer.style.display = 'none';
  }
}

// Determine file type for preview
function getFileType(file) {
  // Check by MIME type
  if (file.type) {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('text/')) return 'text';
    if (file.type.includes('json')) return 'text';
    if (file.type.includes('javascript')) return 'text';
    if (file.type.includes('css')) return 'text';
    if (file.type.includes('html')) return 'text';
    if (file.type.includes('xml')) return 'text';
  }
  
  // Check by file extension
  const ext = file.name.split('.').pop().toLowerCase();
  const textExtensions = ['txt', 'md', 'js', 'ts', 'html', 'css', 'json', 'xml', 'csv', 'log'];
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
  
  if (textExtensions.includes(ext)) return 'text';
  if (imageExtensions.includes(ext)) return 'image';
  
  // Default to binary for unknown types
  return 'binary';
}

// Show file preview
async function showFilePreview(file, modifiedArray, changedPosition) {
  previewContainer.style.display = 'block';
  previewContent.innerHTML = '';
  
  const fileType = getFileType(file);
  
  if (fileType === 'image') {
    // Image preview
    const url = URL.createObjectURL(file);
    const img = document.createElement('img');
    img.src = url;
    img.className = 'preview-image';
    previewContent.appendChild(img);
    
    // Clean up object URL when done
    img.onload = () => URL.revokeObjectURL(url);
  } else if (fileType === 'text') {
    // Text preview
    try {
      const text = await file.text();
      const pre = document.createElement('pre');
      pre.className = 'preview-text';
      pre.textContent = text;
      previewContent.appendChild(pre);
    } catch (error) {
      previewContent.textContent = '加载文本预览时出错: ' + error.message;
    }
  } else {
    // Binary preview (hex view)
    const hexView = document.createElement('div');
    hexView.className = 'preview-binary';
    
    // Show first 256 bytes
    const bytesToShow = Math.min(modifiedArray.length, 256);
    for (let i = 0; i < bytesToShow; i++) {
      const span = document.createElement('span');
      span.textContent = modifiedArray[i].toString(16).padStart(2, '0').toUpperCase();
      
      // Highlight modified byte
      if (i === changedPosition) {
        span.className = 'modified';
        span.title = '已修改的字节';
      }
      
      hexView.appendChild(span);
    }
    
    if (modifiedArray.length > 256) {
      const ellipsis = document.createElement('div');
      ellipsis.textContent = `... 还有 ${modifiedArray.length - 256} 个字节`;
      ellipsis.style.marginTop = '10px';
      ellipsis.style.textAlign = 'center';
      previewContent.appendChild(hexView);
      previewContent.appendChild(ellipsis);
    } else {
      previewContent.appendChild(hexView);
    }
  }
}

// Modify a single file
async function modifyFile(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    let modifiedArray;
    let changedPosition = -1;
    
    if (appendData.checked) {
      // Append data to the end of the file
      const textToAppend = appendText.value;
      const appendBuffer = stringToArrayBuffer(textToAppend);
      const appendArray = new Uint8Array(appendBuffer);
      
      modifiedArray = new Uint8Array(uint8Array.length + appendArray.length);
      modifiedArray.set(uint8Array);
      modifiedArray.set(appendArray, uint8Array.length);
      changedPosition = uint8Array.length; // Position where append starts
    } else if (changeBytes.checked) {
      // Change specific byte
      const position = parseInt(bytePosition.value);
      const newValue = hexToByte(byteValue.value);
      
      if (position >= uint8Array.length) {
        throw new Error(`位置 ${position} 超出范围 (文件大小: ${uint8Array.length} 字节)`);
      }
      
      modifiedArray = new Uint8Array(arrayBuffer);
      modifiedArray[position] = newValue;
      changedPosition = position;
    }
    
    // Calculate new hash
    const originalHash = calculateMD5(arrayBuffer);
    const newHash = calculateMD5(modifiedArray.buffer);
    
    // Create modified file for download
    const modifiedBlob = new Blob([modifiedArray], { type: file.type });
    const modifiedFile = new File([modifiedBlob], file.name, { 
      type: file.type,
      lastModified: new Date().getTime()
    });
    
    return {
      originalFile: file,
      modifiedFile: modifiedFile,
      modifiedArray: modifiedArray,
      originalHash: originalHash,
      newHash: newHash,
      changedPosition: changedPosition,
      success: true
    };
  } catch (error) {
    console.error('修改文件时出错:', error);
    return {
      originalFile: file,
      success: false,
      error: error.message
    };
  }
}

// Modify single file button click
modifyBtn.addEventListener('click', async () => {
  if (!originalFile) return;
  
  try {
    const result = await modifyFile(originalFile);
    
    if (result.success) {
      modifiedFile = result.modifiedFile;
      modifiedFileData = result;
      modifiedHash.textContent = `修改后 MD5: ${result.newHash}`;
      downloadBtn.disabled = false;
      
      // Automatically apply the modification to the original file
      originalFile = result.modifiedFile;
      
      status.textContent = appendData.checked 
        ? `已在文件末尾追加 "${appendText.value}"。MD5 从 ${result.originalHash} 变为 ${result.newHash}` 
        : `已将位置 ${bytePosition.value} 的字节修改为 0x${byteValue.value}。MD5 从 ${result.originalHash} 变为 ${result.newHash}`;
      status.className = 'status success';
      
      // Show preview
      showFilePreview(result.modifiedFile, result.modifiedArray, result.changedPosition);
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error('修改文件时出错:', error);
    status.textContent = '修改文件时出错: ' + error.message;
    status.className = 'status error';
  }
});

// Modify all files button click
modifyAllBtn.addEventListener('click', async () => {
  if (filteredFiles.length === 0) return;
  
  modifiedFiles = [];
  resultsList.innerHTML = '';
  progressContainer.style.display = 'block';
  batchResults.style.display = 'block';
  modifyAllBtn.disabled = true;
  downloadAllBtn.disabled = true;
  
  let successCount = 0;
  let failCount = 0;
  
  for (let i = 0; i < filteredFiles.length; i++) {
    const file = filteredFiles[i];
    const result = await modifyFile(file);
    
    if (result.success) {
      modifiedFiles.push(result);
      successCount++;
      
      // Replace the original file with the modified one
      filteredFiles[i] = result.modifiedFile;
      
      // Add to results list
      const resultItem = document.createElement('div');
      resultItem.className = 'result-item';
      resultItem.innerHTML = `
        <span>${file.name}</span>
        <span>✅ MD5: ${result.originalHash} → ${result.newHash}</span>
      `;
      resultItem.addEventListener('click', () => {
        selectFileFromList(i);
        showFilePreview(result.modifiedFile, result.modifiedArray, result.changedPosition);
      });
      resultsList.appendChild(resultItem);
    } else {
      failCount++;
      
      // Add to results list
      const resultItem = document.createElement('div');
      resultItem.className = 'result-item';
      resultItem.innerHTML = `
        <span>${file.name}</span>
        <span>❌ 错误: ${result.error}</span>
      `;
      resultsList.appendChild(resultItem);
    }
    
    // Update progress
    const progress = Math.round(((i + 1) / filteredFiles.length) * 100);
    progressBar.style.width = `${progress}%`;
    progressText.textContent = `${progress}% (${i + 1}/${filteredFiles.length})`;
  }
  
  status.textContent = `成功修改 ${successCount} 个文件。${failCount} 个文件失败。`;
  status.className = failCount > 0 ? 'status error' : 'status success';
  
  downloadAllBtn.disabled = modifiedFiles.length === 0;
  modifyAllBtn.disabled = false;
  
  // If we have results, show the first one
  if (modifiedFiles.length > 0) {
    selectFileFromList(0); // Use index 0 since we've replaced the files in the array
  }
});

// Download modified file
downloadBtn.addEventListener('click', () => {
  if (modifiedFile) {
    saveAs(modifiedFile, modifiedFile.name);
  }
});

// Download all modified files as ZIP
downloadAllBtn.addEventListener('click', async () => {
  if (modifiedFiles.length === 0) return;
  
  const zip = new JSZip();
  
  // Add all modified files to the zip
  modifiedFiles.forEach(result => {
    zip.file(result.modifiedFile.name, result.modifiedFile);
  });
  
  // Generate and download the zip
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  saveAs(zipBlob, 'modified_files.zip');
});

// File type filter events
allTypesCheckbox.addEventListener('change', () => {
  // If "All Types" is checked, disable other checkboxes
  fileTypeCheckboxes.forEach(checkbox => {
    checkbox.disabled = allTypesCheckbox.checked;
    if (allTypesCheckbox.checked) {
      checkbox.checked = false;
    }
  });
  
  // Filter files
  filterFiles();
});

// Individual file type checkbox events
fileTypeCheckboxes.forEach(checkbox => {
  checkbox.addEventListener('change', () => {
    // If any checkbox is checked, uncheck "All Types"
    if (checkbox.checked) {
      allTypesCheckbox.checked = false;
    }
    
    // If no checkboxes are checked, check "All Types"
    const anyChecked = Array.from(fileTypeCheckboxes).some(cb => cb.checked);
    if (!anyChecked) {
      allTypesCheckbox.checked = true;
      fileTypeCheckboxes.forEach(cb => {
        cb.disabled = true;
      });
    }
    
    // Filter files
    filterFiles();
  });
});

// Add custom file type
addCustomTypeBtn.addEventListener('click', () => {
  const extension = customExtensionInput.value.trim().toLowerCase();
  
  if (extension && !customFileTypes.includes(extension)) {
    customFileTypes.push(extension);
    
    // Create a badge for the custom type
    const badge = document.createElement('span');
    badge.className = 'file-type-badge';
    badge.style.margin = '5px';
    badge.style.cursor = 'pointer';
    badge.textContent = extension;
    badge.title = '点击移除';
    
    // Add click event to remove the custom type
    badge.addEventListener('click', () => {
      customTypesList.removeChild(badge);
      customFileTypes = customFileTypes.filter(type => type !== extension);
      filterFiles();
    });
    
    customTypesList.appendChild(badge);
    
    // Clear input
    customExtensionInput.value = '';
    
    // Uncheck "All Types" if it's checked
    if (allTypesCheckbox.checked) {
      allTypesCheckbox.checked = false;
      fileTypeCheckboxes.forEach(cb => {
        cb.disabled = false;
      });
    }
    
    // Filter files
    filterFiles();
  }
});

// Toggle between append and change bytes options
appendData.addEventListener('change', () => {
  if (appendData.checked) {
    document.getElementById('appendOptions').style.display = 'block';
    document.getElementById('byteOptions').style.display = 'none';
  }
});

changeBytes.addEventListener('change', () => {
  if (changeBytes.checked) {
    document.getElementById('appendOptions').style.display = 'none';
    document.getElementById('byteOptions').style.display = 'block';
  }
});

// Reset UI
function resetUI() {
  fileInfo.textContent = '未选择文件';
  originalHash.textContent = '';
  modifiedHash.textContent = '';
  modifyBtn.disabled = true;
  modifyAllBtn.disabled = true;
  downloadBtn.disabled = true;
  downloadAllBtn.disabled = true;
  status.textContent = '';
  status.className = 'status';
  progressContainer.style.display = 'none';
  progressBar.style.width = '0%';
  progressText.textContent = '0%';
  previewContainer.style.display = 'none';
  originalFile = null;
  modifiedFile = null;
  modifiedFileData = null;
  modifiedFiles = [];
  
  if (selectFile.checked) {
    fileInput.value = '';
  } else {
    directoryInput.value = '';
    fileList.innerHTML = '';
    fileCount.textContent = '0';
  }
}