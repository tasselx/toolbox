// 百家姓加密映射表
const encryptMapping = {
    '0': '赵', '1': '钱', '2': '孙', '3': '李', '4': '周', '5': '吴', '6': '郑', '7': '王', '8': '冯', '9': '陈',
    'a': '褚', 'b': '卫', 'c': '蒋', 'd': '沈', 'e': '韩', 'f': '杨', 'g': '朱', 'h': '秦', 'i': '尤', 'j': '许',
    'k': '何', 'l': '吕', 'm': '施', 'n': '张', 'o': '孔', 'p': '曹', 'q': '严', 'r': '华', 's': '金', 't': '魏',
    'u': '陶', 'v': '姜', 'w': '戚', 'x': '谢', 'y': '邹', 'z': '喻',
    'A': '福', 'B': '水', 'C': '窦', 'D': '章', 'E': '云', 'F': '苏', 'G': '潘', 'H': '葛', 'I': '奚', 'J': '范',
    'K': '彭', 'L': '郎', 'M': '鲁', 'N': '韦', 'O': '昌', 'P': '马', 'Q': '苗', 'R': '凤', 'S': '花', 'T': '方',
    'U': '俞', 'V': '任', 'W': '袁', 'X': '柳', 'Y': '唐', 'Z': '罗',
    '.': '薛', '-': '伍', '_': '余', '+': '米', '=': '贝', '/': '姚', '?': '孟', '#': '顾', '%': '尹', '&': '江', '*': '钟',
    ' ': '欧', '(': '阮', ')': '夏', '[': '汤', ']': '岑', '{': '廖', '}': '贺', '\\': '嵇', '|': '温', ':': '萧', ';': '毕',
    ',': '郝', '<': '安', '>': '常', '@': '乐', '!': '时', '$': '傅', '^': '卓', '`': '康', '~': '艾', '"': '计'
};

// 生成解密映射表
const decryptMapping = Object.fromEntries(
    Object.entries(encryptMapping).map(([key, value]) => [value, key])
);

// DOM 元素
const inputText = document.getElementById('inputText');
const outputText = document.getElementById('outputText');
const encryptBtn = document.getElementById('encryptBtn');
const decryptBtn = document.getElementById('decryptBtn');
const clearInput = document.getElementById('clearInput');
const clearOutput = document.getElementById('clearOutput');
const copyInput = document.getElementById('copyInput');
const copyOutput = document.getElementById('copyOutput');

/**
 * 使用百家姓加密文本
 * @param {string} text - 要加密的文本
 * @returns {string} - 加密后的文本
 */
function baijiaxingEncrypt(text) {
    return text.split('').map(char => encryptMapping[char] || char).join('');
}

/**
 * 解密百家姓加密的文本
 * @param {string} encryptedText - 加密后的文本
 * @returns {string} - 解密后的文本
 */
function baijiaxingDecrypt(encryptedText) {
    return encryptedText.split('').map(char => decryptMapping[char] || char).join('');
}

// 复制文本到剪贴板
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        console.error('复制失败:', err);
        return false;
    }
}

// 事件监听器
encryptBtn.addEventListener('click', () => {
    const text = inputText.value;
    outputText.value = baijiaxingEncrypt(text);
});

decryptBtn.addEventListener('click', () => {
    const text = inputText.value;
    outputText.value = baijiaxingDecrypt(text);
});

clearInput.addEventListener('click', () => {
    inputText.value = '';
    inputText.focus();
});

clearOutput.addEventListener('click', () => {
    outputText.value = '';
});

copyInput.addEventListener('click', async () => {
    const success = await copyToClipboard(inputText.value);
    if (success) {
        copyInput.textContent = '已复制';
        setTimeout(() => {
            copyInput.textContent = '复制';
        }, 2000);
    }
});

copyOutput.addEventListener('click', async () => {
    const success = await copyToClipboard(outputText.value);
    if (success) {
        copyOutput.textContent = '已复制';
        setTimeout(() => {
            copyOutput.textContent = '复制';
        }, 2000);
    }
});

// 添加快捷键支持
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter: 加密
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        encryptBtn.click();
    }
    // Ctrl/Cmd + Shift + Enter: 解密
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && e.shiftKey) {
        decryptBtn.click();
    }
});