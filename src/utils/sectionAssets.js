const sectionAssets = {
    1: { logo: '/images/seccionesLogo/logo1.jpg', banner: '/images/seccionesBanner/banner1.png' },
    2: { logo: '/images/seccionesLogo/logo2.jpg', banner: '/images/seccionesBanner/banner2.jpg' },
    3: { logo: '/images/seccionesLogo/logo3.jpg', banner: '/images/seccionesBanner/banner3.jpg' },
    4: { logo: '/images/seccionesLogo/logo4.jpg', banner: '/images/seccionesBanner/banner4.jpg' },
    5: { logo: '/images/seccionesLogo/logo5.jpg', banner: '/images/seccionesBanner/banner5.jpg' },
    6: { logo: '/images/seccionesLogo/logo6.jpg', banner: '/images/seccionesBanner/banner6.jpg' },
    33: { logo: '/images/seccionesLogo/logo33.jpeg', banner: '/images/seccionesBanner/banner33.jpg' }
};

const defaults = {
    logo: '/images/seccionesLogo/logoD.png',
    banner: '/images/seccionesBanner/bannerD.jpg'
};

export const getSectionAssets = (idSeccion) => sectionAssets[Number(idSeccion)] || defaults;
