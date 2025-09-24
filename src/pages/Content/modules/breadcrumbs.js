const getBreadcrumbs = (document) => {
    const breadcrumbs = [];
    document.querySelectorAll('#wayfinding-breadcrumbs_feature_div li a').forEach((el) => {
        breadcrumbs.push({
            text: el.innerText.trim(),
            link: el.href,
        });
    });
    return breadcrumbs;
};

const getBreadcrumbsStorefront = (document) => {
    const breadcrumbs = [];
    document.querySelectorAll('nav[class^="Breadcrumbs"] li a').forEach((el) => {
        breadcrumbs.push({
            text: el.innerText.trim(),
            link: el.href,
        });
    });
    return breadcrumbs;
}

const isProductPage = (window) => {
    return window.location.href.includes('/dp/');
};

const queryParams = (window) => {
    const params = {};
    const queryString = window.location.search.substring(1);
    const vars = queryString.split('&');
    vars.forEach((v) => {
        const [key, value] = v.split('=');
        params[decodeURIComponent(key)] = decodeURIComponent(value || '');
    });
    return params;
};

const pathParts = (window) => {
    return window.location.pathname.split('/').filter(part => part);
};

const navTitle = (document) => {
    const titleElement = document.querySelector('#nav-subnav .nav-b');
    return titleElement ? titleElement.innerText.trim() : '';
}

const getPageType = (window) => {
    const path = pathParts(window);
    if (path.includes('dp')) return 'product';
    if (path.includes('s')) return 'search';
    if (path.includes('b')) return 'browse';
    if (path.includes('alm')) return 'amazon-store';
    if (path.includes('stores')) return 'storefront';
    if (path.includes('gp')) return 'account';
    return 'other';
}


export { getBreadcrumbs, isProductPage, queryParams, pathParts, navTitle, getPageType, getBreadcrumbsStorefront };
