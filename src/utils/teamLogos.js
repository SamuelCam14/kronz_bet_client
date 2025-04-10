// src/utils/teamLogos.js

// Mapeo de abreviaturas (en minúsculas, tal como la API)
export const teamLogos = {
    'atl': '/logos/atl.svg',
    'bos': '/logos/bos.svg',
    'bkn': '/logos/bkn.svg', // o 'njn'
    'cha': '/logos/cha.svg', // o 'cho'
    'chi': '/logos/chi.svg',
    'cle': '/logos/cle.svg',
    'dal': '/logos/dal.svg',
    'den': '/logos/den.svg',
    'det': '/logos/det.svg',
    'gsw': '/logos/gsw.svg', // o 'gs'
    'hou': '/logos/hou.svg',
    'ind': '/logos/ind.svg',
    'lac': '/logos/lac.svg',
    'lal': '/logos/lal.svg',
    'mem': '/logos/mem.svg',
    'mia': '/logos/mia.svg',
    'mil': '/logos/mil.svg',
    'min': '/logos/min.svg',
    'nop': '/logos/nop.svg', // o 'noh'
    'nyk': '/logos/nyk.svg',
    'okc': '/logos/okc.svg',
    'orl': '/logos/orl.svg',
    'phi': '/logos/phi.svg',
    'phx': '/logos/phx.svg', // o 'pho'
    'por': '/logos/por.svg',
    'sac': '/logos/sac.svg',
    'sas': '/logos/sas.svg',
    'tor': '/logos/tor.svg',
    'uta': '/logos/uta.svg', // o 'uth'
    'was': '/logos/was.svg',
};

// Función para obtener el logo
export const getLogoSrc = (abbreviation) => {
    if (!abbreviation) return null;
    const lowerCaseAbbr = abbreviation.toLowerCase();
    return teamLogos[lowerCaseAbbr] || null; // Devuelve la ruta o null si no existe
};