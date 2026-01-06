// 文本处理工具函数
import { marked } from 'marked';
import hljs from 'highlight.js/lib/core';
import cpp from 'highlight.js/lib/languages/cpp';
import javascript from 'highlight.js/lib/languages/javascript';
import python from 'highlight.js/lib/languages/python';
import java from 'highlight.js/lib/languages/java';
import 'highlight.js/styles/github.min.css';

// 注册语言
hljs.registerLanguage('cpp', cpp);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('python', python);
hljs.registerLanguage('java', java);

// 配置 marked 使用 highlight.js
marked.setOptions({
  highlight: function(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(code, { language: lang }).value;
      } catch (err) {
        console.error('Highlight error:', err);
      }
    }
    return hljs.highlightAuto(code).value;
  },
  langPrefix: 'hljs language-',
  breaks: true,      // 转换换行符为<br>标签
  gfm: true,         // 启用GitHub flavored markdown
  pedantic: false,   // 不完全遵循原文档，更宽容
  smartLists: true,  // 使用更智能的列表
  smartypants: false // 不转换引号、破折号等为印刷格式
});

/**
 * 清洗AI模型返回的文本
 * @param {string} text - 需要清洗的文本
 * @returns {string} - 清洗后的文本
 */
export const cleanModelText = (text) => {
  if (!text) return '';
  
  // 移除首尾空格和换行
  let cleanedText = text.trim();
  
  // 移除常见的格式问题
  cleanedText = cleanedText
    // 保留换行符用于markdown渲染
    .replace(/\r\n/g, '\n')  // 统一换行符
    .replace(/\r/g, '\n')     // 统一换行符
    // 移除多余的连续空行（保留最多2个）
    .replace(/\n{3,}/g, '\n\n')
    // 修复可能的markdown格式问题
    .replace(/([^\\])\*([^*]+)\*([^*])/g, '$1*$2*$3')  // 修复斜体格式
    .replace(/([^\\])\*\*([^*]+)\*\*([^*])/g, '$1**$2**$3')  // 修复粗体格式
    .replace(/([^\\])~~([^~]+)~~([^~])/g, '$1~~$2~~$3')  // 修复删除线格式
    // 修复代码块格式
    .replace(/```(\w*)\s*\n\s*\n/g, '```\$1\n')  // 移除代码块开始后的空行
    .replace(/\s*```\s*\n\s*```/g, '```\n')      // 修复连续的代码块标记
    // 修复列表格式
    .replace(/^\s*([*+-])\s*\n\s*([^\n])/gm, '$1 $2')  // 修复列表项后的空行
    .replace(/^\s*(\d+)\.\s*\n\s*([^\n])/gm, '$1. $2'); // 修复数字列表项后的空行
  
  return cleanedText;
};

/**
 * 将文本转换为HTML（使用markdown渲染）
 * @param {string} text - 需要转换的文本
 * @returns {string} - 转换后的HTML
 */
export const textToHtml = (text) => {
  if (!text) return '';
  
  // 先清洗文本
  const cleanedText = cleanModelText(text);
  
  // 使用marked将markdown转换为HTML
  const html = marked(cleanedText);
  
  return html;
};

/**
 * 安全地将HTML插入到DOM中（防止XSS攻击）
 * @param {string} html - 需要处理的HTML
 * @returns {string} - 处理后的安全HTML
 */
export const sanitizeHtml = (html) => {
  if (!html) return '';
  
  // 移除危险的HTML标签和属性
  return html
    // 移除script标签
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    // 移除iframe标签
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
    // 移除事件属性
    .replace(/on\w+="[^"]*"/gi, '')
    // 移除javascript:协议
    .replace(/javascript:/gi, '')
    // 移除style标签和属性
    .replace(/<style[^>]*>.*?<\/style>/gi, '')
    .replace(/style="[^"]*"/gi, '');
};

/**
 * 渲染文本为安全的HTML（结合文本清洗、markdown渲染和HTML sanitize）
 * @param {string} text - 需要渲染的文本
 * @returns {string} - 渲染后的安全HTML
 */
export const renderText = (text) => {
  const html = textToHtml(text);
  return sanitizeHtml(html);
};