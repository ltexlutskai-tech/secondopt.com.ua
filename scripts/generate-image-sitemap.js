const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://secondopt.com.ua';
const IMAGES_DIR = path.join(__dirname, '..', 'images');

const CATEGORY_TITLES = {
  'Одяг':                 'Одяг секонд-хенд гуртом — L-TEX',
  'Взуття':               'Взуття секонд-хенд оптом — L-TEX',
  'Сумки та аксесуари':   'Сумки та аксесуари секонд-хенд — L-TEX',
  'Дім та побут':         'Товари для дому секонд-хенд — L-TEX',
  'Іграшки':              'Іграшки секонд-хенд гуртом — L-TEX',
  'Bric-a-Brac':          'Bric-a-Brac вінтаж антикваріат — L-TEX',
  'Косметика':            'Косметика та парфумерія секонд-хенд — L-TEX',
  'Наш склад та товар':   'Склад L-TEX — секонд-хенд гуртом Луцьк',
  'Головне фото':         'L-TEX секонд-хенд гуртом — склад Луцьк',
};

const SUBPAGES = [
  {
    loc: 'https://secondopt.com.ua/',
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'weekly',
    priority: '1.0'
  },
  {
    loc: 'https://secondopt.com.ua/odyag.html',
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'monthly',
    priority: '0.8',
    imageFolder: 'Одяг'
  },
  {
    loc: 'https://secondopt.com.ua/vzuttya.html',
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'monthly',
    priority: '0.8',
    imageFolder: 'Взуття'
  },
  {
    loc: 'https://secondopt.com.ua/sumky.html',
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'monthly',
    priority: '0.8',
    imageFolder: 'Сумки та аксесуари'
  },
  {
    loc: 'https://secondopt.com.ua/dim-pobut.html',
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'monthly',
    priority: '0.7',
    imageFolder: 'Дім та побут'
  },
  {
    loc: 'https://secondopt.com.ua/igrashky.html',
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'monthly',
    priority: '0.7',
    imageFolder: 'Іграшки'
  },
  {
    loc: 'https://secondopt.com.ua/bric-a-brac.html',
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'monthly',
    priority: '0.7',
    imageFolder: 'Bric-a-Brac'
  },
];

function getImagesForFolder(folder) {
  const folderPath = path.join(IMAGES_DIR, folder);
  if (!fs.existsSync(folderPath)) return [];
  return fs.readdirSync(folderPath)
    .filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f))
    .sort();
}

function getHomepageImages() {
  // Collect images from all categories for the homepage
  const allImages = [];
  for (const [folder, title] of Object.entries(CATEGORY_TITLES)) {
    const folderPath = path.join(IMAGES_DIR, folder);
    if (!fs.existsSync(folderPath)) continue;
    const files = fs.readdirSync(folderPath)
      .filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f))
      .sort();
    for (const file of files) {
      allImages.push({ folder, file, title });
    }
  }
  // Also add root-level images
  const rootFiles = fs.readdirSync(IMAGES_DIR)
    .filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f));
  for (const file of rootFiles) {
    allImages.push({ folder: '', file, title: 'L-TEX секонд-хенд гуртом — склад Луцьк' });
  }
  return allImages;
}

function escapeXml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

function encodeImagePath(folder, file) {
  if (folder) {
    return `${BASE_URL}/images/${encodeURIComponent(folder)}/${encodeURIComponent(file)}`;
  }
  return `${BASE_URL}/images/${encodeURIComponent(file)}`;
}

function generateSitemap() {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
  xml += '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n';

  let totalImages = 0;

  for (const page of SUBPAGES) {
    xml += '  <url>\n';
    xml += `    <loc>${escapeXml(page.loc)}</loc>\n`;
    xml += `    <lastmod>${page.lastmod}</lastmod>\n`;
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    xml += `    <priority>${page.priority}</priority>\n`;

    if (page.loc === 'https://secondopt.com.ua/') {
      // Homepage gets all images
      const images = getHomepageImages();
      for (const img of images) {
        xml += '      <image:image>\n';
        xml += `        <image:loc>${escapeXml(encodeImagePath(img.folder, img.file))}</image:loc>\n`;
        xml += `        <image:title>${escapeXml(img.title)}</image:title>\n`;
        xml += '      </image:image>\n';
        totalImages++;
      }
    } else if (page.imageFolder) {
      const title = CATEGORY_TITLES[page.imageFolder] || page.imageFolder;
      const files = getImagesForFolder(page.imageFolder);
      for (const file of files) {
        xml += '      <image:image>\n';
        xml += `        <image:loc>${escapeXml(encodeImagePath(page.imageFolder, file))}</image:loc>\n`;
        xml += `        <image:title>${escapeXml(title)}</image:title>\n`;
        xml += '      </image:image>\n';
        totalImages++;
      }
    }

    xml += '  </url>\n';
  }

  xml += '</urlset>\n';

  const outputPath = path.join(__dirname, '..', 'sitemap.xml');
  fs.writeFileSync(outputPath, xml, 'utf8');
  console.log(`Sitemap generated: ${outputPath}`);
  console.log(`Total images: ${totalImages}`);
}

generateSitemap();
