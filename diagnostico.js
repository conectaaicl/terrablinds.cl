console.log('🔍 DIAGNÓSTICO TERRABLINDS - Ejecuta esto en la consola del navegador');
console.log('='.repeat(60));

// 1. Verificar si CartContext está disponible
console.log('\n1️⃣ VERIFICANDO CARTCONTEXT:');
try {
    const cartData = localStorage.getItem('terrablinds_cart');
    console.log('   Cart data:', cartData || 'VACÍO');
} catch (e) {
    console.error('   ERROR:', e);
}

// 2. Verificar el botón Comprar
console.log('\n2️⃣ VERIFICANDO BOTÓN COMPRAR:');
const buttons = document.querySelectorAll('button');
buttons.forEach((btn, i) => {
    if (btn.textContent.includes('Comprar')) {
        console.log(`   Botón ${i}:`, btn.textContent.trim());
        console.log('   Classes:', btn.className);
        console.log('   Disabled:', btn.disabled);
        console.log('   onClick:', btn.onclick ? 'SÍ' : 'NO');
    }
});

// 3. Verificar colores de Tailwind
console.log('\n3️⃣ VERIFICANDO COLORES TAILWIND:');
const testDiv = document.createElement('div');
testDiv.className = 'bg-primary-600';
document.body.appendChild(testDiv);
const color = window.getComputedStyle(testDiv).backgroundColor;
console.log('   bg-primary-600 color:', color);
document.body.removeChild(testDiv);

// 4. Verificar ruta actual
console.log('\n4️⃣ INFORMACIÓN DE RUTA:');
console.log('   URL actual:', window.location.href);
console.log('   Pathname:', window.location.pathname);

console.log('\n' + '='.repeat(60));
console.log('📋 COPIA TODO ESTO Y ENVÍAMELO');
