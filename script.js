const fs = require('fs');
let loginPage = fs.readFileSync('src/app/login/page.tsx', 'utf8');
const oldHeaderRegex = /<div className="text-center mb-8">[\s\S]*?<h1 className="text-4xl font-bold tracking-tight mb-2">[\s\S]*?<span className="text-foreground">LO<\/span>[\s\S]*?<span className="text-primary bg-primary\/10 px-1 rounded">U<\/span>[\s\S]*?<span className="text-foreground">NGE<\/span>[\s\S]*?<\/h1>[\s\S]*?<p className="text-sm font-medium tracking-widest text-muted-foreground uppercase">For You<\/p>[\s\S]*?<p className="mt-4 text-sm text-muted-foreground">Fa.a login para acessar o sistema\.<\/p>[\s\S]*?<\/div>/;

const newHeader = `<div className="text-center mb-8 flex flex-col items-center">
            <img src="/custom-logo-login.PNG" alt="Lounge For You" className="h-24 object-contain mb-4" />
            <p className="mt-4 text-sm text-muted-foreground">Faça login para acessar o sistema.</p>
          </div>`;

if (oldHeaderRegex.test(loginPage)) {
    loginPage = loginPage.replace(oldHeaderRegex, newHeader);
    fs.writeFileSync('src/app/login/page.tsx', loginPage);
    console.log('Login page updated.');
} else {
    console.log('Regex did not match login page.');
}

fs.copyFileSync('public/custom-favicon.PNG', 'src/app/icon.png');
console.log('Favicon replaced.');
