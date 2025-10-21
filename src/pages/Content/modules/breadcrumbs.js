export const getBreadcrumbs = (document) => {
    const breadcrumbs = [];
    document
        .querySelectorAll('#wayfinding-breadcrumbs_feature_div li a')
        .forEach((el) => {
            breadcrumbs.push({
                text: el.innerText.trim(),
                link: el.href,
            });
        });
    return breadcrumbs;
};

export const getBreadcrumbsStorefront = (document) => {
    const breadcrumbs = [];
    document
        .querySelectorAll('nav[class^="Breadcrumbs"] li a')
        .forEach((el) => {
            breadcrumbs.push({
                text: el.innerText.trim(),
                link: el.href,
            });
        });
    return breadcrumbs;
};

export const isProductPage = (window) => {
    return window.location.href.includes('/dp/');
};

export const queryParams = (window) => {
    const params = {};
    const queryString = window.location.search.substring(1);
    const vars = queryString.split('&');
    vars.forEach((v) => {
        const [key, value] = v.split('=');
        params[decodeURIComponent(key)] = decodeURIComponent(value || '');
    });
    return params;
};

export const pathParts = (window) => {
    return window.location.pathname.split('/').filter((part) => part);
};

export const navTitle = (document) => {
    const titleElement = document.querySelector('#nav-subnav .nav-b');
    return titleElement ? titleElement.innerText.trim() : '';
};

export const getDepartmentInfo = (document) => {
    const departmentsDiv = document.querySelector('#departments');
    if (departmentsDiv) {
        const deptHeaders = document.querySelectorAll(
            'li[id^="n/"]:not(.s-navigation-indent-2)'
        );
        const chosenDept = departmentsDiv.querySelector('.a-text-bold');
        if (!chosenDept) return [];
        const departments = [];
        deptHeaders.forEach((el) => {
            departments.push({
                text: el.innerText.trim(),
                link: el.querySelector('a') ? el.querySelector('a').href : null,
            });
        });
        return departments;
    } else {
        const deptHeaders = document.querySelectorAll(
            '#n-title~ul li:not(.apb-browse-refinements-indent-2)'
        );
        const chosenDept = document.querySelector('#n-title~ul .a-text-bold');
        if (!chosenDept) return [];
        const departments = [];
        deptHeaders.forEach((el) => {
            departments.push({
                text: el.innerText.trim(),
                link: el.querySelector('a') ? el.querySelector('a').href : null,
            });
        });
        return departments;
    }
};

export const getPageType = (window) => {
    const path = pathParts(window);
    if (path.includes('dp')) return 'product';
    if (path.includes('s')) return 'search';
    if (
        path.includes('b') ||
        (path.includes('gp') && path.includes('browse.html'))
    )
        return 'browse';
    if (path.includes('alm')) return 'amazon-store';
    if (path.includes('stores')) return 'storefront';
    return 'other';
};

export const getMarketplaceLocationData = (document, window) => {
    const pageType = getPageType(window);
    const breadcrumbs = getBreadcrumbs(document).map((crumb) => crumb.text);
    const storefrontBreadcrumbs = getBreadcrumbsStorefront(document).map(
        (crumb) => crumb.text
    );
    const departmentInfo = getDepartmentInfo(document).map((dept) => dept.text);
    const params = queryParams(window);
    const path = pathParts(window);
    const title = navTitle(document);

    let displayData = {};
    let navData = {};

    if (pageType === 'product') {
        displayData = {
            title,
            breadcrumbs,
        };
        const dpIndex = path.indexOf('dp');
        const productId =
            dpIndex !== -1 && dpIndex + 1 < path.length
                ? path[dpIndex + 1]
                : null;
        navData = { productId };
    } else if (pageType === 'search') {
        displayData = {
            title,
            departmentInfo,
        };
        const k = params['k'] || null;
        const rh = params['rh'] || null;
        const i = params['i'] || null;
        navData = { k, rh, i };
    } else if (pageType === 'browse') {
        displayData = {
            title,
            departmentInfo,
        };
        const node = params['node'] || null;
        navData = { node };
    } else if (pageType === 'storefront') {
        displayData = {
            title,
            storefrontBreadcrumbs,
        };
        const storesIndex = path.indexOf('stores');
        const pageIndex = path.indexOf('page');
        const storeNavPath =
            storesIndex !== -1 && pageIndex !== -1 && pageIndex > storesIndex
                ? path.slice(storesIndex, pageIndex + 2)
                : null;
        navData = { storeNavPath };
    }
    return { pageType, displayData, navData };
};

export const getCurrentCategory = (location) => {
    if (!location) return null;

    switch (location.pageType) {
        case 'browse':
            return (
                location.displayData?.title ||
                location.displayData?.departmentInfo?.[0] ||
                null
            );
        case 'search':
            return (
                location.displayData?.title ||
                location.displayData?.departmentInfo?.[0] ||
                null
            );
        case 'product':
            return location.displayData?.title || null;
        case 'storefront':
            return location.displayData?.storefrontBreadcrumbs?.[0] || null;
        default:
            return null;
    }
};

export const getUrlFromLocation = (location) => {
    if (!location) return null;
    switch (location.pageType) {
        case 'browse':
            return `https://www.amazon.fr/b?node=${location.navData.node}`;
        case 'product':
            return `https://www.amazon.fr/dp/${location.navData.productId}`;
        case 'storefront':
            const storePath = location.navData.storeNavPath;
            if (storePath && storePath.length > 0) {
                return `https://www.amazon.fr/${storePath.join('/')}`;
            }
            return null;
        case 'search':
            return `https://www.amazon.fr/s?k=${location.navData.k}&i=${location.navData.i}`;
        case 'other':
            return `https://www.amazon.fr/`;
        default:
            return null;
    }
};
