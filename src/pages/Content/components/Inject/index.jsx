import React from 'react';
import {
    Application,
    extend,
} from '@pixi/react';
import {
    Container,
    Graphics,
    Sprite,

} from 'pixi.js';
import { isProductPage, getBreadcrumbs, queryParams, pathParts, navTitle, getPageType, getBreadcrumbsStorefront } from '../../modules/breadcrumbs';
import { BunnySprite } from '../../modules/BunnySprite';
import "pixi.js/unsafe-eval"

extend({
    Container,
    Graphics,
    Sprite,
});


const Inject = () => {
    const productPage = isProductPage(window);
    const breadcrumbs = getBreadcrumbs(document);
    const storefrontBreadcrumbs = getBreadcrumbsStorefront(document);
    const params = queryParams(window);
    const path = pathParts(window);
    const title = navTitle(document);
    const pageType = getPageType(window);


    return (
        <div style={{ padding: '10px', fontFamily: 'Arial, sans-serif', position: 'fixed', top: '10px', right: '10px', backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '5px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', zIndex: 10000, maxWidth: '300px', maxHeight: '500px', overflow: 'auto' }}>
            <h2>Injected Component</h2>
            <div style={{ width: '200px', height: '200px', margin: '10px 0' }}>
                <Application width={200} height={200}>
                        <BunnySprite  />
                </Application>
            </div>
            <p><strong>Page Type:</strong> {pageType}</p>
            {productPage ? (
                <div>
                    <h3>Breadcrumbs:</h3>
                    <ul>
                        {breadcrumbs.map((crumb, index) => (
                            <li key={index}>
                                <a href={crumb.link} target="_blank" rel="noopener noreferrer">{crumb.text}</a>
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                <p>Not a product page.</p>
            )}
            {storefrontBreadcrumbs.length > 0 && (
                <div>
                    <h3>Storefront Breadcrumbs:</h3>
                    <ul>
                        {storefrontBreadcrumbs.map((crumb, index) => (
                            <li key={index}>
                                <a href={crumb.link} target="_blank" rel="noopener noreferrer">{crumb.text}</a>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            <h3>Query Parameters:</h3>
            <ul>
                {Object.entries(params).map(([key, value]) => (
                    <li key={key}><strong>{key}:</strong> {value}</li>
                ))}
            </ul>
            <h3>Path Parts:</h3>
            <ul>
                {path.map((part, index) => (
                    <li key={index}>{part}</li>
                ))}
            </ul>
            <h3>Navigation Title:</h3>
            <p>{title}</p>
        </div>
    );
};

export default Inject;
