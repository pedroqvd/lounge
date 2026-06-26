const fs = require('fs');

// 1. Logo.tsx
let logo = fs.readFileSync('src/components/Logo.tsx', 'utf8');
if (!logo.includes("import Image from 'next/image'")) {
  logo = logo.replace("'use client'\n", "'use client'\n\nimport Image from 'next/image'\n");
  logo = logo.replace(
    /<img[\s\S]*?className=\{`object-contain \$\{minimized \? 'w-10 h-10' : 'w-full h-full'\}`\}[\s\S]*?\/>/,
    `<Image src="/custom-logo-login.PNG" alt="Lounge For You" width={160} height={56} className={\`object-contain \${minimized ? 'w-10 h-10' : 'w-full h-full'}\`} priority />`
  );
  fs.writeFileSync('src/components/Logo.tsx', logo, 'utf8');
}

// 2. login/page.tsx
let login = fs.readFileSync('src/app/login/page.tsx', 'utf8');
if (!login.includes("import Image from 'next/image'")) {
  login = login.replace("import { useState } from 'react'", "import { useState } from 'react'\nimport Image from 'next/image'");
  login = login.replace(
    /<img src="\/custom-logo-login\.PNG" alt="Lounge For You" className="w-48 h-auto object-contain mb-4" \/>/,
    `<Image src="/custom-logo-login.PNG" alt="Lounge For You" width={200} height={100} className="w-48 h-auto object-contain mb-4" priority />`
  );
  fs.writeFileSync('src/app/login/page.tsx', login, 'utf8');
}

console.log('Images optimized.');
