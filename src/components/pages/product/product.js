// import { fetchModule } from 'vite';
import './product.scss'
import lightGallery from 'lightgallery';
import lgThumbnail from 'lightgallery/plugins/thumbnail/lg-thumbnail.min.js';

const KEY = '7EC452A9-0CFD441C-BD984C7C-17C8456E';
const urlParams = new URLSearchParams(window.location.search);
const productId = parseInt(urlParams.get('id'));

// Функція для отримання правильного шляху до зображення


// const getImagePath = (path) => {
//     return new URL(`../assets/img/itemsPageProduct/${path}`, import.meta.url).href;
// };


// const getImagePath = (path) => {
//     return new URL(
//         `../../../assets/img/itemsPageProduct/${path}`,
//         import.meta.url
//     ).href;
// };

const getImagePath = (path) => path;




// const getImagePath = (imageName) => { // працює але на гіті не грузить картинки
//     if (import.meta.env.PROD) {
//         // Production
//         return `/assets/img/itemsPageProduct/${imageName}`;
//     } else {
//         // Development
//         return new URL(`../../../assets/img/itemsPageProduct/${imageName}`, import.meta.url).href;
//     }
// };

// const getImagePath = (path) => {
//     return new URL(`../assets/img/${path}`, import.meta.url).href;
// };

async function loadProduct() {
    try {
        const response = await fetch('./files/products.json');

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const products = await response.json();
        const product = products.find(p => p.id === productId);

        if (!product) {
            window.location.href = 'index.html';
            return;
        }

        // Заголовок
        document.getElementById('productTitle').textContent = product.name;

        // Ціна
        document.getElementById('productPrice').innerHTML = `
            <data value="${product.price}">${product.price.toLocaleString('uk-UA')} грн</data>
        `;

        // Опис
        document.getElementById('productDescription').textContent = product.description;


        // Характеристики
        const featuresList = document.getElementById('characteristicFeatures');
        featuresList.innerHTML = product.features.map(feature => `
            <div>
                <dt>${feature.name}</dt>
                <dd>${feature.value}</dd>
            </div>
        `).join('');

        
        // Галерея
        const mainImage = document.getElementById('mainImage');
        const firstImagePath = getImagePath(product.image);//123123213
        console.log(firstImagePath);
        
        mainImage.src = firstImagePath;//qqqqqqq
        // mainImage.src = product.image;
        mainImage.alt = product.name;

        const thumbsContainer = document.getElementById('thumbs');

    //     thumbsContainer.innerHTML = product.gallery.map((imgPath, index) => {
    //         // imgPath вже містить повний шлях!
    //         return `
    //     <button 
    //         type="button"
    //         class="gallery__thumb ${index === 0 ? 'active' : ''}"
    //         data-index="${index}"
    //         data-src="${imgPath}"
    //         aria-label="Переглянути зображення ${index + 1}">
    //         <img src="${imgPath}" alt="${product.name}">
    //     </button>
    // `;
    //     }).join('');


        thumbsContainer.innerHTML = product.gallery.map((img, index) => {
            console.log(img);
            
            const src = getImagePath(img);
            console.log(src);
            
            return `
        <button 
            type="button"
            class="gallery__thumb ${index === 0 ? 'active' : ''}"
            data-index="${index}"
            data-src="${src}"
            aria-label="Переглянути зображення ${index + 1}">
            <img src="${src}" alt="${product.name}">

        </button>
    `;
        }).join('');



        function switchToThumb(index) {
            const thumbs = document.querySelectorAll('.gallery__thumb');
            if (thumbs[index]) {
                thumbs.forEach(t => t.classList.remove('active'));
                thumbs[index].classList.add('active');
                mainImage.src = thumbs[index].dataset.src;

                // Прокрутка до активної мініатюри
                thumbs[index].scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                    inline: 'center'
                });
            }
        }

        // Стрілки переключення
        const prevArrow = document.getElementById('prevArrow');
        const nextArrow = document.getElementById('nextArrow');

        if (prevArrow && nextArrow) {

            // Клік на стрілку "Попереднє"
            prevArrow.addEventListener('click', () => {
                const activeThumb = document.querySelector('.gallery__thumb.active');
                const currentIndex = parseInt(activeThumb.dataset.index);
                const newIndex = currentIndex > 0 ? currentIndex - 1 : product.gallery.length - 1;
                switchToThumb(newIndex);
            });

            // Клік на стрілку "Наступне"
            nextArrow.addEventListener('click', () => {
                const activeThumb = document.querySelector('.gallery__thumb.active');
                const currentIndex = parseInt(activeThumb.dataset.index);
                const newIndex = currentIndex < product.gallery.length - 1 ? currentIndex + 1 : 0;
                switchToThumb(newIndex);
            });

        }


        // Ініціалізація lightGallery 

        const galleryElement = document.querySelector('[data-fls-gallery]');
        let lgInstance;

        if (galleryElement) {
            if (lgInstance) lgInstance.destroy();

            lgInstance = lightGallery(galleryElement, {
                plugins: [lgThumbnail],
                licenseKey: KEY,
                speed: 500,
                thumbnail: true,
                animateThumb: true,
                download: false,
                dynamic: true,
                dynamicEl: product.gallery.map(img => {
                    const src = getImagePath(img);
                    // const src = img;

                    return {
                        src,
                        thumb: src,
                    };
                })
            });
        }



        document.querySelectorAll('.gallery__thumb').forEach((thumb) => {
            thumb.addEventListener('click', () => {
                const index = Number(thumb.dataset.index);
                switchToThumb(index);
            });
        });


        mainImage.addEventListener('click', () => {
            const activeThumb = document.querySelector('.gallery__thumb.active');
            const index = activeThumb ? Number(activeThumb.dataset.index) : 0;

            if (lgInstance) {
                lgInstance.openGallery(index);
            }
        });

    } catch (error) {
        console.error('Помилка завантаження товару:', error);
    }
}

loadProduct();