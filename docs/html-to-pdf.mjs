import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.join(__dirname, '사업계획서_소리야놀자.html');
const pdfPath = path.join(__dirname, '사업계획서_소리야놀자.pdf');

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();

await page.goto(`file:///${htmlPath.replace(/\\/g, '/')}`, {
  waitUntil: 'networkidle0',
});

await page.pdf({
  path: pdfPath,
  format: 'A4',
  margin: { top: '2.5cm', bottom: '2.5cm', left: '2.5cm', right: '2cm' },
  printBackground: true,
  displayHeaderFooter: true,
  headerTemplate: '<div></div>',
  footerTemplate: '<div style="font-size:9pt; text-align:center; width:100%; color:#666;">- <span class="pageNumber"></span> -</div>',
});

await browser.close();
console.log(`PDF generated: ${pdfPath}`);
